/**
 * MODULE CHI TIẾT TỪ VỰNG ĐA NGHĨA (js/word_detail_modal.js)
 * Kiến trúc 2 lớp:
 *  1. WordDetailService: Đọc Offline + Quét bài học + Gọi Gemini AI (JSON chuẩn) + Cache localStorage (sẵn sàng chuyển Database)
 *  2. WordDetailUI: Popup dùng chung cho cả Desktop (Modal) & Mobile (Bottom Sheet)
 */

(function (global) {
    const CACHE_KEY = 'va_word_detail_cache_v1';

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function normalizeWord(word) {
        return String(word || '').trim().toLowerCase();
    }

    // ==================== LỚP 1: DỊCH VỤ DỮ LIỆU (SẴN SÀNG CHUYỂN DATABASE) ====================
    const WordDetailService = {
        // Sau này lên Database (Supabase/Firebase), chỉ cần sửa đúng 2 hàm getCached & saveCache này
        async getCached(word) {
            const key = normalizeWord(word);
            if (!key) return null;
            try {
                const map = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                return map[key] || null;
            } catch (e) {
                return null;
            }
        },

        async saveCache(word, payload) {
            const key = normalizeWord(word);
            if (!key || !payload) return;
            try {
                const map = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                map[key] = { ...payload, cachedAt: new Date().toISOString() };
                localStorage.setItem(CACHE_KEY, JSON.stringify(map));
            } catch (e) {
                console.warn('[WordDetailService] Không thể lưu cache:', e);
            }
        },

        getOfflineEntry(word) {
            const key = normalizeWord(word);
            const dict = (typeof global.VA_DICTIONARY_CORE === 'object' && global.VA_DICTIONARY_CORE) ? global.VA_DICTIONARY_CORE : {};
            return dict[key] || null;
        },

        // Tự động quét tối đa 3 câu ví dụ có chứa từ này trong lộ trình bài học của người dùng
        findLessonExamples(word, limit = 3) {
            const key = normalizeWord(word);
            if (!key || key.length < 2) return [];
            const structs = (typeof SENTENCE_STRUCTURES !== 'undefined' && Array.isArray(SENTENCE_STRUCTURES))
                ? SENTENCE_STRUCTURES
                : (Array.isArray(global.SENTENCE_STRUCTURES) ? global.SENTENCE_STRUCTURES : []);

            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordRegex = new RegExp(`\\b${escaped}(s|es|ed|ing)?\\b`, 'i');
            const matches = [];

            for (const st of structs) {
                if (matches.length >= limit) break;
                const sits = Array.isArray(st.situations) ? st.situations : [];
                for (let idx = 0; idx < sits.length; idx++) {
                    if (matches.length >= limit) break;
                    const sit = sits[idx];
                    const en = String(sit.sampleCasual || '');
                    if (en && wordRegex.test(en)) {
                        matches.push({
                            structId: st.id,
                            structName: st.shortName || st.title,
                            sitIndex: idx,
                            en: en,
                            vi: sit.vi || ''
                        });
                    }
                }
            }
            return matches;
        },

        getGeminiApiKey() {
            const candidates = [
                localStorage.getItem('va_gemini_api_key'),
                localStorage.getItem('gemini_api_key'),
                localStorage.getItem('GEMINI_API_KEY'),
                global.GEMINI_API_KEY,
                (typeof state !== 'undefined' && state && state.apiKey) ? state.apiKey : ''
            ];
            return String(candidates.find(k => k && String(k).trim().length > 10) || '').trim();
        },

        // Gọi Gemini AI và ép trả về đúng Schema JSON chuẩn
        async fetchDeepDetailFromAI(word, offlineEntry) {
            const apiKey = this.getGeminiApiKey();
            if (!apiKey) {
                throw new Error('NO_API_KEY');
            }

            const savedModel = localStorage.getItem('va_gemini_model')
                || localStorage.getItem('gemini_model')
                || (document.getElementById('gemini-model-select') ? document.getElementById('gemini-model-select').value : '');

            const modelsToTry = Array.from(new Set([
                savedModel,
                global.GEMINI_MODEL,
                'gemini-flash-lite-latest',
                'gemini-flash-latest',
                'gemini-3.1-flash-lite',
                'gemini-3.5-flash'
            ].filter(Boolean)));

            const baseMeaning = offlineEntry ? `${offlineEntry.pos || ''} - ${offlineEntry.vi || ''}` : '';
            const prompt = `Bạn là từ điển Anh-Việt chuẩn sư phạm cho người Việt học trình độ A1-B1.
Hãy phân tích từ tiếng Anh: "${word}" ${baseMeaning ? `(nghĩa cơ bản: ${baseMeaning})` : ''}.
Trả về DUY NHẤT một JSON hợp lệ (không thêm markdown) theo đúng cấu trúc:
{
  "word": "${word}",
  "senses": [
    { "pos": "n/v/adj/adv...", "vi": "nghĩa tiếng Việt ngắn gọn", "enEx": "câu ví dụ tiếng Anh ngắn tự nhiên", "viEx": "dịch tiếng Việt" }
  ],
  "collocations": [
    { "en": "cụm từ hay đi kèm", "vi": "nghĩa tiếng Việt" }
  ],
  "synonyms": ["từ đồng nghĩa 1", "từ đồng nghĩa 2"],
  "antonyms": ["từ trái nghĩa 1"],
  "usage_note": "1-2 câu lưu ý ngắn gọn giúp người Việt tránh dùng sai từ này."
}
Yêu cầu: senses tối đa 4 nghĩa phổ biến nhất (ưu tiên đủ các từ loại chính nếu có); collocations tối đa 4 cụm thông dụng; synonyms/antonyms tối đa 3 từ.`;

            let res = null;
            let lastStatus = 0;
            for (const model of modelsToTry) {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
                res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            responseMimeType: 'application/json'
                        }
                    })
                });
                lastStatus = res.status;
                if (res.ok) break;
                if (res.status !== 404 && res.status !== 503 && res.status !== 429) break; // Nếu lỗi Key/Quota thì dừng luôn, chỉ thử tiếp khi 404
            }

            if (!res || !res.ok) {
                throw new Error(`API_ERROR_${lastStatus}`);
            }
            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanJson = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            const normalized = {
                word: parsed.word || word,
                senses: Array.isArray(parsed.senses) ? parsed.senses.slice(0, 4) : [],
                collocations: Array.isArray(parsed.collocations) ? parsed.collocations.slice(0, 4) : [],
                synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms.slice(0, 4) : [],
                antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms.slice(0, 3) : [],
                usage_note: String(parsed.usage_note || '').trim()
            };

            await this.saveCache(word, normalized);
            return normalized;
        }
    };

    // ==================== LỚP 2: GIAO DIỆN POPUP DÙNG CHUNG (DESKTOP + MOBILE) ====================
    function isWordSavedInBank(word) {
        try {
            const bank = JSON.parse(localStorage.getItem('va_vocab_bank') || '[]');
            const target = normalizeWord(word);
            return bank.some(v => normalizeWord(v.en) === target);
        } catch (e) {
            return false;
        }
    }

    function renderDeepAnalysisHTML(detail) {
        if (!detail) return '';

        const sensesHtml = (detail.senses || []).length > 0 ? `
            <div class="space-y-2">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <i class="fa-solid fa-layer-group"></i> Các nghĩa & Từ loại phổ biến
                </h4>
                <div class="space-y-2">
                    ${detail.senses.map(s => `
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                ${s.pos ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/70">${escHtml(s.pos)}</span>` : ''}
                                <span class="text-sm font-extrabold text-slate-900">${escHtml(s.vi)}</span>
                            </div>
                            ${s.enEx ? `
                                <div class="flex items-start justify-between gap-2 pt-0.5">
                                    <div class="text-xs leading-relaxed">
                                        <p class="font-semibold text-slate-700 italic">"${escHtml(s.enEx)}"</p>
                                        ${s.viEx ? `<p class="text-slate-500">${escHtml(s.viEx)}</p>` : ''}
                                    </div>
                                    <button type="button" onclick="if(typeof speakText==='function') speakText('${escHtml(s.enEx).replace(/'/g, "\\'")}', this, 0.9)"
                                        class="w-7 h-7 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-slate-200 flex items-center justify-center shrink-0 transition-all" title="Nghe câu ví dụ">
                                        <i class="fa-solid fa-volume-low text-[11px]"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const collocationsHtml = (detail.collocations || []).length > 0 ? `
            <div class="space-y-2">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <i class="fa-solid fa-link"></i> Cụm từ hay đi kèm
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${detail.collocations.map(c => `
                        <div class="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                                <div class="text-xs font-extrabold text-slate-900">${escHtml(c.en)}</div>
                                <div class="text-[11px] text-slate-600">${escHtml(c.vi)}</div>
                            </div>
                            <button type="button" onclick="if(typeof speakText==='function') speakText('${escHtml(c.en).replace(/'/g, "\\'")}', this, 0.9)"
                                class="w-7 h-7 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-slate-200 flex items-center justify-center shrink-0 transition-all">
                                <i class="fa-solid fa-volume-low text-[11px]"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const synAntHtml = ((detail.synonyms || []).length > 0 || (detail.antonyms || []).length > 0) ? `
            <div class="flex flex-wrap gap-4 pt-1">
                ${(detail.synonyms || []).length > 0 ? `
                    <div class="space-y-1.5">
                        <span class="text-[11px] font-extrabold text-slate-500 uppercase">Đồng nghĩa</span>
                        <div class="flex flex-wrap gap-1.5">
                            ${detail.synonyms.map(w => `
                                <button type="button" onclick="openWordDetailModal('${encodeURIComponent(w)}')"
                                    class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/70 transition-all">
                                    ${escHtml(w)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${(detail.antonyms || []).length > 0 ? `
                    <div class="space-y-1.5">
                        <span class="text-[11px] font-extrabold text-slate-500 uppercase">Trái nghĩa</span>
                        <div class="flex flex-wrap gap-1.5">
                            ${detail.antonyms.map(w => `
                                <button type="button" onclick="openWordDetailModal('${encodeURIComponent(w)}')"
                                    class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/70 transition-all">
                                    ${escHtml(w)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        ` : '';

        const noteHtml = detail.usage_note ? `
            <div class="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                <i class="fa-solid fa-lightbulb text-amber-500 mt-0.5 shrink-0"></i>
                <div><strong class="text-slate-900">Lưu ý dùng từ:</strong> ${escHtml(detail.usage_note)}</div>
            </div>
        ` : '';

        return `<div class="space-y-4">${sensesHtml}${collocationsHtml}${synAntHtml}${noteHtml}</div>`;
    }

    function closeWordDetailModal() {
        const existing = document.getElementById('va-word-detail-modal');
        if (existing) existing.remove();
        document.body.style.overflow = '';
    }

    async function triggerDeepWordAI(encodedWord) {
        const word = decodeURIComponent(encodedWord || '').trim();
        const container = document.getElementById('va-wd-ai-section');
        if (!word || !container) return;

        container.innerHTML = `
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <i class="fa-solid fa-spinner fa-spin text-indigo-600 text-lg"></i>
                <p class="text-xs font-bold text-slate-600">Gemini AI đang phân tích nhiều nghĩa & cụm từ cho "${escHtml(word)}"...</p>
            </div>
        `;

        try {
            const offlineEntry = WordDetailService.getOfflineEntry(word);
            const detail = await WordDetailService.fetchDeepDetailFromAI(word, offlineEntry);
            container.innerHTML = renderDeepAnalysisHTML(detail);
        } catch (err) {
            const isNoKey = err && err.message === 'NO_API_KEY';
            container.innerHTML = `
                <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2">
                    <p class="font-bold">
                        ${isNoKey
                            ? 'Chưa có Gemini API Key. Hãy bấm nút "Gemini AI" ở góc trên bên phải để nhập Key miễn phí nhé!'
                            : 'Không thể kết nối AI lúc này (kiểm tra mạng hoặc API Key).'}
                    </p>
                    <button type="button" onclick="triggerDeepWordAI('${encodeURIComponent(word)}')"
                        class="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition-all">
                        Thử lại
                    </button>
                </div>
            `;
        }
    }

    async function openWordDetailModal(rawWord) {
        const word = decodeURIComponent(String(rawWord || '')).trim();
        if (!word) return;

        closeWordDetailModal();

        const encoded = encodeURIComponent(word);
        const entry = WordDetailService.getOfflineEntry(word);
        const lessonMatches = WordDetailService.findLessonExamples(word, 3);
        const cachedAI = await WordDetailService.getCached(word);
        const isSaved = isWordSavedInBank(word);

        const saveBtnHtml = isSaved
            ? `<span class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1"><i class="fa-solid fa-check text-[10px]"></i>Đã lưu</span>`
            : `<button type="button" onclick="if(typeof saveDictSearchWord==='function'){saveDictSearchWord('${encoded}', this);}else if(typeof window.saveWordToVocabBank==='function'){window.saveWordToVocabBank('${escHtml(word).replace(/'/g, "\\'")}', '${escHtml(entry ? entry.vi : '').replace(/'/g, "\\'")}', this);}"
                class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 font-bold text-xs inline-flex items-center gap-1 transition-all">
                <i class="fa-solid fa-plus text-[10px]"></i>Lưu từ
               </button>`;

        const lessonHtml = lessonMatches.length > 0 ? `
            <div class="space-y-2">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <i class="fa-solid fa-graduation-cap text-indigo-500"></i> Xuất hiện trong bài học của bạn
                </h4>
                <div class="space-y-1.5">
                    ${lessonMatches.map(m => `
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                                <div class="text-[10px] font-bold text-indigo-600">${escHtml(m.structName)} • Câu ${m.sitIndex + 1}</div>
                                <div class="text-xs font-bold text-slate-800">"${escHtml(m.en)}"</div>
                                <div class="text-[11px] text-slate-500">${escHtml(m.vi)}</div>
                            </div>
                            <button type="button" onclick="closeWordDetailModal(); if(typeof jumpToSituation==='function') jumpToSituation('${m.structId}', ${m.sitIndex});"
                                class="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-slate-200 text-[11px] font-extrabold shrink-0 transition-all">
                                Mở câu
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const aiSectionHtml = cachedAI
            ? renderDeepAnalysisHTML(cachedAI)
            : `
                <button type="button" onclick="triggerDeepWordAI('${encoded}')"
                    class="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-sm flex items-center justify-center gap-2 transition-all">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Giải thích nhiều nghĩa & Cụm từ (AI)</span>
                </button>
            `;

        const modal = document.createElement('div');
        modal.id = 'va-word-detail-modal';
        modal.className = 'fixed inset-0 z-[9990] bg-slate-900/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeWordDetailModal();
        });

        modal.innerHTML = `
            <div class="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
                <!-- TẦNG 1: HEADER -->
                <div class="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
                    <div class="min-w-0 space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">${escHtml(word)}</h3>
                            ${entry && entry.pos ? `<span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">${escHtml(entry.pos)}</span>` : ''}
                            ${entry && entry.level ? `<span class="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(entry.level)}</span>` : ''}
                        </div>
                        ${entry && entry.ipa ? `<p class="font-mono text-xs text-indigo-600">${escHtml(entry.ipa)}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="if(typeof speakText==='function') speakText('${escHtml(word).replace(/'/g, "\\'")}', this, 0.9)"
                            class="w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe phát âm">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </button>
                        ${saveBtnHtml}
                        <button type="button" onclick="closeWordDetailModal()"
                            class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all" title="Đóng">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- NỘI DUNG CUỘN -->
                <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    <!-- Nghĩa cốt lõi Offline -->
                    ${entry ? `
                        <div class="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1.5">
                            <p class="text-sm sm:text-base font-extrabold text-emerald-700">${escHtml(entry.vi)}</p>
                            ${entry.example ? `<p class="text-xs text-slate-600 italic">"${escHtml(entry.example)}"</p>` : ''}
                        </div>
                    ` : ''}

                    <!-- TẦNG 2: PHÂN TÍCH CHUYÊN SÂU AI + CACHE -->
                    <div id="va-wd-ai-section">${aiSectionHtml}</div>

                    <!-- Xuất hiện trong bài học -->
                    ${lessonHtml}
                </div>

                <!-- TẦNG 3: CHÂN POPUP (TRA CỨU NGOÀI) -->
                <div class="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500 shrink-0">
                    <span>Tra cứu mở rộng:</span>
                    <div class="flex items-center gap-3">
                        <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encoded}" target="_blank" rel="noopener" class="text-indigo-600 hover:underline inline-flex items-center gap-1">
                            Oxford <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                        <a href="https://dictionary.cambridge.org/dictionary/english/${encoded}" target="_blank" rel="noopener" class="text-indigo-600 hover:underline inline-flex items-center gap-1">
                            Cambridge <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeWordDetailModal();
    });

    global.WordDetailService = WordDetailService;
    global.openWordDetailModal = openWordDetailModal;
    global.closeWordDetailModal = closeWordDetailModal;
    global.triggerDeepWordAI = triggerDeepWordAI;
})(window);
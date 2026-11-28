/**
 * MODULE: 100 NGÀY LÀM CHỦ 1000 TỪ CỐT LÕI (js/warmup_module.js)
 * - Trang riêng độc lập: #view-warmup (Menu: "1000 từ cốt lõi")
 * - Thanh lối tắt nhỏ gọn trên Trang chủ: #va-home-warmup-slot
 * - Tab Học tách rõ 2 nhóm: 10 từ vựng cốt lõi & 2 Phrasal Verbs
 * - Tab Nghe chép 12 câu/ngày (dùng MP3 sẵn có + evaluateDictationStrict)
 * - Tab Đặt câu tích hợp "AI Chấm câu" lưu vĩnh viễn vào localStorage + nút Áp dụng câu chuẩn & Sang từ tiếp theo
 * - Mô hình: Miễn phí 7 ngày đầu (84 mục) — Mở khóa trọn bộ 100 ngày (1000 từ + 200 Phrasal Verbs)
 */
(function (global) {
    const STORAGE_KEY = 'va_warmup_progress_v1';
    const FREE_DAYS_LIMIT = 7;
    const TOTAL_ROADMAP_DAYS = 100;

    let progress = {
        activeDay: 1,
        completedDays: [],        // [1, 2, ...]
        checkedItems: {},         // { "1": ["w:morning", "pv:pv_wake_up", ...] }
        customSentences: {},      // { "morning": "I drink tea every morning." }
        aiFeedbackMap: {},        // { "morning": { sentence, isCorrect, usedTargetWord, score, corrected, naturalSuggestion, explanationVi } }
        dictationDone: {}         // { "warmup_day_01_1": true, ... }
    };

    let pageState = {
        tab: 'learn',             // 'learn' | 'review' | 'dictation' | 'sentence'
        selectedSentenceTerm: '',
        openReviewDay: null,      // Accordion: mặc định mở ngày ôn gần nhất
        isGrading: false,
        dictationIndex: 0,
        dictationSpeed: 0.85,
        dictationInput: '',
        dictationResult: null,
        dictationRevealed: [],
        dictationShowPeek: false
    };

    function loadProgress() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (raw && typeof raw === 'object') {
                progress.activeDay = Number(raw.activeDay) || 1;
                progress.completedDays = Array.isArray(raw.completedDays) ? raw.completedDays : [];
                progress.checkedItems = (raw.checkedItems && typeof raw.checkedItems === 'object') ? raw.checkedItems : {};
                progress.customSentences = (raw.customSentences && typeof raw.customSentences === 'object') ? raw.customSentences : {};
                progress.aiFeedbackMap = (raw.aiFeedbackMap && typeof raw.aiFeedbackMap === 'object') ? raw.aiFeedbackMap : {};
                progress.dictationDone = (raw.dictationDone && typeof raw.dictationDone === 'object') ? raw.dictationDone : {};
            }
        } catch (e) {}
    }

    function resetDictationState(idx = 0) {
        pageState.dictationIndex = idx;
        pageState.dictationInput = '';
        pageState.dictationResult = null;
        pageState.dictationRevealed = [];
        pageState.dictationShowPeek = false;
    }

    function saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {}
    }

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function safeJsStr(s) {
        return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function getPacks() {
        return Array.isArray(global.VA_WARMUP_PACKS) ? global.VA_WARMUP_PACKS : [];
    }

    function getPackByDay(day) {
        const num = Number(day) || 1;
        if (global.VA_WARMUP_BY_DAY && global.VA_WARMUP_BY_DAY[num]) {
            return global.VA_WARMUP_BY_DAY[num];
        }
        return getPacks().find(p => p.day === num) || getPacks()[0] || null;
    }

    function resolvePhrasalVerbs(pvIds) {
        const all = Array.isArray(global.VA_PHRASAL_VERBS) ? global.VA_PHRASAL_VERBS : [];
        return (pvIds || []).map(id => all.find(pv => pv.id === id)).filter(Boolean);
    }

    function getDayItems(pack) {
        if (!pack) return [];
        const wordItems = (pack.words || []).map((w, idx) => ({
            key: `w:${w.term.toLowerCase()}`,
            audioId: `${pack.id}_${idx + 1}`,
            type: 'word',
            term: w.term,
            pos: w.pos || '',
            ipa: w.ipa || '',
            level: w.level || 'A1',
            vi: w.vi || '',
            example: w.example || '',
            exampleIpa: w.exampleIpa || '',
            exampleVi: w.exampleVi || '',
            note: ''
        }));

        const wordOffset = (pack.words || []).length;
        const pvItems = resolvePhrasalVerbs(pack.phrasalVerbIds).map((pv, idx) => ({
            key: `pv:${pv.id}`,
            audioId: `${pack.id}_${wordOffset + idx + 1}`,
            type: 'pv',
            id: pv.id,
            term: pv.term,
            pos: pv.pos || 'phr.v',
            ipa: pv.ipa || '',
            level: pv.level || 'A1',
            vi: pv.vi || '',
            example: pv.example || '',
            exampleIpa: pv.exampleIpa || '',
            exampleVi: pv.exampleVi || '',
            note: pv.note || ''
        }));

        return [...wordItems, ...pvItems];
    }

    function getCheckedSet(day) {
        const list = progress.checkedItems[String(day)];
        return new Set(Array.isArray(list) ? list : []);
    }

    function getTotalStats() {
        const packs = getPacks();
        let totalItems = 0;
        let checkedCount = 0;
        packs.forEach(p => {
            const items = getDayItems(p);
            const set = getCheckedSet(p.day);
            totalItems += items.length;
            checkedCount += items.filter(it => set.has(it.key)).length;
        });
        return {
            availableDays: packs.length,
            completedDaysCount: progress.completedDays.length,
            checkedCount,
            totalItems
        };
    }

    function toggleItemChecked(day, itemKey) {
        const num = Number(day);
        const dKey = String(num);
        const pack = getPackByDay(num);
        const items = getDayItems(pack);
        const set = getCheckedSet(num);

        if (set.has(itemKey)) set.delete(itemKey);
        else set.add(itemKey);

        progress.checkedItems[dKey] = Array.from(set);

        const doneCount = items.filter(it => set.has(it.key)).length;
        const wasDone = progress.completedDays.includes(num);

        if (items.length > 0 && doneCount === items.length) {
            if (!wasDone) {
                progress.completedDays.push(num);
                progress.completedDays.sort((a, b) => a - b);
                if (typeof global.showToast === 'function') {
                    global.showToast(`🎉 Tuyệt vời! Bạn đã thuộc đủ ${items.length}/${items.length} mục và hoàn thành Ngày ${num}!`, 'success');
                }
            }
        } else if (wasDone) {
            progress.completedDays = progress.completedDays.filter(d => d !== num);
        }

        saveProgress();
        renderAll();
    }

    function handleDayStatusClick(day) {
        const num = Number(day);
        const pack = getPackByDay(num);
        if (!pack) return;
        const items = getDayItems(pack);
        const checkedSet = getCheckedSet(num);
        const doneCount = items.filter(it => checkedSet.has(it.key)).length;

        if (doneCount < items.length) {
            if (pageState.tab !== 'learn') {
                pageState.tab = 'learn';
                renderWarmupPage();
            }
            if (typeof global.showToast === 'function') {
                global.showToast(`Hãy tích thuộc đủ ${items.length} mục bên dưới (hiện tại ${doneCount}/${items.length}) để tự động hoàn thành Ngày ${num}!`, 'info');
            }
            return;
        }

        const totalDays = getPacks().length;
        if (num < totalDays) {
            selectActiveDay(num + 1);
            if (typeof global.showToast === 'function') {
                global.showToast(`Chuyển sang Ngày ${num + 1}!`, 'success');
            }
        } else if (typeof global.showToast === 'function') {
            global.showToast(`🎉 Bạn đã hoàn thành trọn bộ ${totalDays} ngày miễn phí!`, 'success');
        }
    }

    function scrollDayPills(dir) {
        const el = document.getElementById('va-wu-day-pills');
        if (!el) return;
        el.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }

    function completeDay(day) {
        const num = Number(day);
        const pack = getPackByDay(num);
        if (!pack) return;

        const allKeys = getDayItems(pack).map(it => it.key);
        progress.checkedItems[String(num)] = allKeys;

        if (!progress.completedDays.includes(num)) {
            progress.completedDays.push(num);
            progress.completedDays.sort((a, b) => a - b);
        }

        const totalDays = getPacks().length;
        if (num < totalDays) {
            progress.activeDay = num + 1;
            const nextPack = getPackByDay(progress.activeDay);
            pageState.tab = 'learn';
            pageState.openReviewDay = null;
            resetDictationState(0);
            pageState.selectedSentenceTerm = (nextPack && nextPack.words && nextPack.words[0]) ? nextPack.words[0].term : '';
        }
        saveProgress();
        renderAll();

        if (typeof global.showToast === 'function') {
            global.showToast(`🎉 Tuyệt vời! Bạn đã hoàn thành Ngày ${num}!`, 'success');
        }
    }

    function selectActiveDay(day) {
        const num = Number(day) || 1;
        const pack = getPackByDay(num);
        if (!pack) return;
        progress.activeDay = num;
        pageState.openReviewDay = null;
        resetDictationState(0);
        pageState.selectedSentenceTerm = (pack.words && pack.words[0]) ? pack.words[0].term : '';
        saveProgress();
        renderAll();
    }

    function setPageTab(tab) {
        pageState.tab = tab;
        renderWarmupPage();
    }

    function toggleReviewAccordion(reviewDay) {
        const num = Number(reviewDay);
        pageState.openReviewDay = (pageState.openReviewDay === num) ? -1 : num;
        renderWarmupPage();
    }

    function selectSentenceTerm(term) {
        pageState.selectedSentenceTerm = term;
        renderWarmupPage();
    }

    function saveCustomSentence(term) {
        const input = document.getElementById('va-wu-sentence-input');
        if (!input) return;
        const val = input.value.trim();
        if (!val) {
            if (typeof global.showToast === 'function') global.showToast('Hãy gõ 1 câu tiếng Anh trước khi lưu nhé!', 'warning');
            input.focus();
            return;
        }
        progress.customSentences[term.toLowerCase()] = val;
        saveProgress();
        if (typeof global.showToast === 'function') global.showToast(`Đã lưu câu đặt với từ "${term}"!`, 'success');
        renderWarmupPage();
    }

    function applyCorrectedSentence(term) {
        const key = String(term || '').toLowerCase();
        const fb = progress.aiFeedbackMap[key];
        if (!fb || !fb.corrected) return;
        progress.customSentences[key] = fb.corrected;
        fb.sentence = fb.corrected;
        fb.isCorrect = true;
        saveProgress();
        if (typeof global.showToast === 'function') {
            global.showToast('Đã áp dụng và lưu câu chuẩn!', 'success');
        }
        renderWarmupPage();
    }

    function goToNextSentenceTerm(currentTerm) {
        const pack = getPackByDay(progress.activeDay);
        const items = getDayItems(pack);
        if (items.length === 0) return;
        const idx = items.findIndex(it => it.term.toLowerCase() === String(currentTerm || '').toLowerCase());
        const nextIdx = (idx >= 0 && idx + 1 < items.length) ? idx + 1 : 0;
        pageState.selectedSentenceTerm = items[nextIdx].term;
        renderWarmupPage();
        setTimeout(() => {
            const input = document.getElementById('va-wu-sentence-input');
            if (input) input.focus();
        }, 50);
    }

    // ==================== LOGIC TAB NGHE CHÉP (DICTATION) ====================
    function getDictationItems(pack) {
        return getDayItems(pack).filter(it => it && it.example);
    }

    function evaluateWarmupDictation(userText, targetSentence) {
        if (typeof global.evaluateDictationStrict === 'function') {
            return global.evaluateDictationStrict(userText, targetSentence);
        }
        const norm = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
        const targetTokens = String(targetSentence || '').trim().split(/\s+/).filter(Boolean).map(raw => ({ raw, norm: norm(raw) }));
        const userTokens = String(userText || '').trim().split(/\s+/).filter(Boolean).map(raw => ({ raw, norm: norm(raw) }));
        const matchedTargetIdx = new Set();
        targetTokens.forEach((t, i) => {
            if (userTokens[i] && userTokens[i].norm === t.norm) matchedTargetIdx.add(i);
        });
        const missingCount = targetTokens.length - matchedTargetIdx.size;
        const extraWrongCount = Math.max(0, userTokens.length - matchedTargetIdx.size);
        return {
            targetTokens,
            userTokens,
            matchedTargetIdx,
            extraWrongCount,
            missingCount,
            isPerfect: targetTokens.length > 0 && missingCount === 0 && extraWrongCount === 0
        };
    }

    function playWarmupDictationAudio(btnEl = null) {
        const pack = getPackByDay(progress.activeDay);
        const list = getDictationItems(pack);
        const item = list[pageState.dictationIndex];
        if (!item || typeof global.speakText !== 'function') return;
        global.speakText(item.example, btnEl, pageState.dictationSpeed, { audioId: item.audioId });
    }

    function selectDictationIndex(idx, autoPlay = true) {
        const pack = getPackByDay(progress.activeDay);
        const list = getDictationItems(pack);
        if (list.length === 0) return;
        const safeIdx = Math.max(0, Math.min(Number(idx) || 0, list.length - 1));
        resetDictationState(safeIdx);
        renderWarmupPage();
        setTimeout(() => {
            const input = document.getElementById('va-wu-dict-input');
            if (input) input.focus();
            if (autoPlay) playWarmupDictationAudio();
        }, 120);
    }

    function cycleWarmupDictationSpeed() {
        const speeds = [0.7, 0.85, 1.0];
        const idx = speeds.indexOf(pageState.dictationSpeed);
        pageState.dictationSpeed = speeds[(idx + 1) % speeds.length];
        renderWarmupPage();
        playWarmupDictationAudio();
    }

    function toggleWarmupDictationPeek() {
        const input = document.getElementById('va-wu-dict-input');
        if (input) pageState.dictationInput = input.value;
        pageState.dictationShowPeek = !pageState.dictationShowPeek;
        renderWarmupPage();
    }

    function checkWarmupDictation() {
        const pack = getPackByDay(progress.activeDay);
        const list = getDictationItems(pack);
        const item = list[pageState.dictationIndex];
        const input = document.getElementById('va-wu-dict-input');
        if (!item || !input) return;

        const userText = input.value.trim();
        pageState.dictationInput = input.value;
        if (!userText) {
            if (typeof global.showToast === 'function') global.showToast('Hãy nghe câu tiếng Anh và gõ lại trước khi kiểm tra nhé!', 'warning');
            input.focus();
            return;
        }

        const evalRes = evaluateWarmupDictation(userText, item.example);
        pageState.dictationResult = evalRes;

        if (evalRes.isPerfect) {
            progress.dictationDone[item.audioId] = true;
            pageState.dictationShowPeek = false;
            saveProgress();
        }
        renderWarmupPage();
    }

    function revealNextWarmupDictationHint() {
        const pack = getPackByDay(progress.activeDay);
        const list = getDictationItems(pack);
        const item = list[pageState.dictationIndex];
        const input = document.getElementById('va-wu-dict-input');
        if (!item) return;

        if (input) pageState.dictationInput = input.value;
        const evalRes = evaluateWarmupDictation(pageState.dictationInput, item.example);
        pageState.dictationResult = evalRes;

        let nextRevealIdx = -1;
        for (let i = 0; i < evalRes.targetTokens.length; i++) {
            if (!evalRes.matchedTargetIdx.has(i) && !pageState.dictationRevealed.includes(i)) {
                nextRevealIdx = i;
                break;
            }
        }

        if (nextRevealIdx !== -1) {
            pageState.dictationRevealed.push(nextRevealIdx);
            if (typeof global.speakText === 'function') {
                global.speakText(evalRes.targetTokens[nextRevealIdx].norm, null, 0.9, { forceTTS: true });
            }
            renderWarmupPage();
        } else if (typeof global.showToast === 'function') {
            global.showToast('Tất cả các từ đã được gợi ý — hãy gõ lại đầy đủ để hoàn thành câu nhé!', 'info');
        }
    }

    function handleWarmupDictationKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (pageState.dictationResult && pageState.dictationResult.isPerfect) {
                const pack = getPackByDay(progress.activeDay);
                const list = getDictationItems(pack);
                if (pageState.dictationIndex + 1 < list.length) {
                    selectDictationIndex(pageState.dictationIndex + 1, true);
                } else if (typeof global.showToast === 'function') {
                    global.showToast('🎉 Bạn đã hoàn thành câu cuối cùng của bài Nghe chép hôm nay!', 'success');
                }
            } else {
                checkWarmupDictation();
            }
        } else if (e.key === 'F1') {
            e.preventDefault();
            playWarmupDictationAudio();
        }
    }

    // ==================== ĐỌC CẤU HÌNH GEMINI AI SẴN CÓ & CHẤM CÂU ====================
    function getExistingGeminiConfig() {
        let apiKey = '';
        let model = 'gemini-2.5-flash';
        let enabled = true;

        // 1. Ưu tiên đọc từ biến toàn cục AI_CONFIG nếu app đang dùng
        if (global.AI_CONFIG && typeof global.AI_CONFIG === 'object') {
            if (global.AI_CONFIG.apiKey) apiKey = String(global.AI_CONFIG.apiKey).trim();
            if (global.AI_CONFIG.model) model = String(global.AI_CONFIG.model).trim();
            if (global.AI_CONFIG.enabled === false) enabled = false;
        }

        // 2. Dự phòng đọc từ các khóa localStorage phổ biến của ViệtAnh Master
        if (!apiKey) {
            const jsonKeys = ['va_ai_config', 'AI_CONFIG', 'va_gemini_config'];
            for (const k of jsonKeys) {
                try {
                    const obj = JSON.parse(localStorage.getItem(k) || 'null');
                    if (obj && typeof obj === 'object') {
                        if (obj.apiKey) apiKey = String(obj.apiKey).trim();
                        if (obj.model) model = String(obj.model).trim();
                        if (obj.enabled === false) enabled = false;
                        if (apiKey) break;
                    }
                } catch (e) {}
            }
        }

        if (!apiKey) {
            const strKeys = ['va_gemini_api_key', 'va_ai_api_key', 'gemini_api_key', 'GEMINI_API_KEY'];
            for (const k of strKeys) {
                const v = (localStorage.getItem(k) || '').trim();
                if (v) {
                    apiKey = v;
                    break;
                }
            }
        }

        const storedModel = (localStorage.getItem('va_gemini_model') || localStorage.getItem('va_ai_model') || '').trim();
        if (storedModel) model = storedModel;

        const storedEnabled = localStorage.getItem('va_ai_enabled');
        if (storedEnabled === '0' || storedEnabled === 'false') enabled = false;

        return { apiKey, model, enabled };
    }

    function openGeminiSettingsShortcut() {
        if (typeof global.openAiSettingsModal === 'function') {
            global.openAiSettingsModal();
            return;
        }
        const btn = document.querySelector('[onclick*="ai-settings"], [onclick*="AiSettings"], [onclick*="gemini"], #nav-ai-btn');
        if (btn) {
            btn.click();
            return;
        }
        if (typeof global.switchTab === 'function') {
            global.switchTab('profile');
        }
        if (typeof global.showToast === 'function') {
            global.showToast('Hãy mở mục "Gemini AI" ở góc trên bên phải để nhập API Key.', 'info');
        }
    }

    async function gradeSentenceWithAI(term) {
        if (pageState.isGrading) return;

        const input = document.getElementById('va-wu-sentence-input');
        const sentence = input ? input.value.trim() : (progress.customSentences[term.toLowerCase()] || '').trim();
        if (!sentence) {
            if (typeof global.showToast === 'function') global.showToast('Hãy gõ 1 câu tiếng Anh trước khi bấm AI Chấm câu nhé!', 'warning');
            if (input) input.focus();
            return;
        }

        // Tự lưu câu người dùng vừa gõ
        progress.customSentences[term.toLowerCase()] = sentence;
        saveProgress();

        const cfg = getExistingGeminiConfig();
        if (!cfg.enabled) {
            if (typeof global.showToast === 'function') global.showToast('Gemini AI đang tắt. Hãy bật lại trong Cài đặt Gemini AI.', 'warning');
            return;
        }
        if (!cfg.apiKey) {
            progress.aiFeedbackMap[term.toLowerCase()] = {
                sentence,
                needApiKey: true,
                error: 'Chưa tìm thấy Gemini API Key trong cài đặt của app.'
            };
            renderWarmupPage();
            return;
        }

        const pack = getPackByDay(progress.activeDay);
        const item = getDayItems(pack).find(it => it.term.toLowerCase() === term.toLowerCase());
        const meaningVi = item ? item.vi : '';

        pageState.isGrading = true;
        renderWarmupPage();

        const prompt = [
            'Bạn là giáo viên tiếng Anh thân thiện, dạy người Việt trình độ A1-A2.',
            `Học viên được yêu cầu tự đặt 1 câu tiếng Anh với từ/cụm mục tiêu: "${term}" (nghĩa: ${meaningVi}).`,
            `Câu học viên viết: "${sentence}"`,
            'Hãy chấm câu ngắn gọn và CHỈ trả về JSON hợp lệ (không thêm markdown ```json) theo đúng cấu trúc:',
            '{',
            '  "isCorrect": true/false,',
            '  "usedTargetWord": true/false,',
            '  "score": 0-10,',
            '  "corrected": "Câu tiếng Anh đã sửa chuẩn ngữ pháp (nếu đã đúng thì giữ nguyên)",',
            '  "naturalSuggestion": "1 cách nói ngắn gọn, tự nhiên hơn như người bản xứ",',
            '  "explanationVi": "Giải thích ngắn gọn 1-2 câu bằng tiếng Việt (khen điểm tốt và chỉ rõ lỗi nếu có)"',
            '}'
        ].join('\n');

        try {
            // Lưu ý khi lên Next.js: chỉ cần đổi fetch này sang POST /api/grade-sentence
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
            const res = await fetch(endpoint, {
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

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText.slice(0, 140)}`);
            }

            const data = await res.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleaned);

            progress.aiFeedbackMap[term.toLowerCase()] = {
                sentence,
                isCorrect: Boolean(parsed.isCorrect),
                usedTargetWord: parsed.usedTargetWord !== false,
                score: Number(parsed.score) || 0,
                corrected: String(parsed.corrected || sentence).trim(),
                naturalSuggestion: String(parsed.naturalSuggestion || '').trim(),
                explanationVi: String(parsed.explanationVi || '').trim(),
                error: ''
            };
            saveProgress();
        } catch (err) {
            progress.aiFeedbackMap[term.toLowerCase()] = {
                sentence,
                error: `Không thể chấm câu lúc này (${err.message || 'Lỗi kết nối Gemini API'}).`
            };
        } finally {
            pageState.isGrading = false;
            renderWarmupPage();
        }
    }

    function openWarmupPage(day = null) {
        if (day) selectActiveDay(day);
        if (typeof global.switchTab === 'function') {
            global.switchTab('warmup');
        } else {
            const view = document.getElementById('view-warmup');
            if (view) {
                view.classList.remove('hidden');
                view.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        renderWarmupPage();
    }

    function showProUnlockInfo() {
        if (typeof global.showToast === 'function') {
            global.showToast('🔒 Ngày 8–100 thuộc gói Mở khóa trọn bộ 100 ngày (1000 từ cốt lõi) — sẽ ra mắt khi nâng cấp bản Next.js!', 'info');
        }
    }

    // ==================== 1. THANH LỐI TẮT NHỎ GỌN TRÊN TRANG CHỦ ====================
    function renderHomeShortcut() {
        const slot = document.getElementById('va-home-warmup-slot');
        if (!slot) return;

        const packs = getPacks();
        if (packs.length === 0) {
            slot.innerHTML = '';
            return;
        }

        const currentPack = getPackByDay(progress.activeDay) || packs[0];
        const items = getDayItems(currentPack);
        const checkedSet = getCheckedSet(currentPack.day);
        const doneCount = items.filter(it => checkedSet.has(it.key)).length;
        const isDayDone = progress.completedDays.includes(currentPack.day);

        slot.innerHTML = `
            <div onclick="window.VA_WARMUP.openWarmupPage()"
                class="group cursor-pointer bg-white hover:bg-indigo-50/40 rounded-2xl border border-indigo-200/80 hover:border-indigo-300 px-4 py-3 shadow-2xs transition-all flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <i class="fa-solid fa-fire text-amber-300 text-base"></i>
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-extrabold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors truncate">1000 từ cốt lõi</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isDayDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}">
                                Ngày ${currentPack.day}/${packs.length} • ${isDayDone ? 'Đã xong' : `${doneCount}/${items.length} mục`}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 truncate mt-0.5">
                            ${esc(currentPack.title)} — Khởi động 10 phút/ngày (Miễn phí 7 ngày đầu)
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-extrabold transition-all">
                        <span>Học ngay</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </span>
                    <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-indigo-600 sm:hidden text-xs"></i>
                </div>
            </div>
        `;
    }

    // ==================== 2. TÍCH HỢP AUDIO DRILL (KHÔNG CHỒNG POPUP) ====================
    function startAudioDrillForDay(day) {
        const pack = getPackByDay(day);
        if (!pack) return;
        const items = getDayItems(pack);
        const drillList = items
            .filter(it => it.example)
            .map(it => ({
                id: it.audioId,
                vi: it.exampleVi,
                sampleCasual: it.example,
                ipa: it.exampleIpa || ''
            }));

        if (typeof global.openAudioDrillModal === 'function' && drillList.length > 0) {
            global.openAudioDrillModal({
                title: `Ngày ${pack.day}: ${pack.title}`,
                list: drillList,
                startIndex: 0
            });
        } else if (typeof global.showToast === 'function') {
            global.showToast('Không tìm thấy trình phát Audio Drill.', 'warning');
        }
    }

    // ==================== HELPER RENDER THẺ TỪ / PHRASAL VERB ====================
    function renderLearnCard(it, packDay, checkedSet) {
        const isChecked = checkedSet.has(it.key);
        const isPv = it.type === 'pv';
        const speakWord = safeJsStr(it.term);
        const speakEx = safeJsStr(it.example);
        const audioIdSafe = safeJsStr(it.audioId || '');
        const detailBtn = !isPv && typeof global.openWordDetailModal === 'function'
            ? `<button type="button" onclick="event.stopPropagation(); openWordDetailModal('${speakWord}')" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 text-[11px] font-bold transition-all cursor-pointer" title="Mở Từ điển 3K">Chi tiết</button>`
            : '';

        return `
            <div class="p-4 rounded-2xl border transition-all flex flex-col justify-between ${isChecked ? 'bg-emerald-50/60 border-emerald-200' : (isPv ? 'bg-indigo-50/50 border-indigo-200/80' : 'bg-white border-slate-200')}">
                <div class="flex items-start justify-between gap-2">
                    <div class="space-y-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-extrabold text-base ${isPv ? 'text-indigo-900' : 'text-slate-900'}">${esc(it.term)}</span>
                            ${it.pos ? `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">${esc(it.pos)}</span>` : ''}
                            ${it.ipa ? `<span class="font-mono text-xs text-indigo-600">${esc(it.ipa)}</span>` : ''}
                            ${isPv ? `<span class="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-extrabold">Phrasal Verb</span>` : ''}
                        </div>
                        <p class="text-xs sm:text-sm font-bold text-emerald-700">${esc(it.vi)}</p>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="event.stopPropagation(); if(typeof speakText==='function') speakText('${speakWord}', this, 0.9, { forceTTS: true })"
                            class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all cursor-pointer" title="Nghe từ">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </button>
                        ${detailBtn}
                        <button type="button" onclick="window.VA_WARMUP.toggleItemChecked(${packDay}, '${safeJsStr(it.key)}')"
                            class="w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'}"
                            title="${isChecked ? 'Bỏ đánh dấu' : 'Đánh dấu đã nhớ'}">
                            <i class="fa-solid fa-check text-xs"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-2.5 pt-2.5 border-t border-slate-200/70 flex items-start justify-between gap-2">
                    <div class="space-y-0.5 min-w-0">
                        <p class="text-xs sm:text-sm font-semibold text-slate-800">"${esc(it.example)}"</p>
                        ${it.exampleIpa ? `<p class="font-mono text-[11px] text-indigo-500/90 break-words">${esc(it.exampleIpa)}</p>` : ''}
                        <p class="text-xs text-slate-500">${esc(it.exampleVi)}</p>
                    </div>
                    <button type="button" onclick="event.stopPropagation(); if(typeof speakText==='function') speakText('${speakEx}', this, 0.85, { audioId: '${audioIdSafe}' })"
                        class="w-7 h-7 rounded-full bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 flex items-center justify-center shrink-0 transition-all cursor-pointer" title="Nghe câu ví dụ">
                        <i class="fa-solid fa-play text-[10px]"></i>
                    </button>
                </div>
                ${it.note ? `<p class="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1.5"><i class="fa-solid fa-lightbulb text-amber-500 mr-1"></i>${esc(it.note)}</p>` : ''}
            </div>
        `;
    }

    // ==================== 3. TRANG RIÊNG: 100 NGÀY LÀM CHỦ 1000 TỪ CỐT LÕI ====================
    function renderWarmupPage() {
        const container = document.getElementById('va-warmup-page-root');
        if (!container) return;

        const packs = getPacks();
        if (packs.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-3xl p-6 border border-slate-200 text-center text-sm text-slate-500">Chưa có dữ liệu 1000 từ cốt lõi.</div>`;
            return;
        }

        const pack = getPackByDay(progress.activeDay) || packs[0];
        const items = getDayItems(pack);
        const checkedSet = getCheckedSet(pack.day);
        const doneCount = items.filter(it => checkedSet.has(it.key)).length;
        const isDayDone = progress.completedDays.includes(pack.day);
        const reviewPacks = (pack.reviewDays || []).map(d => getPackByDay(d)).filter(Boolean);
        const stats = getTotalStats();

        const dayPillsHtml = packs.map(p => {
            const done = progress.completedDays.includes(p.day);
            const isCurrent = p.day === pack.day;
            let cls = 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200';
            if (isCurrent) {
                cls = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
            } else if (done) {
                cls = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
            }
            return `
                <button type="button" onclick="window.VA_WARMUP.selectActiveDay(${p.day})"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${cls}"
                    title="Ngày ${p.day}: ${esc(p.title)}">
                    ${done ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
                    <span>Ngày ${p.day}</span>
                </button>
            `;
        }).join('');

        const lockedPillHtml = `
            <button type="button" onclick="window.VA_WARMUP.showProUnlockInfo()"
                class="px-3 py-1.5 rounded-xl text-xs font-extrabold border border-dashed border-amber-300 bg-amber-50/80 text-amber-800 hover:bg-amber-100 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Mở khóa trọn bộ 100 ngày (Ngày 8 – 100)">
                <i class="fa-solid fa-lock text-[10px] text-amber-600"></i>
                <span>Ngày ${FREE_DAYS_LIMIT + 1}–${TOTAL_ROADMAP_DAYS} (Pro)</span>
            </button>
        `;

        const tabBtn = (id, icon, label) => {
            const active = pageState.tab === id;
            return `
                <button type="button" onclick="window.VA_WARMUP.setPageTab('${id}')"
                    class="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${active ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-indigo-700'}">
                    <i class="fa-solid ${icon}"></i>
                    <span>${label}</span>
                </button>
            `;
        };

        let bodyHtml = '';

        if (pageState.tab === 'learn') {
            const wordItems = items.filter(it => it.type !== 'pv');
            const pvItems = items.filter(it => it.type === 'pv');
            const wordDone = wordItems.filter(it => checkedSet.has(it.key)).length;
            const pvDone = pvItems.filter(it => checkedSet.has(it.key)).length;

            bodyHtml = `
                <div class="space-y-6">
                    <!-- Nhóm 1: 10 từ cốt lõi -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-2 px-1">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center">1</span>
                                <h4 class="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">${wordItems.length} từ vựng cốt lõi</h4>
                            </div>
                            <span class="text-xs font-bold text-slate-500">Đã thuộc ${wordDone}/${wordItems.length}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${wordItems.map(it => renderLearnCard(it, pack.day, checkedSet)).join('')}
                        </div>
                    </div>

                    <!-- Nhóm 2: 2 Phrasal Verbs -->
                    ${pvItems.length > 0 ? `
                        <div class="space-y-3 pt-2 border-t border-slate-200/80">
                            <div class="flex items-center justify-between gap-2 px-1">
                                <div class="flex items-center gap-2">
                                    <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">2</span>
                                    <h4 class="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-800">${pvItems.length} cụm động từ giao tiếp (Phrasal Verbs)</h4>
                                </div>
                                <span class="text-xs font-bold text-indigo-600">Đã thuộc ${pvDone}/${pvItems.length}</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${pvItems.map(it => renderLearnCard(it, pack.day, checkedSet)).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (pageState.tab === 'review') {
            if (reviewPacks.length === 0) {
                bodyHtml = `
                    <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                        <i class="fa-solid fa-seedling text-3xl text-emerald-500"></i>
                        <p class="font-extrabold text-slate-800 text-sm sm:text-base">Ngày 1 chưa có bài cũ cần ôn!</p>
                        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">Từ Ngày 2 trở đi, hệ thống sẽ tự động nhắc bạn ôn lại 10–20 từ của các ngày trước theo nhịp lặp lại ngắt quãng.</p>
                    </div>
                `;
            } else {
                const defaultOpenDay = reviewPacks[0] ? reviewPacks[0].day : null;
                const activeOpenDay = pageState.openReviewDay === null ? defaultOpenDay : pageState.openReviewDay;

                bodyHtml = `<div class="space-y-2.5">` + reviewPacks.map((rp, idx) => {
                    const rItems = getDayItems(rp);
                    const isOpen = activeOpenDay === rp.day;
                    const diffDays = pack.day - rp.day;
                    const badgeTime = diffDays === 1 ? 'Hôm qua' : `${diffDays} ngày trước`;

                    const chips = isOpen ? rItems.map(it => `
                        <button type="button" onclick="if(typeof speakText==='function') speakText('${safeJsStr(it.term)}', this, 0.9, { forceTTS: true })"
                            class="text-left p-3 rounded-xl bg-white hover:bg-indigo-50/70 border border-slate-200 transition-all space-y-0.5 cursor-pointer">
                            <div class="flex items-center justify-between gap-1">
                                <span class="font-extrabold text-xs sm:text-sm text-slate-900">${esc(it.term)}</span>
                                <i class="fa-solid fa-volume-high text-[10px] text-indigo-500"></i>
                            </div>
                            <p class="text-[11px] font-semibold text-slate-500">${esc(it.vi)}</p>
                        </button>
                    `).join('') : '';

                    return `
                        <div class="bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-indigo-200 shadow-2xs' : 'border-slate-200 hover:border-indigo-200'}">
                            <div onclick="window.VA_WARMUP.toggleReviewAccordion(${rp.day})"
                                class="px-4 py-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none ${isOpen ? 'bg-indigo-50/50 border-b border-indigo-100' : 'hover:bg-slate-50'}">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <span class="w-6 h-6 rounded-lg ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0 transition-all">
                                        <i class="fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-right'} text-[10px]"></i>
                                    </span>
                                    <div class="flex items-center gap-2 flex-wrap min-w-0">
                                        <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Ngày ${rp.day}: ${esc(rp.title)}</h4>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">${badgeTime}</span>
                                        <span class="text-[11px] font-semibold text-slate-400">${rItems.length} mục</span>
                                    </div>
                                </div>
                                <button type="button" onclick="event.stopPropagation(); window.VA_WARMUP.startAudioDrillForDay(${rp.day})"
                                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold transition-all cursor-pointer shrink-0">
                                    <i class="fa-solid fa-headphones text-[11px]"></i>
                                    <span>Nghe–Nói nhanh</span>
                                </button>
                            </div>
                            ${isOpen ? `<div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50/30">${chips}</div>` : ''}
                        </div>
                    `;
                }).join('') + `</div>`;
            }
        } else if (pageState.tab === 'dictation') {
            const dList = getDictationItems(pack);
            const curIdx = Math.max(0, Math.min(pageState.dictationIndex, Math.max(0, dList.length - 1)));
            const curItem = dList[curIdx];
            const dDoneCount = dList.filter(it => Boolean(progress.dictationDone[it.audioId])).length;
            const evalRes = pageState.dictationResult;
            const isPerfect = Boolean(evalRes && evalRes.isPerfect);

            const numPills = dList.map((it, idx) => {
                const done = Boolean(progress.dictationDone[it.audioId]);
                const isSel = idx === curIdx;
                let cls = 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300';
                if (isSel) cls = 'bg-indigo-600 text-white border-indigo-600 shadow-2xs';
                else if (done) cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                return `
                    <button type="button" onclick="window.VA_WARMUP.selectDictationIndex(${idx}, true)"
                        class="w-8 h-8 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center cursor-pointer ${cls}"
                        title="Câu ${idx + 1}: ${esc(it.term)}">
                        ${done && !isSel ? '<i class="fa-solid fa-check text-[10px]"></i>' : (idx + 1)}
                    </button>
                `;
            }).join('');

            let dictFeedbackHtml = '';
            if (evalRes && curItem) {
                if (evalRes.isPerfect) {
                    dictFeedbackHtml = `
                        <div class="rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-4 space-y-2">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-800">
                                    <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                                    Chính xác 100%!
                                </span>
                                ${curIdx + 1 < dList.length ? `
                                    <button type="button" onclick="window.VA_WARMUP.selectDictationIndex(${curIdx + 1}, true)"
                                        class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all cursor-pointer">
                                        Sang câu ${curIdx + 2} <i class="fa-solid fa-arrow-right ml-1"></i>
                                    </button>
                                ` : `<span class="text-xs font-extrabold text-emerald-700">🎉 Đã chép xong câu cuối!</span>`}
                            </div>
                            <p class="text-sm sm:text-base font-extrabold text-slate-900">${esc(curItem.example)}</p>
                            ${curItem.exampleIpa ? `<p class="font-mono text-xs text-indigo-600">${esc(curItem.exampleIpa)}</p>` : ''}
                            <p class="text-xs text-slate-600 italic">"${esc(curItem.exampleVi)}"</p>
                        </div>
                    `;
                } else {
                    const pillsHtml = evalRes.targetTokens.map((tok, idx) => {
                        if (evalRes.matchedTargetIdx.has(idx)) {
                            return `<span class="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs sm:text-sm">${esc(tok.raw)}</span>`;
                        }
                        if (pageState.dictationRevealed.includes(idx)) {
                            return `<span class="inline-block px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs sm:text-sm" title="Từ gợi ý">${esc(tok.raw)}</span>`;
                        }
                        return `<span class="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-mono font-extrabold text-xs tracking-widest">____</span>`;
                    }).join(' ');

                    const extraNote = evalRes.extraWrongCount > 0
                        ? ` • Có <strong>${evalRes.extraWrongCount}</strong> từ sai chính tả hoặc thừa.`
                        : '';

                    dictFeedbackHtml = `
                        <div class="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 space-y-2.5">
                            <p class="text-xs font-extrabold text-rose-700">
                                <i class="fa-solid fa-ear-listen mr-1"></i>Đúng ${evalRes.matchedTargetIdx.size}/${evalRes.targetTokens.length} từ — hãy nghe lại và sửa tiếp!
                            </p>
                            <div class="flex flex-wrap items-center gap-1.5">${pillsHtml}</div>
                            <p class="text-[11px] text-slate-500">Còn thiếu <strong>${evalRes.missingCount}</strong> từ${extraNote}</p>
                        </div>
                    `;
                }
            }

            bodyHtml = curItem ? `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-extrabold">Câu ${curIdx + 1} / ${dList.length}</span>
                            <span class="text-xs font-bold text-emerald-700">Đã chép chuẩn: ${dDoneCount}/${dList.length}</span>
                        </div>
                        <span class="text-[11px] text-slate-400">Phím tắt: <strong>F1</strong> nghe lại • <strong>Enter</strong> kiểm tra</span>
                    </div>

                    <div class="flex flex-wrap gap-1.5">${numPills}</div>

                    <!-- Thanh phát âm thanh MP3 -->
                    <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <button type="button" onclick="window.VA_WARMUP.playWarmupDictationAudio(this)"
                                class="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center text-lg transition-all cursor-pointer shrink-0" title="Nghe câu tiếng Anh (F1)">
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                            <div>
                                <p class="text-xs sm:text-sm font-extrabold text-indigo-950">Bấm loa để nghe & gõ lại chính xác câu tiếng Anh</p>
                                <p class="text-xs text-slate-600">Từ khóa: <strong class="text-indigo-700">${esc(curItem.term)}</strong> (${esc(curItem.vi)})</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button type="button" onclick="window.VA_WARMUP.cycleWarmupDictationSpeed()"
                                class="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all cursor-pointer">
                                Tốc độ: ${pageState.dictationSpeed}x
                            </button>
                            <button type="button" onclick="window.VA_WARMUP.toggleWarmupDictationPeek()"
                                class="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer">
                                <i class="fa-regular ${pageState.dictationShowPeek ? 'fa-eye-slash text-amber-600' : 'fa-eye text-slate-500'} mr-1"></i>${pageState.dictationShowPeek ? 'Ẩn đáp án' : 'Xem đáp án'}
                            </button>
                        </div>
                    </div>

                    ${pageState.dictationShowPeek ? `
                        <div class="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-0.5">
                            <p class="text-xs sm:text-sm font-extrabold text-slate-900">${esc(curItem.example)}</p>
                            ${curItem.exampleIpa ? `<p class="font-mono text-[11px] text-indigo-600">${esc(curItem.exampleIpa)}</p>` : ''}
                            <p class="text-xs text-slate-600">${esc(curItem.exampleVi)}</p>
                        </div>
                    ` : ''}

                    <textarea id="va-wu-dict-input" rows="2"
                        onkeydown="window.VA_WARMUP.handleWarmupDictationKeydown(event)"
                        class="w-full rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 text-sm font-semibold text-slate-800"
                        placeholder="Gõ lại chính xác câu tiếng Anh bạn vừa nghe...">${esc(pageState.dictationInput)}</textarea>

                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="window.VA_WARMUP.revealNextWarmupDictationHint()"
                                class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold transition-all cursor-pointer">
                                <i class="fa-solid fa-lightbulb mr-1"></i>Gợi ý 1 từ
                            </button>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="window.VA_WARMUP.checkWarmupDictation()"
                                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-all cursor-pointer">
                                <i class="fa-solid fa-check-double mr-1.5"></i>Kiểm tra
                            </button>
                            ${curIdx + 1 < dList.length ? `
                                <button type="button" onclick="window.VA_WARMUP.selectDictationIndex(${curIdx + 1}, true)"
                                    class="px-3.5 py-2 rounded-xl ${isPerfect ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'} text-xs sm:text-sm font-extrabold transition-all cursor-pointer">
                                    Câu tiếp <i class="fa-solid fa-arrow-right ml-1 text-xs"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    ${dictFeedbackHtml}
                </div>
            ` : `<div class="p-6 text-center text-sm text-slate-500">Chưa có câu ví dụ để nghe chép.</div>`;
        } else if (pageState.tab === 'sentence') {
            const activeTerm = pageState.selectedSentenceTerm || (items[0] ? items[0].term : '');
            const activeItem = items.find(it => it.term === activeTerm) || items[0];
            const savedVal = progress.customSentences[activeTerm.toLowerCase()] || '';
            const fb = progress.aiFeedbackMap[activeTerm.toLowerCase()] || null;

            const pills = items.map(it => {
                const hasSaved = Boolean(progress.customSentences[it.term.toLowerCase()]);
                const isSel = it.term === activeTerm;
                return `
                    <button type="button" onclick="window.VA_WARMUP.selectSentenceTerm('${safeJsStr(it.term)}')"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSel ? 'bg-indigo-600 text-white border-indigo-600' : (hasSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300')}">
                        ${hasSaved ? '<i class="fa-solid fa-check mr-1 text-[10px]"></i>' : ''}${esc(it.term)}
                    </button>
                `;
            }).join('');

            let feedbackHtml = '';
            if (fb) {
                if (fb.needApiKey) {
                    feedbackHtml = `
                        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                            <div class="space-y-0.5">
                                <p class="text-xs sm:text-sm font-extrabold text-amber-900">
                                    <i class="fa-solid fa-key text-amber-600 mr-1.5"></i>Chưa có Gemini API Key (Chế độ Test)
                                </p>
                                <p class="text-xs text-amber-800">Hãy nhập API Key trong mục <strong>Gemini AI</strong> ở góc trên bên phải để test tính năng chấm câu.</p>
                            </div>
                            <button type="button" onclick="window.VA_WARMUP.openGeminiSettingsShortcut()"
                                class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all cursor-pointer">
                                Mở cài đặt Gemini AI
                            </button>
                        </div>
                    `;
                } else if (fb.error) {
                    feedbackHtml = `
                        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 font-semibold">
                            <i class="fa-solid fa-triangle-exclamation text-rose-600 mr-1.5"></i>${esc(fb.error)}
                        </div>
                    `;
                } else {
                    const badgeCls = fb.isCorrect
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';
                    const badgeLabel = fb.isCorrect ? 'Chuẩn ngữ pháp' : 'Cần chỉnh nhẹ';
                    feedbackHtml = `
                        <div class="p-4 rounded-2xl border ${fb.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/50 border-amber-200'} space-y-3">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badgeCls}">
                                        <i class="fa-solid ${fb.isCorrect ? 'fa-circle-check' : 'fa-wand-magic-sparkles'} mr-1"></i>${badgeLabel}
                                    </span>
                                    ${!fb.usedTargetWord ? `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">Chưa dùng từ "${esc(activeTerm)}"</span>` : ''}
                                </div>
                                <span class="text-xs sm:text-sm font-extrabold text-indigo-700">Điểm: ${fb.score}/10</span>
                            </div>

                            <div class="space-y-2 text-xs sm:text-sm">
                                <div class="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                                    <div>
                                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Câu chuẩn gợi ý</span>
                                        <p class="font-extrabold text-slate-900">${esc(fb.corrected)}</p>
                                    </div>
                                    <button type="button" onclick="if(typeof speakText==='function') speakText('${safeJsStr(fb.corrected)}', this, 0.9, { forceTTS: true })"
                                        class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer" title="Nghe câu chuẩn">
                                        <i class="fa-solid fa-volume-high text-xs"></i>
                                    </button>
                                </div>

                                ${fb.naturalSuggestion ? `
                                    <div class="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-2">
                                        <div>
                                            <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block">Cách nói tự nhiên hơn</span>
                                            <p class="font-bold text-indigo-950">${esc(fb.naturalSuggestion)}</p>
                                        </div>
                                        <button type="button" onclick="if(typeof speakText==='function') speakText('${safeJsStr(fb.naturalSuggestion)}', this, 0.9, { forceTTS: true })"
                                            class="w-8 h-8 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200 flex items-center justify-center shrink-0 transition-all cursor-pointer" title="Nghe câu tự nhiên">
                                            <i class="fa-solid fa-volume-high text-xs"></i>
                                        </button>
                                    </div>
                                ` : ''}

                                ${fb.explanationVi ? `
                                    <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                        <i class="fa-solid fa-comment-dots text-indigo-500 mr-1.5"></i>${esc(fb.explanationVi)}
                                    </p>
                                ` : ''}
                            </div>

                            <!-- 2 nút hành động nhanh sau khi AI chấm -->
                            <div class="pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                                ${(!fb.isCorrect && fb.corrected && fb.corrected !== fb.sentence) ? `
                                    <button type="button" onclick="window.VA_WARMUP.applyCorrectedSentence('${safeJsStr(activeTerm)}')"
                                        class="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-extrabold transition-all cursor-pointer">
                                        <i class="fa-solid fa-check-to-slot mr-1.5"></i>Áp dụng câu chuẩn
                                    </button>
                                ` : `<span class="text-[11px] font-bold text-emerald-700"><i class="fa-solid fa-bookmark mr-1"></i>Đã lưu kết quả chấm vào máy</span>`}
                                ${(() => {
                                    const curIdx = items.findIndex(it => it.term === activeTerm);
                                    const nextItem = (curIdx >= 0 && curIdx + 1 < items.length) ? items[curIdx + 1] : null;
                                    return nextItem ? `
                                        <button type="button" onclick="window.VA_WARMUP.goToNextSentenceTerm('${safeJsStr(activeTerm)}')"
                                            class="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer">
                                            Sang từ "${esc(nextItem.term)}" <i class="fa-solid fa-arrow-right ml-1"></i>
                                        </button>
                                    ` : '';
                                })()}
                            </div>
                        </div>
                    `;
                }
            }

            bodyHtml = `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <p class="text-xs sm:text-sm font-bold text-slate-600">Chọn 1 từ bên dưới và tự đặt 1 câu tiếng Anh gắn với cuộc sống của chính bạn (Level 3):</p>
                    <div class="flex flex-wrap gap-1.5">${pills}</div>
                    ${activeItem ? `
                        <div class="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                            <div class="flex items-center justify-between">
                                <span class="font-extrabold text-sm sm:text-base text-indigo-900">${esc(activeItem.term)} — ${esc(activeItem.vi)}</span>
                                <span class="font-mono text-xs text-indigo-600">${esc(activeItem.ipa)}</span>
                            </div>
                            <p class="text-xs sm:text-sm text-slate-600 italic">Gợi ý mẫu: "${esc(activeItem.example)}"</p>
                        </div>
                        <textarea id="va-wu-sentence-input" rows="3"
                            class="w-full rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 text-sm text-slate-800"
                            placeholder="Thử đặt 1 câu với '${esc(activeItem.term)}' bằng tiếng Anh...">${esc(savedVal)}</textarea>
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="text-xs text-slate-400">Câu tự lưu trên máy • AI Chấm câu dùng cài đặt Gemini AI sẵn có.</span>
                            <div class="flex flex-wrap items-center gap-2">
                                <button type="button" onclick="window.VA_WARMUP.saveCustomSentence('${safeJsStr(activeItem.term)}')"
                                    class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold border border-slate-200 transition-all cursor-pointer">
                                    <i class="fa-solid fa-floppy-disk mr-1.5"></i>Lưu câu của tôi
                                </button>
                                <button type="button" onclick="window.VA_WARMUP.gradeSentenceWithAI('${safeJsStr(activeItem.term)}')"
                                    ${pageState.isGrading ? 'disabled' : ''}
                                    class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer">
                                    ${pageState.isGrading
                                        ? '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Đang chấm câu...'
                                        : '<i class="fa-solid fa-wand-magic-sparkles mr-1.5"></i>AI Chấm câu'}
                                </button>
                            </div>
                        </div>
                        ${feedbackHtml}
                    ` : ''}
                </div>
            `;
        }

        container.innerHTML = `
            <!-- Header Trang: 100 ngày làm chủ 1000 từ cốt lõi -->
            <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-800 rounded-3xl p-5 sm:p-6 text-white shadow-md space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] font-extrabold uppercase tracking-wider">
                                Miễn phí 7 ngày đầu
                            </span>
                            <span class="text-xs font-bold text-indigo-200">10 phút mỗi ngày • 10 từ + 2 Phrasal Verbs</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">100 ngày làm chủ 1000 từ cốt lõi</h2>
                    </div>
                    <div class="bg-white/15 backdrop-blur-xs rounded-2xl px-3.5 py-2 text-right shrink-0">
                        <p class="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">Tiến độ của bạn</p>
                        <p class="text-sm sm:text-base font-extrabold text-white">${stats.completedDaysCount}/${stats.availableDays} ngày • ${stats.checkedCount}/${stats.totalItems} mục</p>
                    </div>
                </div>

                <!-- Dải chọn ngày có gợi ý vuốt ngang rõ ràng -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2 text-[11px] font-bold text-indigo-200">
                        <span class="flex items-center gap-1.5">
                            <i class="fa-solid fa-calendar-days text-amber-300"></i>
                            <span>Chọn ngày học</span>
                        </span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] text-indigo-200/90">Vuốt ngang để xem thêm</span>
                            <button type="button" onclick="window.VA_WARMUP.scrollDayPills(-1)"
                                class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer" title="Cuộn sang trái">
                                <i class="fa-solid fa-chevron-left text-[10px]"></i>
                            </button>
                            <button type="button" onclick="window.VA_WARMUP.scrollDayPills(1)"
                                class="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer" title="Cuộn sang phải">
                                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                    <div class="relative">
                        <div id="va-wu-day-pills" class="va-wu-days-scroll flex items-center gap-1.5 overflow-x-auto pb-2 pr-8 scroll-smooth">
                            ${dayPillsHtml}
                            ${lockedPillHtml}
                        </div>
                        <div class="pointer-events-none absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-blue-800 to-transparent rounded-r-xl"></div>
                    </div>
                </div>
            </div>

            <!-- Khối nội dung Ngày đang chọn -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                    <div>
                        <span class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">Ngày ${pack.day} / ${TOTAL_ROADMAP_DAYS}</span>
                        <h3 class="text-base sm:text-lg font-extrabold text-slate-900">${esc(pack.title)}</h3>
                        <p class="text-xs text-slate-500">${esc(pack.subtitle)}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button type="button" onclick="window.VA_WARMUP.startAudioDrillForDay(${pack.day})"
                            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-extrabold border border-indigo-200 transition-all cursor-pointer">
                            <i class="fa-solid fa-headphones"></i>
                            <span>Nghe–Nói 12 câu</span>
                        </button>
                        ${isDayDone ? `
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-extrabold">
                                <i class="fa-solid fa-circle-check text-emerald-600"></i>
                                <span>Đã xong Ngày ${pack.day}</span>
                            </span>
                            ${pack.day < packs.length ? `
                                <button type="button" onclick="window.VA_WARMUP.handleDayStatusClick(${pack.day})"
                                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer">
                                    <span>Sang Ngày ${pack.day + 1}</span>
                                    <i class="fa-solid fa-arrow-right text-xs"></i>
                                </button>
                            ` : ''}
                        ` : `
                            <button type="button" onclick="window.VA_WARMUP.handleDayStatusClick(${pack.day})"
                                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                                title="Tích thuộc đủ ${items.length} mục bên dưới để tự động hoàn thành">
                                <i class="fa-regular fa-circle-check text-slate-400"></i>
                                <span>Tiến độ: ${doneCount}/${items.length}</span>
                            </button>
                        `}
                    </div>
                </div>

                <!-- Thanh 4 Tab -->
                <div class="px-4 sm:px-5 pt-3.5 pb-2 bg-slate-50/40">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-200/75 p-1 rounded-2xl max-w-2xl">
                        ${tabBtn('learn', 'fa-book-open', `Học (${doneCount}/${items.length})`)}
                        ${tabBtn('review', 'fa-rotate-left', `Ôn cũ (${reviewPacks.length})`)}
                        ${tabBtn('dictation', 'fa-keyboard', `Nghe chép`)}
                        ${tabBtn('sentence', 'fa-pen-nib', 'Đặt câu')}
                    </div>
                </div>

                <!-- Nội dung Tab -->
                <div class="p-4 sm:p-5 bg-slate-50/40">
                    ${bodyHtml}
                </div>
            </div>

            <!-- Banner định hướng mở khóa 100 ngày (chuẩn bị cho bản Next.js) -->
            <div class="bg-gradient-to-r from-amber-50 via-white to-indigo-50 rounded-2xl border border-amber-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="font-extrabold text-sm text-slate-900">Mở khóa trọn bộ 100 ngày (1000 từ cốt lõi + 200 Phrasal Verbs)</p>
                        <p class="text-xs text-slate-600">Bạn đang trải nghiệm miễn phí 7 ngày đầu (84 mục). Trọn bộ Ngày 8–100 kèm MP3 thu âm sẵn & AI Chấm câu tích hợp sẽ mở khóa trong phiên bản nâng cấp sắp tới.</p>
                    </div>
                </div>
                <button type="button" onclick="window.VA_WARMUP.showProUnlockInfo()"
                    class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-xs transition-all shrink-0 cursor-pointer">
                    Xem lộ trình 100 ngày
                </button>
            </div>
        `;
    }

    function renderAll() {
        loadProgress();
        renderHomeShortcut();
        renderWarmupPage();
    }

    function injectWarmupStyles() {
        if (document.getElementById('va-warmup-inline-style')) return;
        const st = document.createElement('style');
        st.id = 'va-warmup-inline-style';
        st.textContent = `
            .va-wu-days-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.45) rgba(255,255,255,0.12);
            }
            .va-wu-days-scroll::-webkit-scrollbar {
                height: 6px;
            }
            .va-wu-days-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.12);
                border-radius: 999px;
            }
            .va-wu-days-scroll::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.48);
                border-radius: 999px;
            }
        `;
        document.head.appendChild(st);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectWarmupStyles();
        loadProgress();
        renderAll();
    });

    global.VA_WARMUP = {
        renderAll,
        renderHomeShortcut,
        renderWarmupPage,
        openWarmupPage,
        selectActiveDay,
        setPageTab,
        toggleReviewAccordion,
        toggleItemChecked,
        handleDayStatusClick,
        scrollDayPills,
        completeDay,
        startAudioDrillForDay,
        selectSentenceTerm,
        saveCustomSentence,
        applyCorrectedSentence,
        goToNextSentenceTerm,
        gradeSentenceWithAI,
        playWarmupDictationAudio,
        selectDictationIndex,
        cycleWarmupDictationSpeed,
        toggleWarmupDictationPeek,
        checkWarmupDictation,
        revealNextWarmupDictationHint,
        handleWarmupDictationKeydown,
        openGeminiSettingsShortcut,
        showProUnlockInfo
    };
})(window);

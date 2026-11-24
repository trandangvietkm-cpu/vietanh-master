/**
 * ViệtAnh Master — Quick Tools Module
 * - Mục 2: Nút "Tra nhanh" (Mini-Lookup 2 chiều Anh-Việt / Việt-Anh) ngay cạnh ô nhập bài dịch + phím tắt Alt + K
 * - Mục 3: Popover tra nghĩa 1 chạm (hiện thẻ nổi nhỏ gọn kèm IPA, Loa, ví dụ song ngữ, nút + Lưu nhanh)
 */
(function () {
    if (window.__VA_QUICK_TOOLS_LOADED__) return;
    window.__VA_QUICK_TOOLS_LOADED__ = true;

    // ==================== TIỆN ÍCH CHUNG ====================
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeWord(w) {
        return String(w || '')
            .trim()
            .toLowerCase()
            .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
    }

    function getDictCore() {
        return window.VA_DICTIONARY_CORE || {};
    }

    function lookupExactWord(rawWord) {
        const dict = getDictCore();
        const clean = normalizeWord(rawWord);
        if (!clean) return null;

        if (dict[clean]) return { word: clean, ...dict[clean] };

        // Thử bỏ hậu tố đơn giản (s, es, ed, ing) để bắt từ gốc
        const candidates = [];
        if (clean.endsWith('ies') && clean.length > 4) candidates.push(clean.slice(0, -3) + 'y');
        if (clean.endsWith('es') && clean.length > 3) candidates.push(clean.slice(0, -2));
        if (clean.endsWith('s') && clean.length > 2) candidates.push(clean.slice(0, -1));
        if (clean.endsWith('ied') && clean.length > 4) candidates.push(clean.slice(0, -3) + 'y');
        if (clean.endsWith('ed') && clean.length > 3) {
            candidates.push(clean.slice(0, -2));
            candidates.push(clean.slice(0, -1));
        }
        if (clean.endsWith('ing') && clean.length > 4) {
            candidates.push(clean.slice(0, -3));
            candidates.push(clean.slice(0, -3) + 'e');
        }

        for (const c of candidates) {
            if (dict[c]) return { word: c, ...dict[c] };
        }
        return null;
    }

    function searchDictTwoWay(query, limit = 8) {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return [];
        const dict = getDictCore();
        const exact = [];
        const starts = [];
        const includes = [];

        for (const [word, info] of Object.entries(dict)) {
            if (!info || typeof info !== 'object') continue;
            const wLower = word.toLowerCase();
            const viLower = String(info.vi || '').toLowerCase();

            if (wLower === q || viLower === q) {
                exact.push({ word, ...info });
            } else if (wLower.startsWith(q) || viLower.startsWith(q)) {
                starts.push({ word, ...info });
            } else if (wLower.includes(q) || viLower.includes(q)) {
                includes.push({ word, ...info });
            }
        }
        return [...exact, ...starts, ...includes].slice(0, limit);
    }

    function speakWord(word) {
        if (!word) return;
        if (typeof window.speakVocabLibWord === 'function') {
            window.speakVocabLibWord(encodeURIComponent(word));
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(word);
            utter.lang = 'en-US';
            utter.rate = 0.92;
            window.speechSynthesis.speak(utter);
        }
    }

    function isWordSaved(word) {
        const clean = normalizeWord(word);
        if (!clean) return false;
        try {
            const list = JSON.parse(localStorage.getItem('va_vocab_bank') || '[]');
            return list.some(item => normalizeWord(item.en || item.word) === clean);
        } catch (e) {
            return false;
        }
    }

    function quickSaveWord(word, btnEl) {
        if (typeof window.saveVocabLibWord === 'function') {
            window.saveVocabLibWord(encodeURIComponent(word), btnEl);
            return;
        }
        const entry = lookupExactWord(word);
        if (!entry) return;
        try {
            const key = 'va_vocab_bank';
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            if (!list.some(i => normalizeWord(i.en || i.word) === normalizeWord(entry.word))) {
                list.unshift({
                    id: 'voc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    en: entry.word,
                    vi: entry.vi || '',
                    ipa: entry.ipa || '',
                    pos: entry.pos || '',
                    level: entry.level || 'A1',
                    emoji: '📖',
                    imageUrl: '',
                    topic: 'Tra nhanh',
                    exampleEn: entry.example || '',
                    exampleVi: entry.exampleVi || '',
                    mastered: false,
                    foreverMastered: false,
                    reviewStage: 0,
                    nextReviewDue: null,
                    addedAt: new Date().toISOString()
                });
                localStorage.setItem(key, JSON.stringify(list));
                if (typeof window.updateNotebookBadge === 'function') window.updateNotebookBadge();
            }
            if (btnEl) {
                btnEl.outerHTML = `<span class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1"><i class="fa-solid fa-check text-[9px]"></i>Đã lưu</span>`;
            }
        } catch (e) {}
    }
    // ==================== MỤC 2: NÚT "TRA NHANH" CẠNH Ô NHẬP DỊCH ====================
    function getTranslationInput() {
        return document.getElementById('user-translation');
    }

    function insertWordIntoInput(word) {
        const input = getTranslationInput();
        if (!input) return;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        const before = input.value.slice(0, start);
        const after = input.value.slice(end);
        const needSpaceBefore = before.length > 0 && !/\s$/.test(before);
        const inserted = (needSpaceBefore ? ' ' : '') + word + ' ';
        input.value = before + inserted + after;
        input.focus();
        const newPos = before.length + inserted.length;
        input.setSelectionRange(newPos, newPos);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        closeMiniLookup();
    }

    function createMiniLookupModal() {
        if (document.getElementById('va-mini-lookup-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'va-mini-lookup-modal';
        modal.className = 'fixed inset-0 z-[9990] hidden items-start justify-center bg-slate-900/35 backdrop-blur-[1px] pt-16 sm:pt-24 px-3';
        modal.innerHTML = `
            <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                <div class="p-3.5 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/70">
                    <i class="fa-solid fa-magnifying-glass text-indigo-500 text-sm"></i>
                    <input id="va-mini-lookup-input" type="text" autocomplete="off"
                        placeholder="Gõ tiếng Việt (vd: cơ hội) hoặc tiếng Anh (vd: earth)..."
                        class="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none" />
                    <button type="button" onclick="window.closeMiniLookup()"
                        class="w-7 h-7 rounded-lg hover:bg-slate-200/70 text-slate-500 flex items-center justify-center transition-all" title="Đóng (Esc)">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
                <div id="va-mini-lookup-results" class="max-h-80 overflow-y-auto p-2.5 space-y-2">
                    <p class="text-xs text-slate-400 text-center py-6">
                        Tra nhanh 2 chiều offline (3.293 từ) — bấm <b>Chèn</b> để điền thẳng vào ô dịch.
                    </p>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeMiniLookup();
        });
        document.body.appendChild(modal);

        const inputEl = document.getElementById('va-mini-lookup-input');
        inputEl.addEventListener('input', (e) => renderMiniLookupResults(e.target.value));
    }
    function canInsertIntoTranslationInput() {
        const input = getTranslationInput();
        if (!input) return false;
        const card = document.getElementById('shared-exercise-card');
        return Boolean(card && !card.classList.contains('hidden'));
    }

    function renderMiniLookupResults(query) {
        const box = document.getElementById('va-mini-lookup-results');
        if (!box) return;
        const q = String(query || '').trim();
        if (!q) {
            box.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Tra nhanh 2 chiều offline (3.293 từ) — bấm <b>Chèn</b> để điền thẳng vào ô dịch.</p>`;
            return;
        }
        const results = searchDictTwoWay(q, 8);
        if (results.length === 0) {
            box.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Không tìm thấy "<b>${escHtml(q)}</b>" trong kho 3.293 từ.</p>`;
            return;
        }

        box.innerHTML = results.map(item => {
            const encoded = encodeURIComponent(item.word);
            const saved = isWordSaved(item.word);
            return `
                <div class="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/70 transition-all space-y-1.5">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="font-extrabold text-sm text-indigo-950">${escHtml(item.word)}</span>
                                ${item.pos ? `<span class="text-[10px] font-bold text-slate-400">(${escHtml(item.pos)})</span>` : ''}
                                ${item.level ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(item.level)}</span>` : ''}
                                ${item.ipa ? `<span class="font-mono text-[11px] text-indigo-500">${escHtml(item.ipa)}</span>` : ''}
                            </div>
                            <p class="text-xs font-semibold text-emerald-700 mt-0.5">${escHtml(item.vi)}</p>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                            <button type="button" onclick="window.__vaQuickSpeak('${encoded}')"
                                class="w-7 h-7 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all" title="Nghe">
                                <i class="fa-solid fa-volume-high text-[10px]"></i>
                            </button>
                            <button type="button" onclick="window.__vaQuickDetail('${encoded}')"
                                class="w-7 h-7 rounded-full bg-white hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all" title="Xem nhiều nghĩa & cụm từ">
                                <i class="fa-solid fa-circle-info text-[11px]"></i>
                            </button>
                            ${canInsertIntoTranslationInput()
                                ? `<button type="button" onclick="window.__vaQuickInsert('${encoded}')"
                                    class="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all" title="Chèn vào ô dịch">
                                    Chèn
                                </button>`
                                : ''
                            }

                            ${saved
                                ? `<span class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]"><i class="fa-solid fa-check text-[9px]"></i></span>`
                                : `<button type="button" onclick="window.__vaQuickSave('${encoded}', this)" class="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-200 font-bold text-[11px] transition-all">+ Lưu</button>`
                            }
                        </div>
                    </div>
                    ${item.example ? `
                        <div class="text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 leading-relaxed">
                            <p class="text-slate-700 italic">"${escHtml(item.example)}"</p>
                            ${item.exampleVi ? `<p class="text-slate-500 mt-0.5">${escHtml(item.exampleVi)}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    window.openMiniLookup = function (prefill = '') {
        createMiniLookupModal();
        const modal = document.getElementById('va-mini-lookup-modal');
        const inputEl = document.getElementById('va-mini-lookup-input');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        if (prefill) {
            inputEl.value = prefill;
            renderMiniLookupResults(prefill);
        } else {
            inputEl.select();
        }
        setTimeout(() => inputEl.focus(), 30);
    };

    window.closeMiniLookup = function () {
        const modal = document.getElementById('va-mini-lookup-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    function injectMiniLookupButton() {
        const input = getTranslationInput();
        if (!input || document.getElementById('va-mini-lookup-trigger')) return;

        const parent = input.parentElement;
        if (!parent) return;

        const btn = document.createElement('button');
        btn.id = 'va-mini-lookup-trigger';
        btn.type = 'button';
        btn.onclick = () => window.openMiniLookup();
        btn.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 text-xs font-bold transition-all';
        btn.innerHTML = `<i class="fa-solid fa-magnifying-glass text-[10px]"></i><span>Tra nhanh từ</span><kbd class="hidden sm:inline-block ml-1 px-1 py-0.2 text-[10px] rounded bg-white/80 text-indigo-600 border border-indigo-200">Alt+K</kbd>`;

        // Tìm thẻ label "Câu dịch tiếng Anh của bạn:" và thay thế trực tiếp bằng nút Tra nhanh
        const labelEl = Array.from(parent.querySelectorAll('label, span, p')).find(el =>
            (el.textContent || '').includes('Câu dịch tiếng Anh của bạn')
        );
        if (labelEl) {
            labelEl.replaceWith(btn);
        } else {
            btn.classList.add('mb-2');
            parent.insertBefore(btn, input);
        }
    }

    // ==================== MỤC 3: POPOVER TRA NGHĨA 1 CHẠM ====================
    function closeWordPopover() {
        const old = document.getElementById('va-word-popover');
        if (old) old.remove();
    }

    window.showWordPopover = function (rawWord, anchorEl, fallbackOpenFormFn) {
        closeWordPopover();
        const clean = normalizeWord(rawWord);
        if (!clean) return;

        const entry = lookupExactWord(clean);
        const pop = document.createElement('div');
        pop.id = 'va-word-popover';
        pop.className = 'fixed z-[9995] w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-indigo-200/90 p-3.5 text-left space-y-2';

        const encoded = encodeURIComponent(entry ? entry.word : clean);
        const saved = isWordSaved(entry ? entry.word : clean);

        if (entry) {
            pop.innerHTML = `
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-extrabold text-base text-indigo-950">${escHtml(entry.word)}</span>
                            ${entry.pos ? `<span class="text-[11px] font-bold text-slate-400">(${escHtml(entry.pos)})</span>` : ''}
                            ${entry.level ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(entry.level)}</span>` : ''}
                        </div>
                        ${entry.ipa ? `<p class="font-mono text-xs text-indigo-500">${escHtml(entry.ipa)}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button type="button" onclick="window.__vaQuickSpeak('${encoded}')"
                            class="w-7 h-7 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe phát âm">
                            <i class="fa-solid fa-volume-high text-[11px]"></i>
                        </button>
                        <button type="button" onclick="window.__vaQuickDetail('${encoded}')"
                            class="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white flex items-center justify-center transition-all" title="Xem nhiều nghĩa & cụm từ">
                            <i class="fa-solid fa-circle-info text-[11px]"></i>
                        </button>
                        <button type="button" onclick="window.__vaClosePopover()"
                            class="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center">
                            <i class="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                </div>
                <p class="text-sm font-bold text-emerald-700">${escHtml(entry.vi)}</p>
                ${entry.example ? `
                    <div class="text-xs bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-100 leading-relaxed space-y-0.5">
                        <p class="text-slate-700 italic">"${escHtml(entry.example)}"</p>
                        ${entry.exampleVi ? `<p class="text-[11px] text-slate-500">${escHtml(entry.exampleVi)}</p>` : ''}
                    </div>
                ` : ''}
                <div class="flex items-center justify-between gap-2 pt-1">
                    ${saved
                        ? `<span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1"><i class="fa-solid fa-check text-[10px]"></i>Đã có trong Sổ tay</span>`
                        : `<button type="button" onclick="window.__vaQuickSave('${encoded}', this)" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 hover:border-indigo-600 font-bold text-xs inline-flex items-center gap-1 transition-all"><i class="fa-solid fa-plus text-[10px]"></i>Lưu nhanh</button>`
                    }
                    ${typeof fallbackOpenFormFn === 'function'
                        ? `<button type="button" id="va-pop-edit-btn" class="text-[11px] font-bold text-slate-500 hover:text-indigo-600 underline">Sửa chi tiết</button>`
                        : ''
                    }
                </div>
            `;
        } else {
            pop.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-extrabold text-sm text-indigo-950">${escHtml(clean)}</span>
                    <button type="button" onclick="window.__vaClosePopover()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-xs"></i></button>
                </div>
                <p class="text-xs text-slate-500">Chưa có trong kho 3.293 từ offline.</p>
                <div class="flex items-center gap-2 pt-1">
                    <button type="button" onclick="window.__vaQuickSpeak('${encoded}')" class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs"><i class="fa-solid fa-volume-high mr-1"></i>Nghe</button>
                    ${typeof fallbackOpenFormFn === 'function'
                        ? `<button type="button" id="va-pop-edit-btn" class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">+ Tự thêm từ</button>`
                        : ''
                    }
                </div>
            `;
        }

        document.body.appendChild(pop);

        if (typeof fallbackOpenFormFn === 'function') {
            const editBtn = document.getElementById('va-pop-edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    closeWordPopover();
                    fallbackOpenFormFn();
                });
            }
        }

        // Định vị thông minh ngay phía trên (hoặc dưới) từ vừa bấm
        const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, bottom: window.innerHeight / 2, width: 0 };
        const popRect = pop.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - popRect.width / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - popRect.width - 12));

        let top = rect.top - popRect.height - 10;
        if (top < 12) top = rect.bottom + 10;
        top = Math.max(12, Math.min(top, window.innerHeight - popRect.height - 12));

        pop.style.left = `${left}px`;
        pop.style.top = `${top}px`;
    };

    // ==================== GẮN HOOK TOÀN CỤC ====================
    window.__vaQuickSpeak = (enc) => speakWord(decodeURIComponent(enc));
    window.__vaQuickInsert = (enc) => insertWordIntoInput(decodeURIComponent(enc));
    window.__vaQuickSave = (enc, el) => quickSaveWord(decodeURIComponent(enc), el);
    window.__vaClosePopover = closeWordPopover;
    window.__vaQuickDetail = (enc) => {
        if (typeof window.openWordDetailModal === 'function') {
            window.closeMiniLookup();
            closeWordPopover();
            window.openWordDetailModal(enc);
        }
    };

    function initQuickTools() {
        injectMiniLookupButton();

        // Theo dõi DOM khi chuyển bài để đảm bảo nút Tra nhanh luôn có mặt
        const observer = new MutationObserver(() => injectMiniLookupButton());
        observer.observe(document.body, { childList: true, subtree: true });

        // Phím tắt Alt + K mở Tra nhanh, Esc đóng cả 2
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                window.openMiniLookup();
            } else if (e.key === 'Escape') {
                window.closeMiniLookup();
                closeWordPopover();
            }
        });

        // Chạm ra ngoài để tắt Popover
        document.addEventListener('click', (e) => {
            const pop = document.getElementById('va-word-popover');
            if (pop && !pop.contains(e.target)) {
                // Tránh tắt ngay lúc vừa bấm vào từ
                if (!e.target.closest('[data-va-word], .vocab-clickable-word')) {
                    closeWordPopover();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initQuickTools, 150));
    } else {
        setTimeout(initQuickTools, 150);
    }
})();
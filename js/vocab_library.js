/**
 * MODULE TRANG TỪ ĐIỂN OXFORD 3.000+ ĐỘC LẬP (js/vocab_library.js)
 * - Tự động gắn nút "Từ điển" lên thanh Header (cạnh nút Sổ tay)
 * - Gồm 3 tab chuyên biệt:
 *    1. Khám phá 3K (Lọc A1-C1, Từ loại, A-Z, Tìm nhanh, Phân trang 30 từ/trang, Lưu 1 chạm)
 *    2. Flashcard ngẫu nhiên (Lật thẻ ngẫu nhiên từ kho 3.293 từ theo trình độ, nghe loa & lưu nhanh)
 *    3. Phản xạ 60s (Lối vào Mini-game tốc độ + Kỷ lục cá nhân)
 */

(function () {
    const PAGE_SIZE = 30;

    let currentDictTab = 'browse'; // 'browse' | 'flashcard' | 'quiz'

    let libState = {
        level: 'A1',
        letter: 'ALL',
        hideSaved: false,
        page: 1
    };

    let fcState = {
        level: 'A1',
        currentItem: null,
        flipped: false,
        seenCount: 0
    };

    let cachedAllEntries = null;

    function getAllDictionaryEntries() {
        if (cachedAllEntries) return cachedAllEntries;
        if (typeof window.VA_DICTIONARY_CORE !== 'object' || !window.VA_DICTIONARY_CORE) return [];

        cachedAllEntries = Object.entries(window.VA_DICTIONARY_CORE)
            .map(([word, data]) => ({
                word: word.trim(),
                wordLower: word.trim().toLowerCase(),
                ipa: (data && data.ipa) || '',
                pos: (data && data.pos) || '',
                vi: (data && data.vi) || '',
                level: ((data && data.level) || 'B1').toUpperCase(),
                example: (data && data.example) || '',
                exampleVi: (data && data.exampleVi) || ''
            }))
            .sort((a, b) => a.wordLower.localeCompare(b.wordLower));

        return cachedAllEntries;
    }

    function getSavedWordSet() {
        try {
            const list = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
            return new Set(list.map(item => String(item.en || '').trim().toLowerCase()));
        } catch (e) {
            return new Set();
        }
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ==================== 1. GẮN NÚT "TỪ ĐIỂN" LÊN HEADER & TẠO TRANG #view-dictionary ====================
    function injectDictionaryNavAndView() {
        // Đổi tiêu đề Sổ tay cho gọn và chuẩn nghĩa
        const nbView = document.getElementById('view-notebook');
        if (nbView) {
            const h2 = nbView.querySelector('h2');
            if (h2 && h2.textContent.includes('Sổ tay mẫu câu')) {
                h2.innerHTML = `<i class="fa-solid fa-bookmark text-indigo-600 mr-2"></i>Sổ tay của tôi`;
            }
        }

        // Gắn nút "Từ điển" ngay cạnh nút "Sổ tay" trên Header
        if (!document.getElementById('nav-dictionary-btn')) {
            const nbBadge = document.getElementById('notebook-badge');
            const nbNavBtn = nbBadge ? nbBadge.closest('button') : null;
            if (nbNavBtn && nbNavBtn.parentElement) {
                const dictBtn = document.createElement('button');
                dictBtn.id = 'nav-dictionary-btn';
                dictBtn.type = 'button';
                dictBtn.setAttribute('onclick', "switchTab('dictionary')");
                dictBtn.className = "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all shrink-0";
                dictBtn.title = "Từ điển Oxford 3.000+ & Luyện từ";
                dictBtn.innerHTML = `<i class="fa-solid fa-book-atlas text-emerald-500"></i><span class="hidden md:inline">Từ điển</span>`;
                nbNavBtn.insertAdjacentElement('afterend', dictBtn);
            }
        }

        // Tạo khung trang #view-dictionary trong <main>
        const mainEl = document.querySelector('main');
        if (mainEl && !document.getElementById('view-dictionary')) {
            const sec = document.createElement('section');
            sec.id = 'view-dictionary';
            sec.className = 'hidden space-y-5 animate-fade-in';
            mainEl.appendChild(sec);
        }
    }

    // ==================== 2. ĐIỀU HƯỚNG TAB TRONG TRANG TỪ ĐIỂN ====================
    window.switchDictionarySubTab = function (subTab) {
        currentDictTab = subTab;
        if (subTab === 'flashcard' && !fcState.currentItem) {
            pickRandomDictFlashcard(false);
        }
        renderDictionaryPage();
    };

    // --- Các hàm lọc của Tab Khám phá 3K ---
    window.setVocabLibLevel = function (lv) { libState.level = lv; libState.page = 1; renderDictionaryPage(); };
    window.setVocabLibLetter = function (letter) { libState.letter = letter; libState.page = 1; renderDictionaryPage(); };
    window.setVocabLibSearch = function (val) {
        const nextQ = String(val || '').trim();
        // Khi bắt đầu nhập từ khóa tìm kiếm, tự mở rộng ra "Tất cả" trình độ để không bỏ sót từ như "earth"
        if (nextQ && !libState.search && libState.level !== 'ALL') {
            libState.level = 'ALL';
        }
        libState.search = nextQ;
        libState.page = 1;
        renderDictionaryPage(true);
    };
    window.toggleVocabLibHideSaved = function () { libState.hideSaved = !libState.hideSaved; libState.page = 1; renderDictionaryPage(); };
    window.setVocabLibPage = function (newPage) {
        libState.page = Math.max(1, newPage);
        renderDictionaryPage();
        const viewEl = document.getElementById('view-dictionary');
        if (viewEl) viewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Các hàm của Tab Flashcard ngẫu nhiên ---
    function pickRandomDictFlashcard(shouldRender = true) {
        const all = getAllDictionaryEntries();
        const pool = fcState.level === 'ALL' ? all : all.filter(e => e.level === fcState.level);
        if (pool.length === 0) {
            fcState.currentItem = null;
        } else {
            let next = pool[Math.floor(Math.random() * pool.length)];
            if (pool.length > 1 && fcState.currentItem && next.wordLower === fcState.currentItem.wordLower) {
                next = pool[Math.floor(Math.random() * pool.length)];
            }
            fcState.currentItem = next;
            fcState.flipped = false;
            fcState.seenCount += 1;
        }
        if (shouldRender) renderDictionaryPage();
    }

    window.setDictFlashcardLevel = function (lv) {
        fcState.level = lv;
        pickRandomDictFlashcard(true);
    };

    window.flipDictFlashcard = function () {
        fcState.flipped = !fcState.flipped;
        renderDictionaryPage();
    };

    window.nextRandomDictFlashcard = function () {
        pickRandomDictFlashcard(true);
    };

    // --- Phát âm & Lưu từ 1 chạm ---
    window.speakVocabLibWord = function (encodedWord, btnEl) {
        const word = decodeURIComponent(encodedWord || '').trim();
        if (word && typeof speakText === 'function') {
            speakText(word, btnEl, 0.9);
        }
    };

    window.saveVocabLibWord = function (encodedWord, btnEl) {
        const word = decodeURIComponent(encodedWord || '').trim();
        if (!word || !window.VA_DICTIONARY_CORE) return;

        const entry = window.VA_DICTIONARY_CORE[word.toLowerCase()];
        if (!entry) return;

        let list = [];
        try {
            list = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
        } catch (e) { }

        if (list.some(v => String(v.en || '').toLowerCase() === word.toLowerCase())) {
            if (typeof showToast === 'function') showToast(`Từ "${word}" đã có sẵn trong Sổ tay!`, 'info');
            return;
        }

        list.unshift({
            id: 'voc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            en: word,
            vi: entry.vi || '',
            ipa: entry.ipa || '',
            pos: entry.pos || '',
            level: (entry.level || 'B1').toUpperCase(),
            emoji: '📖',
            imageUrl: '',
            topic: 'Oxford 3000',
            exampleEn: entry.example || '',
            exampleVi: entry.exampleVi || '',
            mastered: false,
            foreverMastered: false,
            reviewStage: 0,
            nextReviewDue: null,
            addedAt: new Date().toISOString()
        });

        localStorage.setItem('va_vocab_bank', JSON.stringify(list));
        if (typeof addXP === 'function') addXP(2);
        if (typeof window.updateNotebookBadge === 'function') window.updateNotebookBadge();

        if (btnEl) {
            btnEl.className = "px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1 shrink-0";
            btnEl.innerHTML = `<i class="fa-solid fa-check text-[10px]"></i><span>Đã lưu</span>`;
            btnEl.onclick = null;
        }

        if (typeof showToast === 'function') {
            showToast(`✨ Đã lưu "${word}" vào Sổ tay của bạn (+2 XP)!`, 'success');
        }
    };

    // ==================== 3. VẼ NỘI DUNG TỪNG TAB ====================
    function buildBrowseTabHTML(allEntries, savedSet) {
        const levelPool = libState.level === 'ALL' ? allEntries : allEntries.filter(e => e.level === libState.level);
        const savedInLevel = levelPool.filter(e => savedSet.has(e.wordLower)).length;
        const progressPct = levelPool.length > 0 ? Math.round((savedInLevel / levelPool.length) * 100) : 0;

        const filtered = levelPool.filter(item => {
            if (libState.letter !== 'ALL' && !item.wordLower.startsWith(libState.letter.toLowerCase())) return false;
            if (libState.hideSaved && savedSet.has(item.wordLower)) return false;
            return true;
        });

        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (libState.page > totalPages) libState.page = totalPages;
        const startIdx = (libState.page - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

        const levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];
        const letters = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

        const levelBtnsHTML = levels.map(lv => `
            <button type="button" onclick="setVocabLibLevel('${lv}')" class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${libState.level === lv ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                ${lv === 'ALL' ? 'Tất cả' : lv}
            </button>
        `).join('');

        const letterBtnsHTML = letters.map(ch => `
            <button type="button" onclick="setVocabLibLetter('${ch}')" class="px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${libState.letter === ch ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}">
                ${ch === 'ALL' ? 'A–Z' : ch}
            </button>
        `).join('');

        const cardsHTML = pageItems.length === 0
            ? `<div class="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">Không có từ nào khớp với bộ lọc hiện tại.</div>`
            : pageItems.map(item => {
                const isSaved = savedSet.has(item.wordLower);
                const encoded = encodeURIComponent(item.word);
                const saveBtn = isSaved
                    ? `<span class="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1 shrink-0"><i class="fa-solid fa-check text-[10px]"></i>Đã lưu</span>`
                    : `<button type="button" onclick="saveVocabLibWord('${encoded}', this)" class="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 hover:border-indigo-600 font-bold text-xs inline-flex items-center gap-1 shrink-0 transition-all"><i class="fa-solid fa-plus text-[10px]"></i>Lưu</button>`;

                return `
                    <div class="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-2.5">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(item.level)}</span>
                                    ${item.pos ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">${escHtml(item.pos)}</span>` : ''}
                                </div>
                                <h4 class="text-base sm:text-lg font-extrabold text-indigo-950 mt-1 leading-snug">${escHtml(item.word)}</h4>
                                ${item.ipa ? `<p class="font-mono text-xs text-indigo-500">${escHtml(item.ipa)}</p>` : ''}
                                <p class="text-sm font-bold text-emerald-700 mt-1">${escHtml(item.vi)}</p>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" onclick="speakVocabLibWord('${encoded}', this)" class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe phát âm">
                                    <i class="fa-solid fa-volume-high text-xs"></i>
                                </button>
                                <button type="button" onclick="if(typeof openWordDetailModal==='function') openWordDetailModal('${encoded}')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white flex items-center justify-center transition-all" title="Xem chi tiết nhiều nghĩa">
                                    <i class="fa-solid fa-circle-info text-xs"></i>
                                </button>
                                ${saveBtn}
                            </div>
                        </div>
                        ${item.example ? `
                            <div class="text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed space-y-0.5">
                                <p class="text-slate-700 italic">"${escHtml(item.example)}"</p>
                                ${item.exampleVi ? `<p class="text-[11px] text-slate-500">${escHtml(item.exampleVi)}</p>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

        const paginationHTML = totalPages > 1 ? `
            <div class="flex items-center justify-between gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200/80">
                <button type="button" onclick="setVocabLibPage(${libState.page - 1})" ${libState.page <= 1 ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all">
                    <i class="fa-solid fa-chevron-left mr-1"></i>Trang trước
                </button>
                <span class="text-xs font-extrabold text-slate-600">Trang ${libState.page} / ${totalPages} <span class="text-slate-400 font-medium">(${filtered.length} từ)</span></span>
                <button type="button" onclick="setVocabLibPage(${libState.page + 1})" ${libState.page >= totalPages ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all">
                    Trang sau<i class="fa-solid fa-chevron-right ml-1"></i>
                </button>
            </div>
        ` : '';

        return `
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <!-- Thanh Tra nhanh 2 chiều tràn ngang 100% -->
                <button type="button" onclick="if (typeof openMiniLookup === 'function') openMiniLookup();"
                    class="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-indigo-50/70 text-slate-500 hover:text-indigo-700 text-xs sm:text-sm font-medium text-left border border-slate-200/80 hover:border-indigo-200 transition-all">
                    <i class="fa-solid fa-magnifying-glass text-indigo-500 text-xs sm:text-sm shrink-0"></i>
                    <span class="truncate">Tra nhanh từ Anh – Việt (3.293 từ)...</span>
                </button>

                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p class="text-xs sm:text-sm text-slate-600">
                        Tiến độ lưu trình độ <strong>${libState.level === 'ALL' ? 'Toàn bộ' : libState.level}</strong>:
                        <strong class="text-emerald-700">${savedInLevel} / ${levelPool.length}</strong> từ (${progressPct}%)
                    </p>
                    <div class="w-full sm:w-44 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style="width: ${progressPct}%"></div>
                    </div>
                </div>

                <!-- Hàng trình độ + nút Ẩn đã lưu căn gọn 2 bên -->
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex flex-wrap items-center gap-1.5">${levelBtnsHTML}</div>
                    <button type="button" onclick="toggleVocabLibHideSaved()" class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${libState.hideSaved ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
                        <i class="fa-solid ${libState.hideSaved ? 'fa-eye-slash' : 'fa-eye'} mr-1"></i>Ẩn đã lưu
                    </button>
                </div>

                <div class="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                    ${letterBtnsHTML}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">${cardsHTML}</div>
            ${paginationHTML}
        `;
    }
     

    function buildRandomFlashcardTabHTML(savedSet) {
        if (!fcState.currentItem) pickRandomDictFlashcard(false);
        const item = fcState.currentItem;
        const levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'];

        const levelBar = levels.map(lv => `
            <button type="button" onclick="setDictFlashcardLevel('${lv}')" class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${fcState.level === lv ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                ${lv === 'ALL' ? 'Ngẫu nhiên tất cả' : lv}
            </button>
        `).join('');

        if (!item) {
            return `<div class="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">Không có dữ liệu từ vựng cho trình độ này.</div>`;
        }

        const encoded = encodeURIComponent(item.word);
        const isSaved = savedSet.has(item.wordLower);
        const saveBtn = isSaved
            ? `<span class="px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs inline-flex items-center gap-1.5"><i class="fa-solid fa-check"></i>Đã có trong Sổ tay</span>`
            : `<button type="button" onclick="saveVocabLibWord('${encoded}', this)" class="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-xs inline-flex items-center gap-1.5 transition-all"><i class="fa-solid fa-plus"></i>Lưu vào Sổ tay</button>`;

        return `
            <div class="bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-1.5">${levelBar}</div>
                <span class="text-xs font-bold text-slate-400">Đã lướt: ${fcState.seenCount} thẻ</span>
            </div>

            <div class="bg-white rounded-3xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center">
                <div class="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">${escHtml(item.level)} ${item.pos ? '• ' + escHtml(item.pos) : ''}</span>
                    <span>Flashcard ngẫu nhiên 3K</span>
                </div>

                <div onclick="flipDictFlashcard()" class="cursor-pointer min-h-[210px] rounded-2xl border-2 border-dashed ${fcState.flipped ? 'border-emerald-300 bg-emerald-50/40' : 'border-indigo-200 bg-slate-50/70'} p-6 flex flex-col items-center justify-center gap-2 transition-all select-none">
                    ${!fcState.flipped ? `
                        <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Chạm vào thẻ để lật xem nghĩa</span>
                        <h3 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">${escHtml(item.word)}</h3>
                        ${item.ipa ? `<p class="font-mono text-sm text-indigo-600 mt-1">${escHtml(item.ipa)}</p>` : ''}
                    ` : `
                        <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Nghĩa & Ví dụ</span>
                        <h3 class="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">${escHtml(item.vi)}</h3>
                        <p class="text-sm font-bold text-indigo-700">${escHtml(item.word)} <span class="font-mono text-xs font-normal text-slate-500">${escHtml(item.ipa)}</span></p>
                        ${item.example ? `
                            <div class="mt-2 pt-2 border-t border-emerald-200/80 max-w-md space-y-0.5">
                                <p class="text-xs sm:text-sm text-slate-700 italic">"${escHtml(item.example)}"</p>
                                ${item.exampleVi ? `<p class="text-xs text-slate-500">${escHtml(item.exampleVi)}</p>` : ''}
                            </div>
                        ` : ''}
                    `}
                </div>

                <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button type="button" onclick="speakVocabLibWord('${encoded}', this)" class="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all">
                        <i class="fa-solid fa-volume-high mr-1"></i>Nghe phát âm
                    </button>
                    ${saveBtn}
                    <button type="button" onclick="nextRandomDictFlashcard()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-all">
                        Từ ngẫu nhiên khác <i class="fa-solid fa-shuffle ml-1"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function buildQuizTabHTML() {
        const best = parseInt(localStorage.getItem('va_vocab_quiz_best') || '0', 10) || 0;
        return `
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 max-w-xl mx-auto text-center space-y-5">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <div class="space-y-1.5">
                    <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">Phản xạ từ vựng 60 giây</h3>
                    <p class="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        Thử thách tốc độ nhớ từ qua 3 chế độ <strong>Anh → Việt</strong>, <strong>Việt → Anh</strong> và <strong>Nghe → Chọn từ</strong>. Tích lũy Combo để nhận thêm XP!
                    </p>
                </div>
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-extrabold">
                    <i class="fa-solid fa-trophy text-amber-500"></i>
                    <span>Kỷ lục hiện tại của bạn: ${best} câu đúng / 60s</span>
                </div>
                <div class="pt-2">
                    <button type="button" onclick="openVocabQuizModal()" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all inline-flex items-center justify-center gap-2">
                        <i class="fa-solid fa-play"></i>
                        <span>Bắt đầu chơi ngay</span>
                    </button>
                </div>
            </div>
        `;
    }

    function renderDictionaryPage(keepFocusOnSearch = false) {
        const viewEl = document.getElementById('view-dictionary');
        if (!viewEl) return;

        const allEntries = getAllDictionaryEntries();
        const savedSet = getSavedWordSet();

        let bodyHTML = '';
        if (allEntries.length === 0) {
            bodyHTML = `<div class="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">Kho từ điển chưa sẵn sàng.</div>`;
        } else if (currentDictTab === 'browse') {
            bodyHTML = buildBrowseTabHTML(allEntries, savedSet);
        } else if (currentDictTab === 'flashcard') {
            bodyHTML = buildRandomFlashcardTabHTML(savedSet);
        } else {
            bodyHTML = buildQuizTabHTML();
        }

        viewEl.innerHTML = `
            <!-- Header trang Từ điển -->
            <div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-book-atlas text-emerald-500"></i>
                        <span>Từ điển Oxford 3.000+</span>
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Tra cứu offline, lật Flashcard ngẫu nhiên và luyện phản xạ tốc độ.</p>
                </div>
                <button type="button" onclick="switchTab('practice')" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-all inline-flex items-center justify-center gap-2 shrink-0">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Quay lại luyện dịch</span>
                </button>
            </div>

            <!-- Thanh 3 Tab phụ trợ trong Từ điển -->
            <div class="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div class="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button type="button" onclick="switchDictionarySubTab('browse')" class="py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${currentDictTab === 'browse' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                        <i class="fa-solid fa-compass text-emerald-500"></i>
                        <span class="truncate">Khám phá 3K</span>
                    </button>
                    <button type="button" onclick="switchDictionarySubTab('flashcard')" class="py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${currentDictTab === 'flashcard' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                        <i class="fa-solid fa-shuffle text-amber-500"></i>
                        <span class="truncate">Flashcard</span>
                    </button>
                    <button type="button" onclick="switchDictionarySubTab('quiz')" class="py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${currentDictTab === 'quiz' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                        <i class="fa-solid fa-bolt text-rose-500"></i>
                        <span class="truncate">Phản xạ 60s</span>
                    </button>
                </div>
            </div>

            ${bodyHTML}
        `;

        if (keepFocusOnSearch) {
            const inp = document.getElementById('vocab-lib-search-input');
            if (inp) {
                inp.focus();
                inp.setSelectionRange(inp.value.length, inp.value.length);
            }
        }
    }

    // ==================== 3.5. KHỐI "5 TỪ GỢI Ý HÔM NAY" TRÊN TRANG CHỦ ====================
    function getDailyFiveWords() {
        const all = getAllDictionaryEntries();
        if (all.length === 0) return [];

        // Ưu tiên nhóm A1–B1 cho gần gũi thực tế (nếu ít hơn 5 từ thì lấy toàn bộ)
        const pool = all.filter(e => ['A1', 'A2', 'B1'].includes(e.level));
        const source = pool.length >= 5 ? pool : all;

        // Tạo hạt giống cố định theo ngày hiện tại (YYYY-MM-DD)
        const now = new Date();
        const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        let seed = 0;
        for (let i = 0; i < dateKey.length; i++) {
            seed = ((seed << 5) - seed + dateKey.charCodeAt(i)) | 0;
        }
        seed = Math.abs(seed) || 12345;

        const nextRand = () => {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };

        const picked = [];
        const usedIdx = new Set();
        let guard = 0;
        while (picked.length < 5 && usedIdx.size < source.length && guard < 100) {
            guard++;
            const idx = Math.floor(nextRand() * source.length);
            if (!usedIdx.has(idx)) {
                usedIdx.add(idx);
                picked.push(source[idx]);
            }
        }
        return picked;
    }

    function renderDailyFiveWordsWidget() {
        const homeView = document.getElementById('home-daily-words-slot') || document.getElementById('view-home');
      if (!homeView) return;

      const dailyWords = getDailyFiveWords();
      if (dailyWords.length === 0) return;

      let widget = document.getElementById('va-daily-five-words-widget');
      if (!widget) {
          widget = document.createElement('div');
          widget.id = 'va-daily-five-words-widget';
          homeView.appendChild(widget);
      }

        const savedSet = getSavedWordSet();
        const todayStr = new Date().toLocaleDateString('vi-VN');

        const itemsHTML = dailyWords.map(item => {
            const isSaved = savedSet.has(item.wordLower);
            const encoded = encodeURIComponent(item.word);
            const saveBtn = isSaved
                ? `<span class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 shrink-0"><i class="fa-solid fa-check text-[9px]"></i>Đã lưu</span>`
                : `<button type="button" onclick="saveVocabLibWord('${encoded}', this)" class="px-2 py-1 rounded-lg bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 hover:border-indigo-600 font-bold text-[11px] inline-flex items-center gap-1 shrink-0 transition-all"><i class="fa-solid fa-plus text-[9px]"></i>Lưu</button>`;

            return `
                <div class="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between gap-2.5">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="font-extrabold text-sm sm:text-base text-indigo-950">${escHtml(item.word)}</span>
                                <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(item.level)}</span>
                                ${item.pos ? `<span class="text-[10px] font-bold text-slate-400">(${escHtml(item.pos)})</span>` : ''}
                            </div>
                            ${item.ipa ? `<p class="font-mono text-[11px] text-indigo-500">${escHtml(item.ipa)}</p>` : ''}
                            <p class="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">${escHtml(item.vi)}</p>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="speakVocabLibWord('${encoded}', this)" class="w-8 h-8 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all" title="Nghe phát âm">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                            <button type="button" onclick="if(typeof openWordDetailModal==='function') openWordDetailModal('${encoded}')" class="w-8 h-8 rounded-full bg-white hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all" title="Xem chi tiết nhiều nghĩa">
                                <i class="fa-solid fa-circle-info text-xs"></i>
                            </button>
                            ${saveBtn}
                        </div>
                    </div>
                    ${item.example ? `
                        <div class="text-xs bg-white/90 px-2.5 py-2 rounded-xl border border-slate-200/70 leading-relaxed space-y-0.5">
                            <p class="text-slate-700 italic">"${escHtml(item.example)}"</p>
                            ${item.exampleVi ? `<p class="text-[11px] text-slate-500">${escHtml(item.exampleVi)}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        widget.innerHTML = `
            <div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-sun text-amber-500"></i>
                            <span>5 từ gợi ý hôm nay</span>
                            <span class="text-xs font-bold text-slate-400">(${todayStr})</span>
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">Tự động làm mới 5 từ mỗi ngày lúc 0h — nghe loa và bấm lưu để tích lũy.</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" onclick="openVocabQuizModal()" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-extrabold transition-all inline-flex items-center gap-1.5">
                            <i class="fa-solid fa-bolt"></i><span>Phản xạ 60s</span>
                        </button>
                        <button type="button" onclick="switchTab('dictionary')" class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-extrabold transition-all inline-flex items-center gap-1.5">
                            <i class="fa-solid fa-book-atlas"></i><span>Mở Từ điển 3K</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${itemsHTML}
                </div>
            </div>
        `;
        // Thanh trượt 5 phần cho Mobile (đồng bộ khi vuốt hoặc bấm chọn)
        const gridEl = widget.querySelector('.grid');
        if (gridEl && dailyWords.length > 1) {
            const bar = document.createElement('div');
            bar.className = 'va-daily-progress-bar';
            bar.innerHTML = dailyWords.map((_, idx) =>
                `<button type="button" class="va-daily-seg ${idx === 0 ? 'active' : ''}" aria-label="Từ ${idx + 1}"></button>`
            ).join('');
            gridEl.insertAdjacentElement('afterend', bar);

            const segs = Array.from(bar.querySelectorAll('.va-daily-seg'));
            const updateActiveSeg = () => {
                const step = gridEl.clientWidth + 12;
                if (step <= 12) return;
                const activeIdx = Math.max(0, Math.min(segs.length - 1, Math.round(gridEl.scrollLeft / step)));
                segs.forEach((s, i) => s.classList.toggle('active', i === activeIdx));
            };

            gridEl.addEventListener('scroll', updateActiveSeg, { passive: true });
            segs.forEach((seg, idx) => {
                seg.addEventListener('click', () => {
                    gridEl.scrollTo({ left: idx * (gridEl.clientWidth + 12), behavior: 'smooth' });
                });
            });
        }
    }

    // ==================== 4. ĐĂNG KÝ HOOK VỚI SINGLE ROUTER ====================
    window.renderDailyFiveWordsWidget = renderDailyFiveWordsWidget;
    window.onEnterDictionaryTab = function () {
        injectDictionaryNavAndView();
        renderDictionaryPage();
    };

    function initDictionaryPage() {
        injectDictionaryNavAndView();
        renderDailyFiveWordsWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDictionaryPage);
    } else {
        initDictionaryPage();
    }
})();
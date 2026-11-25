/**
 * SRS VOCAB UI (js/srs_vocab_ui.js)
 * Tầng Giao diện & Kết nối vào màn hình Hộp ôn tập (#view-review) cho cả Desktop & Mobile
 */
(function () {
    const uiState = {
        activeSubTab: 'sentences', // 'sentences' | 'vocab_srs'
        boxFilter: 'due',          // 'due' | 'all' | '1' | '2' | '3' | '4'
        inSession: false,
        queue: [],
        idx: 0,
        answered: false,
        lastEval: null,
        lastInput: '',
        hintStep: 0,
        sessionXP: 0,
        correctCount: 0
    };

    function readVocabBank() {
        try { return JSON.parse(localStorage.getItem('va_vocab_bank')) || []; }
        catch (e) { return []; }
    }

    function writeVocabBank(list) {
        localStorage.setItem('va_vocab_bank', JSON.stringify(list));
        if (typeof window.updateNotebookBadge === 'function') window.updateNotebookBadge();
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Tự động chèn thanh chuyển đổi 2 tab + vùng chứa SRS vào #view-review
    function ensureSrsContainerInReview() {
        const viewReview = document.getElementById('view-review');
        if (!viewReview) return null;

        if (!document.getElementById('va-review-mode-switcher')) {
            const switcher = document.createElement('div');
            switcher.id = 'va-review-mode-switcher';
            switcher.className = 'flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 max-w-md mb-4';
            switcher.innerHTML = `
                <button id="va-rev-tab-sentences" type="button" onclick="window.vaSwitchReviewSubTab('sentences')"
                    class="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold bg-white text-indigo-700 shadow-2xs transition-all">
                    <i class="fa-solid fa-quote-left mr-1.5"></i>Ôn mẫu câu
                </button>
                <button id="va-rev-tab-vocab" type="button" onclick="window.vaSwitchReviewSubTab('vocab_srs')"
                    class="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-700 transition-all">
                    <i class="fa-solid fa-layer-group mr-1.5"></i>Ôn từ vựng (SRS)
                    <span id="va-srs-due-pill" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white hidden">0</span>
                </button>
            `;
            const anchor = document.getElementById('review-filter-bar') || document.getElementById('review-page-list');
            if (anchor && anchor.parentElement) {
                anchor.parentElement.insertBefore(switcher, anchor);
            } else {
                viewReview.prepend(switcher);
            }
        }

        let srsPanel = document.getElementById('va-srs-vocab-panel');
        if (!srsPanel) {
            srsPanel = document.createElement('div');
            srsPanel.id = 'va-srs-vocab-panel';
            srsPanel.className = 'hidden space-y-4';
            const switcher = document.getElementById('va-review-mode-switcher');
            switcher.insertAdjacentElement('afterend', srsPanel);
        }
        return srsPanel;
    }

    function updateDuePill() {
        const pill = document.getElementById('va-srs-due-pill');
        if (!pill || !window.SrsVocabEngine) return;
        const stats = window.SrsVocabEngine.getBoxStats(readVocabBank());
        pill.textContent = stats.dueTotal;
        pill.classList.toggle('hidden', stats.dueTotal === 0);
    }

    // Tìm chính xác các khối thuộc phần "Ôn mẫu câu" (kể cả khối Top lỗi hay gặp do error_tracker.js tạo ra)
    function getSentenceReviewElements() {
        const viewReview = document.getElementById('view-review');
        const els = [
            document.getElementById('review-filter-bar'),
            document.getElementById('review-page-list'),
            document.getElementById('review-page-empty'),
            document.getElementById('review-page-audio-btn')
        ].filter(Boolean);

        if (viewReview) {
            const errorBox = Array.from(viewReview.children).find(el =>
                el.id !== 'va-review-mode-switcher' &&
                el.id !== 'va-srs-vocab-panel' &&
                (el.textContent || '').includes('Top lỗi hay gặp')
            );
            if (errorBox) els.push(errorBox);
        }
        return els;
    }

    window.vaSwitchReviewSubTab = function (tab) {
        uiState.activeSubTab = tab === 'vocab_srs' ? 'vocab_srs' : 'sentences';
        const srsPanel = ensureSrsContainerInReview();
        const btnSent = document.getElementById('va-rev-tab-sentences');
        const btnVocab = document.getElementById('va-rev-tab-vocab');

        const activeCls = 'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold bg-white text-indigo-700 shadow-2xs transition-all';
        const inactiveCls = 'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-700 transition-all';

        if (uiState.activeSubTab === 'vocab_srs') {
            if (btnVocab) btnVocab.className = activeCls;
            if (btnSent) btnSent.className = inactiveCls;
            getSentenceReviewElements().forEach(el => el.classList.add('hidden'));
            if (srsPanel) {
                srsPanel.classList.remove('hidden');
                renderSrsPanel();
            }
        } else {
            if (btnSent) btnSent.className = activeCls;
            if (btnVocab) btnVocab.className = inactiveCls;
            if (srsPanel) srsPanel.classList.add('hidden');
            getSentenceReviewElements().forEach(el => el.classList.remove('hidden'));
            if (typeof renderReviewPage === 'function') renderReviewPage();
        }
        updateDuePill();
    };

    window.syncSrsVocabTabInReview = function () {
        ensureSrsContainerInReview();
        updateDuePill();
        if (uiState.activeSubTab === 'vocab_srs') {
            getSentenceReviewElements().forEach(el => el.classList.add('hidden'));
            const srsPanel = document.getElementById('va-srs-vocab-panel');
            if (srsPanel) {
                srsPanel.classList.remove('hidden');
                renderSrsPanel();
            }
        }
    };

    function startSrsSession(filter = 'due') {
        const bank = readVocabBank();
        const filtered = bank.filter(item => {
            if (filter === 'due') return window.SrsVocabEngine.isDueForReview(item);
            if (filter === 'all') return !item.foreverMastered;
            return String(window.SrsVocabEngine.getVocabBox(item)) === String(filter);
        });

        if (filtered.length === 0) {
            if (typeof showToast === 'function') showToast('Không có từ nào trong nhóm này để ôn!', 'info');
            return;
        }

        uiState.inSession = true;
        uiState.queue = filtered.slice(0, 15).map(item =>
            window.SrsVocabEngine.buildReviewQuestion(item, bank, window.VA_DICTIONARY_CORE || {})
        );
        uiState.idx = 0;
        uiState.answered = false;
        uiState.lastEval = null;
        uiState.lastInput = '';
        uiState.hintStep = 0;
        uiState.sessionXP = 0;
        uiState.correctCount = 0;
        renderSrsPanel();
    }

    function submitSrsAnswer(userInput) {
        if (uiState.answered) return;
        const q = uiState.queue[uiState.idx];
        if (!q) return;

        const res = window.SrsVocabEngine.evaluateAnswer(q, userInput);
        uiState.answered = true;
        uiState.lastEval = res;
        uiState.lastInput = userInput;

        if (res.isCorrect) {
            uiState.correctCount += 1;
            uiState.sessionXP += res.xpGain;
            if (typeof addXP === 'function') addXP(res.xpGain);
            if (typeof recordDailyPracticeActivity === 'function') recordDailyPracticeActivity();
        }

        // Cập nhật thẳng vào va_vocab_bank
        const bank = readVocabBank();
        const target = bank.find(v => v.id === q.id);
        if (target) {
            Object.assign(target, res.patch);
            writeVocabBank(bank);
        }

        updateDuePill();
        renderSrsPanel();
    }

    function nextSrsCard() {
        if (uiState.idx + 1 >= uiState.queue.length) {
            uiState.inSession = false;
            if (typeof showToast === 'function') {
                showToast(`🎉 Hoàn thành phiên ôn SRS! Đúng ${uiState.correctCount}/${uiState.queue.length} (+${uiState.sessionXP} XP)`, 'success');
            }
        } else {
            uiState.idx += 1;
            uiState.answered = false;
            uiState.lastEval = null;
            uiState.lastInput = '';
            uiState.hintStep = 0;
        }
        renderSrsPanel();
    }

    function renderSrsPanel() {
        const panel = document.getElementById('va-srs-vocab-panel');
        if (!panel || !window.SrsVocabEngine) return;

        const bank = readVocabBank();
        const stats = window.SrsVocabEngine.getBoxStats(bank);

        // 1. Màn hình trống nếu chưa lưu từ nào
        if (bank.length === 0) {
            panel.innerHTML = `
                <div class="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                    <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                        <i class="fa-solid fa-layer-group"></i>
                    </div>
                    <h3 class="text-base sm:text-lg font-extrabold text-slate-900">Chưa có từ vựng nào để ôn</h3>
                    <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">Hãy lưu từ vựng từ Từ điển 3K hoặc khi luyện dịch để kích hoạt Hộp ôn tập thông minh 4 cấp độ nhé.</p>
                    <button type="button" onclick="switchTab('dictionary')" class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold">
                        Mở Từ điển 3K
                    </button>
                </div>`;
            return;
        }

        // 2. Màn hình Tổng quan 4 Hộp Leitner (khi chưa vào phiên ôn)
        if (!uiState.inSession) {
            panel.innerHTML = `
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <button type="button" onclick="window.vaSrsStart('1')" class="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 text-left space-y-1 transition-all">
                        <div class="text-[11px] font-extrabold text-rose-600">HỘP 1 • MỚI</div>
                        <div class="text-2xl font-extrabold text-slate-900">${stats.box1}</div>
                        <div class="text-[11px] text-slate-500">Chọn nghĩa Việt</div>
                    </button>
                    <button type="button" onclick="window.vaSrsStart('2')" class="p-4 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 text-left space-y-1 transition-all">
                        <div class="text-[11px] font-extrabold text-amber-600">HỘP 2 • QUEN</div>
                        <div class="text-2xl font-extrabold text-slate-900">${stats.box2}</div>
                        <div class="text-[11px] text-slate-500">Điền từ trắc nghiệm</div>
                    </button>
                    <button type="button" onclick="window.vaSrsStart('3')" class="p-4 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-400 text-left space-y-1 transition-all">
                        <div class="text-[11px] font-extrabold text-indigo-600">HỘP 3 • VỮNG</div>
                        <div class="text-2xl font-extrabold text-slate-900">${stats.box3}</div>
                        <div class="text-[11px] text-slate-500">Tự gõ theo ngữ cảnh</div>
                    </button>
                    <button type="button" onclick="window.vaSrsStart('4')" class="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 text-left space-y-1 transition-all">
                        <div class="text-[11px] font-extrabold text-emerald-600">ĐÃ THUỘC</div>
                        <div class="text-2xl font-extrabold text-slate-900">${stats.box4}</div>
                        <div class="text-[11px] text-slate-500">Ôn định kỳ 7–90 ngày</div>
                    </button>
                </div>

                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                            ${stats.dueTotal > 0 ? `Có ${stats.dueTotal} từ đến hạn ôn hôm nay` : 'Bạn đã hoàn thành hết từ đến hạn!'}
                        </h3>
                        <p class="text-xs text-slate-500">Trả lời đúng sẽ tự động nâng cấp Hộp & giãn lịch ôn; sai sẽ đưa về Hộp 1 để củng cố.</p>
                    </div>
                    <div class="flex flex-wrap gap-2 shrink-0">
                        ${stats.dueTotal > 0 ? `
                            <button type="button" onclick="window.vaSrsStart('due')" class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-xs">
                                <i class="fa-solid fa-play mr-1.5"></i>Ôn ngay (${stats.dueTotal} từ)
                            </button>` : ''}
                        <button type="button" onclick="window.vaSrsStart('all')" class="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold">
                            Ôn tự do tất cả
                        </button>
                    </div>
                </div>`;
            return;
        }

        // 3. Màn hình Phiên ôn tập SRS
        const q = uiState.queue[uiState.idx];
        const progressPct = Math.round(((uiState.idx + (uiState.answered ? 1 : 0)) / uiState.queue.length) * 100);
        const safeSpeak = (q.fullSentence || q.word).replace(/'/g, "\\'");

        const boxBadge = q.box === 1
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : (q.box === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200');
        const modeTitle = q.mode === 'meaning_quiz'
            ? 'Hộp 1 • Chọn nghĩa đúng của từ được tô sáng'
            : (q.mode === 'cloze_quiz' ? 'Hộp 2 • Chọn từ phù hợp điền vào chỗ trống' : 'Hộp 3 • Tự gõ từ còn thiếu theo ngữ cảnh');

        // Dựng câu hiển thị
        let promptHtml = '';
        if (q.mode === 'meaning_quiz') {
            if (q.hasValidBlank) {
                const highlighted = escapeHtml(q.maskedSentence).replace('_____', `<span class="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold">${escapeHtml(q.exactAnswer)}</span>`);
                promptHtml = `<p class="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">${highlighted}</p>`;
            } else {
                promptHtml = `<p class="text-2xl font-extrabold text-indigo-700">${escapeHtml(q.word)} <span class="text-sm font-mono text-slate-500">${escapeHtml(q.ipa)}</span></p>`;
            }
        } else {
            const blankEl = uiState.answered
                ? `<span class="px-2.5 py-0.5 mx-1 rounded-lg font-extrabold ${uiState.lastEval?.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${escapeHtml(q.exactAnswer)}</span>`
                : `<span class="inline-block min-w-[80px] px-2.5 py-0.5 mx-1 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50 text-indigo-600 font-mono text-center">_____</span>`;
            const sentStr = q.hasValidBlank
                ? escapeHtml(q.maskedSentence).replace('_____', blankEl)
                : `Từ tiếng Anh nào có nghĩa là: <strong class="text-indigo-700">"${escapeHtml(q.vi)}"</strong>?`;
            promptHtml = `
                <p class="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">${sentStr}</p>
                ${q.sentenceVi ? `<p class="text-sm text-slate-500 mt-1.5">“${escapeHtml(q.sentenceVi)}”</p>` : ''}
                ${q.hasValidBlank ? `<p class="text-xs font-bold text-indigo-600 mt-1">Nghĩa từ cần điền: ${escapeHtml(q.vi)}</p>` : ''}
            `;
        }

        panel.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <button type="button" onclick="window.vaSrsExit()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                    <i class="fa-solid fa-arrow-left mr-1"></i>4 Hộp
                </button>
                <div class="text-xs font-extrabold text-slate-500">Thẻ ${uiState.idx + 1}/${uiState.queue.length} • <span class="text-amber-600">+${uiState.sessionXP} XP</span></div>
            </div>

            <div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div class="h-full bg-indigo-600 transition-all duration-300" style="width:${progressPct}%"></div>
            </div>

            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${boxBadge}">${modeTitle}</span>
                    <button type="button" onclick="typeof speakText === 'function' && speakText('${safeSpeak}', this, 0.92)"
                        class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold">
                        <i class="fa-solid fa-volume-high mr-1"></i>Nghe
                    </button>
                </div>

                <div class="py-1">${promptHtml}</div>

                ${q.mode !== 'cloze_typing' ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${q.options.map((opt, i) => {
                            const rightVal = q.mode === 'meaning_quiz' ? q.vi : q.exactAnswer;
                            const isAns = opt.toLowerCase() === rightVal.toLowerCase();
                            const isPicked = opt.toLowerCase() === uiState.lastInput.toLowerCase();
                            let cls = 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-800';
                            if (uiState.answered) {
                                if (isAns) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300';
                                else if (isPicked) cls = 'bg-rose-50 border-rose-400 text-rose-700';
                                else cls = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                            }
                            return `
                                <button type="button" ${uiState.answered ? 'disabled' : ''}
                                    onclick="window.vaSrsPick('${opt.replace(/'/g, "\\'")}')"
                                    class="w-full text-left px-4 py-3 rounded-2xl border text-sm font-extrabold flex items-center justify-between transition-all ${cls}">
                                    <span>${escapeHtml(opt)}</span>
                                    <span class="text-[11px] font-mono opacity-50">${i + 1}</span>
                                </button>`;
                        }).join('')}
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${uiState.hintStep > 0 && !uiState.answered ? `
                            <div class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                                Gợi ý: <span class="font-mono tracking-widest ml-1">${escapeHtml(window.SrsVocabEngine.buildTypingHint(q.exactAnswer, uiState.hintStep))}</span>
                            </div>` : ''}
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input id="va-srs-typing-input" type="text" autocomplete="off" ${uiState.answered ? 'disabled' : ''}
                                value="${escapeHtml(uiState.lastInput)}" placeholder="Nhập từ tiếng Anh..."
                                class="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-500 outline-none text-sm font-bold" />
                            ${!uiState.answered ? `
                                <div class="flex gap-2">
                                    <button type="button" onclick="window.vaSrsHint()" class="px-3.5 py-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold">Gợi ý</button>
                                    <button type="button" onclick="window.vaSrsSubmitTyping()" class="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-extrabold">Kiểm tra</button>
                                </div>` : ''}
                        </div>
                    </div>
                `}

                ${uiState.answered ? `
                    <div class="p-4 rounded-2xl border ${uiState.lastEval?.isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'} space-y-2.5">
                        <div class="text-sm font-extrabold ${uiState.lastEval?.isCorrect ? 'text-emerald-800' : 'text-rose-800'}">
                            ${uiState.lastEval?.isCorrect
                                ? `✅ Chính xác! Lên Hộp ${uiState.lastEval.newBox} (+${uiState.lastEval.xpGain} XP • Hẹn ôn sau ${uiState.lastEval.waitDays || 1} ngày)`
                                : `❌ Chưa đúng — Đáp án: "${escapeHtml(q.mode === 'meaning_quiz' ? q.vi : q.exactAnswer)}" (Về Hộp 1)`}
                        </div>
                        <div class="text-xs text-slate-700">
                            <strong>${escapeHtml(q.word)}</strong> <span class="font-mono text-slate-500">${escapeHtml(q.ipa)}</span> — ${escapeHtml(q.vi)}
                        </div>
                        <div class="flex justify-end pt-1">
                            <button type="button" onclick="window.vaSrsNext()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold">
                                ${uiState.idx + 1 >= uiState.queue.length ? 'Hoàn thành' : 'Thẻ tiếp theo'} <i class="fa-solid fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>` : ''}
            </div>
        `;

        if (q.mode === 'cloze_typing' && !uiState.answered) {
            document.getElementById('va-srs-typing-input')?.focus();
        }
    }

    window.vaSrsStart = startSrsSession;
    window.vaSrsExit = function () { uiState.inSession = false; renderSrsPanel(); };
    window.vaSrsPick = submitSrsAnswer;
    window.vaSrsSubmitTyping = function () {
        const inp = document.getElementById('va-srs-typing-input');
        if (inp && inp.value.trim()) submitSrsAnswer(inp.value);
    };
    window.vaSrsHint = function () {
        const q = uiState.queue[uiState.idx];
        if (!q || uiState.answered) return;
        uiState.hintStep = Math.min((q.exactAnswer || '').length, uiState.hintStep + 1);
        renderSrsPanel();
    };
    window.vaSrsNext = nextSrsCard;

    // Phím tắt 1–4 & Enter khi đang mở phiên ôn SRS
    document.addEventListener('keydown', (e) => {
        const view = document.getElementById('view-review');
        if (!view || view.classList.contains('hidden') || uiState.activeSubTab !== 'vocab_srs' || !uiState.inSession) return;

        if (e.key === 'Enter') {
            if (uiState.answered) { e.preventDefault(); nextSrsCard(); }
            else if (uiState.queue[uiState.idx]?.mode === 'cloze_typing') { e.preventDefault(); window.vaSrsSubmitTyping(); }
        } else if (!uiState.answered && uiState.queue[uiState.idx]?.mode !== 'cloze_typing' && ['1', '2', '3', '4'].includes(e.key)) {
            const opt = uiState.queue[uiState.idx]?.options?.[Number(e.key) - 1];
            if (opt) { e.preventDefault(); submitSrsAnswer(opt); }
        }
    });
})();
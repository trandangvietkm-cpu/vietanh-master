/**
 * CLOZE UI & CONTROLLER (js/cloze_ui.js)
 * Tầng Giao diện & Kết nối với hệ thống ViệtAnh Master
 */
(function () {
    const SESSION_SIZE = 10;

    const clozeState = {
        pool: [],
        level: 'ALL',     // 'ALL' | 'A1' | 'A2' | 'B1' | 'B2'
        mode: 'quiz',     // 'quiz' | 'typing'
        questions: [],
        idx: 0,
        answered: false,
        lastCorrect: false,
        lastUserAnswer: '',
        hintStep: 0,
        correctCount: 0,
        combo: 0,
        maxCombo: 0,
        sessionXP: 0,
        wrongList: [],
        isFinished: false
    };

    function ensureClozeViewContainer() {
        let el = document.getElementById('view-cloze');
        if (el) return el;
        const mainEl = document.querySelector('main');
        if (!mainEl) return null;

        el = document.createElement('section');
        el.id = 'view-cloze';
        el.className = 'hidden max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4';
        mainEl.appendChild(el);
        return el;
    }

    function ensurePoolReady() {
        if (clozeState.pool.length === 0 && window.ClozeEngine && window.VA_DICTIONARY_CORE) {
            clozeState.pool = window.ClozeEngine.buildClozePool(window.VA_DICTIONARY_CORE);
        }
        return clozeState.pool;
    }

    function startNewSession(customQuestions = null) {
        const pool = ensurePoolReady();
        clozeState.questions = Array.isArray(customQuestions) && customQuestions.length > 0
            ? customQuestions
            : window.ClozeEngine.generateSession(pool, { level: clozeState.level, count: SESSION_SIZE });

        clozeState.idx = 0;
        clozeState.answered = false;
        clozeState.lastCorrect = false;
        clozeState.lastUserAnswer = '';
        clozeState.hintStep = 0;
        clozeState.correctCount = 0;
        clozeState.combo = 0;
        clozeState.maxCombo = 0;
        clozeState.sessionXP = 0;
        clozeState.wrongList = [];
        clozeState.isFinished = false;
        renderClozeView();
    }

    function submitAnswer(userAnswer) {
        if (clozeState.answered || clozeState.isFinished) return;
        const q = clozeState.questions[clozeState.idx];
        if (!q) return;

        const isCorrect = window.ClozeEngine.checkAnswer(q, userAnswer);
        clozeState.answered = true;
        clozeState.lastCorrect = isCorrect;
        clozeState.lastUserAnswer = userAnswer;

        if (isCorrect) {
            clozeState.correctCount += 1;
            clozeState.combo += 1;
            clozeState.maxCombo = Math.max(clozeState.maxCombo, clozeState.combo);
            const gained = window.ClozeEngine.calculateXP({
                mode: clozeState.mode,
                isCorrect: true,
                combo: clozeState.combo,
                usedHint: clozeState.hintStep > 0
            });
            clozeState.sessionXP += gained;

            // Kết nối tầng lưu trữ chung của app (storage_manager.js)
            if (typeof addXP === 'function') addXP(gained);
            if (typeof recordDailyPracticeActivity === 'function') recordDailyPracticeActivity();
        } else {
            clozeState.combo = 0;
            if (!clozeState.wrongList.some(w => w.id === q.id)) {
                clozeState.wrongList.push(q);
            }
        }

        renderClozeView();
    }

    function nextClozeQuestion() {
        if (clozeState.idx + 1 >= clozeState.questions.length) {
            clozeState.isFinished = true;
        } else {
            clozeState.idx += 1;
            clozeState.answered = false;
            clozeState.lastCorrect = false;
            clozeState.lastUserAnswer = '';
            clozeState.hintStep = 0;
        }
        renderClozeView();
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderClozeView() {
        const container = ensureClozeViewContainer();
        if (!container) return;

        const pool = ensurePoolReady();
        if (pool.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                    <p class="text-base font-extrabold text-slate-800">Chưa tải được kho Từ điển 3K</p>
                    <p class="text-xs text-slate-500">Vui lòng kiểm tra file data/dictionary_core.js đã được nhúng trong index.html.</p>
                </div>`;
            return;
        }

        // Màn hình Tổng kết cuối lượt
        if (clozeState.isFinished) {
            const total = clozeState.questions.length || 1;
            const acc = Math.round((clozeState.correctCount / total) * 100);
            container.innerHTML = `
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs text-center space-y-5">
                    <div class="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <div>
                        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900">Hoàn thành lượt Điền từ!</h2>
                        <p class="text-xs sm:text-sm text-slate-500 mt-1">Bạn đã luyện ${total} câu ngữ cảnh thực tế từ Từ điển 3K</p>
                    </div>
                    <div class="grid grid-cols-3 gap-3 max-w-md mx-auto">
                        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <div class="text-lg font-extrabold text-emerald-600">${acc}%</div>
                            <div class="text-[11px] font-semibold text-slate-500">Chính xác</div>
                        </div>
                        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <div class="text-lg font-extrabold text-amber-500">+${clozeState.sessionXP}</div>
                            <div class="text-[11px] font-semibold text-slate-500">XP nhận được</div>
                        </div>
                        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <div class="text-lg font-extrabold text-orange-500">${clozeState.maxCombo}</div>
                            <div class="text-[11px] font-semibold text-slate-500">Combo cao nhất</div>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        ${clozeState.wrongList.length > 0 ? `
                            <button type="button" onclick="window.vaClozeRetryWrong()"
                                class="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-extrabold transition-all">
                                <i class="fa-solid fa-rotate-left mr-1.5"></i>Ôn lại ${clozeState.wrongList.length} câu sai
                            </button>` : ''}
                        <button type="button" onclick="window.vaClozeRestart()"
                            class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold transition-all">
                            <i class="fa-solid fa-play mr-1.5"></i>Luyện lượt mới (10 câu)
                        </button>
                    </div>
                </div>`;
            return;
        }

        const q = clozeState.questions[clozeState.idx];
        if (!q) return;

        const progressPct = Math.round(((clozeState.idx + (clozeState.answered ? 1 : 0)) / clozeState.questions.length) * 100);
        const safeFullSentence = q.fullSentence.replace(/'/g, "\\'");
        const safeWord = q.word.replace(/'/g, "\\'");
        const safeVi = q.vi.replace(/'/g, "\\'");

        // Render câu hỏi với chỗ trống nổi bật
        const blankDisplay = clozeState.answered
            ? `<span class="inline-block px-2.5 py-0.5 mx-1 rounded-lg font-extrabold ${clozeState.lastCorrect ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'}">${escapeHtml(q.answer)}</span>`
            : `<span class="inline-block min-w-[84px] px-3 py-0.5 mx-1 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/70 text-indigo-600 font-mono text-center">_____</span>`;
        const sentenceHTML = escapeHtml(q.sentence).replace('_____', blankDisplay);

        const levels = ['ALL', 'A1', 'A2', 'B1', 'B2'];

        container.innerHTML = `
            <!-- Thanh tiêu đề & Bộ lọc cấp độ / Chế độ -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-puzzle-piece text-indigo-600"></i>
                        <span>Điền từ theo ngữ cảnh</span>
                    </h2>
                    <p class="text-xs text-slate-500">Kho ${pool.length.toLocaleString('vi-VN')} câu ví dụ thực tế từ Từ điển 3K</p>
                </div>
                <div class="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                    <button type="button" onclick="window.vaClozeSetMode('quiz')"
                        class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${clozeState.mode === 'quiz' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}">
                        Trắc nghiệm
                    </button>
                    <button type="button" onclick="window.vaClozeSetMode('typing')"
                        class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${clozeState.mode === 'typing' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}">
                        Tự gõ từ
                    </button>
                </div>
            </div>

            <!-- Thanh lọc cấp độ + Tiến độ -->
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-1.5">
                    ${levels.map(lv => `
                        <button type="button" onclick="window.vaClozeSetLevel('${lv}')"
                            class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${clozeState.level === lv ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
                            ${lv === 'ALL' ? 'Tất cả' : lv}
                        </button>`).join('')}
                </div>
                <div class="flex items-center gap-3 text-xs font-extrabold">
                    <span class="text-slate-500">Câu ${clozeState.idx + 1}/${clozeState.questions.length}</span>
                    ${clozeState.combo >= 2 ? `<span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">🔥 Combo x${clozeState.combo}</span>` : ''}
                    <span class="text-amber-600">+${clozeState.sessionXP} XP</span>
                </div>
            </div>

            <div class="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                <div class="h-full bg-indigo-600 transition-all duration-300" style="width:${progressPct}%"></div>
            </div>

            <!-- Thẻ Câu hỏi chính -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">${q.level}</span>
                        <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">${escapeHtml(q.posLabel)}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="typeof speakText === 'function' && speakText('${safeFullSentence}', this, 0.95)"
                            class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all" title="Nghe cả câu">
                            <i class="fa-solid fa-volume-high mr-1"></i>Nghe câu
                        </button>
                        <button type="button" onclick="typeof speakText === 'function' && speakText('${safeFullSentence}', this, 0.72)"
                            class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 text-xs font-bold transition-all" title="Nghe chậm 0.75x">
                            0.75x
                        </button>
                    </div>
                </div>

                <div class="space-y-2.5 py-1">
                    <p class="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">${sentenceHTML}</p>
                    <p class="text-sm font-medium text-slate-500">“${escapeHtml(q.exampleVi)}”</p>
                </div>

                <!-- Khu vực Trả lời -->
                ${clozeState.mode === 'quiz' ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${q.options.map((opt, i) => {
                            const isAns = opt.toLowerCase() === q.answer.toLowerCase();
                            const isPicked = opt.toLowerCase() === clozeState.lastUserAnswer.toLowerCase();
                            let cls = 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-800 hover:border-indigo-300';
                            if (clozeState.answered) {
                                if (isAns) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300';
                                else if (isPicked) cls = 'bg-rose-50 border-rose-400 text-rose-700';
                                else cls = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                            }
                            return `
                                <button type="button" ${clozeState.answered ? 'disabled' : ''}
                                    onclick="window.vaClozePickOption('${opt.replace(/'/g, "\\'")}')"
                                    class="w-full text-left px-4 py-3 rounded-2xl border text-sm font-extrabold flex items-center justify-between transition-all ${cls}">
                                    <span>${escapeHtml(opt)}</span>
                                    <span class="text-[11px] font-mono opacity-60">${i + 1}</span>
                                </button>`;
                        }).join('')}
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${clozeState.hintStep > 0 && !clozeState.answered ? `
                            <div class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                                Gợi ý: <span class="font-mono tracking-widest ml-1">${escapeHtml(window.ClozeEngine.buildTypingHint(q.answer, clozeState.hintStep))}</span>
                            </div>` : ''}
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input id="va-cloze-typing-input" type="text" autocomplete="off"
                                ${clozeState.answered ? 'disabled' : ''}
                                value="${escapeHtml(clozeState.lastUserAnswer)}"
                                placeholder="Nhập từ còn thiếu vào đây..."
                                class="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold" />
                            ${!clozeState.answered ? `
                                <div class="flex gap-2">
                                    <button type="button" onclick="window.vaClozeHint()"
                                        class="px-3.5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-extrabold">
                                        <i class="fa-regular fa-lightbulb mr-1"></i>Gợi ý
                                    </button>
                                    <button type="button" onclick="window.vaClozeSubmitTyping()"
                                        class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold">
                                        Kiểm tra
                                    </button>
                                </div>` : ''}
                        </div>
                    </div>
                `}

                <!-- Phản hồi sau khi trả lời -->
                ${clozeState.answered ? `
                    <div class="p-4 rounded-2xl border ${clozeState.lastCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'} space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div class="text-sm font-extrabold ${clozeState.lastCorrect ? 'text-emerald-800' : 'text-rose-800'}">
                                ${clozeState.lastCorrect ? '✅ Chính xác!' : `❌ Chưa đúng — Đáp án là: "${escapeHtml(q.answer)}"`}
                            </div>
                            <button type="button" onclick="typeof saveWordToVocabBank === 'function' && saveWordToVocabBank('${safeWord}', '${safeVi}', this)"
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold transition-all">
                                <i class="fa-solid fa-bookmark"></i><span>Lưu từ "${escapeHtml(q.word)}"</span>
                            </button>
                        </div>
                        <div class="text-xs text-slate-700 flex flex-wrap items-center gap-2">
                            <span class="font-extrabold text-slate-900">${escapeHtml(q.word)}</span>
                            <span class="text-slate-500 font-mono">${escapeHtml(q.ipa)}</span>
                            <span>•</span>
                            <span>${escapeHtml(q.vi)}</span>
                        </div>
                        <div class="pt-1 flex justify-end">
                            <button type="button" onclick="window.vaClozeNext()"
                                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold transition-all">
                                ${clozeState.idx + 1 >= clozeState.questions.length ? 'Xem kết quả' : 'Câu tiếp theo'} <i class="fa-solid fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Tự focus ô gõ nếu đang ở chế độ Tự gõ
        if (clozeState.mode === 'typing' && !clozeState.answered) {
            const input = document.getElementById('va-cloze-typing-input');
            if (input) input.focus();
        }
    }

    // Các hàm public gắn vào window
    window.onEnterClozeTab = function () {
        ensureClozeViewContainer();
        if (clozeState.questions.length === 0) startNewSession();
        else renderClozeView();
    };
    window.vaClozeSetLevel = function (lv) {
        clozeState.level = lv;
        startNewSession();
    };
    window.vaClozeSetMode = function (mode) {
        clozeState.mode = mode === 'typing' ? 'typing' : 'quiz';
        renderClozeView();
    };
    window.vaClozePickOption = function (opt) { submitAnswer(opt); };
    window.vaClozeSubmitTyping = function () {
        const input = document.getElementById('va-cloze-typing-input');
        if (!input || !input.value.trim()) return;
        submitAnswer(input.value);
    };
    window.vaClozeHint = function () {
        const q = clozeState.questions[clozeState.idx];
        if (!q || clozeState.answered) return;
        clozeState.hintStep = Math.min((q.answer || '').length, clozeState.hintStep + 1);
        renderClozeView();
    };
    window.vaClozeNext = nextClozeQuestion;
    window.vaClozeRestart = function () { startNewSession(); };
    window.vaClozeRetryWrong = function () { startNewSession([...clozeState.wrongList]); };

    // Phím tắt 1–4 (trắc nghiệm) và Enter (kiểm tra / câu tiếp) khi đang mở tab Cloze
    document.addEventListener('keydown', (e) => {
        const view = document.getElementById('view-cloze');
        if (!view || view.classList.contains('hidden') || clozeState.isFinished) return;

        if (e.key === 'Enter') {
            if (clozeState.answered) {
                e.preventDefault();
                nextClozeQuestion();
            } else if (clozeState.mode === 'typing') {
                e.preventDefault();
                window.vaClozeSubmitTyping();
            }
        } else if (!clozeState.answered && clozeState.mode === 'quiz' && ['1', '2', '3', '4'].includes(e.key)) {
            const q = clozeState.questions[clozeState.idx];
            const opt = q?.options?.[Number(e.key) - 1];
            if (opt) {
                e.preventDefault();
                submitAnswer(opt);
            }
        }
    });
})();
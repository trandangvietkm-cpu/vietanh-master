/**
 * MODULE MINI-GAME: PHẢN XẠ TỪ VỰNG 60 GIÂY (js/vocab_quiz.js)
 * Khai thác kho 3.293 từ offline (window.VA_DICTIONARY_CORE) & Sổ tay cá nhân
 * - 3 chế độ chơi: Anh -> Việt | Việt -> Anh | Nghe loa -> Chọn từ
 * - Chọn nguồn: Trình độ A1, A2, B1, B2, Toàn bộ 3K hoặc Sổ tay của tôi
 * - Tính điểm Combo, lưu Kỷ lục cá nhân, cộng XP tự động & cho phép lưu nhanh các từ trả lời sai
 */

(function () {
    const GAME_DURATION = 60; // giây

    let quizState = {
        phase: 'setup', // 'setup' | 'playing' | 'result'
        level: 'A1',    // 'A1' | 'A2' | 'B1' | 'B2' | 'ALL' | 'NOTEBOOK'
        mode: 'en2vi',  // 'en2vi' | 'vi2en' | 'listen'
        timeLeft: GAME_DURATION,
        timerId: null,
        pool: [],
        currentQ: null,
        locked: false,
        score: 0,
        answered: 0,
        combo: 0,
        maxCombo: 0,
        wrongList: []
    };

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getBestScore() {
        return parseInt(localStorage.getItem('va_vocab_quiz_best') || '0', 10) || 0;
    }

    function saveBestScore(val) {
        const best = getBestScore();
        if (val > best) {
            localStorage.setItem('va_vocab_quiz_best', String(val));
            return true;
        }
        return false;
    }

    function getQuizPool(levelKey) {
        if (levelKey === 'NOTEBOOK') {
            try {
                const bank = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
                return bank
                    .filter(item => item && item.en && item.vi)
                    .map(item => ({
                        word: String(item.en).trim(),
                        vi: String(item.vi).trim(),
                        ipa: item.ipa || '',
                        pos: item.pos || '',
                        level: (item.level || 'A2').toUpperCase(),
                        example: item.exampleEn || ''
                    }));
            } catch (e) {
                return [];
            }
        }

        if (typeof window.VA_DICTIONARY_CORE !== 'object' || !window.VA_DICTIONARY_CORE) return [];
        const all = Object.entries(window.VA_DICTIONARY_CORE)
            .filter(([w, d]) => w && d && d.vi)
            .map(([w, d]) => ({
                word: w.trim(),
                vi: String(d.vi).trim(),
                ipa: d.ipa || '',
                pos: d.pos || '',
                level: (d.level || 'B1').toUpperCase(),
                example: d.example || ''
            }));

        if (levelKey === 'ALL') return all;
        return all.filter(item => item.level === levelKey);
    }

    function shuffleArray(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function stopQuizTimer() {
        if (quizState.timerId) {
            clearInterval(quizState.timerId);
            quizState.timerId = null;
        }
    }

    // ==================== MỞ / ĐÓNG MODAL GAME ====================
    window.openVocabQuizModal = function () {
        closeVocabQuizModal();
        quizState.phase = 'setup';
        quizState.locked = false;

        const modal = document.createElement('div');
        modal.id = 'va-vocab-quiz-modal';
        modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in';
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        renderQuizModal();
    };

    window.closeVocabQuizModal = function () {
        stopQuizTimer();
        const modal = document.getElementById('va-vocab-quiz-modal');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    };

    window.setVocabQuizLevel = function (lv) {
        quizState.level = lv;
        renderQuizModal();
    };

    window.setVocabQuizMode = function (mode) {
        quizState.mode = mode;
        renderQuizModal();
    };

    window.startVocabQuizGame = function () {
        const pool = getQuizPool(quizState.level);
        if (pool.length < 4) {
            if (typeof showToast === 'function') {
                showToast('Cần ít nhất 4 từ vựng để bắt đầu trò chơi. Hãy chọn trình độ khác hoặc lưu thêm từ!', 'warning');
            }
            return;
        }

        quizState.pool = pool;
        quizState.phase = 'playing';
        quizState.timeLeft = GAME_DURATION;
        quizState.score = 0;
        quizState.answered = 0;
        quizState.combo = 0;
        quizState.maxCombo = 0;
        quizState.wrongList = [];
        quizState.locked = false;

        nextQuizQuestion();

        stopQuizTimer();
        quizState.timerId = setInterval(() => {
            quizState.timeLeft -= 1;
            const timerEl = document.getElementById('vq-timer-text');
            const barEl = document.getElementById('vq-timer-bar');
            if (timerEl) timerEl.innerText = `${quizState.timeLeft}s`;
            if (barEl) {
                const pct = Math.max(0, (quizState.timeLeft / GAME_DURATION) * 100);
                barEl.style.width = `${pct}%`;
                if (quizState.timeLeft <= 10) {
                    barEl.className = 'h-full bg-rose-500 rounded-full transition-all duration-1000 linear';
                }
            }
            if (quizState.timeLeft <= 0) {
                finishVocabQuizGame();
            }
        }, 1000);
    };

    function nextQuizQuestion() {
        const pool = quizState.pool;
        const targetIdx = Math.floor(Math.random() * pool.length);
        const target = pool[targetIdx];

        // Lấy 3 đáp án nhiễu khác nghĩa và khác từ
        const distractors = [];
        const usedWords = new Set([target.word.toLowerCase()]);
        const usedVis = new Set([target.vi.toLowerCase()]);

        let attempts = 0;
        while (distractors.length < 3 && attempts < 80) {
            attempts++;
            const cand = pool[Math.floor(Math.random() * pool.length)];
            if (!usedWords.has(cand.word.toLowerCase()) && !usedVis.has(cand.vi.toLowerCase())) {
                usedWords.add(cand.word.toLowerCase());
                usedVis.add(cand.vi.toLowerCase());
                distractors.push(cand);
            }
        }

        const options = shuffleArray([target, ...distractors]);
        quizState.currentQ = { target, options };
        quizState.locked = false;

        renderQuizModal();

        if (quizState.mode === 'listen' && typeof speakText === 'function') {
            setTimeout(() => speakText(target.word, null, 0.9), 120);
        }
    }

    window.replayQuizAudio = function (btnEl) {
        if (quizState.currentQ && quizState.currentQ.target && typeof speakText === 'function') {
            speakText(quizState.currentQ.target.word, btnEl, 0.9);
        }
    };

    window.answerVocabQuiz = function (optIdx, btnEl) {
        if (quizState.locked || quizState.phase !== 'playing' || !quizState.currentQ) return;
        quizState.locked = true;
        quizState.answered += 1;

        const { target, options } = quizState.currentQ;
        const chosen = options[optIdx];
        const isCorrect = chosen && chosen.word.toLowerCase() === target.word.toLowerCase();

        const allBtns = document.querySelectorAll('#vq-options-grid button');
        allBtns.forEach((b, i) => {
            const opt = options[i];
            const isRightBtn = opt && opt.word.toLowerCase() === target.word.toLowerCase();
            if (isRightBtn) {
                b.className = 'w-full p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold text-sm sm:text-base text-left transition-all flex items-center justify-between gap-2';
            } else if (i === optIdx && !isCorrect) {
                b.className = 'w-full p-3.5 sm:p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-900 font-bold text-sm sm:text-base text-left transition-all flex items-center justify-between gap-2';
            } else {
                b.classList.add('opacity-50');
            }
        });

        if (isCorrect) {
            quizState.score += 1;
            quizState.combo += 1;
            if (quizState.combo > quizState.maxCombo) quizState.maxCombo = quizState.combo;
        } else {
            quizState.combo = 0;
            if (!quizState.wrongList.some(w => w.word.toLowerCase() === target.word.toLowerCase())) {
                quizState.wrongList.push(target);
            }
        }

        setTimeout(() => {
            if (quizState.phase === 'playing' && quizState.timeLeft > 0) {
                nextQuizQuestion();
            }
        }, isCorrect ? 380 : 750);
    };

    function finishVocabQuizGame() {
        stopQuizTimer();
        quizState.phase = 'result';

        const earnedXP = quizState.score + (quizState.score >= 10 ? 5 : 0);
        if (earnedXP > 0 && typeof addXP === 'function') {
            addXP(earnedXP);
        }

        const isNewRecord = saveBestScore(quizState.score);
        quizState.isNewRecord = isNewRecord;
        quizState.earnedXP = earnedXP;

        renderQuizModal();
    }

    window.saveQuizWrongWord = function (encodedWord, btnEl) {
        const word = decodeURIComponent(encodedWord || '').trim();
        const item = quizState.wrongList.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (!item) return;

        let list = [];
        try {
            list = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
        } catch (e) {}

        if (!list.some(v => String(v.en || '').toLowerCase() === word.toLowerCase())) {
            list.unshift({
                id: 'voc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                en: item.word,
                vi: item.vi,
                ipa: item.ipa || '',
                pos: item.pos || '',
                level: item.level || 'B1',
                emoji: '⚡',
                imageUrl: '',
                topic: 'Phản xạ 60s',
                exampleEn: item.example || '',
                exampleVi: '',
                mastered: false,
                foreverMastered: false,
                reviewStage: 0,
                nextReviewDue: null,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('va_vocab_bank', JSON.stringify(list));
            if (typeof window.updateNotebookBadge === 'function') window.updateNotebookBadge();
        }

        if (btnEl) {
            btnEl.className = 'px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs';
            btnEl.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Đã lưu';
            btnEl.onclick = null;
        }
    };

    // ==================== VẼ 3 MÀN HÌNH CỦA GAME ====================
    function renderQuizModal() {
        const modal = document.getElementById('va-vocab-quiz-modal');
        if (!modal) return;

        // 1. MÀN HÌNH CHỌN CHẾ ĐỘ
        if (quizState.phase === 'setup') {
            const best = getBestScore();
            const nbCount = getQuizPool('NOTEBOOK').length;
            const levels = [
                { id: 'A1', label: 'A1 (Cơ bản)' },
                { id: 'A2', label: 'A2 (Sơ cấp)' },
                { id: 'B1', label: 'B1 (Trung cấp)' },
                { id: 'B2', label: 'B2 (Khá giỏi)' },
                { id: 'ALL', label: 'Tất cả 3.000 từ' },
                { id: 'NOTEBOOK', label: `Sổ tay (${nbCount} từ)` }
            ];
            const modes = [
                { id: 'en2vi', icon: 'fa-language', title: 'Anh → Việt', desc: 'Nhìn từ tiếng Anh, chọn nghĩa' },
                { id: 'vi2en', icon: 'fa-arrows-rotate', title: 'Việt → Anh', desc: 'Nhìn nghĩa Việt, chọn từ Anh' },
                { id: 'listen', icon: 'fa-headphones', title: 'Nghe → Chọn từ', desc: 'Luyện phản xạ tai nghe' }
            ];

            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <span class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 text-lg">
                                <i class="fa-solid fa-bolt"></i>
                            </span>
                            <div>
                                <h3 class="font-extrabold text-base sm:text-lg leading-tight">Phản xạ từ vựng 60 giây</h3>
                                <p class="text-[11px] text-indigo-100">Kỷ lục hiện tại: <strong class="text-amber-300">${best} câu đúng</strong></p>
                            </div>
                        </div>
                        <button type="button" onclick="closeVocabQuizModal()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="p-5 sm:p-6 space-y-5">
                        <div class="space-y-2">
                            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500">1. Chọn nguồn từ vựng</label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                ${levels.map(lv => `
                                    <button type="button" onclick="setVocabQuizLevel('${lv.id}')" class="px-3 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${quizState.level === lv.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'}">
                                        ${lv.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500">2. Chọn chế độ chơi</label>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                ${modes.map(m => `
                                    <button type="button" onclick="setVocabQuizMode('${m.id}')" class="p-3 rounded-2xl border text-left transition-all ${quizState.mode === m.id ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-indigo-300'}">
                                        <i class="fa-solid ${m.icon} ${quizState.mode === m.id ? 'text-indigo-600' : 'text-slate-400'} text-sm mb-1.5"></i>
                                        <div class="text-xs font-extrabold text-slate-900">${m.title}</div>
                                        <div class="text-[11px] text-slate-500 mt-0.5 leading-snug">${m.desc}</div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <button type="button" onclick="startVocabQuizGame()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2">
                            <i class="fa-solid fa-play"></i>
                            <span>Bắt đầu ngay (60 giây)</span>
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // 2. MÀN HÌNH ĐANG CHƠI
        if (quizState.phase === 'playing' && quizState.currentQ) {
            const { target, options } = quizState.currentQ;
            const pct = Math.max(0, (quizState.timeLeft / GAME_DURATION) * 100);

            let promptHTML = '';
            if (quizState.mode === 'en2vi') {
                promptHTML = `
                    <div class="flex items-center justify-center gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${escHtml(target.level)}</span>
                        ${target.pos ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">${escHtml(target.pos)}</span>` : ''}
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-indigo-950">${escHtml(target.word)}</h2>
                    ${target.ipa ? `<p class="font-mono text-xs sm:text-sm text-indigo-500 mt-1">${escHtml(target.ipa)}</p>` : ''}
                    <button type="button" onclick="replayQuizAudio(this)" class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all">
                        <i class="fa-solid fa-volume-high"></i> Nghe phát âm
                    </button>
                `;
            } else if (quizState.mode === 'vi2en') {
                promptHTML = `
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chọn từ tiếng Anh đúng</span>
                    <h2 class="text-xl sm:text-2xl font-extrabold text-emerald-800 mt-1.5 leading-snug">${escHtml(target.vi)}</h2>
                `;
            } else {
                promptHTML = `
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nghe và chọn từ đúng</span>
                    <div class="mt-3">
                        <button type="button" onclick="replayQuizAudio(this)" class="w-16 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-2xl shadow-md inline-flex items-center justify-center transition-all active:scale-95">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-2">Bấm loa để nghe lại</p>
                `;
            }

            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
                    <!-- Thanh trạng thái -->
                    <div class="px-5 pt-4 pb-3 bg-slate-50 border-b border-slate-200/80 space-y-2.5">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                                    ✓ ${quizState.score} điểm
                                </span>
                                ${quizState.combo >= 2 ? `<span class="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-extrabold">🔥 Combo x${quizState.combo}</span>` : ''}
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span id="vq-timer-text" class="font-mono text-base font-extrabold ${quizState.timeLeft <= 10 ? 'text-rose-600' : 'text-indigo-700'}">${quizState.timeLeft}s</span>
                                <button type="button" onclick="closeVocabQuizModal()" class="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div id="vq-timer-bar" class="h-full ${quizState.timeLeft <= 10 ? 'bg-rose-500' : 'bg-indigo-600'} rounded-full transition-all duration-1000 linear" style="width: ${pct}%"></div>
                        </div>
                    </div>

                    <!-- Câu hỏi & 4 đáp án -->
                    <div class="p-5 sm:p-6 space-y-5">
                        <div class="text-center py-3 px-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                            ${promptHTML}
                        </div>

                        <div id="vq-options-grid" class="grid grid-cols-1 gap-2.5">
                            ${options.map((opt, idx) => {
                                const label = quizState.mode === 'en2vi' ? opt.vi : opt.word;
                                return `
                                    <button type="button" onclick="answerVocabQuiz(${idx}, this)" class="w-full p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 bg-white text-slate-800 font-bold text-sm sm:text-base text-left transition-all flex items-center justify-between gap-2 active:scale-[0.99]">
                                        <span>${escHtml(label)}</span>
                                        <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 text-xs font-extrabold flex items-center justify-center shrink-0">${String.fromCharCode(65 + idx)}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // 3. MÀN HÌNH KẾT QUẢ
        if (quizState.phase === 'result') {
            const acc = quizState.answered > 0 ? Math.round((quizState.score / quizState.answered) * 100) : 0;
            const wrongHTML = quizState.wrongList.length > 0 ? `
                <div class="space-y-2 text-left">
                    <p class="text-xs font-extrabold uppercase tracking-wider text-rose-500">Các từ bạn vừa nhầm (${quizState.wrongList.length})</p>
                    <div class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        ${quizState.wrongList.map(w => {
                            const safeJsWord = String(w.word || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                            return `
                            <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div class="min-w-0 flex items-center gap-1.5 flex-wrap">
                                    <span class="font-extrabold text-indigo-950">${escHtml(w.word)}</span>
                                    <button type="button"
                                        onclick="event.stopPropagation(); if (typeof speakText === 'function') speakText('${safeJsWord}', this, 0.95);"
                                        class="w-6 h-6 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 inline-flex items-center justify-center shrink-0 transition-all"
                                        title="Nghe phát âm từ này">
                                        <i class="fa-solid fa-volume-high text-[10px]"></i>
                                    </button>
                                    <span class="text-slate-400">•</span>
                                    <span class="font-semibold text-emerald-700">${escHtml(w.vi)}</span>
                                </div>
                                <button type="button" onclick="saveQuizWrongWord('${encodeURIComponent(w.word)}', this)" class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 font-bold text-xs shrink-0 transition-all">
                                    + Lưu
                                </button>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            ` : `<p class="text-xs font-bold text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-xl border border-emerald-200">🎯 Quá đỉnh! Bạn không trả lời sai từ nào!</p>`;

            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden text-center p-6 space-y-5">
                    <div class="space-y-1.5">
                        <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center text-2xl mx-auto">
                            <i class="fa-solid fa-trophy"></i>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900">Hết giờ!</h3>
                        ${quizState.isNewRecord ? `<span class="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold">🔥 Kỷ lục mới!</span>` : ''}
                    </div>

                    <div class="grid grid-cols-3 gap-2.5">
                        <div class="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <div class="text-xl font-extrabold text-indigo-700">${quizState.score}</div>
                            <div class="text-[11px] font-bold text-slate-500">Câu đúng</div>
                        </div>
                        <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div class="text-xl font-extrabold text-emerald-700">${acc}%</div>
                            <div class="text-[11px] font-bold text-slate-500">Chính xác</div>
                        </div>
                        <div class="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                            <div class="text-xl font-extrabold text-amber-700">+${quizState.earnedXP || 0}</div>
                            <div class="text-[11px] font-bold text-slate-500">XP nhận</div>
                        </div>
                    </div>

                    ${wrongHTML}

                    <div class="flex items-center gap-2.5 pt-1">
                        <button type="button" onclick="closeVocabQuizModal()" class="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-extrabold transition-all">
                            Đóng
                        </button>
                        <button type="button" onclick="openVocabQuizModal()" class="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all">
                            <i class="fa-solid fa-rotate-right mr-1"></i>Chơi lại
                        </button>
                    </div>
                </div>
            `;
        }
    }

   // ==================== KHỞI TẠO & GẮN HOOK ====================
    function initQuizHooks() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeVocabQuizModal();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initQuizHooks, 80));
    } else {
        setTimeout(initQuizHooks, 80);
    }
})();
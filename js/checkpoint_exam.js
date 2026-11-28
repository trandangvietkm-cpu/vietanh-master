/**
 * MODULE ĐỘC LẬP: PHÒNG SÁT HẠCH CUỐI CHẶNG (js/checkpoint_exam.js)
 * - Giao diện phòng thi riêng (#va-checkpoint-exam-root), không dùng chung thẻ luyện có gợi ý
 * - Trả lời liền mạch 10 câu (không gợi ý, không đáp án, không nghe mẫu)
 * - Chấm & hiển thị Bảng đánh giá tổng thể ở cuối bài + tự đẩy câu chưa đạt vào Hộp ôn tập
 * - Tích hợp nút "Chấm 10 câu bằng Gemini AI" trong 1 lượt gọi API duy nhất (tiết kiệm quota, chấm sát nghĩa tự nhiên)
 */
(function (global) {
    if (global.__VA_CHECKPOINT_EXAM_LOADED__) return;
    global.__VA_CHECKPOINT_EXAM_LOADED__ = true;

    const MAX_QUESTIONS = 10;

    let examState = {
        active: false,
        stageId: null,
        stageShortTitle: '',
        stageTitle: '',
        questions: [],
        answers: [],
        currentIndex: 0,
        finished: false,
        aiGrading: false,
        aiGraded: false,
        aiOverallFeedback: '',
        sessionAddedReviewIds: []
    };

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

    function shuffle(arr) {
        const list = [...arr];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function getStageMeta(stageId) {
        if (typeof global.getStageInfoById === 'function') {
            return global.getStageInfoById(stageId);
        }
        return { id: stageId, shortTitle: 'Chặng', title: 'Ôn trộn cuối Chặng' };
    }

    function buildQuestionPool(stageId) {
        const allStructs = (typeof SENTENCE_STRUCTURES !== 'undefined' && Array.isArray(SENTENCE_STRUCTURES))
            ? SENTENCE_STRUCTURES
            : (Array.isArray(global.SENTENCE_STRUCTURES) ? global.SENTENCE_STRUCTURES : []);
        const stageStructs = allStructs.filter(st => st && st.stageId === stageId);
        if (stageStructs.length === 0) return [];

        const pool = [];
        const perStruct = stageStructs.length === 1 ? MAX_QUESTIONS : Math.max(2, Math.ceil(MAX_QUESTIONS / stageStructs.length));

        stageStructs.forEach(st => {
            const picked = shuffle(st.situations || []).slice(0, perStruct);
            picked.forEach(sit => {
                pool.push({
                    ...sit,
                    sourceStructId: st.id,
                    sourceStructShortName: st.shortName || st.title || 'Cấu trúc',
                    sourceStageId: stageId
                });
            });
        });

        return shuffle(pool).slice(0, MAX_QUESTIONS);
    }

    function evaluateAnswerOffline(question, rawAnswer) {
        const cleanUser = String(rawAnswer || '').trim();
        const sampleEn = question.sampleCasual || question.sampleFormal || '';

        if (!cleanUser) {
            return {
                passed: false,
                skipped: true,
                score: 0,
                userAnswer: '',
                sampleEn,
                vi: question.vi || '',
                structName: question.sourceStructShortName || 'Cấu trúc',
                feedbackVi: 'Bạn đã bỏ qua câu này.',
                gradedByAI: false
            };
        }

        if (typeof global.evaluateTranslationStrict === 'function') {
            try {
                const res = global.evaluateTranslationStrict(cleanUser, question);
                if (res && typeof res.score === 'number') {
                    const score = Math.max(0, Math.min(10, Math.round(Number(res.score) * 10) / 10));
                    return {
                        passed: score >= 7.0,
                        skipped: false,
                        score,
                        userAnswer: cleanUser,
                        sampleEn,
                        vi: question.vi || '',
                        structName: question.sourceStructShortName || 'Cấu trúc',
                        feedbackVi: res.feedback || res.explanation || (score >= 7.0 ? 'Đạt chuẩn cấu trúc & ý nghĩa.' : 'Cần rà lại từ vựng hoặc cấu trúc câu.'),
                        gradedByAI: false
                    };
                }
            } catch (e) {}
        }

        // Chấm dự phòng offline theo từ khóa chính
        const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'have', 'has', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'your', 'you', 'from', 'into', 'about']);
        const targetWords = sampleEn
            .toLowerCase()
            .replace(/[^a-z0-9'\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 2 && !stopWords.has(w));

        const userWords = new Set(
            cleanUser.toLowerCase()
                .replace(/[^a-z0-9'\s]/g, ' ')
                .split(/\s+/)
                .filter(Boolean)
        );

        const matched = targetWords.filter(w => userWords.has(w)).length;
        const ratio = targetWords.length > 0 ? (matched / targetWords.length) : 0.5;
        const score = Math.max(2, Math.min(10, Math.round(ratio * 10 * 10) / 10));

        return {
            passed: score >= 7.0,
            skipped: false,
            score,
            userAnswer: cleanUser,
            sampleEn,
            vi: question.vi || '',
            structName: question.sourceStructShortName || 'Cấu trúc',
            feedbackVi: score >= 7.0 ? 'Khớp từ khóa và ý nghĩa cơ bản.' : 'Còn thiếu từ khóa chính hoặc lệch cấu trúc mẫu.',
            gradedByAI: false
        };
    }

    function ensureRootContainer() {
        let root = document.getElementById('va-checkpoint-exam-root');
        if (!root) {
            const parent = document.getElementById('view-practice') || document.querySelector('main') || document.body;
            root = document.createElement('div');
            root.id = 'va-checkpoint-exam-root';
            root.className = 'hidden space-y-5';
            parent.prepend(root);
        }
        return root;
    }

    function togglePracticeStandardViews(hideStandard) {
        const ids = [
            'practice-mode-switcher-bar',
            'structure-mode-container',
            'topic-mode-container',
            'shared-exercise-card',
            'result-panel',
            'ws-dictation-panel',
            'ws-audiodrill-panel'
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (hideStandard) el.classList.add('hidden');
        });
    }

    function syncFailedToReviewBox(results) {
        try {
            let reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
            let changed = false;

            results.forEach((r, idx) => {
                const q = examState.questions[idx];
                if (!q || !q.id) return;
                const qIdStr = String(q.id);

                if (!r.passed) {
                    const exists = reviewBox.some(item => String(item.situationId) === qIdStr);
                    if (!exists) {
                        const due = new Date();
                        due.setDate(due.getDate() + 2);
                        reviewBox.push({
                            structId: q.sourceStructId || '',
                            situationId: q.id,
                            vi: r.vi,
                            score: r.score || 0,
                            userTranslation: r.userAnswer || '',
                            addedAt: new Date().toISOString(),
                            nextReviewDue: due.toISOString()
                        });
                        if (!examState.sessionAddedReviewIds.includes(qIdStr)) {
                            examState.sessionAddedReviewIds.push(qIdStr);
                        }
                        changed = true;
                    }
                } else if (examState.sessionAddedReviewIds.includes(qIdStr)) {
                    // Nếu AI chấm lại thấy Đạt -> gỡ khỏi Hộp ôn tập (chỉ gỡ câu vừa thêm trong phiên này)
                    const beforeLen = reviewBox.length;
                    reviewBox = reviewBox.filter(item => String(item.situationId) !== qIdStr);
                    if (reviewBox.length !== beforeLen) changed = true;
                }
            });

            if (changed) {
                localStorage.setItem('va_review_box', JSON.stringify(reviewBox));
                if (typeof global.updateReviewBadgeCount === 'function') {
                    global.updateReviewBadgeCount();
                }
            }
        } catch (e) {}
    }

    function getGeminiConfig() {
        const appState = (typeof state !== 'undefined') ? state : global.state;
        const apiKey = (
            localStorage.getItem('va_gemini_api_key') ||
            (appState && appState.geminiApiKey) ||
            ''
        ).trim();
        const model = (
            localStorage.getItem('va_gemini_model') ||
            (appState && appState.geminiModel) ||
            'gemini-flash-lite-latest'
        ).trim();
        return { apiKey, model };
    }

    function parseJsonFromGeminiText(rawText) {
        const cleaned = String(rawText || '')
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
            }
            throw e;
        }
    }

    async function gradeAllWithGeminiAI() {
        if (!examState.finished || examState.aiGrading) return;

        const { apiKey, model } = getGeminiConfig();
        if (!apiKey) {
            if (typeof global.showToast === 'function') {
                global.showToast('Vui lòng nhập Gemini API Key (góc trên bên phải) để chấm bài bằng AI!', 'warning');
            }
            if (typeof global.openGeminiModal === 'function') global.openGeminiModal();
            else if (typeof global.toggleApiModal === 'function') global.toggleApiModal(true);
            return;
        }

        examState.aiGrading = true;
        renderExamSummary();

        try {
            const payloadItems = examState.questions.map((q, idx) => {
                const ans = examState.answers[idx] || evaluateAnswerOffline(q, '');
                return {
                    index: idx,
                    vi: q.vi || '',
                    sampleEn: q.sampleCasual || q.sampleFormal || '',
                    userAnswer: ans.skipped ? '' : (ans.userAnswer || '')
                };
            });

            const prompt = [
                'Bạn là giáo viên tiếng Anh thân thiện, chấm bài kiểm tra dịch Việt -> Anh cho học viên Việt Nam (trình độ A1-B1).',
                'Hãy chấm toàn bộ danh sách câu dưới đây trong 1 lượt duy nhất và trả về JSON thuần đúng cấu trúc.',
                'Quy tắc chấm:',
                '1. Nếu userAnswer rỗng -> score = 0, passed = false, feedbackVi = "Bạn đã bỏ qua câu này."',
                '2. Chấp nhận mọi cách dịch tự nhiên, đúng ngữ pháp và sát nghĩa tiếng Việt (ví dụ "He is a doctor." cho "Nghề nghiệp của anh ấy là bác sĩ." vẫn đạt 9-10 điểm, không trừ điểm chỉ vì khác từ ngữ so với sampleEn).',
                '3. Nếu sai chính tả nhẹ hoặc thiếu mạo từ/chia động từ nhỏ -> chấm 6-8 điểm tùy mức độ và chỉ rõ chỗ cần sửa.',
                '4. passed = true khi score >= 7.0.',
                '5. feedbackVi viết ngắn gọn 1-2 câu tiếng Việt dễ hiểu, thực tế.',
                '6. overallFeedback viết 2-3 câu tiếng Việt tổng kết năng lực chặng này, khích lệ và nêu 1-2 điểm cần ôn.',
                '',
                'Định dạng JSON bắt buộc:',
                '{"overallFeedback":"...","items":[{"index":0,"score":9.5,"passed":true,"feedbackVi":"..."}]}',
                '',
                'Danh sách câu cần chấm:',
                JSON.stringify(payloadItems)
            ].join('\n');

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const response = await fetch(endpoint, {
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

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status}: ${errText.slice(0, 160)}`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = parseJsonFromGeminiText(rawText);

            if (!parsed || !Array.isArray(parsed.items)) {
                throw new Error('Phản hồi AI không đúng định dạng danh sách câu.');
            }

            parsed.items.forEach(item => {
                const idx = Number(item.index);
                if (!Number.isInteger(idx) || idx < 0 || idx >= examState.questions.length) return;
                const q = examState.questions[idx];
                const prev = examState.answers[idx] || evaluateAnswerOffline(q, '');
                const isSkipped = prev.skipped || !String(prev.userAnswer || '').trim();
                const score = isSkipped ? 0 : Math.max(0, Math.min(10, Math.round(Number(item.score || 0) * 10) / 10));
                const passed = isSkipped ? false : (typeof item.passed === 'boolean' ? item.passed : score >= 7.0);

                examState.answers[idx] = {
                    ...prev,
                    score,
                    passed,
                    skipped: isSkipped,
                    feedbackVi: isSkipped
                        ? 'Bạn đã bỏ qua câu này.'
                        : (String(item.feedbackVi || '').trim() || prev.feedbackVi),
                    gradedByAI: true
                };
            });

            examState.aiGraded = true;
            examState.aiOverallFeedback = String(parsed.overallFeedback || '').trim();
            syncFailedToReviewBox(examState.answers);

            if (typeof global.showToast === 'function') {
                global.showToast('✨ Gemini AI đã chấm xong toàn bộ 10 câu trong 1 lượt gọi!', 'success');
            }
        } catch (err) {
            console.error('[Checkpoint AI Grade Error]', err);
            if (typeof global.showToast === 'function') {
                global.showToast('Không thể chấm bằng Gemini AI lúc này. Kiểm tra lại API Key hoặc kết nối mạng nhé!', 'warning');
            }
        } finally {
            examState.aiGrading = false;
            renderExamSummary();
        }
    }

    function renderExamQuestion() {
        const root = ensureRootContainer();
        const total = examState.questions.length;
        const idx = examState.currentIndex;
        const q = examState.questions[idx];
        if (!q) return;

        const pct = Math.round(((idx + 1) / total) * 100);
        const isLast = idx + 1 >= total;
        const nextBtnLabel = isLast ? 'Nộp bài & Xem đánh giá' : 'Lưu & Sang câu tiếp';
        const answeredCount = examState.answers.filter(a => a !== null).length;

        root.innerHTML = `
            <!-- Banner đầu phòng sát hạch -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-4 sm:p-5 text-white shadow-sm space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-trophy text-amber-100 text-lg"></i>
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-base sm:text-lg font-extrabold truncate">Sát hạch cuối ${esc(examState.stageShortTitle)} (${total} câu)</h2>
                            <p class="text-xs text-amber-50/95 truncate">${esc(examState.stageTitle)} • Không gợi ý, đánh giá tổng thể cuối bài</p>
                        </div>
                    </div>
                    <button type="button" onclick="window.VA_CHECKPOINT_EXAM.exitToRoadmap()"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Sơ đồ học</span>
                    </button>
                </div>

                <!-- Thanh tiến độ -->
                <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px] font-bold text-amber-50">
                        <span>Câu ${idx + 1} / ${total}</span>
                        <span>Đã đi qua: ${answeredCount}/${total}</span>
                    </div>
                    <div class="w-full h-2 bg-white/25 rounded-full overflow-hidden">
                        <div class="h-full bg-white rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                    </div>
                </div>
            </div>

            <!-- Khung đề & ô trả lời sạch tuyệt đối -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-6">
                <div class="text-center space-y-2 py-2">
                    <span class="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
                        Câu ${idx + 1} / ${total} • Phản xạ tự do
                    </span>
                    <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug max-w-2xl mx-auto">
                        "${esc(q.vi)}"
                    </h3>
                </div>

                <div class="space-y-2">
                    <textarea id="va-cp-answer-input" rows="3"
                        class="w-full rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 p-4 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                        placeholder="Nhập câu tiếng Anh của bạn tại đây (Enter để lưu & sang câu tiếp)..."></textarea>
                    <p class="text-[11px] text-slate-400 text-right">Nhấn <strong>Enter</strong> để chuyển nhanh sang câu tiếp theo</p>
                </div>

                <!-- Chỉ đúng 2 nút hành động -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onclick="window.VA_CHECKPOINT_EXAM.skipCurrent()"
                        class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 text-xs sm:text-sm font-extrabold transition-all cursor-pointer">
                        <i class="fa-solid fa-forward-step mr-1.5"></i>Bỏ qua / Chưa biết
                    </button>

                    <button type="button" onclick="window.VA_CHECKPOINT_EXAM.submitCurrent()"
                        class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer">
                        <span>${nextBtnLabel}</span>
                        <i class="fa-solid ${isLast ? 'fa-flag-checkered' : 'fa-arrow-right'} ml-1.5"></i>
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const textarea = document.getElementById('va-cp-answer-input');
            if (textarea) {
                textarea.focus();
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitCurrent();
                    }
                });
            }
        }, 30);
    }

    function renderExamSummary() {
        const root = ensureRootContainer();
        const results = examState.questions.map((q, idx) => examState.answers[idx] || evaluateAnswerOffline(q, ''));
        examState.answers = results;
        syncFailedToReviewBox(results);

        const total = results.length;
        const passedCount = results.filter(r => r.passed).length;
        const skippedCount = results.filter(r => r.skipped).length;
        const failedCount = total - passedCount - skippedCount;
        const avgScore = total > 0
            ? Math.round((results.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / total) * 10) / 10
            : 0;

        const aiActionHtml = examState.aiGrading
            ? `<button type="button" disabled class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs sm:text-sm font-extrabold opacity-80 cursor-wait">
                   <i class="fa-solid fa-spinner fa-spin"></i>
                   <span>Đang chấm ${total} câu bằng Gemini AI...</span>
               </button>`
            : (examState.aiGraded
                ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold">
                       <i class="fa-solid fa-wand-magic-sparkles"></i>
                       <span>Đã chấm sát nghĩa bằng Gemini AI (1 lượt)</span>
                   </span>`
                : `<button type="button" onclick="window.VA_CHECKPOINT_EXAM.gradeAllWithGeminiAI()"
                       class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer">
                       <i class="fa-solid fa-wand-magic-sparkles"></i>
                       <span>Chấm ${total} câu bằng Gemini AI (1 lượt)</span>
                   </button>`);

        const aiOverallBoxHtml = examState.aiOverallFeedback
            ? `<div class="bg-purple-50/80 border border-purple-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3">
                   <div class="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                       <i class="fa-solid fa-wand-magic-sparkles text-sm"></i>
                   </div>
                   <div class="space-y-1">
                       <div class="text-xs font-extrabold uppercase tracking-wider text-purple-700">Nhận xét tổng thể từ Gemini AI</div>
                       <p class="text-xs sm:text-sm text-slate-800 leading-relaxed">${esc(examState.aiOverallFeedback)}</p>
                   </div>
               </div>`
            : '';

        const rowsHtml = results.map((r, idx) => {
            let badge = '';
            let cls = 'border-slate-200 bg-white';
            if (r.passed) {
                badge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">Đạt • ${r.score}/10</span>`;
                cls = 'border-emerald-200 bg-emerald-50/35';
            } else if (r.skipped) {
                badge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">Bỏ qua</span>`;
                cls = 'border-amber-200 bg-amber-50/35';
            } else {
                badge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800">Cần ôn • ${r.score}/10</span>`;
                cls = 'border-rose-200 bg-rose-50/35';
            }

            const aiTag = r.gradedByAI
                ? `<span class="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">AI</span>`
                : '';

            return `
                <div class="p-4 rounded-2xl border ${cls} space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="text-xs sm:text-sm font-extrabold text-slate-900">Câu ${idx + 1}: "${esc(r.vi)}"</span>
                        <div class="flex items-center">${badge}${aiTag}</div>
                    </div>
                    <p class="text-xs sm:text-sm text-slate-700">
                        <span class="font-bold text-slate-500">Bạn trả lời:</span>
                        ${r.skipped ? '<em class="text-slate-400">Chưa trả lời</em>' : `<span class="font-semibold">${esc(r.userAnswer)}</span>`}
                    </p>
                    <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/80">
                        <p class="text-xs sm:text-sm text-indigo-700 font-bold">
                            <span class="text-slate-500 font-semibold">Mẫu chuẩn:</span> ${esc(r.sampleEn)}
                        </p>
                        <button type="button" onclick="if(typeof speakText==='function') speakText('${safeJsStr(r.sampleEn)}', this, 0.9)"
                            class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer" title="Nghe câu chuẩn">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </button>
                    </div>
                    <p class="text-xs ${r.gradedByAI ? 'text-slate-700 font-medium' : 'text-slate-500'}">${esc(r.feedbackVi)}</p>
                </div>
            `;
        }).join('');

        root.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-900 to-blue-800 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span class="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">Đánh giá tổng thể cuối chặng</span>
                    <h2 class="text-lg sm:text-xl font-extrabold mt-0.5">${esc(examState.stageTitle)}</h2>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="window.VA_CHECKPOINT_EXAM.retry()"
                        class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer">
                        <i class="fa-solid fa-rotate-right mr-1"></i>Làm lại
                    </button>
                    <button type="button" onclick="window.VA_CHECKPOINT_EXAM.exitToRoadmap()"
                        class="px-4 py-2 rounded-xl bg-white text-indigo-800 hover:bg-indigo-50 text-xs sm:text-sm font-extrabold transition-all cursor-pointer">
                        Về Sơ đồ học <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div class="bg-white p-4 rounded-2xl border border-indigo-200 shadow-2xs">
                    <div class="text-2xl font-extrabold text-indigo-700">${avgScore}/10</div>
                    <div class="text-xs font-semibold text-slate-500 mt-0.5">Điểm trung bình</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                    <div class="text-2xl font-extrabold text-emerald-600">${passedCount}/${total}</div>
                    <div class="text-xs font-semibold text-slate-500 mt-0.5">Câu đạt chuẩn</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
                    <div class="text-2xl font-extrabold text-rose-600">${failedCount}</div>
                    <div class="text-xs font-semibold text-slate-500 mt-0.5">Câu cần sửa</div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
                    <div class="text-2xl font-extrabold text-amber-600">${skippedCount}</div>
                    <div class="text-xs font-semibold text-slate-500 mt-0.5">Câu bỏ qua</div>
                </div>
            </div>

            <!-- Thanh nâng cấp chấm sát nghĩa bằng Gemini AI trong 1 lượt gọi -->
            <div class="bg-white rounded-3xl border border-purple-200/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div class="space-y-0.5">
                    <div class="text-xs sm:text-sm font-extrabold text-slate-900">Muốn chấm linh hoạt các cách diễn đạt tương đương?</div>
                    <p class="text-xs text-slate-500">Gửi cả ${total} câu trong 1 lượt gọi Gemini AI duy nhất để tiết kiệm quota và nhận xét tự nhiên hơn.</p>
                </div>
                ${aiActionHtml}
            </div>

            ${aiOverallBoxHtml}

            <div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm sm:text-base font-extrabold text-slate-900">Chi tiết từng câu (${total} câu)</h3>
                    <span class="text-xs text-slate-500">Các câu chưa đạt đã được tự động đồng bộ với Hộp ôn tập</span>
                </div>
                <div class="space-y-2.5">${rowsHtml}</div>
            </div>
        `;
    }

    function advanceOrFinish() {
        if (examState.currentIndex + 1 < examState.questions.length) {
            examState.currentIndex += 1;
            renderExamQuestion();
        } else {
            examState.finished = true;
            renderExamSummary();
        }
    }

    function submitCurrent() {
        if (!examState.active || examState.finished) return;
        const input = document.getElementById('va-cp-answer-input');
        const q = examState.questions[examState.currentIndex];
        examState.answers[examState.currentIndex] = evaluateAnswerOffline(q, input ? input.value : '');
        advanceOrFinish();
    }

    function skipCurrent() {
        if (!examState.active || examState.finished) return;
        const q = examState.questions[examState.currentIndex];
        examState.answers[examState.currentIndex] = evaluateAnswerOffline(q, '');
        advanceOrFinish();
    }

    function start(stageId) {
        const questions = buildQuestionPool(stageId);
        if (questions.length === 0) {
            if (typeof global.showToast === 'function') {
                global.showToast('Chặng này chưa có câu hỏi nào để sát hạch!', 'warning');
            }
            return;
        }

        if (typeof global.stopAudioDrillSession === 'function') global.stopAudioDrillSession(false);
        if (typeof global.stopAllPlayback === 'function') global.stopAllPlayback();

        const meta = getStageMeta(stageId);
        examState = {
            active: true,
            stageId,
            stageShortTitle: meta.shortTitle || 'Chặng',
            stageTitle: meta.title || 'Ôn trộn cuối Chặng',
            questions,
            answers: new Array(questions.length).fill(null),
            currentIndex: 0,
            finished: false,
            aiGrading: false,
            aiGraded: false,
            aiOverallFeedback: '',
            sessionAddedReviewIds: []
        };

        if (typeof global.switchTab === 'function') global.switchTab('practice');
        togglePracticeStandardViews(true);

        const root = ensureRootContainer();
        root.classList.remove('hidden');
        renderExamQuestion();
    }

    function exitToRoadmap() {
        examState.active = false;
        examState.finished = false;
        const root = document.getElementById('va-checkpoint-exam-root');
        if (root) root.classList.add('hidden');

        const switcher = document.getElementById('practice-mode-switcher-bar');
        if (switcher) switcher.classList.remove('hidden');

        const appState = (typeof state !== 'undefined') ? state : global.state;
        if (appState) {
            appState.activeCheckpointStageId = null;
            appState.selectedStructureId = null;
            appState.structViewMode = 'roadmap';
        }
        if (typeof global.switchPracticeMode === 'function') {
            global.switchPracticeMode('structure');
        }
    }

    function retry() {
        if (examState.stageId) start(examState.stageId);
    }

    // Ghi đè điểm vào cũ để nút "Ôn trộn cuối Chặng" trên Sơ đồ học mở thẳng phòng thi độc lập
    global.startStageCheckpointReview = start;
    global.exitStageCheckpointToRoadmap = exitToRoadmap;

    // Nếu người dùng bấm chuyển sang tab khác khi đang mở phòng thi -> tự đóng phòng thi cho sạch
    const origSwitchTab = global.switchTab;
    if (typeof origSwitchTab === 'function') {
        global.switchTab = function (tab) {
            if (tab !== 'practice' && examState.active) {
                examState.active = false;
                const root = document.getElementById('va-checkpoint-exam-root');
                if (root) root.classList.add('hidden');
                const switcher = document.getElementById('practice-mode-switcher-bar');
                if (switcher) switcher.classList.remove('hidden');
            }
            return origSwitchTab.apply(this, arguments);
        };
    }

    global.VA_CHECKPOINT_EXAM = {
        start,
        exitToRoadmap,
        retry,
        submitCurrent,
        skipCurrent,
        gradeAllWithGeminiAI
    };
})(window);

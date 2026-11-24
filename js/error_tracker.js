/**
 * MODULE SỔ LỖI SAI CÁ NHÂN HÓA (js/error_tracker.js)
 * Kiến trúc độc lập (Single Responsibility), sẵn sàng chuyển đổi sang Database:
 *  - ErrorTrackerService: Quản lý đọc/ghi `va_error_logs` (tối đa 400 bản ghi gần nhất).
 *  - Bộ phân loại 7 nhóm lỗi kinh điển Offline (dựa trên wordDiff & syntaxCheck của ai_evaluator.js).
 *  - Hỗ trợ nhận nhãn bổ sung từ Gemini AI (`result.errorTags`) & tự gỡ vết lỗi nếu AI phúc khảo Đạt.
 *  - Tự động render khối "Top lỗi hay gặp" + Bộ lọc theo nhóm lỗi ngay trên đầu trang Hộp ôn tập (#view-review).
 */

(function () {
    const STORAGE_KEY = 'va_error_logs';
    const MAX_LOGS = 400;

    // 7 nhóm lỗi chuẩn hóa (khớp sẵn để lưu DB sau này)
    const ERROR_META = {
        article: {
            label: 'Quên / nhầm mạo từ',
            short: 'Mạo từ (a/an/the)',
            badgeCls: 'bg-sky-50 text-sky-700 border-sky-200',
            barCls: 'bg-sky-500'
        },
        plural_s: {
            label: 'Thiếu / thừa s/es',
            short: 'Số nhiều / s-es',
            badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
            barCls: 'bg-violet-500'
        },
        to_be: {
            label: 'Nhầm động từ To be',
            short: 'To be (am/is/are)',
            badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
            barCls: 'bg-rose-500'
        },
        preposition: {
            label: 'Nhầm / thiếu giới từ',
            short: 'Giới từ (in/on/at...)',
            badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
            barCls: 'bg-amber-500'
        },
        word_order: {
            label: 'Sai trật tự từ',
            short: 'Trật tự từ',
            badgeCls: 'bg-orange-50 text-orange-800 border-orange-200',
            barCls: 'bg-orange-500'
        },
        spelling: {
            label: 'Gõ nhầm chính tả',
            short: 'Chính tả',
            badgeCls: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            barCls: 'bg-yellow-500'
        },
        structure: {
            label: 'Sai cấu trúc / Đảo ngữ',
            short: 'Cấu trúc / Ngữ pháp',
            badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            barCls: 'bg-indigo-500'
        }
    };

    const ARTICLES = new Set(['a', 'an', 'the']);
    const TO_BE_SET = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);
    const PREPOSITIONS = new Set([
        'in', 'on', 'at', 'to', 'for', 'with', 'of', 'from', 'by', 'about',
        'into', 'over', 'under', 'after', 'before', 'between', 'during', 'through', 'without'
    ]);

    let activeErrorTagFilter = 'all'; // 'all' | key trong ERROR_META
    let reviewViewMode = 'queue';     // 'queue' (Hộp ôn tập) | 'history' (Lịch sử lỗi gần đây)

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function cleanWord(w) {
        return String(w || '').toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
    }

    // ==================== 1. LỚP DỊCH VỤ LƯU TRỮ (SẴN SÀNG LÊN DATABASE) ====================
    const ErrorTrackerService = {
        getAll() {
            try {
                const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
                return Array.isArray(raw) ? raw : [];
            } catch (e) {
                return [];
            }
        },

        saveAll(logs) {
            try {
                const trimmed = Array.isArray(logs) ? logs.slice(0, MAX_LOGS) : [];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            } catch (e) {}
        },

        addLog(entry) {
            const logs = this.getAll();
            logs.unshift(entry);
            this.saveAll(logs);
            return entry;
        },

        // Nếu Gemini AI phúc khảo nâng từ Chưa đạt -> Đạt, gỡ vết lỗi vừa ghi ở lượt này
        removeLatestForQuestion(questionId, withinMs = 120000) {
            if (!questionId) return false;
            const logs = this.getAll();
            const now = Date.now();
            const idx = logs.findIndex(item =>
                item &&
                String(item.questionId) === String(questionId) &&
                (now - new Date(item.createdAt).getTime()) <= withinMs
            );
            if (idx !== -1) {
                logs.splice(idx, 1);
                this.saveAll(logs);
                return true;
            }
            return false;
        },

        clearAll() {
            this.saveAll([]);
        },

        getStats() {
            const logs = this.getAll();
            const counts = {};
            Object.keys(ERROR_META).forEach(k => { counts[k] = 0; });

            logs.forEach(log => {
                (log.errorTags || []).forEach(tag => {
                    if (counts[tag] !== undefined) counts[tag] += 1;
                });
            });

            const ranked = Object.entries(counts)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => ({ tag, count, meta: ERROR_META[tag] }));

            return { totalLogs: logs.length, counts, ranked };
        },

        getLatestByQuestionId(questionId) {
            if (!questionId) return null;
            const logs = this.getAll();
            return logs.find(item => item && String(item.questionId) === String(questionId)) || null;
        }
    };

    window.ErrorTrackerService = ErrorTrackerService;
    window.VA_ERROR_META = ERROR_META;

    // ==================== 2. BỘ PHÂN LOẠI LỖI 2 TẦNG (OFFLINE + AI) ====================
    function isPluralOrThirdPersonPair(w1, w2) {
        if (!w1 || !w2 || w1 === w2) return false;
        const a = w1.length <= w2.length ? w1 : w2;
        const b = w1.length <= w2.length ? w2 : w1;
        if (b === a + 's' || b === a + 'es') return true;
        if (a.endsWith('y') && b === a.slice(0, -1) + 'ies') return true;
        return false;
    }

    function classifyErrorsOffline(result, question, userText) {
        const tags = new Set();

        // Ưu tiên hợp nhất nhãn nếu Tầng 2 (Gemini AI) có trả về mảng errorTags chuẩn
        if (result && Array.isArray(result.errorTags)) {
            result.errorTags.forEach(t => {
                if (ERROR_META[t]) tags.add(t);
            });
        }

        // 1. Lỗi cấu trúc / đảo ngữ câu hỏi
        if (result && result.used_target_structure === false) {
            tags.add('structure');
        }

        const diff = result && result.wordDiff ? result.wordDiff : null;
        if (!diff) return Array.from(tags);

        const missingClean = (diff.missingWords || []).map(cleanWord).filter(Boolean);
        const wrongTokens = (diff.userTokens || [])
            .filter(t => t.status === 'wrong')
            .map(t => cleanWord(t.norm || t.raw))
            .filter(Boolean);

        // 2. Lỗi chính tả (typoCount)
        if ((diff.typoCount || 0) > 0) {
            tags.add('spelling');
        }

        // 3. Lỗi trật tự từ (misplacedWords)
        if ((diff.misplacedWords && diff.misplacedWords.length > 0) || (diff.misplacedCount || 0) > 0) {
            tags.add('word_order');
        }

        // 4. Quên / nhầm mạo từ (a, an, the)
        if (missingClean.some(w => ARTICLES.has(w)) || wrongTokens.some(w => ARTICLES.has(w))) {
            tags.add('article');
        }

        // 5. Nhầm động từ To be (am/is/are/was/were)
        if (missingClean.some(w => TO_BE_SET.has(w)) || wrongTokens.some(w => TO_BE_SET.has(w))) {
            tags.add('to_be');
        }

        // 6. Nhầm / thiếu giới từ
        if (missingClean.some(w => PREPOSITIONS.has(w)) || wrongTokens.some(w => PREPOSITIONS.has(w))) {
            tags.add('preposition');
        }

        // 7. Thiếu / thừa s/es (so cặp giữa từ viết sai và từ còn thiếu)
        for (const uW of wrongTokens) {
            if (missingClean.some(mW => isPluralOrThirdPersonPair(uW, mW))) {
                tags.add('plural_s');
                break;
            }
        }

        // Dự phòng: nếu sai mà chưa rơi vào 6 nhóm chi tiết trên -> gán 'structure'
        if (tags.size === 0 && (wrongTokens.length > 0 || missingClean.length > 0)) {
            tags.add('structure');
        }

        return Array.from(tags);
    }

    // ==================== 3. HOOK GHI NHẬN TỪ LUỒNG CHẤM ĐIỂM ====================
    window.recordErrorLogAttempt = function (question, userText, result, isReEvaluation = false) {
        if (!question || !question.id || !result || result.isDirectAnswerView) return;

        const score = Number(result.score) || 0;
        const isPassed = score >= 7.0 && (!question.isStructureMode || Boolean(result.used_target_structure));

        // Nếu Gemini AI phúc khảo xác nhận Đạt -> gỡ vết lỗi vừa ghi ở lượt trước
        if (isPassed) {
            if (isReEvaluation) {
                ErrorTrackerService.removeLatestForQuestion(question.id);
            }
            return;
        }

        const errorTags = classifyErrorsOffline(result, question, userText);
        if (errorTags.length === 0) return;

        const structId = question.isStructureMode && question.structureInfo
            ? question.structureInfo.id
            : (question.sourceStructId || question.topic || 'topic');

        // Nếu là phúc khảo mà vẫn sai -> cập nhật đè bản ghi vừa tạo thay vì nhân đôi
        if (isReEvaluation) {
            ErrorTrackerService.removeLatestForQuestion(question.id);
        }

        ErrorTrackerService.addLog({
            id: 'err_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            questionId: question.id,
            structId,
            vi: question.vi || '',
            userAnswer: String(userText || '').trim(),
            correctAnswer: question.sampleCasual || '',
            errorTags,
            source: result.source || 'local',
            createdAt: new Date().toISOString()
        });
    };

    // ==================== 4. HÀM HỖ TRỢ GIAO DIỆN HỘP ÔN TẬP ====================
    window.getActiveReviewErrorTagFilter = function () {
        return activeErrorTagFilter;
    };

    window.getReviewViewMode = function () {
        return reviewViewMode;
    };

    window.setReviewErrorTagFilter = function (tag) {
        activeErrorTagFilter = (tag === 'all' || ERROR_META[tag]) ? tag : 'all';
        if (typeof renderReviewPage === 'function') renderReviewPage();
    };

    window.setReviewViewMode = function (mode) {
        reviewViewMode = mode === 'history' ? 'history' : 'queue';
        if (typeof renderReviewPage === 'function') renderReviewPage();
    };

    window.clearAllErrorLogsWithConfirm = function () {
        if (!confirm('Xóa toàn bộ lịch sử thống kê lỗi sai của bạn? (Các câu đang nằm trong Hộp ôn tập vẫn được giữ nguyên.)')) return;
        ErrorTrackerService.clearAll();
        activeErrorTagFilter = 'all';
        if (typeof showToast === 'function') showToast('Đã đặt lại lịch sử thống kê lỗi sai.', 'info');
        if (typeof renderReviewPage === 'function') renderReviewPage();
    };

    window.getLatestErrorInfoForReviewItem = function (item) {
        if (!item) return null;
        const qId = item.situationId || item.questionId || item.id;
        return ErrorTrackerService.getLatestByQuestionId(qId);
    };

    window.renderErrorTagBadgesHTML = function (tags) {
        if (!Array.isArray(tags) || tags.length === 0) return '';
        return tags.map(t => {
            const meta = ERROR_META[t];
            if (!meta) return '';
            return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.badgeCls}">${escHtml(meta.short)}</span>`;
        }).join('');
    };

    window.renderErrorTrackerSummaryInReviewPage = function () {
        const viewReview = document.getElementById('view-review');
        const filterBar = document.getElementById('review-filter-bar');
        if (!viewReview) return;

        let panel = document.getElementById('va-error-tracker-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'va-error-tracker-panel';
            if (filterBar && filterBar.parentElement) {
                filterBar.parentElement.insertBefore(panel, filterBar);
            } else {
                viewReview.prepend(panel);
            }
        }

        const stats = ErrorTrackerService.getStats();

        if (stats.totalLogs === 0) {
            panel.className = 'bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3';
            panel.innerHTML = `
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-chart-simple text-sm"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="text-xs sm:text-sm font-extrabold text-slate-800">Sổ lỗi sai cá nhân hóa</p>
                        <p class="text-[11px] sm:text-xs text-slate-500">Khi bạn làm bài dịch và có lỗi, hệ thống sẽ tự động gom nhóm "Top lỗi hay gặp" tại đây để bạn ôn tập có trọng tâm.</p>
                    </div>
                </div>
            `;
            return;
        }

        const top3 = stats.ranked.slice(0, 3);
        const maxCount = top3[0] ? top3[0].count : 1;

        const top3HTML = top3.map(({ tag, count, meta }) => {
            const pct = Math.max(12, Math.round((count / maxCount) * 100));
            return `
                <div onclick="setReviewErrorTagFilter('${tag}')" class="cursor-pointer p-3 rounded-xl bg-slate-50/90 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-1.5">
                    <div class="flex items-center justify-between gap-2 text-xs">
                        <span class="font-extrabold text-slate-800 truncate">${escHtml(meta.label)}</span>
                        <span class="font-extrabold text-indigo-700 shrink-0">${count} lần</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div class="h-full ${meta.barCls} rounded-full" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        const chipBtnsHTML = [
            `<button type="button" onclick="setReviewErrorTagFilter('all')" class="px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${activeErrorTagFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">Tất cả lỗi (${stats.totalLogs})</button>`,
            ...stats.ranked.map(({ tag, count, meta }) => `
                <button type="button" onclick="setReviewErrorTagFilter('${tag}')" class="px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${activeErrorTagFilter === tag ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' : `${meta.badgeCls} hover:opacity-80`}">
                    ${escHtml(meta.short)} (${count})
                </button>
            `)
        ].join('');

        panel.className = 'bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5';
        panel.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-bullseye"></i>
                    </span>
                    <div>
                        <h3 class="text-sm sm:text-base font-extrabold text-slate-900">Top lỗi hay gặp của bạn</h3>
                        <p class="text-[11px] text-slate-500">Tổng hợp từ ${stats.totalLogs} lượt luyện dịch gần đây — bấm vào nhóm lỗi để lọc ôn tập.</p>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="inline-flex bg-slate-100 p-0.5 rounded-xl">
                        <button type="button" onclick="setReviewViewMode('queue')" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${reviewViewMode === 'queue' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'}">Chờ ôn lại</button>
                        <button type="button" onclick="setReviewViewMode('history')" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${reviewViewMode === 'history' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'}">Lịch sử lỗi</button>
                    </div>
                    <button type="button" onclick="clearAllErrorLogsWithConfirm()" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all" title="Đặt lại thống kê lỗi">
                        <i class="fa-solid fa-rotate-left text-xs"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                ${top3HTML}
            </div>

            <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                ${chipBtnsHTML}
            </div>
        `;
    };

    window.renderErrorHistoryListHTML = function () {
        const logs = ErrorTrackerService.getAll();
        const filtered = activeErrorTagFilter === 'all'
            ? logs
            : logs.filter(l => Array.isArray(l.errorTags) && l.errorTags.includes(activeErrorTagFilter));

        if (filtered.length === 0) {
            return `<div class="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">Chưa có lịch sử lỗi nào khớp bộ lọc này.</div>`;
        }

        return filtered.slice(0, 40).map(log => {
            const timeStr = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '';
            return `
                <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-1.5 flex-wrap">${window.renderErrorTagBadgesHTML(log.errorTags)}</div>
                        <span class="text-[11px] text-slate-400 font-medium">${escHtml(timeStr)}</span>
                    </div>
                    <p class="text-sm font-extrabold text-slate-900">"${escHtml(log.vi)}"</p>
                    <div class="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p class="text-rose-700"><span class="font-bold">Bạn viết:</span> ${escHtml(log.userAnswer)}</p>
                        ${log.correctAnswer ? `<p class="text-emerald-700"><span class="font-bold">Chuẩn:</span> ${escHtml(log.correctAnswer)}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    };
})();
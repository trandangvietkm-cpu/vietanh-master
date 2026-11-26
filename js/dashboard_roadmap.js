/**
 * MODULE DASHBOARD & ROADMAP: TRANG CHỦ, BỘ LỌC & SƠ ĐỒ HỌC 8 CHẶNG (js/dashboard_roadmap.js)
 * Tách độc lập từ app_controller.js theo kiến trúc hệ thống (Single Responsibility):
 *  - Trang chủ Dashboard, thẻ thống kê, Streak 7 ngày & danh sách câu chưa đạt
 *  - Bộ lọc Chủ đề tự do & Thư viện cấu trúc (CEFR, Thì, Thể câu, Trạng thái, Từ khóa)
 *  - Sơ đồ học 8 Chặng A1–B1 (Dẫn đường mềm) & Trạm Ôn trộn cuối Chặng (Checkpoint)
 */

        // ==================== THEO DÕI SỐ CÂU ĐẠT TRONG NGÀY (CHO MỤC TIÊU 5 CÂU & LỊCH 30 NGÀY) ====================
    function getTodayDateKey() {
        if (typeof getDateKeyWithOffset === 'function') return getDateKeyWithOffset(0);
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getDailyProgressMap() {
        try {
            return JSON.parse(localStorage.getItem('va_daily_counts')) || {};
        } catch (e) {
            return {};
        }
    }

    function syncTodayCompletedCounter() {
        const todayKey = getTodayDateKey();
        const completedIds = Object.keys(state.completedSituations || {}).filter(id => (state.completedSituations[id] || 0) >= 7);
        const totalNow = completedIds.length;
        const map = getDailyProgressMap();

        // Lưu mốc tổng số câu đầu ngày để tự tính số câu đạt thêm trong hôm nay (100% offline, không cần sửa ai_evaluator)
        const baseKey = 'va_daily_base_' + todayKey;
        let baseTotal = localStorage.getItem(baseKey);
        if (baseTotal === null) {
            // Nếu hôm nay đã có streakActiveToday từ trước khi nâng cấp -> ghi nhận tối thiểu 1 câu
            const initialBase = state.streakActiveToday ? Math.max(0, totalNow - 1) : totalNow;
            localStorage.setItem(baseKey, String(initialBase));
            baseTotal = String(initialBase);
        }

        const gainedToday = Math.max(0, totalNow - Number(baseTotal));
        const recordedToday = Math.max(map[todayKey] || 0, gainedToday, state.streakActiveToday ? 1 : 0);
        if (recordedToday !== (map[todayKey] || 0)) {
            map[todayKey] = recordedToday;
            localStorage.setItem('va_daily_counts', JSON.stringify(map));
        }
        return { todayCount: recordedToday, dailyMap: map };
    }

    function getNextRecommendedStation() {
        if (!SENTENCE_STRUCTURES || SENTENCE_STRUCTURES.length === 0) return null;
        return SENTENCE_STRUCTURES.find(struct =>
            (struct.situations || []).some(sit => (state.completedSituations[sit.id] || 0) < 7)
        ) || SENTENCE_STRUCTURES[0];
    }

    window.openQuickSkillMode = function (skill) {
        const targetStruct = getNextRecommendedStation();
        if (skill === 'translate') {
            continueLearningFromHome();
            return;
        }
        if (skill === 'dictation' || skill === 'audiodrill') {
            if (!targetStruct) {
                switchTab('practice');
                return;
            }
            switchTab('practice');
            switchPracticeMode('structure');
            openStructureWorkspace(targetStruct.id);
            if (typeof switchWorkspaceSubTab === 'function') {
                switchWorkspaceSubTab(skill);
            }
            return;
        }
        if (skill === 'dictionary') {
            switchTab('dictionary');
            return;
        }
        if (skill === 'cloze') {
            switchTab('cloze');
            return;
        }
        if (skill === 'quiz') {
            if (typeof openVocabQuizModal === 'function') {
                openVocabQuizModal();
            } else {
                switchTab('dictionary');
            }
        }
    };
    window.startTodayPlan = function () {
        const { todayCount } = syncTodayCompletedCounter();
        const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];

        if (todayCount < 5) {
            continueLearningFromHome();
        } else if (reviewBox.length > 0) {
            if (typeof window.startReviewBoxSession === 'function') window.startReviewBoxSession(null);
            else switchTab('review');
        } else {
            window.openQuickSkillMode('quiz');
        }
    };
    

    // ==================== RENDER TRANG CHỦ MỚI: 6 KHỐI "BÀN HỌC HÔM NAY" ====================
    function renderHomeDashboard() {
        const topEl = document.getElementById('home-workspace-top');
        const bottomEl = document.getElementById('home-workspace-bottom');
        if (!topEl || !bottomEl) return;

        const DAILY_GOAL = 5;
        const { todayCount, dailyMap } = syncTodayCompletedCounter();
        const remainingGoal = Math.max(0, DAILY_GOAL - todayCount);
        const goalPercent = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100));

        // Tìm trạm đang học & tiến độ của trạm đó
        const nextStruct = getNextRecommendedStation();
        let nextStructPct = 0;
        let nextStructDone = 0;
        let nextStructTotal = 0;
        if (nextStruct) {
            nextStructTotal = (nextStruct.situations || []).length;
            nextStructDone = (nextStruct.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
            nextStructPct = nextStructTotal > 0 ? Math.round((nextStructDone / nextStructTotal) * 100) : 0;
        }

        // Đồng bộ 1 nguồn duy nhất từ Hộp ôn tập (va_review_box) — khớp 100% với badge Sidebar
        const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
        const totalReviewNeed = reviewBox.length;
        const nowTs = Date.now();

        // Ưu tiên lấy câu đến hạn hôm nay (hoặc câu đầu tiên) trong Hộp ôn tập để hiện trên Thẻ hồng
        let firstFailedItem = null;
        if (reviewBox.length > 0) {
            const dueIdx = reviewBox.findIndex(item => {
                const rawDue = item.nextReviewDue || item.nextReview || item.dueDate || 0;
                return !rawDue || new Date(rawDue).getTime() <= nowTs;
            });
            const pickIdx = dueIdx !== -1 ? dueIdx : 0;
            const picked = reviewBox[pickIdx];
            const parentStruct = (SENTENCE_STRUCTURES || []).find(s => s.id === picked.structId);
            firstFailedItem = {
                reviewIdx: pickIdx,
                structName: parentStruct ? (parentStruct.shortName || parentStruct.title) : 'Hộp ôn tập',
                vi: picked.vi || 'Câu cần ôn tập'
            };
        }

        const userName = (state.user && state.user.name) ? state.user.name : 'bạn';
        const goalMsg = remainingGoal > 0
            ? `Còn <strong>${remainingGoal} câu</strong> nữa là đạt mục tiêu hôm nay!`
            : `🎉 Tuyệt vời! Bạn đã hoàn thành mục tiêu <strong>${DAILY_GOAL} câu</strong> hôm nay!`;

        // --- KHỐI 1: THẺ "BÀN HỌC HÔM NAY" (HERO SÁNG, CHỮ ĐẬM DỄ ĐỌC) ---
        const heroHTML = `
            <div class="bg-white rounded-3xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm space-y-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold">
                            <i class="fa-solid fa-sun text-amber-500"></i>
                            <span>Bàn học hôm nay</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Chào ${userName}!
                        </h2>
                        <p class="text-xs sm:text-sm text-slate-600">${goalMsg}</p>
                    </div>
                    <button type="button" onclick="state.selectedStructureId = null; switchPracticeMode('structure'); switchTab('practice');"
                        class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 transition-all">
                        <i class="fa-solid fa-map-location-dot text-indigo-500"></i>
                        <span>Sơ đồ học</span>
                    </button>
                </div>

                ${nextStruct ? `
                    <div class="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="min-w-0 flex-1 space-y-1.5">
                            <div class="flex items-center gap-2 text-[11px] font-bold text-indigo-700">
                                <span class="px-2 py-0.5 rounded-md bg-white border border-indigo-200/80">Đang học</span>
                                <span class="truncate">${nextStructDone}/${nextStructTotal} câu (${nextStructPct}%)</span>
                            </div>
                            <h3 class="text-sm sm:text-base font-extrabold text-slate-900 truncate">${nextStruct.title}</h3>
                            <div class="w-full h-2 bg-white rounded-full overflow-hidden border border-indigo-100">
                                <div class="h-full bg-indigo-600 rounded-full transition-all duration-500" style="width: ${nextStructPct}%"></div>
                            </div>
                        </div>
                        <button type="button" onclick="continueLearningFromHome()"
                            class="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all">
                            <i class="fa-solid fa-play text-xs"></i>
                            <span>Học tiếp</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // --- KHỐI 2: HÀNG 3 THẺ CHỈ SỐ HÔM NAY (3 CỘT NGANG) ---
        const stats3HTML = `
            <div class="grid grid-cols-3 gap-2.5 sm:gap-4">
                <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Hôm nay</div>
                    <div class="text-lg sm:text-2xl font-extrabold text-indigo-600 leading-none">${todayCount}/${DAILY_GOAL}</div>
                    <div class="text-[11px] font-semibold text-slate-500">câu đạt</div>
                </div>
                <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Streak</div>
                    <div class="text-lg sm:text-2xl font-extrabold text-orange-600 leading-none">
                        <i class="fa-solid fa-fire text-orange-500 text-sm sm:text-lg mr-0.5"></i>${state.streak || 0}
                    </div>
                    <div class="text-[11px] font-semibold text-slate-500">Kỷ lục: ${state.longestStreak || 0}</div>
                </div>
                <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Mục tiêu</div>
                    <div class="text-lg sm:text-2xl font-extrabold text-emerald-600 leading-none">${goalPercent}%</div>
                    <div class="text-[11px] font-semibold text-slate-500">${goalPercent >= 100 ? 'Hoàn thành' : 'Đang tiến tới'}</div>
                </div>
            </div>
        `;

        // --- KHỐI 3: THẺ "KẾ HOẠCH 10 PHÚT HÔM NAY" (3 BƯỚC NỐI TIẾP) ---
        const step1Done = todayCount >= DAILY_GOAL;
        const step2Done = totalReviewNeed === 0;
        const planHTML = `
            <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-list-check text-indigo-600"></i>
                        <span>Kế hoạch 10 phút hôm nay</span>
                    </h3>
                    <span class="text-xs font-bold text-slate-400">3 bước gọn</span>
                </div>

                <div class="space-y-2.5">
                    <button type="button" onclick="continueLearningFromHome()" class="w-full p-3.5 rounded-2xl border ${step1Done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300'} flex items-center justify-between gap-3 text-left transition-all">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 h-7 rounded-full ${step1Done ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'} text-xs font-extrabold flex items-center justify-center shrink-0">
                                ${step1Done ? '<i class="fa-solid fa-check"></i>' : '1'}
                            </span>
                            <div class="min-w-0">
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Luyện dịch bài đang học</div>
                                <div class="text-[11px] text-slate-500">${Math.min(todayCount, DAILY_GOAL)}/${DAILY_GOAL} câu mới hôm nay</div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0"></i>
                    </button>

                    <button type="button" onclick="${totalReviewNeed > 0 ? 'window.startReviewBoxSession(null)' : "switchTab('review')"}" class="w-full p-3.5 rounded-2xl border ${step2Done ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300'} flex items-center justify-between gap-3 text-left transition-all">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 h-7 rounded-full ${step2Done ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'} text-xs font-extrabold flex items-center justify-center shrink-0">
                                ${step2Done ? '<i class="fa-solid fa-check"></i>' : '2'}
                            </span>
                            <div class="min-w-0">
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Ôn câu đến hạn / câu sai</div>
                                <div class="text-[11px] text-slate-500">${totalReviewNeed > 0 ? `${totalReviewNeed} câu đang chờ ôn lại` : 'Không có câu tồn đọng ✓'}</div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0"></i>
                    </button>

                    <button type="button" onclick="openQuickSkillMode('quiz')" class="w-full p-3.5 rounded-2xl border bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 flex items-center justify-between gap-3 text-left transition-all">
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-extrabold flex items-center justify-center shrink-0">3</span>
                            <div class="min-w-0">
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Luyện phản xạ Từ vựng / Nghe–Nói</div>
                                <div class="text-[11px] text-slate-500">Chơi nhanh 60 giây hoặc Shadowing Trạm hiện tại</div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0"></i>
                    </button>
                </div>

                <button type="button" onclick="startTodayPlan()" class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-play text-xs"></i>
                    <span>Bắt đầu kế hoạch hôm nay</span>
                </button>
            </div>
        `;

        // --- KHỐI 4: THẺ "ÔN CÂU ĐÃ SAI" (TÔNG HỒNG NHẠT - CHỈ HIỆN KHI CÓ CÂU CẦN ÔN) ---
        const retryCardHTML = (firstFailedItem || reviewBox.length > 0) ? `
            <div class="bg-rose-50/80 border border-rose-200 rounded-3xl p-5 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm sm:text-base font-extrabold text-rose-900 flex items-center gap-2">
                        <i class="fa-solid fa-rotate-left text-rose-600"></i>
                        <span>Ôn câu đã sai (${totalReviewNeed} câu chờ ôn)</span>
                    </h3>
                </div>
                ${firstFailedItem ? `
                    <div class="bg-white/90 rounded-2xl p-3.5 border border-rose-200/70">
                    <div class="text-[11px] font-bold text-rose-600 mb-1">${firstFailedItem.structName}</div>
                        <p class="text-sm font-bold text-slate-800">"${firstFailedItem.vi}"</p>
                    </div>
                ` : `
                    <p class="text-xs sm:text-sm text-rose-800">Bạn có <strong>${reviewBox.length} câu</strong> trong Hộp ôn tập định kỳ cần xem lại.</p>
                `}
                <div class="flex flex-wrap items-center gap-2.5 pt-0.5">
                     <button type="button" onclick="${firstFailedItem ? `window.startReviewBoxSession(${firstFailedItem.reviewIdx})` : "switchTab('review')"}"
                        class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-all">
                        Ôn ngay
                    </button>
                    <button type="button" onclick="switchTab('review')"
                        class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold transition-all">
                        Mở Hộp ôn tập
                    </button>
                </div>
            </div>
        ` : '';

        // Trên PC: xếp Khối 3 & Khối 4 (hoặc Khối 1 + 2) gọn gàng; trên Mobile: dọc mượt từ trên xuống
        topEl.innerHTML = heroHTML + stats3HTML + `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div class="${retryCardHTML ? 'lg:col-span-7' : 'lg:col-span-12'}">${planHTML}</div>
                ${retryCardHTML ? `<div class="lg:col-span-5">${retryCardHTML}</div>` : ''}
            </div>
        `;

        // --- KHỐI 5B: LỐI TẮT "LUYỆN TẬP NHANH" (NẰM NGAY DƯỚI KHỐI 5 TỪ GỢI Ý HÔM NAY) ---
       const quickSkillsHTML = `
            <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <i class="fa-solid fa-bolt text-amber-500"></i>
                    <span>Luyện tập nhanh</span>
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <button type="button" onclick="openQuickSkillMode('translate')" class="p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-language text-indigo-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Luyện dịch câu</span>
                    </button>
                    <button type="button" onclick="openQuickSkillMode('dictation')" class="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-pen-nib text-emerald-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Nghe chép</span>
                    </button>
                    <button type="button" onclick="openQuickSkillMode('audiodrill')" class="p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-headphones text-sky-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Nghe–Nói</span>
                    </button>
                    <button type="button" onclick="openQuickSkillMode('dictionary')" class="p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-book-atlas text-purple-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Từ điển & Thẻ</span>
                    </button>
                    <button type="button" onclick="openQuickSkillMode('quiz')" class="p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-stopwatch text-rose-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Phản xạ 60s</span>
                    </button>
                    <button type="button" onclick="openQuickSkillMode('cloze')" class="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/70 flex flex-col items-center text-center gap-1.5 transition-all">
                        <i class="fa-solid fa-puzzle-piece text-amber-600 text-lg"></i>
                        <span class="text-xs font-extrabold text-slate-800">Điền từ ngữ cảnh</span>
                    </button>
                </div>
            </div>
        `;

        // --- KHỐI 6: LỊCH "30 NGÀY GẦN ĐÂY" ---
        const histSet = new Set(state.streakHistory || []);
        const calendarCells = [];
        for (let offset = -29; offset <= 0; offset++) {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const key = typeof getDateKeyWithOffset === 'function'
                ? getDateKeyWithOffset(offset)
                : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const cnt = dailyMap[key] || 0;
            const hasStreak = histSet.has(key);
            const isToday = offset === 0;

            let cellCls = 'bg-slate-100 text-slate-400 border-slate-200/80';
            let titleTxt = `${d.getDate()}/${d.getMonth() + 1}: Nghỉ`;
            if (cnt >= DAILY_GOAL || (hasStreak && cnt === 0)) {
                cellCls = 'bg-emerald-500 text-white border-emerald-500 font-extrabold';
                titleTxt = `${d.getDate()}/${d.getMonth() + 1}: Đạt mục tiêu`;
            } else if (cnt > 0 || hasStreak) {
                cellCls = 'bg-amber-400 text-slate-900 border-amber-400 font-extrabold';
                titleTxt = `${d.getDate()}/${d.getMonth() + 1}: Học nhẹ (${cnt} câu)`;
            }

            const ringToday = isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : '';
            calendarCells.push(`
                <div title="${titleTxt}" class="h-8 sm:h-9 rounded-xl border text-[11px] flex items-center justify-center ${cellCls} ${ringToday}">
                    ${d.getDate()}
                </div>
            `);
        }

        const calendar30HTML = `
            <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <i class="fa-regular fa-calendar-check text-emerald-600"></i>
                        <span>30 ngày gần đây</span>
                    </h3>
                    <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Đạt mục tiêu</span>
                        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>Học nhẹ</span>
                        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span>Nghỉ</span>
                    </div>
                </div>
                <div class="grid grid-cols-10 gap-1.5 sm:gap-2">
                    ${calendarCells.join('')}
                </div>
            </div>
        `;

        bottomEl.innerHTML = quickSkillsHTML + calendar30HTML;
    }

        function jumpToSituation(structId, sitIndex) {
            switchTab('practice');
            switchPracticeMode('structure');
            openStructureWorkspace(structId);
            selectSituation(sitIndex);
        }

        function continueLearningFromHome() {
            switchTab('practice');
            switchPracticeMode('structure');
            if (!SENTENCE_STRUCTURES || SENTENCE_STRUCTURES.length === 0) {
                backToStructureLibrary();
                showToast("Kho hiện chưa có cấu trúc nào! Hãy tạo bài học đầu tiên trong admin.html nhé.", "info");
                return;
            }
            const targetStruct = SENTENCE_STRUCTURES.find(struct =>
                (struct.situations || []).some(sit => (state.completedSituations[sit.id] || 0) < 7)
            ) || SENTENCE_STRUCTURES[0];
            if (targetStruct) {
                openStructureWorkspace(targetStruct.id);
            }
        }


        // 4. HÀM BỔ TRỢ BỘ LỌC CHỦ ĐỀ
        function setupTopicButtons() {
            document.querySelectorAll('#topic-filters button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('#topic-filters button').forEach(b => {
                        b.className = "topic-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
                    });
                    e.currentTarget.className = "topic-btn active px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm";
                    state.currentTopic = e.currentTarget.getAttribute('data-topic');
                    applyFilters();
                });
            });
        }

        // Định dạng con số hiển thị trên nút bấm theo Phương án 2 (Ngưỡng trần 99+ & Ẩn số ở nút Tất cả / Chưa học)
        function formatSmartCapCount(count) {
            return count > 99 ? '99+' : String(count);
        }

        // Hàm chuẩn hóa chuỗi tiếng Việt (bỏ dấu thanh, dấu mũ và chuyển đ -> d) để tìm kiếm không dấu vẫn khớp 100%
        function removeVietnameseTones(str) {
            if (!str) return "";
            return str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function doesQuestionMatchSearchQuery(question, query, parentStruct = null) {
            if (!query) return true;
            const rawQ = query.toLowerCase().trim();
            if (!rawQ) return true;
            const normQ = removeVietnameseTones(rawQ);

            const fullRawText = [
                question.vi || "",
                question.sampleCasual || "",
                question.sampleFormal || "",
                question.context || "",
                parentStruct ? `${parentStruct.title} ${parentStruct.shortName} ${parentStruct.formula}` : "",
                (question.hints || []).map(h => `${h.en} ${h.vi}`).join(" ")
            ].join(" ").toLowerCase();

            // Khớp chính xác có dấu hoặc khớp bản đã chuẩn hóa không dấu
            if (fullRawText.includes(rawQ)) return true;
            return removeVietnameseTones(fullRawText).includes(normQ);
        }

        function toggleTopicAdvancedFilter() {
            state.topicAdvExpanded = !state.topicAdvExpanded;
            const panel = document.getElementById('topic-advanced-filter-panel');
            const text = document.getElementById('toggle-topic-adv-text');
            const icon = document.getElementById('toggle-topic-adv-icon');
            if (!panel) return;
            if (state.topicAdvExpanded) {
                panel.classList.remove('hidden');
                if (text) text.innerText = "Thu gọn";
                if (icon) icon.className = "fa-solid fa-chevron-up text-[10px]";
            } else {
                panel.classList.add('hidden');
                if (text) text.innerText = "Mở rộng";
                if (icon) icon.className = "fa-solid fa-chevron-down text-[10px]";
            }
        }

        function renderTopicCefrPills() {
            const container = document.getElementById('topic-cefr-pills');
            if (!container) return;

            const counts = { all: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
            const tenseCounts = { all: 0, present: 0, past: 0, future: 0 };
            const formCounts = { all: 0, affirmative: 0, negative: 0, question: 0 };

            EXERCISE_BANK.forEach(item => {
                const matchTopic = state.currentTopic === 'all' || item.topic === state.currentTopic;
                const matchSearch = doesQuestionMatchSearchQuery(item, state.topicSearchQuery);
                if (!matchTopic || !matchSearch) return;

                const meta = getQuestionGrammarMeta(item);
                const lvl = normalizeCEFRLevel(item.level);
                const matchLevel = state.currentLevel === 'all' || lvl === state.currentLevel;
                const matchTense = state.topicTenseFilter === 'all' || meta.tense === state.topicTenseFilter;
                const matchForm = state.topicFormFilter === 'all' || meta.form === state.topicFormFilter;

                if (matchTense && matchForm) {
                    counts.all++;
                    counts[lvl] = (counts[lvl] || 0) + 1;
                }
                if (matchLevel && matchForm) {
                    tenseCounts.all++;
                    tenseCounts[meta.tense] = (tenseCounts[meta.tense] || 0) + 1;
                }
                if (matchLevel && matchTense) {
                    formCounts.all++;
                    formCounts[meta.form] = (formCounts[meta.form] || 0) + 1;
                }
            });

            // Cập nhật số lượng câu trong ô chọn Thì & Thể câu của Chế độ Chủ đề
            const tenseSelect = document.getElementById('topic-tense-select');
            if (tenseSelect && tenseSelect.options.length >= 4) {
                tenseSelect.options[0].text = `Tất cả các thì`;
                tenseSelect.options[1].text = `Hiện tại (${formatSmartCapCount(tenseCounts.present)} câu)`;
                tenseSelect.options[2].text = `Quá khứ (${formatSmartCapCount(tenseCounts.past)} câu)`;
                tenseSelect.options[3].text = `Tương lai (${formatSmartCapCount(tenseCounts.future)} câu)`;
            }
            const formSelect = document.getElementById('topic-form-select');
            if (formSelect && formSelect.options.length >= 4) {
                formSelect.options[0].text = `Tất cả thể câu`;
                formSelect.options[1].text = `Câu khẳng định (+) (${formatSmartCapCount(formCounts.affirmative)})`;
                formSelect.options[2].text = `Câu phủ định (-) (${formatSmartCapCount(formCounts.negative)})`;
                formSelect.options[3].text = `Câu hỏi / Nghi vấn (?) (${formatSmartCapCount(formCounts.question)})`;
            }

            const allPills = [
                { key: 'all', title: 'Tất cả trình độ', core: true },
                { key: 'A1', title: 'A1 • Beginner', core: true },
                { key: 'A2', title: 'A2 • Elementary', core: true },
                { key: 'B1', title: 'B1 • Intermediate', core: true },
                { key: 'B2', title: 'B2 • Upper-Inter', core: false },
                { key: 'C1', title: 'C1 • Advanced', core: false },
                { key: 'C2', title: 'C2 • Proficiency', core: false }
            ];
            const pills = allPills.filter(p => p.core || (counts[p.key] || 0) > 0 || state.currentLevel === p.key);

            container.innerHTML = pills.map(p => {
                const count = counts[p.key] || 0;
                const isSelected = state.currentLevel === p.key;
                const isZero = count === 0 && p.key !== 'all' && !isSelected;
                // Phương án 2: Ẩn hoàn toàn số trên nút 'Tất cả', các nút A1..C2 dùng ngưỡng trần 99+
                const badgeHTML = p.key === 'all'
                    ? ''
                    : `<span class="px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${isSelected ? 'bg-indigo-500 text-white' : isZero ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-indigo-700'}">${formatSmartCapCount(count)}</span>`;

                return `
                    <button onclick="setTopicLevelFilter('${p.key}')" ${isZero ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : isZero ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}">
                        <span>${p.title}</span>
                        ${badgeHTML}
                    </button>
                `;
            }).join('');
        }

        function handleFilterChange() {
            const levelSelect = document.getElementById('level-select');
            if (levelSelect && levelSelect.value !== state.currentLevel) {
                state.currentLevel = levelSelect.value;
            }
            const tenseEl = document.getElementById('topic-tense-select');
            const formEl = document.getElementById('topic-form-select');
            const searchEl = document.getElementById('topic-search-input');
            if (tenseEl) state.topicTenseFilter = tenseEl.value;
            if (formEl) state.topicFormFilter = formEl.value;
            if (searchEl) state.topicSearchQuery = searchEl.value;

            const resetAdvBtn = document.getElementById('topic-reset-adv-btn');
            if (resetAdvBtn) {
                const hasAdv = state.currentLevel !== 'all' || state.topicTenseFilter !== 'all' || state.topicFormFilter !== 'all' || state.topicSearchQuery.trim() !== '';
                if (hasAdv) resetAdvBtn.classList.remove('hidden');
                else resetAdvBtn.classList.add('hidden');
            }
            applyFilters();
        }

        function resetTopicGrammarFilters() {
            state.currentLevel = 'all';
            state.topicTenseFilter = 'all';
            state.topicFormFilter = 'all';
            state.topicSearchQuery = '';
            if (document.getElementById('level-select')) document.getElementById('level-select').value = 'all';
            if (document.getElementById('topic-tense-select')) document.getElementById('topic-tense-select').value = 'all';
            if (document.getElementById('topic-form-select')) document.getElementById('topic-form-select').value = 'all';
            if (document.getElementById('topic-search-input')) document.getElementById('topic-search-input').value = '';
            handleFilterChange();
        }

        function shuffleArray(list) {
            const arr = [...list];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function shuffleTopicExercises() {
            if (!state.filteredList || state.filteredList.length <= 1) {
                showToast("Cần ít nhất 2 câu trong danh sách hiện tại để xáo trộn!", "info");
                return;
            }
            state.filteredList = shuffleArray(state.filteredList);
            state.currentIndex = 0;
            if (state.topicSubTab === 'dictation' && typeof initDictationTabForList === 'function') {
                initDictationTabForList(state.filteredList, 'topic_' + Date.now(), 0);
            } else if (state.topicSubTab === 'audiodrill') {
                switchTopicSubTab('audiodrill');
            } else {
                renderCurrentQuestion();
            }
            showToast(`🔀 Đã xáo trộn ngẫu nhiên ${state.filteredList.length} câu phản xạ tổng hợp!`, "success");
        }

        function applyFilters() {
            const emptyStateEl = document.getElementById('topic-empty-state');
            const sharedCard = document.getElementById('shared-exercise-card');
            const resultPanel = document.getElementById('result-panel');
            if (resultPanel) resultPanel.classList.add('hidden');

            renderTopicCefrPills();
            updateTopicFilterCountBadge();

            if (!EXERCISE_BANK || EXERCISE_BANK.length === 0) {
                state.filteredList = [];
                if (sharedCard) sharedCard.classList.add('hidden');
                if (emptyStateEl) emptyStateEl.classList.remove('hidden');
                return;
            }

            let matched = EXERCISE_BANK.filter(item => {
                const matchTopic = state.currentTopic === 'all' || item.topic === state.currentTopic;
                const itemLevel = normalizeCEFRLevel(item.level);
                const matchLevel = state.currentLevel === 'all' || itemLevel === state.currentLevel;
                const meta = getQuestionGrammarMeta(item);
                const matchTense = state.topicTenseFilter === 'all' || meta.tense === state.topicTenseFilter;
                const matchForm = state.topicFormFilter === 'all' || meta.form === state.topicFormFilter;
                const matchSearch = doesQuestionMatchSearchQuery(item, state.topicSearchQuery);
                return matchTopic && matchLevel && matchTense && matchForm && matchSearch;
            });

            if (matched.length === 0) {
                showToast("Chưa có câu nào khớp bộ lọc này. Hệ thống tạm hiển thị toàn bộ câu trong kho!", "info");
                state.currentTopic = 'all';
                state.currentLevel = 'all';
                state.topicTenseFilter = 'all';
                state.topicFormFilter = 'all';
                state.topicSearchQuery = '';
                document.querySelectorAll('#topic-filters button').forEach(b => {
                    const isAll = b.getAttribute('data-topic') === 'all';
                    b.className = isAll
                        ? "topic-btn active px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm"
                        : "topic-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
                });
                if (document.getElementById('level-select')) document.getElementById('level-select').value = 'all';
                if (document.getElementById('topic-tense-select')) document.getElementById('topic-tense-select').value = 'all';
                if (document.getElementById('topic-form-select')) document.getElementById('topic-form-select').value = 'all';
                if (document.getElementById('topic-search-input')) document.getElementById('topic-search-input').value = '';
                renderTopicCefrPills();
                updateTopicFilterCountBadge();
                matched = [...EXERCISE_BANK];
            }

            // Xáo trộn ngẫu nhiên để người học luyện phản xạ tổng hợp (không đoán trước công thức)
            state.filteredList = shuffleArray(matched);
            state.currentIndex = 0;

            if (emptyStateEl) emptyStateEl.classList.add('hidden');
            if (state.topicSubTab === 'dictation' || state.topicSubTab === 'audiodrill') {
                if (sharedCard) sharedCard.classList.add('hidden');
                switchTopicSubTab(state.topicSubTab);
            } else {
                const dictPanel = document.getElementById('ws-dictation-panel');
                const adPanel = document.getElementById('ws-audiodrill-panel');
                if (dictPanel) dictPanel.classList.add('hidden');
                if (adPanel) adPanel.classList.add('hidden');
                if (sharedCard) sharedCard.classList.remove('hidden');
                renderCurrentQuestion();
            }
        }

        // Khởi tạo ứng dụng
        document.addEventListener('DOMContentLoaded', () => {
            syncCustomContentFromAdminStudio();
            if (typeof syncDailyStreakOnLoad === 'function') syncDailyStreakOnLoad();
            updateStatsUI();
            updateNotebookBadge();
            updateReviewBadgeCount();
            renderAuthHeaderUI();
            setupTopicButtons();
            switchPracticeMode('structure');
            switchTab('home');

            // Lắng nghe phím tắt Enter trong textarea
         const textarea = document.getElementById('user-translation');
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePrimaryDockAction();
                }
            });
            // Khi học viên gõ sửa lại câu trả lời -> Tự động chuyển nút từ "Tiếp tục" về lại "Kiểm tra"
            textarea.addEventListener('input', () => {
                if (state.primaryBtnMode === 'next') {
                    setPrimaryButtonMode('check');
                }
            });
        });

        // Chuyển đổi giữa 2 chế độ: Luyện theo Cấu trúc câu vs Chủ đề tự do
        function switchPracticeMode(mode, keepCheckpoint = false) {
            state.practiceMode = mode;
            const structBtn = document.getElementById('mode-structure-btn');
            const topicBtn = document.getElementById('mode-topic-btn');
            const structContainer = document.getElementById('structure-mode-container');
            const topicContainer = document.getElementById('topic-mode-container');
            const sharedCard = document.getElementById('shared-exercise-card');
            const resultPanel = document.getElementById('result-panel');
            const topicEmptyEl = document.getElementById('topic-empty-state');
            const cpBanner = document.getElementById('checkpoint-mode-banner');
            const topicFilterCard = document.getElementById('topic-filter-card');

            if (resultPanel) resultPanel.classList.add('hidden');
            const dictPanelEl = document.getElementById('ws-dictation-panel');
            const adPanelEl = document.getElementById('ws-audiodrill-panel');
            if (dictPanelEl) dictPanelEl.classList.add('hidden');
            if (adPanelEl) adPanelEl.classList.add('hidden');
            if (typeof stopAudioDrillSession === 'function') stopAudioDrillSession(false);
            if (typeof stopAllPlayback === 'function') stopAllPlayback();
            if (!keepCheckpoint) {
                state.activeCheckpointStageId = null;
                if (cpBanner) cpBanner.classList.add('hidden');
                if (topicFilterCard) topicFilterCard.classList.remove('hidden');
            }

            if (mode === 'structure') {
                document.body.classList.remove('va-in-topic-practice');
                structBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-sm transition-all";
                topicBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all";

                structContainer.classList.remove('hidden');
                topicContainer.classList.add('hidden');
                if (topicEmptyEl) topicEmptyEl.classList.add('hidden');

                if (state.selectedStructureId && SENTENCE_STRUCTURES.some(s => s.id === state.selectedStructureId)) {
                    openStructureWorkspace(state.selectedStructureId);
                } else {
                    backToStructureLibrary();
                }
            } else {
                document.body.classList.remove('va-in-workspace');
                document.body.classList.add('va-in-topic-practice');
                topicBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-sm transition-all";
                structBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all";

                structContainer.classList.add('hidden');
                topicContainer.classList.remove('hidden');

                document.getElementById('next-btn-label').innerText = "Câu tiếp theo";
                document.getElementById('result-next-btn-label').innerText = "Sang câu tiếp theo";
                state.topicSubTab = 'practice';
                syncTopicSubTabButtonsUI('practice');
                if (!keepCheckpoint) {
                    applyFilters();
                } else if (sharedCard) {
                    sharedCard.classList.remove('hidden');
                }
            }
        }

        // ==================== LOGIC CHẾ ĐỘ CẤU TRÚC CÂU (PHƯƠNG ÁN 2: NGƯỠNG 99+ & TÌM KIẾM TỪ KHÓA) ====================
        function hasAnyActiveStructFilter() {
            return (
                state.structTopicFilter !== 'all' ||
                state.structLevelFilter !== 'all' ||
                state.structStatusFilter !== 'all' ||
                state.structTenseFilter !== 'all' ||
                state.structFormFilter !== 'all' ||
                (state.structSearchQuery && state.structSearchQuery.trim() !== '')
            );
        }

        function countActiveStructFilters() {
            let c = 0;
            if (state.structTopicFilter !== 'all') c++;
            if (state.structLevelFilter !== 'all') c++;
            if (state.structStatusFilter !== 'all') c++;
            if (state.structTenseFilter !== 'all') c++;
            if (state.structFormFilter !== 'all') c++;
            if (state.structSearchQuery && state.structSearchQuery.trim() !== '') c++;
            return c;
        }

        function updateStructFilterCountBadge() {
            const count = countActiveStructFilters();
            const badge = document.getElementById('struct-filter-count-badge');
            const resetBtn = document.getElementById('struct-reset-filter-btn');
            if (badge) {
                if (count > 0) {
                    badge.innerText = String(count);
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
            if (resetBtn) {
                if (count > 0) resetBtn.classList.remove('hidden');
                else resetBtn.classList.add('hidden');
            }
        }

        function openStructFilterModal() {
            const modal = document.getElementById('struct-filter-modal');
            if (modal) modal.classList.remove('hidden');
        }

        function closeStructFilterModal() {
            const modal = document.getElementById('struct-filter-modal');
            if (modal) modal.classList.add('hidden');
        }

        function countActiveTopicFilters() {
            let c = 0;
            if (state.currentTopic !== 'all') c++;
            if (state.currentLevel !== 'all') c++;
            if (state.topicTenseFilter !== 'all') c++;
            if (state.topicFormFilter !== 'all') c++;
            if (state.topicSearchQuery && state.topicSearchQuery.trim() !== '') c++;
            return c;
        }

        function updateTopicFilterCountBadge() {
            const count = countActiveTopicFilters();
            const badge = document.getElementById('topic-filter-count-badge');
            const resetBtn = document.getElementById('topic-reset-adv-btn');
            if (badge) {
                if (count > 0) {
                    badge.innerText = String(count);
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
            if (resetBtn) {
                if (count > 0) resetBtn.classList.remove('hidden');
                else resetBtn.classList.add('hidden');
            }
        }

        function openTopicFilterModal() {
            const modal = document.getElementById('topic-filter-modal');
            if (modal) modal.classList.remove('hidden');
        }

        function closeTopicFilterModal() {
            const modal = document.getElementById('topic-filter-modal');
            if (modal) modal.classList.add('hidden');
        }

        function resetTopicAllFilters() {
            state.currentTopic = 'all';
            document.querySelectorAll('#topic-filters button').forEach(b => {
                const isAll = b.getAttribute('data-topic') === 'all';
                b.className = isAll
                    ? "topic-btn active px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm"
                    : "topic-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
            });
            resetTopicGrammarFilters();
        }

        function setStructTopicFilter(topic) {
            state.structTopicFilter = topic;
            document.querySelectorAll('#struct-topic-filters button').forEach(btn => {
                const isSelected = btn.getAttribute('data-struct-topic') === topic;
                btn.className = isSelected
                    ? "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-indigo-600 text-white shadow-xs"
                    : "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
            });
            renderStructureLibrary();
        }

        function setStructStatusFilter(status) {
            state.structStatusFilter = status;
            renderStructureLibrary();
        }

        function setStructLevelFilter(level) {
            state.structLevelFilter = level;
            const selectEl = document.getElementById('struct-level-select');
            if (selectEl && selectEl.value !== level) {
                selectEl.value = level;
            }
            renderStructureLibrary();
        }

        function setTopicLevelFilter(level) {
            state.currentLevel = level;
            const selectEl = document.getElementById('level-select');
            if (selectEl && selectEl.value !== level) {
                selectEl.value = level;
            }
            handleFilterChange();
        }

        function setStructGrammarFilter(type, value) {
            if (type === 'tense') state.structTenseFilter = value;
            else if (type === 'form') state.structFormFilter = value;
            renderStructureLibrary();
        }

        function setStructSearchQuery(val) {
            state.structSearchQuery = val || '';
            const inputEl = document.getElementById('struct-search-input');
            if (inputEl && inputEl.value !== state.structSearchQuery) {
                inputEl.value = state.structSearchQuery;
            }
            const clearBtn = document.getElementById('struct-search-clear-btn');
            if (clearBtn) {
                if (state.structSearchQuery.trim() !== '') clearBtn.classList.remove('hidden');
                else clearBtn.classList.add('hidden');
            }
            renderStructureLibrary();
        }

        function toggleStructAdvancedFilter() {
            state.structAdvExpanded = !state.structAdvExpanded;
            const panel = document.getElementById('struct-advanced-filter-panel');
            const text = document.getElementById('toggle-struct-adv-text');
            const icon = document.getElementById('toggle-struct-adv-icon');
            if (state.structAdvExpanded) {
                panel.classList.remove('hidden');
                text.innerText = "Thu gọn";
                icon.className = "fa-solid fa-chevron-up text-[10px]";
            } else {
                panel.classList.add('hidden');
                text.innerText = "Mở rộng";
                icon.className = "fa-solid fa-chevron-down text-[10px]";
            }
        }

        function resetStructFilters() {
            state.structTopicFilter = 'all';
            state.structLevelFilter = 'all';
            state.structStatusFilter = 'all';
            state.structTenseFilter = 'all';
            state.structFormFilter = 'all';
            state.structSearchQuery = '';

            if (document.getElementById('struct-level-select')) document.getElementById('struct-level-select').value = 'all';
            if (document.getElementById('struct-tense-select')) document.getElementById('struct-tense-select').value = 'all';
            if (document.getElementById('struct-form-select')) document.getElementById('struct-form-select').value = 'all';
            if (document.getElementById('struct-search-input')) document.getElementById('struct-search-input').value = '';
            if (document.getElementById('struct-search-clear-btn')) document.getElementById('struct-search-clear-btn').classList.add('hidden');
            setStructTopicFilter('all');
        }

        // Kiểm tra 1 tình huống có khớp với tổ hợp lọc (Cho phép bỏ qua 1 chiều để đếm số lượng động)
        function doesSituationMatchGrammarFilters(sit, struct, ignoreDimension = null) {
            const meta = getQuestionGrammarMeta(sit, struct);
            const sitLevel = normalizeCEFRLevel(sit.level);
            const sitStatus = getSituationLearningStatus(sit.id);

            const matchLevel = ignoreDimension === 'level' || state.structLevelFilter === 'all' || sitLevel === state.structLevelFilter;
            const matchStatus = ignoreDimension === 'status' || state.structStatusFilter === 'all' || sitStatus === state.structStatusFilter;
            const matchTense = ignoreDimension === 'tense' || state.structTenseFilter === 'all' || meta.tense === state.structTenseFilter;
            const matchForm = ignoreDimension === 'form' || state.structFormFilter === 'all' || meta.form === state.structFormFilter;
            const matchSearch = ignoreDimension === 'search' || doesQuestionMatchSearchQuery(sit, state.structSearchQuery, struct);
            return matchLevel && matchStatus && matchTense && matchForm && matchSearch;
        }

        // Render dải nút bấm nhanh CEFR, Trạng thái học & Số lượng Thì/Thể câu theo Phương án 2 (Ngưỡng trần 99+ & Ẩn số ở nút Tất cả / Chưa học)
        function renderDynamicStructFilterControls() {
            const topicMatchedStructs = SENTENCE_STRUCTURES.filter(struct =>
                state.structTopicFilter === 'all' || (struct.topics && struct.topics.includes(state.structTopicFilter)) || (struct.situations || []).some(s => s.topic === state.structTopicFilter)
            );

            // 1. Đếm số lượng cho từng trạng thái học tập
            const statusCounts = { all: 0, unlearned: 0, retry: 0, completed: 0 };
            topicMatchedStructs.forEach(struct => {
                struct.situations.forEach(sit => {
                    if (doesSituationMatchGrammarFilters(sit, struct, 'status')) {
                        statusCounts.all++;
                        const st = getSituationLearningStatus(sit.id);
                        statusCounts[st] = (statusCounts[st] || 0) + 1;
                    }
                });
            });

            const statusContainer = document.getElementById('struct-status-filters');
            if (statusContainer) {
                // Theo Phương án 2: Ẩn số ở nút "Tất cả" và nút "Chưa học" để người học không bị ngợp khi kho lên hàng trăm câu
                const statusItems = [
                    { key: 'all', label: 'Tất cả', showCount: false, activeClass: 'bg-slate-800 text-white shadow-xs' },
                    { key: 'unlearned', label: 'Chưa học', showCount: false, activeClass: 'bg-indigo-600 text-white shadow-xs' },
                    { key: 'retry', label: 'Cần làm lại', showCount: true, activeClass: 'bg-amber-500 text-white shadow-xs' },
                    { key: 'completed', label: 'Đã đạt', showCount: true, activeClass: 'bg-emerald-600 text-white shadow-xs' }
                ];
                statusContainer.innerHTML = statusItems.map(item => {
                    const count = statusCounts[item.key] || 0;
                    const isSelected = state.structStatusFilter === item.key;
                    const isZero = count === 0 && item.key !== 'all' && !isSelected;
                    const badgeHTML = item.showCount
                        ? `<span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}">${formatSmartCapCount(count)}</span>`
                        : '';
                    return `
                        <button onclick="setStructStatusFilter('${item.key}')" ${isZero ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${isSelected ? item.activeClass : isZero ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                            <span>${item.label}</span>
                            ${badgeHTML}
                        </button>
                    `;
                }).join('');
            }

            // 2. Đếm số lượng câu cho từng bậc CEFR (A1..C2)
            const cefrCounts = { all: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
            const tenseCounts = { all: 0, present: 0, past: 0, future: 0 };
            const formCounts = { all: 0, affirmative: 0, negative: 0, question: 0 };

            topicMatchedStructs.forEach(struct => {
                struct.situations.forEach(sit => {
                    if (doesSituationMatchGrammarFilters(sit, struct, 'level')) {
                        cefrCounts.all++;
                        const lvl = normalizeCEFRLevel(sit.level);
                        cefrCounts[lvl] = (cefrCounts[lvl] || 0) + 1;
                    }
                    if (doesSituationMatchGrammarFilters(sit, struct, 'tense')) {
                        const meta = getQuestionGrammarMeta(sit, struct);
                        tenseCounts.all++;
                        tenseCounts[meta.tense] = (tenseCounts[meta.tense] || 0) + 1;
                    }
                    if (doesSituationMatchGrammarFilters(sit, struct, 'form')) {
                        const meta = getQuestionGrammarMeta(sit, struct);
                        formCounts.all++;
                        formCounts[meta.form] = (formCounts[meta.form] || 0) + 1;
                    }
                });
            });

            // Cập nhật số lượng câu trực tiếp vào 2 menu Thì & Thể câu (kèm ngưỡng trần 99+)
            const tenseSelect = document.getElementById('struct-tense-select');
            if (tenseSelect && tenseSelect.options.length >= 4) {
                tenseSelect.options[0].text = `Tất cả các thì`;
                tenseSelect.options[1].text = `Hiện tại (${formatSmartCapCount(tenseCounts.present)} câu)`;
                tenseSelect.options[2].text = `Quá khứ (${formatSmartCapCount(tenseCounts.past)} câu)`;
                tenseSelect.options[3].text = `Tương lai (${formatSmartCapCount(tenseCounts.future)} câu)`;
            }

            const formSelect = document.getElementById('struct-form-select');
            if (formSelect && formSelect.options.length >= 4) {
                formSelect.options[0].text = `Tất cả thể câu`;
                formSelect.options[1].text = `Câu khẳng định (+) (${formatSmartCapCount(formCounts.affirmative)} câu)`;
                formSelect.options[2].text = `Câu phủ định (-) (${formatSmartCapCount(formCounts.negative)} câu)`;
                formSelect.options[3].text = `Câu hỏi / Nghi vấn (?) (${formatSmartCapCount(formCounts.question)} câu)`;
            }

            // Hiển thị chấm báo hiệu nếu người dùng đang kích hoạt bộ lọc nâng cao khi khung đang thu gọn
            const advDot = document.getElementById('struct-adv-active-dot');
            if (advDot) {
                const hasAdvActive = state.structTenseFilter !== 'all' || state.structFormFilter !== 'all' || (state.structSearchQuery && state.structSearchQuery.trim() !== '');
                if (hasAdvActive) advDot.classList.remove('hidden');
                else advDot.classList.add('hidden');
            }

            const cefrContainer = document.getElementById('struct-cefr-pills');
            if (cefrContainer) {
                const allStructPills = [
                    { key: 'all', title: 'Tất cả trình độ', core: true },
                    { key: 'A1', title: 'A1 • Beginner', core: true },
                    { key: 'A2', title: 'A2 • Elementary', core: true },
                    { key: 'B1', title: 'B1 • Intermediate', core: true },
                    { key: 'B2', title: 'B2 • Upper-Inter', core: false },
                    { key: 'C1', title: 'C1 • Advanced', core: false },
                    { key: 'C2', title: 'C2 • Proficiency', core: false }
                ];
                const pills = allStructPills.filter(p => p.core || (cefrCounts[p.key] || 0) > 0 || state.structLevelFilter === p.key);
                cefrContainer.innerHTML = pills.map(p => {
                    const count = cefrCounts[p.key] || 0;
                    const isSelected = state.structLevelFilter === p.key;
                    const isZero = count === 0 && p.key !== 'all' && !isSelected;
                    // Phương án 2: Ẩn hoàn toàn số trên nút 'Tất cả trình độ', các nút A1..C2 dùng ngưỡng trần 99+
                    const badgeHTML = p.key === 'all'
                        ? ''
                        : `<span class="px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${isSelected ? 'bg-indigo-500 text-white' : isZero ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-indigo-700'}">${formatSmartCapCount(count)}</span>`;

                    return `
                        <button onclick="setStructLevelFilter('${p.key}')" ${isZero ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : isZero ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'}">
                            <span>${p.title}</span>
                            ${badgeHTML}
                        </button>
                    `;
                }).join('');
            }
        }

       function renderStructureLibrary() {
          const grid = document.getElementById('structures-grid');
          let totalCompleted = 0;
          let totalSituations = 0;

          SENTENCE_STRUCTURES.forEach(struct => {
              totalSituations += struct.situations.length;
              totalCompleted += struct.situations.filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
          });
          document.getElementById('total-mastered-count').innerText = totalCompleted;
          const totalSitEl = document.getElementById('total-situations-count');
          if (totalSitEl) totalSitEl.innerText = totalSituations;

          // Cập nhật số lượng trên các nút CEFR, Trạng thái & Menu Thì/Thể câu
          renderDynamicStructFilterControls();

            // Lọc danh sách cấu trúc theo Chủ đề, Trình độ, Trạng thái, Thì/Thể câu và Từ khóa tìm kiếm
            let totalMatchingSituationsCount = 0;
            const filteredStructures = SENTENCE_STRUCTURES.filter(struct => {
                const matchTopic = state.structTopicFilter === 'all' || (struct.topics && struct.topics.includes(state.structTopicFilter)) || (struct.situations || []).some(s => s.topic === state.structTopicFilter);
                if (!matchTopic) return false;
                const matchingSits = struct.situations.filter(sit => doesSituationMatchGrammarFilters(sit, struct));
                totalMatchingSituationsCount += matchingSits.length;
                return matchingSits.length > 0;
            });

            // Cập nhật số lượng tiêu chí đang bật trên nút Bộ lọc & thanh tóm tắt
            updateStructFilterCountBadge();
            const summaryBarEl = document.getElementById('struct-filter-summary-bar');
            const summaryEl = document.getElementById('struct-filter-summary');
            const hasActiveFilter = hasAnyActiveStructFilter();

            if (summaryBarEl && summaryEl) {
                if (hasActiveFilter) {
                    summaryBarEl.classList.remove('hidden');
                    summaryEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-indigo-500 mr-1"></i>Tìm thấy <strong>${ filteredStructures.length }/${ SENTENCE_STRUCTURES.length }</strong> cấu trúc (<strong>${ formatSmartCapCount(totalMatchingSituationsCount) }</strong> tình huống khớp bộ lọc)`;
                } else {
                    summaryBarEl.classList.add('hidden');
                }
            }

            if (filteredStructures.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
                        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-xl">
                            <i class="fa-solid fa-filter-circle-xmark"></i>
                        </div>
                        <h3 class="font-bold text-slate-800 text-base">Không tìm thấy câu tình huống nào khớp với bộ lọc / từ khóa này</h3>
                        <p class="text-xs sm:text-sm text-slate-500">Bạn hãy thử xóa từ khóa tìm kiếm hoặc chọn bậc CEFR khác nhé.</p>
                        <button onclick="resetStructFilters()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all">
                            <i class="fa-solid fa-rotate-left"></i> Xóa toàn bộ bộ lọc
                        </button>
                    </div>
                `;
                return;
            }

           // LAZY RENDERING: Chỉ vẽ theo ngưỡng visibleStructLimit (mặc định 12 thẻ/lần)
            const limit = state.visibleStructLimit || 12;
            const visibleStructures = filteredStructures.slice(0, limit);
            const remainingCount = filteredStructures.length - visibleStructures.length;

            const cardsHTML = visibleStructures.map(struct => {
                const totalSits = struct.situations.length;
                const completedCount = struct.situations.filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                const percent = totalSits > 0 ? Math.round((completedCount / totalSits) * 100) : 0;
                const isMastered = totalSits > 0 && completedCount === totalSits;
                const matchingSitCount = struct.situations.filter(s => doesSituationMatchGrammarFilters(s, struct)).length;

                const structLevels = Array.from(new Set(struct.situations.map(s => normalizeCEFRLevel(s.level))))
                    .sort((a, b) => CEFR_ORDER.indexOf(a) - CEFR_ORDER.indexOf(b));
                const levelRangeText = structLevels.length > 1
                    ? `${structLevels[0]} – ${structLevels[structLevels.length - 1]}`
                    : (structLevels[0] || normalizeCEFRLevel(struct.level));
                const levelInfo = LEVEL_LABELS[normalizeCEFRLevel(struct.level)] || LEVEL_LABELS.B1;

                const previewSit = struct.situations.find(s => doesSituationMatchGrammarFilters(s, struct)) || struct.situations[0];
                const exampleEn = previewSit ? previewSit.sampleCasual : "";
                const stgObj = (typeof getStageInfoById === 'function') ? getStageInfoById(struct.stageId) : null;
                const cleanStageText = stgObj ? stgObj.shortTitle : (struct.stage && struct.stage.trim().toUpperCase() !== levelRangeText.toUpperCase() ? struct.stage : '');
                const stageBadge = cleanStageText
                    ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 truncate max-w-[160px]" title="${stgObj ? stgObj.title : cleanStageText}"><i class="fa-solid fa-map-pin text-indigo-400 mr-1"></i>${cleanStageText}</span>`
                    : '';

                const ctaLabel = hasActiveFilter
                    ? `Luyện (${matchingSitCount}/${totalSits} câu khớp)`
                    : (completedCount > 0 && !isMastered ? 'Học tiếp' : 'Luyện tập');

                return `
                    <div onclick="openStructureWorkspace('${struct.id}')" class="group bg-white p-5 sm:p-6 rounded-3xl border ${isMastered ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200/90'} hover:border-indigo-400 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-4">
                        <div class="space-y-2.5">
                            <div class="flex items-center justify-between gap-2 flex-wrap">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold ${isMastered ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'}">
                                        Cấu trúc #${struct.number}
                                    </span>
                                    <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${levelInfo.color}">
                                        ${levelRangeText}
                                    </span>
                                    ${stageBadge}
                                </div>
                                <span class="text-xs font-bold ${isMastered ? 'text-emerald-600' : 'text-slate-500'}">
                                    ${getStationMasteryFlags(struct.id, isMastered).isFullyMastered
                                     ? '<span class="text-amber-600"><i class="fa-solid fa-crown text-amber-500 mr-1"></i>Làm chủ Trạm</span>'
                                     : (isMastered
                                       ? '<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>Hoàn thành'
                                      : `Đã đạt ${completedCount}/${totalSits}`)}
                                </span>
                            </div>

                            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                                ${struct.title}
                            </h3>

                            <p class="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                ${struct.description}
                            </p>

                            ${exampleEn ? `
                                <div class="pt-0.5 flex items-center gap-2 text-xs text-slate-600 bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-100">
                                    <i class="fa-regular fa-comment-dots text-indigo-400 shrink-0"></i>
                                    <span class="italic font-medium text-slate-700 truncate">"${exampleEn}"</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2.5 flex-1">
                                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex-1">
                                    <div class="h-full ${isMastered ? 'bg-emerald-500' : 'bg-indigo-600'} rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                                </div>
                                <span class="text-[11px] font-bold text-slate-400 shrink-0">${percent}%</span>
                            </div>
                            <span class="inline-flex items-center gap-1.5 text-xs font-extrabold ${hasActiveFilter ? 'text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200/70' : 'text-indigo-600 group-hover:text-indigo-700'} shrink-0">
                                <span>${ctaLabel}</span>
                                <i class="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition-transform"></i>
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            const loadMoreHTML = remainingCount > 0 ? `
                <div class="col-span-1 md:col-span-2 pt-2 text-center">
                    <button type="button" onclick="loadMoreStructures()" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 shadow-2xs transition-all">
                        <i class="fa-solid fa-angles-down"></i>
                        <span>Xem thêm cấu trúc (Còn ${remainingCount} bộ nữa)</span>
                    </button>
                </div>
            ` : '';

            grid.innerHTML = cardsHTML + loadMoreHTML;
        }

        function loadMoreStructures() {
            state.visibleStructLimit = (state.visibleStructLimit || 12) + 12;
            renderStructureLibrary();
        } 

        // ==================== SƠ ĐỒ HỌC 8 CHẶNG A1–B1 (DẪN ĐƯỜNG MỀM • KIỂU A + ÔN TRỘN CUỐI CHẶNG) ====================
        function switchStructureViewMode(viewMode) {
            state.structViewMode = viewMode === 'library' ? 'library' : 'roadmap';
            const roadmapEl = document.getElementById('structure-roadmap-view');
            const filterLibEl = document.getElementById('structure-filter-library-section');
            const btnRoadmap = document.getElementById('view-mode-roadmap-btn');
            const btnLib = document.getElementById('view-mode-library-btn');

            if (state.structViewMode === 'roadmap') {
                if (roadmapEl) roadmapEl.classList.remove('hidden');
                if (filterLibEl) filterLibEl.classList.add('hidden');
                if (btnRoadmap) btnRoadmap.className = "px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs transition-all inline-flex items-center gap-1.5";
                if (btnLib) btnLib.className = "px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 transition-all inline-flex items-center gap-1.5";
                renderLearningRoadmap();
            } else {
                if (roadmapEl) roadmapEl.classList.add('hidden');
                if (filterLibEl) filterLibEl.classList.remove('hidden');
                if (btnLib) btnLib.className = "px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs transition-all inline-flex items-center gap-1.5";
                if (btnRoadmap) btnRoadmap.className = "px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 transition-all inline-flex items-center gap-1.5";
                renderStructureLibrary();
            }
        }

       function handleRoadmapStationClick(structId) {
            // Nhịp 1: Chạm vào trạm khác -> chỉ chuyển khung viền chọn sang trạm đó, chưa mở phòng luyện
            if (state.focusedRoadmapStructId !== structId) {
                state.focusedRoadmapStructId = structId;
                renderLearningRoadmap();
                return;
            }
            // Nhịp 2: Chạm thêm lần nữa vào trạm đang sáng viền -> vào Phòng luyện tập
            openStructureWorkspace(structId);
        }

        // Bảng màu nhận diện riêng cho 8 Chặng (tương thích cả Sáng & Tối)
        const STAGE_COLOR_THEMES = {
            1: { hex: '#4f46e5', soft: 'rgba(79, 70, 229, 0.11)', pillBg: 'rgba(79, 70, 229, 0.14)', pillText: '#4338ca' }, // Indigo
            2: { hex: '#2563eb', soft: 'rgba(2, 132, 199, 0.11)', pillBg: 'rgba(2, 132, 199, 0.14)', pillText: '#0369a1' }, // Sky
            3: { hex: '#059669', soft: 'rgba(5, 150, 105, 0.11)', pillBg: 'rgba(5, 150, 105, 0.14)', pillText: '#047857' }, // Emerald
            4: { hex: '#d97706', soft: 'rgba(217, 119, 6, 0.11)',  pillBg: 'rgba(217, 119, 6, 0.14)',  pillText: '#b45309' }, // Amber
            5: { hex: '#ea580c', soft: 'rgba(234, 88, 12, 0.11)',  pillBg: 'rgba(234, 88, 12, 0.14)',  pillText: '#c2410c' }, // Orange
            6: { hex: '#e11d48', soft: 'rgba(225, 29, 72, 0.11)',  pillBg: 'rgba(225, 29, 72, 0.14)',  pillText: '#be123c' }, // Rose
            7: { hex: '#7c3aed', soft: 'rgba(124, 58, 237, 0.11)', pillBg: 'rgba(124, 58, 237, 0.14)', pillText: '#6d28d9' }, // Violet
            8: { hex: '#0d9488', soft: 'rgba(13, 148, 136, 0.11)', pillBg: 'rgba(13, 148, 136, 0.14)', pillText: '#0f766e' }  // Teal
        };

        function getStageColorTheme(stageNumber) {
            return STAGE_COLOR_THEMES[stageNumber] || STAGE_COLOR_THEMES[1];
        }

        function getStageColorTheme(stageNumber) {
            return STAGE_COLOR_THEMES[stageNumber] || STAGE_COLOR_THEMES[1];
        }

        function getStationMasteryFlags(structId, isPracticeDone) {
            const ms = (window.VA_STATION_MILESTONE && typeof window.VA_STATION_MILESTONE.getProgress === 'function')
                ? window.VA_STATION_MILESTONE.getProgress(structId)
                : null;
            const hasDictation = Boolean(ms && ms.dictation && ms.dictation.completedAt);
            const hasAudioDrill = Boolean(ms && ms.audiodrill && ms.audiodrill.completedAt);
            const isFullyMastered = Boolean(isPracticeDone && hasDictation && hasAudioDrill);
            return { hasDictation, hasAudioDrill, isFullyMastered };
        }

        function renderLearningRoadmap() {
            const container = document.getElementById('structure-roadmap-view');
            if (!container) return;

            // Đồng bộ bộ đếm tổng trên góc phải
            let totalCompletedAll = 0;
            let totalSituationsAll = 0;
            SENTENCE_STRUCTURES.forEach(st => {
                totalSituationsAll += (st.situations || []).length;
                totalCompletedAll += (st.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
            });
            const masteredEl = document.getElementById('total-mastered-count');
            const totalSitEl = document.getElementById('total-situations-count');
            if (masteredEl) masteredEl.innerText = totalCompletedAll;
            if (totalSitEl) totalSitEl.innerText = totalSituationsAll;

            // Xác định Trạm gợi ý "Tiếp theo"
            const nextRecommendedStruct = SENTENCE_STRUCTURES.find(st =>
                (st.situations || []).some(sit => (state.completedSituations[sit.id] || 0) < 7)
            ) || null;

            // Mặc định sáng khung viền ở trạm "Tiếp theo" nếu chưa chọn trạm nào
            if (!state.focusedRoadmapStructId || !SENTENCE_STRUCTURES.some(s => s.id === state.focusedRoadmapStructId)) {
                state.focusedRoadmapStructId = nextRecommendedStruct
                    ? nextRecommendedStruct.id
                    : (SENTENCE_STRUCTURES[0] ? SENTENCE_STRUCTURES[0].id : null);
            }

            const stagesHtml = ROADMAP_STAGES.map((stageInfo) => {
                const theme = getStageColorTheme(stageInfo.number);
                const stageStructs = SENTENCE_STRUCTURES.filter(st => st.stageId === stageInfo.id);
                const hasContent = stageStructs.length > 0;

                if (!hasContent) {
                    return `
                        <div class="relative bg-white/70 rounded-2xl border border-dashed border-slate-300/90 px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 opacity-80"
                             style="border-left: 5px solid ${theme.hex};">
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                                <div class="w-9 h-9 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0"
                                     style="background: ${theme.pillBg}; color: ${theme.hex};">
                                    ${stageInfo.number}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h3 class="font-bold text-slate-600 text-sm sm:text-base leading-snug">${stageInfo.title}</h3>
                                        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">${stageInfo.levelRange}</span>
                                    </div>
                                    <p class="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">${stageInfo.desc}</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                <i class="fa-regular fa-clock mr-1"></i>Sắp ra mắt
                            </span>
                        </div>
                    `;
                }

                let stageTotalSits = 0;
                let stageDoneSits = 0;
                stageStructs.forEach(st => {
                    stageTotalSits += (st.situations || []).length;
                    stageDoneSits += (st.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                });
                const stagePercent = stageTotalSits > 0 ? Math.round((stageDoneSits / stageTotalSits) * 100) : 0;
                const isStageMastered = stageTotalSits > 0 && stageDoneSits === stageTotalSits;
                const accentHex = isStageMastered ? '#059669' : theme.hex;

                const stationsHtml = stageStructs.map((st, idx) => {
                    const total = (st.situations || []).length;
                    const done = (st.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const isDone = total > 0 && done === total;
                    const { isFullyMastered } = getStationMasteryFlags(st.id, isDone);
                    const isNext = nextRecommendedStruct && nextRecommendedStruct.id === st.id;
                    const isFocused = state.focusedRoadmapStructId === st.id;

                    const nodeStyle = isFullyMastered
                        ? 'background:#f59e0b; color:#ffffff;'
                        : (isDone
                            ? 'background:#059669; color:#ffffff;'
                            : (isFocused ? `background:${accentHex}; color:#ffffff;` : ''));

                    const nodeClass = isFocused
                        ? 'ring-4 ring-slate-200/80 shadow-sm'
                        : (isFullyMastered ? 'shadow-amber-200' : (isDone ? 'shadow-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'));

                    const cardClass = isFocused
                        ? (isFullyMastered
                            ? 'border-amber-400 bg-amber-50/35 ring-2 ring-amber-200 shadow-sm'
                            : (isDone
                                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200 shadow-sm'
                                : 'bg-indigo-50/25 shadow-sm'))
                        : (isFullyMastered
                            ? 'border-amber-300 bg-amber-50/15 hover:border-amber-400'
                            : (isDone
                                ? 'border-emerald-200 bg-emerald-50/15 hover:border-emerald-400'
                                : 'border-slate-200 bg-white hover:border-slate-300'));

                    const cardFocusStyle = (isFocused && !isDone)
                        ? `border-color:${accentHex}; box-shadow: 0 0 0 2px ${theme.pillBg};`
                        : '';

                    const statusPill = isFullyMastered
                        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300"><i class="fa-solid fa-crown text-amber-500 mr-1"></i>Làm chủ Trạm</span>`
                        : (isDone
                            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800"><i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>Hoàn thành</span>`
                            : (isNext
                                ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white" style="background:${accentHex};">Tiếp theo</span>`
                                : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">${done}/${total} câu</span>`));

                    const ctaStyle = isFocused
                        ? `background:${isDone ? '#059669' : accentHex}; color:#ffffff;`
                        : `color:${isDone ? '#059669' : accentHex};`;

                    const ctaClass = isFocused
                        ? 'px-3 py-1.5 rounded-xl shadow-xs'
                        : '';

                    const previewEn = st.situations && st.situations[0] ? st.situations[0].sampleCasual : '';
                    const isLastInStage = idx === stageStructs.length - 1;

                    return `
                        <div class="relative flex items-stretch gap-3">
                            <!-- Đường nối trạm bên trái -->
                            <div class="flex flex-col items-center pt-3">
                                <div class="w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs transition-all ${nodeClass}" style="${nodeStyle}">
                                    ${isFullyMastered ? '<i class="fa-solid fa-crown"></i>' : (isDone ? '<i class="fa-solid fa-check"></i>' : (idx + 1))}
                                </div>
                                ${!isLastInStage ? `<div class="w-0.5 flex-1 my-1 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}"></div>` : ''}
                            </div>

                            <!-- Thẻ Trạm (Chạm lần 1: sáng khung chọn • Chạm lần 2: vào phòng luyện) -->
                            <div onclick="handleRoadmapStationClick('${st.id}')" class="flex-1 mb-2.5 p-4 rounded-2xl border ${cardClass} cursor-pointer transition-all shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3" style="${cardFocusStyle}">
                                <div class="min-w-0 flex-1 space-y-1">
                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <span class="text-[11px] font-extrabold" style="color:${accentHex};">Trạm ${stageInfo.number}.${idx + 1}</span>
                                        <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">${normalizeCEFRLevel(st.level)}</span>
                                        ${statusPill}
                                    </div>
                                    <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${st.title}</h4>
                                    ${previewEn ? `<p class="text-xs text-slate-500 italic truncate">"${previewEn}"</p>` : ''}
                                </div>

                                <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 sm:min-w-[125px]">
                                    <div class="flex items-center gap-2 w-28 sm:w-full">
                                        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                                            <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background:${isDone ? '#10b981' : accentHex};"></div>
                                        </div>
                                        <span class="text-[11px] font-bold text-slate-500">${pct}%</span>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-xs font-extrabold transition-all ${ctaClass}" style="${ctaStyle}">
                                        <span>${done > 0 && !isDone ? 'Học tiếp' : (isDone ? 'Ôn lại' : 'Bắt đầu')}</span>
                                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                const checkpointBtnHtml = (stageStructs.length >= 2 || stageTotalSits >= 5) ? `
                    <div class="pt-2 pl-11">
                        <button type="button" onclick="startStageCheckpointReview('${stageInfo.id}')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm transition-all">
                            <i class="fa-solid fa-trophy text-amber-100"></i>
                            <span>Ôn trộn cuối ${stageInfo.shortTitle} (Checkpoint phản xạ)</span>
                        </button>
                    </div>
                ` : '';

                return `
                    <div class="bg-white rounded-3xl border ${isStageMastered ? 'border-emerald-300' : 'border-slate-200/90'} shadow-sm overflow-hidden"
                         style="border-left: 5px solid ${accentHex};">
                        <div class="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3"
                             style="background: linear-gradient(90deg, ${isStageMastered ? 'rgba(16, 185, 129, 0.12)' : theme.soft} 0%, transparent 78%);">
                            <div class="flex items-start gap-3 min-w-0 flex-1">
                                <div class="w-10 h-10 rounded-2xl text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0"
                                     style="background:${accentHex};">
                                    ${isStageMastered ? '<i class="fa-solid fa-crown text-amber-200"></i>' : stageInfo.number}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h3 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${stageInfo.title}</h3>
                                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold"
                                              style="background:${theme.pillBg}; color:${accentHex};">${stageInfo.levelRange}</span>
                                    </div>
                                    <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${stageInfo.desc}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2.5 shrink-0">
                                <div class="text-right">
                                    <div class="text-xs font-extrabold" style="color:${accentHex};">${stageDoneSits}/${stageTotalSits} câu</div>
                                    <div class="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                        <div class="h-full rounded-full transition-all duration-500" style="width: ${stagePercent}%; background:${accentHex};"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-4 sm:p-5">
                            ${stationsHtml}
                            ${checkpointBtnHtml}
                        </div>
                    </div>
                `;
            }).join('');

            const emptyBannerHtml = SENTENCE_STRUCTURES.length === 0 ? `
                <div class="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs sm:text-sm text-indigo-900 flex items-center gap-3">
                    <i class="fa-solid fa-wand-magic-sparkles text-indigo-600 text-lg shrink-0"></i>
                    <span>Sơ đồ 8 Chặng A1–B1 đã sẵn sàng! Hãy mở <strong>admin.html</strong> để tạo các cấu trúc đầu tiên và gắn vào từng Chặng nhé.</span>
                </div>
            ` : '';

            container.innerHTML = emptyBannerHtml + stagesHtml;
        }

        function startStageCheckpointReview(stageId) {
            const stageInfo = getStageInfoById(stageId);
            const stageStructs = SENTENCE_STRUCTURES.filter(st => st.stageId === stageId);
            if (stageStructs.length === 0) return;

            // Rút ngẫu nhiên 1-3 câu từ mỗi cấu trúc trong Chặng (tối đa 12 câu) để trộn phản xạ
            const pool = [];
            const perStruct = stageStructs.length === 1 ? 8 : Math.max(2, Math.ceil(10 / stageStructs.length));
            stageStructs.forEach(st => {
                const picked = shuffleArray(st.situations || []).slice(0, perStruct);
                picked.forEach(sit => {
                    pool.push({
                        ...sit,
                        topic: normalizeTopicKey(sit.topic, st.topics),
                        sourceStructId: st.id,
                        sourceStructShortName: st.shortName || st.title,
                        sourceStageId: stageId,
                        isStructureMode: false
                    });
                });
            });

            if (pool.length === 0) {
                showToast("Chặng này chưa có câu hỏi nào để ôn trộn!", "warning");
                return;
            }

            state.activeCheckpointStageId = stageId;
            state.filteredList = shuffleArray(pool).slice(0, 12);
            state.currentIndex = 0;

            switchPracticeMode('topic', true);
            const cpBanner = document.getElementById('checkpoint-mode-banner');
            const cpTitle = document.getElementById('checkpoint-banner-title');
            const cpSub = document.getElementById('checkpoint-banner-sub');
            const topicFilterCard = document.getElementById('topic-filter-card');
            const emptyStateEl = document.getElementById('topic-empty-state');

            if (cpBanner) cpBanner.classList.remove('hidden');
            if (topicFilterCard) topicFilterCard.classList.add('hidden');
            if (emptyStateEl) emptyStateEl.classList.add('hidden');
            if (cpTitle) cpTitle.innerText = `🏆 Ôn trộn cuối ${stageInfo.shortTitle} (${state.filteredList.length} câu)`;
            if (cpSub) cpSub.innerText = `${stageInfo.title} • Trộn ngẫu nhiên từ ${stageStructs.length} cấu trúc (không báo trước công thức).`;
            const cpBackBtn = cpBanner ? cpBanner.querySelector('button[onclick*="exitStageCheckpointToRoadmap"]') : null;
            if (cpBackBtn) cpBackBtn.innerHTML = `<i class="fa-solid fa-arrow-left mr-1"></i> Sơ đồ học`;

            renderCurrentQuestion();
            showToast(`🏆 Bắt đầu Trạm Ôn trộn cuối ${stageInfo.shortTitle} (${state.filteredList.length} câu)!`, "success");
        }

        function exitStageCheckpointToRoadmap() {
            const wasReviewSession = state.activeCheckpointStageId === 'review_box';
            state.activeCheckpointStageId = null;
            if (wasReviewSession) {
                switchTab('review');
                return;
            }
            state.selectedStructureId = null;
            state.structViewMode = 'roadmap';
            switchPracticeMode('structure');
        }
// ==================== TRANG TÀI KHOẢN / HỒ SƠ (VIEW-PROFILE) ====================
        function ensureProfileViewElement() {
            let el = document.getElementById('view-profile');
            if (!el) {
                const mainEl = document.querySelector('main');
                if (!mainEl) return null;
                el = document.createElement('div');
                el.id = 'view-profile';
                el.className = 'hidden space-y-5';
                mainEl.appendChild(el);
            }
            return el;
        }
        function getProfileNotebookBreakdown() {
            let vocabCount = 0;
            let masteredVocabCount = 0;
            try {
                const vocabBank = JSON.parse(localStorage.getItem('va_vocab_bank') || '[]');
                if (Array.isArray(vocabBank)) {
                    vocabCount = vocabBank.length;
                    masteredVocabCount = vocabBank.filter(v => v && (v.mastered || v.foreverMastered)).length;
                }
            } catch (e) {}
            const sentenceCount = Array.isArray(state.notebook) ? state.notebook.length : 0;
            return {
                vocabCount,
                masteredVocabCount,
                sentenceCount,
                total: vocabCount + sentenceCount
            };
        }

        function getSavedVocabCountForProfile() {
            return getProfileNotebookBreakdown().total;
        }
        
        function getXpLevelInfo(xp) {
            const safeXp = Math.max(0, Number(xp) || 0);
            const xpPerLevel = 100;
            const level = Math.floor(safeXp / xpPerLevel) + 1;
            const currentInLevel = safeXp % xpPerLevel;
            const titles = [
                'Người khởi hành',
                'Người kiên trì',
                'Người xây nền',
                'Chiến binh ngữ pháp',
                'Phản xạ linh hoạt',
                'Bậc thầy giao tiếp'
            ];
            const rankTitle = titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))];
            return { level, rankTitle, currentInLevel, xpPerLevel, pct: Math.round((currentInLevel / xpPerLevel) * 100) };
        }

        window.exportProfileBackupJson = function () {
            try {
                const payload = {
                    app: 'VietAnhMaster',
                    exportedAt: new Date().toISOString(),
                    storage: {}
                };
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k) payload.storage[k] = localStorage.getItem(k);
                }
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const today = getTodayDateKey();
                a.href = url;
                a.download = `vietanh-master-backup-${today}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                if (typeof showToast === 'function') showToast('Đã tải xuống file sao lưu .json!', 'success');
            } catch (e) {
                if (typeof showToast === 'function') showToast('Không thể xuất file sao lưu lúc này.', 'warning');
            }
        };

        window.triggerImportProfileBackup = function () {
            let input = document.getElementById('va-profile-import-input');
            if (!input) {
                input = document.createElement('input');
                input.id = 'va-profile-import-input';
                input.type = 'file';
                input.accept = '.json,application/json';
                input.className = 'hidden';
                input.addEventListener('change', (ev) => {
                    const file = ev.target.files && ev.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const parsed = JSON.parse(String(reader.result || '{}'));
                            const dataMap = (parsed && parsed.storage && typeof parsed.storage === 'object') ? parsed.storage : parsed;
                            let restoredKeys = 0;
                            Object.keys(dataMap).forEach(k => {
                                if (typeof dataMap[k] === 'string') {
                                    localStorage.setItem(k, dataMap[k]);
                                    restoredKeys++;
                                }
                            });
                            if (restoredKeys > 0) {
                                if (typeof showToast === 'function') showToast('Khôi phục thành công! Đang tải lại ứng dụng...', 'success');
                                setTimeout(() => window.location.reload(), 700);
                            } else {
                                if (typeof showToast === 'function') showToast('File sao lưu không có dữ liệu hợp lệ.', 'warning');
                            }
                        } catch (err) {
                            if (typeof showToast === 'function') showToast('File .json không đúng định dạng!', 'warning');
                        }
                        input.value = '';
                    };
                    reader.readAsText(file);
                });
                document.body.appendChild(input);
            }
            input.click();
        };

        window.editProfileDisplayName = function () {
            if (typeof openAuthModal === 'function') {
                openAuthModal('login');
                return;
            }
            const cur = (state.user && state.user.name) ? state.user.name : '';
            const nextName = prompt('Nhập tên hiển thị của bạn:', cur);
            if (nextName === null) return;
            const trimmed = nextName.trim();
            if (!state.user) state.user = {};
            state.user.name = trimmed || 'Học viên';
            if (typeof saveProgress === 'function') saveProgress();
            renderProfilePage();
            if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
        };
        window.toggleThemeFromProfile = function () {
          if (typeof window.toggleThemeMode === 'function') {
              window.toggleThemeMode();
          } else {
              const isDark = document.documentElement.classList.toggle('va-dark');
              localStorage.setItem('va_theme', isDark ? 'dark' : 'light');
          }
          renderProfilePage();
      };    
        
        window.openReviewFromProfileError = function (tag = 'all') {
            if (typeof window.setReviewErrorTagFilter === 'function') {
                window.setReviewErrorTagFilter(tag);
            }
            if (typeof window.setReviewViewMode === 'function') {
                window.setReviewViewMode('queue');
            }
            if (typeof switchTab === 'function') {
                switchTab('review');
            }
        };

        function buildProfileErrorSummaryHTML() {
            if (!window.ErrorTrackerService || typeof window.ErrorTrackerService.getStats !== 'function') {
                return '';
            }
            const stats = window.ErrorTrackerService.getStats();

            if (!stats || stats.totalLogs === 0) {
                return `
                    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-bullseye"></i>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-sm sm:text-base font-extrabold text-slate-900">Sổ lỗi hay gặp</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Chưa ghi nhận lỗi nào — hãy giữ vững phong độ nhé!</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            const top3 = stats.ranked.slice(0, 3);
            const maxCount = top3[0] ? top3[0].count : 1;

            const top3HTML = top3.map(({ tag, count, meta }) => {
                const pct = Math.max(12, Math.round((count / maxCount) * 100));
                return `
                    <button type="button" onclick="openReviewFromProfileError('${tag}')"
                        class="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-1.5">
                        <div class="flex items-center justify-between gap-2 text-xs">
                            <span class="font-extrabold text-slate-800 truncate">${meta.label}</span>
                            <span class="font-extrabold text-indigo-600 shrink-0">${count} lần</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                            <div class="h-full ${meta.barCls} rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </button>
                `;
            }).join('');

            return `
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-bullseye text-rose-500"></i>
                                <span>Điểm cần khắc phục (${stats.totalLogs} lỗi)</span>
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">Chạm vào từng nhóm lỗi để lọc và ôn lại ngay</p>
                        </div>
                        <button type="button" onclick="openReviewFromProfileError('all')"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-extrabold transition-all">
                            <span>Mở Sổ lỗi</span>
                            <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        ${top3HTML}
                    </div>
                </div>
            `;
        }
        window.openNotebookSubTabFromProfile = function (targetType) {
            if (typeof switchTab === 'function') {
                switchTab('notebook');
            }
            setTimeout(() => {
                // Ưu tiên gọi hàm chuyển tab nếu có sẵn trong vocab_module.js
                if (typeof window.switchNotebookSubTab === 'function') {
                    window.switchNotebookSubTab(targetType === 'vocab' ? 'vocab' : 'sentences');
                    return;
                }
                // Dự phòng: tự tìm nút tab bên trong #view-notebook theo nhãn chữ và bấm
                const nbView = document.getElementById('view-notebook');
                if (!nbView) return;
                const btns = Array.from(nbView.querySelectorAll('button'));
                const targetBtn = btns.find(b => {
                    const txt = (b.textContent || '').toLowerCase();
                    return targetType === 'vocab'
                        ? txt.includes('từ vựng')
                        : (txt.includes('mẫu câu') || txt.includes('câu đã lưu'));
                });
                if (targetBtn) targetBtn.click();
            }, 80);
        };

        function buildProfileNotebookSummaryHTML() {
            const { vocabCount, masteredVocabCount, sentenceCount, total } = getProfileNotebookBreakdown();

            return `
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-bookmark text-indigo-600"></i>
                                <span>Sổ tay & Từ vựng (${total} mục)</span>
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">Kho từ vựng và mẫu câu bạn đã lưu để ôn tập</p>
                        </div>
                        <button type="button" onclick="openNotebookSubTabFromProfile('vocab')"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-extrabold transition-all">
                            <span>Mở Sổ tay</span>
                            <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button type="button" onclick="openNotebookSubTabFromProfile('vocab')"
                            class="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-spell-check"></i>
                                </div>
                                <div class="min-w-0">
                                    <div class="text-xs sm:text-sm font-extrabold text-slate-900">Từ vựng đã lưu</div>
                                    <div class="text-[11px] text-slate-500">${vocabCount > 0 ? `${masteredVocabCount} từ đã thuộc` : 'Chưa lưu từ nào'}</div>
                                </div>
                            </div>
                            <span class="text-base font-extrabold text-sky-600 shrink-0">${vocabCount} từ</span>
                        </button>

                        <button type="button" onclick="openNotebookSubTabFromProfile('sentences')"
                            class="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-quote-left"></i>
                                </div>
                                <div class="min-w-0">
                                    <div class="text-xs sm:text-sm font-extrabold text-slate-900">Mẫu câu đã lưu</div>
                                    <div class="text-[11px] text-slate-500">${sentenceCount > 0 ? 'Lưu từ bài luyện dịch' : 'Chưa lưu mẫu câu nào'}</div>
                                </div>
                            </div>
                            <span class="text-base font-extrabold text-indigo-600 shrink-0">${sentenceCount} câu</span>
                        </button>
                    </div>
                </div>
            `;
        }
        

        function renderProfilePage() {
            const container = ensureProfileViewElement();
            if (!container) return;

            const userName = (state.user && state.user.name) ? state.user.name : 'Khách tự học';
            const avatarLetter = userName.trim().charAt(0).toUpperCase() || 'V';
            const xp = Number(state.xp) || 0;
            const lvl = getXpLevelInfo(xp);
            const streak = Number(state.streak) || 0;
            const longestStreak = Number(state.longestStreak) || 0;
            const masteredCount = Object.keys(state.completedSituations || {}).filter(id => (state.completedSituations[id] || 0) >= 7).length;
            const savedVocabCount = getSavedVocabCountForProfile();
            const isDark = document.documentElement.classList.contains('va-dark');

            // Danh sách 6 huy hiệu offline
            // Tính thêm chỉ số cho 6 huy hiệu mở rộng
            const nbBreakdown = getProfileNotebookBreakdown();
            let dictationDoneCount = 0;
            try {
                const dictObj = JSON.parse(localStorage.getItem('va_dictation_done') || '{}');
                dictationDoneCount = Object.values(dictObj).filter(Boolean).length;
            } catch (e) {}
            const quizBestScore = Number(localStorage.getItem('va_vocab_quiz_best') || localStorage.getItem('va_quiz_best') || 0);
            const perfectScoreCount = Object.values(state.completedSituations || {}).filter(s => Number(s) >= 10).length;
            const completedStationsCount = (SENTENCE_STRUCTURES || []).filter(st =>
                Array.isArray(st.situations) && st.situations.length > 0 &&
                st.situations.every(sit => (state.completedSituations[sit.id] || 0) >= 7)
            ).length;

            // Danh sách 12 huy hiệu offline (4 hàng x 3 cột)
            const badges = [
                { icon: 'fa-shoe-prints', title: 'Khởi hành', desc: 'Đạt câu đầu tiên', unlocked: masteredCount >= 1, color: '#4f46e5' },
                { icon: 'fa-fire', title: 'Giữ lửa 3 ngày', desc: 'Streak kỷ lục ≥ 3', unlocked: longestStreak >= 3, color: '#ea580c' },
                { icon: 'fa-calendar-week', title: 'Tuần lễ bền bỉ', desc: 'Streak kỷ lục ≥ 7', unlocked: longestStreak >= 7, color: '#d97706' },
                { icon: 'fa-award', title: 'Chăm chỉ 20 câu', desc: 'Đạt ≥ 20 tình huống', unlocked: masteredCount >= 20, color: '#059669' },
                { icon: 'fa-bookmark', title: 'Tích lũy từ vựng', desc: 'Lưu ≥ 10 từ/mẫu câu', unlocked: savedVocabCount >= 10, color: '#2563eb' },
                { icon: 'fa-crown', title: 'Chinh phục 500 XP', desc: 'Tích lũy ≥ 500 XP', unlocked: xp >= 500, color: '#7c3aed' },
                { icon: 'fa-headphones', title: 'Đôi tai tinh tường', desc: 'Nghe chép ≥ 5 câu', unlocked: dictationDoneCount >= 5, color: '#0d9488' },
                { icon: 'fa-bolt', title: 'Phản xạ tia chớp', desc: 'Phản xạ 60s ≥ 15 điểm', unlocked: quizBestScore >= 15, color: '#e11d48' },
                { icon: 'fa-flag-checkered', title: 'Chinh phục Trạm', desc: 'Xong 100% ít nhất 1 trạm', unlocked: completedStationsCount >= 1, color: '#16a34a' },
                { icon: 'fa-gem', title: 'Chuẩn bản xứ', desc: 'Đạt điểm 10/10 ≥ 10 câu', unlocked: perfectScoreCount >= 10, color: '#0284c7' },
                { icon: 'fa-brain', title: 'Từ vựng nằm lòng', desc: 'Thuộc ≥ 10 từ trong sổ', unlocked: nbBreakdown.masteredVocabCount >= 10, color: '#9333ea' },
                { icon: 'fa-trophy', title: 'Tháng rực rỡ', desc: 'Streak kỷ lục ≥ 30 ngày', unlocked: longestStreak >= 30, color: '#ca8a04' }
            ];
            const unlockedCount = badges.filter(b => b.unlocked).length;

            container.innerHTML = `
                <!-- Thanh tiêu đề quay lại -->
                <div class="flex items-center justify-between gap-3">
                    <button type="button" onclick="switchTab('home')" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:border-indigo-300 transition-all">
                        <i class="fa-solid fa-arrow-left text-indigo-500"></i>
                        <span>Trang chủ</span>
                    </button>
                    <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Hồ sơ học viên</span>
                </div>

                <!-- Khối 1: Thông tin cá nhân & Cấp độ XP -->
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3.5 min-w-0">
                            <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-extrabold flex items-center justify-center shadow-sm shrink-0">
                                ${avatarLetter}
                            </div>
                            <div class="min-w-0">
                                <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 truncate">${userName}</h2>
                                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                                    <span>Cấp ${lvl.level} • ${lvl.rankTitle}</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="editProfileDisplayName()" class="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold border border-slate-200/80 transition-all">
                            <i class="fa-solid fa-user-pen mr-1"></i>Tài khoản
                        </button>
                    </div>

                    <!-- Thanh tiến độ XP -->
                    <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                        <div class="flex items-center justify-between text-xs font-extrabold">
                            <span class="text-indigo-800"><i class="fa-solid fa-star text-amber-500 mr-1"></i>Tổng ${xp} XP</span>
                            <span class="text-slate-600">${lvl.currentInLevel}/${lvl.xpPerLevel} XP lên Cấp ${lvl.level + 1}</span>
                        </div>
                        <div class="w-full h-2.5 bg-white rounded-full overflow-hidden border border-indigo-100">
                            <div class="h-full bg-indigo-600 rounded-full transition-all duration-500" style="width: ${lvl.pct}%"></div>
                        </div>
                    </div>

                    <!-- 4 chỉ số tổng quan -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                            <div class="text-lg font-extrabold text-emerald-600">${masteredCount}</div>
                            <div class="text-[11px] font-semibold text-slate-500">Câu đã đạt</div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                            <div class="text-lg font-extrabold text-orange-600">${streak} ngày</div>
                            <div class="text-[11px] font-semibold text-slate-500">Streak hiện tại</div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                            <div class="text-lg font-extrabold text-amber-600">${longestStreak} ngày</div>
                            <div class="text-[11px] font-semibold text-slate-500">Kỷ lục chuỗi</div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                       <div class="text-lg font-extrabold text-indigo-600">${unlockedCount}/${badges.length}</div>
                       <div class="text-[11px] font-semibold text-slate-500">Huy hiệu</div>
                   </div>
                    </div>
                </div>

                <!-- Khối 2: Bộ sưu tập Huy hiệu Offline -->
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-medal text-amber-500"></i>
                            <span>Huy hiệu thành tích</span>
                        </h3>
                        <span class="text-xs font-extrabold text-indigo-600">${unlockedCount}/${badges.length} đã mở</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        ${badges.map(b => `
                            <div class="p-3.5 rounded-2xl border ${b.unlocked ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/70 opacity-55'} flex items-start gap-3">
                                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                                     style="${b.unlocked ? `background:${b.color}; color:#fff;` : 'background:#e2e8f0; color:#94a3b8;'}">
                                    <i class="fa-solid ${b.icon}"></i>
                                </div>
                                <div class="min-w-0">
                                    <div class="text-xs font-extrabold text-slate-900 truncate">${b.title}</div>
                                    <div class="text-[11px] text-slate-500 leading-snug mt-0.5">${b.desc}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <!-- Khối 2A: Sổ tay & Từ vựng -->
             ${buildProfileNotebookSummaryHTML()}

             <!-- Khối 2B: Sổ lỗi hay gặp -->
             ${buildProfileErrorSummaryHTML()}
                <!-- Khối 3: Sao lưu dữ liệu & Tiện ích -->
                <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-shield-halved text-emerald-600"></i>
                        <span>Dữ liệu & Cài đặt</span>
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button type="button" onclick="exportProfileBackupJson()" class="p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-left flex items-center gap-3 transition-all">
                            <i class="fa-solid fa-download text-emerald-600 text-base"></i>
                            <div>
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900">Sao lưu tiến độ (.json)</div>
                                <div class="text-[11px] text-slate-500">Lưu toàn bộ lịch sử học về máy</div>
                            </div>
                        </button>
                        <button type="button" onclick="triggerImportProfileBackup()" class="p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 text-left flex items-center gap-3 transition-all">
                            <i class="fa-solid fa-upload text-sky-600 text-base"></i>
                            <div>
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900">Khôi phục từ file (.json)</div>
                                <div class="text-[11px] text-slate-500">Nạp lại tiến độ trên thiết bị mới</div>
                            </div>
                        </button>
                        <button type="button" onclick="toggleThemeFromProfile()" class="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center gap-3 transition-all">
                            <i class="fa-solid ${isDark ? 'fa-sun text-amber-500' : 'fa-moon text-indigo-600'} text-base"></i>
                            <div>
                                <div class="text-xs sm:text-sm font-extrabold text-slate-900">Giao diện: ${isDark ? 'Tối' : 'Sáng'}</div>
                                <div class="text-[11px] text-slate-500">Chạm để đổi chế độ Sáng / Tối</div>
                            </div>
                        </button>
                        <button type="button" onclick="if (typeof toggleAuthorModal === 'function') toggleAuthorModal(true);" class="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 text-left flex items-center gap-3 transition-all">
                          <i class="fa-solid fa-heart text-rose-500 text-base"></i>
                          <div>
                              <div class="text-xs sm:text-sm font-extrabold text-slate-900">Tâm sự tác giả</div>
                              <div class="text-[11px] text-slate-500">Câu chuyện tạo nên ViệtAnh Master</div>
                          </div>
                      </button>
                    </div>
                </div>
            `;
        }

        window.onEnterProfileTab = function () {
            const el = ensureProfileViewElement();
            if (el) el.classList.remove('hidden');
            renderProfilePage();
        };

        document.addEventListener('DOMContentLoaded', () => {
            ensureProfileViewElement();
        });
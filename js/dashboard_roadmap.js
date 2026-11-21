/**
 * MODULE DASHBOARD & ROADMAP: TRANG CHỦ, BỘ LỌC & SƠ ĐỒ HỌC 8 CHẶNG (js/dashboard_roadmap.js)
 * Tách độc lập từ app_controller.js theo kiến trúc hệ thống (Single Responsibility):
 *  - Trang chủ Dashboard, thẻ thống kê, Streak 7 ngày & danh sách câu chưa đạt
 *  - Bộ lọc Chủ đề tự do & Thư viện cấu trúc (CEFR, Thì, Thể câu, Trạng thái, Từ khóa)
 *  - Sơ đồ học 8 Chặng A1–B1 (Dẫn đường mềm) & Trạm Ôn trộn cuối Chặng (Checkpoint)
 */

// ==================== QUẢN LÝ TRANG CHỦ & ĐĂNG NHẬP ====================
    function renderHomeDashboard() {
            let totalCompleted = 0;
            let masteredStructs = 0;
            let totalSituations = 0;
            const totalStructsCount = SENTENCE_STRUCTURES.length;

            SENTENCE_STRUCTURES.forEach(struct => {
                totalSituations += struct.situations.length;
                const count = struct.situations.filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                totalCompleted += count;
                if (count === struct.situations.length) masteredStructs++;
            });

            const failedKeys = Object.keys(state.failedSituations).filter(id => (state.completedSituations[id] || 0) < 7);
            const percent = totalSituations > 0 ? Math.round((totalCompleted / totalSituations) * 100) : 0;

            // Cập nhật số lượng câu trong hộp ôn tập lên thẻ thống kê trang chủ
            const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
            const statReviewEl = document.getElementById('stat-review-box-count');
            if (statReviewEl) statReviewEl.innerText = `${reviewBox.length} câu`;

            document.getElementById('home-progress-percent').innerText = `${percent}%`;
            document.getElementById('home-progress-bar').style.width = `${percent}%`;
            document.getElementById('home-completed-count').innerText = `${totalCompleted}/${totalSituations}`;
            document.getElementById('home-retry-count').innerText = failedKeys.length;
            document.getElementById('stat-mastered-structs').innerText = `${masteredStructs} / ${totalStructsCount} bộ`;
            document.getElementById('stat-failed-situations').innerText = `${failedKeys.length} tình huống`;

            if (state.user) {
                document.getElementById('home-greeting-tag').innerText = `Xin chào, ${state.user.name}! Tiến độ đã được bảo vệ`;
                document.getElementById('stat-account-status').innerText = state.user.email;
                document.getElementById('stat-account-btn').innerText = "Đã đồng bộ tiến độ ✓";
                document.getElementById('stat-account-btn').onclick = null;
            } else {
                document.getElementById('home-greeting-tag').innerText = "Lộ trình luyện phản xạ dịch Việt - Anh";
                document.getElementById('stat-account-status').innerText = "Chế độ Khách (Guest)";
                document.getElementById('stat-account-btn').innerText = "Đăng nhập để đồng bộ →";
                document.getElementById('stat-account-btn').onclick = () => openAuthModal('login');
            }

            // Cập nhật thẻ Chuỗi ngày Streak thật & Lịch 7 ngày gần nhất
            const streakCurEl = document.getElementById('home-streak-current');
            const streakLongEl = document.getElementById('home-streak-longest');
            const streakStatusEl = document.getElementById('home-streak-status-text');
            const streakGridEl = document.getElementById('home-streak-7days');

            if (streakCurEl) streakCurEl.innerText = state.streak || 0;
            if (streakLongEl) streakLongEl.innerText = `${state.longestStreak || 0} ngày`;
            if (streakStatusEl) {
                streakStatusEl.innerText = state.streakActiveToday
                    ? '🔥 Hôm nay bạn đã giữ lửa thành công! Hẹn gặp lại ngày mai để nối dài chuỗi.'
                    : (state.streak > 0
                        ? `⏳ Chuỗi ${state.streak} ngày đang chờ bạn! Hoàn thành 1 câu đạt chuẩn hôm nay để không bị đứt chuỗi.`
                        : 'Hoàn thành ít nhất 1 câu đạt chuẩn hôm nay để thắp lửa ngày đầu tiên!');
            }
            if (streakGridEl && typeof getDateKeyWithOffset === 'function') {
                const histSet = new Set(state.streakHistory || []);
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                const cells = [];
                for (let offset = -6; offset <= 0; offset++) {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const key = getDateKeyWithOffset(offset);
                    const isToday = offset === 0;
                    const isActive = histSet.has(key);
                    const dayLabel = isToday ? 'Hôm nay' : dayNames[d.getDay()];
                    const dateNum = d.getDate();

                    const boxCls = isActive
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : (isToday ? 'bg-indigo-50/70 border-indigo-300 border-dashed text-indigo-700' : 'bg-slate-50 border-slate-200/80 text-slate-400');
                    const iconHtml = isActive
                        ? '<i class="fa-solid fa-fire text-orange-500 text-sm"></i>'
                        : (isToday ? '<i class="fa-regular fa-clock text-indigo-400 text-sm"></i>' : '<i class="fa-solid fa-minus text-slate-300 text-xs"></i>');

                    cells.push(`
                        <div class="rounded-2xl border p-2 text-center flex flex-col items-center justify-center gap-1 ${boxCls}">
                            <span class="text-[10px] font-bold truncate max-w-full">${dayLabel}</span>
                            <div class="w-7 h-7 rounded-full ${isActive ? 'bg-white shadow-2xs' : 'bg-white/60'} flex items-center justify-center">
                                ${iconHtml}
                            </div>
                            <span class="text-[10px] font-semibold opacity-75">${dateNum}/${d.getMonth() + 1}</span>
                        </div>
                    `);
                }
                streakGridEl.innerHTML = cells.join('');
            }

            // Hiển thị danh sách các tình huống nhập sai / chưa đạt để bấm vào làm lại ngay
            const retrySection = document.getElementById('home-retry-section');
            const retryList = document.getElementById('home-retry-list');

            if (failedKeys.length > 0) {
                retrySection.classList.remove('hidden');
                const itemsHTML = [];
                SENTENCE_STRUCTURES.forEach(struct => {
                    struct.situations.forEach((sit, idx) => {
                        if (failedKeys.includes(sit.id)) {
                            const lastScore = state.failedSituations[sit.id];
                            itemsHTML.push(`
                                <div onclick="jumpToSituation('${struct.id}', ${idx})" class="bg-white p-3.5 rounded-2xl border border-amber-200 hover:border-indigo-400 cursor-pointer flex items-center justify-between gap-3 shadow-2xs transition-all">
                                    <div class="min-w-0">
                                        <span class="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                            ${struct.shortName} • Câu ${idx + 1} • Chưa đạt
                                        </span>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 truncate mt-1">"${sit.vi}"</p>
                                    </div>
                                    <span class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">
                                        <i class="fa-solid fa-rotate-right"></i>
                                    </span>
                                </div>
                            `);
                        }
                    });
                });
                retryList.innerHTML = itemsHTML.join('');
            } else {
                retrySection.classList.add('hidden');
            }
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
                                    ${isMastered ? '<i class="fa-solid fa-crown text-amber-500 mr-1"></i>Đã hoàn thành' : `Đã đạt ${completedCount}/${totalSits}`}
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

            // Xác định Trạm gợi ý "Tiếp theo" (cấu trúc đầu tiên trên lộ trình còn câu chưa hoàn thành)
            const nextRecommendedStruct = SENTENCE_STRUCTURES.find(st =>
                (st.situations || []).some(sit => (state.completedSituations[sit.id] || 0) < 7)
            ) || null;

            const stagesHtml = ROADMAP_STAGES.map((stageInfo, sIdx) => {
                const stageStructs = SENTENCE_STRUCTURES.filter(st => st.stageId === stageInfo.id);
                const hasContent = stageStructs.length > 0;

                // KIỂU A: Chặng chưa có bài -> hiển thị thẻ thu gọn mờ "Sắp ra mắt"
                if (!hasContent) {
                    return `
                        <div class="relative bg-white/70 rounded-2xl border border-dashed border-slate-300/90 px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 opacity-75">
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                                <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-sm flex items-center justify-center shrink-0">
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

                // Chặng đã có cấu trúc: tính tiến độ tổng của Chặng
                let stageTotalSits = 0;
                let stageDoneSits = 0;
                stageStructs.forEach(st => {
                    stageTotalSits += (st.situations || []).length;
                    stageDoneSits += (st.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                });
                const stagePercent = stageTotalSits > 0 ? Math.round((stageDoneSits / stageTotalSits) * 100) : 0;
                const isStageMastered = stageTotalSits > 0 && stageDoneSits === stageTotalSits;

                const stationsHtml = stageStructs.map((st, idx) => {
                    const total = (st.situations || []).length;
                    const done = (st.situations || []).filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const isDone = total > 0 && done === total;
                    const isNext = nextRecommendedStruct && nextRecommendedStruct.id === st.id;

                    const nodeClass = isDone
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : (isNext ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200');
                    const cardClass = isDone
                        ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400'
                        : (isNext ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-100 hover:border-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300');
                    const statusPill = isDone
                        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800"><i class="fa-solid fa-crown text-amber-500 mr-1"></i>Hoàn thành</span>`
                        : (isNext
                            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white animate-pulse">Tiếp theo</span>`
                            : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">${done}/${total} câu</span>`);

                    const previewEn = st.situations && st.situations[0] ? st.situations[0].sampleCasual : '';
                    const isLastInStage = idx === stageStructs.length - 1;

                    return `
                        <div class="relative flex items-stretch gap-3">
                            <!-- Đường nối trạm bên trái -->
                            <div class="flex flex-col items-center pt-3">
                                <div class="w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs transition-all ${nodeClass}">
                                    ${isDone ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
                                </div>
                                ${!isLastInStage ? `<div class="w-0.5 flex-1 my-1 rounded-full ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}"></div>` : ''}
                            </div>

                            <!-- Thẻ Trạm (Dẫn đường mềm: luôn bấm học được ngay) -->
                            <div onclick="openStructureWorkspace('${st.id}')" class="flex-1 mb-2.5 p-4 rounded-2xl border ${cardClass} cursor-pointer transition-all shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div class="min-w-0 flex-1 space-y-1">
                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <span class="text-[11px] font-extrabold text-indigo-600">Trạm ${stageInfo.number}.${idx + 1}</span>
                                        <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">${normalizeCEFRLevel(st.level)}</span>
                                        ${statusPill}
                                    </div>
                                    <h4 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${st.title}</h4>
                                    ${previewEn ? `<p class="text-xs text-slate-500 italic truncate">"${previewEn}"</p>` : ''}
                                </div>

                                <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 sm:min-w-[125px]">
                                    <div class="flex items-center gap-2 w-28 sm:w-full">
                                        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                                            <div class="h-full ${isDone ? 'bg-emerald-500' : 'bg-indigo-600'} rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                                        </div>
                                        <span class="text-[11px] font-bold text-slate-500">${pct}%</span>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-xs font-extrabold ${isNext ? 'text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200' : 'text-indigo-600'}">
                                        <span>${done > 0 && !isDone ? 'Học tiếp' : (isDone ? 'Ôn lại' : 'Bắt đầu')}</span>
                                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                // Nút Trạm Ôn trộn cuối Chặng (tự sinh khi chặng có >= 2 cấu trúc hoặc >= 5 câu)
                const checkpointBtnHtml = (stageStructs.length >= 2 || stageTotalSits >= 5) ? `
                    <div class="pt-2 pl-11">
                        <button type="button" onclick="startStageCheckpointReview('${stageInfo.id}')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm transition-all">
                            <i class="fa-solid fa-trophy text-amber-100"></i>
                            <span>Ôn trộn cuối ${stageInfo.shortTitle} (Checkpoint phản xạ)</span>
                        </button>
                    </div>
                ` : '';

                return `
                    <div class="bg-white rounded-3xl border ${isStageMastered ? 'border-emerald-300' : 'border-slate-200/90'} shadow-sm overflow-hidden">
                        <div class="px-5 py-4 bg-gradient-to-r ${isStageMastered ? 'from-emerald-50/90 to-teal-50/40' : 'from-indigo-50/80 via-white to-slate-50'} border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-start gap-3 min-w-0 flex-1">
                                <div class="w-10 h-10 rounded-2xl ${isStageMastered ? 'bg-emerald-600' : 'bg-indigo-600'} text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                                    ${isStageMastered ? '<i class="fa-solid fa-crown text-amber-200"></i>' : stageInfo.number}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h3 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">${stageInfo.title}</h3>
                                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-100 text-indigo-800">${stageInfo.levelRange}</span>
                                    </div>
                                    <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${stageInfo.desc}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2.5 shrink-0">
                                <div class="text-right">
                                    <div class="text-xs font-extrabold ${isStageMastered ? 'text-emerald-700' : 'text-indigo-700'}">${stageDoneSits}/${stageTotalSits} câu</div>
                                    <div class="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                        <div class="h-full ${isStageMastered ? 'bg-emerald-500' : 'bg-indigo-600'} rounded-full transition-all duration-500" style="width: ${stagePercent}%"></div>
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

            renderCurrentQuestion();
            showToast(`🏆 Bắt đầu Trạm Ôn trộn cuối ${stageInfo.shortTitle} (${state.filteredList.length} câu)!`, "success");
        }

        function exitStageCheckpointToRoadmap() {
            state.activeCheckpointStageId = null;
            state.selectedStructureId = null;
            state.structViewMode = 'roadmap';
            switchPracticeMode('structure');
        }

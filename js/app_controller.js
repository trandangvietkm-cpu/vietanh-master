/**
 * MODULE 3: ĐIỀU KHIỂN GIAO DIỆN & TƯƠNG TÁC HỌC VIÊN (js/app_controller.js)
 * Phụ trách: Điều hướng Tab, Trang chủ Dashboard, Bộ lọc CEFR/Ngữ pháp, Thư viện Cấu trúc,
 *            Phòng luyện tập, Thanh công cụ đáy (Floating Dock), Phím tắt & Modal Tâm sự tác giả.
 */

        function switchTab(tab) {
            const viewHome = document.getElementById('view-home');
            const viewPractice = document.getElementById('view-practice');
            const viewNotebook = document.getElementById('view-notebook');

            viewHome.classList.add('hidden');
            viewPractice.classList.add('hidden');
            viewNotebook.classList.add('hidden');

            if (tab === 'home') {
                document.body.classList.remove('va-in-workspace', 'va-in-topic-practice');
                viewHome.classList.remove('hidden');
                renderHomeDashboard();
            } else if (tab === 'notebook') {
                document.body.classList.remove('va-in-workspace', 'va-in-topic-practice');
                viewNotebook.classList.remove('hidden');
                renderNotebook();
            } else {
                viewPractice.classList.remove('hidden');
                if (state.practiceMode === 'structure' && state.selectedStructureId) {
                    document.body.classList.add('va-in-workspace');
                    document.body.classList.remove('va-in-topic-practice');
                } else if (state.practiceMode === 'topic') {
                    document.body.classList.remove('va-in-workspace');
                    document.body.classList.add('va-in-topic-practice');
                } else {
                    document.body.classList.remove('va-in-workspace', 'va-in-topic-practice');
                }
            }
        }

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
            renderCurrentQuestion();
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
            if (sharedCard) sharedCard.classList.remove('hidden');
            renderCurrentQuestion();
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

        function switchWorkspaceSubTab(tab) {
            const target = tab === 'theory' ? 'theory' : 'practice';
            state.workspaceSubTab = target;

            const theoryPanel = document.getElementById('ws-theory-panel');
            const stepperCard = document.getElementById('ws-stepper-card');
            const exerciseCard = document.getElementById('shared-exercise-card');
            const btnTheory = document.getElementById('ws-tab-theory-btn');
            const btnPractice = document.getElementById('ws-tab-practice-btn');
            const detailsBody = document.getElementById('formula-details-body');

            const activeCls = "inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-indigo-700 shadow-xs transition-all";
            const inactiveCls = "inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-indigo-700 transition-all";

            if (target === 'theory') {
                if (theoryPanel) theoryPanel.classList.remove('hidden');
                const curStruct = (SENTENCE_STRUCTURES || []).find(s => s.id === state.selectedStructureId);
                if (curStruct) renderStationVocabInTheory(curStruct);
                if (detailsBody) detailsBody.classList.remove('hidden');
                if (stepperCard) stepperCard.classList.add('hidden');
                if (exerciseCard) exerciseCard.classList.add('hidden');
                if (btnTheory) { btnTheory.className = activeCls; btnTheory.setAttribute('aria-selected', 'true'); }
                if (btnPractice) { btnPractice.className = inactiveCls; btnPractice.setAttribute('aria-selected', 'false'); }
            } else {
                if (theoryPanel) theoryPanel.classList.add('hidden');
                if (stepperCard) stepperCard.classList.remove('hidden');
                if (exerciseCard) exerciseCard.classList.remove('hidden');
                if (btnPractice) { btnPractice.className = activeCls; btnPractice.setAttribute('aria-selected', 'true'); }
                if (btnTheory) { btnTheory.className = inactiveCls; btnTheory.setAttribute('aria-selected', 'false'); }
                scrollActiveStepperBtnIntoView();
            }
        }

        function backToStructureLibrary() {
            state.selectedStructureId = null;
            document.body.classList.remove('va-in-workspace');
            document.getElementById('structure-library-view').classList.remove('hidden');
            document.getElementById('structure-workspace-view').classList.add('hidden');
            document.getElementById('shared-exercise-card').classList.add('hidden');
            document.getElementById('result-panel').classList.add('hidden');
            switchStructureViewMode(state.structViewMode || 'roadmap');
        }

        function openStructureWorkspace(structId) {
            const struct = SENTENCE_STRUCTURES.find(s => s.id === structId);
            if (!struct) return;

            state.selectedStructureId = structId;
            document.body.classList.add('va-in-workspace');

            // Nếu người dùng đang chọn bộ lọc (Trình độ, Trạng thái, Thì, Thể câu...), ưu tiên nhảy vào tình huống đầu tiên khớp bộ lọc
            let targetIndex = struct.situations.findIndex(sit => doesSituationMatchGrammarFilters(sit, struct) && (state.completedSituations[sit.id] || 0) < 7);
            if (targetIndex === -1) {
                targetIndex = struct.situations.findIndex(sit => doesSituationMatchGrammarFilters(sit, struct));
            }
            if (targetIndex === -1) {
                targetIndex = struct.situations.findIndex(sit => (state.completedSituations[sit.id] || 0) < 7);
            }
            state.currentSituationIndex = targetIndex !== -1 ? targetIndex : 0;

            document.getElementById('structure-library-view').classList.add('hidden');
            document.getElementById('structure-workspace-view').classList.remove('hidden');

            // Điền thông tin bảng công thức (Tab Lý thuyết) & tên ngắn trên thanh tiêu đề
            const miniTitleEl = document.getElementById('ws-mini-struct-name');
            if (miniTitleEl) miniTitleEl.innerText = struct.shortName || struct.title;
            document.getElementById('ws-struct-title').innerText = `${struct.number}. ${struct.title}`;
            document.getElementById('ws-struct-formula').innerText = struct.formula;
            document.getElementById('ws-struct-desc').innerText = struct.description;
            document.getElementById('ws-struct-tips').innerHTML = (struct.tips || []).map(t => `<p>${t}</p>`).join('');

            // Đảm bảo nút Luyện Nghe–Nói (Audio Drill) xuất hiện trên thanh tiêu đề Trạm
            ensureAudioDrillTriggerButton();

            // Render dải Từ vựng trọng tâm của Trạm trong Tab Lý thuyết
            renderStationVocabInTheory(struct);

            // Mặc định mở thẳng Tab Phòng luyện dịch (⚡)
            switchWorkspaceSubTab('practice');
            renderSituationStepper();
            renderCurrentQuestion();
        }

        function toggleFormulaBox() {
            state.formulaExpanded = !state.formulaExpanded;
            const body = document.getElementById('formula-details-body');
            const icon = document.getElementById('formula-chevron');
            if (state.formulaExpanded) {
                body.classList.remove('hidden');
                icon.className = "fa-solid fa-chevron-up text-xs";
            } else {
                body.classList.add('hidden');
                icon.className = "fa-solid fa-chevron-down text-xs";
            }
        }

        function toggleLockFilterInWorkspace(checked) {
            state.lockFilterInWorkspace = checked;
            renderSituationStepper();
        }

        function clearWorkspaceFilter() {
            resetStructFilters();
            renderSituationStepper();
            showToast("Đã tắt bộ lọc, hiển thị toàn bộ các tình huống!", "info");
        }

        function scrollStepperHorizontal(offset) {
            const stepper = document.getElementById('situation-stepper');
            if (stepper) {
                stepper.scrollBy({ left: offset, behavior: 'smooth' });
            }
        }

        function toggleStepperExpandLayout() {
            state.stepperGridExpanded = !state.stepperGridExpanded;
            const stepper = document.getElementById('situation-stepper');
            const textEl = document.getElementById('toggle-stepper-layout-text');
            const iconEl = document.getElementById('toggle-stepper-layout-icon');
            if (!stepper) return;

            if (state.stepperGridExpanded) {
                stepper.className = "grid grid-cols-5 sm:grid-cols-10 gap-2 py-1 flex-1";
                if (textEl) textEl.innerText = "Thu gọn 1 dòng";
                if (iconEl) iconEl.className = "fa-solid fa-bars-staggered text-[10px]";
            } else {
                stepper.className = "flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 flex-1";
                if (textEl) textEl.innerText = "Xem tất cả";
                if (iconEl) iconEl.className = "fa-solid fa-grip text-[10px]";
                scrollActiveStepperBtnIntoView();
            }
        }

        function scrollActiveStepperBtnIntoView() {
            if (state.stepperGridExpanded) return;
            requestAnimationFrame(() => {
                const activeBtn = document.getElementById(`sit-step-btn-${state.currentSituationIndex}`);
                const stepper = document.getElementById('situation-stepper');
                if (activeBtn && stepper) {
                    const targetLeft = activeBtn.offsetLeft - (stepper.clientWidth / 2) + (activeBtn.clientWidth / 2);
                    stepper.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
                }
            });
        }

        function renderSituationStepper() {
            const struct = SENTENCE_STRUCTURES.find(s => s.id === state.selectedStructureId);
            if (!struct) return;

            const totalSits = struct.situations.length;
            const completedCount = struct.situations.filter(sit => (state.completedSituations[sit.id] || 0) >= 7).length;
            document.getElementById('struct-completed-badge').innerText = completedCount;
            const totalBadgeEl = document.getElementById('struct-total-badge');
            if (totalBadgeEl) totalBadgeEl.innerText = totalSits;
            const titleEl = document.getElementById('ws-stepper-title');
            if (titleEl) titleEl.innerText = `Lộ trình ${totalSits} tình huống`;

            const hasFilter = hasAnyActiveStructFilter();
            const matchingIndices = [];
            struct.situations.forEach((s, i) => {
                if (doesSituationMatchGrammarFilters(s, struct)) matchingIndices.push(i);
            });

            // Hiển thị huy hiệu bộ lọc & nút gạt "Chỉ chuyển qua câu khớp bộ lọc" ngay trên thanh Stepper
            const filterBadge = document.getElementById('ws-active-filter-badge');
            const lockWrap = document.getElementById('ws-lock-filter-wrap');
            const lockCheck = document.getElementById('ws-lock-filter-checkbox');

            if (hasFilter && matchingIndices.length < totalSits) {
                if (filterBadge) {
                    filterBadge.classList.remove('hidden');
                    filterBadge.innerHTML = `<i class="fa-solid fa-filter mr-1"></i>Khớp bộ lọc: ${matchingIndices.length}/${totalSits} câu <button type="button" onclick="clearWorkspaceFilter()" class="ml-1.5 text-rose-600 hover:underline font-extrabold" title="Xóa bộ lọc để hiện sáng toàn bộ các câu">✕ Bỏ lọc</button>`;
                }
                if (lockWrap) lockWrap.classList.remove('hidden');
                if (lockCheck) lockCheck.checked = state.lockFilterInWorkspace;
            } else {
                if (filterBadge) filterBadge.classList.add('hidden');
                if (lockWrap) lockWrap.classList.add('hidden');
            }

            const stepper = document.getElementById('situation-stepper');
            stepper.innerHTML = struct.situations.map((sit, idx) => {
                const isActive = idx === state.currentSituationIndex;
                const passScore = state.completedSituations[sit.id] || 0;
                const failScore = state.failedSituations[sit.id];
                const isDone = passScore >= 7;
                const isFailed = !isDone && failScore !== undefined;
                const isMatched = !hasFilter || matchingIndices.includes(idx);
                const sitCefr = normalizeCEFRLevel(sit.level);

                let btnStyle = "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
                let statusIcon = "";
                let tooltip = `${sit.context} [${sitCefr}]`;

                if (isDone) {
                    tooltip += passScore >= 9 ? ' (Chuẩn xác)' : ' (Đạt chuẩn)';
                    statusIcon = '<i class="fa-solid fa-check text-[10px] text-emerald-600"></i>';
                } else if (isFailed) {
                    tooltip += ' (Chưa đạt • Cần làm lại)';
                    statusIcon = '<i class="fa-solid fa-exclamation text-[10px] text-amber-600"></i>';
                }

                if (isActive) {
                    btnStyle = "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 font-extrabold shadow-xs";
                    if (isDone) statusIcon = '<i class="fa-solid fa-check text-[10px] text-emerald-300"></i>';
                    else if (isFailed) statusIcon = '<i class="fa-solid fa-exclamation text-[10px] text-amber-300"></i>';
                } else if (isDone) {
                    btnStyle = "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
                } else if (isFailed) {
                    btnStyle = "bg-amber-50 text-amber-800 border-amber-300 font-bold";
                } else if (hasFilter && isMatched) {
                    btnStyle = "bg-indigo-50/80 text-indigo-800 border-indigo-300 font-bold ring-1 ring-indigo-200";
                }

                const dimClass = (hasFilter && !isMatched && !isActive) ? "opacity-40 hover:opacity-80" : "";

                return `
                    <button id="sit-step-btn-${idx}" onclick="selectSituation(${idx})" class="relative min-w-[54px] sm:min-w-[60px] h-11 px-2 rounded-xl border text-xs sm:text-sm flex flex-col items-center justify-center leading-none shrink-0 transition-all ${btnStyle} ${dimClass}" title="${tooltip}">
                        <div class="flex items-center gap-0.5">
                            <span>${idx + 1}</span>
                            ${statusIcon}
                        </div>
                        <span class="text-[9px] font-bold opacity-75 mt-0.5">${sitCefr}</span>
                    </button>
                `;
            }).join('');

            // Tự động cuộn mượt mà đưa ô câu hỏi hiện tại vào chính giữa thanh trượt ngang
            scrollActiveStepperBtnIntoView();
        }

        function selectSituation(index) {
            state.currentSituationIndex = index;
            renderSituationStepper();
            renderCurrentQuestion();
        }

        // Cập nhật giao diện Streak & XP
        // Lấy đối tượng câu hỏi hiện hành (tùy theo chế độ Structure hay Topic)
        function getActiveQuestionObject() {
            if (state.practiceMode === 'structure') {
                const struct = SENTENCE_STRUCTURES.find(s => s.id === state.selectedStructureId);
                if (!struct) return null;
                const sit = struct.situations[state.currentSituationIndex];
                return {
                    ...sit,
                    isStructureMode: true,
                    structureInfo: struct
                };
            } else {
                return state.filteredList[state.currentIndex];
            }
        }

        // Hiển thị câu hỏi hiện tại lên giao diện
        function renderCurrentQuestion() {
            const question = getActiveQuestionObject();
            if (!question) return;
            if (typeof initSessionAttemptForQuestion === 'function') {
                initSessionAttemptForQuestion(question);
            }

            // Cập nhật badges & số thứ tự
            const levelInfo = LEVEL_LABELS[normalizeCEFRLevel(question.level)] || LEVEL_LABELS.B1;
            const levelBadge = document.getElementById('badge-level');
            levelBadge.innerText = levelInfo.text;
            levelBadge.className = `px-2.5 py-1 rounded-lg text-xs font-semibold border ${levelInfo.color}`;

            // Cập nhật nhãn Thì & Thể câu trên thanh tiêu đề câu hỏi
            const grammarMeta = getQuestionGrammarMeta(question, question.structureInfo);
            const tenseBadge = document.getElementById('badge-tense');
            const formBadge = document.getElementById('badge-form');
            if (tenseBadge) {
                tenseBadge.innerText = TENSE_LABELS[grammarMeta.tense] || "Thì Hiện tại";
            }
            if (formBadge) {
                formBadge.innerText = FORM_LABELS[grammarMeta.form] || "Khẳng định (+)";
                const formColors = {
                    affirmative: "bg-blue-50 text-blue-700 border-blue-100",
                    negative: "bg-rose-50 text-rose-700 border-rose-100",
                    question: "bg-amber-50 text-amber-800 border-amber-200"
                };
                formBadge.className = `px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${formColors[grammarMeta.form] || formColors.affirmative}`;
            }

            const promptLabelEl = document.getElementById('exercise-prompt-label');
            if (promptLabelEl) {
                promptLabelEl.innerText = question.isStructureMode
                    ? "Dịch câu sau sang tiếng Anh (áp dụng cấu trúc mục tiêu):"
                    : "Dịch câu sau sang tiếng Anh thật tự nhiên (phản xạ tổng hợp):";
            }

            if (question.isStructureMode) {
                const total = question.structureInfo.situations.length;
                const cur = state.currentSituationIndex + 1;
                const rawContext = question.context || '';
                const syncedContext = /^Tình huống\s+\d+/i.test(rawContext)
                    ? rawContext.replace(/^Tình huống\s+\d+(?:\s*\/\s*\d+)?/i, `Tình huống ${cur}/${total}`)
                    : (rawContext ? `Tình huống ${cur}/${total} • ${rawContext}` : `Tình huống ${cur}/${total}`);
                document.getElementById('badge-topic').innerText = syncedContext;
                document.getElementById('question-counter').innerText = `Tình huống ${cur} / ${total}`;
                
                const nextNum = cur < total ? cur + 1 : 1;
                document.getElementById('next-btn-label').innerText = `Tình huống tiếp (${nextNum}/${total})`;
                document.getElementById('result-next-btn-label').innerText = cur < total 
                    ? `Sang tình huống tiếp theo (${cur + 1}/${total})` 
                    : `Ôn lại từ tình huống 1/${total}`;
            } else {
                const topicTitle = TOPIC_LABELS[question.topic] || "Hàng ngày";
                const cpPrefix = state.activeCheckpointStageId ? `🏆 Checkpoint • ` : '';
                document.getElementById('badge-topic').innerText = `${cpPrefix}${topicTitle}`;
                document.getElementById('question-counter').innerText = `Câu ${state.currentIndex + 1} / ${state.filteredList.length}`;
                document.getElementById('next-btn-label').innerText = "Câu tiếp theo";
                document.getElementById('result-next-btn-label').innerText = "Sang câu tiếp theo";
            }

            // Câu tiếng Việt
            document.getElementById('vietnamese-sentence').innerText = `"${question.vi}"`;

            // Reset 3 mức Gợi ý & đóng popup nếu đang mở
            state.activeHints = { 1: false, 2: false, 3: false };
            state.currentHintTab = 1;
            const hintsModalEl = document.getElementById('hints-popup-modal');
            if (hintsModalEl) hintsModalEl.classList.add('hidden');
            [1, 2, 3].forEach(lvl => {
                const box = document.getElementById(`hint-level-${lvl}`);
                if (box) box.classList.add('hidden');
            });
            updateHintButtonsUI();

            // Render Mức 1: Từ vựng
            const hintsList = document.getElementById('hints-list');
            hintsList.innerHTML = (question.hints || []).map(h => `
                <div class="inline-flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
                    <span class="font-bold text-indigo-700">${h.en}</span>
                    <span class="text-slate-400">•</span>
                    <span class="text-slate-600">${h.vi}</span>
                    <button onclick="speakText('${h.en.replace(/'/g, "\\'")}', this)" class="ml-1 text-slate-400 hover:text-indigo-600" title="Nghe từ này">
                        <i class="fa-solid fa-volume-low"></i>
                    </button>
                </div>
            `).join('');

            // Render Mức 2 (Ngữ pháp) & Mức 3 (Khung ghép câu có che từ khóa bằng ____)
            const pedagogy = buildRichPedagogyData(question);
            document.getElementById('hint-grammar-text').innerHTML = pedagogy.grammarHint;
            document.getElementById('hint-construction-text').innerHTML = buildMaskedConstructionHint(question);

            // Reset ô nhập liệu & khung kết quả
            document.getElementById('user-translation').value = '';
            document.getElementById('user-translation').focus();
            document.getElementById('result-panel').classList.add('hidden');
            document.getElementById('loading-panel').classList.add('hidden');
            updateShowAnswerButtonUI(false);
            setPrimaryButtonMode('check');
            state.lastResult = null;
        }

        function updateShowAnswerButtonUI(isShowing) {
            const iconEl = document.getElementById('show-answer-icon');
            const textEl = document.getElementById('show-answer-text');
            if (!iconEl || !textEl) return;
            if (isShowing) {
                iconEl.className = "fa-regular fa-eye-slash text-emerald-600";
                textEl.innerText = "Thu gọn đáp án";
            } else {
                iconEl.className = "fa-regular fa-eye text-emerald-600";
                textEl.innerText = "Xem đáp án";
            }
        }

        function toggleResultBodyCollapse(forceExpand = null) {
            const detailsBody = document.getElementById('result-details-body');
            const iconEl = document.getElementById('collapse-result-icon');
            const textEl = document.getElementById('collapse-result-text');
            if (!detailsBody) return;

            const shouldExpand = forceExpand !== null ? forceExpand : detailsBody.classList.contains('hidden');
            if (shouldExpand) {
                detailsBody.classList.remove('hidden');
                if (iconEl) iconEl.className = "fa-solid fa-chevron-up text-xs";
                if (textEl) textEl.innerText = "Thu gọn";
            } else {
                detailsBody.classList.add('hidden');
                if (iconEl) iconEl.className = "fa-solid fa-chevron-down text-xs";
                if (textEl) textEl.innerText = "Mở rộng";
            }
        }

        function hideResultPanel() {
            const resultPanel = document.getElementById('result-panel');
            if (resultPanel) resultPanel.classList.add('hidden');
            updateShowAnswerButtonUI(false);
            setPrimaryButtonMode('check');
            document.getElementById('user-translation').focus();
        }

        // Tạo khung gợi ý Mức 3: Che bớt từ khóa trọng tâm bằng ô trống (____), KHÔNG lộ nguyên câu đáp án
        function buildMaskedConstructionHint(question) {
            const sample = (question && question.sampleCasual ? question.sampleCasual : '').trim();
            if (!sample) return 'Hãy ghép câu theo công thức của cấu trúc mục tiêu.';

            const tokens = sample.split(/\s+/).filter(Boolean);
            const cleanWord = (w) => w.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, '');

            // Gom tập từ khóa mục tiêu cần ưu tiên che (từ keywords & hints của câu)
            const prioritySet = new Set();
            (question.keywords || []).forEach(kw => {
                String(kw || '').split(/\s+/).forEach(part => {
                    const c = cleanWord(part);
                    if (c.length >= 2) prioritySet.add(c);
                });
            });
            (question.hints || []).forEach(h => {
                String(h?.en || '').split(/\s+/).forEach(part => {
                    const c = cleanWord(part);
                    if (c.length >= 3) prioritySet.add(c);
                });
            });

            const basicFunctionWords = new Set([
                'a', 'an', 'the', 'to', 'in', 'on', 'at', 'of', 'for', 'with', 'by', 'from',
                'and', 'or', 'but', 'so', 'as', 'if', 'my', 'your', 'his', 'her', 'our', 'their',
                'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'us', 'them'
            ]);

            // Xác định số lượng từ cần che (~40-50% số từ, tối thiểu 2 từ cho câu >= 4 từ, không che hết 100%)
            const totalWords = tokens.length;
            const targetMaskCount = totalWords <= 3
                ? 1
                : Math.min(Math.max(2, Math.round(totalWords * 0.45)), Math.max(2, totalWords - 2));

            const maskIndices = new Set();

            // Vòng 1: Ưu tiên che các từ thuộc prioritySet (nhưng bỏ qua mạo từ/giới từ siêu ngắn nếu câu đủ dài)
            tokens.forEach((tok, idx) => {
                if (maskIndices.size >= targetMaskCount) return;
                const c = cleanWord(tok);
                if (!c) return;
                if (prioritySet.has(c) && !(totalWords >= 5 && basicFunctionWords.has(c) && c.length <= 2)) {
                    maskIndices.add(idx);
                }
            });

            // Vòng 2: Nếu chưa đủ số từ cần che, che thêm các từ mang nghĩa chính (độ dài >= 3, không thuộc nhóm từ chức năng cơ bản)
            if (maskIndices.size < targetMaskCount) {
                tokens.forEach((tok, idx) => {
                    if (maskIndices.size >= targetMaskCount || maskIndices.has(idx)) return;
                    const c = cleanWord(tok);
                    if (c.length >= 3 && !basicFunctionWords.has(c)) {
                        maskIndices.add(idx);
                    }
                });
            }

            // Vòng 3: Dự phòng cho câu rất ngắn toàn từ ngắn -> che các vị trí xen kẽ
            if (maskIndices.size < targetMaskCount) {
                for (let idx = 1; idx < totalWords && maskIndices.size < targetMaskCount; idx += 2) {
                    maskIndices.add(idx);
                }
            }

            const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const blankPill = `<span class="inline-block px-2 py-0.2 mx-0.5 rounded-md bg-purple-100 border border-purple-300 text-purple-700 font-mono text-xs font-extrabold tracking-widest align-baseline">____</span>`;

            const maskedSentenceHtml = tokens.map((tok, idx) => {
                if (!maskIndices.has(idx)) return escapeHtml(tok);
                const m = tok.match(/^([^a-zA-Z0-9']*)([a-zA-Z0-9']+)([^a-zA-Z0-9']*)$/);
                if (!m) return blankPill;
                return `${escapeHtml(m[1])}${blankPill}${escapeHtml(m[3])}`;
            }).join(' ');

            // Hiển thị sơ đồ các bước ghép ý ngắn gọn từ nghĩa tiếng Việt của hints (không lộ đáp án tiếng Anh)
            const steps = (question.hints || []).slice(0, 3);
            const stepsHtml = steps.length > 0
                ? `<div class="flex flex-wrap items-center gap-1.5 mb-3">
                    ${steps.map((h, i) => `
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/80 text-[11px] font-bold text-purple-800">
                            <span class="text-purple-500">Bước ${i + 1}:</span> ${escapeHtml(h.vi || h.en)}
                        </span>
                        ${i < steps.length - 1 ? '<i class="fa-solid fa-arrow-right text-[10px] text-purple-300"></i>' : ''}
                    `).join('')}
                   </div>`
                : '';

            return `
                ${stepsHtml}
                <p class="text-[11px] font-semibold text-slate-500 mb-1.5">Khung câu gợi ý (tự điền ${maskIndices.size} từ khóa còn thiếu):</p>
                <p class="text-sm sm:text-base font-bold text-slate-900 leading-loose">${maskedSentenceHtml}</p>
            `;
        }

        function openHintsModal(initialLevel = null) {
            const modal = document.getElementById('hints-popup-modal');
            if (!modal) return;
            modal.classList.remove('hidden');

            const targetLvl = [1, 2, 3].includes(initialLevel)
                ? initialLevel
                : (state.currentHintTab || 1);
            toggleHintLevel(targetLvl);
        }

        function closeHintsModal() {
            const modal = document.getElementById('hints-popup-modal');
            if (modal) modal.classList.add('hidden');
            const inputEl = document.getElementById('user-translation');
            if (inputEl) inputEl.focus();
        }

        function toggleHintLevel(level) {
            const lvl = [1, 2, 3].includes(level) ? level : 1;
            state.currentHintTab = lvl;
            state.activeHints[lvl] = true;

            if (typeof markSessionHintUsed === 'function') {
                markSessionHintUsed(lvl);
            }

            [1, 2, 3].forEach(i => {
                const box = document.getElementById(`hint-level-${i}`);
                if (!box) return;
                if (i === lvl) box.classList.remove('hidden');
                else box.classList.add('hidden');
            });
            updateHintButtonsUI();
        }

        function updateHintButtonsUI() {
            const configs = {
                1: {
                    active: "flex items-center justify-center gap-1.5 text-xs font-extrabold py-2 px-2 rounded-xl bg-amber-500 text-white shadow-xs transition-all",
                    inactive: "flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-xl text-amber-800 hover:bg-white/70 transition-all",
                    badgeActive: "w-4 h-4 rounded-full bg-white text-amber-600 text-[10px] font-extrabold flex items-center justify-center",
                    badgeInactive: "w-4 h-4 rounded-full bg-amber-200/90 text-amber-800 text-[10px] font-extrabold flex items-center justify-center",
                    label: "Từ vựng"
                },
                2: {
                    active: "flex items-center justify-center gap-1.5 text-xs font-extrabold py-2 px-2 rounded-xl bg-blue-600 text-white shadow-xs transition-all",
                    inactive: "flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-xl text-blue-800 hover:bg-white/70 transition-all",
                    badgeActive: "w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-extrabold flex items-center justify-center",
                    badgeInactive: "w-4 h-4 rounded-full bg-blue-200/90 text-blue-800 text-[10px] font-extrabold flex items-center justify-center",
                    label: "Ngữ pháp"
                },
                3: {
                    active: "flex items-center justify-center gap-1.5 text-xs font-extrabold py-2 px-2 rounded-xl bg-purple-600 text-white shadow-xs transition-all",
                    inactive: "flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-xl text-purple-800 hover:bg-white/70 transition-all",
                    badgeActive: "w-4 h-4 rounded-full bg-white text-purple-600 text-[10px] font-extrabold flex items-center justify-center",
                    badgeInactive: "w-4 h-4 rounded-full bg-purple-200/90 text-purple-800 text-[10px] font-extrabold flex items-center justify-center",
                    label: "Tạo câu"
                }
            };

            [1, 2, 3].forEach(lvl => {
                const btn = document.getElementById(`hint-btn-${lvl}`);
                if (!btn) return;
                const cfg = configs[lvl];
                const isSelected = state.currentHintTab === lvl;
                btn.className = isSelected ? cfg.active : cfg.inactive;
                btn.innerHTML = `
                    <span class="${isSelected ? cfg.badgeActive : cfg.badgeInactive}">${lvl}</span>
                    <span>${cfg.label}</span>
                `;
            });

            // Cập nhật badge số mức gợi ý đã mở trên nút Gợi ý chính
            const usedCount = [1, 2, 3].filter(i => state.activeHints[i]).length;
            const badge = document.getElementById('hint-used-count-badge');
            if (badge) {
                if (usedCount > 0) {
                    badge.innerText = `${usedCount}/3`;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }

        // Chức năng Xem đáp án trực tiếp & Các cách nói tương tự (Hỗ trợ bấm lần nữa để thu gọn)
        function showDirectAnswer() {
            const resultPanel = document.getElementById('result-panel');
            if (resultPanel && !resultPanel.classList.contains('hidden') && state.lastResult && state.lastResult.isDirectAnswerView) {
                hideResultPanel();
                return;
            }

            const question = getActiveQuestionObject();
            if (!question) return;
            if (typeof markSessionDirectAnswerViewed === 'function') {
                markSessionDirectAnswerViewed();
            }

            const pedagogy = buildRichPedagogyData(question);
            const directResult = {
                score: 0,
                isDirectAnswerView: true,
                used_target_structure: true,
                title: "Đáp án chuẩn & Các cách diễn đạt tương tự",
                feedback: question.isStructureMode
                    ? `Đây là đáp án tham khảo áp dụng cấu trúc "${question.structureInfo.shortName}" (${question.structureInfo.formula}). Bạn hãy nghe phát âm, xem thêm các cách diễn đạt tương tự bên dưới và tự gõ lại câu để nhớ lâu hơn nhé!`
                    : "Dưới đây là các cách dịch tự nhiên chuẩn người bản xứ. Bạn có thể nghe phát âm từng câu và lưu vào Sổ tay để ôn tập.",
                casual_native: question.sampleCasual,
                formal_native: question.sampleFormal,
                alternatives: pedagogy.alternatives
            };

            displayEvaluationResult(directResult, question, "");
        }

        function nextQuestion() {
            if (state.practiceMode === 'structure') {
                const struct = SENTENCE_STRUCTURES.find(s => s.id === state.selectedStructureId);
                if (!struct) return;

                if (hasAnyActiveStructFilter() && state.lockFilterInWorkspace) {
                    const matched = [];
                    struct.situations.forEach((s, idx) => {
                        if (doesSituationMatchGrammarFilters(s, struct)) matched.push(idx);
                    });
                    if (matched.length > 0) {
                        const nextMatch = matched.find(i => i > state.currentSituationIndex);
                        state.currentSituationIndex = nextMatch !== undefined ? nextMatch : matched[0];
                        renderSituationStepper();
                        renderCurrentQuestion();
                        return;
                    }
                }

                state.currentSituationIndex = (state.currentSituationIndex + 1) % struct.situations.length;
                renderSituationStepper();
                renderCurrentQuestion();
            } else {
                state.currentIndex = (state.currentIndex + 1) % state.filteredList.length;
                renderCurrentQuestion();
            }
        }

        // 8. CÁC HÀM TIỆN ÍCH (CLIPBOARD, TOAST, EXPONENTIAL BACKOFF)
        function copySentence(elementId) {
            const text = document.getElementById(elementId).innerText.replace(/^["']|["']$/g, '');
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            showToast("Đã sao chép câu tiếng Anh vào bộ nhớ tạm!", "success");
        }

        function showToast(message, type = "info") {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const colors = {
                success: "bg-slate-900 text-white border-l-4 border-emerald-400",
                warning: "bg-slate-900 text-white border-l-4 border-amber-400",
                info: "bg-slate-900 text-white border-l-4 border-indigo-400"
            };

            const icons = {
                success: "fa-circle-check text-emerald-400",
                warning: "fa-triangle-exclamation text-amber-400",
                info: "fa-circle-info text-indigo-400"
            };

            toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-medium transition-all transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
            toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;

            container.appendChild(toast);
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            });

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url, options);
                    if (res.ok || res.status < 500) return res;
                } catch (e) {
                    if (i === retries - 1) throw e;
                }
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
            }
            throw new Error("Max retries reached");
        }

    // ==================== ĐIỀU KHIỂN THANH TRƯỢT ĐÁY & PHÍM TẮT ====================
        // 1. Lùi về câu hỏi / tình huống trước đó (Nút <)
        function prevQuestion() {
            if (state.practiceMode === 'structure') {
                const struct = SENTENCE_STRUCTURES.find(s => s.id === state.selectedStructureId);
                if (!struct) return;

                if (hasAnyActiveStructFilter() && state.lockFilterInWorkspace) {
                    const matched = [];
                    struct.situations.forEach((s, idx) => {
                        if (doesSituationMatchGrammarFilters(s, struct)) matched.push(idx);
                    });
                    if (matched.length > 0) {
                        const prevMatches = matched.filter(i => i < state.currentSituationIndex);
                        state.currentSituationIndex = prevMatches.length > 0 ? prevMatches[prevMatches.length - 1] : matched[matched.length - 1];
                        renderSituationStepper();
                        renderCurrentQuestion();
                        return;
                    }
                }

                state.currentSituationIndex = (state.currentSituationIndex - 1 + struct.situations.length) % struct.situations.length;
                renderSituationStepper();
                renderCurrentQuestion();
            } else {
                state.currentIndex = (state.currentIndex - 1 + state.filteredList.length) % state.filteredList.length;
                renderCurrentQuestion();
            }
        }

        // 2. Làm lại câu hiện tại (Nút Làm lại / Esc)
        function retryCurrentQuestion() {
            const inputEl = document.getElementById('user-translation');
            if (inputEl) {
                inputEl.value = '';
                inputEl.focus();
            }
            hideResultPanel();
            if (typeof resetSpeechEvalPanel === 'function') resetSpeechEvalPanel();
            showToast("Đã làm mới ô nhập để bạn dịch lại!", "info");
        }

        // 3. Lắng nghe phím tắt toàn cục (F1: Phát âm, F4: Hiện đáp án, Esc: Làm lại)
        document.addEventListener('keydown', (e) => {
            const sharedCard = document.getElementById('shared-exercise-card');
            if (!sharedCard || sharedCard.classList.contains('hidden')) return;

            if (e.key === 'F1') {
                e.preventDefault();
                speakTargetAnswer(0.95);
            } else if (e.key === 'F4') {
                e.preventDefault();
                showDirectAnswer();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                const topicFilterModal = document.getElementById('topic-filter-modal');
                if (topicFilterModal && !topicFilterModal.classList.contains('hidden')) {
                    closeTopicFilterModal();
                    return;
                }
                const structFilterModal = document.getElementById('struct-filter-modal');
                if (structFilterModal && !structFilterModal.classList.contains('hidden')) {
                    closeStructFilterModal();
                    return;
                }
                const hintsModal = document.getElementById('hints-popup-modal');
                if (hintsModal && !hintsModal.classList.contains('hidden')) {
                    closeHintsModal();
                    return;
                }
                retryCurrentQuestion();
            }
        });
  // ==================== TỰ ĐỘNG ĐỒNG BỘ NÚT KIỂM TRA <-> TIẾP TỤC ====================
        state.primaryBtnMode = 'check'; // 'check' | 'next'

        function setPrimaryButtonMode(mode) {
            state.primaryBtnMode = mode;
            const btn = document.getElementById('submit-btn');
            if (!btn) return;

            const textEl = document.getElementById('submit-btn-text');
            const kbdEl = document.getElementById('submit-btn-kbd');
            const mobIconEl = document.getElementById('submit-btn-mobile-icon');

            if (mode === 'next') {
                btn.className = "w-12 h-10 sm:w-auto sm:flex-1 sm:py-2.5 sm:px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-md shadow-amber-200 transition-all";
                if (kbdEl) kbdEl.className = "hidden md:inline-block px-1.5 py-0.5 bg-amber-600/80 text-amber-50 border border-amber-400/50 rounded text-[10px] font-mono";
                if (mobIconEl) mobIconEl.className = "fa-solid fa-arrow-right sm:hidden text-sm";
                if (textEl) textEl.innerHTML = `Tiếp tục <i class="fa-solid fa-arrow-right text-[11px] ml-0.5"></i>`;
            } else {
                btn.className = "w-12 h-10 sm:w-auto sm:flex-1 sm:py-2.5 sm:px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-md shadow-indigo-200 transition-all";
                if (kbdEl) kbdEl.className = "hidden md:inline-block px-1.5 py-0.5 bg-indigo-500/80 text-indigo-100 border border-indigo-400/50 rounded text-[10px] font-mono";
                if (mobIconEl) mobIconEl.className = "fa-solid fa-check sm:hidden text-sm";
                if (textEl) textEl.innerText = "Kiểm tra";
            }
        }

        function handlePrimaryDockAction() {
            const resultPanel = document.getElementById('result-panel');
            const isResultVisible = resultPanel && !resultPanel.classList.contains('hidden');

            if (state.primaryBtnMode === 'next' || isResultVisible) {
                nextQuestion();
                setPrimaryButtonMode('check');
            } else {
                evaluateTranslation();
            }
        }

        // Tự động theo dõi bảng kết quả (#result-panel): Hễ hiện kết quả là đổi sang "Tiếp tục", ẩn đi là về "Kiểm tra"
        document.addEventListener('DOMContentLoaded', () => {
            const resultPanel = document.getElementById('result-panel');
            const submitBtn = document.getElementById('submit-btn');
            const textarea = document.getElementById('user-translation');

            // Đảm bảo nút submit luôn gọi hàm thông minh mới
            if (submitBtn) {
                submitBtn.setAttribute('onclick', 'handlePrimaryDockAction()');
            }

            // Khi học viên gõ sửa lại chữ trong ô -> Đổi nút về lại "Kiểm tra" để chấm lại
            if (textarea) {
                textarea.addEventListener('input', () => {
                    if (state.primaryBtnMode === 'next') {
                        setPrimaryButtonMode('check');
                    }
                });
            }

            if (resultPanel) {
                const observer = new MutationObserver(() => {
                    const isVisible = !resultPanel.classList.contains('hidden');
                    setPrimaryButtonMode(isVisible ? 'next' : 'check');
                });
                observer.observe(resultPanel, { attributes: true, attributeFilter: ['class'] });
            }
        });

// ==================== MODAL TÂM SỰ TÁC GIẢ ====================
  function toggleAuthorModal(show) {
    const modal = document.getElementById('vaAuthorModal');
    if (!modal) return;
    if (show) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      toggleAuthorModal(false);
      closeStructFilterModal();
      closeTopicFilterModal();
      closeReviewBoxModal();
      closeAudioDrillModal();
    }
  });


// ==================== FIX HỘP ÔN TẬP THÔNG MINH (SPACED REPETITION) ====================
function closeReviewBoxModal() {
    const existing = document.getElementById('va-review-box-modal');
    if (existing) existing.remove();
}

function getReviewItemViText(item) {
    if (!item || typeof item !== 'object') return '';
    return String(item.vi || item.vietnamese || item.questionVi || item.question || item.text || '').trim();
}

function normalizeReviewCompareText(str) {
    return String(str || '')
        .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function removeFromReviewBoxByIndex(idx) {
    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    if (idx >= 0 && idx < reviewBox.length) {
        reviewBox.splice(idx, 1);
        localStorage.setItem('va_review_box', JSON.stringify(reviewBox));
        if (typeof updateReviewBadgeCount === 'function') updateReviewBadgeCount();
        if (typeof renderHomeDashboard === 'function') {
            const viewHome = document.getElementById('view-home');
            if (viewHome && !viewHome.classList.contains('hidden')) renderHomeDashboard();
        }
        showToast("Đã xóa câu khỏi Hộp ôn tập!", "info");
    }
    renderReviewBoxModal();
}

function jumpToReviewBoxQuestionByIndex(idx) {
    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    const targetItem = reviewBox[idx];
    if (!targetItem) {
        closeReviewBoxModal();
        showToast("Không tìm thấy mục ôn tập này.", "warning");
        return;
    }

    const candidateIds = [
        targetItem.situationId,
        targetItem.id,
        targetItem.questionId,
        targetItem.sitId,
        targetItem.qId
    ].filter(v => v !== undefined && v !== null && String(v).trim() !== '').map(v => String(v).trim());

    const targetViNorm = normalizeReviewCompareText(getReviewItemViText(targetItem));
    const targetEnNorm = normalizeReviewCompareText(targetItem.en || targetItem.sampleCasual || targetItem.answer || '');

    // 1. Tìm chính xác trong SENTENCE_STRUCTURES (ưu tiên khớp ID, sau đó khớp câu tiếng Việt hoặc đáp án tiếng Anh)
    let foundStructId = null;
    let foundSitIdx = -1;

    for (const struct of (SENTENCE_STRUCTURES || [])) {
        const sits = struct.situations || [];
        let sitIdx = -1;

        if (candidateIds.length > 0) {
            sitIdx = sits.findIndex(s => s && s.id !== undefined && candidateIds.includes(String(s.id).trim()));
        }
        if (sitIdx === -1 && targetViNorm) {
            sitIdx = sits.findIndex(s => s && normalizeReviewCompareText(s.vi) === targetViNorm);
        }
        if (sitIdx === -1 && targetEnNorm) {
            sitIdx = sits.findIndex(s => s && normalizeReviewCompareText(s.sampleCasual) === targetEnNorm);
        }

        if (sitIdx !== -1) {
            foundStructId = struct.id;
            foundSitIdx = sitIdx;
            break;
        }
    }

    closeReviewBoxModal();

    if (foundStructId && foundSitIdx !== -1) {
        // Mở thẳng tab Luyện tập -> chế độ Cấu trúc -> đúng Trạm & đúng Câu (không qua bước chọn lọc)
        switchTab('practice');
        state.practiceMode = 'structure';
        state.activeCheckpointStageId = null;

        const structBtn = document.getElementById('mode-structure-btn');
        const topicBtn = document.getElementById('mode-topic-btn');
        const structContainer = document.getElementById('structure-mode-container');
        const topicContainer = document.getElementById('topic-mode-container');
        const topicEmptyEl = document.getElementById('topic-empty-state');
        if (structBtn) structBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-sm transition-all";
        if (topicBtn) topicBtn.className = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all";
        if (structContainer) structContainer.classList.remove('hidden');
        if (topicContainer) topicContainer.classList.add('hidden');
        if (topicEmptyEl) topicEmptyEl.classList.add('hidden');
        document.body.classList.remove('va-in-topic-practice');

        openStructureWorkspace(foundStructId);
        selectSituation(foundSitIdx);
        showToast("Đã mở thẳng câu cần ôn tập!", "success");
        return;
    }

    // 2. Dự phòng: Tìm trong EXERCISE_BANK (Chủ đề tự do)
    const bank = EXERCISE_BANK || [];
    let bankIdx = -1;
    if (candidateIds.length > 0) {
        bankIdx = bank.findIndex(q => q && q.id !== undefined && candidateIds.includes(String(q.id).trim()));
    }
    if (bankIdx === -1 && targetViNorm) {
        bankIdx = bank.findIndex(q => q && normalizeReviewCompareText(q.vi) === targetViNorm);
    }
    if (bankIdx === -1 && targetEnNorm) {
        bankIdx = bank.findIndex(q => q && normalizeReviewCompareText(q.sampleCasual) === targetEnNorm);
    }

    if (bankIdx !== -1) {
        switchTab('practice');
        switchPracticeMode('topic');
        const matchedQ = bank[bankIdx];
        const fIdx = (state.filteredList || []).findIndex(q => q && String(q.id) === String(matchedQ.id));
        if (fIdx !== -1) {
            state.currentIndex = fIdx;
        } else {
            state.filteredList = [matchedQ, ...(state.filteredList || [])];
            state.currentIndex = 0;
        }
        renderCurrentQuestion();
        showToast("Đã mở thẳng câu cần ôn tập!", "success");
        return;
    }

    showToast("Câu này không còn trong kho dữ liệu hiện tại.", "warning");
}

function renderReviewBoxModal() {
    closeReviewBoxModal();

    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const now = Date.now();

    let bodyHtml = '';
    if (reviewBox.length === 0) {
        bodyHtml = `
            <div class="py-8 px-4 text-center space-y-3">
                <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h4 class="font-extrabold text-slate-800 text-base">Hộp ôn tập đang trống!</h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Tuyệt vời! Hiện tại bạn không có câu nào bị làm sai hoặc đến hạn ôn tập định kỳ.
                </p>
            </div>
        `;
    } else {
        bodyHtml = `
            <div class="space-y-2.5 max-h-[55vh] overflow-y-auto pr-0.5">
                ${reviewBox.map((item, idx) => {
                    const rawDue = item.nextReviewDue || item.nextReview || item.dueDate || item.reviewAt || 0;
                    const dueTs = rawDue ? new Date(rawDue).getTime() : 0;
                    const isDue = !dueTs || dueTs <= now;
                    const dateStr = dueTs
                        ? new Date(dueTs).toLocaleDateString('vi-VN')
                        : 'Hôm nay';
                    const viText = getReviewItemViText(item) || 'Tình huống ôn tập';
                    return `
                        <div class="p-3.5 rounded-2xl border ${isDue ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60'} flex items-center justify-between gap-3">
                            <div class="min-w-0 flex-1 space-y-1">
                                <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${isDue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">
                                    ${isDue ? 'Đến hạn ôn tập' : 'Chưa đạt • Cần ôn lại'}
                                </span>
                                <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">"${esc(viText)}"</p>
                                <p class="text-[11px] text-slate-500 italic">Hẹn ôn lại: ${dateStr}</p>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button type="button" onclick="jumpToReviewBoxQuestionByIndex(${idx})" class="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all">
                                    Ôn ngay
                                </button>
                                <button type="button" onclick="removeFromReviewBoxByIndex(${idx})" class="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 flex items-center justify-center transition-all" title="Xóa khỏi hộp ôn tập">
                                    <i class="fa-regular fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    const modal = document.createElement('div');
    modal.id = 'va-review-box-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4';
    modal.setAttribute('onclick', 'if(event.target === this) closeReviewBoxModal()');
    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base shrink-0">
                        <i class="fa-solid fa-brain"></i>
                    </div>
                    <h3 class="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">Hộp Ôn Tập Thông Minh (Spaced Repetition)</h3>
                </div>
                <button type="button" onclick="closeReviewBoxModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 transition-all" title="Đóng (Esc)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-5 space-y-3">
                <p class="text-xs text-slate-500 leading-relaxed">
                    Hệ thống tự động nhắc lại các câu bạn từng làm chưa tốt sau mỗi chu kỳ 3 ngày.
                </p>
                ${bodyHtml}
            </div>
            <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button type="button" onclick="closeReviewBoxModal()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all">
                    Đóng
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}


// ==================== TỪ VỰNG TRỌNG TÂM CỦA TRẠM (TRONG TAB LÝ THUYẾT) ====================
function getStationVocabItems(structId) {
    const repo = Array.isArray(window.VOCAB_REPOSITORY_DATA) ? window.VOCAB_REPOSITORY_DATA : [];
    return repo.filter(item => item && item.structId === structId);
}

function speakStationVocabItem(vocabId, btnEl) {
    const repo = Array.isArray(window.VOCAB_REPOSITORY_DATA) ? window.VOCAB_REPOSITORY_DATA : [];
    const item = repo.find(v => v.id === vocabId);
    if (item && item.term && typeof speakText === 'function') {
        speakText(item.term, btnEl, 0.9);
    }
}

function saveStationVocabItem(vocabId, btnEl) {
    const repo = Array.isArray(window.VOCAB_REPOSITORY_DATA) ? window.VOCAB_REPOSITORY_DATA : [];
    const item = repo.find(v => v.id === vocabId);
    if (!item) return;

    if (typeof window.saveWordToVocabBank === 'function') {
        window.saveWordToVocabBank(item.term, item.vi, btnEl);
    } else {
        showToast('Chức năng Sổ tay từ vựng chưa sẵn sàng.', 'warning');
    }
}

function renderStationVocabInTheory(struct) {
    const box = document.getElementById('ws-station-vocab-box');
    const listEl = document.getElementById('ws-station-vocab-list');
    const countEl = document.getElementById('ws-station-vocab-count');
    if (!box || !listEl || !struct) return;

    const items = getStationVocabItems(struct.id);
    if (items.length === 0) {
        box.classList.add('hidden');
        listEl.innerHTML = '';
        return;
    }

    box.classList.remove('hidden');
    if (countEl) countEl.innerText = `${items.length} từ`;

    let savedSet = new Set();
    try {
        const savedBank = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
        savedSet = new Set(savedBank.map(v => String(v.en || '').trim().toLowerCase()));
    } catch (e) {}

    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    listEl.innerHTML = items.map(item => {
        const isSaved = savedSet.has(String(item.term || '').trim().toLowerCase());
        const saveBtn = isSaved
            ? `<span class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 shrink-0"><i class="fa-solid fa-check text-[10px]"></i>Đã lưu</span>`
            : `<button type="button" onclick="saveStationVocabItem('${item.id}', this)" class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200/90 hover:border-indigo-600 font-bold text-[11px] inline-flex items-center gap-1 shrink-0 transition-all" title="Lưu vào Sổ tay từ vựng"><i class="fa-solid fa-plus text-[9px]"></i>Lưu</button>`;

        return `
            <div class="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-200 transition-all flex items-start justify-between gap-2.5">
                <div class="min-w-0 flex-1 space-y-0.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-extrabold text-sm text-indigo-950">${esc(item.term)}</span>
                        ${item.pos ? `<span class="text-[10px] font-bold text-slate-400">(${esc(item.pos)})</span>` : ''}
                        <span class="font-mono text-[11px] text-indigo-600">${esc(item.ipa)}</span>
                    </div>
                    <p class="text-xs font-bold text-emerald-700">${esc(item.vi)}</p>
                    ${item.exampleEn ? `<p class="text-[11px] text-slate-500 italic truncate" title="${esc(item.exampleVi)}">"${esc(item.exampleEn)}"</p>` : ''}
                </div>
                <div class="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button type="button" onclick="speakStationVocabItem('${item.id}', this)" class="w-8 h-8 rounded-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 flex items-center justify-center transition-all" title="Nghe phát âm">
                        <i class="fa-solid fa-volume-high text-xs"></i>
                    </button>
                    ${saveBtn}
                </div>
            </div>
        `;
    }).join('');
}


// ==================== LUYỆN NGHE–NÓI TOÀN TRẠM (AUDIO DRILL & SHADOWING) ====================
const audioDrillState = {
    isOpen: false,
    structId: null,
    situations: [],
    index: 0,
    mode: 'reflex',        // 'reflex' (Việt -> Nghỉ -> Anh) | 'shadowing' (Anh -> Nghỉ -> Nhại)
    isPlaying: false,
    phase: 'idle',         // 'idle' | 'thinking' | 'speaking' | 'shadowing' | 'pause' | 'done'
    speed: 0.85,           // 0.75 | 0.85 | 1.0
    waitSec: 5,            // 0 | 3 | 5 | 7
    continuousLoop: false, // true = phát lặp liên tục cả Trạm không dừng
    hideEnglish: false,
    revealedManually: false,
    remainingMs: 0,
    totalWaitMs: 5000,
    timerId: null,
    intervalId: null,
    runId: 0
};

function ensureAudioDrillTriggerButton() {
    const switcher = document.getElementById('ws-subtab-switcher');
    if (!switcher || !switcher.parentElement) return;
    if (document.getElementById('ws-audio-drill-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'ws-audio-drill-btn';
    btn.type = 'button';
    btn.onclick = () => openAudioDrillModal();
    btn.className = 'inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 shadow-2xs transition-all shrink-0';
    btn.title = 'Luyện Nghe–Nói & Shadowing toàn Trạm';
    btn.innerHTML = `<i class="fa-solid fa-headphones text-indigo-600 text-xs"></i><span class="hidden sm:inline">Nghe–Nói</span>`;

    switcher.parentElement.insertBefore(btn, switcher);
}

function clearAudioDrillTimers() {
    if (audioDrillState.timerId) {
        clearTimeout(audioDrillState.timerId);
        audioDrillState.timerId = null;
    }
    if (audioDrillState.intervalId) {
        clearInterval(audioDrillState.intervalId);
        audioDrillState.intervalId = null;
    }
}

function openAudioDrillModal(structId = null) {
    const targetId = structId || state.selectedStructureId;
    const struct = (SENTENCE_STRUCTURES || []).find(s => s.id === targetId);
    if (!struct || !Array.isArray(struct.situations) || struct.situations.length === 0) {
        showToast('Trạm này chưa có câu hỏi nào để luyện Nghe–Nói.', 'warning');
        return;
    }

    closeAudioDrillModal();

    audioDrillState.isOpen = true;
    audioDrillState.structId = struct.id;
    audioDrillState.situations = struct.situations;
    audioDrillState.index = Math.min(state.currentSituationIndex || 0, struct.situations.length - 1);
    audioDrillState.isPlaying = false;
    audioDrillState.phase = 'idle';
    audioDrillState.revealedManually = false;
    audioDrillState.runId++;

    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const modal = document.createElement('div');
    modal.id = 'va-audio-drill-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
    modal.setAttribute('onclick', 'if(event.target === this) closeAudioDrillModal()');
    modal.innerHTML = `
        <div class="bg-slate-50 rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 px-5 py-4 text-white flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-base shrink-0">
                        <i class="fa-solid fa-headphones text-amber-300"></i>
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-extrabold text-sm sm:text-base leading-tight truncate">Luyện Nghe–Nói • ${esc(struct.shortName || struct.title)}</h3>
                        <p class="text-[11px] text-indigo-200 truncate">Tự động phát & đếm ngược qua ${struct.situations.length} câu</p>
                    </div>
                </div>
                <button type="button" onclick="closeAudioDrillModal()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 transition-all" title="Đóng (Esc)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Body -->
            <div class="p-4 sm:p-5 space-y-3.5 max-h-[84vh] overflow-y-auto">
                <!-- Chọn 2 chế độ: Phản xạ Nói vs Shadowing -->
                <div class="grid grid-cols-2 gap-1.5 bg-slate-200/75 p-1 rounded-2xl text-xs font-bold">
                    <button id="ad-mode-reflex" type="button" onclick="setAudioDrillMode('reflex')" class="py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-bolt text-amber-500"></i>
                        <span>Phản xạ Nói</span>
                    </button>
                    <button id="ad-mode-shadowing" type="button" onclick="setAudioDrillMode('shadowing')" class="py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-ear-listen text-indigo-600"></i>
                        <span>Nghe & Shadowing</span>
                    </button>
                </div>

                <!-- Thẻ Câu tiếng Việt -->
                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 text-center space-y-2 relative">
                    <button type="button" onclick="replayAudioDrillCurrent()" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe lại câu tiếng Anh">
                        <i class="fa-solid fa-volume-high text-xs"></i>
                    </button>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Câu tiếng Việt</span>
                    <p id="ad-vi-text" class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug px-2">...</p>
                </div>

                <!-- Thanh trạng thái & đếm ngược khoảng lặng -->
                <div id="ad-status-box" class="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-center transition-all">
                    <div id="ad-countdown-fill" class="absolute inset-y-0 left-0 bg-emerald-300/35 transition-all duration-100" style="width: 0%"></div>
                    <p id="ad-status-text" class="relative z-10 text-xs sm:text-sm font-extrabold text-emerald-900">Bấm Phát để bắt đầu luyện Nghe–Nói</p>
                </div>

                <!-- Thẻ Đáp án chuẩn (Có thể làm mờ khi đang đếm ngược hoặc bật Ẩn tiếng Anh) -->
                <div onclick="revealAudioDrillAnswerManually()" class="cursor-pointer bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-1.5 relative transition-all hover:border-indigo-300" title="Chạm để hiện / nghe đáp án">
                    <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span class="uppercase tracking-wider">Đáp án chuẩn</span>
                        <span id="ad-reveal-hint" class="text-indigo-500"></span>
                    </div>
                    <div id="ad-en-wrap" class="transition-all duration-200 space-y-1">
                        <p id="ad-en-text" class="text-base sm:text-lg font-extrabold text-indigo-950 leading-snug">...</p>
                        <p id="ad-ipa-text" class="font-mono text-xs text-indigo-600">...</p>
                    </div>
                </div>

                <!-- Thanh điều khiển chính: Phát liên tục | Trước | Phát/Tạm dừng | Tiếp | Nghe lại -->
                <div class="pt-1 space-y-3">
                    <div class="flex items-center justify-center gap-4 sm:gap-5">
                        <button id="ad-loop-btn" type="button" onclick="toggleAudioDrillLoop()" class="w-10 h-10 rounded-full bg-white hover:bg-indigo-50 text-slate-500 border border-slate-200 shadow-2xs flex items-center justify-center transition-all" title="Bật / Tắt phát liên tục (Lặp lại cả Trạm)">
                            <i class="fa-solid fa-repeat text-xs"></i>
                        </button>
                        <button type="button" onclick="stepAudioDrill(-1)" class="w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs flex items-center justify-center transition-all" title="Câu trước">
                            <i class="fa-solid fa-backward-step text-sm"></i>
                        </button>
                        <button id="ad-play-btn" type="button" onclick="toggleAudioDrillPlay()" class="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex items-center justify-center text-xl transition-all" title="Phát / Tạm dừng">
                            <i id="ad-play-icon" class="fa-solid fa-play ml-0.5"></i>
                        </button>
                        <button type="button" onclick="stepAudioDrill(1)" class="w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs flex items-center justify-center transition-all" title="Câu tiếp theo">
                            <i class="fa-solid fa-forward-step text-sm"></i>
                        </button>
                        <button type="button" onclick="replayAudioDrillCurrent()" class="w-10 h-10 rounded-full bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 shadow-2xs flex items-center justify-center transition-all" title="Nghe lại câu hiện tại">
                            <i class="fa-solid fa-rotate-right text-xs"></i>
                        </button>
                    </div>

                    <!-- Bộ đếm câu & Thanh tiến độ toàn Trạm -->
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                            <span id="ad-counter-text">Câu 1 / 15</span>
                            <span id="ad-progress-pct" class="text-indigo-600">7%</span>
                        </div>
                        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div id="ad-progress-bar" class="h-full bg-indigo-600 rounded-full transition-all duration-300" style="width: 7%"></div>
                        </div>
                    </div>
                </div>

                <!-- Hàng tùy chọn nhanh: Tốc độ | Thời gian chờ | Ẩn tiếng Anh -->
                <div class="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                        <button id="ad-speed-btn" type="button" onclick="cycleAudioDrillSpeed()" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 transition-all">
                            Tốc độ: 0.85x
                        </button>
                        <button id="ad-wait-btn" type="button" onclick="cycleAudioDrillWait()" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all">
                            Chờ: 5s
                        </button>
                    </div>
                    <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                        <input id="ad-hide-en-toggle" type="checkbox" onchange="toggleAudioDrillHideEnglish(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                        <span>Ẩn tiếng Anh</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    updateAudioDrillUI();
}

function closeAudioDrillModal() {
    clearAudioDrillTimers();
    audioDrillState.isPlaying = false;
    audioDrillState.isOpen = false;
    audioDrillState.runId++;
    if (typeof stopAllPlayback === 'function') stopAllPlayback();
    const modal = document.getElementById('va-audio-drill-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function setAudioDrillMode(mode) {
    audioDrillState.mode = mode === 'shadowing' ? 'shadowing' : 'reflex';
    audioDrillState.waitSec = audioDrillState.mode === 'shadowing' ? 3 : 5;
    audioDrillState.revealedManually = false;
    clearAudioDrillTimers();
    audioDrillState.runId++;
    if (typeof stopAllPlayback === 'function') stopAllPlayback();

    if (audioDrillState.isPlaying) {
        startAudioDrillCurrentItem();
    } else {
        audioDrillState.phase = 'idle';
        updateAudioDrillUI();
    }
}

function cycleAudioDrillSpeed() {
    const speeds = [0.75, 0.85, 1.0];
    const idx = speeds.indexOf(audioDrillState.speed);
    audioDrillState.speed = speeds[(idx + 1) % speeds.length];
    updateAudioDrillUI();
}

function cycleAudioDrillWait() {
    const waits = [0, 3, 5, 7];
    const idx = waits.indexOf(audioDrillState.waitSec);
    audioDrillState.waitSec = waits[(idx + 1) % waits.length];
    updateAudioDrillUI();
}

function toggleAudioDrillLoop() {
    audioDrillState.continuousLoop = !audioDrillState.continuousLoop;
    updateAudioDrillUI();
    showToast(
        audioDrillState.continuousLoop
            ? '🔁 Đã bật Phát liên tục (Lặp lại cả Trạm không dừng)'
            : 'Đã tắt chế độ lặp lại cả Trạm',
        'info'
    );
}

function toggleAudioDrillHideEnglish(checked) {
    audioDrillState.hideEnglish = Boolean(checked);
    audioDrillState.revealedManually = false;
    updateAudioDrillUI();
}

function revealAudioDrillAnswerManually() {
    audioDrillState.revealedManually = !audioDrillState.revealedManually;
    updateAudioDrillUI();
}

function replayAudioDrillCurrent() {
    const item = audioDrillState.situations[audioDrillState.index];
    if (!item || typeof speakText !== 'function') return;
    speakText(item.sampleCasual, null, audioDrillState.speed, { audioId: item.id });
}

function toggleAudioDrillPlay() {
    if (audioDrillState.isPlaying) {
        audioDrillState.isPlaying = false;
        audioDrillState.phase = 'idle';
        audioDrillState.runId++;
        clearAudioDrillTimers();
        if (typeof stopAllPlayback === 'function') stopAllPlayback();
        updateAudioDrillUI();
    } else {
        if (audioDrillState.phase === 'done') {
            audioDrillState.index = 0;
        }
        audioDrillState.isPlaying = true;
        startAudioDrillCurrentItem();
    }
}

function stepAudioDrill(delta) {
    const total = audioDrillState.situations.length;
    if (total === 0) return;
    clearAudioDrillTimers();
    audioDrillState.runId++;
    if (typeof stopAllPlayback === 'function') stopAllPlayback();
    audioDrillState.index = (audioDrillState.index + delta + total) % total;
    audioDrillState.revealedManually = false;

    if (audioDrillState.isPlaying) {
        startAudioDrillCurrentItem();
    } else {
        audioDrillState.phase = 'idle';
        updateAudioDrillUI();
    }
}

function runAudioDrillCountdown(seconds, phaseName, myRunId, onDone) {
    clearAudioDrillTimers();
    audioDrillState.phase = phaseName;
    audioDrillState.totalWaitMs = seconds * 1000;
    audioDrillState.remainingMs = audioDrillState.totalWaitMs;
    updateAudioDrillUI();

    const startTime = Date.now();
    audioDrillState.intervalId = setInterval(() => {
        if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) {
            clearAudioDrillTimers();
            return;
        }
        const elapsed = Date.now() - startTime;
        audioDrillState.remainingMs = Math.max(0, audioDrillState.totalWaitMs - elapsed);
        updateAudioDrillCountdownBar();
        if (audioDrillState.remainingMs <= 0) {
            clearAudioDrillTimers();
            if (typeof onDone === 'function') onDone();
        }
    }, 100);
}

function startAudioDrillCurrentItem() {
    clearAudioDrillTimers();
    const myRunId = ++audioDrillState.runId;
    const item = audioDrillState.situations[audioDrillState.index];
    if (!item) return;

    audioDrillState.revealedManually = false;

    const moveNextAfterShortPause = () => {
        if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
        audioDrillState.phase = 'pause';
        updateAudioDrillUI();
        audioDrillState.timerId = setTimeout(() => {
            if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
            if (audioDrillState.index + 1 < audioDrillState.situations.length) {
                audioDrillState.index++;
                startAudioDrillCurrentItem();
            } else if (audioDrillState.continuousLoop) {
                audioDrillState.index = 0;
                startAudioDrillCurrentItem();
            } else {
                audioDrillState.isPlaying = false;
                audioDrillState.phase = 'done';
                updateAudioDrillUI();
                showToast('🎉 Tuyệt vời! Bạn đã hoàn thành trọn vòng Nghe–Nói của Trạm này!', 'success');
            }
        }, 1200);
    };

    const speakNow = (afterSpeak) => {
        if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
        audioDrillState.phase = 'speaking';
        updateAudioDrillUI();
        speakText(item.sampleCasual, null, audioDrillState.speed, {
            audioId: item.id,
            onComplete: () => {
                if (typeof afterSpeak === 'function') afterSpeak();
            }
        });
    };

    if (audioDrillState.mode === 'reflex') {
        // Chế độ 1: Việt -> Đếm ngược tự nói (bỏ qua nếu Chờ: 0s) -> Hiện đáp án & Phát MP3 -> Sang câu tiếp
        if (audioDrillState.waitSec > 0) {
            runAudioDrillCountdown(audioDrillState.waitSec, 'thinking', myRunId, () => {
                speakNow(() => moveNextAfterShortPause());
            });
        } else {
            speakNow(() => moveNextAfterShortPause());
        }
    } else {
        // Chế độ 2: Phát mẫu Anh trước -> Đếm ngược nhại Shadowing (bỏ qua nếu Chờ: 0s) -> Sang câu tiếp
        speakNow(() => {
            if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
            if (audioDrillState.waitSec > 0) {
                runAudioDrillCountdown(audioDrillState.waitSec, 'shadowing', myRunId, () => {
                    moveNextAfterShortPause();
                });
            } else {
                moveNextAfterShortPause();
            }
        });
    }
}

function updateAudioDrillCountdownBar() {
    const fillEl = document.getElementById('ad-countdown-fill');
    const statusText = document.getElementById('ad-status-text');
    if (!fillEl || !statusText) return;

    const secsLeft = Math.max(1, Math.ceil(audioDrillState.remainingMs / 1000));
    const pct = audioDrillState.totalWaitMs > 0
        ? Math.min(100, Math.round(((audioDrillState.totalWaitMs - audioDrillState.remainingMs) / audioDrillState.totalWaitMs) * 100))
        : 0;
    fillEl.style.width = `${pct}%`;

    if (audioDrillState.phase === 'thinking') {
        statusText.innerText = `Đang đếm ngược: ${secsLeft}s... Hãy tự dịch nói thành tiếng!`;
    } else if (audioDrillState.phase === 'shadowing') {
        statusText.innerText = `🎙️ Đến lượt bạn nhại lại: ${secsLeft}s...`;
    }
}

function updateAudioDrillUI() {
    if (!audioDrillState.isOpen) return;
    const item = audioDrillState.situations[audioDrillState.index];
    const total = audioDrillState.situations.length;
    if (!item) return;

    // 1. Mode pills
    const reflexBtn = document.getElementById('ad-mode-reflex');
    const shadowBtn = document.getElementById('ad-mode-shadowing');
    const activePill = 'py-2 px-2 rounded-xl bg-white text-indigo-700 shadow-2xs font-extrabold transition-all flex items-center justify-center gap-1.5';
    const inactivePill = 'py-2 px-2 rounded-xl text-slate-600 hover:text-indigo-700 font-bold transition-all flex items-center justify-center gap-1.5';
    if (reflexBtn) reflexBtn.className = audioDrillState.mode === 'reflex' ? activePill : inactivePill;
    if (shadowBtn) shadowBtn.className = audioDrillState.mode === 'shadowing' ? activePill : inactivePill;

    // 2. Sentences & IPA
    const viEl = document.getElementById('ad-vi-text');
    const enEl = document.getElementById('ad-en-text');
    const ipaEl = document.getElementById('ad-ipa-text');
    const enWrap = document.getElementById('ad-en-wrap');
    const revealHint = document.getElementById('ad-reveal-hint');

    if (viEl) viEl.innerText = item.vi || '';
    if (enEl) enEl.innerText = item.sampleCasual || '';
    if (ipaEl) ipaEl.innerText = item.ipa || (typeof sentenceToIPA === 'function' ? sentenceToIPA(item.sampleCasual) : '');

    // Ẩn mờ tiếng Anh khi: bật "Ẩn tiếng Anh" HOẶC đang đếm ngược suy nghĩ ở chế độ Phản xạ Nói (trừ khi người dùng chạm tay mở xem)
    const shouldBlur = !audioDrillState.revealedManually && (
        audioDrillState.hideEnglish ||
        (audioDrillState.mode === 'reflex' && (audioDrillState.phase === 'thinking' || audioDrillState.phase === 'idle'))
    );

    if (enWrap) {
        if (shouldBlur) enWrap.classList.add('blur-sm', 'select-none', 'opacity-55');
        else enWrap.classList.remove('blur-sm', 'select-none', 'opacity-55');
    }
    if (revealHint) {
        revealHint.innerText = shouldBlur ? 'Chạm để xem đáp án' : '';
    }

    // 3. Status box & countdown fill
    const statusBox = document.getElementById('ad-status-box');
    const statusText = document.getElementById('ad-status-text');
    const fillEl = document.getElementById('ad-countdown-fill');

    if (statusBox && statusText && fillEl) {
        if (audioDrillState.phase === 'thinking' || audioDrillState.phase === 'shadowing') {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs sm:text-sm font-extrabold text-emerald-900';
            updateAudioDrillCountdownBar();
        } else if (audioDrillState.phase === 'speaking') {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/90 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs sm:text-sm font-extrabold text-indigo-800';
            fillEl.style.width = '100%';
            statusText.innerText = audioDrillState.mode === 'shadowing'
                ? `🔊 Đang phát mẫu (${audioDrillState.speed}x)... Hãy lắng nghe ngữ điệu`
                : `🔊 Đang phát đáp án chuẩn (${audioDrillState.speed}x)...`;
        } else if (audioDrillState.phase === 'pause') {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs font-bold text-slate-600';
            fillEl.style.width = '0%';
            statusText.innerText = 'Chuẩn bị sang câu tiếp theo...';
        } else if (audioDrillState.phase === 'done') {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs sm:text-sm font-extrabold text-amber-900';
            fillEl.style.width = '0%';
            statusText.innerText = '🎉 Đã hoàn thành toàn bộ Trạm! Bấm Phát để luyện lại.';
        } else {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs font-bold text-indigo-700';
            fillEl.style.width = '0%';
            statusText.innerText = audioDrillState.mode === 'shadowing'
                ? 'Bấm Phát để nghe mẫu rồi nhại lại theo nhịp'
                : 'Bấm Phát: nhìn tiếng Việt → tự nói → nghe đáp án chuẩn';
        }
    }

    // 4. Play / Pause icon & progress
    const playIcon = document.getElementById('ad-play-icon');
    if (playIcon) {
        playIcon.className = audioDrillState.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play ml-0.5';
    }

    const curNum = audioDrillState.index + 1;
    const pct = Math.round((curNum / total) * 100);
    const counterEl = document.getElementById('ad-counter-text');
    const pctEl = document.getElementById('ad-progress-pct');
    const barEl = document.getElementById('ad-progress-bar');
    if (counterEl) counterEl.innerText = `Câu ${curNum} / ${total}`;
    if (pctEl) pctEl.innerText = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;

    // 5. Loop button & Quick settings labels
    const loopBtn = document.getElementById('ad-loop-btn');
    if (loopBtn) {
        if (audioDrillState.continuousLoop) {
            loopBtn.className = 'w-10 h-10 rounded-full bg-indigo-600 text-white border border-indigo-600 shadow-sm shadow-indigo-200 flex items-center justify-center transition-all';
            loopBtn.title = 'Đang bật Phát liên tục (Lặp lại cả Trạm) — Bấm để tắt';
        } else {
            loopBtn.className = 'w-10 h-10 rounded-full bg-white hover:bg-indigo-50 text-slate-500 border border-slate-200 shadow-2xs flex items-center justify-center transition-all';
            loopBtn.title = 'Bật Phát liên tục (Lặp lại cả Trạm)';
        }
    }

    const speedBtn = document.getElementById('ad-speed-btn');
    const waitBtn = document.getElementById('ad-wait-btn');
    const hideChk = document.getElementById('ad-hide-en-toggle');
    if (speedBtn) speedBtn.innerText = `Tốc độ: ${audioDrillState.speed}x`;
    if (waitBtn) waitBtn.innerText = audioDrillState.waitSec === 0 ? 'Chờ: 0s' : `Chờ: ${audioDrillState.waitSec}s`;
    if (hideChk) hideChk.checked = audioDrillState.hideEnglish;
}

document.addEventListener('DOMContentLoaded', () => {
    ensureAudioDrillTriggerButton();
});

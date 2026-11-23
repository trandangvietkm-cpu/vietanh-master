/**
 * MODULE 3: ĐIỀU KHIỂN GIAO DIỆN & TƯƠNG TÁC HỌC VIÊN (js/app_controller.js)
 * Phụ trách: Điều hướng Tab, Trang chủ Dashboard, Bộ lọc CEFR/Ngữ pháp, Thư viện Cấu trúc,
 *            Phòng luyện tập, Thanh công cụ đáy (Floating Dock), Phím tắt & Modal Tâm sự tác giả.
 */

        function switchTab(tab) {
            const targetTab = ['home', 'practice', 'notebook', 'review', 'dictionary', 'profile'].includes(tab)
                ? tab
                : 'practice';
            state.activeTab = targetTab;

            if (typeof stopAudioDrillSession === 'function') stopAudioDrillSession(false);

            // 1. Ẩn đồng loạt mọi màn hình view-* bên trong <main>
            const mainEl = document.querySelector('main');
            if (mainEl) {
                Array.from(mainEl.children).forEach(el => {
                    if (el.id && el.id.startsWith('view-')) {
                        el.classList.add('hidden');
                    }
                });
            }

            // 2. Gỡ trạng thái phòng luyện mặc định
            document.body.classList.remove('va-in-workspace', 'va-in-topic-practice');

            // 3. Mở đúng 1 màn hình mục tiêu
            if (targetTab === 'home') {
                document.getElementById('view-home')?.classList.remove('hidden');
                if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
                if (typeof window.renderDailyFiveWordsWidget === 'function') window.renderDailyFiveWordsWidget();
            } else if (targetTab === 'notebook') {
                document.getElementById('view-notebook')?.classList.remove('hidden');
                if (typeof window.onEnterNotebookTab === 'function') {
                    window.onEnterNotebookTab();
                } else if (typeof renderNotebook === 'function') {
                    renderNotebook();
                }
            } else if (targetTab === 'review') {
                document.getElementById('view-review')?.classList.remove('hidden');
                if (typeof renderReviewPage === 'function') renderReviewPage();
            } else if (targetTab === 'dictionary') {
                if (typeof window.onEnterDictionaryTab === 'function') window.onEnterDictionaryTab();
                document.getElementById('view-dictionary')?.classList.remove('hidden');
            } else if (targetTab === 'profile') {
                document.getElementById('view-profile')?.classList.remove('hidden');
                if (typeof window.onEnterProfileTab === 'function') window.onEnterProfileTab();
            } else {
                document.getElementById('view-practice')?.classList.remove('hidden');
                if (state.practiceMode === 'structure' && state.selectedStructureId) {
                    document.body.classList.add('va-in-workspace');
                } else if (state.practiceMode === 'topic') {
                    document.body.classList.add('va-in-topic-practice');
                }
            }

            // 4. Đồng bộ trạng thái nút Từ điển trên Header & Bottom Nav Mobile
            const dictBtn = document.getElementById('nav-dictionary-btn');
            if (dictBtn) {
                dictBtn.className = targetTab === 'dictionary'
                    ? "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all shrink-0"
                    : "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all shrink-0";
            }
            if (typeof window.onTabChanged === 'function') {
                window.onTabChanged(targetTab);
            }

            window.scrollTo(0, 0);
        }

// [Đã tách Trang chủ Dashboard, Bộ lọc & Sơ đồ học 8 Chặng sang: js/dashboard_roadmap.js]

function syncTopicSubTabButtonsUI(target) {
            const btnPractice = document.getElementById('topic-tab-practice-btn');
            const btnDictation = document.getElementById('topic-tab-dictation-btn');
            const btnAudio = document.getElementById('topic-tab-audiodrill-btn');

            const activeCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-extrabold bg-white text-indigo-700 shadow-xs transition-all";
            const activeDictCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-extrabold bg-white text-emerald-700 shadow-xs transition-all";
            const inactiveCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold text-slate-600 hover:text-indigo-700 transition-all";

            if (btnPractice) { btnPractice.className = inactiveCls; btnPractice.setAttribute('aria-selected', 'false'); }
            if (btnDictation) { btnDictation.className = inactiveCls; btnDictation.setAttribute('aria-selected', 'false'); }
            if (btnAudio) { btnAudio.className = inactiveCls; btnAudio.setAttribute('aria-selected', 'false'); }

            // Đồng bộ cụm 3 Tab viên thuốc trên Banner Checkpoint cuối Chặng
            const cpPractice = document.getElementById('cp-tab-practice-btn');
            const cpDictation = document.getElementById('cp-tab-dictation-btn');
            const cpAudio = document.getElementById('cp-tab-audiodrill-btn');

            const cpActivePractice = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-white text-orange-700 shadow-xs transition-all";
            const cpActiveDict = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-white text-emerald-700 shadow-xs transition-all";
            const cpActiveAudio = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-white text-indigo-700 shadow-xs transition-all";
            const cpInactive = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 transition-all";

            if (cpPractice) {
                cpPractice.className = cpInactive;
                cpPractice.setAttribute('aria-selected', 'false');
                cpPractice.innerHTML = `<i class="fa-solid fa-bolt text-amber-200 text-xs"></i><span>Luyện dịch</span>`;
            }
            if (cpDictation) {
                cpDictation.className = cpInactive;
                cpDictation.setAttribute('aria-selected', 'false');
                cpDictation.innerHTML = `<i class="fa-solid fa-pen-nib text-emerald-200 text-xs"></i><span>Nghe chép</span>`;
            }
            if (cpAudio) {
                cpAudio.className = cpInactive;
                cpAudio.setAttribute('aria-selected', 'false');
                cpAudio.innerHTML = `<i class="fa-solid fa-headphones text-amber-200 text-xs"></i><span>Nghe–Nói</span>`;
            }

            if (target === 'dictation') {
                if (btnDictation) { btnDictation.className = activeDictCls; btnDictation.setAttribute('aria-selected', 'true'); }
                if (cpDictation) {
                    cpDictation.className = cpActiveDict;
                    cpDictation.setAttribute('aria-selected', 'true');
                    cpDictation.innerHTML = `<i class="fa-solid fa-pen-nib text-emerald-600 text-xs"></i><span>Nghe chép</span>`;
                }
            } else if (target === 'audiodrill') {
                if (btnAudio) { btnAudio.className = activeCls; btnAudio.setAttribute('aria-selected', 'true'); }
                if (cpAudio) {
                    cpAudio.className = cpActiveAudio;
                    cpAudio.setAttribute('aria-selected', 'true');
                    cpAudio.innerHTML = `<i class="fa-solid fa-headphones text-indigo-600 text-xs"></i><span>Nghe–Nói</span>`;
                }
            } else {
                if (btnPractice) { btnPractice.className = activeCls; btnPractice.setAttribute('aria-selected', 'true'); }
                if (cpPractice) {
                    cpPractice.className = cpActivePractice;
                    cpPractice.setAttribute('aria-selected', 'true');
                    cpPractice.innerHTML = `<i class="fa-solid fa-bolt text-amber-500 text-xs"></i><span>Luyện dịch</span>`;
                }
            }
        }

        function switchTopicSubTab(tab) {
            const target = (tab === 'dictation' || tab === 'audiodrill') ? tab : 'practice';
            state.topicSubTab = target;
            syncTopicSubTabButtonsUI(target);

            const dictationPanel = document.getElementById('ws-dictation-panel');
            const audiodrillPanel = document.getElementById('ws-audiodrill-panel');
            const exerciseCard = document.getElementById('shared-exercise-card');
            const resultPanel = document.getElementById('result-panel');
            const emptyStateEl = document.getElementById('topic-empty-state');

            if (typeof stopAudioDrillSession === 'function') stopAudioDrillSession(false);

            if (dictationPanel) dictationPanel.classList.add('hidden');
            if (audiodrillPanel) audiodrillPanel.classList.add('hidden');
            if (exerciseCard) exerciseCard.classList.add('hidden');

            if (!state.filteredList || state.filteredList.length === 0) {
                if (emptyStateEl) emptyStateEl.classList.remove('hidden');
                return;
            }

            if (target === 'dictation') {
                if (resultPanel) resultPanel.classList.add('hidden');
                if (dictationPanel) dictationPanel.classList.remove('hidden');
                if (typeof initDictationTabForList === 'function') {
                    const contextKey = state.activeCheckpointStageId
                        ? `cp_${state.activeCheckpointStageId}`
                        : `topic_${state.currentTopic}_${state.currentLevel}_${state.topicTenseFilter}_${state.topicFormFilter}`;
                    initDictationTabForList(state.filteredList, contextKey, state.currentIndex || 0);
                }
            } else if (target === 'audiodrill') {
                if (resultPanel) resultPanel.classList.add('hidden');
                if (audiodrillPanel) audiodrillPanel.classList.remove('hidden');
                if (typeof mountAudioDrillIntoPanel === 'function') {
                    const cpStageInfo = (state.activeCheckpointStageId && typeof getStageInfoById === 'function')
                        ? getStageInfoById(state.activeCheckpointStageId)
                        : null;
                    const topicTitle = state.activeCheckpointStageId
                        ? (cpStageInfo ? `Checkpoint ${cpStageInfo.shortTitle}` : 'Ôn trộn cuối Chặng')
                        : (state.currentTopic && state.currentTopic !== 'all' ? (TOPIC_LABELS[state.currentTopic] || 'Chủ đề tự do') : 'Chủ đề tự do');
                    mountAudioDrillIntoPanel(state.filteredList, topicTitle, state.currentIndex || 0, null);
                }
            } else {
                if (exerciseCard) exerciseCard.classList.remove('hidden');
                renderCurrentQuestion();
            }
        }

        function switchWorkspaceSubTab(tab) {
            const target = (tab === 'theory' || tab === 'dictation' || tab === 'audiodrill') ? tab : 'practice';
            state.workspaceSubTab = target;

            const theoryPanel = document.getElementById('ws-theory-panel');
            const dictationPanel = document.getElementById('ws-dictation-panel');
            const audiodrillPanel = document.getElementById('ws-audiodrill-panel');
            const stepperCard = document.getElementById('ws-stepper-card');
            const exerciseCard = document.getElementById('shared-exercise-card');
            const resultPanel = document.getElementById('result-panel');
            const btnTheory = document.getElementById('ws-tab-theory-btn');
            const btnPractice = document.getElementById('ws-tab-practice-btn');
            const btnDictation = document.getElementById('ws-tab-dictation-btn');
            const btnAudio = document.getElementById('ws-tab-audiodrill-btn');
            const detailsBody = document.getElementById('formula-details-body');

            const activeCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-indigo-700 shadow-xs transition-all";
            const activeDictCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-emerald-700 shadow-xs transition-all";
            const inactiveCls = "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-indigo-700 transition-all";

            if (typeof stopAudioDrillSession === 'function') stopAudioDrillSession(false);

            if (theoryPanel) theoryPanel.classList.add('hidden');
            if (dictationPanel) dictationPanel.classList.add('hidden');
            if (audiodrillPanel) audiodrillPanel.classList.add('hidden');
            if (stepperCard) stepperCard.classList.add('hidden');
            if (exerciseCard) exerciseCard.classList.add('hidden');

            if (btnTheory) { btnTheory.className = inactiveCls; btnTheory.setAttribute('aria-selected', 'false'); }
            if (btnPractice) { btnPractice.className = inactiveCls; btnPractice.setAttribute('aria-selected', 'false'); }
            if (btnDictation) { btnDictation.className = inactiveCls; btnDictation.setAttribute('aria-selected', 'false'); }
            if (btnAudio) { btnAudio.className = inactiveCls; btnAudio.setAttribute('aria-selected', 'false'); }

            if (target === 'theory') {
                if (theoryPanel) theoryPanel.classList.remove('hidden');
                const curStruct = (SENTENCE_STRUCTURES || []).find(s => s.id === state.selectedStructureId);
                if (curStruct) renderStationVocabInTheory(curStruct);
                if (detailsBody) detailsBody.classList.remove('hidden');
                if (btnTheory) { btnTheory.className = activeCls; btnTheory.setAttribute('aria-selected', 'true'); }
            } else if (target === 'dictation') {
                if (resultPanel) resultPanel.classList.add('hidden');
                if (dictationPanel) dictationPanel.classList.remove('hidden');
                if (btnDictation) { btnDictation.className = activeDictCls; btnDictation.setAttribute('aria-selected', 'true'); }
                if (typeof initDictationTabForCurrentStruct === 'function') {
                    initDictationTabForCurrentStruct();
                }
            } else if (target === 'audiodrill') {
                if (resultPanel) resultPanel.classList.add('hidden');
                if (audiodrillPanel) audiodrillPanel.classList.remove('hidden');
                if (btnAudio) { btnAudio.className = activeCls; btnAudio.setAttribute('aria-selected', 'true'); }
                if (typeof initAudioDrillTabForCurrentStruct === 'function') {
                    initAudioDrillTabForCurrentStruct();
                }
            } else {
                if (stepperCard) stepperCard.classList.remove('hidden');
                if (exerciseCard) exerciseCard.classList.remove('hidden');
                if (btnPractice) { btnPractice.className = activeCls; btnPractice.setAttribute('aria-selected', 'true'); }
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
            const dictPanel = document.getElementById('ws-dictation-panel');
            const adPanel = document.getElementById('ws-audiodrill-panel');
            if (dictPanel) dictPanel.classList.add('hidden');
            if (adPanel) adPanel.classList.add('hidden');
            if (typeof stopAudioDrillSession === 'function') stopAudioDrillSession(false);
            if (typeof stopAllPlayback === 'function') stopAllPlayback();
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
            if (typeof ensureAudioDrillTriggerButton === 'function') ensureAudioDrillTriggerButton();

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

// [Đã tách Tìm kiếm toàn màn hình, Hộp ôn tập & Modal Tâm sự tác giả sang: js/modals_search.js]

/**
 * MODULE: LUỒNG HOÀN THÀNH TRẠM & CHUYỂN BƯỚC HỌC SÂU (js/station_milestone.js)
 * Kiến trúc 3 lớp (Sẵn sàng chuyển đổi Next.js & Supabase):
 *  - Lớp 1 (Config): Cấu hình phễu 4 tầng (Lý thuyết -> Luyện dịch -> Nghe chép -> Nghe-Nói)
 *  - Lớp 2 (State): Lưu tiến độ kỹ năng & cờ chống lặp theo từng structId
 *  - Lớp 3 (UI/Event): Kích hoạt Popup sau 1.2s, hỗ trợ phím Esc & điều hướng thông minh
 */

(function () {
    const STORAGE_KEY = 'va_station_milestones';
    const MODAL_ID = 'va-station-milestone-modal';
    const TRIGGER_DELAY_MS = 1200;

    // ==================== LỚP 1: CẤU HÌNH LUỒNG HỌC (DATA-FIRST CONFIG) ====================
    const STATION_FLOW_STEPS = [
        {
            key: 'theory',
            label: 'Lý thuyết',
            icon: 'fa-book-open'
        },
        {
            key: 'practice',
            label: 'Luyện dịch',
            icon: 'fa-bolt',
            celebrationTitle: 'Hoàn thành xuất sắc Luyện dịch!',
            celebrationSubtitle: 'Bạn đã nắm chắc khung câu của Trạm này. Bước tiếp theo, hãy luyện tai bắt nối âm và âm đuôi ở phòng Nghe chép để nhớ sâu hơn nhé!',
            defaultNext: 'dictation'
        },
        {
            key: 'dictation',
            label: 'Nghe chép',
            icon: 'fa-pen-nib',
            celebrationTitle: 'Chinh phục trọn bộ Nghe chép!',
            celebrationSubtitle: 'Đôi tai của bạn đã quen nhịp nói tự nhiên của Trạm này. Giờ hãy bật phản xạ nói trực tiếp ở phòng Nghe–Nói nhé!',
            defaultNext: 'audiodrill'
        },
        {
            key: 'audiodrill',
            label: 'Nghe–Nói',
            icon: 'fa-headphones',
            celebrationTitle: 'Làm chủ trọn vẹn Trạm học!',
            celebrationSubtitle: 'Tuyệt vời! Bạn đã đi qua đầy đủ vòng lặp học sâu của Trạm này và sẵn sàng tiến sang Trạm tiếp theo.',
            defaultNext: 'next_station'
        }
    ];

    const STEP_MAP = STATION_FLOW_STEPS.reduce((acc, step) => {
        acc[step.key] = step;
        return acc;
    }, {});

    // ==================== LỚP 2: QUẢN LÝ TRẠNG THÁI & CỜ CHỐNG LẶP (STATE LAYER) ====================
    function _readAllProgress() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return (raw && typeof raw === 'object') ? raw : {};
        } catch (e) {
            return {};
        }
    }

    function _writeAllProgress(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
        } catch (e) {}
    }

    function _createEmptyStationRecord() {
        return {
            practice: { completedAt: null, celebrated: false },
            dictation: { completedAt: null, celebrated: false },
            audiodrill: { completedAt: null, celebrated: false }
        };
    }

    function getStationProgress(structId) {
        if (!structId) return _createEmptyStationRecord();
        const all = _readAllProgress();
        const cur = all[structId] || {};
        return {
            practice: { completedAt: null, celebrated: false, ...(cur.practice || {}) },
            dictation: { completedAt: null, celebrated: false, ...(cur.dictation || {}) },
            audiodrill: { completedAt: null, celebrated: false, ...(cur.audiodrill || {}) }
        };
    }

    function markSkillCompleted(structId, skillKey, celebrated = false) {
        if (!structId || !['practice', 'dictation', 'audiodrill'].includes(skillKey)) return null;
        const all = _readAllProgress();
        const record = getStationProgress(structId);
        if (!record[skillKey].completedAt) {
            record[skillKey].completedAt = new Date().toISOString();
        }
        if (celebrated) {
            record[skillKey].celebrated = true;
        }
        all[structId] = record;
        _writeAllProgress(all);
        return record;
    }

    function hasCelebrated(structId, skillKey) {
        const record = getStationProgress(structId);
        return Boolean(record[skillKey] && record[skillKey].celebrated);
    }

    function findNextStation(currentStructId) {
        const list = (typeof SENTENCE_STRUCTURES !== 'undefined' && Array.isArray(SENTENCE_STRUCTURES))
            ? SENTENCE_STRUCTURES
            : (Array.isArray(window.SENTENCE_STRUCTURES) ? window.SENTENCE_STRUCTURES : []);
        const idx = list.findIndex(s => s && s.id === currentStructId);
        if (idx === -1 || idx + 1 >= list.length) return null;
        return list[idx + 1];
    }

    function resolveNextAction(structId, finishedSkillKey) {
        const progress = getStationProgress(structId);
        const nextStation = findNextStation(structId);

        // Xác định bước khuyến nghị tiếp theo dựa trên tiến độ thực tế
        let recommendedKey = STEP_MAP[finishedSkillKey]?.defaultNext || 'dictation';

        if (finishedSkillKey === 'practice') {
            if (!progress.dictation.completedAt) recommendedKey = 'dictation';
            else if (!progress.audiodrill.completedAt) recommendedKey = 'audiodrill';
            else recommendedKey = nextStation ? 'next_station' : 'roadmap';
        } else if (finishedSkillKey === 'dictation') {
            if (!progress.audiodrill.completedAt) recommendedKey = 'audiodrill';
            else if (!progress.practice.completedAt) recommendedKey = 'practice';
            else recommendedKey = nextStation ? 'next_station' : 'roadmap';
        } else if (finishedSkillKey === 'audiodrill') {
            if (!progress.dictation.completedAt) recommendedKey = 'dictation';
            else if (!progress.practice.completedAt) recommendedKey = 'practice';
            else recommendedKey = nextStation ? 'next_station' : 'roadmap';
        }

       if (recommendedKey === 'dictation') {
            return {
                type: 'subtab',
                target: 'dictation',
                label: 'Chuyển sang phòng Nghe chép',
                icon: 'fa-pen-nib',
                btnClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                altAction: (finishedSkillKey !== 'audiodrill' && !progress.audiodrill.completedAt)
                    ? { type: 'subtab', target: 'audiodrill', label: 'Thử sức Nghe–Nói', icon: 'fa-headphones' }
                    : null
            };
        }

        if (recommendedKey === 'audiodrill') {
            return {
                type: 'subtab',
                target: 'audiodrill',
                label: 'Chuyển sang phòng Nghe–Nói',
                icon: 'fa-headphones',
                btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                altAction: null
            };
        }

        if (recommendedKey === 'practice') {
            return {
                type: 'subtab',
                target: 'practice',
                label: 'Hoàn tất phòng Luyện dịch',
                icon: 'fa-bolt',
                btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                altAction: nextStation
                    ? { type: 'next_station', target: nextStation.id, label: `Trạm tiếp: ${nextStation.shortName}`, icon: 'fa-forward' }
                    : null
            };
        }

        if (recommendedKey === 'next_station' && nextStation) {
            return {
                type: 'next_station',
                target: nextStation.id,
                label: `Sang Trạm tiếp: ${nextStation.shortName}`,
                icon: 'fa-arrow-right',
                btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                altAction: null
            };
        }

        return {
            type: 'roadmap',
            target: 'roadmap',
            label: 'Quay về Sơ đồ học',
            icon: 'fa-map',
            btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
            altAction: null
        };
    }

    // ==================== LỚP 3: SỰ KIỆN & GIAO DIỆN POPUP (UI LAYER) ====================
    let pendingTimer = null;

    function _escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function closeModal() {
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
        }
        document.getElementById(MODAL_ID)?.remove();
    }

    function executeAction(actionType, target) {
        closeModal();
        if (actionType === 'subtab' && typeof window.switchWorkspaceSubTab === 'function') {
            window.switchWorkspaceSubTab(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (actionType === 'next_station' && typeof window.openStructureWorkspace === 'function') {
            window.openStructureWorkspace(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (typeof window.backToStructureLibrary === 'function') {
            window.backToStructureLibrary();
        }
    }

    function openModal(payload) {
        if (!payload || !payload.struct) return;
        closeModal();

        const {
            struct,
            skillKey = 'practice',
            completedCount = 0,
            totalCount = 0,
            bonusXp = 0
        } = payload;

        const stepCfg = STEP_MAP[skillKey] || STEP_MAP.practice;
        const progress = getStationProgress(struct.id);
        const primaryAction = resolveNextAction(struct.id, skillKey);

        // Render thanh tiến độ 4 nấc của Trạm
        const flowHtml = STATION_FLOW_STEPS.map((st, idx) => {
            const isTheory = st.key === 'theory';
            const isDone = isTheory || Boolean(progress[st.key]?.completedAt) || st.key === skillKey;
            const isRecommended = primaryAction.type === 'subtab' && primaryAction.target === st.key;

            let pillCls = 'bg-slate-100 text-slate-500 border-slate-200';
            let iconHtml = `<i class="fa-solid ${st.icon} text-[10px]"></i>`;

            if (isDone) {
                pillCls = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                iconHtml = '<i class="fa-solid fa-check text-[10px] text-emerald-600"></i>';
            } else if (isRecommended) {
                pillCls = 'bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold ring-2 ring-indigo-100';
                iconHtml = `<i class="fa-solid ${st.icon} text-[10px] text-indigo-600"></i>`;
            }

            const arrow = idx < STATION_FLOW_STEPS.length - 1
                ? '<i class="fa-solid fa-chevron-right text-[9px] text-slate-300 shrink-0"></i>'
                : '';

            return `
                <div class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] whitespace-nowrap ${pillCls}">
                    ${iconHtml}
                    <span>${st.label}</span>
                </div>
                ${arrow}
            `;
        }).join('');

        const countBadge = totalCount > 0
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                   <i class="fa-solid fa-circle-check text-emerald-600"></i> Đạt ${completedCount}/${totalCount} tình huống
               </span>`
            : '';

        const xpBadge = bonusXp > 0
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                   <i class="fa-solid fa-star text-amber-500"></i> +${bonusXp} XP thưởng trọn bộ
               </span>`
            : '';

        const altBtnHtml = primaryAction.altAction
            ? `<button type="button" data-ms-action="${primaryAction.altAction.type}" data-ms-target="${_escapeHtml(primaryAction.altAction.target)}"
                   class="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all">
                   <i class="fa-solid ${primaryAction.altAction.icon} text-xs"></i>
                   <span class="truncate">${_escapeHtml(primaryAction.altAction.label)}</span>
               </button>`
            : '';

        const roadmapBtnHtml = primaryAction.type !== 'roadmap'
            ? `<button type="button" data-ms-action="roadmap" data-ms-target="roadmap"
                   class="${altBtnHtml ? 'flex-1' : 'w-full'} py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all">
                   <i class="fa-solid fa-map text-xs"></i>
                   <span>Về Sơ đồ học</span>
               </button>`
            : '';

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
        modal.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="ms-modal-title">
                <div class="bg-gradient-to-br from-emerald-50 via-white to-indigo-50/70 px-6 pt-6 pb-5 text-center border-b border-slate-100 relative">
                    <button type="button" data-ms-close="1" class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200/70 flex items-center justify-center transition-all" title="Đóng">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                    <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-200 mb-3.5">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <p class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 mb-1">
                        Trạm ${_escapeHtml(struct.shortName || struct.title)}
                    </p>
                    <h3 id="ms-modal-title" class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                        ${_escapeHtml(stepCfg.celebrationTitle)}
                    </h3>
                    ${(countBadge || xpBadge) ? `
                        <div class="flex flex-wrap items-center justify-center gap-2 mt-3">
                            ${countBadge}
                            ${xpBadge}
                        </div>
                    ` : ''}
                </div>

                <div class="p-6 space-y-5">
                    <p class="text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
                        ${_escapeHtml(stepCfg.celebrationSubtitle)}
                    </p>

                    <div class="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-2">
                        <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
                            Lộ trình làm chủ Trạm này
                        </p>
                        <div class="flex flex-wrap items-center justify-center gap-1.5">
                            ${flowHtml}
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <button type="button" data-ms-action="${primaryAction.type}" data-ms-target="${_escapeHtml(primaryAction.target)}"
                            class="w-full py-3 px-4 rounded-2xl ${primaryAction.btnClass} text-white text-sm font-extrabold shadow-md inline-flex items-center justify-center gap-2 transition-all">
                            <i class="fa-solid ${primaryAction.icon}"></i>
                            <span>${_escapeHtml(primaryAction.label)}</span>
                            <i class="fa-solid fa-arrow-right text-xs"></i>
                        </button>

                        ${(altBtnHtml || roadmapBtnHtml) ? `
                            <div class="flex items-center gap-2">
                                ${altBtnHtml}
                                ${roadmapBtnHtml}
                            </div>
                        ` : ''}
                    </div>

                    <div class="text-center pt-1">
                        <button type="button" data-ms-close="1" class="text-xs font-bold text-slate-400 hover:text-slate-700 hover:underline transition-all">
                            ${skillKey === 'practice' ? 'Ở lại xem lại câu vừa dịch' : (skillKey === 'dictation' ? 'Ở lại phòng Nghe chép' : 'Ở lại phòng Nghe–Nói')}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Đóng khi bấm nền tối ngoài modal hoặc nút đóng / nút điều hướng
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                return;
            }
            const closeBtn = e.target.closest('[data-ms-close]');
            if (closeBtn) {
                closeModal();
                return;
            }
            const actionBtn = e.target.closest('[data-ms-action]');
            if (actionBtn) {
                executeAction(actionBtn.dataset.msAction, actionBtn.dataset.msTarget);
            }
        });

        document.body.appendChild(modal);
    }

    function onSkillCompleted(payload) {
        if (!payload || !payload.struct || !payload.struct.id) return;
        const { struct, skillKey = 'practice' } = payload;

        // Nếu kỹ năng này của Trạm đã từng hiện Popup chúc mừng rồi thì không làm phiền lại
        if (hasCelebrated(struct.id, skillKey)) {
            markSkillCompleted(struct.id, skillKey, true);
            return;
        }

        // Ghi nhận hoàn thành & gắn cờ đã chúc mừng ngay để tránh kích hoạt trùng
        markSkillCompleted(struct.id, skillKey, true);

        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => {
            pendingTimer = null;
            const appState = (typeof state !== 'undefined') ? state : window.state;
            // Chỉ bật Popup nếu học viên vẫn đang ở đúng Trạm đó
            if (appState && appState.activeTab === 'practice' && appState.selectedStructureId === struct.id) {
                openModal(payload);
            }
        }, TRIGGER_DELAY_MS);
    }

    // Bắt phím Esc ở giai đoạn capture để đóng Popup mà KHÔNG kích hoạt retryCurrentQuestion()
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById(MODAL_ID)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeModal();
        }
    }, true);

    // Export API công khai cho các module khác & tiện test nhanh
    window.VA_STATION_MILESTONE = {
        config: STATION_FLOW_STEPS,
        getProgress: getStationProgress,
        markSkillCompleted,
        hasCelebrated,
        onSkillCompleted,
        openModal,
        closeModal,
        // Hàm hỗ trợ test giao diện nhanh trong F12 Console mà không cần dịch lại 15 câu
        preview: function (skillKey = 'practice') {
            const appState = (typeof state !== 'undefined') ? state : window.state;
            const list = (typeof SENTENCE_STRUCTURES !== 'undefined') ? SENTENCE_STRUCTURES : (window.SENTENCE_STRUCTURES || []);
            const struct = list.find(s => s.id === appState?.selectedStructureId) || list[0];
            if (!struct) return;
            openModal({
                struct,
                skillKey,
                completedCount: struct.situations.length,
                totalCount: struct.situations.length,
                bonusXp: 30
            });
        }
    };
})();
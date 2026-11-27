/**
 * MODULE 4: LUYỆN NGHE–NÓI (AUDIO DRILL — 1 LÕI / 2 VỎ BỌC) & NGHE CHÉP CHÍNH TẢ (js/audio_drill.js)
 * Kiến trúc hệ thống:
 *  - Lõi trình phát duy nhất (buildAudioDrillCoreHTML): dùng chung cho cả Tab inline (#ws-audiodrill-panel) và Popup mỏng (Hộp ôn tập / Checkpoint).
 *  - Chạy nền xuyên màn hình khóa dựa trên js/audio_engine.js (Persistent <audio>, Silent WAV, Media Session) + Screen Wake Lock.
 *  - Tab Nghe chép chính tả độc lập (Strict Match, bắt buộc gõ đúng 100%).
 */

// ==================== 1. LUYỆN NGHE–NÓI & SHADOWING (1 LÕI — 2 VỎ BỌC) ====================
const audioDrillState = {
    isOpen: false,
    mountMode: 'inline',   // 'inline' (Tab trong Trạm / Chủ đề tự do) | 'modal' (Popup mỏng cho Hộp ôn tập / Checkpoint)
    structId: null,
    title: '',
    situations: [],
    index: 0,
    mode: 'reflex',        // 'reflex' (Việt -> Nghỉ -> Anh) | 'shadowing' (Anh -> Nghỉ -> Nhại)
    isPlaying: false,
    phase: 'idle',         // 'idle' | 'thinking' | 'speaking' | 'shadowing' | 'pause' | 'done'
    speed: 0.85,           // 0.75 | 0.85 | 1.0
    waitSec: 5,            // 0 | 3 | 5 | 7
    continuousLoop: false,
    hideEnglish: false,
    speakVi: (localStorage.getItem('va_ad_speak_vi') !== '0'),
    revealedManually: false,
    remainingMs: 0,
    totalWaitMs: 5000,
    timerId: null,
    intervalId: null,
    runId: 0
};

let vaWakeLockSentinel = null;

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

async function requestAudioDrillWakeLock() {
    if (!('wakeLock' in navigator) || !navigator.wakeLock) return;
    try {
        if (!vaWakeLockSentinel) {
            vaWakeLockSentinel = await navigator.wakeLock.request('screen');
            vaWakeLockSentinel.addEventListener('release', () => {
                vaWakeLockSentinel = null;
            });
        }
    } catch (e) {}
}

function releaseAudioDrillWakeLock() {
    if (vaWakeLockSentinel) {
        try { vaWakeLockSentinel.release(); } catch (e) {}
        vaWakeLockSentinel = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && audioDrillState.isOpen && audioDrillState.isPlaying) {
        requestAudioDrillWakeLock();
    }
});

function syncAudioDrillMediaSession() {
    if (typeof updateMediaSessionMetadata !== 'function' || !audioDrillState.isOpen) return;
    const item = audioDrillState.situations[audioDrillState.index];
    const total = audioDrillState.situations.length || 0;
    const cur = audioDrillState.index + 1;
    updateMediaSessionMetadata({
        title: item ? `Câu ${cur}/${total}: ${item.vi}` : 'ViệtAnh Master',
        artist: audioDrillState.title || 'Luyện Nghe–Nói & Shadowing',
        album: 'ViệtAnh Master • Audio Drill',
        isPlaying: audioDrillState.isPlaying,
        onPlay: () => { if (!audioDrillState.isPlaying) toggleAudioDrillPlay(); },
        onPause: () => { if (audioDrillState.isPlaying) toggleAudioDrillPlay(); },
        onPrev: () => stepAudioDrill(-1),
        onNext: () => stepAudioDrill(1)
    });
}

// Dừng sạch phiên Audio Drill (dùng khi chuyển Tab hoặc đóng Popup)
function stopAudioDrillSession(keepDom = false) {
    clearAudioDrillTimers();
    audioDrillState.isPlaying = false;
    audioDrillState.phase = 'idle';
    audioDrillState.runId++;
    releaseAudioDrillWakeLock();
    if (typeof stopAllPlayback === 'function') stopAllPlayback();
    if (typeof clearMediaSession === 'function') clearMediaSession();

    if (!keepDom) {
        audioDrillState.isOpen = false;
        const modal = document.getElementById('va-audio-drill-modal');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    }
}

function closeAudioDrillModal() {
    stopAudioDrillSession(false);
}

// LỚP LÕI DUY NHẤT (Core Player HTML) — Tái sử dụng 100% cho cả Tab inline và Popup mỏng
function buildAudioDrillCoreHTML(displayTitle, totalCount, isModal = false) {
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const initPct = totalCount > 0 ? Math.round((1 / totalCount) * 100) : 0;

    return `
        <div class="${isModal ? 'bg-slate-50 rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in' : 'bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden'}">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 px-5 py-4 text-white flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-base shrink-0">
                        <i class="fa-solid fa-headphones text-amber-300"></i>
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-extrabold text-sm sm:text-base leading-tight truncate">Luyện Nghe–Nói • ${esc(displayTitle)}</h3>
                        <p class="text-[11px] text-indigo-200 truncate">Tự động phát & đếm ngược qua ${totalCount} câu (Hỗ trợ phát xuyên màn hình khóa)</p>
                    </div>
                </div>
                ${isModal ? `
                    <button type="button" onclick="closeAudioDrillModal()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 transition-all" title="Đóng (Esc)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                ` : ''}
            </div>

            <!-- Body -->
            <div class="p-4 sm:p-6 space-y-4 ${isModal ? 'max-h-[84vh] overflow-y-auto' : 'bg-slate-50/40'}">
                <div class="${isModal ? 'space-y-3.5' : 'max-w-xl mx-auto space-y-4'}">
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
                    <div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 text-center space-y-2 relative">
                        <button type="button" onclick="replayAudioDrillVietnamese(this)" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe câu tiếng Việt">
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

                    <!-- Thẻ Đáp án chuẩn -->
                    <div onclick="revealAudioDrillAnswerManually()" class="cursor-pointer bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-1.5 relative transition-all hover:border-indigo-300" title="Chạm để hiện / ẩn đáp án">
                        <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span class="uppercase tracking-wider">Đáp án chuẩn</span>
                            <span id="ad-reveal-hint" class="text-indigo-500"></span>
                        </div>
                        <div id="ad-en-wrap" class="transition-all duration-200 space-y-1">
                            <p id="ad-en-text" class="text-base sm:text-lg font-extrabold text-indigo-950 leading-snug">...</p>
                            <p id="ad-ipa-text" class="font-mono text-xs text-indigo-600">...</p>
                        </div>
                    </div>

                    <!-- Thanh điều khiển chính -->
                    <div class="pt-1 space-y-3">
                        <div class="flex items-center justify-center gap-4 sm:gap-5">
                            <button id="ad-loop-btn" type="button" onclick="toggleAudioDrillLoop()" class="w-10 h-10 rounded-full bg-white hover:bg-indigo-50 text-slate-500 border border-slate-200 shadow-2xs flex items-center justify-center transition-all" title="Bật / Tắt phát liên tục">
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

                        <!-- Bộ đếm câu & Thanh tiến độ -->
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                                <span id="ad-counter-text">Câu 1 / ${totalCount}</span>
                                <span id="ad-progress-pct" class="text-indigo-600">${initPct}%</span>
                            </div>
                            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div id="ad-progress-bar" class="h-full bg-indigo-600 rounded-full transition-all duration-300" style="width: ${initPct}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Hàng tùy chọn nhanh -->
                    <div class="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                            <button id="ad-speed-btn" type="button" onclick="cycleAudioDrillSpeed()" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 transition-all">
                                Tốc độ: 0.85x
                            </button>
                            <button id="ad-wait-btn" type="button" onclick="cycleAudioDrillWait()" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all">
                                Chờ: 5s
                            </button>
                        </div>
                        <div class="flex items-center gap-3">
                            <label id="ad-speak-vi-wrap" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none" title="Tự động đọc câu tiếng Việt trước khi đếm ngược (Hỗ trợ luyện rảnh tay)">
                                <input id="ad-speak-vi-toggle" type="checkbox" onchange="toggleAudioDrillSpeakVi(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                                <span>Đọc tiếng Việt</span>
                            </label>
                            <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                                <input id="ad-hide-en-toggle" type="checkbox" onchange="toggleAudioDrillHideEnglish(this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500">
                                <span>Ẩn tiếng Anh</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// VỎ BỌC 1: Gắn Lõi trực tiếp vào Tab #ws-audiodrill-panel (Dùng cho Trạm & Chủ đề tự do)
function mountAudioDrillIntoPanel(list, displayTitle, startIndex = 0, structId = null) {
    const panel = document.getElementById('ws-audiodrill-panel');
    if (!panel) return;

    const validList = Array.isArray(list) ? list.filter(q => q && q.sampleCasual) : [];
    if (validList.length === 0) {
        panel.innerHTML = '';
        if (typeof showToast === 'function') showToast('Chưa có câu hỏi nào để luyện Nghe–Nói.', 'warning');
        return;
    }

    stopAudioDrillSession(false);

    audioDrillState.isOpen = true;
    audioDrillState.mountMode = 'inline';
    audioDrillState.structId = structId;
    audioDrillState.title = displayTitle || 'Luyện Nghe–Nói';
    audioDrillState.situations = validList;
    audioDrillState.index = Math.max(0, Math.min(startIndex || 0, validList.length - 1));
    audioDrillState.isPlaying = false;
    audioDrillState.phase = 'idle';
    audioDrillState.revealedManually = false;
    audioDrillState.runId++;

    panel.innerHTML = buildAudioDrillCoreHTML(audioDrillState.title, validList.length, false);
    updateAudioDrillUI();
}

function initAudioDrillTabForCurrentStruct() {
    const structId = (typeof state !== 'undefined') ? state.selectedStructureId : null;
    const struct = (typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : []).find(s => s.id === structId);
    if (!struct || !Array.isArray(struct.situations) || struct.situations.length === 0) return;

    const startIdx = Math.min((typeof state !== 'undefined' ? state.currentSituationIndex : 0) || 0, struct.situations.length - 1);
    mountAudioDrillIntoPanel(struct.situations, struct.shortName || struct.title, startIdx, struct.id);
}

// VỎ BỌC 2: Popup mỏng (Dùng cho Hộp ôn tập & Checkpoint)
function openAudioDrillModal(optionsOrStructId = null) {
    let situations = [];
    let displayTitle = '';
    let startIndex = 0;
    let structId = null;

    if (optionsOrStructId && typeof optionsOrStructId === 'object' && Array.isArray(optionsOrStructId.list)) {
        situations = optionsOrStructId.list.filter(q => q && q.sampleCasual);
        displayTitle = optionsOrStructId.title || 'Luyện Nghe–Nói';
        startIndex = Math.max(0, Math.min(optionsOrStructId.startIndex || 0, situations.length - 1));
    } else {
        structId = (typeof optionsOrStructId === 'string' && optionsOrStructId)
            ? optionsOrStructId
            : (typeof state !== 'undefined' ? state.selectedStructureId : null);
        const struct = (typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : []).find(s => s.id === structId);
        if (struct && Array.isArray(struct.situations)) {
            situations = struct.situations;
            displayTitle = struct.shortName || struct.title || 'Trạm luyện tập';
            startIndex = Math.min((typeof state !== 'undefined' ? state.currentSituationIndex : 0) || 0, Math.max(0, situations.length - 1));
        }
    }

    if (!situations || situations.length === 0) {
        if (typeof showToast === 'function') showToast('Chưa có câu hỏi nào để luyện Nghe–Nói.', 'warning');
        return;
    }

    stopAudioDrillSession(false);

    // Xóa DOM panel inline nếu đang tồn tại để tránh trùng ID phần tử
    const inlinePanel = document.getElementById('ws-audiodrill-panel');
    if (inlinePanel) inlinePanel.innerHTML = '';

    audioDrillState.isOpen = true;
    audioDrillState.mountMode = 'modal';
    audioDrillState.structId = structId;
    audioDrillState.title = displayTitle;
    audioDrillState.situations = situations;
    audioDrillState.index = startIndex;
    audioDrillState.isPlaying = false;
    audioDrillState.phase = 'idle';
    audioDrillState.revealedManually = false;
    audioDrillState.runId++;

    const modal = document.createElement('div');
    modal.id = 'va-audio-drill-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
    modal.setAttribute('onclick', 'if(event.target === this) closeAudioDrillModal()');
    modal.innerHTML = buildAudioDrillCoreHTML(displayTitle, situations.length, true);

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    updateAudioDrillUI();
}

// Mở Audio Drill cho Hộp ôn tập (Spaced Repetition)
function openAudioDrillForReviewBox() {
    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    if (reviewBox.length === 0) {
        if (typeof showToast === 'function') showToast('Hộp ôn tập đang trống!', 'info');
        return;
    }

    const norm = (s) => (typeof normalizeReviewCompareText === 'function')
        ? normalizeReviewCompareText(s)
        : String(s || '').trim().toLowerCase();

    const allSituations = [];
    (typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : []).forEach(st => {
        (st.situations || []).forEach(sit => allSituations.push(sit));
    });
    (typeof EXERCISE_BANK !== 'undefined' ? EXERCISE_BANK : []).forEach(q => allSituations.push(q));

    const resolved = [];
    const seenIds = new Set();

    reviewBox.forEach(item => {
        const candIds = [item.situationId, item.id, item.questionId, item.sitId, item.qId]
            .filter(v => v !== undefined && v !== null && String(v).trim() !== '')
            .map(v => String(v).trim());
        const viNorm = norm(typeof getReviewItemViText === 'function' ? getReviewItemViText(item) : (item.vi || ''));

        let match = null;
        if (candIds.length > 0) {
            match = allSituations.find(s => s && s.id && candIds.includes(String(s.id).trim()));
        }
        if (!match && viNorm) {
            match = allSituations.find(s => s && norm(s.vi) === viNorm);
        }

        if (match && match.sampleCasual && !seenIds.has(match.id || match.sampleCasual)) {
            seenIds.add(match.id || match.sampleCasual);
            resolved.push(match);
        }
    });

    if (resolved.length === 0) {
        if (typeof showToast === 'function') showToast('Không tìm thấy dữ liệu câu hỏi khớp trong Hộp ôn tập.', 'warning');
        return;
    }

    openAudioDrillModal({
        title: `Hộp ôn tập (${resolved.length} câu)`,
        list: resolved,
        startIndex: 0
    });
}

function openAudioDrillForCheckpoint() {
    const list = (typeof state !== 'undefined' && Array.isArray(state.filteredList)) ? state.filteredList : [];
    if (list.length === 0) {
        if (typeof showToast === 'function') showToast('Chưa có câu hỏi trong danh sách Checkpoint.', 'warning');
        return;
    }
    const stageInfo = (typeof getStageInfoById === 'function' && state.activeCheckpointStageId)
        ? getStageInfoById(state.activeCheckpointStageId)
        : null;
    openAudioDrillModal({
        title: stageInfo ? `Checkpoint ${stageInfo.shortTitle}` : 'Ôn trộn cuối Chặng',
        list: list,
        startIndex: state.currentIndex || 0
    });
}

function openAudioDrillForCurrentTopicList() {
    if (typeof switchTopicSubTab === 'function') {
        switchTopicSubTab('audiodrill');
    }
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
    if (typeof showToast === 'function') {
        showToast(
            audioDrillState.continuousLoop
                ? '🔁 Đã bật Phát liên tục (Lặp lại toàn bộ danh sách)'
                : 'Đã tắt chế độ lặp lại',
            'info'
        );
    }
}

function toggleAudioDrillHideEnglish(checked) {
    audioDrillState.hideEnglish = Boolean(checked);
    audioDrillState.revealedManually = false;
    updateAudioDrillUI();
}

function toggleAudioDrillSpeakVi(checked) {
    audioDrillState.speakVi = Boolean(checked);
    try { localStorage.setItem('va_ad_speak_vi', audioDrillState.speakVi ? '1' : '0'); } catch (e) {}
    updateAudioDrillUI();
}

function replayAudioDrillVietnamese(btnEl = null) {
    const item = audioDrillState.situations[audioDrillState.index];
    if (!item || !item.vi || typeof speakVietnameseText !== 'function') return;
    speakVietnameseText(item.vi, btnEl, 1.0, { audioId: item.id });
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
        releaseAudioDrillWakeLock();
        if (typeof stopAllPlayback === 'function') stopAllPlayback();
        syncAudioDrillMediaSession();
        updateAudioDrillUI();
    } else {
        if (audioDrillState.phase === 'done') {
            audioDrillState.index = 0;
        }
        audioDrillState.isPlaying = true;
        requestAudioDrillWakeLock();
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
    if (typeof playSilentKeepAliveAudio === 'function') playSilentKeepAliveAudio();
    syncAudioDrillMediaSession();
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
        if (typeof playSilentKeepAliveAudio === 'function') playSilentKeepAliveAudio();
        syncAudioDrillMediaSession();
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
                releaseAudioDrillWakeLock();
                if (typeof stopAllPlayback === 'function') stopAllPlayback();
                syncAudioDrillMediaSession();
                updateAudioDrillUI();

                const activeStructId = audioDrillState.structId || ((typeof state !== 'undefined' && state.practiceMode === 'structure') ? state.selectedStructureId : null);
                const structObj = activeStructId && Array.isArray(typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : [])
                    ? SENTENCE_STRUCTURES.find(s => s.id === activeStructId)
                    : null;

                if (structObj && window.VA_STATION_MILESTONE && typeof window.VA_STATION_MILESTONE.onSkillCompleted === 'function') {
                    window.VA_STATION_MILESTONE.onSkillCompleted({
                        struct: structObj,
                        skillKey: 'audiodrill',
                        completedCount: audioDrillState.situations.length,
                        totalCount: audioDrillState.situations.length,
                        bonusXp: 0
                    });
                } else if (typeof showToast === 'function') {
                    showToast('🎉 Tuyệt vời! Bạn đã hoàn thành trọn vòng Nghe–Nói!', 'success');
                }
            }
        }, 1200);
    };

    const speakNow = (afterSpeak) => {
        if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
        audioDrillState.phase = 'speaking';
        syncAudioDrillMediaSession();
        updateAudioDrillUI();
        speakText(item.sampleCasual, null, audioDrillState.speed, {
            audioId: item.id,
            onComplete: () => {
                if (typeof afterSpeak === 'function') afterSpeak();
            }
        });
    };

    if (audioDrillState.mode === 'reflex') {
        const proceedToThinkAndSpeakEn = () => {
            if (!audioDrillState.isPlaying || myRunId !== audioDrillState.runId) return;
            if (audioDrillState.waitSec > 0) {
                runAudioDrillCountdown(audioDrillState.waitSec, 'thinking', myRunId, () => {
                    speakNow(() => moveNextAfterShortPause());
                });
            } else {
                speakNow(() => moveNextAfterShortPause());
            }
        };

        if (audioDrillState.speakVi && item.vi && typeof speakVietnameseText === 'function') {
            audioDrillState.phase = 'speaking_vi';
            syncAudioDrillMediaSession();
            updateAudioDrillUI();
            speakVietnameseText(item.vi, null, 1.0, {
                audioId: item.id,
                onComplete: () => {
                    proceedToThinkAndSpeakEn();
                }
            });
        } else {
            proceedToThinkAndSpeakEn();
        }
    } else {
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

    const reflexBtn = document.getElementById('ad-mode-reflex');
    const shadowBtn = document.getElementById('ad-mode-shadowing');
    const activePill = 'py-2 px-2 rounded-xl bg-white text-indigo-700 shadow-2xs font-extrabold transition-all flex items-center justify-center gap-1.5';
    const inactivePill = 'py-2 px-2 rounded-xl text-slate-600 hover:text-indigo-700 font-bold transition-all flex items-center justify-center gap-1.5';
    if (reflexBtn) reflexBtn.className = audioDrillState.mode === 'reflex' ? activePill : inactivePill;
    if (shadowBtn) shadowBtn.className = audioDrillState.mode === 'shadowing' ? activePill : inactivePill;

    const viEl = document.getElementById('ad-vi-text');
    const enEl = document.getElementById('ad-en-text');
    const ipaEl = document.getElementById('ad-ipa-text');
    const enWrap = document.getElementById('ad-en-wrap');
    const revealHint = document.getElementById('ad-reveal-hint');

    if (viEl) viEl.innerText = item.vi || '';
    if (enEl) enEl.innerText = item.sampleCasual || '';
    if (ipaEl) ipaEl.innerText = item.ipa || (typeof sentenceToIPA === 'function' ? sentenceToIPA(item.sampleCasual) : '');

    const shouldBlur = !audioDrillState.revealedManually && (
        audioDrillState.hideEnglish ||
        (audioDrillState.mode === 'reflex' && (audioDrillState.phase === 'speaking_vi' || audioDrillState.phase === 'thinking' || audioDrillState.phase === 'idle'))
    );

    if (enWrap) {
        if (shouldBlur) enWrap.classList.add('blur-sm', 'select-none', 'opacity-55');
        else enWrap.classList.remove('blur-sm', 'select-none', 'opacity-55');
    }
    if (revealHint) {
        revealHint.innerText = shouldBlur ? 'Chạm để xem đáp án' : '';
    }

    const statusBox = document.getElementById('ad-status-box');
    const statusText = document.getElementById('ad-status-text');
    const fillEl = document.getElementById('ad-countdown-fill');

    if (statusBox && statusText && fillEl) {
        if (audioDrillState.phase === 'speaking_vi') {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs sm:text-sm font-extrabold text-sky-900';
            fillEl.style.width = '100%';
            statusText.innerText = '🔊 Đang đọc câu tiếng Việt... Hãy lắng nghe để chuẩn bị phản xạ';
        } else if (audioDrillState.phase === 'thinking' || audioDrillState.phase === 'shadowing') {
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
            statusText.innerText = '🎉 Đã hoàn thành toàn bộ danh sách! Bấm Phát để luyện lại.';
        } else {
            statusBox.className = 'relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-center transition-all';
            statusText.className = 'relative z-10 text-xs font-bold text-indigo-700';
            fillEl.style.width = '0%';
            statusText.innerText = audioDrillState.mode === 'shadowing'
                ? 'Bấm Phát để nghe mẫu rồi nhại lại theo nhịp'
                : (audioDrillState.speakVi
                    ? 'Bấm Phát: nghe tiếng Việt → tự nói → nghe đáp án chuẩn'
                    : 'Bấm Phát: nhìn tiếng Việt → tự nói → nghe đáp án chuẩn');
        }
    }

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

    const loopBtn = document.getElementById('ad-loop-btn');
    if (loopBtn) {
        if (audioDrillState.continuousLoop) {
            loopBtn.className = 'w-10 h-10 rounded-full bg-indigo-600 text-white border border-indigo-600 shadow-sm shadow-indigo-200 flex items-center justify-center transition-all';
            loopBtn.title = 'Đang bật Phát liên tục — Bấm để tắt';
        } else {
            loopBtn.className = 'w-10 h-10 rounded-full bg-white hover:bg-indigo-50 text-slate-500 border border-slate-200 shadow-2xs flex items-center justify-center transition-all';
            loopBtn.title = 'Bật Phát liên tục';
        }
    }

    const speedBtn = document.getElementById('ad-speed-btn');
    const waitBtn = document.getElementById('ad-wait-btn');
    const hideChk = document.getElementById('ad-hide-en-toggle');
    const speakViChk = document.getElementById('ad-speak-vi-toggle');
    const speakViWrap = document.getElementById('ad-speak-vi-wrap');
    if (speedBtn) speedBtn.innerText = `Tốc độ: ${audioDrillState.speed}x`;
    if (waitBtn) waitBtn.innerText = audioDrillState.waitSec === 0 ? 'Chờ: 0s' : `Chờ: ${audioDrillState.waitSec}s`;
    if (hideChk) hideChk.checked = audioDrillState.hideEnglish;
    if (speakViChk) speakViChk.checked = audioDrillState.speakVi;
    if (speakViWrap) {
        if (audioDrillState.mode === 'reflex') speakViWrap.classList.remove('hidden');
        else speakViWrap.classList.add('hidden');
    }
}


// ==================== 2. TAB 3: NGHE CHÉP CHÍNH TẢ ĐỘC LẬP (STRICT MATCH • BẮT BUỘC GÕ ĐÚNG) ====================
const VA_DICTATION_DONE_KEY = 'va_dictation_done';

const dictationTabState = {
    structId: null,
    situations: [],
    index: 0,
    speed: 0.85,              // 0.7 | 0.85 | 1.0
    isCurrentPassed: false,
    revealedIndices: new Set(),
    showPeekAnswer: false,
    doneMap: {},
    autoPlayTimer: null
};

function loadDictationDoneMap() {
    try {
        dictationTabState.doneMap = JSON.parse(localStorage.getItem(VA_DICTATION_DONE_KEY)) || {};
    } catch (e) {
        dictationTabState.doneMap = {};
    }
}

function saveDictationDoneMap() {
    try {
        localStorage.setItem(VA_DICTATION_DONE_KEY, JSON.stringify(dictationTabState.doneMap));
    } catch (e) {}
}
// Bảng chuẩn hóa hơn 45 dạng viết tắt tiếng Anh thông dụng (chấp nhận cả 2 chiều viết tắt <-> đầy đủ)
const VA_DICTATION_CONTRACTIONS = {
    "i'm": ["i", "am"],
    "you're": ["you", "are"],
    "we're": ["we", "are"],
    "they're": ["they", "are"],
    "he's": ["he", "is"],
    "she's": ["she", "is"],
    "it's": ["it", "is"],
    "that's": ["that", "is"],
    "there's": ["there", "is"],
    "here's": ["here", "is"],
    "what's": ["what", "is"],
    "who's": ["who", "is"],
    "where's": ["where", "is"],
    "when's": ["when", "is"],
    "how's": ["how", "is"],
    "let's": ["let", "us"],
    "isn't": ["is", "not"],
    "aren't": ["are", "not"],
    "wasn't": ["was", "not"],
    "weren't": ["were", "not"],
    "don't": ["do", "not"],
    "doesn't": ["does", "not"],
    "didn't": ["did", "not"],
    "can't": ["can", "not"],
    "cannot": ["can", "not"],
    "couldn't": ["could", "not"],
    "won't": ["will", "not"],
    "wouldn't": ["would", "not"],
    "shouldn't": ["should", "not"],
    "mustn't": ["must", "not"],
    "haven't": ["have", "not"],
    "hasn't": ["has", "not"],
    "hadn't": ["had", "not"],
    "i've": ["i", "have"],
    "you've": ["you", "have"],
    "we've": ["we", "have"],
    "they've": ["they", "have"],
    "i'll": ["i", "will"],
    "you'll": ["you", "will"],
    "he'll": ["he", "will"],
    "she'll": ["she", "will"],
    "it'll": ["it", "will"],
    "we'll": ["we", "will"],
    "they'll": ["they", "will"],
    "that'll": ["that", "will"],
    "i'd": ["i", "would"],
    "you'd": ["you", "would"],
    "he'd": ["he", "would"],
    "she'd": ["she", "would"],
    "we'd": ["we", "would"],
    "they'd": ["they", "would"]
};

function normalizeDictationWord(raw) {
    return String(raw || '')
        .toLowerCase()
        .replace(/[’‘`]/g, "'")
        .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
}

function tokenizeDictationSentence(sentence) {
    const rawList = String(sentence || '').trim().split(/\s+/).filter(Boolean);
    const tokens = [];
    rawList.forEach(raw => {
        const norm = normalizeDictationWord(raw);
        if (norm) {
            tokens.push({ raw, norm });
        }
    });
    return tokens;
}

// Mở rộng từng từ viết tắt sang dạng chuẩn để so khớp, vẫn giữ origIdx để ánh xạ ngược về từ gốc trên giao diện
function expandDictationTokens(tokens) {
    const expanded = [];
    for (let idx = 0; idx < tokens.length; idx++) {
        const norm = tokens[idx].norm;
        const nextNorm = tokens[idx + 1] ? tokens[idx + 1].norm : '';

        // Xử lý ngữ cảnh 's + got/been -> has (VD: He's got -> he has got)
        if ((norm === "he's" || norm === "she's" || norm === "it's") && (nextNorm === 'got' || nextNorm === 'been')) {
            expanded.push({ norm: norm.slice(0, -2), origIdx: idx });
            expanded.push({ norm: 'has', origIdx: idx });
            continue;
        }

        const mapped = VA_DICTATION_CONTRACTIONS[norm];
        if (mapped) {
            mapped.forEach(part => expanded.push({ norm: part, origIdx: idx }));
        } else {
            expanded.push({ norm, origIdx: idx });
        }
    }
    return expanded;
}

// So khớp chặt từng từ (chấp nhận cả viết tắt & đầy đủ, bỏ qua viết hoa & dấu câu, căn chỉnh LCS)
function evaluateDictationStrict(userText, targetSentence) {
    const targetTokens = tokenizeDictationSentence(targetSentence);
    const userTokens = tokenizeDictationSentence(userText);

    const expTarget = expandDictationTokens(targetTokens);
    const expUser = expandDictationTokens(userTokens);

    const m = expUser.length;
    const n = expTarget.length;

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (expUser[i - 1].norm === expTarget[j - 1].norm) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const matchedExpTargetIdx = new Set();
    const matchedExpUserIdx = new Set();
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (expUser[i - 1].norm === expTarget[j - 1].norm) {
            matchedExpUserIdx.add(i - 1);
            matchedExpTargetIdx.add(j - 1);
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    // Ánh xạ ngược về chỉ số từ gốc: 1 từ gốc được tính là khớp khi TẤT CẢ phần mở rộng của nó đều khớp
    const partsCountByOrig = {};
    const matchedPartsByOrig = {};
    expTarget.forEach((item, expIdx) => {
        partsCountByOrig[item.origIdx] = (partsCountByOrig[item.origIdx] || 0) + 1;
        if (matchedExpTargetIdx.has(expIdx)) {
            matchedPartsByOrig[item.origIdx] = (matchedPartsByOrig[item.origIdx] || 0) + 1;
        }
    });

    const matchedTargetIdx = new Set();
    for (let k = 0; k < targetTokens.length; k++) {
        if (partsCountByOrig[k] && matchedPartsByOrig[k] === partsCountByOrig[k]) {
            matchedTargetIdx.add(k);
        }
    }

    const extraWrongCount = m - matchedExpUserIdx.size;
    const missingCount = targetTokens.length - matchedTargetIdx.size;
    const isPerfect = targetTokens.length > 0 && missingCount === 0 && extraWrongCount === 0;

    return {
        targetTokens,
        userTokens,
        matchedTargetIdx,
        extraWrongCount,
        missingCount,
        isPerfect
    };
}

function initDictationTabForList(list, contextKey, startIndex = 0) {
    loadDictationDoneMap();
    const validList = Array.isArray(list) ? list.filter(s => s && s.sampleCasual) : [];
    if (validList.length === 0) return;

    const isSameContext = dictationTabState.structId === contextKey;
    dictationTabState.structId = contextKey;
    dictationTabState.situations = validList;

    if (!isSameContext) {
        const safeStart = Math.max(0, Math.min(startIndex || 0, validList.length - 1));
        dictationTabState.index = safeStart;
    } else if (dictationTabState.index >= validList.length) {
        dictationTabState.index = 0;
    }

    loadDictationQuestion(dictationTabState.index, true);
}

function initDictationTabForCurrentStruct() {
    loadDictationDoneMap();
    const structId = (typeof state !== 'undefined') ? state.selectedStructureId : null;
    const struct = (typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : []).find(s => s.id === structId);
    if (!struct || !Array.isArray(struct.situations) || struct.situations.length === 0) return;

    const isSameStruct = dictationTabState.structId === struct.id;
    dictationTabState.structId = struct.id;
    dictationTabState.situations = struct.situations;

    if (!isSameStruct) {
        // Nhảy tới câu đầu tiên chưa chép xong trong Trạm (hoặc câu 1 nếu đã xong hết)
        const firstUnfinished = struct.situations.findIndex(s => !dictationTabState.doneMap[s.id]);
        dictationTabState.index = firstUnfinished !== -1 ? firstUnfinished : 0;
    } else if (dictationTabState.index >= struct.situations.length) {
        dictationTabState.index = 0;
    }

    loadDictationQuestion(dictationTabState.index, true);
}

function loadDictationQuestion(idx, autoPlay = true) {
    const total = dictationTabState.situations.length;
    if (total === 0) return;

    dictationTabState.index = Math.max(0, Math.min(idx, total - 1));
    dictationTabState.isCurrentPassed = false;
    dictationTabState.revealedIndices = new Set();
    dictationTabState.showPeekAnswer = false;

    const inputEl = document.getElementById('dict-input');
    const feedbackBox = document.getElementById('dict-feedback-box');
    const peekBox = document.getElementById('dict-peek-box');

    if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
    }
    if (feedbackBox) {
        feedbackBox.classList.add('hidden');
        feedbackBox.innerHTML = '';
    }
    if (peekBox) {
        peekBox.classList.add('hidden');
    }

    updateDictationTabUI();

    if (dictationTabState.autoPlayTimer) {
        clearTimeout(dictationTabState.autoPlayTimer);
        dictationTabState.autoPlayTimer = null;
    }
    if (autoPlay) {
        dictationTabState.autoPlayTimer = setTimeout(() => {
            const panel = document.getElementById('ws-dictation-panel');
            if (panel && !panel.classList.contains('hidden')) {
                playDictationCurrentAudio();
            }
        }, 250);
    }
}

function playDictationCurrentAudio() {
    const item = dictationTabState.situations[dictationTabState.index];
    if (!item || typeof speakText !== 'function') return;
    const playBtn = document.getElementById('dict-play-btn');
    speakText(item.sampleCasual, playBtn, dictationTabState.speed, { audioId: item.id });
}

function cycleDictationSpeed() {
    const speeds = [0.7, 0.85, 1.0];
    const idx = speeds.indexOf(dictationTabState.speed);
    dictationTabState.speed = speeds[(idx + 1) % speeds.length];
    updateDictationTabUI();
    playDictationCurrentAudio();
}

function toggleDictationPeekAnswer() {
    const item = dictationTabState.situations[dictationTabState.index];
    if (!item) return;

    dictationTabState.showPeekAnswer = !dictationTabState.showPeekAnswer;
    const peekBox = document.getElementById('dict-peek-box');
    const peekEn = document.getElementById('dict-peek-en');
    const peekVi = document.getElementById('dict-peek-vi');

    if (peekEn) peekEn.innerText = item.sampleCasual || '';
    if (peekVi) peekVi.innerText = item.vi ? `Nghĩa: ${item.vi}` : '';

    if (peekBox) {
        if (dictationTabState.showPeekAnswer) peekBox.classList.remove('hidden');
        else peekBox.classList.add('hidden');
    }
    updateDictationTabUI();
}

function revealNextDictationHintWord() {
    const item = dictationTabState.situations[dictationTabState.index];
    if (!item) return;

    const inputEl = document.getElementById('dict-input');
    const evalRes = evaluateDictationStrict(inputEl ? inputEl.value : '', item.sampleCasual);

    // Tìm từ đầu tiên chưa khớp và chưa được hé lộ
    let nextRevealIdx = -1;
    for (let i = 0; i < evalRes.targetTokens.length; i++) {
        if (!evalRes.matchedTargetIdx.has(i) && !dictationTabState.revealedIndices.has(i)) {
            nextRevealIdx = i;
            break;
        }
    }

    if (nextRevealIdx !== -1) {
        dictationTabState.revealedIndices.add(nextRevealIdx);
        renderDictationFeedback(evalRes, item);
        if (typeof speakText === 'function') {
            speakText(evalRes.targetTokens[nextRevealIdx].norm, null, 0.9, { forceTTS: true });
        }
    } else if (typeof showToast === 'function') {
        showToast('Tất cả các từ đã được hiển thị — hãy gõ lại đầy đủ để hoàn thành câu nhé!', 'info');
    }
}

function checkDictationInput() {
    const item = dictationTabState.situations[dictationTabState.index];
    const inputEl = document.getElementById('dict-input');
    if (!item || !inputEl) return;

    const userText = inputEl.value.trim();
    if (!userText) {
        if (typeof showToast === 'function') showToast('Bạn hãy nghe âm thanh và gõ lại câu tiếng Anh trước nhé!', 'warning');
        inputEl.focus();
        return;
    }

    const evalRes = evaluateDictationStrict(userText, item.sampleCasual);
    dictationTabState.isCurrentPassed = evalRes.isPerfect;

    if (evalRes.isPerfect) {
        dictationTabState.doneMap[item.id] = true;
        saveDictationDoneMap();
        dictationTabState.showPeekAnswer = false;
        const peekBox = document.getElementById('dict-peek-box');
        if (peekBox) peekBox.classList.add('hidden');
    }

    renderDictationFeedback(evalRes, item);
    updateDictationTabUI();
}

function renderDictationFeedback(evalRes, item) {
    const box = document.getElementById('dict-feedback-box');
    if (!box) return;

    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (evalRes.isPerfect) {
        const ipa = item.ipa || (typeof sentenceToIPA === 'function' ? sentenceToIPA(item.sampleCasual) : '');
        box.className = 'rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 space-y-2 transition-all';
        box.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-800">
                    <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                    Chính xác 100%! Đã mở khóa Câu tiếp theo
                </span>
            </div>
            <p class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">${esc(item.sampleCasual)}</p>
            ${ipa ? `<p class="font-mono text-xs text-indigo-600">${esc(ipa)}</p>` : ''}
            <p class="text-xs sm:text-sm font-semibold text-slate-600 italic">"${esc(item.vi)}"</p>
        `;
        box.classList.remove('hidden');
        return;
    }

    // Chưa đúng 100%: hiện từng từ (xanh = đúng, vàng = từ đã bấm gợi ý, ____ = chưa đúng/còn thiếu)
    const pillsHtml = evalRes.targetTokens.map((tok, idx) => {
        if (evalRes.matchedTargetIdx.has(idx)) {
            return `<span class="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-sm">${esc(tok.raw)}</span>`;
        }
        if (dictationTabState.revealedIndices.has(idx)) {
            return `<span class="inline-block px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-sm" title="Từ gợi ý">${esc(tok.raw)}</span>`;
        }
        return `<span class="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-mono font-extrabold text-xs tracking-widest">____</span>`;
    }).join(' ');

    const matchedCount = evalRes.matchedTargetIdx.size;
    const totalCount = evalRes.targetTokens.length;
    const extraNote = evalRes.extraWrongCount > 0
        ? ` • Có <strong>${evalRes.extraWrongCount}</strong> từ bị gõ sai chính tả hoặc thừa.`
        : '';

    box.className = 'rounded-2xl border border-rose-200 bg-white p-4 space-y-2.5 transition-all';
    box.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-extrabold text-rose-700">
                <i class="fa-solid fa-ear-listen mr-1"></i>Đúng ${matchedCount}/${totalCount} từ — hãy nghe lại và sửa tiếp!
            </span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 leading-relaxed">
            ${pillsHtml}
        </div>
        <p class="text-[11px] text-slate-500">
            Còn thiếu <strong>${evalRes.missingCount}</strong> từ${extraNote}
        </p>
    `;
    box.classList.remove('hidden');
}

function stepDictationPrev() {
    if (dictationTabState.index > 0) {
        loadDictationQuestion(dictationTabState.index - 1, true);
    } else if (typeof showToast === 'function') {
        showToast('Bạn đang ở câu đầu tiên của Trạm.', 'info');
    }
}

function goNextDictationQuestion() {
    if (!dictationTabState.isCurrentPassed) {
        if (typeof showToast === 'function') {
            showToast('Bạn cần gõ chính xác 100% câu hiện tại để mở khóa câu tiếp theo!', 'warning');
        }
        return;
    }

    const total = dictationTabState.situations.length;
    if (dictationTabState.index + 1 < total) {
        loadDictationQuestion(dictationTabState.index + 1, true);
    } else {
        const doneCount = dictationTabState.situations.filter(s => Boolean(dictationTabState.doneMap[s.id])).length;
        const activeStructId = dictationTabState.structId || ((typeof state !== 'undefined' && state.practiceMode === 'structure') ? state.selectedStructureId : null);
        const structObj = activeStructId && Array.isArray(typeof SENTENCE_STRUCTURES !== 'undefined' ? SENTENCE_STRUCTURES : [])
            ? SENTENCE_STRUCTURES.find(s => s.id === activeStructId)
            : null;

        if (structObj && doneCount >= total && window.VA_STATION_MILESTONE && typeof window.VA_STATION_MILESTONE.onSkillCompleted === 'function') {
            window.VA_STATION_MILESTONE.onSkillCompleted({
                struct: structObj,
                skillKey: 'dictation',
                completedCount: doneCount,
                totalCount: total,
                bonusXp: 0
            });
        } else if (typeof showToast === 'function') {
            showToast('🎉 Tuyệt vời! Bạn đã hoàn thành Nghe chép trọn bộ Trạm này!', 'success');
        }
        loadDictationQuestion(0, false);
    }
}

function updateDictationTabUI() {
    const total = dictationTabState.situations.length;
    if (total === 0) return;

    const cur = dictationTabState.index + 1;
    const doneCount = dictationTabState.situations.filter(s => Boolean(dictationTabState.doneMap[s.id])).length;
    const pct = Math.round((cur / total) * 100);

    const counterEl = document.getElementById('dict-counter-text');
    const doneEl = document.getElementById('dict-done-badge');
    const barEl = document.getElementById('dict-progress-bar');
    const speedBtn = document.getElementById('dict-speed-btn');
    const peekBtn = document.getElementById('dict-peek-btn');
    const nextBtn = document.getElementById('dict-next-btn');
    const nextIcon = document.getElementById('dict-next-icon');

    if (counterEl) counterEl.innerText = `Câu ${cur} / ${total}`;
    if (doneEl) doneEl.innerText = `Đã chép: ${doneCount}/${total}`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (speedBtn) speedBtn.innerHTML = `<i class="fa-solid fa-gauge-simple-low"></i><span>Tốc độ: ${dictationTabState.speed}x</span>`;

    if (peekBtn) {
        peekBtn.innerHTML = dictationTabState.showPeekAnswer
            ? `<i class="fa-regular fa-eye-slash text-amber-600"></i><span>Ẩn đáp án</span>`
            : `<i class="fa-regular fa-eye text-slate-500"></i><span>Xem đáp án</span>`;
    }

    if (nextBtn) {
        if (dictationTabState.isCurrentPassed) {
            nextBtn.disabled = false;
            nextBtn.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer';
            nextBtn.title = 'Sang câu tiếp theo (Enter)';
            if (nextIcon) nextIcon.className = 'fa-solid fa-arrow-right text-xs';
        } else {
            nextBtn.disabled = true;
            nextBtn.className = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-200 text-slate-400 cursor-not-allowed transition-all';
            nextBtn.title = 'Cần gõ đúng 100% câu hiện tại để mở khóa';
            if (nextIcon) nextIcon.className = 'fa-solid fa-lock text-xs';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const dictInput = document.getElementById('dict-input');
    if (dictInput) {
        dictInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (dictationTabState.isCurrentPassed) {
                    goNextDictationQuestion();
                } else {
                    checkDictationInput();
                }
            } else if (e.key === 'F1') {
                e.preventDefault();
                playDictationCurrentAudio();
            }
        });
    }
});

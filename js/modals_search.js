/**
 * MODULE MODALS & SEARCH: TÌM BÀI HỌC, HỘP ÔN TẬP & MODAL TÂM SỰ TÁC GIẢ (js/modals_search.js)
 * Tách độc lập từ app_controller.js theo kiến trúc hệ thống (Single Responsibility):
 *  - Modal Tâm sự tác giả & phím Esc toàn cục cho các lớp phủ/modal
 *  - Hộp Ôn Tập Thông Minh (Spaced Repetition): trang riêng (#view-review), lọc hạn ôn, nhảy thẳng câu
 *  - Từ vựng trọng tâm của Trạm trong Tab Lý thuyết
 *  - Giao diện Tìm bài học toàn màn hình (có dấu / không dấu, tiếng Việt / tiếng Anh)
 */

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
      if (typeof closeAudioDrillModal === 'function') closeAudioDrillModal();
      closeGlobalSearchModal();
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
    renderReviewPage();
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

let reviewPageFilterMode = 'all'; // 'all' | 'due' | 'upcoming'

function setReviewPageFilter(mode) {
    reviewPageFilterMode = (mode === 'due' || mode === 'upcoming') ? mode : 'all';
    renderReviewPage();
}

function speakReviewItemByIndex(idx, btnEl) {
    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    const item = reviewBox[idx];
    if (!item || typeof speakText !== 'function') return;

    const viNorm = normalizeReviewCompareText(getReviewItemViText(item));
    const candIds = [item.situationId, item.id, item.questionId].filter(Boolean).map(v => String(v).trim());
    let matched = null;
    for (const st of (SENTENCE_STRUCTURES || [])) {
        matched = (st.situations || []).find(s =>
            (candIds.length > 0 && candIds.includes(String(s.id).trim())) ||
            (viNorm && normalizeReviewCompareText(s.vi) === viNorm)
        );
        if (matched) break;
    }
    const textToSpeak = matched ? matched.sampleCasual : (item.en || item.sampleCasual || '');
    if (textToSpeak) {
        speakText(textToSpeak, btnEl, 0.9, { audioId: matched ? matched.id : '' });
    }
}

function renderReviewBoxModal() {
    switchTab('review');
}

function renderReviewPage() {
    const listEl = document.getElementById('review-page-list');
    const emptyEl = document.getElementById('review-page-empty');
    const filterBar = document.getElementById('review-filter-bar');
    const audioBtn = document.getElementById('review-page-audio-btn');
    if (!listEl || !emptyEl) return;

    const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const now = Date.now();

    if (audioBtn) {
        if (reviewBox.length > 0) audioBtn.classList.remove('hidden');
        else audioBtn.classList.add('hidden');
    }

    if (reviewBox.length === 0) {
        listEl.innerHTML = '';
        emptyEl.classList.remove('hidden');
        if (filterBar) filterBar.classList.add('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    if (filterBar) filterBar.classList.remove('hidden');

    const enriched = reviewBox.map((item, origIdx) => {
        const rawDue = item.nextReviewDue || item.nextReview || item.dueDate || item.reviewAt || 0;
        const dueTs = rawDue ? new Date(rawDue).getTime() : 0;
        const isDue = !dueTs || dueTs <= now;
        return { item, origIdx, dueTs, isDue };
    });

    const dueCount = enriched.filter(x => x.isDue).length;
    const upcomingCount = enriched.length - dueCount;

    const btnAll = document.getElementById('review-filter-all');
    const btnDue = document.getElementById('review-filter-due');
    const btnUp = document.getElementById('review-filter-upcoming');
    if (btnAll) {
        btnAll.innerText = `Tất cả (${enriched.length})`;
        btnAll.className = reviewPageFilterMode === 'all'
            ? 'px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-900 text-white transition-all'
            : 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all';
    }
    if (btnDue) {
        btnDue.innerText = `Đến hạn hôm nay (${dueCount})`;
        btnDue.className = reviewPageFilterMode === 'due'
            ? 'px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-2xs transition-all'
            : 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all';
    }
    if (btnUp) {
        btnUp.innerText = `Chưa tới hạn (${upcomingCount})`;
        btnUp.className = reviewPageFilterMode === 'upcoming'
            ? 'px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-2xs transition-all'
            : 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all';
    }

    const filtered = enriched.filter(x => {
        if (reviewPageFilterMode === 'due') return x.isDue;
        if (reviewPageFilterMode === 'upcoming') return !x.isDue;
        return true;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                Không có câu nào trong mục lọc này.
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(({ item, origIdx, dueTs, isDue }) => {
        const dateStr = dueTs ? new Date(dueTs).toLocaleDateString('vi-VN') : 'Hôm nay';
        const viText = getReviewItemViText(item) || 'Tình huống ôn tập';
        return `
            <div class="bg-white rounded-2xl border ${isDue ? 'border-rose-200' : 'border-slate-200/90'} p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3.5">
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold ${isDue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}">
                            <i class="fa-solid ${isDue ? 'fa-clock' : 'fa-rotate-left'} text-[10px]"></i>
                            ${isDue ? 'Đến hạn ôn tập' : 'Chưa đạt • Cần ôn lại'}
                        </span>
                        <span class="text-[11px] text-slate-400 font-medium">Hẹn ôn: ${dateStr}</span>
                    </div>
                    <p class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">"${esc(viText)}"</p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="speakReviewItemByIndex(${origIdx}, this)" class="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 flex items-center justify-center transition-all" title="Nghe câu chuẩn">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </button>
                        <button type="button" onclick="removeFromReviewBoxByIndex(${origIdx})" class="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 flex items-center justify-center transition-all" title="Xóa khỏi hộp ôn tập">
                            <i class="fa-regular fa-trash-can text-xs"></i>
                        </button>
                    </div>
                    <button type="button" onclick="jumpToReviewBoxQuestionByIndex(${origIdx})" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all">
                        <span>Ôn ngay</span>
                        <i class="fa-solid fa-arrow-right text-[11px]"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
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
// ==================== GIAO DIỆN TÌM BÀI HỌC & TRA TỪ ĐIỂN 2 CHIỀU (ANH-VIỆT / VIỆT-ANH) ====================
const GLOBAL_SEARCH_SUGGESTIONS = [
    'opportunity', 'cơ hội', 'To be', 'Gia đình', 'Du lịch', 'Have / Has', 'accommodation', 'Công sở'
];

// Tra từ điển 2 chiều siêu tốc (1ms) trong kho 3.293 từ window.VA_DICTIONARY_CORE
function searchCoreDictionary(rawQuery) {
    if (typeof window.VA_DICTIONARY_CORE !== 'object' || !window.VA_DICTIONARY_CORE) return [];
    const q = String(rawQuery || '').trim();
    if (q.length < 2) return [];

    const qLower = q.toLowerCase();
    const qNorm = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(q) : qLower;
    const results = [];

    for (const [word, entry] of Object.entries(window.VA_DICTIONARY_CORE)) {
        if (!entry) continue;
        const wLower = word.toLowerCase();
        const viLower = String(entry.vi || '').toLowerCase();
        const viNorm = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(viLower) : viLower;

        let score = 0;
        // Chiều 1: Tra Anh -> Việt
        if (wLower === qLower) score = 100;
        else if (wLower.startsWith(qLower)) score = 80;
        else if (wLower.includes(qLower) && qLower.length >= 3) score = 50;

        // Chiều 2: Tra ngược Việt -> Anh (có dấu hoặc không dấu)
        if (score === 0) {
            if (viLower === qLower || viNorm === qNorm) score = 90;
            else if (viLower.includes(qLower)) score = 70;
            else if (viNorm.includes(qNorm) && qNorm.length >= 2) score = 60;
        }

        if (score > 0) {
            results.push({ word, entry, score });
        }
    }

    results.sort((a, b) => b.score - a.score || a.word.length - b.word.length);
    return results.slice(0, 8);
}

function speakDictSearchWord(encodedWord, btnEl) {
    const word = decodeURIComponent(encodedWord || '').trim();
    if (word && typeof speakText === 'function') {
        speakText(word, btnEl, 0.9);
    }
}

function saveDictSearchWord(encodedWord, btnEl) {
    const word = decodeURIComponent(encodedWord || '').trim();
    if (!word) return;
    const entry = (window.VA_DICTIONARY_CORE && window.VA_DICTIONARY_CORE[word.toLowerCase()]) || null;
    if (!entry) return;

    let list = [];
    try {
        list = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
    } catch (e) {}

    if (list.some(v => String(v.en || '').toLowerCase() === word.toLowerCase())) {
        if (typeof showToast === 'function') showToast(`Từ "${word}" đã có sẵn trong Sổ tay!`, 'info');
        return;
    }

    list.unshift({
        id: 'voc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        en: word,
        vi: entry.vi || '',
        ipa: entry.ipa || '',
        pos: entry.pos || '',
        level: entry.level || 'B1',
        emoji: '📖',
        imageUrl: '',
        topic: 'Từ điển Oxford',
        exampleEn: entry.example || '',
        exampleVi: '',
        mastered: false,
        foreverMastered: false,
        reviewStage: 0,
        nextReviewDue: null,
        addedAt: new Date().toISOString()
    });

    localStorage.setItem('va_vocab_bank', JSON.stringify(list));
    if (typeof addXP === 'function') addXP(2);
    if (typeof window.updateNotebookBadge === 'function') window.updateNotebookBadge();

    if (btnEl) {
        btnEl.className = 'px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1 shrink-0';
        btnEl.innerHTML = '<i class="fa-solid fa-check text-[10px]"></i><span>Đã lưu</span>';
        btnEl.onclick = null;
    }
    if (typeof showToast === 'function') {
        showToast(`✨ Đã lưu "${word}" vào Sổ tay từ vựng (+2 XP)!`, 'success');
    }
}

function openGlobalSearchModal() {
    closeGlobalSearchModal();

    const modal = document.createElement('div');
    modal.id = 'va-global-search-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-50 flex flex-col animate-fade-in';
    modal.innerHTML = `
        <!-- Thanh trên cùng -->
        <div class="bg-white border-b border-slate-200/80 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 shrink-0">
            <button type="button" onclick="closeGlobalSearchModal()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all" title="Quay lại">
                <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <div class="flex items-center gap-2 font-extrabold text-slate-900 text-sm sm:text-base">
                <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xs">
                    <i class="fa-solid fa-language"></i>
                </span>
                <span>Tìm bài & Tra từ điển</span>
            </div>
            <button type="button" onclick="closeGlobalSearchModal()" class="px-3 py-1.5 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-all">
                Đóng
            </button>
        </div>

        <!-- Nội dung cuộn -->
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            <div class="max-w-xl mx-auto space-y-5">
                <div class="space-y-1.5">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900">Tìm bài học & Tra từ điển</h2>
                    <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Tra nghĩa nhanh <strong>Anh–Việt / Việt–Anh</strong> (kho 3.293 từ offline) hoặc tìm bài học, ngữ pháp bất kỳ.
                    </p>
                </div>

                <!-- Ô nhập 16px chuẩn chống tự zoom trên iPhone -->
                <div class="relative">
                    <i class="fa-solid fa-magnifying-glass text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none"></i>
                    <input id="va-global-search-input" type="search" autocomplete="off" oninput="handleGlobalSearchInput(this.value)" placeholder="Tra từ (opportunity, cơ hội...) hoặc tìm bài (To be, gia đình)..." class="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border-2 border-indigo-400/80 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 text-base font-medium text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition-all">
                    <button id="va-global-search-clear" type="button" onclick="clearGlobalSearchInput()" class="hidden absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>

                <!-- Thẻ Gợi ý 1 chạm -->
                <div id="va-global-search-suggestions" class="space-y-2.5">
                    <p class="text-xs font-bold text-slate-500">Gợi ý nhanh</p>
                    <div class="flex flex-wrap gap-2">
                        ${GLOBAL_SEARCH_SUGGESTIONS.map(tag => `
                            <button type="button" onclick="pickGlobalSearchSuggestion('${tag.replace(/'/g, "\\'")}')" class="px-3.5 py-2 rounded-full bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 text-xs sm:text-sm font-semibold shadow-2xs transition-all">
                                ${tag}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Kết quả tìm kiếm tức thì -->
                <div id="va-global-search-results" class="space-y-3"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const inp = document.getElementById('va-global-search-input');
        if (inp) inp.focus();
    }, 60);
}

function closeGlobalSearchModal() {
    const modal = document.getElementById('va-global-search-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
}

function clearGlobalSearchInput() {
    const inp = document.getElementById('va-global-search-input');
    if (inp) {
        inp.value = '';
        inp.focus();
    }
    handleGlobalSearchInput('');
}

function pickGlobalSearchSuggestion(keyword) {
    const inp = document.getElementById('va-global-search-input');
    if (inp) inp.value = keyword;
    handleGlobalSearchInput(keyword);
}

function jumpToGlobalSearchStructure(structId) {
    closeGlobalSearchModal();
    switchTab('practice');
    switchPracticeMode('structure');
    openStructureWorkspace(structId);
}

function jumpToGlobalSearchSituation(structId, sitIdx) {
    closeGlobalSearchModal();
    jumpToSituation(structId, sitIdx);
}

function handleGlobalSearchInput(rawQuery) {
    const q = String(rawQuery || '').trim();
    const clearBtn = document.getElementById('va-global-search-clear');
    const sugBox = document.getElementById('va-global-search-suggestions');
    const resBox = document.getElementById('va-global-search-results');

    if (clearBtn) {
        if (q) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    if (!q) {
        if (sugBox) sugBox.classList.remove('hidden');
        if (resBox) resBox.innerHTML = '';
        return;
    }

    if (sugBox) sugBox.classList.add('hidden');
    if (!resBox) return;

    const qNorm = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(q) : q.toLowerCase();
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 1. Tra cứu Từ điển 2 chiều
    const matchedDict = searchCoreDictionary(q);

    // 2. Tìm Trạm ngữ pháp & Câu tình huống
    const matchedStructs = [];
    const matchedSits = [];

    (SENTENCE_STRUCTURES || []).forEach(st => {
        const stText = `${st.title || ''} ${st.shortName || ''} ${st.formula || ''} ${st.description || ''}`;
        const stNorm = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(stText) : stText.toLowerCase();
        if (stNorm.includes(qNorm)) {
            matchedStructs.push(st);
        }

        (st.situations || []).forEach((sit, idx) => {
            if (typeof doesQuestionMatchSearchQuery === 'function' && doesQuestionMatchSearchQuery(sit, q, st)) {
                matchedSits.push({ struct: st, sit, idx });
            }
        });
    });

    if (matchedDict.length === 0 && matchedStructs.length === 0 && matchedSits.length === 0) {
        resBox.innerHTML = `
            <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
                <i class="fa-solid fa-magnifying-glass text-slate-300 text-2xl"></i>
                <p class="text-sm font-bold text-slate-700">Không tìm thấy từ vựng hay bài học nào cho "${esc(q)}"</p>
                <p class="text-xs text-slate-500">Thử gõ từ khóa khác như "opportunity", "cơ hội", "To be", "gia đình"...</p>
            </div>
        `;
        return;
    }

    let html = '';

    // KHỐI 1: KẾT QUẢ TỪ ĐIỂN 2 CHIỀU
    if (matchedDict.length > 0) {
        let savedSet = new Set();
        try {
            const savedBank = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
            savedSet = new Set(savedBank.map(v => String(v.en || '').trim().toLowerCase()));
        } catch (e) {}

        html += `<p class="text-xs font-extrabold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5"><i class="fa-solid fa-book-open"></i> Từ điển nhanh (${matchedDict.length})</p>`;
        html += matchedDict.map(({ word, entry }) => {
            const encoded = encodeURIComponent(word);
            const isSaved = savedSet.has(word.toLowerCase());
            const saveBtn = isSaved
                ? `<span class="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1 shrink-0"><i class="fa-solid fa-check text-[10px]"></i>Đã lưu</span>`
                : `<button type="button" onclick="saveDictSearchWord('${encoded}', this)" class="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-indigo-600 text-amber-800 hover:text-white border border-amber-200 hover:border-indigo-600 font-bold text-xs inline-flex items-center gap-1 shrink-0 transition-all"><i class="fa-solid fa-plus text-[10px]"></i>Lưu từ</button>`;

            return `
                <div class="bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 p-4 shadow-2xs transition-all space-y-2">
                    <div class="flex items-start justify-between gap-2.5">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-base sm:text-lg font-extrabold text-indigo-950">${esc(word)}</span>
                                ${entry.pos ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">${esc(entry.pos)}</span>` : ''}
                                ${entry.level ? `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${esc(entry.level)}</span>` : ''}
                            </div>
                            ${entry.ipa ? `<p class="font-mono text-xs text-indigo-500 mt-0.5">${esc(entry.ipa)}</p>` : ''}
                            <p class="text-sm font-bold text-emerald-700 mt-1">${esc(entry.vi)}</p>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="speakDictSearchWord('${encoded}', this)" class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe phát âm">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                            ${saveBtn}
                        </div>
                    </div>
                    ${entry.example ? `<p class="text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">"${esc(entry.example)}"</p>` : ''}
                </div>
            `;
        }).join('');
    }

    // KHỐI 2: TRẠM NGỮ PHÁP
    if (matchedStructs.length > 0) {
        html += `<p class="text-xs font-extrabold uppercase tracking-wider text-slate-400 pt-2">Trạm ngữ pháp (${matchedStructs.length})</p>`;
        html += matchedStructs.map(st => `
            <div onclick="jumpToGlobalSearchStructure('${st.id}')" class="cursor-pointer bg-white hover:bg-indigo-50/40 rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-4 shadow-2xs transition-all flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">${normalizeCEFRLevel(st.level)}</span>
                        <span class="text-xs font-bold text-slate-400">${(st.situations || []).length} câu</span>
                    </div>
                    <h4 class="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">${esc(st.title)}</h4>
                    <p class="text-xs text-slate-500 truncate">${esc(st.description || '')}</p>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-400 text-xs shrink-0"></i>
            </div>
        `).join('');
    }

    // KHỐI 3: CÂU TÌNH HUỐNG
    if (matchedSits.length > 0) {
        const shownSits = matchedSits.slice(0, 15);
        html += `<p class="text-xs font-extrabold uppercase tracking-wider text-slate-400 pt-2">Câu tình huống khớp (${matchedSits.length})</p>`;
        html += shownSits.map(({ struct, sit, idx }) => `
            <div onclick="jumpToGlobalSearchSituation('${struct.id}', ${idx})" class="cursor-pointer bg-white hover:bg-indigo-50/40 rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-4 shadow-2xs transition-all space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold text-indigo-600">${esc(struct.shortName || struct.title)} • Câu ${idx + 1}</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600">${normalizeCEFRLevel(sit.level)}</span>
                </div>
                <p class="text-sm font-extrabold text-slate-900 leading-snug">${esc(sit.vi)}</p>
                <p class="text-xs font-medium text-slate-500">${esc(sit.sampleCasual)}</p>
            </div>
        `).join('');
    }

    resBox.innerHTML = html;
}


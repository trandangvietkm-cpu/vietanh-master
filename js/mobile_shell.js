/**
 * ViệtAnh Master — Mobile Native Shell & Theme Switcher (js/mobile_shell.js)
 * - Chuyển đổi giao diện 2 chế độ: Sáng (Light) / Tối (Dark), lưu bền vững trong localStorage
 * - Thanh điều hướng đáy (Bottom Navigation Bar 5 nút) cho Mobile, tự ẩn trong Phòng luyện
 * - Menu hệ thống dạng Bottom Sheet trượt từ dưới lên (tích hợp Tra nhanh, Sáng/Tối & công cụ)
 */
(function () {
    if (window.__VA_MOBILE_SHELL_LOADED__) return;
    window.__VA_MOBILE_SHELL_LOADED__ = true;

    const THEME_KEY = 'va_theme';

    // ==================== 1. QUẢN LÝ GIAO DIỆN SÁNG / TỐI ====================
    function getTheme() {
        return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(mode) {
        const isDark = mode === 'dark';
        document.documentElement.classList.toggle('va-dark', isDark);
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        syncThemeButtonsUI(isDark);
    }

    function syncThemeButtonsUI(isDark) {
        const pcBtn = document.getElementById('va-desktop-theme-btn');
        if (pcBtn) {
            pcBtn.innerHTML = isDark
                ? '<i class="fa-solid fa-sun text-amber-400 text-sm"></i>'
                : '<i class="fa-solid fa-moon text-indigo-500 text-sm"></i>';
            pcBtn.title = isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối';
        }

        const sheetBtn = document.getElementById('va-sheet-theme-btn');
        if (sheetBtn) {
            sheetBtn.innerHTML = isDark
                ? '<i class="fa-solid fa-sun text-amber-400 text-xs"></i><span>Sáng</span>'
                : '<i class="fa-solid fa-moon text-indigo-500 text-xs"></i><span>Tối</span>';
        }
    }

    window.toggleThemeMode = function () {
        applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    };

    window.setThemeMode = function (mode) {
        applyTheme(mode === 'dark' ? 'dark' : 'light');
    };

    function injectDesktopThemeButton() {
        if (document.getElementById('va-desktop-theme-btn')) return;
        const authArea = document.getElementById('user-auth-area');
        if (!authArea || !authArea.parentElement) return;

        const btn = document.createElement('button');
        btn.id = 'va-desktop-theme-btn';
        btn.type = 'button';
        btn.onclick = () => window.toggleThemeMode();
        btn.className = 'hidden md:inline-flex w-9 h-9 items-center justify-center rounded-xl text-slate-600 hover:bg-indigo-50/80 border border-slate-200/80 transition-all';
        authArea.parentElement.insertBefore(btn, authArea);
        syncThemeButtonsUI(getTheme() === 'dark');
    }

    // ==================== 2. TÌM & KẾT NỐI NÚT TỪ ĐIỂN CỦA VOCAB_LIBRARY ====================
    function findHeaderDictionaryButton() {
        const headerBtns = document.querySelectorAll('header button');
        for (const btn of headerBtns) {
            const txt = (btn.textContent || '').trim().toLowerCase();
            if (txt.includes('từ điển') || (btn.id && btn.id.toLowerCase().includes('vocab-lib'))) {
                return btn;
            }
        }
        return null;
    }

    function markMobileHiddenHeaderButtons() {
        const dictBtn = findHeaderDictionaryButton();
        if (dictBtn) dictBtn.classList.add('va-hide-on-mobile-header');
    }

    window.openDictionaryFromShell = function () {
    closeSystemMenuSheet();
    if (typeof switchTab === 'function') switchTab('dictionary');
};

    // ==================== 3. THANH ĐIỀU HƯỚNG ĐÁY (BOTTOM NAV 5 NÚT) ====================
    function setBottomNavActive(key) {
        document.querySelectorAll('#va-mobile-bottom-nav .va-bnav-item').forEach(btn => {
            const isActive = btn.getAttribute('data-bnav') === key;
            btn.classList.toggle('is-active', isActive);
        });
    }

    function syncShellBadges() {
        const nbCount = document.getElementById('notebook-badge')?.innerText?.trim() || '0';
        const rvBadgeEl = document.getElementById('review-badge-count');
        const rvCount = rvBadgeEl && rvBadgeEl.style.display !== 'none' ? (rvBadgeEl.innerText || '0').trim() : '0';

        const bnavNb = document.getElementById('va-bnav-nb-badge');
        if (bnavNb) {
            bnavNb.innerText = nbCount;
            bnavNb.style.display = Number(nbCount) > 0 ? 'inline-flex' : 'none';
        }

        const sheetNb = document.getElementById('va-sheet-nb-badge');
        if (sheetNb) sheetNb.innerText = nbCount;

        const sheetRv = document.getElementById('va-sheet-rv-badge');
        if (sheetRv) {
            sheetRv.innerText = rvCount;
            sheetRv.style.display = Number(rvCount) > 0 ? 'inline-flex' : 'none';
        }
    }

    function injectBottomNav() {
        if (document.getElementById('va-mobile-bottom-nav')) return;

        const nav = document.createElement('nav');
        nav.id = 'va-mobile-bottom-nav';
        nav.setAttribute('aria-label', 'Điều hướng di động');
        nav.innerHTML = `
            <button type="button" class="va-bnav-item is-active" data-bnav="home" onclick="switchTab('home')">
                <span class="va-bnav-icon"><i class="fa-solid fa-house"></i></span>
                <span class="va-bnav-label">Trang chủ</span>
            </button>
            <button type="button" class="va-bnav-item" data-bnav="practice" onclick="switchTab('practice')">
                <span class="va-bnav-icon"><i class="fa-solid fa-pen-nib"></i></span>
                <span class="va-bnav-label">Luyện tập</span>
            </button>
            <button type="button" class="va-bnav-item" data-bnav="dict" onclick="openDictionaryFromShell()">
                <span class="va-bnav-icon"><i class="fa-solid fa-book"></i></span>
                <span class="va-bnav-label">Từ điển</span>
            </button>
            <button type="button" class="va-bnav-item" data-bnav="notebook" onclick="switchTab('notebook')">
                <span class="va-bnav-icon relative">
                    <i class="fa-solid fa-bookmark"></i>
                    <span id="va-bnav-nb-badge" class="va-bnav-badge" style="display:none;">0</span>
                </span>
                <span class="va-bnav-label">Sổ tay</span>
            </button>
            <button type="button" class="va-bnav-item" data-bnav="menu" onclick="openSystemMenuSheet()">
                <span class="va-bnav-icon"><i class="fa-solid fa-bars"></i></span>
                <span class="va-bnav-label">Menu</span>
            </button>
        `;
        document.body.appendChild(nav);
        syncShellBadges();
    }

    // ==================== 4. MENU HỆ THỐNG DẠNG BOTTOM SHEET ====================
    function injectSystemMenuSheet() {
        if (document.getElementById('va-system-menu-sheet')) return;

        const overlay = document.createElement('div');
        overlay.id = 'va-system-menu-sheet';
        overlay.className = 'va-sheet-backdrop';
        overlay.innerHTML = `
            <div class="va-sheet-panel" role="dialog" aria-modal="true" aria-label="Menu hệ thống">
                <div class="va-sheet-handle"></div>

                <!-- Header Menu: Tiêu đề + Nút đổi Sáng/Tối + Nút đóng -->
                <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h3 class="text-base font-extrabold text-slate-900">Menu hệ thống</h3>
                    <div class="flex items-center gap-2">
                        <button id="va-sheet-theme-btn" type="button" onclick="toggleThemeMode()"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 transition-all">
                            <i class="fa-solid fa-moon text-indigo-500 text-xs"></i><span>Tối</span>
                        </button>
                        <button type="button" onclick="closeSystemMenuSheet()"
                            class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-all" title="Đóng">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Ô tra từ nhanh mở Mini-Lookup -->
                <button type="button" onclick="closeSystemMenuSheet(); if(typeof openMiniLookup==='function') openMiniLookup();"
                    class="w-full mt-3 mb-3.5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-xs font-medium text-left border border-slate-200/80">
                    <i class="fa-solid fa-magnifying-glass text-indigo-500 text-xs"></i>
                    <span>Tra nhanh từ Anh – Việt (3.293 từ)...</span>
                </button>

                <!-- Lưới 2 cột các tính năng -->
                <div class="grid grid-cols-2 gap-2.5 pb-2">
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('home');" class="va-sheet-tile">
                        <i class="fa-solid fa-house text-indigo-500"></i>
                        <span>Trang chủ</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('practice'); switchPracticeMode('structure'); backToStructureLibrary();" class="va-sheet-tile">
                        <i class="fa-solid fa-map-location-dot text-blue-500"></i>
                        <span>Sơ đồ học</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('practice'); switchPracticeMode('topic');" class="va-sheet-tile">
                        <i class="fa-solid fa-layer-group text-purple-500"></i>
                        <span>Chủ đề tự do</span>
                    </button>
                    <button type="button" onclick="openDictionaryFromShell()" class="va-sheet-tile">
                        <i class="fa-solid fa-book text-emerald-600"></i>
                        <span>Từ điển 3K</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('cloze');" class="va-sheet-tile">
                        <i class="fa-solid fa-puzzle-piece text-indigo-600"></i>
                        <span>Điền từ ngữ cảnh</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('notebook');" class="va-sheet-tile justify-between">
                        <span class="flex items-center gap-2 min-w-0"><i class="fa-solid fa-bookmark text-indigo-500"></i><span class="truncate">Sổ tay</span></span>
                        <span id="va-sheet-nb-badge" class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">0</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('review');" class="va-sheet-tile justify-between">
                        <span class="flex items-center gap-2 min-w-0"><i class="fa-solid fa-brain text-rose-500"></i><span class="truncate">Hộp ôn tập</span></span>
                        <span id="va-sheet-rv-badge" class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white" style="display:none;">0</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); if(typeof openGlobalSearchModal==='function') openGlobalSearchModal();" class="va-sheet-tile">
                        <i class="fa-solid fa-magnifying-glass text-sky-500"></i>
                        <span>Tìm bài học</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); if(typeof openBackupRestoreSection==='function') openBackupRestoreSection(); else if(typeof switchTab==='function') switchTab('profile');" class="va-sheet-tile">
                    <i class="fa-solid fa-download text-teal-600"></i>
                    <span>Sao lưu & Khôi phục</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); if(typeof toggleAuthorModal==='function') toggleAuthorModal(true);" class="va-sheet-tile">
                        <i class="fa-solid fa-envelope-open-text text-rose-500"></i>
                        <span>Tâm sự tác giả</span>
                    </button>
                    <button type="button" onclick="closeSystemMenuSheet(); switchTab('profile');" class="va-sheet-tile">
                        <i class="fa-regular fa-circle-user text-amber-500"></i>
                        <span>Hồ sơ học viên</span>
                    </button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSystemMenuSheet();
        });
        document.body.appendChild(overlay);
        syncThemeButtonsUI(getTheme() === 'dark');
        syncShellBadges();
    }

    window.openSystemMenuSheet = function () {
        injectSystemMenuSheet();
        syncShellBadges();
        syncThemeButtonsUI(getTheme() === 'dark');
        const sheet = document.getElementById('va-system-menu-sheet');
        if (sheet) sheet.classList.add('active');
    };

    window.closeSystemMenuSheet = function () {
        const sheet = document.getElementById('va-system-menu-sheet');
        if (sheet) sheet.classList.remove('active');
    };

    // ==================== 5. ĐỒNG BỘ TAB & KHỞI TẠO ====================
    function wrapSwitchTabForBottomNav() {
        const origSwitchTab = window.switchTab;
        if (typeof origSwitchTab !== 'function') return;
        window.switchTab = function (tab) {
            origSwitchTab.apply(this, arguments);
            if (tab === 'home' || tab === 'practice' || tab === 'notebook') {
                setBottomNavActive(tab);
            } else if (tab === 'review') {
                setBottomNavActive('menu');
            }
            syncShellBadges();
        };
    }

    // ==================== 5. ĐỒNG BỘ TAB VỚI SINGLE ROUTER & KHỞI TẠO ====================
window.onTabChanged = function (tab) {
    if (tab === 'home' || tab === 'practice' || tab === 'notebook') {
        setBottomNavActive(tab);
    } else if (tab === 'dictionary') {
        setBottomNavActive('dict');
    } else {
        setBottomNavActive('menu');
    }
    syncShellBadges();
};

function initMobileShell() {
    applyTheme(getTheme());
    injectDesktopThemeButton();
    injectBottomNav();
    injectSystemMenuSheet();
    window.onTabChanged((typeof state !== 'undefined' && state.activeTab) ? state.activeTab : 'home');

    ['notebook-badge', 'review-badge-count'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            new MutationObserver(syncShellBadges).observe(el, {
                childList: true, characterData: true, attributes: true, subtree: true
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSystemMenuSheet();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileShell);
} else {
    initMobileShell();
}
})();
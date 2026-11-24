/**
 * DESKTOP SHELL (js/desktop_shell.js)
 * Sidebar trái cố định + Thanh tra nhanh 3.293 từ trên Header cho màn hình máy tính (>= 769px)
 */
(function () {
    function isDesktop() {
        return window.innerWidth >= 769;
    }

    // 1. Tạo Sidebar cố định bên trái
    function mountDesktopSidebar() {
        if (document.getElementById('va-desktop-sidebar')) return;

        const sidebar = document.createElement('aside');
        sidebar.id = 'va-desktop-sidebar';
        sidebar.innerHTML = `
            <!-- Đầu Sidebar: Logo + Nút thu gọn -->
            <div class="va-ds-header">
                <div class="va-ds-brand" onclick="switchTab('home')">
                    <div class="va-ds-logo"><i class="fa-solid fa-language"></i></div>
                    <div class="va-ds-brand-text">
                        <div class="va-ds-title">ViệtAnh <span>Master</span></div>
                        <div class="va-ds-sub">Luyện dịch tự nhiên</div>
                    </div>
                </div>
                <button type="button" id="va-ds-collapse-btn" class="va-ds-collapse-btn" title="Thu gọn / Mở rộng thanh bên">
                    <i class="fa-solid fa-angles-left"></i>
                </button>
            </div>

            <!-- Danh mục điều hướng cuộn mượt -->
            <nav class="va-ds-nav">
                <div class="va-ds-group-label">CHÍNH</div>
                <button type="button" class="va-ds-item" data-ds-key="home" onclick="vaDesktopNav('home')">
                    <i class="fa-solid fa-house"></i><span>Trang chủ</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="roadmap" onclick="vaDesktopNav('roadmap')">
                    <i class="fa-solid fa-map-location-dot"></i><span>Sơ đồ học</span>
                </button>

                <div class="va-ds-group-label">LUYỆN TẬP</div>
                <button type="button" class="va-ds-item" data-ds-key="topic" onclick="vaDesktopNav('topic')">
                    <i class="fa-solid fa-layer-group"></i><span>Chủ đề tự do</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="dictionary" onclick="vaDesktopNav('dictionary')">
                    <i class="fa-solid fa-book"></i><span>Từ điển 3K</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="quiz60" onclick="vaDesktopNav('quiz60')">
                    <i class="fa-solid fa-bolt"></i><span>Phản xạ 60s</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="search" onclick="vaDesktopNav('search')">
                    <i class="fa-solid fa-magnifying-glass"></i><span>Tìm bài học</span>
                </button>

                <div class="va-ds-group-label">THƯ VIỆN CÁ NHÂN</div>
                <button type="button" class="va-ds-item" data-ds-key="notebook" onclick="vaDesktopNav('notebook')">
                    <i class="fa-solid fa-bookmark"></i><span>Sổ tay</span>
                    <span id="va-ds-notebook-badge" class="va-ds-badge">0</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="review" onclick="vaDesktopNav('review')">
                    <i class="fa-solid fa-brain"></i><span>Hộp ôn tập</span>
                    <span id="va-ds-review-badge" class="va-ds-badge va-ds-badge-rose" style="display:none;">0</span>
                </button>
                <button type="button" class="va-ds-item" data-ds-key="backup" onclick="vaDesktopNav('backup')">
                    <i class="fa-solid fa-download"></i><span>Sao lưu (.json)</span>
                </button>
            </nav>

            <!-- Chân Sidebar ghim cố định sát đáy -->
            <div class="va-ds-footer">
                <button type="button" class="va-ds-author-btn" onclick="typeof toggleAuthorModal === 'function' && toggleAuthorModal(true)">
                    <span>💌</span><span>Tâm sự tác giả</span>
                </button>
                <div class="va-ds-profile-row">
                    <button type="button" class="va-ds-profile-btn" onclick="vaDesktopNav('profile')" title="Hồ sơ học viên">
                        <span class="va-ds-avatar" id="va-ds-avatar">H</span>
                        <span class="va-ds-username" id="va-ds-username">Học viên ViệtAnh</span>
                    </button>
                    <button type="button" id="va-ds-theme-btn" class="va-ds-icon-btn" onclick="vaToggleDesktopTheme()" title="Đổi giao diện Sáng / Tối">
                        <i class="fa-solid fa-moon"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(sidebar);

        // Nút thu gọn Sidebar
        const collapseBtn = document.getElementById('va-ds-collapse-btn');
        if (localStorage.getItem('va_ds_collapsed') === '1') {
            document.body.classList.add('va-ds-collapsed');
        }
        collapseBtn?.addEventListener('click', () => {
            document.body.classList.toggle('va-ds-collapsed');
            localStorage.setItem('va_ds_collapsed', document.body.classList.contains('va-ds-collapsed') ? '1' : '0');
        });
    }

    // 2. Gắn thanh Tra nhanh từ Anh - Việt (3.293 từ) vào Header Desktop
    function mountDesktopHeaderSearch() {
        const headerInner = document.querySelector('header > div');
        if (!headerInner || document.getElementById('va-desktop-dict-search-wrap')) return;

        const wrap = document.createElement('div');
        wrap.id = 'va-desktop-dict-search-wrap';
        wrap.className = 'va-ds-header-search';
        wrap.innerHTML = `
            <i class="fa-solid fa-magnifying-glass va-ds-search-icon"></i>
            <input id="va-desktop-dict-input" type="search" autocomplete="off" placeholder="Tra nhanh từ Anh – Việt (3.293 từ)..." />
            <div id="va-desktop-dict-dropdown" class="va-ds-dict-dropdown hidden"></div>
        `;

        headerInner.insertBefore(wrap, headerInner.firstChild);

        const input = document.getElementById('va-desktop-dict-input');
        const dropdown = document.getElementById('va-desktop-dict-dropdown');

        function renderQuickDictResults(query) {
            const q = (query || '').trim().toLowerCase();
            if (!q || typeof window.VA_DICTIONARY_CORE !== 'object' || !window.VA_DICTIONARY_CORE) {
                dropdown.classList.add('hidden');
                dropdown.innerHTML = '';
                return;
            }

            const entries = Object.entries(window.VA_DICTIONARY_CORE);
            const matches = [];
            for (let i = 0; i < entries.length; i++) {
                const [word, info] = entries[i];
                const vi = (info.vi || '').toLowerCase();
                if (word.startsWith(q) || word.includes(q) || vi.includes(q)) {
                    matches.push({ word, ...info, exact: word === q ? 2 : (word.startsWith(q) ? 1 : 0) });
                }
            }

            matches.sort((a, b) => b.exact - a.exact || a.word.length - b.word.length);
            const top = matches.slice(0, 8);

            if (top.length === 0) {
                dropdown.innerHTML = `<div class="va-ds-dict-empty">Không tìm thấy từ "<strong>${q}</strong>" trong kho 3.293 từ.</div>`;
                dropdown.classList.remove('hidden');
                return;
            }

            dropdown.innerHTML = top.map(item => {
                const safeWord = item.word.replace(/'/g, "\\'");
                const safeVi = (item.vi || '').replace(/'/g, "\\'");
                return `
                    <div class="va-ds-dict-row">
                        <div class="va-ds-dict-info">
                            <div class="va-ds-dict-top">
                                <span class="va-ds-dict-word">${item.word}</span>
                                <span class="va-ds-dict-ipa">${item.ipa || ''}</span>
                                ${item.level ? `<span class="va-ds-dict-lvl">${item.level}</span>` : ''}
                            </div>
                            <div class="va-ds-dict-vi">${item.vi || ''}</div>
                        </div>
                        <div class="va-ds-dict-actions">
                            <button type="button" onclick="speakText && speakText('${safeWord}', this, 0.9)" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button>
                            <button type="button" onclick="saveWordToVocabBank && saveWordToVocabBank('${safeWord}', '${safeVi}', this)" title="Lưu vào Sổ tay"><i class="fa-solid fa-plus"></i></button>
                            <button type="button" onclick="openWordDetailModal('${encodeURIComponent(item.word)}')" title="Xem chi tiết nhiều nghĩa">
                                <i class="fa-solid fa-circle-info"></i>
                            </button>
                            </div>
                    </div>
                `;
            }).join('');
            dropdown.classList.remove('hidden');
        }

        input.addEventListener('input', (e) => renderQuickDictResults(e.target.value));
        input.addEventListener('focus', (e) => {
            if (e.target.value.trim()) renderQuickDictResults(e.target.value);
        });
        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target)) dropdown.classList.add('hidden');
        });
    }

    // 3. Điều hướng từ Sidebar
    window.vaDesktopNav = function (key) {
        if (key === 'home') {
            typeof switchTab === 'function' && switchTab('home');
        } else if (key === 'roadmap') {
            typeof switchTab === 'function' && switchTab('practice');
            typeof switchPracticeMode === 'function' && switchPracticeMode('structure');
            typeof switchStructureViewMode === 'function' && switchStructureViewMode('roadmap');
        } else if (key === 'topic') {
            typeof switchTab === 'function' && switchTab('practice');
            typeof switchPracticeMode === 'function' && switchPracticeMode('topic');
        } else if (key === 'dictionary') {
            const dictBtn = document.getElementById('nav-dictionary-btn');
            if (dictBtn) dictBtn.click();
            else if (typeof switchTab === 'function') switchTab('dictionary');
        } else if (key === 'quiz60') {
            if (typeof openVocabQuizModal === 'function') openVocabQuizModal();
            else if (typeof startVocabQuiz === 'function') startVocabQuiz();
            else {
                const quizBtn = document.querySelector('[onclick*="Quiz"], [onclick*="quiz"]');
                if (quizBtn) quizBtn.click();
            }
        } else if (key === 'search') {
            typeof openGlobalSearchModal === 'function' && openGlobalSearchModal();
        } else if (key === 'notebook') {
            typeof switchTab === 'function' && switchTab('notebook');
        } else if (key === 'review') {
            typeof switchTab === 'function' && switchTab('review');
        } else if (key === 'backup') {
            const backupBtn = Array.from(document.querySelectorAll('.va-sheet-tile, button'))
                .find(b => (b.textContent || '').includes('Sao lưu'));
            if (backupBtn && backupBtn.dataset.dsKey !== 'backup') backupBtn.click();
            else if (typeof exportBackupData === 'function') exportBackupData();
        } else if (key === 'profile') {
            typeof switchTab === 'function' && switchTab('profile');
        }
        setTimeout(syncDesktopSidebarState, 80);
    };

    // 4. Đổi Sáng / Tối từ chân Sidebar
    window.vaToggleDesktopTheme = function () {
        const isDark = document.documentElement.classList.toggle('va-dark');
        localStorage.setItem('va_theme', isDark ? 'dark' : 'light');
        syncDesktopSidebarState();
    };

    // 5. Đồng bộ trạng thái Active, Badge số & Icon Sáng/Tối
    function syncDesktopSidebarState() {
        const nbSrc = document.getElementById('notebook-badge');
        const nbDst = document.getElementById('va-ds-notebook-badge');
        if (nbSrc && nbDst) nbDst.textContent = nbSrc.textContent || '0';

        const rvSrc = document.getElementById('review-badge-count');
        const rvDst = document.getElementById('va-ds-review-badge');
        if (rvSrc && rvDst) {
            const count = parseInt(rvSrc.textContent || '0', 10) || 0;
            rvDst.textContent = count;
            rvDst.style.display = count > 0 ? 'inline-flex' : 'none';
        }

        const themeBtn = document.getElementById('va-ds-theme-btn');
        if (themeBtn) {
            const isDark = document.documentElement.classList.contains('va-dark');
            themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }

        // Xác định mục đang Active
        let activeKey = 'home';
        const isVisible = (id) => {
            const el = document.getElementById(id);
            return el && !el.classList.contains('hidden');
        };
        if (isVisible('view-notebook')) activeKey = 'notebook';
        else if (isVisible('view-review')) activeKey = 'review';
        else if (isVisible('view-dictionary') || isVisible('view-vocab-library')) activeKey = 'dictionary';
        else if (isVisible('view-practice')) {
            activeKey = isVisible('topic-mode-container') ? 'topic' : 'roadmap';
        }

        document.querySelectorAll('#va-desktop-sidebar .va-ds-item').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.dsKey === activeKey);
        });
    }

    function init() {
        mountDesktopSidebar();
        mountDesktopHeaderSearch();
        syncDesktopSidebarState();

        // Tự đồng bộ lại mỗi khi người dùng bấm chuyển tab hoặc lưu từ
        document.addEventListener('click', () => {
            if (isDesktop()) setTimeout(syncDesktopSidebarState, 100);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
/**
 * MODULE 5 (V3 — DEDICATED PAGE & NEXT.JS READY): TRỢ LÝ GEMINI AI (js/gemini_assistant.js)
 * - Chuyển hoàn toàn từ Modal sang Trang riêng (#view-ai-settings), xóa sạch code Modal cũ.
 * - Có công tắc Quản trị viên (AI_CONFIG) bật/tắt tính năng nhập khóa cá nhân (BYOK).
 * - Có công tắc Bật/Tắt AI cho người dùng (không cần xóa key).
 * - Chuẩn bị sẵn cấu trúc 2 chế độ (BYOK + Pro System Key) để chuyển thẳng sang Next.js.
 */

(function () {
    // ==================== CẤU HÌNH QUẢN TRỊ VIÊN (FEATURE FLAGS) ====================
    // Sau này chuyển sang Next.js chỉ cần đưa khối này vào biến môi trường (.env) hoặc Database
    const AI_CONFIG = {
        ALLOW_PERSONAL_API_KEY: true,   // Đổi thành false nếu muốn tắt chức năng nhập khóa cá nhân trên toàn web
        ALLOW_SYSTEM_PRO_KEY: false,    // Bật true khi lên Next.js và có API khóa hệ thống cho bản trả phí
        SHOW_PRO_PREVIEW_CARD: true     // Hiện thẻ giới thiệu Gói Pro (Sắp ra mắt) bên dưới thẻ BYOK
    };

    const STORAGE_KEY_API = 'va_gemini_api_key';
    const STORAGE_KEY_MODEL = 'va_gemini_model';
    const STORAGE_KEY_ENABLED = 'va_gemini_user_enabled';
    const STORAGE_KEY_CUSTOM_MODELS = 'va_gemini_discovered_models';
    const DEFAULT_MODEL = 'gemini-flash-lite-latest';

    const DEPRECATED_MODELS = new Set([
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ]);

    const BASE_MODEL_OPTIONS = [
        { id: 'gemini-flash-lite-latest', label: 'Gemini Flash-Lite Latest (Khuyên dùng • Tự động dùng bản mới nhất)' },
        { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (Nhanh • Tiết kiệm & Free Tier)' },
        { id: 'gemini-flash-latest', label: 'Gemini Flash Latest (Giải thích ngữ pháp sâu hơn)' },
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Dự phòng)' }
    ];

    const reevalCache = {};
    let explanationOpenMap = {};
    let previousTabBeforeAI = 'home';

    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getStoredKey() {
        try {
            return (localStorage.getItem(STORAGE_KEY_API) || '').trim();
        } catch (e) {
            return '';
        }
    }

    function isUserAIEnabled() {
        try {
            const val = localStorage.getItem(STORAGE_KEY_ENABLED);
            return val === null ? true : val === 'true';
        } catch (e) {
            return true;
        }
    }

    function setUserAIEnabled(flag) {
        try {
            localStorage.setItem(STORAGE_KEY_ENABLED, flag ? 'true' : 'false');
        } catch (e) {}
        updateHeaderGeminiButtonState();
    }

    // Kiểm tra tổng thể xem AI có đang sẵn sàng hoạt động không
    function isGeminiReady() {
        if (!isUserAIEnabled()) return false;
        if (AI_CONFIG.ALLOW_SYSTEM_PRO_KEY) return true;
        if (AI_CONFIG.ALLOW_PERSONAL_API_KEY && Boolean(getStoredKey())) return true;
        return false;
    }

    function getStoredModel() {
        try {
            const m = (localStorage.getItem(STORAGE_KEY_MODEL) || '').trim();
            if (!m || DEPRECATED_MODELS.has(m)) {
                localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
                return DEFAULT_MODEL;
            }
            return m;
        } catch (e) {
            return DEFAULT_MODEL;
        }
    }

    function getModelOptionsList() {
        const merged = [...BASE_MODEL_OPTIONS];
        try {
            const discovered = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_MODELS)) || [];
            discovered.forEach(item => {
                if (item && item.id && !merged.some(m => m.id === item.id)) {
                    merged.push(item);
                }
            });
        } catch (e) {}
        const current = getStoredModel();
        if (current && !merged.some(m => m.id === current)) {
            merged.unshift({ id: current, label: `${current} (Đang chọn)` });
        }
        return merged;
    }

    function saveGeminiConfig(key, model) {
        try {
            const cleanKey = (key || '').trim();
            if (cleanKey) {
                localStorage.setItem(STORAGE_KEY_API, cleanKey);
            } else {
                localStorage.removeItem(STORAGE_KEY_API);
            }
            if (model) {
                localStorage.setItem(STORAGE_KEY_MODEL, model.trim());
            }
        } catch (e) {}
        updateHeaderGeminiButtonState();
    }

    // Tự động lấy danh sách các model Gemini khả dụng cho đúng API Key hiện tại
    async function fetchAvailableModelsForKey(apiKey) {
        const key = (apiKey || getStoredKey()).trim();
        if (!key) throw new Error('NO_KEY');

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
        const res = await fetch(url);
        if (!res.ok) {
            let errMsg = `HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson?.error?.message) errMsg = errJson.error.message;
            } catch (e) {}
            throw new Error(errMsg);
        }

        const data = await res.json();
        const rawModels = Array.isArray(data.models) ? data.models : [];

        const validModels = rawModels
            .filter(m => {
                const name = (m.name || '').replace(/^models\//, '');
                const methods = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
                return methods.includes('generateContent')
                    && /^gemini-/i.test(name)
                    && !/(embedding|imagen|veo|tts|audio|robotics|computer-use|deep-research)/i.test(name)
                    && !DEPRECATED_MODELS.has(name);
            })
            .map(m => {
                const id = (m.name || '').replace(/^models\//, '');
                const display = m.displayName ? `${m.displayName} (${id})` : id;
                return { id, label: display };
            });

        validModels.sort((a, b) => {
            const score = (id) => {
                let s = 0;
                if (/flash-lite-latest/i.test(id)) s += 100;
                else if (/flash-lite/i.test(id)) s += 80;
                else if (/flash-latest/i.test(id)) s += 70;
                else if (/flash/i.test(id)) s += 50;
                if (/3\.\d/i.test(id)) s += 20;
                if (/preview|exp/i.test(id)) s -= 5;
                return s;
            };
            return score(b.id) - score(a.id);
        });

        if (validModels.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY_CUSTOM_MODELS, JSON.stringify(validModels.slice(0, 12)));
            } catch (e) {}
        }

        return validModels;
    }

    async function executeGenerateContentOnce(key, model, promptText, responseSchema) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
        const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
                temperature: 0.25,
                responseMimeType: 'application/json'
            }
        };
        if (responseSchema) {
            payload.generationConfig.responseSchema = responseSchema;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            let errMsg = `HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson?.error?.message) errMsg = errJson.error.message;
            } catch (e) {}
            const err = new Error(errMsg);
            err.status = res.status;
            throw err;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Gemini không trả về nội dung.');

        const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        return { parsed: JSON.parse(cleaned), model };
    }

    function isModelUnavailableError(err) {
        const msg = (err?.message || '').toLowerCase();
        return err?.status === 404
            || msg.includes('no longer available')
            || msg.includes('not found')
            || msg.includes('is not supported')
            || msg.includes('deprecated');
    }

    function isRetryableOverloadError(err) {
        const msg = (err?.message || '').toLowerCase();
        return err?.status === 429
            || err?.status === 500
            || err?.status === 502
            || err?.status === 503
            || err?.status === 504
            || msg.includes('high demand')
            || msg.includes('overloaded')
            || msg.includes('temporarily unavailable')
            || msg.includes('rate limit')
            || msg.includes('resource_exhausted')
            || msg.includes('try again later');
    }

    function delayMs(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function callGeminiJSON(promptText, responseSchema, overrideKey = null, overrideModel = null) {
        const key = (overrideKey !== null ? overrideKey : getStoredKey()).trim();
        const primaryModel = (overrideModel || getStoredModel()).trim();
        if (!key) {
            throw new Error('NO_KEY');
        }

        let lastErr = null;
        let primaryPermanentlyUnavailable = false;

        try {
            return await executeGenerateContentOnce(key, primaryModel, promptText, responseSchema);
        } catch (err) {
            lastErr = err;
            primaryPermanentlyUnavailable = isModelUnavailableError(err);
            const isOverload = isRetryableOverloadError(err);

            if (!primaryPermanentlyUnavailable && !isOverload) {
                throw err;
            }

            if (isOverload && !primaryPermanentlyUnavailable) {
                await delayMs(1500);
                try {
                    return await executeGenerateContentOnce(key, primaryModel, promptText, responseSchema);
                } catch (retryPrimaryErr) {
                    lastErr = retryPrimaryErr;
                    if (!isRetryableOverloadError(retryPrimaryErr) && !isModelUnavailableError(retryPrimaryErr)) {
                        throw retryPrimaryErr;
                    }
                }
            }

            const fallbackCandidates = [];
            const suggestedMatch = (lastErr?.message || '').match(/models\/(gemini-[a-z0-9.\-]+)/ig);
            if (suggestedMatch) {
                suggestedMatch.forEach(m => {
                    const cleanId = m.replace(/^models\//i, '');
                    if (cleanId !== primaryModel && !fallbackCandidates.includes(cleanId)) {
                        fallbackCandidates.push(cleanId);
                    }
                });
            }

            ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash'].forEach(id => {
                if (id !== primaryModel && !fallbackCandidates.includes(id)) {
                    fallbackCandidates.push(id);
                }
            });

            try {
                const liveModels = await fetchAvailableModelsForKey(key);
                liveModels.slice(0, 4).forEach(m => {
                    if (m.id !== primaryModel && !fallbackCandidates.includes(m.id)) {
                        fallbackCandidates.push(m.id);
                    }
                });
            } catch (e) {}

            for (const candModel of fallbackCandidates) {
                try {
                    const result = await executeGenerateContentOnce(key, candModel, promptText, responseSchema);
                    if (overrideKey === null && primaryPermanentlyUnavailable) {
                        saveGeminiConfig(key, candModel);
                    }
                    return result;
                } catch (retryErr) {
                    lastErr = retryErr;
                    if (!isModelUnavailableError(retryErr) && !isRetryableOverloadError(retryErr)) {
                        throw retryErr;
                    }
                }
            }

            throw lastErr;
        }
    }

    // ==================== 1. NÚT CÀI ĐẶT GEMINI AI TRÊN HEADER ====================
    function injectHeaderGeminiButton() {
        getStoredModel();

        // Tự động ẩn trang Cài đặt AI mỗi khi người dùng chuyển sang tab khác
        if (typeof window.switchTab === 'function' && !window.__vaAiWrappedSwitchTab) {
            const origSwitchTab = window.switchTab;
            window.switchTab = function (tabName) {
                const aiView = document.getElementById('view-ai-settings');
                if (aiView) aiView.classList.add('hidden');
                if (tabName && tabName !== 'ai-settings') {
                    previousTabBeforeAI = tabName;
                }
                return origSwitchTab.apply(this, arguments);
            };
            window.__vaAiWrappedSwitchTab = true;
        }

        if (document.getElementById('nav-gemini-key-btn')) return;
        const authArea = document.getElementById('user-auth-area');
        if (!authArea || !authArea.parentElement) return;

        const btn = document.createElement('button');
        btn.id = 'nav-gemini-key-btn';
        btn.type = 'button';
        btn.onclick = () => window.openGeminiSettingsPage();
        btn.className = 'relative w-9 h-9 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-all';
        btn.title = 'Cài đặt trợ lý Gemini AI';
        btn.innerHTML = `
            <i class="fa-solid fa-wand-magic-sparkles text-purple-600 text-sm"></i>
            <span class="hidden lg:inline">Gemini AI</span>
            <span id="gemini-key-status-dot" class="hidden absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        `;

        authArea.parentElement.insertBefore(btn, authArea);
        updateHeaderGeminiButtonState();
    }

    function updateHeaderGeminiButtonState() {
        const dot = document.getElementById('gemini-key-status-dot');
        const btn = document.getElementById('nav-gemini-key-btn');
        const ready = isGeminiReady();

        if (dot) {
            if (ready) dot.classList.remove('hidden');
            else dot.classList.add('hidden');
        }
        if (btn) {
            if (!AI_CONFIG.ALLOW_PERSONAL_API_KEY && !AI_CONFIG.ALLOW_SYSTEM_PRO_KEY) {
                btn.title = 'Tính năng Gemini AI đang tạm đóng';
            } else if (ready) {
                btn.title = `Gemini AI đang bật (${getStoredModel()}) • Bấm để cài đặt`;
            } else if (getStoredKey() && !isUserAIEnabled()) {
                btn.title = 'Gemini AI đang tạm tắt • Bấm để bật lại';
            } else {
                btn.title = 'Chưa gắn khóa Gemini AI • Bấm để cài đặt';
            }
        }
    }

    function populateModelSelectElement(selectEl, selectedId) {
        if (!selectEl) return;
        const opts = getModelOptionsList();
        selectEl.innerHTML = opts.map(m =>
            `<option value="${esc(m.id)}" ${selectedId === m.id ? 'selected' : ''}>${esc(m.label)}</option>`
        ).join('');
    }

    // ==================== 2. TRANG CÀI ĐẶT GEMINI AI RIÊNG BIỆT (#view-ai-settings) ====================
    window.openGeminiSettingsPage = function () {
        let view = document.getElementById('view-ai-settings');
        const mainEl = document.querySelector('main');
        if (!view && mainEl) {
            view = document.createElement('div');
            view.id = 'view-ai-settings';
            view.className = 'hidden space-y-5';
            mainEl.appendChild(view);
        }
        if (!view) return;

        // Ẩn toàn bộ các trang/tab khác trong <main>
        if (mainEl) {
            Array.from(mainEl.children).forEach(child => {
                if (child.id && child.id !== 'view-ai-settings') {
                    child.classList.add('hidden');
                }
            });
        }

        // Gỡ class workspace mobile nếu đang ở trong phòng luyện tập
        document.body.classList.remove('va-in-workspace', 'va-in-topic-practice');

        view.classList.remove('hidden');
        renderGeminiSettingsPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Giữ tên hàm cũ làm bí danh để tương thích ngược tuyệt đối nếu nơi khác có gọi
    window.openGeminiSettingsModal = window.openGeminiSettingsPage;

    window.closeGeminiSettingsPage = function () {
        const view = document.getElementById('view-ai-settings');
        if (view) view.classList.add('hidden');
        if (typeof window.switchTab === 'function') {
            window.switchTab(previousTabBeforeAI || 'home');
        }
    };

    function renderGeminiSettingsPage() {
        const view = document.getElementById('view-ai-settings');
        if (!view) return;

        const currentKey = getStoredKey();
        const currentModel = getStoredModel();
        const userEnabled = isUserAIEnabled();
        const ready = isGeminiReady();

        const statusBadge = ready
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>Đang hoạt động</span>`
            : (!userEnabled && currentKey)
                ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Đang tạm tắt</span>`
                : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200"><span class="w-2 h-2 rounded-full bg-slate-400"></span>Chưa kết nối</span>`;

        const byokSectionHTML = AI_CONFIG.ALLOW_PERSONAL_API_KEY ? `
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div class="px-5 sm:px-6 py-4 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                        <span class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0">
                            <i class="fa-solid fa-key"></i>
                        </span>
                        <div>
                            <h3 class="font-extrabold text-sm sm:text-base text-slate-900">Chế độ 1: Khóa API cá nhân (Miễn phí • BYOK)</h3>
                            <p class="text-xs text-slate-500">Tự dùng khóa miễn phí từ tài khoản Google của bạn</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang mở</span>
                </div>

                <div class="p-5 sm:p-6 space-y-5">
                    <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed space-y-1">
                        <p class="font-extrabold flex items-center gap-1.5">
                            <i class="fa-solid fa-shield-halved text-emerald-600"></i>
                            An toàn & Riêng tư tuyệt đối
                        </p>
                        <p>Khóa API chỉ lưu cục bộ ngay trong trình duyệt của bạn (<code>localStorage</code>) và gọi thẳng tới máy chủ Google, không gửi qua bất kỳ máy chủ trung gian nào.</p>
                    </div>

                    <div class="space-y-1.5">
                        <label for="gemini-key-input" class="block text-xs sm:text-sm font-bold text-slate-700">Gemini API Key của bạn</label>
                        <div class="relative">
                            <input id="gemini-key-input" type="password" value="${esc(currentKey)}" placeholder="AIzaSy..." autocomplete="off" class="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <button type="button" onclick="toggleGeminiKeyVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 px-1.5 py-1" title="Hiện / Ẩn khóa">
                                <i id="gemini-key-eye" class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                            <label for="gemini-model-select" class="block text-xs sm:text-sm font-bold text-slate-700">Chọn mô hình (Model)</label>
                            <button type="button" id="gemini-scan-models-btn" onclick="scanLiveModelsFromKey()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                <i class="fa-solid fa-arrows-rotate mr-1"></i>Quét model hỗ trợ
                            </button>
                        </div>
                        <select id="gemini-model-select" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"></select>
                    </div>

                    <div id="gemini-test-status" class="hidden p-3.5 rounded-xl text-xs sm:text-sm font-semibold"></div>

                    <div class="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                        <div class="flex flex-wrap items-center gap-2">
                            <button type="button" id="gemini-test-btn" onclick="testGeminiApiKeyConnection()" class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all">
                                <i class="fa-solid fa-plug-circle-check mr-1.5"></i>Kiểm tra kết nối
                            </button>
                            ${currentKey ? `
                                <button type="button" onclick="clearUserGeminiApiKey()" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all">
                                    Xóa khóa
                                </button>
                            ` : ''}
                        </div>
                        <button type="button" onclick="saveUserGeminiSettings()" class="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all">
                            <i class="fa-solid fa-floppy-disk mr-1.5"></i>Lưu cài đặt
                        </button>
                    </div>
                </div>
            </div>

            <!-- Khối hướng dẫn 3 bước luôn hiển thị rõ ràng, không bị cắt màn hình -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
                <h3 class="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <i class="fa-solid fa-circle-question text-indigo-600"></i>
                    Cách lấy Gemini API Key miễn phí trong 30 giây
                </h3>
                <ol class="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <li>Mở <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="font-bold text-indigo-600 underline">aistudio.google.com/apikey</a> và đăng nhập bằng Gmail cá nhân.</li>
                    <li>Bấm nút <strong class="text-slate-800">Create API key</strong> (hoàn toàn miễn phí, không cần thẻ tín dụng).</li>
                    <li>Sao chép chuỗi bắt đầu bằng <code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">AIza...</code>, quay lại đây dán vào ô phía trên rồi bấm <strong class="text-slate-800">Lưu cài đặt</strong>.</li>
                </ol>
            </div>
        ` : `
            <div class="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 text-sm text-amber-900 space-y-1.5">
                <p class="font-extrabold flex items-center gap-2">
                    <i class="fa-solid fa-lock text-amber-600"></i>
                    Chức năng nhập khóa API cá nhân đang tạm đóng
                </p>
                <p class="text-xs sm:text-sm text-amber-800">Quản trị viên hiện đang tạm tắt chế độ tự nhập khóa API. Bạn vẫn có thể luyện dịch và chấm điểm ngoại tuyến (offline) bình thường.</p>
            </div>
        `;

        const proPreviewHTML = AI_CONFIG.SHOW_PRO_PREVIEW_CARD ? `
            <div class="bg-slate-50/90 rounded-3xl border border-dashed border-slate-300 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg shrink-0">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div>
                        <div class="flex flex-wrap items-center gap-2">
                            <h3 class="font-extrabold text-sm sm:text-base text-slate-800">Chế độ 2: Khóa hệ thống (Gói Pro)</h3>
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-200 text-slate-600">Sắp ra mắt</span>
                        </div>
                        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Dùng ngay trợ lý AI chấm điểm chuyên sâu & giải thích ngữ pháp mà không cần tự tạo khóa API.</p>
                    </div>
                </div>
            </div>
        ` : '';

        view.innerHTML = `
            <!-- Header trang Cài đặt AI -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div class="flex items-start gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="text-xl font-extrabold text-slate-900">Cài đặt Gemini AI</h2>
                            ${statusBadge}
                        </div>
                        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Quản lý trợ lý chấm điểm chuyên sâu và giải thích ngữ pháp tự động.</p>
                    </div>
                </div>
                <button type="button" onclick="closeGeminiSettingsPage()" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm shrink-0">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Quay lại</span>
                </button>
            </div>

            <!-- Công tắc Bật / Tắt nhanh cho người dùng -->
            <div class="bg-white px-5 sm:px-6 py-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-extrabold text-slate-900">Kích hoạt trợ lý Gemini AI</p>
                    <p class="text-xs text-slate-500">Bạn có thể tạm tắt AI bất cứ lúc nào để luyện dịch nhanh mà không cần xóa khóa.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" id="gemini-user-toggle" class="sr-only peer" ${userEnabled ? 'checked' : ''} onchange="toggleUserGeminiEnabled(this.checked)">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            ${byokSectionHTML}
            ${proPreviewHTML}
        `;

        populateModelSelectElement(document.getElementById('gemini-model-select'), currentModel);
    }

    window.toggleUserGeminiEnabled = function (checked) {
        setUserAIEnabled(Boolean(checked));
        renderGeminiSettingsPage();
        if (typeof showToast === 'function') {
            showToast(checked ? '✅ Đã bật trợ lý Gemini AI.' : '⏸️ Đã tạm tắt trợ lý Gemini AI.', 'info');
        }
    };

    window.scanLiveModelsFromKey = async function () {
        const key = (document.getElementById('gemini-key-input')?.value || '').trim();
        const selectEl = document.getElementById('gemini-model-select');
        const statusEl = document.getElementById('gemini-test-status');
        const btn = document.getElementById('gemini-scan-models-btn');

        if (!key) {
            if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200';
                statusEl.innerText = '⚠️ Hãy dán Gemini API Key trước rồi bấm Quét model hỗ trợ.';
            }
            return;
        }

        if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>Đang quét...`;
        try {
            const liveModels = await fetchAvailableModelsForKey(key);
            if (liveModels.length > 0 && selectEl) {
                populateModelSelectElement(selectEl, liveModels[0].id);
                if (statusEl) {
                    statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200';
                    statusEl.innerText = `✅ Tìm thấy ${liveModels.length} model khả dụng cho khóa của bạn! Đã tự chọn: ${liveModels[0].id}.`;
                }
            } else if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200';
                statusEl.innerText = '⚠️ Không tìm thấy thêm model nào ngoài danh sách mặc định.';
            }
        } catch (err) {
            if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200';
                statusEl.innerText = `❌ Không quét được model: ${err.message}`;
            }
        } finally {
            if (btn) btn.innerHTML = `<i class="fa-solid fa-arrows-rotate mr-1"></i>Quét model hỗ trợ`;
        }
    };

    window.toggleGeminiKeyVisibility = function () {
        const inp = document.getElementById('gemini-key-input');
        const eye = document.getElementById('gemini-key-eye');
        if (!inp || !eye) return;
        if (inp.type === 'password') {
            inp.type = 'text';
            eye.className = 'fa-regular fa-eye-slash';
        } else {
            inp.type = 'password';
            eye.className = 'fa-regular fa-eye';
        }
    };

    window.saveUserGeminiSettings = function () {
        const key = (document.getElementById('gemini-key-input')?.value || '').trim();
        const model = document.getElementById('gemini-model-select')?.value || DEFAULT_MODEL;
        saveGeminiConfig(key, model);
        renderGeminiSettingsPage();
        if (typeof showToast === 'function') {
            showToast(
                key ? `✅ Đã lưu khóa Gemini AI (${model}) vào trình duyệt của bạn!` : 'Đã xóa khóa Gemini AI. Ứng dụng vẫn chấm offline bình thường.',
                key ? 'success' : 'info'
            );
        }
    };

    window.clearUserGeminiApiKey = function () {
        saveGeminiConfig('', DEFAULT_MODEL);
        renderGeminiSettingsPage();
        if (typeof showToast === 'function') {
            showToast('Đã xóa khóa Gemini API khỏi trình duyệt.', 'info');
        }
    };

    window.testGeminiApiKeyConnection = async function () {
        const key = (document.getElementById('gemini-key-input')?.value || '').trim();
        const selectEl = document.getElementById('gemini-model-select');
        const model = selectEl?.value || DEFAULT_MODEL;
        const statusEl = document.getElementById('gemini-test-status');
        const btn = document.getElementById('gemini-test-btn');
        if (!key) {
            if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200';
                statusEl.innerText = '⚠️ Bạn hãy dán Gemini API Key vào ô trước khi kiểm tra nhé.';
            }
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Đang kiểm tra...`;
        }
        if (statusEl) {
            statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 text-slate-600 border border-slate-200';
            statusEl.innerText = `Đang kết nối thử tới ${model}...`;
        }

        try {
            const { model: workingModel } = await callGeminiJSON(
                'Trả về JSON ngắn {"ok": true, "msg": "ready"}',
                {
                    type: 'OBJECT',
                    properties: { ok: { type: 'BOOLEAN' }, msg: { type: 'STRING' } },
                    required: ['ok', 'msg']
                },
                key,
                model
            );

            if (selectEl && workingModel) {
                populateModelSelectElement(selectEl, workingModel);
                if (selectEl.value !== workingModel) {
                    const opt = document.createElement('option');
                    opt.value = workingModel;
                    opt.textContent = `${workingModel} (Tự động chọn • Hoạt động tốt)`;
                    selectEl.insertBefore(opt, selectEl.firstChild);
                    selectEl.value = workingModel;
                }
            }

            if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200';
                statusEl.innerText = `✅ Kết nối thành công với ${workingModel}! Bấm "Lưu cài đặt" để bắt đầu dùng.`;
            }
        } catch (err) {
            if (statusEl) {
                statusEl.className = 'p-3.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200';
                statusEl.innerText = `❌ Kết nối thất bại: ${err.message || 'Khóa API không hợp lệ hoặc bị giới hạn mạng.'}`;
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-plug-circle-check mr-1.5"></i>Kiểm tra kết nối`;
            }
        }
    };

    // ==================== 3. THANH NÚT PHÚC KHẢO & GIẢI THÍCH AI ====================
    function getReevalCacheKey(question, userText) {
        return `${question?.id || 'q'}::${(userText || '').trim().toLowerCase()}`;
    }

    function getExplainCacheKey(question) {
        return `va_ai_explain_${question?.id || 'q'}`;
    }

    function getVerdictBadgeHTML(verdict, xpAdded = 0, downgraded = false) {
        if (verdict === 'excellent') {
            return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Chuẩn xác${xpAdded > 0 ? ` (+${xpAdded} XP)` : ''}</span>`;
        }
        if (verdict === 'passed') {
            return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">🟡 Đạt — Góp ý nhỏ${xpAdded > 0 ? ` (+${xpAdded} XP)` : ''}</span>`;
        }
        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">🔴 Chưa đạt${downgraded ? ' • Đã cập nhật trạng thái' : ''}</span>`;
    }

    function renderReevalResultHTML(cached) {
        if (!cached) return '';
        const statusPill = getVerdictBadgeHTML(cached.finalVerdict || cached.verdict || 'retry', cached.xpAdded || 0, Boolean(cached.downgraded));

        const fixLine = cached.suggestedFix
            ? `<p class="mt-2 pt-2 border-t border-purple-200/60 text-xs text-slate-700"><strong class="text-indigo-700">Gợi ý sửa sát câu bạn viết:</strong> <span class="font-semibold text-slate-900">${esc(cached.suggestedFix)}</span></p>`
            : '';

        return `
            <div class="mt-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1.5 text-xs sm:text-sm">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex flex-wrap items-center gap-2 font-extrabold text-purple-900 text-xs">
                        <i class="fa-solid fa-robot text-purple-600"></i>
                        <span>Nhận xét từ Gemini AI (${esc(cached.model)}):</span>
                        ${statusPill}
                    </div>
                    <button type="button" onclick="dismissGeminiReevalBox()" class="text-slate-400 hover:text-slate-700 text-xs px-1" title="Đóng nhận xét AI">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <p class="text-slate-700 leading-relaxed">${esc(cached.feedback)}</p>
                ${fixLine}
            </div>
        `;
    }

    function renderExplanationCardHTML(question, data) {
        if (!data) return '';
        const pointsHtml = (data.grammar_points || []).map(p =>
            `<li class="flex items-start gap-2"><span class="text-indigo-500 mt-0.5">•</span><span>${esc(p)}</span></li>`
        ).join('');

        const altsHtml = (data.native_alternatives || []).map(a =>
            `<li class="flex items-start gap-2"><i class="fa-solid fa-check text-emerald-500 mt-1 text-[10px]"></i><span><strong class="text-slate-900">${esc(a.en)}</strong> — <span class="text-slate-600">${esc(a.note_vi)}</span></span></li>`
        ).join('');

        return `
            <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/50 border border-indigo-200/90 shadow-2xs space-y-3.5 text-xs sm:text-sm">
                <div class="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                    <span class="font-extrabold text-indigo-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-sparkles text-amber-500"></i>
                        Giải thích chi tiết từ Gemini AI
                    </span>
                    <button type="button" onclick="toggleGeminiGrammarExplanation(true)" class="text-xs font-bold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1">
                        <i class="fa-solid fa-xmark"></i> Đóng
                    </button>
                </div>

                <p class="font-semibold text-slate-800 leading-relaxed">${esc(data.context_summary)}</p>

                ${pointsHtml ? `
                    <div class="space-y-1.5">
                        <p class="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                            <i class="fa-solid fa-thumbtack"></i> Cấu trúc ngữ pháp trọng tâm:
                        </p>
                        <ul class="space-y-1 text-slate-700 leading-relaxed">${pointsHtml}</ul>
                    </div>
                ` : ''}

                ${altsHtml ? `
                    <div class="space-y-1.5">
                        <p class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                            <i class="fa-solid fa-comments"></i> Cách nói khác của người bản xứ:
                        </p>
                        <ul class="space-y-1.5 text-slate-700 leading-relaxed">${altsHtml}</ul>
                    </div>
                ` : ''}

                ${data.pro_tip ? `
                    <div class="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                        <i class="fa-solid fa-lightbulb text-amber-500 mt-0.5 shrink-0"></i>
                        <span>${esc(data.pro_tip)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderExplanationOutputArea(question, isOpen, cachedExplain, customHtml = null) {
        const externalSlot = document.getElementById('gemini-explain-slot');
        const fallbackSlot = document.getElementById('gemini-explain-output');
        const target = externalSlot || fallbackSlot;
        if (!target) return;

        if (customHtml !== null) {
            target.innerHTML = customHtml;
            return;
        }
        target.innerHTML = (isOpen && cachedExplain) ? renderExplanationCardHTML(question, cachedExplain) : '';
    }

    window.renderGeminiActionSlot = function (question, userText, result) {
        const slot = document.getElementById('gemini-reeval-slot');
        if (!slot || !question) return;

        const isAnswerView = Boolean(result && result.isDirectAnswerView);
        const reevalKey = getReevalCacheKey(question, userText);
        const cachedReeval = reevalCache[reevalKey] || null;

        let cachedExplain = null;
        try {
            const rawExp = sessionStorage.getItem(getExplainCacheKey(question));
            if (rawExp) cachedExplain = JSON.parse(rawExp);
        } catch (e) {}
        const isExplainOpen = Boolean(explanationOpenMap[question.id] && cachedExplain);

        const currentVerdict = result?.verdict || ((result?.score >= 7 && result?.used_target_structure !== false) ? 'passed' : 'retry');
        const isAlreadyPassed = currentVerdict === 'passed' || currentVerdict === 'excellent';
        const leadText = isAlreadyPassed
            ? 'Muốn AI kiểm tra sâu ngữ nghĩa & độ tự nhiên?'
            : 'Cách viết của bạn cũng đúng?';
        const btnLabel = isAlreadyPassed
            ? 'Chấm chuyên sâu AI'
            : 'Phúc khảo bằng Gemini AI';

        const reevalBtnHtml = !isAnswerView ? `
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold text-slate-500">${leadText}</span>
                <button type="button" id="btn-gemini-reeval" onclick="runGeminiReEvaluation()" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xs transition-all">
                    <i class="fa-solid fa-sparkles text-amber-200"></i>
                    <span>${btnLabel}</span>
                </button>
            </div>
        ` : '';

        const explainBtnHtml = `
            <button type="button" id="btn-gemini-explain" onclick="toggleGeminiGrammarExplanation(false)" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold ${isExplainOpen ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'} transition-all">
                <i class="fa-solid fa-wand-magic-sparkles text-purple-500"></i>
                <span>${isExplainOpen ? 'Đóng giải thích AI' : 'Giải thích AI'}</span>
            </button>
        `;

        const hasExternalExplainSlot = Boolean(document.getElementById('gemini-explain-slot'));

        slot.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                ${reevalBtnHtml}
                <div class="flex items-center gap-2 ml-auto">
                    ${explainBtnHtml}
                </div>
            </div>
            <div id="gemini-reeval-output">${cachedReeval ? renderReevalResultHTML(cachedReeval) : ''}</div>
            ${hasExternalExplainSlot ? '' : '<div id="gemini-explain-output"></div>'}
        `;

        renderExplanationOutputArea(question, isExplainOpen, cachedExplain);
    };

    window.dismissGeminiReevalBox = function () {
        const ctx = (typeof state !== 'undefined') ? state.lastEvaluationContext : null;
        if (ctx) {
            delete reevalCache[getReevalCacheKey(ctx.question, ctx.userText)];
        }
        const out = document.getElementById('gemini-reeval-output');
        if (out) out.innerHTML = '';
        const localBox = document.getElementById('local-feedback-box');
        if (localBox) localBox.classList.remove('hidden');
    };

    // ==================== 4. HÀM GỌI GEMINI CHẤM CHUYÊN SÂU ====================
    window.runGeminiReEvaluation = async function () {
        if (!isGeminiReady()) {
            if (typeof showToast === 'function') {
                const msg = !isUserAIEnabled()
                    ? 'Trợ lý Gemini AI đang tạm tắt. Hãy bật lại trong trang Cài đặt AI nhé!'
                    : 'Hãy nhập Gemini API Key miễn phí của bạn để dùng tính năng Chấm bằng Gemini AI nhé!';
                showToast(msg, 'info');
            }
            window.openGeminiSettingsPage();
            return;
        }

        const ctx = (typeof state !== 'undefined') ? state.lastEvaluationContext : null;
        if (!ctx || !ctx.question || !ctx.userText) return;

        const { question, userText } = ctx;
        const btn = document.getElementById('btn-gemini-reeval');
        const out = document.getElementById('gemini-reeval-output');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Gemini đang chấm...</span>`;
        }

        const structReq = question.isStructureMode && question.structureInfo
            ? `Cấu trúc mục tiêu bắt buộc áp dụng: "${question.structureInfo.title}" (Công thức: ${question.structureInfo.formula}).`
            : 'Chế độ giao tiếp tự do (không ép buộc 1 cấu trúc cố định).';

        const prompt = `Bạn là giáo viên tiếng Anh bản xứ chấm bài dịch Việt - Anh cho học viên Việt Nam theo hệ thống 3 trạng thái: "excellent" (Chuẩn xác), "passed" (Đạt - Góp ý nhẹ), "retry" (Chưa đạt).
Hãy chấm công tâm theo NGỮ NGHĨA thực tế (chấp nhận các cách diễn đạt tự nhiên đồng nghĩa ngoài đáp án mẫu, NHƯNG phải bắt chặt lỗi dịch sai nghĩa, sai từ vựng như representation vs presentation, thiếu trợ động từ câu hỏi, sai thì nặng hoặc thiếu cấu trúc mục tiêu).

- Câu gốc Tiếng Việt: "${question.vi}"
- Đáp án tham khảo 1 (Casual): "${question.sampleCasual}"
- Đáp án tham khảo 2 (Formal): "${question.sampleFormal || question.sampleCasual}"
- ${structReq}
- Câu học viên viết: "${userText}"

Trả về JSON gồm:
- verdict: "excellent" | "passed" | "retry"
- score: điểm quy đổi tương ứng (excellent: 9.0-10.0, passed: 7.0-8.5, retry: 1.0-6.0).
- structure_ok: boolean
- meaning_ok: boolean
- feedback_vi: nhận xét ngắn gọn 2-4 câu bằng tiếng Việt, chỉ rõ điểm đúng và lỗi sai cụ thể (nếu có).
- suggested_fix: 1 câu tiếng Anh tự nhiên sửa sát nhất với câu học viên viết (để chuỗi rỗng "" nếu câu học viên đã hoàn hảo).`;

        const schema = {
            type: 'OBJECT',
            properties: {
                verdict: { type: 'STRING', enum: ['excellent', 'passed', 'retry'] },
                score: { type: 'NUMBER' },
                structure_ok: { type: 'BOOLEAN' },
                meaning_ok: { type: 'BOOLEAN' },
                feedback_vi: { type: 'STRING' },
                suggested_fix: { type: 'STRING' }
            },
            required: ['verdict', 'score', 'structure_ok', 'meaning_ok', 'feedback_vi', 'suggested_fix']
        };

        try {
            const { parsed, model } = await callGeminiJSON(prompt, schema);
            const reevalKey = getReevalCacheKey(question, userText);

            const record = {
                model,
                verdict: parsed.verdict || 'retry',
                finalVerdict: parsed.verdict || 'retry',
                feedback: parsed.feedback_vi || '',
                suggestedFix: (parsed.suggested_fix || '').trim(),
                upgraded: false,
                downgraded: false,
                xpAdded: 0
            };

            reevalCache[reevalKey] = record;

            if (typeof window.applyReEvaluationResult === 'function') {
                const applyRes = window.applyReEvaluationResult({
                    verdict: parsed.verdict,
                    score: parsed.score,
                    used_target_structure: parsed.structure_ok,
                    meaning_ok: parsed.meaning_ok,
                    feedback: parsed.feedback_vi
                });
                if (applyRes && applyRes.synced) {
                    record.finalVerdict = applyRes.verdict;
                    record.upgraded = Boolean(applyRes.upgraded);
                    record.downgraded = Boolean(applyRes.downgraded);
                    record.xpAdded = applyRes.xpAdded || 0;
                    reevalCache[reevalKey] = record;
                    window.renderGeminiActionSlot(question, userText, state.lastEvaluationContext.result);

                    if (typeof showToast === 'function') {
                        if (applyRes.verdict === 'excellent') {
                            showToast(`🟢 Gemini AI xác nhận: Chuẩn xác!${applyRes.xpAdded > 0 ? ` (+${applyRes.xpAdded} XP)` : ''}`, 'success');
                        } else if (applyRes.verdict === 'passed') {
                            showToast(`🟡 Gemini AI xác nhận: Đạt chuẩn (có góp ý nhỏ)!${applyRes.xpAdded > 0 ? ` (+${applyRes.xpAdded} XP)` : ''}`, 'success');
                        } else if (applyRes.downgraded) {
                            showToast('🔴 Gemini AI phát hiện lỗi ngữ pháp/nghĩa nên đã cập nhật về trạng thái Chưa đạt để bạn sửa lại!', 'warning');
                        } else {
                            showToast('🔴 Gemini AI đã chỉ rõ lỗi sai bên dưới — bạn hãy sửa lại cho chuẩn nhé!', 'info');
                        }
                    }
                    return;
                }
            }

            if (out) {
                out.innerHTML = renderReevalResultHTML(record);
            }
        } catch (err) {
            if (out) {
                out.innerHTML = `
                    <div class="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                        ❌ Không thể kết nối Gemini AI: ${esc(err.message || 'Lỗi mạng hoặc hết hạn mức miễn phí')}. Bạn có thể bấm biểu tượng <strong>Gemini AI</strong> trên thanh đầu trang để kiểm tra lại khóa nhé!
                    </div>
                `;
            }
        } finally {
            const liveBtn = document.getElementById('btn-gemini-reeval');
            if (liveBtn) {
                liveBtn.disabled = false;
                const liveVerdict = state?.lastEvaluationContext?.result?.verdict || 'retry';
                const label = (liveVerdict === 'passed' || liveVerdict === 'excellent') ? 'Chấm chuyên sâu AI' : 'Phúc khảo bằng Gemini AI';
                liveBtn.innerHTML = `<i class="fa-solid fa-sparkles text-amber-200"></i><span>${label}</span>`;
            }
        }
    };

    // ==================== 5. HÀM GỌI GEMINI GIẢI THÍCH NGỮ PHÁP CHI TIẾT ====================
    window.toggleGeminiGrammarExplanation = async function (forceClose = false) {
        const ctx = (typeof state !== 'undefined') ? state.lastEvaluationContext : null;
        const question = ctx?.question || ((typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null);
        if (!question) return;

        if (forceClose || explanationOpenMap[question.id]) {
            explanationOpenMap[question.id] = false;
            window.renderGeminiActionSlot(question, ctx?.userText || '', ctx?.result || { isDirectAnswerView: true });
            return;
        }
        // 1. Ưu tiên đọc bản giải thích đã biên soạn sẵn trong file data/ (không cần API Key)
        if (question.aiExplanation && typeof question.aiExplanation === 'object') {
            explanationOpenMap[question.id] = true;
            try {
                sessionStorage.setItem(getExplainCacheKey(question), JSON.stringify(question.aiExplanation));
            } catch (e) {}
            window.renderGeminiActionSlot(question, ctx?.userText || '', ctx?.result || { isDirectAnswerView: true });
            const expSlot = document.getElementById('gemini-explain-slot');
            if (expSlot) expSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }
        let cached = null;
        try {
            const raw = sessionStorage.getItem(getExplainCacheKey(question));
            if (raw) cached = JSON.parse(raw);
        } catch (e) {}

        if (cached) {
            explanationOpenMap[question.id] = true;
            window.renderGeminiActionSlot(question, ctx?.userText || '', ctx?.result || { isDirectAnswerView: true });
            const expSlot = document.getElementById('gemini-explain-slot');
            if (expSlot) expSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        if (!isGeminiReady()) {
            if (typeof showToast === 'function') {
                const msg = !isUserAIEnabled()
                    ? 'Trợ lý Gemini AI đang tạm tắt. Hãy bật lại trong trang Cài đặt AI nhé!'
                    : 'Hãy nhập Gemini API Key miễn phí của bạn để mở khóa Giải thích ngữ pháp chi tiết bằng AI!';
                showToast(msg, 'info');
            }
            window.openGeminiSettingsPage();
            return;
        }

        const btn = document.getElementById('btn-gemini-explain');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-purple-600"></i><span>Đang giải thích...</span>`;
        }

        const structLine = question.isStructureMode && question.structureInfo
            ? `Cấu trúc ngữ pháp bài học: ${question.structureInfo.title} (${question.structureInfo.formula})`
            : '';

        const prompt = `Hãy giải thích ngắn gọn, dễ hiểu cho người Việt học tiếng Anh về câu sau:
- Câu tiếng Việt: "${question.vi}"
- Câu tiếng Anh chuẩn: "${question.sampleCasual}"
- Câu trang trọng (Formal): "${question.sampleFormal || question.sampleCasual}"
${structLine}

Trả về JSON gồm:
- context_summary: 1-2 câu tiếng Việt mô tả ngữ cảnh và sắc thái giao tiếp của câu này.
- grammar_points: mảng 2-3 ý ngắn gọn phân tích điểm ngữ pháp trọng tâm và cách chia thì/từ loại.
- native_alternatives: mảng 2 đối tượng { "en": "câu tiếng Anh khác của người bản xứ", "note_vi": "giải thích sắc thái ngắn gọn bằng tiếng Việt" }.
- pro_tip: 1 mẹo thực tế giúp người Việt tránh lỗi dịch word-by-word hoặc nhớ lâu câu này.`;

        const schema = {
            type: 'OBJECT',
            properties: {
                context_summary: { type: 'STRING' },
                grammar_points: { type: 'ARRAY', items: { type: 'STRING' } },
                native_alternatives: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            en: { type: 'STRING' },
                            note_vi: { type: 'STRING' }
                        },
                        required: ['en', 'note_vi']
                    }
                },
                pro_tip: { type: 'STRING' }
            },
            required: ['context_summary', 'grammar_points', 'native_alternatives', 'pro_tip']
        };

        try {
            const { parsed } = await callGeminiJSON(prompt, schema);
            try {
                sessionStorage.setItem(getExplainCacheKey(question), JSON.stringify(parsed));
            } catch (e) {}
            explanationOpenMap[question.id] = true;
            window.renderGeminiActionSlot(question, ctx?.userText || '', ctx?.result || { isDirectAnswerView: true });
            const expSlot = document.getElementById('gemini-explain-slot');
            if (expSlot) expSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            renderExplanationOutputArea(
                question,
                false,
                null,
                `<div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                    ❌ Lỗi tải giải thích AI: ${esc(err.message || 'Kiểm tra lại API Key hoặc kết nối mạng.')}
                 </div>`
            );
            const liveBtn = document.getElementById('btn-gemini-explain');
            if (liveBtn) {
                liveBtn.disabled = false;
                liveBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-purple-500"></i><span>Giải thích AI</span>`;
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeaderGeminiButton);
    } else {
        injectHeaderGeminiButton();
    }
})();
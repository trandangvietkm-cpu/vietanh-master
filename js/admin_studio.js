/**
 * MODULE ADMIN STUDIO: LOGIC QUẢN TRỊ NỘI DUNG & CMS 8 CHẶNG (js/admin_studio.js)
 * Tách độc lập hoàn toàn từ admin.html theo kiến trúc hệ thống (Single Responsibility):
 *  - Quản lý cấu trúc câu, tình huống, chỉnh sửa/xóa/nhân bản & đồng bộ localStorage
 *  - Hỗ trợ tạo nội dung bằng Gemini AI (BYOK) dùng chung khóa với trang Học viên
 *  - Xuất/Gộp JSON, xuất questions_data.js (tương thích ngược) & xuất riêng từng Chặng (data/stage_X.js)
 */

        // ==================== HỆ THỐNG GEMINI AI BYOK DÙNG CHUNG VỚI TRANG HỌC VIÊN ====================
        const ADMIN_GEMINI_KEY_STORAGE = 'va_gemini_api_key';
        const ADMIN_GEMINI_MODEL_STORAGE = 'va_gemini_model';
        const ADMIN_GEMINI_MODELS_CACHE = 'va_gemini_discovered_models';
        const ADMIN_DEFAULT_MODEL = 'gemini-flash-lite-latest';

        const ADMIN_DEPRECATED_MODELS = new Set([
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-3-flash-preview'
        ]);

        const ADMIN_BASE_MODELS = [
            { id: 'gemini-flash-lite-latest', label: 'Gemini Flash-Lite Latest (Khuyên dùng • Tự động dùng bản mới nhất)' },
            { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (Nhanh • Tiết kiệm & Free Tier)' },
            { id: 'gemini-flash-latest', label: 'Gemini Flash Latest (Soạn câu sâu & chi tiết hơn)' },
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Dự phòng)' }
        ];

        function getAdminGeminiKey() {
            try { return (localStorage.getItem(ADMIN_GEMINI_KEY_STORAGE) || '').trim(); } catch (e) { return ''; }
        }

        function getAdminGeminiModel() {
            try {
                const m = (localStorage.getItem(ADMIN_GEMINI_MODEL_STORAGE) || '').trim();
                if (!m || ADMIN_DEPRECATED_MODELS.has(m)) {
                    localStorage.setItem(ADMIN_GEMINI_MODEL_STORAGE, ADMIN_DEFAULT_MODEL);
                    return ADMIN_DEFAULT_MODEL;
                }
                return m;
            } catch (e) {
                return ADMIN_DEFAULT_MODEL;
            }
        }

        function getAdminModelOptions() {
            const merged = [...ADMIN_BASE_MODELS];
            try {
                const discovered = JSON.parse(localStorage.getItem(ADMIN_GEMINI_MODELS_CACHE)) || [];
                discovered.forEach(item => {
                    if (item && item.id && !merged.some(m => m.id === item.id)) merged.push(item);
                });
            } catch (e) {}
            const cur = getAdminGeminiModel();
            if (cur && !merged.some(m => m.id === cur)) {
                merged.unshift({ id: cur, label: `${cur} (Đang chọn)` });
            }
            return merged;
        }

        function saveAdminGeminiConfig(key, model) {
            try {
                const cleanKey = (key || '').trim();
                if (cleanKey) localStorage.setItem(ADMIN_GEMINI_KEY_STORAGE, cleanKey);
                else localStorage.removeItem(ADMIN_GEMINI_KEY_STORAGE);
                if (model) localStorage.setItem(ADMIN_GEMINI_MODEL_STORAGE, model.trim());
            } catch (e) {}
            updateAdminGeminiHeaderStatus();
        }

        function updateAdminGeminiHeaderStatus() {
            const dot = document.getElementById('admin-gemini-dot');
            const btn = document.getElementById('admin-gemini-btn');
            const hasKey = Boolean(getAdminGeminiKey());
            if (dot) {
                if (hasKey) dot.classList.remove('hidden');
                else dot.classList.add('hidden');
            }
            if (btn) {
                btn.title = hasKey
                    ? `Gemini AI đã sẵn sàng (${getAdminGeminiModel()}) • Dùng chung khóa BYOK với trang Học viên`
                    : 'Chưa gắn khóa Gemini AI • Bấm để nhập khóa miễn phí từ Google AI Studio';
            }
        }

        function escapeAdminHtml(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        async function fetchAdminAvailableModels(apiKey) {
            const key = (apiKey || getAdminGeminiKey()).trim();
            if (!key) throw new Error('NO_KEY');
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
            if (!res.ok) {
                let errMsg = `HTTP ${res.status}`;
                try { const j = await res.json(); if (j?.error?.message) errMsg = j.error.message; } catch (e) {}
                throw new Error(errMsg);
            }
            const data = await res.json();
            const validModels = (Array.isArray(data.models) ? data.models : [])
                .filter(m => {
                    const name = (m.name || '').replace(/^models\//, '');
                    const methods = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
                    return methods.includes('generateContent')
                        && /^gemini-/i.test(name)
                        && !/(embedding|imagen|veo|tts|audio|robotics|computer-use|deep-research)/i.test(name)
                        && !ADMIN_DEPRECATED_MODELS.has(name);
                })
                .map(m => {
                    const id = (m.name || '').replace(/^models\//, '');
                    return { id, label: m.displayName ? `${m.displayName} (${id})` : id };
                });

            validModels.sort((a, b) => {
                const score = id => (/flash-lite-latest/i.test(id) ? 100 : /flash-lite/i.test(id) ? 80 : /flash-latest/i.test(id) ? 70 : /flash/i.test(id) ? 50 : 10) + (/3\.\d/i.test(id) ? 20 : 0) - (/preview|exp/i.test(id) ? 5 : 0);
                return score(b.id) - score(a.id);
            });

            if (validModels.length > 0) {
                try { localStorage.setItem(ADMIN_GEMINI_MODELS_CACHE, JSON.stringify(validModels.slice(0, 12))); } catch (e) {}
            }
            return validModels;
        }

        async function executeAdminGeminiOnce(key, model, promptText, responseSchema) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
            const payload = {
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.4,
                    responseMimeType: 'application/json'
                }
            };
            if (responseSchema) payload.generationConfig.responseSchema = responseSchema;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                let errMsg = `HTTP ${res.status}`;
                try { const j = await res.json(); if (j?.error?.message) errMsg = j.error.message; } catch (e) {}
                const err = new Error(errMsg);
                err.status = res.status;
                throw err;
            }

            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Gemini không trả về nội dung JSON.');
            const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            return { parsed: JSON.parse(cleaned), model };
        }

        // ==================== KHUNG SƠ ĐỒ 8 CHẶNG A1–B1 & 5 CHỦ ĐỀ CHUẨN (ĐỒNG BỘ 100% VỚI INDEX.HTML) ====================
        const ROADMAP_STAGES = [
            { id: 'stage_1', number: 1, minLevel: 'A1', maxLevel: 'A1', levelRange: 'A1', shortTitle: 'Chặng 1', title: 'Chặng 1: Khởi động & Giới thiệu bản thân', desc: 'Chào hỏi, tên, nghề nghiệp, quốc tịch (To be), thông tin cá nhân, This/That/These/Those, Have got, There is/are.' },
            { id: 'stage_2', number: 2, minLevel: 'A1', maxLevel: 'A1', levelRange: 'A1', shortTitle: 'Chặng 2', title: 'Chặng 2: Nhịp sống, Ăn uống & Mua sắm', desc: 'Hiện tại đơn (+ / - / ?), trạng từ tần suất, mạo từ a/an/the, How much/many, lượng từ, gọi món & mua sắm.' },
            { id: 'stage_3', number: 3, minLevel: 'A1', maxLevel: 'A2', levelRange: 'A1–A2', shortTitle: 'Chặng 3', title: 'Chặng 3: Hành động đang diễn ra & Mô tả', desc: 'Hiện tại tiếp diễn, đối chiếu Hiện tại đơn, mô tả ngoại hình/tính cách (What... like?), So sánh hơn & nhất, Wh-/How.' },
            { id: 'stage_4', number: 4, minLevel: 'A2', maxLevel: 'A2', levelRange: 'A2', shortTitle: 'Chặng 4', title: 'Chặng 4: Kể chuyện Quá khứ & Chuyến đi', desc: 'Quá khứ đơn (Was/Were & V-ed/V2/Didn\'t/Did), lần đầu/lần cuối, cảm xúc, kể kỳ nghỉ & du lịch/sân bay.' },
            { id: 'stage_5', number: 5, minLevel: 'A2', maxLevel: 'A2', levelRange: 'A2', shortTitle: 'Chặng 5', title: 'Chặng 5: Khả năng, Nghĩa vụ & Lời khuyên', desc: 'Can/Can\'t, Have to/Don\'t have to, Should/Shouldn\'t, gợi ý, đề nghị giúp đỡ & viết lời mời lịch sự.' },
            { id: 'stage_6', number: 6, minLevel: 'A2', maxLevel: 'B1', levelRange: 'A2–B1', shortTitle: 'Chặng 6', title: 'Chặng 6: Kế hoạch, Dự định & Tương lai', desc: 'Ngày tháng, giờ giấc, lễ hội, lịch hẹn, Be going to, Present Continuous cho tương lai, Want/Would like, Will/Might.' },
            { id: 'stage_7', number: 7, minLevel: 'B1', maxLevel: 'B1', levelRange: 'B1', shortTitle: 'Chặng 7', title: 'Chặng 7: Trải nghiệm & Giao tiếp Lịch sự', desc: 'Hiện tại hoàn thành (Ever/Never, For/Since) vs. Quá khứ đơn, Yêu cầu/Xin phép lịch sự, Đồng tình/Phản đối, Phỏng vấn 60 giây.' },
            { id: 'stage_8', number: 8, minLevel: 'B1', maxLevel: 'B1', levelRange: 'B1', shortTitle: 'Chặng 8', title: 'Chặng 8: Phản xạ B1 Thực chiến (Mở rộng)', desc: 'It takes/took + time + to V, Used to/Be used to, Would rather... than, It\'s high time, If loại 1–2, Although/Not only... but also.' }
        ];

        const CEFR_RANK_LIST = ['A1', 'A2', 'B1', 'B2'];

        // Tính khung Sàn–Trần CEFR chuẩn cho từng Chặng (Khóa trần độ khó theo đúng Chặng trên Sơ đồ học)
        function getStageCefrBounds(stageId, floorOverride = 'auto') {
            const stg = ROADMAP_STAGES.find(s => s.id === stageId);
            const allowB2 = floorOverride === 'B2';
            let minLevel = stg ? stg.minLevel : 'A1';
            let maxLevel = stg ? stg.maxLevel : 'B1';

            if (allowB2) {
                maxLevel = 'B2';
                if (!stg) minLevel = 'B2';
            } else if (['A1', 'A2', 'B1'].includes(floorOverride)) {
                // Nếu biên tập viên chọn thủ công mốc sàn cao hơn minLevel của chặng nhưng không vượt maxLevel
                if (CEFR_RANK_LIST.indexOf(floorOverride) >= CEFR_RANK_LIST.indexOf(minLevel) &&
                    CEFR_RANK_LIST.indexOf(floorOverride) <= CEFR_RANK_LIST.indexOf(maxLevel)) {
                    minLevel = floorOverride;
                }
            }

            const minIdx = CEFR_RANK_LIST.indexOf(minLevel);
            const maxIdx = CEFR_RANK_LIST.indexOf(maxLevel);
            const allowedLevels = CEFR_RANK_LIST.slice(minIdx, Math.max(minIdx, maxIdx) + 1);
            const rangeLabel = minLevel === maxLevel ? `Thuần ${minLevel}` : `${minLevel} → ${maxLevel}`;
            return { minLevel, maxLevel, allowedLevels, rangeLabel };
        }

        const VALID_ADMIN_TOPICS = ['daily', 'food_shop', 'travel', 'office', 'interview'];
        const ADMIN_TOPIC_LABELS = {
            daily: 'Hàng ngày',
            food_shop: 'Ăn uống & Mua sắm',
            travel: 'Du lịch & Di chuyển',
            office: 'Công sở & Học tập',
            interview: 'Phỏng vấn & Mục tiêu'
        };

        function getAdminStageInfo(stageId) {
            return ROADMAP_STAGES.find(s => s.id === stageId) || ROADMAP_STAGES[ROADMAP_STAGES.length - 1];
        }

        function resolveAdminStageId(struct) {
            if (!struct) return 'stage_1';
            if (struct.stageId && ROADMAP_STAGES.some(s => s.id === struct.stageId)) return struct.stageId;
            const txt = String(struct.stage || '').toLowerCase();
            const m = txt.match(/chặng\s*(\d+)/i) || txt.match(/stage[_\s]*(\d+)/i);
            if (m) {
                const n = Math.min(ROADMAP_STAGES.length, Math.max(1, parseInt(m[1], 10)));
                return `stage_${n}`;
            }
            const lvl = (struct.level || 'B1').toUpperCase();
            if (lvl === 'A1') return 'stage_1';
            if (lvl === 'A2') return 'stage_4';
            return 'stage_8';
        }

        function normalizeAdminTopic(rawTopic, fallbackTopics = []) {
            const clean = String(rawTopic || '').toLowerCase().trim();
            if (VALID_ADMIN_TOPICS.includes(clean)) return clean;
            if (['food', 'shop', 'shopping', 'restaurant', 'cafe'].includes(clean)) return 'food_shop';
            if (['work', 'business', 'email', 'study'].includes(clean)) return 'office';
            if (['career', 'job', 'goals'].includes(clean)) return 'interview';
            if (Array.isArray(fallbackTopics) && fallbackTopics.length > 0) {
                const first = fallbackTopics.map(t => String(t || '').toLowerCase().trim()).find(t => VALID_ADMIN_TOPICS.includes(t));
                if (first) return first;
            }
            return 'daily';
        }

        function isAdminModelUnavailableError(err) {
            const msg = (err?.message || '').toLowerCase();
            return err?.status === 404 || msg.includes('no longer available') || msg.includes('not found') || msg.includes('is not supported') || msg.includes('deprecated');
        }

        function isAdminRetryableOverloadError(err) {
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

        function adminDelayMs(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Gọi Gemini REST API kèm tự động thử lại sau 1.5s + xoay vòng model dự phòng khi gặp 503/429 (High demand) hoặc 404
        async function callAdminGeminiJSON(promptText, responseSchema, overrideKey = null, overrideModel = null, onStatusUpdate = null) {
            const key = (overrideKey !== null ? overrideKey : getAdminGeminiKey()).trim();
            const primaryModel = (overrideModel || getAdminGeminiModel()).trim();
            if (!key) throw new Error('NO_KEY');

            let lastErr = null;
            let primaryPermanentlyUnavailable = false;

            try {
                return await executeAdminGeminiOnce(key, primaryModel, promptText, responseSchema);
            } catch (err) {
                lastErr = err;
                primaryPermanentlyUnavailable = isAdminModelUnavailableError(err);
                const isOverload = isAdminRetryableOverloadError(err);

                if (!primaryPermanentlyUnavailable && !isOverload) throw err;

                // Nếu lỗi quá tải tạm thời (503/429): chờ 1.5 giây thử lại chính model đó 1 lần trước khi xoay model
                if (isOverload && !primaryPermanentlyUnavailable) {
                    if (typeof onStatusUpdate === 'function') {
                        onStatusUpdate(`Mô hình ${primaryModel} đang cao điểm (503/429), chờ 1.5 giây thử lại...`);
                    }
                    await adminDelayMs(1500);
                    try {
                        return await executeAdminGeminiOnce(key, primaryModel, promptText, responseSchema);
                    } catch (retryPrimaryErr) {
                        lastErr = retryPrimaryErr;
                        if (!isAdminRetryableOverloadError(retryPrimaryErr) && !isAdminModelUnavailableError(retryPrimaryErr)) {
                            throw retryPrimaryErr;
                        }
                    }
                }

                // Xây danh sách model dự phòng để xoay vòng tự động
                const fallbacks = [];
                const suggested = (lastErr?.message || '').match(/models\/(gemini-[a-z0-9.\-]+)/ig);
                if (suggested) {
                    suggested.forEach(m => {
                        const id = m.replace(/^models\//i, '');
                        if (id !== primaryModel && !fallbacks.includes(id)) fallbacks.push(id);
                    });
                }
                ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash'].forEach(id => {
                    if (id !== primaryModel && !fallbacks.includes(id)) fallbacks.push(id);
                });
                try {
                    const live = await fetchAdminAvailableModels(key);
                    live.slice(0, 4).forEach(m => {
                        if (m.id !== primaryModel && !fallbacks.includes(m.id)) fallbacks.push(m.id);
                    });
                } catch (e) {}

                for (const cand of fallbacks) {
                    if (typeof onStatusUpdate === 'function') {
                        onStatusUpdate(`Đang tự động xoay sang model dự phòng ${cand}...`);
                    }
                    try {
                        const result = await executeAdminGeminiOnce(key, cand, promptText, responseSchema);
                        // Chỉ ghi đè model mặc định trong localStorage khi model cũ bị ngừng hỗ trợ vĩnh viễn (404), KHÔNG ghi đè khi chỉ quá tải 503 tạm thời
                        if (overrideKey === null && primaryPermanentlyUnavailable) {
                            saveAdminGeminiConfig(key, cand);
                        }
                        return result;
                    } catch (retryErr) {
                        lastErr = retryErr;
                        if (!isAdminModelUnavailableError(retryErr) && !isAdminRetryableOverloadError(retryErr)) {
                            throw retryErr;
                        }
                    }
                }
                throw lastErr;
            }
        }

        function openAdminGeminiSettingsModal() {
            let modal = document.getElementById('admin-gemini-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'admin-gemini-modal';
                modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4';
                modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                document.body.appendChild(modal);
            }

            const currentKey = getAdminGeminiKey();
            const currentModel = getAdminGeminiModel();
            const optionsHtml = getAdminModelOptions().map(m =>
                `<option value="${escapeAdminHtml(m.id)}" ${currentModel === m.id ? 'selected' : ''}>${escapeAdminHtml(m.label)}</option>`
            ).join('');

            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-6 py-4 text-white flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <i class="fa-solid fa-key text-amber-200"></i>
                            </div>
                            <div>
                                <h3 class="font-extrabold text-base leading-tight">Cài đặt Gemini AI (BYOK)</h3>
                                <p class="text-[11px] text-indigo-100">Đồng bộ trực tiếp với khóa API bên trang Học viên</p>
                            </div>
                        </div>
                        <button type="button" onclick="document.getElementById('admin-gemini-modal').remove()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
                        <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                            <p class="font-extrabold mb-1"><i class="fa-solid fa-link text-emerald-600 mr-1"></i>Dùng chung khóa với ViệtAnh Master</p>
                            <p>Nếu bạn đã nhập khóa bên <code>index.html</code>, Admin Studio tự động dùng luôn khóa đó cho: <strong>Tạo 10 câu tự động</strong>, <strong>Thêm nhanh 5 câu bằng AI</strong> và <strong>AI điền 6 ô phụ</strong>.</p>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-xs font-bold text-slate-700">Gemini API Key của bạn</label>
                            <div class="relative">
                                <input id="admin-gemini-key-input" type="password" value="${escapeAdminHtml(currentKey)}" placeholder="AIzaSy..." autocomplete="off" class="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <button type="button" onclick="const inp=document.getElementById('admin-gemini-key-input'); inp.type=inp.type==='password'?'text':'password';" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs px-1.5 py-1">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between gap-2">
                                <label class="block text-xs font-bold text-slate-700">Mô hình (Model)</label>
                                <button type="button" id="admin-scan-models-btn" onclick="scanAdminGeminiModels()" class="text-[11px] font-bold text-indigo-600 hover:underline">
                                    <i class="fa-solid fa-arrows-rotate mr-0.5"></i>Quét model hỗ trợ
                                </button>
                            </div>
                            <select id="admin-gemini-model-select" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                ${optionsHtml}
                            </select>
                        </div>

                        <div id="admin-gemini-test-status" class="hidden p-3 rounded-xl text-xs font-semibold"></div>

                        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div class="flex items-center gap-2">
                                <button type="button" id="admin-gemini-test-btn" onclick="testAdminGeminiConnection()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200">
                                    <i class="fa-solid fa-plug-circle-check mr-1"></i>Kiểm tra kết nối
                                </button>
                                ${currentKey ? `<button type="button" onclick="saveAdminGeminiConfig('', ADMIN_DEFAULT_MODEL); document.getElementById('admin-gemini-modal').remove(); showToast('Đã xóa khóa Gemini API.', 'info');" class="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200">Xóa khóa</button>` : ''}
                            </div>
                            <button type="button" onclick="saveAdminGeminiConfig(document.getElementById('admin-gemini-key-input').value, document.getElementById('admin-gemini-model-select').value); document.getElementById('admin-gemini-modal').remove(); showToast('✅ Đã lưu cấu hình Gemini AI!', 'success');" class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 shadow-sm">
                                Lưu cài đặt
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        async function scanAdminGeminiModels() {
            const key = (document.getElementById('admin-gemini-key-input')?.value || '').trim();
            const sel = document.getElementById('admin-gemini-model-select');
            const st = document.getElementById('admin-gemini-test-status');
            if (!key) {
                if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200'; st.innerText = '⚠️ Hãy dán Gemini API Key trước nhé.'; }
                return;
            }
            try {
                const live = await fetchAdminAvailableModels(key);
                if (live.length > 0 && sel) {
                    sel.innerHTML = getAdminModelOptions().map(m => `<option value="${escapeAdminHtml(m.id)}" ${m.id === live[0].id ? 'selected' : ''}>${escapeAdminHtml(m.label)}</option>`).join('');
                    if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200'; st.innerText = `✅ Quét thấy ${live.length} model khả dụng! Đã chọn: ${live[0].id}.`; }
                }
            } catch (err) {
                if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200'; st.innerText = `❌ Lỗi quét model: ${err.message}`; }
            }
        }

        async function testAdminGeminiConnection() {
            const key = (document.getElementById('admin-gemini-key-input')?.value || '').trim();
            const sel = document.getElementById('admin-gemini-model-select');
            const model = sel?.value || ADMIN_DEFAULT_MODEL;
            const st = document.getElementById('admin-gemini-test-status');
            const btn = document.getElementById('admin-gemini-test-btn');
            if (!key) {
                if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200'; st.innerText = '⚠️ Bạn hãy dán Gemini API Key trước nhé.'; }
                return;
            }
            if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>Đang kiểm tra...`; }
            if (st) { st.className = 'p-3 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200'; st.innerText = `Đang thử kết nối tới ${model}...`; }
            try {
                const { model: okModel } = await callAdminGeminiJSON(
                    'Trả về JSON {"ok": true}',
                    { type: 'OBJECT', properties: { ok: { type: 'BOOLEAN' } }, required: ['ok'] },
                    key,
                    model
                );
                if (sel && okModel) {
                    sel.innerHTML = getAdminModelOptions().map(m => `<option value="${escapeAdminHtml(m.id)}" ${m.id === okModel ? 'selected' : ''}>${escapeAdminHtml(m.label)}</option>`).join('');
                    if (sel.value !== okModel) {
                        const opt = document.createElement('option');
                        opt.value = okModel; opt.textContent = `${okModel} (Hoạt động tốt)`;
                        sel.insertBefore(opt, sel.firstChild); sel.value = okModel;
                    }
                }
                if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200'; st.innerText = `✅ Kết nối thành công với ${okModel}! Bấm "Lưu cài đặt" để dùng ngay.`; }
            } catch (err) {
                if (st) { st.className = 'p-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200'; st.innerText = `❌ Kết nối thất bại: ${err.message}`; }
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-plug-circle-check mr-1"></i>Kiểm tra kết nối`; }
            }
        }

        // ==================== SMART FILL 6 Ô PHỤ (AI BYOK + OFFLINE NHANH) CHO TAB 1 & MODAL SỬA ====================
        async function smartFillSixFields(mode = 'add', useAI = true, btnEl = null) {
            const isEdit = mode === 'edit';
            const structEl = document.getElementById(isEdit ? 'edit-sit-struct-id' : 'sit-struct-select');
            const levelEl = document.getElementById(isEdit ? 'edit-sit-level' : 'sit-level-select');
            const topicEl = document.getElementById(isEdit ? 'edit-sit-topic' : 'sit-topic-select');
            const contextEl = document.getElementById(isEdit ? 'edit-sit-context' : 'sit-context-input');
            const viEl = document.getElementById(isEdit ? 'edit-sit-vi' : 'sit-vi-input');
            const casualEl = document.getElementById(isEdit ? 'edit-sit-casual' : 'sit-casual-input');
            const formalEl = document.getElementById(isEdit ? 'edit-sit-formal' : 'sit-formal-input');
            const altEl = document.getElementById(isEdit ? 'edit-sit-alternatives' : 'sit-alternatives-input');
            const ipaEl = document.getElementById(isEdit ? 'edit-sit-ipa' : 'sit-ipa-input');
            const grammarEl = document.getElementById(isEdit ? 'edit-sit-grammar-hint' : 'sit-grammar-input');
            const keywordsEl = document.getElementById(isEdit ? 'edit-sit-keywords' : 'sit-keywords-input');
            const hintsEl = document.getElementById(isEdit ? 'edit-sit-hints' : 'sit-hints-input');

            const viText = (viEl?.value || '').trim();
            const casualText = (casualEl?.value || '').trim();

            if (!casualText) {
                showToast('Hãy nhập "Đáp án Tiếng Anh chuẩn (Casual / Standard)" trước khi bấm tự điền 6 ô nhé!', 'warning');
                casualEl?.focus();
                return;
            }

            const structId = structEl ? structEl.value : '';
            const selectedStruct = getMergedStructures().find(s => s.id === structId);
            const origHTML = btnEl ? btnEl.innerHTML : '';

            if (useAI && !getAdminGeminiKey()) {
                showToast('Chưa gắn khóa Gemini AI — bấm nút "Gemini AI" trên góc phải hoặc dùng "Điền nhanh Offline"!', 'warning');
                openAdminGeminiSettingsModal();
                return;
            }

            if (btnEl) {
                btnEl.disabled = true;
                btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Đang điền...</span>`;
            }

            try {
                if (useAI) {
                    const structNote = selectedStruct ? `Thuộc cấu trúc: "${selectedStruct.title}" (Công thức: ${selectedStruct.formula}).` : '';
                    const prompt = `Bạn là biên tập viên nội dung học tiếng Anh thực chiến cho người Việt.
Hãy tạo đầy đủ dữ liệu sư phạm chuẩn xác cho tình huống luyện dịch sau:
- Câu Tiếng Việt: "${viText || '(tự suy ra từ câu tiếng Anh)'}"
- Đáp án Tiếng Anh chuẩn (Casual): "${casualText}"
- ${structNote}

Trả về JSON gồm:
- context: nhãn ngữ cảnh ngắn gọn (VD: "Tình huống mở rộng • Công sở / Lịch hẹn").
- level: bậc CEFR phù hợp (KHÓA TRẦN theo Chặng của cấu trúc: ${selectedStruct ? getStageCefrBounds(resolveAdminStageId(selectedStruct)).allowedLevels.join(' | ') : 'A1 | A2 | B1'}).
- topic: đúng 1 mã chủ đề phù hợp nhất trong ["daily", "food_shop", "travel", "office", "interview"].
- sampleFormal: phiên bản tiếng Anh trang trọng / công việc (Formal) tương đương.
- alternatives: mảng 1-2 cách diễn đạt tương tự tự nhiên khác, mỗi phần tử { label: "nhãn ngắn tiếng Việt", en: "câu tiếng Anh" }.
- ipa: phiên âm IPA Anh-Mỹ chuẩn đầy đủ cho câu sampleCasual đặt trong dấu /.../.
- grammarHint: 1-2 câu tiếng Việt giải thích ngắn gọn điểm ngữ pháp, thì cần chia và lưu ý tránh lỗi dịch word-by-word.
- keywords: mảng 3-5 từ khóa nguyên từ (whole words / phrases xuất hiện chính xác trong câu sampleCasual) để chấm điểm tự động.
- hints: mảng 2-4 cụm từ gợi ý { en, vi }.`;

                    const schema = {
                        type: 'OBJECT',
                        properties: {
                            context: { type: 'STRING' },
                            level: { type: 'STRING' },
                            topic: { type: 'STRING' },
                            sampleFormal: { type: 'STRING' },
                            alternatives: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: { label: { type: 'STRING' }, en: { type: 'STRING' } },
                                    required: ['label', 'en']
                                }
                            },
                            ipa: { type: 'STRING' },
                            grammarHint: { type: 'STRING' },
                            keywords: { type: 'ARRAY', items: { type: 'STRING' } },
                            hints: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: { en: { type: 'STRING' }, vi: { type: 'STRING' } },
                                    required: ['en', 'vi']
                                }
                            }
                        },
                        required: ['context', 'level', 'topic', 'sampleFormal', 'alternatives', 'ipa', 'grammarHint', 'keywords', 'hints']
                    };

                    const { parsed, model } = await callAdminGeminiJSON(prompt, schema);

                    if (contextEl && !contextEl.value.trim() && parsed.context) contextEl.value = parsed.context;
                    if (levelEl && ['A1','A2','B1','B2'].includes(parsed.level)) levelEl.value = parsed.level;
                    if (topicEl && parsed.topic) topicEl.value = normalizeAdminTopic(parsed.topic, selectedStruct?.topics);
                    if (formalEl && parsed.sampleFormal) formalEl.value = parsed.sampleFormal;
                    if (altEl && Array.isArray(parsed.alternatives)) {
                        altEl.value = parsed.alternatives.map(a => `${a.label}: ${a.en}`).join('\n');
                    }
                    if (ipaEl && parsed.ipa) ipaEl.value = parsed.ipa;
                    if (grammarEl && parsed.grammarHint) grammarEl.value = parsed.grammarHint;
                    if (keywordsEl && Array.isArray(parsed.keywords)) keywordsEl.value = parsed.keywords.join(', ');
                    if (hintsEl && Array.isArray(parsed.hints)) hintsEl.value = parsed.hints.map(h => `${h.en}:${h.vi}`).join(', ');

                    showToast(`✨ Gemini AI (${model}) đã điền chuẩn toàn bộ 6 ô phụ!`, 'success');
                } else {
                    // Điền nhanh Offline + API từ điển/dịch miễn phí
                    if (contextEl && !contextEl.value.trim()) {
                        contextEl.value = viText.includes('?') ? 'Tình huống mở rộng • Câu hỏi giao tiếp' : 'Tình huống mở rộng • Giao tiếp thực tế';
                    }
                    let formal = casualText
                        .replace(/\bI'm\b/gi, 'I am').replace(/\byou're\b/gi, 'you are').replace(/\bhe's\b/gi, 'he is').replace(/\bshe's\b/gi, 'she is')
                        .replace(/\bit's\b/gi, 'it is').replace(/\bwe're\b/gi, 'we are').replace(/\bthey're\b/gi, 'they are')
                        .replace(/\bdon't\b/gi, 'do not').replace(/\bdoesn't\b/gi, 'does not').replace(/\bdidn't\b/gi, 'did not')
                        .replace(/\bwon't\b/gi, 'will not').replace(/\bcan't\b/gi, 'cannot').replace(/\ba lot of\b/gi, 'a great deal of');
                    formal = formal.charAt(0).toUpperCase() + formal.slice(1);
                    if (formalEl) formalEl.value = formal;

                    const altGen = buildAdminStructuralVariation(casualText, structId);
                    if (altEl && altGen.en) altEl.value = `${altGen.label}: ${altGen.en}`;

                    const kwList = Array.from(new Set(normalizeAndTokenize(casualText, true).filter(w => w.length >= 3))).slice(0, 5);
                    if (keywordsEl) keywordsEl.value = kwList.join(', ');

                    if (grammarEl) {
                        grammarEl.value = selectedStruct
                            ? `Áp dụng công thức "${selectedStruct.formula}" đúng thì theo ngữ cảnh câu.`
                            : 'Chú ý chia đúng thì của động từ chính và giữ trật tự từ chuẩn tiếng Anh.';
                    }

                    // Thử lấy IPA từ dictionaryapi.dev cho các từ khóa và nghĩa Việt từ Google Translate GTX (miễn phí, không cần key)
                    const rawTokens = casualText.split(/\s+/).filter(Boolean);
                    const [ipaParts, hintPairs] = await Promise.all([
                        Promise.all(rawTokens.map(async tok => {
                            const c = tok.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
                            if (!c) return '';
                            try {
                                const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(c)}`);
                                if (r.ok) {
                                    const d = await r.json();
                                    const ph = d?.[0]?.phonetic || d?.[0]?.phonetics?.find(p => p.text)?.text;
                                    if (ph) return ph.replace(/^\/|\/$/g, '').trim();
                                }
                            } catch (e) {}
                            return c;
                        })),
                        Promise.all(kwList.slice(0, 3).map(async kw => {
                            try {
                                const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(kw)}`);
                                if (r.ok) {
                                    const d = await r.json();
                                    const viMean = d?.[0]?.[0]?.[0];
                                    if (viMean) return `${kw}:${String(viMean).trim().toLowerCase()}`;
                                }
                            } catch (e) {}
                            return `${kw}:từ khóa trọng tâm`;
                        }))
                    ]);

                    if (ipaEl) ipaEl.value = `/${ipaParts.filter(Boolean).join(' ')}/`;
                    if (hintsEl) hintsEl.value = hintPairs.join(', ');
                    showToast('⚡ Đã điền nhanh xong cả 6 ô phụ!', 'success');
                }

                // Nháy viền xanh nhẹ các ô vừa điền
                [contextEl, formalEl, altEl, ipaEl, grammarEl, keywordsEl, hintsEl].forEach(el => {
                    if (!el) return;
                    el.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50/30');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-50/30'), 1200);
                });
            } catch (err) {
                showToast(`❌ Lỗi tự điền AI: ${err.message || 'Kiểm tra lại API Key hoặc mạng.'}`, 'warning');
            } finally {
                if (btnEl) {
                    btnEl.disabled = false;
                    btnEl.innerHTML = origHTML;
                }
            }
        }

        // Đọc trực tiếp từ file questions_data.js (Tôn trọng mảng rỗng [] khi đã dọn sạch kho)
        const BASE_STRUCTURES = Array.isArray(window.SENTENCE_STRUCTURES_DATA) ? window.SENTENCE_STRUCTURES_DATA : [];

        // Dữ liệu mở rộng và chỉnh sửa do Admin thực hiện (đồng bộ với vietanh_master.html)
        let customStructures = JSON.parse(localStorage.getItem('va_custom_structures')) || [];
        let customSituationsMap = JSON.parse(localStorage.getItem('va_custom_situations')) || {}; // { structId: [sit1, sit2...] }
        let structureOverrides = JSON.parse(localStorage.getItem('va_structure_overrides')) || {}; // { structId: { title, shortName, formula, level, description, requiredPatterns } }
        let situationOverrides = JSON.parse(localStorage.getItem('va_situation_overrides')) || {}; // { sitId: { context, level, vi, sampleCasual, sampleFormal, keywords, hints } }
        let deletedSituationIds = JSON.parse(localStorage.getItem('va_deleted_situations')) || [];
        let deletedStructureIds = JSON.parse(localStorage.getItem('va_deleted_structures')) || [];
        let inlineConfirmSitId = null; // Lưu ID tình huống đang chờ bấm "Xác nhận xóa" trực tiếp trên thẻ
        let lastDeletedBackup = null;  // Lưu tạm câu vừa xóa để hỗ trợ nút Hoàn tác (Undo)

        function getMergedStructures() {
            const baseIdSet = new Set(BASE_STRUCTURES.map(st => st.id));
            const rawList = [];

            BASE_STRUCTURES.filter(st => st && st.id && !deletedStructureIds.includes(st.id)).forEach((st, idx) => {
                const stOverride = structureOverrides[st.id] || {};
                const extraSits = customSituationsMap[st.id] || [];
                const merged = { ...st, ...stOverride };
                const stageId = resolveAdminStageId(merged);
                const stageInfo = getAdminStageInfo(stageId);
                const normTopics = (Array.isArray(merged.topics) && merged.topics.length > 0)
                    ? Array.from(new Set(merged.topics.map(t => normalizeAdminTopic(t))))
                    : ['daily'];

                const mergedSits = [...(st.situations || []), ...extraSits]
                    .filter(s => s && !deletedSituationIds.includes(s.id))
                    .map(s => {
                        const obj = situationOverrides[s.id] ? { ...s, ...situationOverrides[s.id], isEdited: true } : { ...s };
                        obj.topic = normalizeAdminTopic(obj.topic, normTopics);
                        return obj;
                    });

                rawList.push({
                    ...merged,
                    stageId,
                    stage: stageInfo.title,
                    orderInStage: Number.isFinite(Number(merged.orderInStage)) ? Number(merged.orderInStage) : (idx + 1),
                    topics: normTopics,
                    isCustom: false,
                    isEdited: Boolean(structureOverrides[st.id]),
                    situations: mergedSits
                });
            });

            const seenCustomIds = new Set();
            customStructures.forEach((cst, idx) => {
                if (!cst || !cst.id || baseIdSet.has(cst.id) || seenCustomIds.has(cst.id)) return;
                seenCustomIds.add(cst.id);
                const stOverride = structureOverrides[cst.id] || {};
                const extraSits = customSituationsMap[cst.id] || [];
                const merged = { ...cst, ...stOverride };
                const stageId = resolveAdminStageId(merged);
                const stageInfo = getAdminStageInfo(stageId);
                const normTopics = (Array.isArray(merged.topics) && merged.topics.length > 0)
                    ? Array.from(new Set(merged.topics.map(t => normalizeAdminTopic(t))))
                    : ['daily'];

                const mergedSits = [...(cst.situations || []), ...extraSits]
                    .filter(s => s && !deletedSituationIds.includes(s.id))
                    .map(s => {
                        const obj = situationOverrides[s.id] ? { ...s, ...situationOverrides[s.id], isEdited: true } : { ...s };
                        obj.topic = normalizeAdminTopic(obj.topic, normTopics);
                        return obj;
                    });

                rawList.push({
                    ...merged,
                    stageId,
                    stage: stageInfo.title,
                    orderInStage: Number.isFinite(Number(merged.orderInStage)) ? Number(merged.orderInStage) : (rawList.length + 1),
                    topics: normTopics,
                    isCustom: true,
                    situations: mergedSits
                });
            });

            // Sắp xếp chuẩn theo Chặng 1..8 -> Thứ tự trong chặng
            rawList.sort((a, b) => {
                const sa = ROADMAP_STAGES.findIndex(s => s.id === a.stageId);
                const sb = ROADMAP_STAGES.findIndex(s => s.id === b.stageId);
                if (sa !== sb) return sa - sb;
                return (a.orderInStage || 0) - (b.orderInStage || 0);
            });
            rawList.forEach((st, idx) => { st.number = idx + 1; });
            return rawList;
        }

        // ==================== THUẬT TOÁN TÍNH ĐỘ TƯƠNG ĐỒNG CÂU DỊCH THEO % ====================
        const STOP_WORDS = new Set(["the", "a", "an", "to", "in", "on", "at", "of", "for", "and", "or", "is", "am", "are", "was", "were"]);

        function normalizeAndTokenize(text, filterStopWords = false) {
            if (!text) return [];
            const cleaned = text
                .toLowerCase()
                .replace(/[.,?!;:"'()[\]{}—–-]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            if (!cleaned) return [];
            const words = cleaned.split(" ");
            return filterStopWords ? words.filter(w => !STOP_WORDS.has(w)) : words;
        }

        // Kết hợp hệ số Dice (Sørensen–Dice) và Jaccard trên cả từ đơn (unigrams) và cụm 2 từ liền nhau (bigrams)
        function computeTextSimilarityPercent(str1, str2) {
            if (!str1 || !str2) return { score: 0, sharedWords: [] };

            const clean1 = str1.toLowerCase().replace(/[.,?!;:"']/g, "").trim();
            const clean2 = str2.toLowerCase().replace(/[.,?!;:"']/g, "").trim();
            if (clean1 === clean2 && clean1.length > 0) {
                return { score: 100, sharedWords: clean1.split(/\s+/) };
            }

            const tokens1 = normalizeAndTokenize(str1);
            const tokens2 = normalizeAndTokenize(str2);
            if (tokens1.length === 0 || tokens2.length === 0) return { score: 0, sharedWords: [] };

            const set1 = new Set(tokens1);
            const set2 = new Set(tokens2);

            const sharedWords = [...set1].filter(w => set2.has(w));
            const unionSize = new Set([...set1, ...set2]).size;

            // Jaccard Similarity
            const jaccard = unionSize > 0 ? (sharedWords.length / unionSize) : 0;
            // Dice Coefficient (nhạy hơn với các câu thay 1-2 danh từ/con số)
            const dice = (set1.size + set2.size) > 0 ? ((2 * sharedWords.length) / (set1.size + set2.size)) : 0;

            const combined = Math.round(((jaccard * 0.45) + (dice * 0.55)) * 100);
            return {
                score: Math.min(99, combined),
                sharedWords
            };
        }

        // Quét thời gian thực khi Admin gõ câu Tiếng Việt hoặc Tiếng Anh
        function runRealtimeDuplicateScan() {
            const viInput = document.getElementById('sit-vi-input').value.trim();
            const enInput = document.getElementById('sit-casual-input').value.trim();

            const allStructs = getMergedStructures();
            const matches = [];

            allStructs.forEach(struct => {
                struct.situations.forEach((sit, idx) => {
                    const viSim = computeTextSimilarityPercent(viInput, sit.vi);
                    const enSim = computeTextSimilarityPercent(enInput, sit.sampleCasual);
                    const maxScore = Math.max(viSim.score, enSim.score);

                    if (maxScore >= 25) {
                        matches.push({
                            structTitle: struct.shortName,
                            sitIndex: idx + 1,
                            vi: sit.vi,
                            en: sit.sampleCasual,
                            viScore: viSim.score,
                            enScore: enSim.score,
                            maxScore: maxScore,
                            shared: viSim.score >= enSim.score ? viSim.sharedWords : enSim.sharedWords
                        });
                    }
                });
            });

            matches.sort((a, b) => b.maxScore - a.maxScore);
            const topMatches = matches.slice(0, 3);
            const highestScore = topMatches.length > 0 ? topMatches[0].maxScore : 0;

            updateDuplicateRadarUI(highestScore, topMatches);
            return highestScore;
        }

        function updateDuplicateRadarUI(highestScore, topMatches) {
            const badge = document.getElementById('max-sim-badge');
            const bar = document.getElementById('sim-progress-bar');
            const msg = document.getElementById('sim-status-message');
            const iconBox = document.getElementById('radar-status-icon');
            const listEl = document.getElementById('similar-matches-list');
            const saveBtn = document.getElementById('save-sit-btn');

            bar.style.width = `${highestScore}%`;
            badge.innerText = `${highestScore}% trùng`;

            if (highestScore >= 85) {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-rose-100 text-rose-800";
                bar.className = "h-full bg-rose-600 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-ban"></i>`;
                msg.className = "text-xs font-bold text-rose-600 pt-1";
                msg.innerText = `⛔ PHÁT HIỆN TRÙNG LẶP CAO (${highestScore}%): Câu này gần như trùng hệt câu đã có trong kho. Hệ thống tạm khóa nút Lưu!`;
                saveBtn.disabled = true;
                saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (highestScore >= 65) {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-amber-100 text-amber-800";
                bar.className = "h-full bg-amber-500 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
                msg.className = "text-xs font-bold text-amber-700 pt-1";
                msg.innerText = `⚠️ CẢNH BÁO TƯƠNG ĐỒNG (${highestScore}%): Câu mới khá giống câu cũ ("bình mới rượu cũ"). Hãy đổi ngữ cảnh hoặc chủ ngữ cho phong phú hơn!`;
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800";
                bar.className = "h-full bg-emerald-500 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-shield-check"></i>`;
                msg.className = "text-xs font-semibold text-emerald-700 pt-1";
                msg.innerText = highestScore === 0
                    ? "Chưa có dữ liệu trùng lặp. Bạn có thể thoải mái thêm câu mới."
                    : `✅ AN TOÀN (${highestScore}%): Câu có độ mới mẻ tốt, đủ điều kiện thêm vào kho dữ liệu.`;
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            if (topMatches.length === 0) {
                listEl.innerHTML = `
                    <div class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Chưa phát hiện câu nào trong kho có độ tương đồng &ge; 25%.
                    </div>
                `;
                return;
            }

            listEl.innerHTML = topMatches.map(m => {
                const colorClass = m.maxScore >= 85
                    ? "border-rose-300 bg-rose-50/60"
                    : m.maxScore >= 65
                        ? "border-amber-300 bg-amber-50/60"
                        : "border-slate-200 bg-slate-50/70";
                const badgeColor = m.maxScore >= 85
                    ? "bg-rose-600 text-white"
                    : m.maxScore >= 65
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 text-slate-700";

                return `
                    <div class="p-3.5 rounded-2xl border ${colorClass} space-y-1.5 text-xs">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-bold text-indigo-700">${m.structTitle} • Câu #${m.sitIndex}</span>
                            <span class="px-2 py-0.5 rounded-md font-extrabold text-[11px] ${badgeColor}">
                                Giống ${m.maxScore}% (VI: ${m.viScore}% | EN: ${m.enScore}%)
                            </span>
                        </div>
                        <p class="font-bold text-slate-800">"${m.vi}"</p>
                        <p class="text-slate-600 italic">"${m.en}"</p>
                        <div class="pt-1 flex flex-wrap gap-1">
                            <span class="text-[10px] text-slate-400 font-semibold">Từ trùng:</span>
                            ${m.shared.slice(0, 8).map(w => `<span class="px-1.5 py-0.2 bg-white border border-slate-200 rounded text-[10px] font-mono text-rose-600">${w}</span>`).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Nút điền thử một câu gần giống câu số 1 để người dùng thấy ngay thanh % nhảy lên ~82%
        function fillSampleDuplicateTest() {
            document.getElementById('sit-struct-select').value = 'struct_1';
            document.getElementById('sit-context-input').value = 'Tình huống thử nghiệm độ trùng lặp';
            document.getElementById('sit-vi-input').value = 'Tôi mất khoảng 20 phút để lái xe đi làm mỗi sáng.';
            document.getElementById('sit-casual-input').value = 'It takes me about 20 minutes to drive to work every morning.';
            document.getElementById('sit-keywords-input').value = 'takes, 20, minutes, drive, work';
            document.getElementById('sit-hints-input').value = 'about 20 minutes:khoảng 20 phút, drive to work:lái xe đi làm';
            runRealtimeDuplicateScan();
            showToast("Đã nạp câu thử nghiệm! Hãy nhìn cột bên phải để xem cảnh báo % trùng lặp.", "info");
        }

        function clearSituationForm() {
            document.getElementById('add-situation-form').reset();
            runRealtimeDuplicateScan();
        }

        // Lưu tình huống mới vào cấu trúc đã chọn
        
        // ==================== BỘ XỬ LÝ & TỰ ĐIỀN CÁC CÁCH DIỄN ĐẠT TƯƠNG TỰ (HYBRID PA1 + PA2) ====================
        function toAdminGerund(verb) {
            if (!verb) return "";
            const v = verb.toLowerCase().trim();
            const map = {
                drive: "driving", commute: "commuting", fix: "fixing", resolve: "resolving",
                deliver: "delivering", master: "mastering", achieve: "achieving", prepare: "preparing",
                walk: "walking", get: "getting", reach: "reaching", export: "exporting",
                quit: "quitting", leave: "leaving", make: "making", finish: "finishing",
                complete: "completing", sign: "signing", register: "registering"
            };
            if (map[v]) return map[v];
            if (v.endsWith("e") && !v.endsWith("ee")) return v.slice(0, -1) + "ing";
            return v + "ing";
        }

        function buildAdminStructuralVariation(casualText, structId = "") {
            const casual = (casualText || "").trim();
            if (!casual) return { label: "Biến thể tương đương", en: "" };

            if (structId === "struct_1" || /^it\s+(usually\s+)?(takes|took|will take|'ll take)/i.test(casual)) {
                let m = casual.match(/^It\s+(?:usually\s+)?takes\s+me\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spend + time + V-ing)", en: `I usually spend ${m[1]} ${toAdminGerund(m[2])}${m[3]}` };
                m = casual.match(/^It\s+took\s+me\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spent + time + V-ing)", en: `I spent ${m[1]} ${toAdminGerund(m[2])}${m[3]}` };
                m = casual.match(/^It\s+took\s+our\s+team\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spent + time + V-ing)", en: `Our team spent ${m[1]} ${toAdminGerund(m[2])}${m[3]}` };
            }
            if (structId === "struct_2" || /would you (guys )?mind/i.test(casual)) {
                if (/would you (?:guys )?mind if i/i.test(casual)) {
                    return { label: "Giao tiếp thân mật (Is it okay if I...)", en: casual.replace(/Would you (?:guys )?mind if I (\w+)/i, "Is it okay with you if I $1") };
                }
                return { label: "Giao tiếp thân mật (Do you mind + V-ing)", en: casual.replace(/Would you mind/i, "Do you mind") };
            }
            if (structId === "struct_3" || /not only/i.test(casual)) {
                return {
                    label: "Biến thể tương đương (Both... and / As well as)",
                    en: casual.replace(/not only/i, "both").replace(/,\s*but\s+(?:she's|he's|it's|she|he|it|they)\s+also/i, " and").replace(/\s+but\s+also\s+/i, " as well as ")
                };
            }
            if (structId === "struct_4" || /used to/i.test(casual)) {
                if (/am|is|are|m|s|re\s+(?:already\s+|totally\s+|still\s+not\s+)?used to/i.test(casual)) {
                    return { label: "Biến thể nâng cao (Be accustomed to)", en: casual.replace(/used to/i, "accustomed to") };
                }
                return { label: "Diễn đạt thói quen xưa (Would often + V)", en: casual.replace(/I used to/i, "Back then, I would often") };
            }
            if (structId === "struct_5" || /no matter/i.test(casual)) {
                return {
                    label: "Rút gọn chuẩn bản xứ (However / Whatever / Wherever)",
                    en: casual.replace(/No matter how/i, "However").replace(/No matter what/i, "Whatever").replace(/No matter where/i, "Wherever").replace(/No matter who/i, "Whoever").replace(/No matter when/i, "Whenever")
                };
            }
            if (structId === "struct_6" || /\bi wish\b/i.test(casual)) {
                return { label: "Nhấn mạnh cảm xúc (If only - Giá như...)", en: casual.replace(/\bI wish\b/i, "If only") };
            }
            if (/high time|about time/i.test(casual)) {
                const alt = /high time/i.test(casual) ? casual.replace(/high time/i, "about time") : casual.replace(/about time/i, "high time");
                return { label: "Biến thể tương đương (It's about/high time)", en: alt };
            }

            return {
                label: "Biến thể giao tiếp linh hoạt (Alternative)",
                en: casual.replace(/\babout\b/i, "roughly").replace(/\ba lot of\b/i, "plenty of")
            };
        }

        function autoFillAlternativeForModal(mode = 'edit') {
            const isEdit = mode === 'edit';
            const casualEl = document.getElementById(isEdit ? 'edit-sit-casual' : 'sit-casual-input');
            const structEl = document.getElementById(isEdit ? 'edit-sit-struct-id' : 'sit-struct-select');
            const targetTextarea = document.getElementById(isEdit ? 'edit-sit-alternatives' : 'sit-alternatives-input');

            const casualText = casualEl ? casualEl.value.trim() : '';
            if (!casualText) {
                showToast("Hãy nhập câu Đáp án Tiếng Anh chuẩn (Casual) ở trên trước khi bấm tự điền nhé!", "warning");
                casualEl?.focus();
                return;
            }

            const structId = structEl ? structEl.value : '';
            const generated = buildAdminStructuralVariation(casualText, structId);
            const newLine = `${generated.label}: ${generated.en}`;

            if (targetTextarea.value.trim() && !targetTextarea.value.includes(generated.en)) {
                targetTextarea.value = targetTextarea.value.trim() + "\n" + newLine;
            } else {
                targetTextarea.value = newLine;
            }
            showToast("✨ Đã tự điền câu diễn đạt tương tự! Bạn có thể chỉnh sửa thoải mái trước khi Lưu.", "success");
        }

        function parseCustomAlternativesText(rawText) {
            if (!rawText || !rawText.trim()) return [];
            return rawText
                .split(/\n+/)
                .map(line => line.trim())
                .filter(Boolean)
                .map((line, idx) => {
                    const colonIdx = line.indexOf(':');
                    if (colonIdx > 0 && colonIdx < 55) {
                        const label = line.slice(0, colonIdx).trim();
                        const en = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
                        return { label: label || `Cách diễn đạt tương tự #${idx + 1}`, en, speakable: en };
                    }
                    const cleanEn = line.replace(/^["']|["']$/g, '');
                    return { label: "Biến thể tương đương (Alternative)", en: cleanEn, speakable: cleanEn };
                })
                .filter(item => item.en.length > 0);
        }

        function formatCustomAlternativesToText(alternativesArr) {
            if (!Array.isArray(alternativesArr) || alternativesArr.length === 0) return "";
            return alternativesArr
                .map(item => `${item.label || 'Biến thể tương đương'}: ${item.en || ''}`)
                .join("\n");
        }

    // ✅ ĐOẠN CODE MỚI THAY THẾ CHO BƯỚC 1:
        // ==================== BỘ SINH MÃ ĐỊNH DANH (ID) CHUẨN QUY TẮC & CHỐNG TRÙNG ====================
        function makeCleanSlug(text, maxWords = 3) {
            if (!text) return "item";
            const stopWords = new Set(["it", "is", "are", "was", "were", "to", "the", "a", "an", "in", "on", "of", "for", "and", "or", "s", "v", "inf", "ed", "ing", "someone", "something", "time"]);
            const words = text
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 1 && !stopWords.has(w));
            const selected = (words.length > 0 ? words : ["custom"]).slice(0, maxWords);
            return selected.join('_');
        }

        // Sinh ID cấu trúc chuẩn: struct_[tên_ngắn]_[cấp_độ] (VD: struct_high_time_b1)
        function generateStandardStructureId(shortName, level = "B1") {
            const slug = makeCleanSlug(shortName, 2);
            const lvl = (level || "B1").toLowerCase();
            const baseId = `struct_${slug}_${lvl}`;
            const existingIds = new Set(getMergedStructures().map(s => s.id));
            if (!existingIds.has(baseId)) return baseId;
            let counter = 2;
            while (existingIds.has(`${baseId}_${counter}`)) counter++;
            return `${baseId}_${counter}`;
        }

        // Sinh ID tình huống chuẩn: sit_[mã_cấu_trúc_rút_gọn]_[số_thứ_tự] (VD: sit_high_time_b1_01)
        function generateStandardSituationId(structId, sitOrderNumber) {
            const coreCode = structId.replace(/^struct_/, '');
            const allSits = [];
            getMergedStructures().forEach(st => st.situations.forEach(s => allSits.push(s.id)));
            const existingSitIds = new Set(allSits);

            let num = sitOrderNumber;
            let candidate = `sit_${coreCode}_${String(num).padStart(2, '0')}`;
            while (existingSitIds.has(candidate)) {
                num++;
                candidate = `sit_${coreCode}_${String(num).padStart(2, '0')}`;
            }
            return candidate;
        }

        function handleSaveSituation(e) {
            e.preventDefault();
            const highestSim = runRealtimeDuplicateScan();
            if (highestSim >= 85) {
                showToast("Không thể lưu vì câu này trùng lặp trên 85% với câu đã có!", "warning");
                return;
            }

            const structId = document.getElementById('sit-struct-select').value;
            if (!structId) {
                showToast("Kho đang trống! Hãy sang Tab 2 để tạo ít nhất 1 cấu trúc trước khi thêm tình huống nhé.", "warning");
                return;
            }
            const level = document.getElementById('sit-level-select').value;
            const context = document.getElementById('sit-context-input').value.trim();
            const vi = document.getElementById('sit-vi-input').value.trim();
            const sampleCasual = document.getElementById('sit-casual-input').value.trim();
            const sampleFormal = document.getElementById('sit-formal-input').value.trim() || sampleCasual;

            const rawKeywords = document.getElementById('sit-keywords-input').value.trim();
            const keywords = rawKeywords
                ? rawKeywords.split(',').map(k => k.trim()).filter(Boolean)
                : normalizeAndTokenize(sampleCasual, true).slice(0, 5);

            const rawHints = document.getElementById('sit-hints-input').value.trim();
            const hints = rawHints
                ? rawHints.split(',').map(pair => {
                    const [en, viMean] = pair.split(':').map(s => (s || '').trim());
                    return { en: en || "keyword", vi: viMean || "từ gợi ý" };
                })
                : [{ en: keywords.slice(0, 2).join(' '), vi: "cụm từ gợi ý" }];

            // Tạo ID tình huống chuẩn theo thứ tự câu (không dùng Date.now nữa)
            const currentStruct = getMergedStructures().find(s => s.id === structId);
            const nextOrder = currentStruct ? currentStruct.situations.length + 1 : 1;
            const newSitId = generateStandardSituationId(structId, nextOrder);

            const sitTopic = normalizeAdminTopic(document.getElementById('sit-topic-select')?.value, currentStruct?.topics);
            const newSit = {
                id: newSitId,
                context,
                level,
                topic: sitTopic,
                vi,
                hints,
                sampleCasual,
                sampleFormal,
                ipa: document.getElementById('sit-ipa-input').value.trim(),
                grammarHint: document.getElementById('sit-grammar-input').value.trim(),
                alternatives: parseCustomAlternativesText(document.getElementById('sit-alternatives-input')?.value || ''),
                keywords,
                isCustomAdded: true
            };

            if (!customSituationsMap[structId]) customSituationsMap[structId] = [];
            customSituationsMap[structId].push(newSit);
            localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));

            clearSituationForm();
            refreshAdminStatsAndSelects();
            showToast(`Đã lưu tình huống mới (Mã: ${newSitId}) và đồng bộ sang trang Học viên!`, "success");
        }    

        // ==================== KIỂM TRA TRÙNG LẶP CẤU TRÚC (3 LỚP: TÊN, CÔNG THỨC, TỪ KHÓA) ====================
        function checkStructureFormulaDuplicate() {
            const title = document.getElementById('new-struct-title').value.trim();
            const formula = document.getElementById('new-struct-formula').value.trim();
            const rawPatterns = document.getElementById('new-struct-patterns').value.trim();
            const warnEl = document.getElementById('struct-dup-warning');

            const inputPatterns = rawPatterns
                .toLowerCase()
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const allStructs = getMergedStructures();
            const matches = [];

            allStructs.forEach(st => {
                const titleSim = computeTextSimilarityPercent(title, st.title).score;
                const formulaSim = computeTextSimilarityPercent(formula, st.formula).score;

                // Kiểm tra trùng Từ khóa nhận diện (requiredPatterns)
                const existingPatterns = (st.requiredPatterns || [st.shortName]).map(p => p.toLowerCase());
                let patternOverlapScore = 0;
                const sharedPatterns = [];

                if (inputPatterns.length > 0 && existingPatterns.length > 0) {
                    inputPatterns.forEach(ip => {
                        if (existingPatterns.some(ep => ep.includes(ip) || ip.includes(ep))) {
                            sharedPatterns.push(ip);
                        }
                    });
                    if (sharedPatterns.length > 0) {
                        patternOverlapScore = Math.min(95, Math.round((sharedPatterns.length / Math.min(inputPatterns.length, existingPatterns.length)) * 85));
                    }
                }

                const maxScore = Math.max(titleSim, formulaSim, patternOverlapScore);
                if (maxScore >= 20) {
                    matches.push({
                        number: st.number,
                        title: st.title,
                        formula: st.formula,
                        titleSim,
                        formulaSim,
                        patternOverlapScore,
                        sharedPatterns,
                        maxScore
                    });
                }
            });

            matches.sort((a, b) => b.maxScore - a.maxScore);
            const topMatches = matches.slice(0, 2);
            const highestScore = topMatches.length > 0 ? topMatches[0].maxScore : 0;

            updateStructureDuplicateRadarUI(highestScore, topMatches, warnEl);
            return highestScore;
        }

        function updateStructureDuplicateRadarUI(highestScore, topMatches, warnEl) {
            const badge = document.getElementById('struct-sim-badge');
            const bar = document.getElementById('struct-sim-bar');
            const msg = document.getElementById('struct-sim-msg');
            const iconBox = document.getElementById('struct-radar-icon');
            const listEl = document.getElementById('struct-matches-list');
            const saveBtn = document.getElementById('save-struct-btn');

            if (!badge || !bar) return;

            bar.style.width = `${highestScore}%`;
            badge.innerText = `${highestScore}% trùng`;

            if (highestScore >= 80) {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-rose-100 text-rose-800";
                bar.className = "h-full bg-rose-600 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-ban"></i>`;
                msg.className = "text-xs font-bold text-rose-600 pt-1";
                msg.innerText = `⛔ CẤU TRÚC ĐÃ TỒN TẠI (${highestScore}%): Cấu trúc hoặc từ khóa nhận diện này đã có trong thư viện. Bạn nên thêm câu mới vào cấu trúc cũ thay vì tạo mới!`;
                warnEl.classList.remove('hidden');
                warnEl.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i>Trùng ${highestScore}% với Cấu trúc #${topMatches[0].number} ("${topMatches[0].title}")!`;
                saveBtn.disabled = true;
                saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (highestScore >= 60) {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-amber-100 text-amber-800";
                bar.className = "h-full bg-amber-500 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
                msg.className = "text-xs font-bold text-amber-700 pt-1";
                msg.innerText = `⚠️ CẤU TRÚC HỌ HÀNG (${highestScore}%): Có nét tương đồng với cấu trúc đã có. Hãy kiểm tra kỹ xem có nên tách riêng không nhé.`;
                warnEl.classList.remove('hidden');
                warnEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i>Tương đồng ${highestScore}% với Cấu trúc #${topMatches[0].number}.`;
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                badge.className = "px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800";
                bar.className = "h-full bg-emerald-500 rounded-full transition-all duration-300";
                iconBox.className = "w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg";
                iconBox.innerHTML = `<i class="fa-solid fa-cubes-stacked"></i>`;
                msg.className = "text-xs font-semibold text-emerald-700 pt-1";
                msg.innerText = highestScore === 0
                    ? "Nhập thông tin cấu trúc để hệ thống quét đối chiếu tự động."
                    : `✅ CẤU TRÚC MỚI AN TOÀN (${highestScore}%): Không bị trùng với các cấu trúc đã có trong kho. Bạn có thể bấm Lưu ngay!`;
                warnEl.classList.add('hidden');
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            if (topMatches.length === 0) {
                listEl.innerHTML = `
                    <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 text-center text-xs font-semibold text-emerald-800">
                        <i class="fa-solid fa-check-circle mr-1"></i>Hoàn toàn khác biệt (0% trùng) — Sẵn sàng lưu cấu trúc mới!
                    </div>
                `;
                return;
            }

            listEl.innerHTML = topMatches.map(m => `
                <div class="p-3.5 rounded-2xl border ${m.maxScore >= 80 ? 'border-rose-300 bg-rose-50/60' : m.maxScore >= 60 ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50'} space-y-1 text-xs">
                    <div class="flex items-center justify-between gap-2">
                        <span class="font-extrabold text-indigo-700">Cấu trúc #${m.number}: ${m.title}</span>
                        <span class="px-2 py-0.5 rounded-md font-extrabold text-[11px] ${m.maxScore >= 80 ? 'bg-rose-600 text-white' : m.maxScore >= 60 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}">
                            Giống ${m.maxScore}%
                        </span>
                    </div>
                    <p class="font-mono text-[11px] text-slate-600">${m.formula}</p>
                    <p class="text-[11px] text-slate-500">
                        Tên: <strong>${m.titleSim}%</strong> • Công thức: <strong>${m.formulaSim}%</strong> • Từ khóa: <strong>${m.patternOverlapScore}%</strong>
                    </p>
                </div>
            `).join('');
        }

        function fillSampleDuplicateStructureTest() {
            document.getElementById('new-struct-title').value = "It takes / It took + someone + time + to V (Mất bao lâu để làm gì)";
            document.getElementById('new-struct-short').value = "It takes + time + to V";
            document.getElementById('new-struct-formula').value = "It takes / took / will take + (someone) + [time] + to V-inf";
            document.getElementById('new-struct-patterns').value = "take, took, taking";
            document.getElementById('new-struct-desc').value = "Diễn tả thời gian cần thiết để hoàn thành một việc.";
            checkStructureFormulaDuplicate();
            showToast("Đã nạp thử một cấu trúc bị trùng với Cấu trúc #1! Xem cảnh báo đỏ ở cột bên phải.", "warning");
        }

        // Biến tạm lưu 10 tình huống do AI hoặc bộ Generator tạo cho cấu trúc mới
        // ==================== MA TRẬN SƯ PHẠM A1–B1 & BỘ SINH AI 2 ĐỢT (10 / 15 CÂU) ====================
        let draftTenSituations = [];
        let draftStructTips = [];

        function getTargetSituationCount() {
            const val = parseInt(document.getElementById('new-struct-count')?.value || '15', 10);
            return val === 10 ? 10 : 15;
        }

        function updateMatrixPreviewBanner() {
            const count = getTargetSituationCount();
            const floorChoice = document.getElementById('new-struct-level')?.value || 'auto';
            const stageChoice = document.getElementById('new-struct-stage')?.value || 'auto';
            const targetCountEl = document.getElementById('preview-target-count');
            const aiLabelEl = document.getElementById('ai-gen-struct-label');
            const saveLabelEl = document.getElementById('save-struct-label');
            const modePillEl = document.getElementById('matrix-mode-pill');
            const summaryEl = document.getElementById('pedagogy-matrix-summary');

            const hasFixedStage = stageChoice !== 'auto';
            const bounds = hasFixedStage ? getStageCefrBounds(stageChoice, floorChoice) : null;
            const maxLvl = bounds ? bounds.maxLevel : (floorChoice === 'B2' ? 'B2' : 'B1');
            const rangeBadge = bounds ? bounds.rangeLabel : 'Tự động khóa trần theo Chặng';

            if (targetCountEl) targetCountEl.innerText = String(count);
            if (aiLabelEl) aiLabelEl.innerText = `Nhờ AI tự điền & Tạo sẵn ${count} câu`;
            if (saveLabelEl) saveLabelEl.innerText = `Lưu Cấu trúc mới (Đủ ${count} câu)`;
            if (modePillEl) {
                modePillEl.innerText = hasFixedStage
                    ? `🔒 Khóa trần ${bounds.rangeLabel} (${getAdminStageInfo(stageChoice).shortTitle}) • ${count === 15 ? '2 đợt AI' : '1 đợt AI'}`
                    : (count === 15 ? '2 đợt AI (8 + 7 câu) • Tự khóa trần theo Chặng' : '1 đợt AI (10 câu) • Tự khóa trần theo Chặng');
            }

            if (summaryEl) {
                const is15 = count === 15;
                let part1Desc, part2Desc, part3Title, part3Desc;
                if (maxLvl === 'A1') {
                    part1Desc = `Khẳng định siêu ngắn 5–8 từ • Thuần A1`;
                    part2Desc = `Phủ định (-) & Câu hỏi (?) • 6–10 từ (A1)`;
                    part3Title = `3. Ứng dụng A1 (${is15 ? 'Câu 11–15' : 'Câu 8–10'})`;
                    part3Desc = `Đời sống/quán xá/giới thiệu • 8–12 từ (KHÔNG lên A2/B1)`;
                } else if (maxLvl === 'A2') {
                    part1Desc = `Khẳng định ngắn 6–10 từ • ${rangeBadge}`;
                    part2Desc = `Phủ định (-) & Câu hỏi (?) • 8–12 từ (${maxLvl})`;
                    part3Title = `3. Ứng dụng A2 (${is15 ? 'Câu 11–15' : 'Câu 8–10'})`;
                    part3Desc = `Giao tiếp/du lịch/công việc nhẹ • 10–14 từ (KHÔNG lên B1)`;
                } else {
                    part1Desc = `Khẳng định rõ ý 8–11 từ • ${rangeBadge}`;
                    part2Desc = `Phủ định (-) & Câu hỏi (?) • Đổi chủ ngữ (${maxLvl})`;
                    part3Title = `3. Ứng dụng ${maxLvl} (${is15 ? 'Câu 11–15' : 'Câu 8–10'})`;
                    part3Desc = `Công sở • Câu 2 vế có lý do/thời gian (11–17 từ)`;
                }

                summaryEl.innerHTML = `
                    <div class="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900">
                        <div class="font-extrabold">1. Làm quen (${is15 ? 'Câu 1–5' : 'Câu 1–3'})</div>
                        <div class="text-emerald-700/90">${part1Desc}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-sky-50/90 border border-sky-200/80 text-sky-900">
                        <div class="font-extrabold">2. Phản xạ (${is15 ? 'Câu 6–10' : 'Câu 4–7'})</div>
                        <div class="text-sky-700/90">${part2Desc}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900">
                        <div class="font-extrabold">${part3Title}</div>
                        <div class="text-amber-800/90">${part3Desc}</div>
                    </div>
                `;
            }
        }

        function setAiBatchProgress(visible, text = '') {
            const banner = document.getElementById('ai-batch-progress-banner');
            const txt = document.getElementById('ai-batch-progress-text');
            if (!banner) return;
            if (visible) {
                banner.classList.remove('hidden');
                if (txt) txt.innerText = text;
            } else {
                banner.classList.add('hidden');
            }
        }

        // Bộ sinh dự phòng (Offline) chuẩn A1–B1 hỗ trợ đủ 10 hoặc 15 câu theo 3 chặng nhỏ
        function buildTenSituationsPack(shortName, formula, requiredPatterns, baseLevel = "B1", targetCount = 15) {
            const lower = (`${shortName} ${formula}`).toLowerCase();
            const firstPat = (requiredPatterns && requiredPatterns[0]) ? requiredPatterns[0] : shortName;
            const safeBase = ['A1', 'A2', 'B1', 'B2'].includes(baseLevel) ? baseLevel : 'B1';

            const generic15 = [
                // Chặng 1: Làm quen (Câu 1-5)
                { stageTag: "Chặng 1: Làm quen", cefrReason: "Câu khẳng định ngắn, đời sống quen thuộc", context: "Tình huống 1/15 • Chặng 1: Làm quen (Đời sống)", level: safeBase === 'B1' ? 'B1' : (safeBase === 'A2' ? 'A2' : 'A1'), vi: `Áp dụng ${shortName} trong thói quen buổi sáng hàng ngày.`, en: `${firstPat} helps me start my morning simply.` },
                { stageTag: "Chặng 1: Làm quen", cefrReason: "Câu đơn ngắn gọn, từ vựng ăn uống cơ bản", context: "Tình huống 2/15 • Chặng 1: Làm quen (Ăn uống)", level: safeBase === 'B1' ? 'B1' : (safeBase === 'A2' ? 'A2' : 'A1'), vi: `Áp dụng ${shortName} khi nói chuyện ăn uống với gia đình.`, en: `At dinner, ${firstPat} is very easy to use.` },
                { stageTag: "Chặng 1: Làm quen", cefrReason: "Câu khẳng định cơ bản về đi lại", context: "Tình huống 3/15 • Chặng 1: Làm quen (Đi lại)", level: safeBase === 'B1' ? 'B1' : (safeBase === 'A2' ? 'A2' : 'A1'), vi: `Áp dụng ${shortName} khi nói về việc đi làm mỗi ngày.`, en: `Every morning, ${firstPat} saves me a lot of time.` },
                { stageTag: "Chặng 1: Làm quen", cefrReason: "Câu khẳng định đơn giản về sở thích cuối tuần", context: "Tình huống 4/15 • Chặng 1: Làm quen (Cuối tuần)", level: safeBase === 'B1' ? 'B1' : 'A2', vi: `Áp dụng ${shortName} khi kể về kế hoạch cuối tuần ở nhà.`, en: `On weekends, ${firstPat} makes my day much better.` },
                { stageTag: "Chặng 1: Làm quen", cefrReason: "Câu khẳng định ngắn giao tiếp với bạn thân", context: "Tình huống 5/15 • Chặng 1: Làm quen (Bạn bè)", level: safeBase === 'B1' ? 'B1' : 'A2', vi: `Áp dụng ${shortName} khi rủ bạn bè đi uống cà phê.`, en: `With close friends, ${firstPat} sounds very natural.` },
                // Chặng 2: Phản xạ (Câu 6-10)
                { stageTag: "Chặng 2: Phản xạ", cefrReason: "Câu phủ định (-) từ chối lịch sự", context: "Tình huống 6/15 • Chặng 2: Phản xạ (Phủ định)", level: safeBase === 'B1' ? 'B1' : 'A2', vi: `Diễn đạt ý phủ định với ${shortName} khi không muốn ra ngoài tối nay.`, en: `Tonight, I would not ignore ${firstPat} when staying home.` },
                { stageTag: "Chặng 2: Phản xạ", cefrReason: "Câu hỏi (?) giao tiếp thực tế", context: "Tình huống 7/15 • Chặng 2: Phản xạ (Câu hỏi)", level: safeBase === 'B1' ? 'B1' : 'A2', vi: `Đặt câu hỏi trực tiếp sử dụng ${shortName} cho người đối diện?`, en: `Do you think ${firstPat} works well in this case?` },
                { stageTag: "Chặng 2: Phản xạ", cefrReason: "Đổi chủ ngữ ngôi thứ 3 (anh ấy/cô ấy)", context: "Tình huống 8/15 • Chặng 2: Phản xạ (Đổi chủ ngữ)", level: "A2", vi: `Cô ấy áp dụng ${shortName} khi mua sắm cùng bạn bè.`, en: `She uses ${firstPat} whenever she goes shopping with friends.` },
                { stageTag: "Chặng 2: Phản xạ", cefrReason: "Ngữ cảnh du lịch / hỏi đường", context: "Tình huống 9/15 • Chặng 2: Phản xạ (Du lịch)", level: "A2", vi: `Áp dụng ${shortName} khi hỏi thông tin ở khách sạn hoặc sân bay.`, en: `When traveling abroad, ${firstPat} is really helpful at the hotel.` },
                { stageTag: "Chặng 2: Phản xạ", cefrReason: "Câu hỏi lịch sự khi đặt lịch hẹn", context: "Tình huống 10/15 • Chặng 2: Phản xạ (Lịch hẹn)", level: "B1", vi: `Áp dụng ${shortName} khi hỏi lịch rảnh vào cuối tuần này?`, en: `Could we use ${firstPat} to plan our schedule this weekend?` },
                // Chặng 3: Ứng dụng B1 (Câu 11-15)
                { stageTag: "Chặng 3: Ứng dụng B1", cefrReason: "Ngữ cảnh công sở kết hợp lý do (because)", context: "Tình huống 11/15 • Chặng 3: Ứng dụng B1 (Công sở)", level: "B1", vi: `Áp dụng ${shortName} trong cuộc họp nhóm vì chúng ta cần tiết kiệm thời gian.`, en: `In our team meeting, ${firstPat} helps a lot because we need to save time.` },
                { stageTag: "Chặng 3: Ứng dụng B1", cefrReason: "Câu 2 vế chỉ mốc thời gian (before)", context: "Tình huống 12/15 • Chặng 3: Ứng dụng B1 (Deadline)", level: "B1", vi: `Áp dụng ${shortName} trước khi gửi báo cáo cho quản lý vào chiều nay.`, en: `We should apply ${firstPat} before sending the report to our manager this afternoon.` },
                { stageTag: "Chặng 3: Ứng dụng B1", cefrReason: "Giao tiếp lịch sự với khách hàng", context: "Tình huống 13/15 • Chặng 3: Ứng dụng B1 (Khách hàng)", level: "B1", vi: `Áp dụng ${shortName} khi giải thích phương án tốt hơn cho khách hàng.`, en: `When talking to clients, ${firstPat} makes our explanation clearer and more polite.` },
                { stageTag: "Chặng 3: Ứng dụng B1", cefrReason: "Câu ghép có mục đích (so that)", context: "Tình huống 14/15 • Chặng 3: Ứng dụng B1 (Kế hoạch)", level: "B1", vi: `Áp dụng ${shortName} để cả nhóm có thể hoàn thành công việc đúng hạn.`, en: `Let's use ${firstPat} so that our team can finish the project on time.` },
                { stageTag: "Chặng 3: Ứng dụng B1", cefrReason: "Tổng hợp B1 thực chiến 2 mệnh đề", context: "Tình huống 15/15 • Chặng 3: Ứng dụng B1 (Tổng hợp)", level: "B1", vi: `Áp dụng ${shortName} khi đưa ra lựa chọn hợp lý nhất cho công việc hiện tại.`, en: `In daily work, ${firstPat} helps us choose the most practical option right now.` }
            ];

            const sliced = targetCount === 10
                ? [...generic15.slice(0, 3), ...generic15.slice(5, 9), ...generic15.slice(10, 13)]
                : generic15.slice(0, targetCount);

            return sliced.map((c, idx) => ({
                context: c.context.replace(/Tình huống \d+\/\d+/, `Tình huống ${idx + 1}/${sliced.length}`),
                stageTag: c.stageTag,
                cefrReason: c.cefrReason,
                level: c.level,
                vi: c.vi,
                hints: [{ en: firstPat, vi: shortName }],
                sampleCasual: c.en,
                sampleFormal: c.en,
                keywords: requiredPatterns.length > 0 ? requiredPatterns : [firstPat]
            }));
        }

        function renderDraftSituationsPreview(situations) {
            const countEl = document.getElementById('preview-10-count');
            const targetEl = document.getElementById('preview-target-count');
            const box = document.getElementById('new-struct-situations-preview');
            if (!box) return;
            if (countEl) countEl.innerText = situations.length;
            if (targetEl) targetEl.innerText = String(Math.max(situations.length, getTargetSituationCount()));

            if (!situations || situations.length === 0) {
                box.innerHTML = `
                    <div class="p-3 rounded-xl bg-white border border-slate-200/80 text-slate-500">
                        Nhập tên cấu trúc (VD: <strong>Would rather + V than + V</strong>) rồi bấm <strong>"Nhờ AI tự điền & Tạo sẵn ${getTargetSituationCount()} câu"</strong>. Hệ thống sẽ tự xếp Chặng (1–8), gắn Chủ đề cho từng câu và hiển thị bản xem trước tại đây.
                    </div>
                `;
                return;
            }

            box.innerHTML = situations.map((s, idx) => {
                const stTag = s.stageTag || (idx < 5 ? 'Chặng 1: Làm quen' : (idx < 10 ? 'Chặng 2: Phản xạ' : 'Chặng 3: Ứng dụng B1'));
                const stageBadgeColor = stTag.includes('Chặng 1')
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : (stTag.includes('Chặng 2') ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-800 border-amber-200');
                const topicName = ADMIN_TOPIC_LABELS[normalizeAdminTopic(s.topic)] || 'Hàng ngày';
                return `
                <div class="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1 space-y-0.5">
                        <div class="flex flex-wrap items-center gap-1.5">
                            <span class="font-extrabold text-indigo-600">#${idx + 1}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800">${escapeAdminHtml(s.level || 'B1')}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border ${stageBadgeColor}">${escapeAdminHtml(stTag)}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600"><i class="fa-solid fa-tag mr-0.5 text-indigo-400"></i>${escapeAdminHtml(topicName)}</span>
                        </div>
                        <p class="font-bold text-slate-800">"${escapeAdminHtml(s.vi)}"</p>
                        <p class="text-[11px] text-slate-600 font-medium">${escapeAdminHtml(s.sampleCasual)}</p>
                        ${s.ipa ? `<p class="text-[10px] font-mono text-indigo-500">${escapeAdminHtml(s.ipa)}</p>` : ''}
                        ${s.cefrReason ? `<p class="text-[10px] text-slate-400 italic"><i class="fa-solid fa-circle-info mr-1"></i>Lý do ${escapeAdminHtml(s.level || 'B1')}: ${escapeAdminHtml(s.cefrReason)}</p>` : ''}
                    </div>
                    <span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold shrink-0">Sẵn sàng</span>
                </div>
            `}).join('');
        }

        function getSituationItemSchema() {
            return {
                type: "OBJECT",
                properties: {
                    context: { type: "STRING" },
                    stageTag: { type: "STRING" },
                    level: { type: "STRING" },
                    topic: { type: "STRING" },
                    cefrReason: { type: "STRING" },
                    vi: { type: "STRING" },
                    sampleCasual: { type: "STRING" },
                    sampleFormal: { type: "STRING" },
                    alternatives: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: { label: { type: "STRING" }, en: { type: "STRING" } },
                            required: ["label", "en"]
                        }
                    },
                    ipa: { type: "STRING" },
                    grammarHint: { type: "STRING" },
                    keywords: { type: "ARRAY", items: { type: "STRING" } },
                    hints: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: { en: { type: "STRING" }, vi: { type: "STRING" } },
                            required: ["en", "vi"]
                        }
                    }
                },
                required: ["context", "stageTag", "level", "topic", "cefrReason", "vi", "sampleCasual", "sampleFormal", "ipa", "grammarHint", "keywords", "hints"]
            };
        }

        function sanitizeGeneratedSituation(s, orderNum, totalCount, minLevel, maxLevel, fallbackTopics = ['daily']) {
            const minIdx = Math.max(0, CEFR_RANK_LIST.indexOf(minLevel));
            const maxIdx = Math.max(minIdx, CEFR_RANK_LIST.indexOf(maxLevel));
            let lvl = (s.level || '').toUpperCase().trim();
            let lvlIdx = CEFR_RANK_LIST.indexOf(lvl);
            if (lvlIdx === -1) {
                lvlIdx = maxIdx;
            } else if (lvlIdx < minIdx) {
                lvlIdx = minIdx;
            } else if (lvlIdx > maxIdx) {
                lvlIdx = maxIdx;
            }
            lvl = CEFR_RANK_LIST[lvlIdx];

            const cleanCtx = (s.context || '').replace(/^Tình huống\s+\d+(?:\s*\/\s*\d+)?/i, `Tình huống ${orderNum}/${totalCount}`);
            return {
                ...s,
                level: lvl,
                topic: normalizeAdminTopic(s.topic, fallbackTopics),
                context: /^Tình huống/i.test(cleanCtx) ? cleanCtx : `Tình huống ${orderNum}/${totalCount} • ${cleanCtx || s.stageTag || 'Thực hành'}`,
                alternatives: Array.isArray(s.alternatives)
                    ? s.alternatives.filter(a => a && a.en).map(a => ({ label: a.label || 'Biến thể tương đương', en: a.en, speakable: a.en }))
                    : []
            };
        }

        function buildStagePedagogyInstructions(bounds, isTwoBatch, batchNumber, countInBatch) {
            const { minLevel, maxLevel, allowedLevels } = bounds;
            const allowedStr = allowedLevels.map(x => `"${x}"`).join(', ');

            if (maxLevel === 'A1') {
                if (batchNumber === 1) {
                    return isTwoBatch
                        ? `- Câu 1–5 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định siêu ngắn gọn (5–8 từ), từ vựng A1 cơ bản (tên, nghề nghiệp, gia đình, đồ vật, thói quen). BẮT BUỘC level = "A1".
- Câu 6–8 (stageTag: "Chặng 2: Phản xạ"): Trộn câu phủ định (-) và câu hỏi (?), đổi chủ ngữ (anh ấy/cô ấy/chúng tôi/họ), độ dài 6–10 từ, từ vựng A1 quen thuộc. BẮT BUỘC level = "A1".`
                        : `- Câu 1–3 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định siêu ngắn (5–8 từ), từ vựng A1 cơ bản, level = "A1".
- Câu 4–7 (stageTag: "Chặng 2: Phản xạ"): Phủ định (-) và câu hỏi (?), đổi chủ ngữ, 6–10 từ, level = "A1".
- Câu 8–10 (stageTag: "Chặng 3: Ứng dụng A1"): Tình huống giao tiếp đời sống/quán cà phê/giới thiệu công việc đơn giản (8–12 từ), KHÔNG dùng câu ghép phức tạp hay từ vựng B1, level = "A1".`;
                }
                return `- 2 câu đầu (stageTag: "Chặng 2: Phản xạ"): Câu hỏi (?) hoặc câu phủ định (-) ở ngữ cảnh đời sống / ăn uống / mua sắm mới (6–10 từ), BẮT BUỘC level = "A1".
- ${Math.max(1, countInBatch - 2)} câu cuối (stageTag: "Chặng 3: Ứng dụng A1"): Giao tiếp thực tế gần gũi (quán cà phê, mua sắm, hỏi thăm bạn mới, giới thiệu đồng nghiệp cơ bản), độ dài 8–12 từ, từ vựng hoàn toàn dễ hiểu cho người mới bắt đầu. TUYỆT ĐỐI KHÔNG dùng mệnh đề phức tạp hay từ vựng A2/B1. BẮT BUỘC level = "A1".`;
            }

            if (maxLevel === 'A2') {
                const startLvl = minLevel; // 'A1' (Chặng 3) hoặc 'A2' (Chặng 4-5)
                if (batchNumber === 1) {
                    return isTwoBatch
                        ? `- Câu 1–5 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định ngắn gọn (6–10 từ), ngữ cảnh đời sống quen thuộc. Bậc level chỉ trong [${allowedStr}] (ưu tiên "${startLvl}").
- Câu 6–8 (stageTag: "Chặng 2: Phản xạ"): Trộn câu phủ định (-) và câu hỏi (?), đổi chủ ngữ, độ dài 8–12 từ, ngữ cảnh bạn bè/mua sắm/du lịch. Bậc level = "A2".`
                        : `- Câu 1–3 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định ngắn (6–10 từ), bậc "${startLvl}".
- Câu 4–7 (stageTag: "Chặng 2: Phản xạ"): Phủ định (-) và câu hỏi (?), 8–12 từ, bậc "A2".
- Câu 8–10 (stageTag: "Chặng 3: Ứng dụng A2"): Ngữ cảnh du lịch, công việc nhẹ hoặc nối ý đơn giản với and/but/because (10–14 từ). TUYỆT ĐỐI KHÔNG vượt trần lên B1/C1, bậc = "A2".`;
                }
                return `- 2 câu đầu (stageTag: "Chặng 2: Phản xạ"): Câu hỏi (?) hoặc phủ định (-) ở ngữ cảnh mới (ăn uống, mua sắm, du lịch), 8–12 từ, level = "A2".
- ${Math.max(1, countInBatch - 2)} câu cuối (stageTag: "Chặng 3: Ứng dụng A2"): Ngữ cảnh đời sống, du lịch, học tập hoặc công sở mức sơ cấp, câu dài 10–14 từ, có thể nối ý đơn giản (and, but, because). TUYỆT ĐỐI KHÔNG vượt trần lên B1/B2/C1. Chỉ dùng level trong [${allowedStr}] (ưu tiên "A2").`;
            }

            // maxLevel === 'B1' (hoặc 'B2')
            if (batchNumber === 1) {
                return isTwoBatch
                    ? `- Câu 1–5 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định rõ ý (8–11 từ), ngữ cảnh đời sống/công việc quen thuộc. Bậc level trong [${allowedStr}] (ưu tiên "${minLevel}").
- Câu 6–8 (stageTag: "Chặng 2: Phản xạ"): Trộn câu phủ định (-) và câu hỏi (?), đổi chủ ngữ, ngữ cảnh bạn bè/du lịch/công việc. Bậc level trong [${allowedStr}].`
                    : `- Câu 1–3 (stageTag: "Chặng 1: Làm quen"): Câu khẳng định rõ ý (8–11 từ), bậc "${minLevel}".
- Câu 4–7 (stageTag: "Chặng 2: Phản xạ"): Phủ định (-) và câu hỏi (?), đổi chủ ngữ, bậc trong [${allowedStr}].
- Câu 8–10 (stageTag: "Chặng 3: Ứng dụng ${maxLevel}"): Ngữ cảnh công sở/phỏng vấn, câu 2 vế ngắn có lý do/thời gian (because, before, so that), bậc "${maxLevel}".`;
            }
            return `- 2 câu đầu (stageTag: "Chặng 2: Phản xạ"): Câu hỏi lịch sự (?) hoặc câu phủ định (-) ở ngữ cảnh mới (ăn uống, mua sắm, du lịch), bậc trong [${allowedStr}].
- ${Math.max(1, countInBatch - 2)} câu cuối (stageTag: "Chặng 3: Ứng dụng ${maxLevel}"): Ngữ cảnh công sở, email, trao đổi đồng nghiệp, phỏng vấn hoặc câu 2 vế ngắn có lý do/thời gian (because, before, after, so that, when), độ dài 11–17 từ, từ vựng thực chiến ${maxLevel}. TUYỆT ĐỐI KHÔNG sinh câu học thuật C1/C2.`;
        }

        async function autoGenerateStructureWithAI() {
            const rawTitle = document.getElementById('new-struct-title').value.trim();
            const titleInput = rawTitle || "Would rather + V than + V (Thích làm gì hơn làm gì)";
            const floorChoice = document.getElementById('new-struct-level')?.value || 'auto';
            const stageChoice = document.getElementById('new-struct-stage')?.value || 'auto';
            const targetCount = getTargetSituationCount();
            const btn = document.getElementById('ai-gen-struct-btn');
            const origHTML = btn.innerHTML;

            if (!getAdminGeminiKey()) {
                showToast('Chưa gắn khóa Gemini AI — hãy bấm nút "Gemini AI" ở góc trên bên phải để nhập khóa miễn phí!', 'warning');
                openAdminGeminiSettingsModal();
                return;
            }

            const preBounds = stageChoice !== 'auto'
                ? getStageCefrBounds(stageChoice, floorChoice)
                : { minLevel: (['A1', 'A2', 'B1', 'B2'].includes(floorChoice) ? floorChoice : 'A1'), maxLevel: (floorChoice === 'B2' ? 'B2' : 'B1'), allowedLevels: ['A1', 'A2', 'B1'], rangeLabel: 'Theo Chặng' };

            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang chạy AI (${targetCount} câu • ${preBounds.rangeLabel})...</span>`;

            const stagesGuideText = ROADMAP_STAGES.map(s => `- "${s.id}": ${s.title} [KHÓA TRẦN: ${s.minLevel === s.maxLevel ? 'Thuần ' + s.maxLevel : s.minLevel + '–' + s.maxLevel}] (${s.desc})`).join('\n');
            const stageRule = stageChoice === 'auto'
                ? `Chọn chính xác 1 mã "stageId" phù hợp nhất trong 8 chặng cố định sau và TUÂN THỦ NGHIÊM NGẶT KHÓA TRẦN CEFR của chính Chặng đã chọn:\n${stagesGuideText}`
                : `Bắt buộc trả về stageId = "${stageChoice}" (${getAdminStageInfo(stageChoice).title}).`;

            const ceilingRule = stageChoice !== 'auto'
                ? `QUY TẮC KHÓA TRẦN ĐỘ KHÓ BẮT BUỘC (${getAdminStageInfo(stageChoice).shortTitle}):
- Toàn bộ ${targetCount} câu CHỈ ĐƯỢC PHÉP nằm trong khung [${preBounds.allowedLevels.map(x => `"${x}"`).join(', ')}] (${preBounds.rangeLabel}).
- Mốc sàn: "${preBounds.minLevel}" | Trần tối đa: "${preBounds.maxLevel}".
- TUYỆT ĐỐI KHÔNG sinh câu vượt trần "${preBounds.maxLevel}" (ví dụ Chặng 1–2 thuần A1 thì KHÔNG ĐƯỢC sinh câu A2 hay B1; Chặng 4–5 thuần A2 thì KHÔNG ĐƯỢC sinh câu B1).`
                : `QUY TẮC KHÓA TRẦN ĐỘ KHÓ THEO CHẶNG:
- Sau khi chọn stageId phù hợp nhất (stage_1..stage_8), toàn bộ câu PHẢI tuân thủ đúng trần CEFR của chặng đó (stage_1 & stage_2: CHỈ A1; stage_3: A1–A2; stage_4 & stage_5: CHỈ A2; stage_6: A2–B1; stage_7 & stage_8: CHỈ B1). TUYỆT ĐỐI KHÔNG sinh C1/C2.`;

            let combinedSits = [];
            try {
                const isTwoBatch = targetCount === 15;
                const batch1Count = isTwoBatch ? 8 : 10;
                setAiBatchProgress(true, isTwoBatch
                    ? `Đợt 1/2: Gemini AI đang soạn ${batch1Count} câu đầu (Khóa trần ${preBounds.rangeLabel})...`
                    : `Đang soạn khung cấu trúc & trọn bộ 10 câu (Khóa trần ${preBounds.rangeLabel})...`);

                const batch1Matrix = buildStagePedagogyInstructions(preBounds, isTwoBatch, 1, batch1Count);

                const promptBatch1 = `Bạn là chuyên gia biên soạn giáo trình tiếng Anh phản xạ theo lộ trình Sơ đồ 8 Chặng A1–B1 cho người Việt mới học.
Hãy thiết kế bộ bài học cho cấu trúc: "${titleInput}".

QUY TẮC CHỌN CHẶNG (8 CHẶNG CỐ ĐỊNH):
${stageRule}

${ceilingRule}

QUY TẮC GẮN CHỦ ĐỀ (5 NHÓM CỐ ĐỊNH):
- Chỉ dùng các mã trong ["daily", "food_shop", "travel", "office", "interview"]:
  * "daily": Hàng ngày (gia đình, thói quen, bạn bè, giải trí, cảm xúc)
  * "food_shop": Ăn uống & Mua sắm (quán cà phê, nhà hàng, mua đồ, giá cả)
  * "travel": Du lịch & Di chuyển (giao thông, sân bay, kỳ nghỉ, hỏi đường)
  * "office": Công sở & Học tập (công việc, lịch hẹn, email, họp nhóm)
  * "interview": Phỏng vấn & Mục tiêu (giới thiệu bản thân, kỹ năng, thành tựu)
- Mỗi tình huống phải tự gán đúng 1 mã "topic" phản ánh đúng ngữ cảnh của câu đó.

MA TRẬN ${batch1Count} CÂU ĐỢT NÀY (tổng bộ sẽ có ${targetCount} câu):
${batch1Matrix}

YÊU CẦU TỪNG CÂU:
- Tiếng Việt thật tự nhiên, đời thường, không dịch máy.
- sampleCasual bắt buộc áp dụng đúng cấu trúc mục tiêu.
- requiredPatterns: liệt kê ĐÚNG các từ/dạng chia thực tế xuất hiện trong câu (VD: To be -> ["am","is","are","'m","'s","'re","isn't","aren't"]), KHÔNG ghi tên ngữ pháp chung chung.
- keywords: mảng 3–5 từ/cụm từ NGUYÊN TỪ bằng chữ thường xuất hiện chính xác trong sampleCasual.
- cefrReason: giải thích ngắn gọn (6–12 từ tiếng Việt) lý do phù hợp bậc CEFR của Chặng.
- ipa: phiên âm IPA Anh-Mỹ chuẩn cho sampleCasual đặt trong dấu /.../.`;

                const schemaBatch1 = {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        shortName: { type: "STRING" },
                        formula: { type: "STRING" },
                        stageId: { type: "STRING" },
                        floorLevel: { type: "STRING" },
                        topics: { type: "ARRAY", items: { type: "STRING" } },
                        description: { type: "STRING" },
                        tips: { type: "ARRAY", items: { type: "STRING" } },
                        requiredPatterns: { type: "ARRAY", items: { type: "STRING" } },
                        situations: {
                            type: "ARRAY",
                            items: getSituationItemSchema()
                        }
                    },
                    required: ["title", "shortName", "formula", "stageId", "floorLevel", "topics", "description", "tips", "requiredPatterns", "situations"]
                };

                const { parsed: p1, model } = await callAdminGeminiJSON(promptBatch1, schemaBatch1, null, null, (statusText) => {
                    setAiBatchProgress(true, `Đợt 1/${isTwoBatch ? 2 : 1}: ${statusText}`);
                });

                const detectedStageId = (stageChoice !== 'auto')
                    ? stageChoice
                    : resolveAdminStageId({ stageId: p1.stageId, level: p1.floorLevel });

                // Khóa chặt Sàn & Trần CEFR theo đúng Chặng đã chọn/xác định!
                const activeBounds = getStageCefrBounds(detectedStageId, floorChoice);
                const detectedFloor = activeBounds.minLevel;

                const normStructTopics = (Array.isArray(p1.topics) && p1.topics.length > 0)
                    ? Array.from(new Set(p1.topics.map(t => normalizeAdminTopic(t))))
                    : ['daily', 'office'];

                document.getElementById('new-struct-title').value = p1.title || titleInput;
                document.getElementById('new-struct-short').value = p1.shortName || titleInput.slice(0, 28);
                document.getElementById('new-struct-formula').value = p1.formula || '';
                document.getElementById('new-struct-desc').value = p1.description || '';
                document.getElementById('new-struct-patterns').value = (p1.requiredPatterns || []).join(', ');
                if (floorChoice === 'auto' && document.getElementById('new-struct-level')) {
                    document.getElementById('new-struct-level').value = detectedFloor;
                }
                if (document.getElementById('new-struct-stage')) {
                    document.getElementById('new-struct-stage').value = detectedStageId;
                }
                if (document.getElementById('new-struct-topics')) {
                    document.getElementById('new-struct-topics').value = normStructTopics.join(', ');
                }

                draftStructTips = Array.isArray(p1.tips) ? p1.tips.map(t => t.startsWith('•') ? t : `• ${t}`) : [];
                combinedSits = (Array.isArray(p1.situations) ? p1.situations.slice(0, batch1Count) : [])
                    .map((s, i) => sanitizeGeneratedSituation(s, i + 1, targetCount, activeBounds.minLevel, activeBounds.maxLevel, normStructTopics));

                draftTenSituations = [...combinedSits];
                renderDraftSituationsPreview(draftTenSituations);
                checkStructureFormulaDuplicate();

                // ĐỢT 2 (Chỉ chạy khi chọn 15 câu): Sinh nốt 7 câu cuối (#9–#15), CẤM TRÙNG và KHÓA TRẦN đúng theo Chặng
                if (isTwoBatch) {
                    const remainingNeed = targetCount - combinedSits.length;
                    setAiBatchProgress(true, `Đợt 2/2: Đã xong ${combinedSits.length} câu đầu. Đang soạn tiếp ${remainingNeed} câu (Khóa trần ${activeBounds.rangeLabel})...`);

                    const batch1Summary = combinedSits.map((s, idx) => `${idx + 1}. [${s.level} | ${s.topic}] ${s.vi} => ${s.sampleCasual}`).join('\n');
                    const batch2Matrix = buildStagePedagogyInstructions(activeBounds, true, 2, remainingNeed);

                    const promptBatch2 = `Bạn đang soạn TIẾP ĐỢT 2 (${remainingNeed} câu cuối: từ câu #${combinedSits.length + 1} đến #${targetCount}) cho cấu trúc:
- Tên cấu trúc: "${p1.title || titleInput}"
- Thuộc Chặng: ${getAdminStageInfo(detectedStageId).title}
- Công thức: "${p1.formula}"
- Từ khóa nhận diện: ${(p1.requiredPatterns || []).join(', ')}
- KHÓA TRẦN CEFR BẮT BUỘC: Chỉ dùng các bậc [${activeBounds.allowedLevels.map(x => `"${x}"`).join(', ')}] (${activeBounds.rangeLabel}). TUYỆT ĐỐI KHÔNG vượt quá bậc "${activeBounds.maxLevel}"!

DANH SÁCH ${combinedSits.length} CÂU ĐÃ SOẠN Ở ĐỢT 1 (TUYỆT ĐỐI KHÔNG LẶP Ý, KHÔNG LẶP NGỮ CẢNH):
${batch1Summary}

MA TRẬN ${remainingNeed} CÂU ĐỢT 2:
${batch2Matrix}

Mỗi câu trả về đủ: context, stageTag, level (chỉ trong [${activeBounds.allowedLevels.map(x => `"${x}"`).join(', ')}]), topic (chọn 1 mã trong ["daily", "food_shop", "travel", "office", "interview"]), cefrReason, vi, sampleCasual, sampleFormal, alternatives (1 câu), ipa, grammarHint, keywords (3–5 từ nguyên từ), hints (2–3 cụm).`;

                    const schemaBatch2 = {
                        type: "OBJECT",
                        properties: {
                            situations: {
                                type: "ARRAY",
                                items: getSituationItemSchema()
                            }
                        },
                        required: ["situations"]
                    };

                    const { parsed: p2 } = await callAdminGeminiJSON(promptBatch2, schemaBatch2, null, null, (statusText) => {
                        setAiBatchProgress(true, `Đợt 2/2: ${statusText}`);
                    });
                    const seenVi = new Set(combinedSits.map(s => normalizeViKeyForMerge(s.vi)));
                    const seenEn = new Set(combinedSits.map(s => normalizeViKeyForMerge(s.sampleCasual)));

                    if (Array.isArray(p2.situations)) {
                        p2.situations.forEach(rawSit => {
                            if (combinedSits.length >= targetCount) return;
                            const vk = normalizeViKeyForMerge(rawSit.vi);
                            const ek = normalizeViKeyForMerge(rawSit.sampleCasual);
                            if (!vk || seenVi.has(vk) || (ek && seenEn.has(ek))) return;
                            const orderNum = combinedSits.length + 1;
                            combinedSits.push(sanitizeGeneratedSituation(rawSit, orderNum, targetCount, activeBounds.minLevel, activeBounds.maxLevel, normStructTopics));
                            seenVi.add(vk);
                            if (ek) seenEn.add(ek);
                        });
                    }
                }

                // Cập nhật lại tổng hợp topics cấu trúc từ thực tế các câu vừa sinh
                const usedTopics = Array.from(new Set([...normStructTopics, ...combinedSits.map(s => s.topic)]));
                if (document.getElementById('new-struct-topics')) {
                    document.getElementById('new-struct-topics').value = usedTopics.join(', ');
                }

                draftTenSituations = combinedSits;
                renderDraftSituationsPreview(draftTenSituations);
                updateMatrixPreviewBanner();
                checkStructureFormulaDuplicate();
                const stgInfo = getAdminStageInfo(detectedStageId);
                showToast(`✨ Gemini AI (${model}) đã soạn trọn bộ ${draftTenSituations.length}/${targetCount} câu chuẩn ${activeBounds.rangeLabel} (${stgInfo.shortTitle})!`, "success");
            } catch (e) {
                const errMsg = e?.message || 'Lỗi mạng hoặc máy chủ Google đang quá tải tạm thời.';
                const box = document.getElementById('new-struct-situations-preview');
                if (combinedSits.length === 0) {
                    draftTenSituations = [];
                    const countEl = document.getElementById('preview-10-count');
                    if (countEl) countEl.innerText = '0';
                    if (box) {
                        box.innerHTML = `
                            <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2.5">
                                <p class="font-extrabold text-rose-800 flex items-center gap-1.5">
                                    <i class="fa-solid fa-triangle-exclamation text-rose-600"></i>
                                    Máy chủ Gemini AI đang bận hoặc gặp lỗi tạm thời
                                </p>
                                <p class="text-rose-700 leading-relaxed">${escapeAdminHtml(errMsg)}</p>
                                <p class="text-slate-600">Hệ thống đã tự thử lại và xoay các model dự phòng nhưng Google vẫn đang cao điểm. Để bảo vệ chất lượng kho bài, hệ thống <strong>không tự chèn câu mẫu Offline</strong>. Hãy chờ 15–20 giây rồi bấm thử lại nhé!</p>
                                <button type="button" onclick="autoGenerateStructureWithAI()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all">
                                    <i class="fa-solid fa-rotate-right"></i>
                                    <span>Thử gọi lại Gemini AI</span>
                                </button>
                            </div>
                        `;
                    }
                    showToast(`⚠️ Gemini AI đang quá tải tạm thời — chưa tạo câu mẫu rác. Hãy chờ 15–20 giây rồi bấm Thử gọi lại nhé!`, "warning");
                } else {
                    draftTenSituations = [...combinedSits];
                    renderDraftSituationsPreview(draftTenSituations);
                    showToast(`⚠️ Đã giữ lại ${combinedSits.length} câu sạch từ Đợt 1 (Đợt 2 bị quá tải: ${errMsg}). Bạn có thể Lưu luôn rồi bấm 'Bổ sung đủ 15 câu' ở Tab 3!`, "warning");
                }
            } finally {
                setAiBatchProgress(false);
                btn.disabled = false;
                btn.innerHTML = origHTML;
                updateMatrixPreviewBanner();
            }
        }

        function handleSaveStructure(e) {
            e.preventDefault();
            const highestDup = checkStructureFormulaDuplicate();
            if (highestDup >= 80) {
                showToast("Cấu trúc này bị trùng lặp trên 80% với cấu trúc đã có!", "warning");
                return;
            }

            const allStructs = getMergedStructures();
            const nextNum = allStructs.length + 1;

            const title = document.getElementById('new-struct-title').value.trim();
            const shortName = document.getElementById('new-struct-short').value.trim();
            const formula = document.getElementById('new-struct-formula').value.trim();
            const rawLvl = document.getElementById('new-struct-level').value;
            const level = ['A1', 'A2', 'B1', 'B2'].includes(rawLvl) ? rawLvl : 'B1';
            const description = document.getElementById('new-struct-desc').value.trim();
            const requiredPatterns = document.getElementById('new-struct-patterns').value.split(',').map(s => s.trim()).filter(Boolean);

            const newId = generateStandardStructureId(shortName, level);
            const coreCode = newId.replace(/^struct_/, '');

            const stageSelVal = document.getElementById('new-struct-stage')?.value || 'auto';
            const stageId = stageSelVal === 'auto' ? resolveAdminStageId({ level }) : stageSelVal;
            const stageInfo = getAdminStageInfo(stageId);

            // Tính thứ tự tiếp theo trong đúng Chặng được chọn
            const existingInStage = allStructs.filter(s => s.stageId === stageId);
            const orderInStage = existingInStage.length + 1;

            const topicsInputEl = document.getElementById('new-struct-topics');
            const rawTopics = (topicsInputEl && topicsInputEl.value.trim())
                ? topicsInputEl.value.split(',').map(s => normalizeAdminTopic(s)).filter(Boolean)
                : ['daily', 'office'];
            const topics = Array.from(new Set(rawTopics));

            // KHÔNG tự sinh câu Offline rác nếu chưa chạy AI -> Lưu khung sạch (0 câu) để người dùng chủ động thêm tay ở Tab 1 hoặc bấm AI bổ sung ở Tab 3
            const rawPack = (draftTenSituations && draftTenSituations.length > 0) ? draftTenSituations : [];
            const fullSituations = rawPack.map((sit, index) => ({
                ...sit,
                level: getStageCefrBounds(stageId, rawLvl).allowedLevels.includes((sit.level || "").toUpperCase()) ? sit.level.toUpperCase() : getStageCefrBounds(stageId, rawLvl).maxLevel,
                topic: normalizeAdminTopic(sit.topic, topics),
                id: `sit_${coreCode}_${String(index + 1).padStart(2, '0')}`,
                isCustomAdded: true
            }));

            const newStruct = {
                id: newId,
                number: nextNum,
                stageId,
                stage: stageInfo.title,
                orderInStage,
                level,
                topics,
                title,
                shortName,
                formula,
                description,
                tips: (draftStructTips && draftStructTips.length > 0) ? draftStructTips : [
                    `• <strong>Công thức cốt lõi:</strong> <em>${formula}</em>`,
                    `• <strong>Từ khóa nhận diện:</strong> ${requiredPatterns.join(', ')}`
                ],
                requiredPatterns,
                situations: fullSituations
            };

            customStructures.push(newStruct);
            localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
            draftTenSituations = [];
            draftStructTips = [];
            document.getElementById('add-structure-form').reset();
            renderDraftSituationsPreview([]);
            updateMatrixPreviewBanner();
            refreshAdminStatsAndSelects();
            if (fullSituations.length > 0) {
                showToast(`✅ Đã tạo Cấu trúc (${stageInfo.shortTitle} • Vị trí #${orderInStage}) với ${fullSituations.length} tình huống A1–B1!`, "success");
            } else {
                showToast(`✅ Đã tạo khung Cấu trúc trống trong ${stageInfo.shortTitle}. Hãy vào Tab 1 thêm câu hoặc bấm 'Bổ sung đủ 15 câu' ở Tab 3!`, "info");
            }
        }

        // Bổ sung tình huống bằng Gemini AI BYOK (Tự thử lại + xoay model khi 503/429, tuyệt đối không đổ câu Offline rác)
        async function fillRemainingSituationsForStruct(structId, extraCount = 5, btnEl = null) {
            const allSt = getMergedStructures();
            const st = allSt.find(s => s.id === structId);
            if (!st) return;

            if (!getAdminGeminiKey()) {
                showToast('Hãy nhập khóa Gemini AI (nút Gemini AI trên góc phải) để bổ sung câu tự nhiên không trùng lặp nhé!', 'warning');
                openAdminGeminiSettingsModal();
                return;
            }

            const currentLen = st.situations.length;
            const targetTotal = currentLen < 15 ? 15 : (currentLen + extraCount);
            const needed = Math.min(10, targetTotal - currentLen);
            const existingViSet = new Set(st.situations.map(s => (s.vi || '').trim().toLowerCase()));

            const origHTML = btnEl ? btnEl.innerHTML : '';
            if (btnEl) {
                btnEl.disabled = true;
                btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>AI đang tạo ${needed} câu...`;
            }

            try {
                const stBounds = getStageCefrBounds(resolveAdminStageId(st));
                const allowedLvlStr = stBounds.allowedLevels.map(x => `"${x}"`).join(' | ');
                const existingSamples = st.situations.slice(-20).map((s, idx) => `${idx + 1}. ${s.vi}`).join('\n');
                const prompt = `Hãy sáng tác ĐÚNG ${needed} tình huống luyện dịch Việt - Anh MỚI HOÀN TOÀN cho cấu trúc:
- Tên cấu trúc: "${st.title}"
- Thuộc Chặng: ${getAdminStageInfo(resolveAdminStageId(st)).title}
- Công thức: "${st.formula}"
- Từ khóa nhận diện: ${(st.requiredPatterns || [st.shortName]).join(', ')}
- KHÓA TRẦN ĐỘ KHÓ BẮT BUỘC: Chỉ dùng trình độ ${allowedLvlStr} (${stBounds.rangeLabel}). TUYỆT ĐỐI KHÔNG sinh câu vượt trần "${stBounds.maxLevel}"!

DANH SÁCH CÂU ĐÃ CÓ (TUYỆT ĐỐI KHÔNG TRÙNG Ý / KHÔNG LẶP NGỮ CẢNH):
${existingSamples || '(Chưa có)'}

Trả về JSON { "situations": [...] } với đủ ${needed} tình huống mới đa dạng (đời sống, ăn uống/mua sắm, du lịch, công sở, phỏng vấn, có cả câu hỏi và phủ định), khớp đúng độ dài & từ vựng trình độ ${stBounds.rangeLabel}.
Mỗi tình huống có: context, level (${allowedLvlStr}), topic (chọn 1 mã trong ["daily","food_shop","travel","office","interview"]), vi, sampleCasual, sampleFormal, ipa, grammarHint, keywords (mảng 3-5 từ nguyên từ có trong sampleCasual), hints (mảng 2-3 {en, vi}).`;

                const schema = {
                    type: 'OBJECT',
                    properties: {
                        situations: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    context: { type: 'STRING' },
                                    level: { type: 'STRING' },
                                    topic: { type: 'STRING' },
                                    vi: { type: 'STRING' },
                                    sampleCasual: { type: 'STRING' },
                                    sampleFormal: { type: 'STRING' },
                                    ipa: { type: 'STRING' },
                                    grammarHint: { type: 'STRING' },
                                    keywords: { type: 'ARRAY', items: { type: 'STRING' } },
                                    hints: {
                                        type: 'ARRAY',
                                        items: {
                                            type: 'OBJECT',
                                            properties: { en: { type: 'STRING' }, vi: { type: 'STRING' } },
                                            required: ['en', 'vi']
                                        }
                                    }
                                },
                                required: ['context', 'level', 'topic', 'vi', 'sampleCasual', 'sampleFormal', 'ipa', 'grammarHint', 'keywords', 'hints']
                            }
                        }
                    },
                    required: ['situations']
                };

                const { parsed, model } = await callAdminGeminiJSON(prompt, schema);
                const newItems = [];
                if (Array.isArray(parsed.situations)) {
                    parsed.situations.forEach(cand => {
                        const viKey = (cand.vi || '').trim().toLowerCase();
                        if (newItems.length < needed && viKey && !existingViSet.has(viKey)) {
                            const orderNum = currentLen + newItems.length + 1;
                            newItems.push({
                                ...cand,
                                level: stBounds.allowedLevels.includes((cand.level || '').toUpperCase()) ? cand.level.toUpperCase() : stBounds.maxLevel,
                                topic: normalizeAdminTopic(cand.topic, st.topics),
                                context: cand.context || `Tình huống ${orderNum} • Mở rộng AI`,
                                id: generateStandardSituationId(st.id, orderNum),
                                isCustomAdded: true
                            });
                            existingViSet.add(viKey);
                        }
                    });
                }

                if (newItems.length === 0) {
                    showToast('Gemini AI chưa trả về câu mới nào khác các câu sẵn có. Bạn thử bấm lại nhé!', 'warning');
                    return;
                }

                if (st.isCustom) {
                    const target = customStructures.find(s => s.id === structId);
                    if (target) {
                        target.situations = [...(target.situations || []), ...newItems];
                        localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
                    }
                } else {
                    if (!customSituationsMap[structId]) customSituationsMap[structId] = [];
                    customSituationsMap[structId].push(...newItems);
                    localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
                }

                refreshAdminStatsAndSelects();
                showToast(`✨ Gemini AI (${model}) đã tạo thêm ${newItems.length} tình huống mới (Tổng: ${currentLen + newItems.length} câu) cho "${st.shortName}"!`, "success");
            } catch (err) {
                showToast(`⚠️ Không gọi được Gemini AI (${err.message || 'Máy chủ Google đang bận'}). Hãy thử lại sau 15 giây!`, 'warning');
            } finally {
                if (btnEl) {
                    btnEl.disabled = false;
                    btnEl.innerHTML = origHTML;
                }
            }
        }

        // Đổi thứ tự Trạm (Lên / Xuống) trong cùng 1 Chặng trên Sơ đồ học
        function moveStructureOrderInStage(structId, delta) {
            const allStructs = getMergedStructures();
            const target = allStructs.find(s => s.id === structId);
            if (!target) return;

            const sameStage = allStructs.filter(s => s.stageId === target.stageId);
            const curIdx = sameStage.findIndex(s => s.id === structId);
            const nextIdx = curIdx + delta;
            if (curIdx === -1 || nextIdx < 0 || nextIdx >= sameStage.length) return;

            // Hoán đổi vị trí trong mảng cùng Chặng rồi gán lại orderInStage = 1, 2, 3...
            const reordered = [...sameStage];
            const [moved] = reordered.splice(curIdx, 1);
            reordered.splice(nextIdx, 0, moved);

            reordered.forEach((st, idx) => {
                const newOrder = idx + 1;
                if (st.isCustom) {
                    const cs = customStructures.find(c => c.id === st.id);
                    if (cs) cs.orderInStage = newOrder;
                } else {
                    structureOverrides[st.id] = { ...(structureOverrides[st.id] || {}), orderInStage: newOrder };
                }
            });

            localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
            localStorage.setItem('va_structure_overrides', JSON.stringify(structureOverrides));
            refreshAdminStatsAndSelects();
            showToast(`Đã đổi vị trí "${target.shortName}" lên vị trí #${nextIdx + 1} trong ${getAdminStageInfo(target.stageId).shortTitle}!`, 'success');
        }

                function jumpToAddSituationForStruct(structId) {
            switchAdminTab('checker');
            const selectEl = document.getElementById('sit-struct-select');
            if (selectEl) selectEl.value = structId;
            const ctxInput = document.getElementById('sit-context-input');
            const st = getMergedStructures().find(s => s.id === structId);
            if (ctxInput && st) {
                ctxInput.value = `Tình huống ${st.situations.length + 1} • Mở rộng (${st.shortName})`;
            }
            document.getElementById('sit-vi-input')?.focus();
            showToast(`Đang chọn "${st ? st.shortName : ''}": Hãy nhập câu thứ ${st ? st.situations.length + 1 : ''} vào form!`, "info");
        }

        // ==================== QUẢN LÝ TAB & DANH MỤC KHO DỮ LIỆU ====================
        function switchAdminTab(tab) {
            ['checker', 'structure', 'library'].forEach(t => {
                document.getElementById(`admin-tab-${t}`).classList.add('hidden');
                const btn = document.getElementById(`tab-btn-${t}`);
                btn.className = "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2";
            });
            document.getElementById(`admin-tab-${tab}`).classList.remove('hidden');
            document.getElementById(`tab-btn-${tab}`).className = "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-xs transition-all flex items-center gap-2";

            if (tab === 'library') renderAdminLibrary();
        }

        function refreshAdminStatsAndSelects() {
            const allStructs = getMergedStructures();
            let totalSentences = 0;
            allStructs.forEach(s => totalSentences += s.situations.length);

            document.getElementById('stat-total-structs').innerText = `${allStructs.length} bộ`;
            const activeBaseCount = BASE_STRUCTURES.filter(st => !deletedStructureIds.includes(st.id)).length;
            document.getElementById('stat-custom-structs').innerText = `${activeBaseCount} gốc + ${customStructures.length} mới thêm`;
            document.getElementById('stat-total-sentences').innerText = `${totalSentences} câu`;
            document.getElementById('tab-lib-count').innerText = allStructs.length;

            const selectEl = document.getElementById('sit-struct-select');
            if (allStructs.length === 0) {
                selectEl.innerHTML = `<option value="">-- Kho đang trống (Hãy tạo ở Tab 2 hoặc Gộp JSON) --</option>`;
            } else {
                selectEl.innerHTML = allStructs.map(st => `
                    <option value="${st.id}">Cấu trúc #${st.number}: ${st.shortName} (${st.situations.length} câu)</option>
                `).join('');
            }

            renderAdminLibrary();
        }

        function renderAdminLibrary() {
            const allStructs = getMergedStructures();
            const container = document.getElementById('admin-library-list');

            if (allStructs.length === 0) {
                container.innerHTML = `
                    <div class="p-8 sm:p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
                        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto text-xl">
                            <i class="fa-regular fa-folder-open"></i>
                        </div>
                        <h3 class="font-extrabold text-slate-800 text-base">Kho dữ liệu hiện đang trống (0 cấu trúc)</h3>
                        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">Bạn đã sẵn sàng xây dựng lộ trình A1–B1 mới tinh! Hãy sang <strong>Tab 2</strong> để nhờ AI tạo cấu trúc mới (10–15 câu) hoặc bấm <strong>Gộp JSON</strong> ở góc trên.</p>
                        <button type="button" onclick="switchAdminTab('structure')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all">
                            <i class="fa-solid fa-folder-plus"></i>
                            <span>Tạo cấu trúc A1–B1 đầu tiên</span>
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = allStructs.map(st => {
                const origBaseSt = BASE_STRUCTURES.find(b => b.id === st.id);
                const origBaseCount = origBaseSt ? (origBaseSt.situations || []).length : 0;
                const stageInfo = getAdminStageInfo(st.stageId);
                const sameStageList = allStructs.filter(x => x.stageId === st.stageId);
                const posInStage = sameStageList.findIndex(x => x.id === st.id);
                const canMoveUp = posInStage > 0;
                const canMoveDown = posInStage >= 0 && posInStage < sameStageList.length - 1;

                return `
                <div class="p-4 sm:p-5 rounded-2xl border ${st.isCustom ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/40'} space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold ${st.isCustom ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}">
                                ${stageInfo.shortTitle} • Trạm ${stageInfo.number}.${posInStage + 1} ${st.isCustom ? '(Mới)' : (st.isEdited ? '(Đã sửa)' : '')}
                            </span>
                            <h3 class="font-extrabold text-slate-900 text-sm sm:text-base">${st.title}</h3>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5">
                            <div class="inline-flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs" title="Đổi thứ tự Trạm trong ${stageInfo.shortTitle}">
                                <button type="button" onclick="moveStructureOrderInStage('${st.id}', -1)" ${canMoveUp ? '' : 'disabled'} class="px-2 py-1 text-[11px] font-bold ${canMoveUp ? 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700' : 'text-slate-300 cursor-not-allowed'}" title="Đưa lên trước trong ${stageInfo.shortTitle}">
                                    <i class="fa-solid fa-arrow-up"></i>
                                </button>
                                <button type="button" onclick="moveStructureOrderInStage('${st.id}', 1)" ${canMoveDown ? '' : 'disabled'} class="px-2 py-1 text-[11px] font-bold border-l border-slate-200 ${canMoveDown ? 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700' : 'text-slate-300 cursor-not-allowed'}" title="Đưa xuống sau trong ${stageInfo.shortTitle}">
                                    <i class="fa-solid fa-arrow-down"></i>
                                </button>
                            </div>
                            ${!st.isCustom && origBaseCount > 0 && st.situations.length < origBaseCount ? `
                                <button onclick="restoreDeletedBaseSituations('${st.id}')" class="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all" title="Khôi phục lại các câu gốc đã lỡ xóa của cấu trúc này">
                                    <i class="fa-solid fa-rotate-left mr-1"></i>Khôi phục đủ ${origBaseCount} câu gốc
                                </button>
                            ` : ''}
                            <button onclick="jumpToAddSituationForStruct('${st.id}')" class="px-3 py-1 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all" title="Mở trình soạn thảo để thêm câu mới vào cấu trúc này">
                                <i class="fa-solid fa-plus mr-1"></i>Thêm câu mới
                            </button>
                            <button onclick="fillRemainingSituationsForStruct('${st.id}', 5, this)" class="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all" title="Tự động sinh thêm tình huống cho cấu trúc này (Không giới hạn)">
                                <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>${st.situations.length < 15 ? `Bổ sung đủ 15 câu (+${15 - st.situations.length})` : `+ Thêm nhanh 5 câu`}
                            </button>
                            <button onclick="openEditStructureModal('${st.id}')" class="px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 transition-all" title="Chỉnh sửa tên, công thức, mô tả của cấu trúc này">
                                <i class="fa-solid fa-pen-to-square mr-1"></i>Sửa cấu trúc
                            </button>
                            <button onclick="requestDeleteCustomStructure('${st.id}')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 transition-all" title="${st.isCustom ? 'Xóa cấu trúc mới thêm này' : 'Ẩn/Xóa cấu trúc gốc này (sẽ bị loại hẳn khi bấm Xuất questions_data.js)'}">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                                ${st.situations.length} tình huống
                            </span>
                        </div>
                    </div>
                    <p class="font-mono text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 inline-block">${st.formula}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        ${st.situations.map((sit, i) => {
                            const isConfirmingThis = inlineConfirmSitId === sit.id;
                            return `
                            <div class="group p-3 rounded-xl border ${isConfirmingThis ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200' : 'bg-white border-slate-200/80 hover:border-indigo-300'} text-xs flex flex-col justify-between gap-2 transition-all">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="space-y-0.5 flex-1">
                                        <div class="flex flex-wrap items-center gap-1.5">
                                            <span class="font-extrabold text-indigo-600">#${i + 1}:</span>
                                            <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">${ADMIN_TOPIC_LABELS[normalizeAdminTopic(sit.topic, st.topics)] || 'Hàng ngày'}</span>
                                            <span class="font-bold text-slate-800">"${sit.vi}"</span>
                                        </div>
                                        <p class="text-slate-500 text-[11px]">${sit.sampleCasual}</p>
                                    </div>
                                    <div class="flex items-center gap-1 shrink-0">
                                        ${sit.isCustomAdded ? `<span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">Mới</span>` : ''}
                                        ${sit.isEdited ? `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Đã sửa</span>` : ''}
                                        <button type="button" onclick="openEditSituationModal('${st.id}', '${sit.id}')" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white flex items-center gap-1 font-semibold transition-all" title="Chỉnh sửa câu tình huống này">
                                            <i class="fa-solid fa-pen text-[10px]"></i>
                                            <span class="text-[10px]">Sửa</span>
                                        </button>
                                        <button type="button" onclick="requestDeleteSituationItem('${st.id}', '${sit.id}', ${i + 1})" class="px-2 py-1 rounded-lg ${isConfirmingThis ? 'bg-rose-600 text-white' : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/80'} flex items-center gap-1 font-bold transition-all" title="Xóa tình huống này">
                                            <i class="fa-regular fa-trash-can text-[10px]"></i>
                                            <span class="text-[10px]">Xóa</span>
                                        </button>
                                    </div>
                                </div>

                                ${isConfirmingThis ? `
                                    <div class="pt-2 mt-1 border-t border-rose-200 flex items-center justify-between gap-2">
                                        <span class="text-[11px] font-extrabold text-rose-700 flex items-center gap-1">
                                            <i class="fa-solid fa-triangle-exclamation"></i> Bạn chắc chắn muốn xóa câu #${i + 1}?
                                        </span>
                                        <div class="flex items-center gap-1.5">
                                            <button type="button" onclick="cancelInlineDelete()" class="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px]">
                                                Hủy
                                            </button>
                                            <button type="button" onclick="confirmInlineDelete('${st.id}', '${sit.id}')" class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shadow-xs">
                                                <i class="fa-solid fa-check mr-1"></i>Xác nhận xóa
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
            }).join('');
        }

        // ==================== HỘP THOẠI & THANH XÁC NHẬN XÓA KÉP (INLINE + MODAL) ====================
        let pendingDeleteAction = null;

        function requestDeleteSituationItem(structId, sitId, sitNumber) {
            const st = getMergedStructures().find(s => s.id === structId);
            if (!st) return;
            const sit = st.situations.find(x => x.id === sitId);
            if (!sit) return;

            // 1. Bật thanh xác nhận trực tiếp ngay trên ô tình huống đó
            inlineConfirmSitId = sitId;
            renderAdminLibrary();

            // 2. Đồng thời hiển thị hộp thoại xác nhận ở giữa màn hình
            pendingDeleteAction = { type: 'situation', structId, sitId };
            document.getElementById('confirm-delete-title').innerText = `Xác nhận xóa Tình huống #${sitNumber}`;
            document.getElementById('confirm-delete-desc').innerHTML = `Bạn có chắc chắn muốn xóa tình huống này khỏi <strong>Cấu trúc #${st.number} (${st.shortName})</strong> không?`;
            document.getElementById('confirm-delete-vi').innerText = `"${sit.vi}"`;
            document.getElementById('confirm-delete-en').innerText = sit.sampleCasual;
            document.getElementById('confirm-delete-preview').classList.remove('hidden');
            document.getElementById('confirm-delete-modal').classList.remove('hidden');
        }

        function cancelInlineDelete() {
            inlineConfirmSitId = null;
            pendingDeleteAction = null;
            document.getElementById('confirm-delete-modal').classList.add('hidden');
            renderAdminLibrary();
        }

        function confirmInlineDelete(structId, sitId) {
            inlineConfirmSitId = null;
            pendingDeleteAction = null;
            document.getElementById('confirm-delete-modal').classList.add('hidden');
            deleteSituationItem(structId, sitId);
        }

        function requestDeleteCustomStructure(structId) {
            const st = getMergedStructures().find(s => s.id === structId);
            if (!st) return;

            pendingDeleteAction = { type: 'structure', structId };
            document.getElementById('confirm-delete-title').innerText = `Xác nhận xóa Cấu trúc #${st.number}`;
            document.getElementById('confirm-delete-desc').innerHTML = `Bạn có chắc chắn muốn xóa toàn bộ cấu trúc <strong>"${st.title}"</strong> và tất cả <strong>${st.situations.length} tình huống</strong> bên trong không?`;
            document.getElementById('confirm-delete-vi').innerText = st.title;
            document.getElementById('confirm-delete-en').innerText = st.formula;
            document.getElementById('confirm-delete-preview').classList.remove('hidden');
            document.getElementById('confirm-delete-modal').classList.remove('hidden');
        }

        function closeConfirmDeleteModal() {
            pendingDeleteAction = null;
            inlineConfirmSitId = null;
            document.getElementById('confirm-delete-modal').classList.add('hidden');
            renderAdminLibrary();
        }

        function executeConfirmedDelete() {
            if (!pendingDeleteAction) return;
            const { type, structId, sitId } = pendingDeleteAction;
            closeConfirmDeleteModal();

            if (type === 'situation') {
                deleteSituationItem(structId, sitId);
            } else if (type === 'structure') {
                deleteCustomStructure(structId);
            } else if (type === 'reset_all') {
                executeResetCustomAdminData();
            }
        }

        function restoreDeletedBaseSituations(structId) {
            const baseSt = BASE_STRUCTURES.find(s => s.id === structId);
            if (!baseSt) {
                deletedSituationIds = [];
            } else {
                const baseIds = new Set(baseSt.situations.map(s => s.id));
                deletedSituationIds = deletedSituationIds.filter(id => !baseIds.has(id));
            }
            localStorage.setItem('va_deleted_situations', JSON.stringify(deletedSituationIds));
            refreshAdminStatsAndSelects();
            const restoredLen = baseSt ? (baseSt.situations || []).length : 0;
            showToast(`Đã khôi phục lại đầy đủ ${restoredLen} tình huống gốc!`, "success");
        }

        // ==================== CHỨC NĂNG SỬA & XÓA TRỰC TIẾP CẤU TRÚC / TÌNH HUỐNG ====================
        function openEditStructureModal(structId) {
            const st = getMergedStructures().find(s => s.id === structId);
            if (!st) return;

            document.getElementById('edit-struct-id').value = st.id;
            document.getElementById('edit-struct-title').value = st.title || '';
            document.getElementById('edit-struct-short').value = st.shortName || '';
            document.getElementById('edit-struct-formula').value = st.formula || '';
            document.getElementById('edit-struct-level').value = ({basic:'A2',intermediate:'B1',advanced:'C1'}[st.level] || st.level || 'B1');
            document.getElementById('edit-struct-patterns').value = (st.requiredPatterns || [st.shortName]).join(', ');
            document.getElementById('edit-struct-desc').value = st.description || '';
            if (document.getElementById('edit-struct-stage')) {
                document.getElementById('edit-struct-stage').value = resolveAdminStageId(st);
            }
            if (document.getElementById('edit-struct-order')) {
                document.getElementById('edit-struct-order').value = st.orderInStage || 1;
            }
            if (document.getElementById('edit-struct-topics')) {
                document.getElementById('edit-struct-topics').value = (st.topics || ['daily']).join(', ');
            }

            document.getElementById('edit-struct-modal').classList.remove('hidden');
        }

        function closeEditStructModal() {
            document.getElementById('edit-struct-modal').classList.add('hidden');
        }

        function saveEditedStructure(e) {
            e.preventDefault();
            const structId = document.getElementById('edit-struct-id').value;
            const newStageId = document.getElementById('edit-struct-stage')?.value || 'stage_1';
            const newStageInfo = getAdminStageInfo(newStageId);
            const newOrder = Math.max(1, parseInt(document.getElementById('edit-struct-order')?.value || '1', 10) || 1);
            const rawEditTopics = (document.getElementById('edit-struct-topics')?.value || '').split(',').map(s => normalizeAdminTopic(s)).filter(Boolean);
            const updatedData = {
                title: document.getElementById('edit-struct-title').value.trim(),
                shortName: document.getElementById('edit-struct-short').value.trim(),
                formula: document.getElementById('edit-struct-formula').value.trim(),
                level: document.getElementById('edit-struct-level').value,
                stageId: newStageId,
                stage: newStageInfo.title,
                orderInStage: newOrder,
                topics: rawEditTopics.length > 0 ? Array.from(new Set(rawEditTopics)) : ['daily'],
                requiredPatterns: document.getElementById('edit-struct-patterns').value.split(',').map(s => s.trim()).filter(Boolean),
                description: document.getElementById('edit-struct-desc').value.trim()
            };

            const customIdx = customStructures.findIndex(s => s.id === structId);
            if (customIdx !== -1) {
                customStructures[customIdx] = { ...customStructures[customIdx], ...updatedData };
                localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
            } else {
                structureOverrides[structId] = updatedData;
                localStorage.setItem('va_structure_overrides', JSON.stringify(structureOverrides));
            }

            closeEditStructModal();
            refreshAdminStatsAndSelects();
            showToast("Đã cập nhật Cấu trúc câu và đồng bộ sang trang Học viên!", "success");
        }

        function deleteCustomStructure(structId) {
            const isBase = BASE_STRUCTURES.some(b => b.id === structId);
            if (isBase) {
                if (!deletedStructureIds.includes(structId)) {
                    deletedStructureIds.push(structId);
                    localStorage.setItem('va_deleted_structures', JSON.stringify(deletedStructureIds));
                }
                delete customSituationsMap[structId];
                localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
                refreshAdminStatsAndSelects();
                showToast("Đã ẩn cấu trúc gốc khỏi danh sách! Hãy bấm 'Xuất questions_data.js' và chép đè vào VS Code để xóa vĩnh viễn.", "info");
            } else {
                customStructures = customStructures.filter(s => s.id !== structId);
                delete customSituationsMap[structId];
                localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
                localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
                refreshAdminStatsAndSelects();
                showToast("Đã xóa cấu trúc khỏi kho dữ liệu.", "info");
            }
        }

        function openEditSituationModal(structId, sitId) {
            const st = getMergedStructures().find(s => s.id === structId);
            if (!st) return;
            const sit = st.situations.find(x => x.id === sitId);
            if (!sit) return;

            document.getElementById('edit-sit-struct-id').value = structId;
            document.getElementById('edit-sit-id').value = sitId;
            document.getElementById('edit-sit-context').value = sit.context || `Tình huống • ${st.shortName}`;
            document.getElementById('edit-sit-level').value = ({basic:'A2',intermediate:'B1',advanced:'C1'}[sit.level] || sit.level || 'A2');
            if (document.getElementById('edit-sit-topic')) {
                document.getElementById('edit-sit-topic').value = normalizeAdminTopic(sit.topic, st.topics);
            }
            document.getElementById('edit-sit-vi').value = sit.vi || '';
            document.getElementById('edit-sit-casual').value = sit.sampleCasual || '';
            document.getElementById('edit-sit-formal').value = sit.sampleFormal || sit.sampleCasual || '';
            if (document.getElementById('edit-sit-alternatives')) {
                document.getElementById('edit-sit-alternatives').value = formatCustomAlternativesToText(sit.alternatives);
            }
            document.getElementById('edit-sit-ipa').value = sit.ipa || '';
            document.getElementById('edit-sit-grammar-hint').value = sit.grammarHint || '';
            document.getElementById('edit-sit-keywords').value = (sit.keywords || []).join(', ');
            document.getElementById('edit-sit-hints').value = (sit.hints || []).map(h => `${h.en}:${h.vi}`).join(', ');

            document.getElementById('edit-sit-modal').classList.remove('hidden');
        }

        function closeEditSituationModal() {
            document.getElementById('edit-sit-modal').classList.add('hidden');
        }

        function saveEditedSituation(e) {
            e.preventDefault();
            const structId = document.getElementById('edit-sit-struct-id').value;
            const sitId = document.getElementById('edit-sit-id').value;

            const rawKeywords = document.getElementById('edit-sit-keywords').value.trim();
            const sampleCasual = document.getElementById('edit-sit-casual').value.trim();
            const keywords = rawKeywords
                ? rawKeywords.split(',').map(k => k.trim()).filter(Boolean)
                : normalizeAndTokenize(sampleCasual, true).slice(0, 5);

            const rawHints = document.getElementById('edit-sit-hints').value.trim();
            const hints = rawHints
                ? rawHints.split(',').map(pair => {
                    const [en, viMean] = pair.split(':').map(s => (s || '').trim());
                    return { en: en || "keyword", vi: viMean || "gợi ý" };
                })
                : [];

            const updatedSit = {
                context: document.getElementById('edit-sit-context').value.trim(),
                level: document.getElementById('edit-sit-level').value,
                topic: normalizeAdminTopic(document.getElementById('edit-sit-topic')?.value),
                vi: document.getElementById('edit-sit-vi').value.trim(),
                sampleCasual,
                sampleFormal: document.getElementById('edit-sit-formal').value.trim() || sampleCasual,
                ipa: document.getElementById('edit-sit-ipa').value.trim(),
                grammarHint: document.getElementById('edit-sit-grammar-hint').value.trim(),
                alternatives: parseCustomAlternativesText(document.getElementById('edit-sit-alternatives')?.value || ''),
                keywords,
                hints
            };

            // Lưu vào bảng situationOverrides để áp dụng cho cả câu gốc lẫn câu mới thêm
            situationOverrides[sitId] = updatedSit;
            localStorage.setItem('va_situation_overrides', JSON.stringify(situationOverrides));

            // Cập nhật trực tiếp nếu nằm trong customStructures hoặc customSituationsMap
            const cStruct = customStructures.find(s => s.id === structId);
            if (cStruct && cStruct.situations) {
                const idx = cStruct.situations.findIndex(x => x.id === sitId);
                if (idx !== -1) {
                    cStruct.situations[idx] = { ...cStruct.situations[idx], ...updatedSit, isEdited: true };
                    localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
                }
            }
            if (customSituationsMap[structId]) {
                const idx = customSituationsMap[structId].findIndex(x => x.id === sitId);
                if (idx !== -1) {
                    customSituationsMap[structId][idx] = { ...customSituationsMap[structId][idx], ...updatedSit, isEdited: true };
                    localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
                }
            }

            closeEditSituationModal();
            refreshAdminStatsAndSelects();
            showToast("Đã lưu chỉnh sửa tình huống và đồng bộ sang trang Học viên!", "success");
        }

        function deleteSituationItem(structId, sitId) {
            const st = getMergedStructures().find(s => s.id === structId);
            const sitObj = st ? st.situations.find(x => x.id === sitId) : null;
            if (sitObj) {
                lastDeletedBackup = { structId, sitObj: { ...sitObj } };
                const undoBtn = document.getElementById('undo-delete-btn');
                if (undoBtn) undoBtn.classList.remove('hidden');
            }

            if (!deletedSituationIds.includes(sitId)) {
                deletedSituationIds.push(sitId);
                localStorage.setItem('va_deleted_situations', JSON.stringify(deletedSituationIds));
            }
            if (customSituationsMap[structId]) {
                customSituationsMap[structId] = customSituationsMap[structId].filter(s => s.id !== sitId);
                localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
            }
            const cStruct = customStructures.find(s => s.id === structId);
            if (cStruct && cStruct.situations) {
                cStruct.situations = cStruct.situations.filter(s => s.id !== sitId);
                localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
            }
            refreshAdminStatsAndSelects();
            showToast("Đã xóa tình huống! Bạn có thể bấm 'Hoàn tác câu vừa xóa' nếu muốn lấy lại.", "info");
        }

        function undoLastDeletedSituation() {
            if (!lastDeletedBackup) return;
            const { structId, sitObj } = lastDeletedBackup;

            deletedSituationIds = deletedSituationIds.filter(id => id !== sitObj.id);
            localStorage.setItem('va_deleted_situations', JSON.stringify(deletedSituationIds));

            if (sitObj.isCustomAdded) {
                const cStruct = customStructures.find(s => s.id === structId);
                if (cStruct) {
                    if (!cStruct.situations.some(x => x.id === sitObj.id)) {
                        cStruct.situations.push(sitObj);
                        localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
                    }
                } else {
                    if (!customSituationsMap[structId]) customSituationsMap[structId] = [];
                    if (!customSituationsMap[structId].some(x => x.id === sitObj.id)) {
                        customSituationsMap[structId].push(sitObj);
                        localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
                    }
                }
            }

            lastDeletedBackup = null;
            const undoBtn = document.getElementById('undo-delete-btn');
            if (undoBtn) undoBtn.classList.add('hidden');
            refreshAdminStatsAndSelects();
            showToast(`Đã hoàn tác và khôi phục lại câu: "${sitObj.vi}"!`, "success");
        }

        function exportAllDataJSON() {
            const payload = {
                exportedAt: new Date().toISOString(),
                customStructures,
                customSituationsMap,
                structureOverrides,
                situationOverrides,
                deletedSituationIds,
                deletedStructureIds,
                mergedPreview: getMergedStructures()
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vietanh_admin_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("Đã xuất toàn bộ dữ liệu (bao gồm cả các chỉnh sửa) ra file JSON!", "success");
        }

        // Xuất thẳng ra file tĩnh questions_data.js để chép đè vào thư mục VS Code (Giải phóng 100% localStorage)
function exportMergedQuestionsDataJS() {
    const mergedAll = getMergedStructures();
    const stageOrderCounters = {};

    const cleanStructures = mergedAll.map((st, idx) => {
        const stageId = resolveAdminStageId(st);
        const stageInfo = getAdminStageInfo(stageId);
        stageOrderCounters[stageId] = (stageOrderCounters[stageId] || 0) + 1;
        const normTopics = (Array.isArray(st.topics) && st.topics.length > 0)
            ? Array.from(new Set(st.topics.map(t => normalizeAdminTopic(t))))
            : ['daily'];

        const cleanSits = (st.situations || []).map(s => {
            const copy = { ...s };
            copy.topic = normalizeAdminTopic(copy.topic, normTopics);
            delete copy.isCustomAdded;
            delete copy.isEdited;
            return copy;
        });
        return {
            id: st.id,
            number: idx + 1,
            stageId,
            stage: stageInfo.title,
            orderInStage: stageOrderCounters[stageId],
            level: ({basic:'A2',intermediate:'B1',advanced:'C1'}[st.level] || st.level || 'B1'),
            topics: normTopics,
            title: st.title,
            shortName: st.shortName,
            formula: st.formula,
            description: st.description,
            tips: st.tips || [],
            requiredPatterns: st.requiredPatterns || [st.shortName],
            situations: cleanSits
        };
    });

    const totalSitsExport = cleanStructures.reduce((sum, s) => sum + s.situations.length, 0);
    // Phương án A: Tab Chủ đề tự do tự động đồng bộ từ SENTENCE_STRUCTURES_DATA (EXERCISE_BANK_DATA để mảng rỗng sạch)
    const fileContent = `/**
 * FILE DỮ LIỆU ĐỘC LẬP: questions_data.js
 * Tự động gộp và xuất từ ViệtAnh Admin Studio (CMS v3.0 • Sơ đồ 8 Chặng A1–B1) ngày ${new Date().toLocaleDateString('vi-VN')}
 * Tổng cộng: ${cleanStructures.length} Cấu trúc câu • ${totalSitsExport} Tình huống thực chiến.
 */

window.SENTENCE_STRUCTURES_DATA = ${JSON.stringify(cleanStructures, null, 4)};

window.EXERCISE_BANK_DATA = [];
`;

    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_data.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file questions_data.js! Hãy chép đè vào thư mục VS Code rồi bấm 'Khôi phục mặc định gốc' để giải phóng localStorage.", "success");
}

// Hàm đo dung lượng localStorage hiện tại (Cảnh báo nếu vượt ngưỡng an toàn)
function getLocalStorageUsageKB() {
    let totalBytes = 0;
    for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            totalBytes += (localStorage[key].length + key.length) * 2;
        }
    }
    return Math.round((totalBytes / 1024) * 10) / 10; // KB
}

        // ==================== NHẬP & GỘP JSON THÔNG MINH (ADDITIVE MERGE — KHÔNG GHI ĐÈ CẤU TRÚC CŨ) ====================
        function normalizeViKeyForMerge(text) {
            return String(text || '').toLowerCase().replace(/[.,?!;:"'()—–-]/g, ' ').replace(/\s+/g, ' ').trim();
        }

        function mergeSingleJsonPayload(data, stats) {
            const baseMap = new Map(BASE_STRUCTURES.map(st => [st.id, st]));

            // 1. Gộp các tình huống lẻ trong customSituationsMap (nếu có)
            if (data && data.customSituationsMap && typeof data.customSituationsMap === 'object') {
                Object.entries(data.customSituationsMap).forEach(([structId, sitList]) => {
                    if (!Array.isArray(sitList) || sitList.length === 0) return;
                    if (!customSituationsMap[structId]) customSituationsMap[structId] = [];

                    const existingIds = new Set();
                    const existingVis = new Set();
                    const baseSt = baseMap.get(structId);
                    if (baseSt && Array.isArray(baseSt.situations)) {
                        baseSt.situations.forEach(s => { existingIds.add(s.id); existingVis.add(normalizeViKeyForMerge(s.vi)); });
                    }
                    customSituationsMap[structId].forEach(s => { existingIds.add(s.id); existingVis.add(normalizeViKeyForMerge(s.vi)); });

                    sitList.forEach(sit => {
                        if (!sit || !sit.vi) return;
                        const viKey = normalizeViKeyForMerge(sit.vi);
                        if (existingIds.has(sit.id) || (viKey && existingVis.has(viKey))) {
                            stats.skippedDuplicates++;
                            return;
                        }
                        const safeSit = {
                            ...sit,
                            id: sit.id || generateStandardSituationId(structId, existingIds.size + 1),
                            isCustomAdded: true
                        };
                        customSituationsMap[structId].push(safeSit);
                        existingIds.add(safeSit.id);
                        if (viKey) existingVis.add(viKey);
                        // Nếu tình huống từng nằm trong danh sách đã xóa thì khôi phục lại
                        deletedSituationIds = deletedSituationIds.filter(delId => delId !== safeSit.id);
                        stats.addedSituations++;
                    });
                });
            }

            // 2. Thu thập danh sách cấu trúc đến từ mọi định dạng JSON phổ biến:
            //    (a) { customStructures: [...] } (file backup hoặc file xuất 1 cấu trúc như can_you_could_you_A1_C1_structure.json)
            //    (b) [ { id, title, situations: [...] }, ... ] (mảng cấu trúc)
            //    (c) { id, title, situations: [...] } (1 đối tượng cấu trúc đơn lẻ)
            //    (d) [ { vi, sampleCasual, ... }, ... ] (mảng câu tình huống đơn lẻ -> gộp vào cấu trúc đang chọn ở Tab 1)
            let incomingStructures = [];
            if (Array.isArray(data)) {
                if (data.length > 0 && Array.isArray(data[0]?.situations)) {
                    incomingStructures = data;
                } else if (data.length > 0 && (data[0]?.vi || data[0]?.sampleCasual)) {
                    const targetStructId = document.getElementById('sit-struct-select')?.value || BASE_STRUCTURES[0]?.id;
                    if (targetStructId) {
                        mergeSingleJsonPayload({ customSituationsMap: { [targetStructId]: data } }, stats);
                    }
                    return;
                }
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.customStructures) && data.customStructures.length > 0) {
                    incomingStructures = data.customStructures;
                } else if (Array.isArray(data.mergedPreview) && data.mergedPreview.length > 0) {
                    incomingStructures = data.mergedPreview;
                } else if (Array.isArray(data.situations) && (data.title || data.shortName)) {
                    incomingStructures = [data];
                }
            }

            // 3. Gộp từng cấu trúc vào kho hiện tại (Không bao giờ xóa đè cấu trúc trước đó!)
            incomingStructures.forEach(inc => {
                if (!inc || (!inc.title && !inc.shortName)) return;
                const cleanTitle = (inc.title || inc.shortName || '').trim();
                const cleanShort = (inc.shortName || cleanTitle.slice(0, 32)).trim();
                const cleanId = (inc.id || generateStandardStructureId(cleanShort, inc.level || 'B1')).trim();
                const incSits = Array.isArray(inc.situations) ? inc.situations : [];

                // Trường hợp A: Trùng ID với cấu trúc gốc (BASE_STRUCTURES) -> Khôi phục nếu từng ẩn & gộp thêm các câu mới
                if (baseMap.has(cleanId)) {
                    deletedStructureIds = deletedStructureIds.filter(delId => delId !== cleanId);
                    if (incSits.length > 0) {
                        mergeSingleJsonPayload({ customSituationsMap: { [cleanId]: incSits } }, stats);
                    }
                    stats.mergedStructures++;
                    return;
                }

                // Trường hợp B: Đã tồn tại trong customStructures (khớp theo ID hoặc khớp chính xác Title) -> Gộp thêm câu mới
                const existingCustom = customStructures.find(cs =>
                    cs.id === cleanId || (cs.title && cs.title.trim().toLowerCase() === cleanTitle.toLowerCase())
                );

                if (existingCustom) {
                    if (!Array.isArray(existingCustom.situations)) existingCustom.situations = [];
                    const existSitIds = new Set(existingCustom.situations.map(s => s.id));
                    const existSitVis = new Set(existingCustom.situations.map(s => normalizeViKeyForMerge(s.vi)));

                    incSits.forEach(sit => {
                        if (!sit || !sit.vi) return;
                        const viKey = normalizeViKeyForMerge(sit.vi);
                        if (existSitIds.has(sit.id) || (viKey && existSitVis.has(viKey))) {
                            stats.skippedDuplicates++;
                            return;
                        }
                        const safeSit = {
                            ...sit,
                            id: sit.id || generateStandardSituationId(existingCustom.id, existingCustom.situations.length + 1),
                            isCustomAdded: true
                        };
                        existingCustom.situations.push(safeSit);
                        existSitIds.add(safeSit.id);
                        if (viKey) existSitVis.add(viKey);
                        deletedSituationIds = deletedSituationIds.filter(delId => delId !== safeSit.id);
                        stats.addedSituations++;
                    });
                    stats.mergedStructures++;
                } else {
                    // Trường hợp C: Cấu trúc hoàn toàn mới -> Thêm nối tiếp vào cuối mảng customStructures
                    const newStructCopy = {
                        ...inc,
                        id: cleanId,
                        title: cleanTitle,
                        shortName: cleanShort,
                        level: inc.level || 'B1',
                        topics: Array.isArray(inc.topics) && inc.topics.length > 0 ? inc.topics : ['daily', 'office'],
                        tips: Array.isArray(inc.tips) ? inc.tips : [],
                        requiredPatterns: Array.isArray(inc.requiredPatterns) && inc.requiredPatterns.length > 0 ? inc.requiredPatterns : [cleanShort.toLowerCase()],
                        situations: incSits.map((sit, idx) => ({
                            ...sit,
                            id: sit.id || generateStandardSituationId(cleanId, idx + 1)
                        })),
                        isCustom: true
                    };
                    // Khôi phục nếu ID câu từng nằm trong danh sách xóa
                    const importedIds = new Set(newStructCopy.situations.map(s => s.id));
                    deletedSituationIds = deletedSituationIds.filter(delId => !importedIds.has(delId));

                    customStructures.push(newStructCopy);
                    stats.addedStructures++;
                    stats.addedSituations += newStructCopy.situations.length;
                }
            });

            // 4. Gộp Overrides & Deleted IDs theo kiểu cộng dồn an toàn
            if (data && data.structureOverrides && typeof data.structureOverrides === 'object') {
                structureOverrides = { ...structureOverrides, ...data.structureOverrides };
            }
            if (data && data.situationOverrides && typeof data.situationOverrides === 'object') {
                situationOverrides = { ...situationOverrides, ...data.situationOverrides };
            }
            if (data && Array.isArray(data.deletedSituationIds) && data.deletedSituationIds.length > 0) {
                const delSet = new Set([...deletedSituationIds, ...data.deletedSituationIds]);
                deletedSituationIds = Array.from(delSet);
            }
            if (data && Array.isArray(data.deletedStructureIds) && data.deletedStructureIds.length > 0) {
                const delStructSet = new Set([...deletedStructureIds, ...data.deletedStructureIds]);
                deletedStructureIds = Array.from(delStructSet);
            }
        }

        async function importDataJSON(event) {
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;

            const stats = {
                filesOk: 0,
                filesFailed: 0,
                addedStructures: 0,
                mergedStructures: 0,
                addedSituations: 0,
                skippedDuplicates: 0
            };

            for (const file of files) {
                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    mergeSingleJsonPayload(parsed, stats);
                    stats.filesOk++;
                } catch (err) {
                    console.error('Lỗi đọc file JSON:', file.name, err);
                    stats.filesFailed++;
                }
            }

            // Đánh lại số thứ tự cấu trúc liên tục sau khi gộp
            customStructures.forEach((cs, idx) => {
                cs.number = BASE_STRUCTURES.length + idx + 1;
            });

            localStorage.setItem('va_custom_structures', JSON.stringify(customStructures));
            localStorage.setItem('va_custom_situations', JSON.stringify(customSituationsMap));
            localStorage.setItem('va_structure_overrides', JSON.stringify(structureOverrides));
            localStorage.setItem('va_situation_overrides', JSON.stringify(situationOverrides));
            localStorage.setItem('va_deleted_situations', JSON.stringify(deletedSituationIds));
            localStorage.setItem('va_deleted_structures', JSON.stringify(deletedStructureIds));

            // Reset input file để có thể chọn tiếp file khác ngay lập tức
            event.target.value = '';

            refreshAdminStatsAndSelects();
            runRealtimeDuplicateScan();

            if (stats.filesOk > 0) {
                const parts = [];
                if (stats.addedStructures > 0) parts.push(`+${stats.addedStructures} cấu trúc mới`);
                if (stats.mergedStructures > 0) parts.push(`gộp vào ${stats.mergedStructures} cấu trúc cũ`);
                if (stats.addedSituations > 0) parts.push(`+${stats.addedSituations} tình huống`);
                if (stats.skippedDuplicates > 0) parts.push(`bỏ qua ${stats.skippedDuplicates} câu trùng`);
                const detail = parts.length > 0 ? parts.join(' • ') : 'Dữ liệu đã có sẵn trong kho';
                showToast(`✅ Đã gộp ${stats.filesOk} file JSON thành công (${detail})!`, 'success');
            }
            if (stats.filesFailed > 0) {
                showToast(`⚠️ Có ${stats.filesFailed} file JSON không đúng định dạng!`, 'warning');
            }
        }

        function getBaseStructuresSummary() {
            const structCount = Array.isArray(BASE_STRUCTURES) ? BASE_STRUCTURES.length : 0;
            const sentenceCount = Array.isArray(BASE_STRUCTURES)
                ? BASE_STRUCTURES.reduce((sum, st) => sum + ((st.situations || []).length), 0)
                : 0;
            return { structCount, sentenceCount };
        }

        function resetCustomAdminData() {
            const { structCount, sentenceCount } = getBaseStructuresSummary();
            pendingDeleteAction = { type: 'reset_all' };

            if (structCount === 0) {
                document.getElementById('confirm-delete-title').innerText = "Xác nhận dọn dữ liệu tạm (localStorage)";
                document.getElementById('confirm-delete-desc').innerHTML = "Bạn có chắc chắn muốn xóa toàn bộ cấu trúc/chỉnh sửa tạm trong trình duyệt và <strong>đặt lại theo file <code>questions_data.js</code> hiện tại (0 cấu trúc • Kho trống)</strong> không?";
                document.getElementById('confirm-delete-vi').innerText = "Đặt lại về nguyên bản file questions_data.js (0 cấu trúc • 0 tình huống)";
                document.getElementById('confirm-delete-en').innerText = "All temporary custom data in localStorage will be cleared.";
            } else {
                document.getElementById('confirm-delete-title').innerText = "Xác nhận khôi phục theo file dữ liệu gốc";
                document.getElementById('confirm-delete-desc').innerHTML = `Bạn có chắc chắn muốn xóa các thay đổi/cấu trúc tự thêm trong trình duyệt và <strong>khôi phục kho dữ liệu về nguyên bản file <code>questions_data.js</code> (${structCount} cấu trúc • ${sentenceCount} câu)</strong> không?`;
                document.getElementById('confirm-delete-vi').innerText = `Khôi phục nguyên bản file questions_data.js (${structCount} bộ cấu trúc • ${sentenceCount} tình huống)`;
                document.getElementById('confirm-delete-en').innerText = "All custom edits and deleted flags in localStorage will be reset.";
            }

            document.getElementById('confirm-delete-preview').classList.remove('hidden');
            document.getElementById('confirm-delete-modal').classList.remove('hidden');
        }

        function executeResetCustomAdminData() {
            const { structCount, sentenceCount } = getBaseStructuresSummary();
            customStructures = [];
            customSituationsMap = {};
            structureOverrides = {};
            situationOverrides = {};
            deletedSituationIds = [];
            deletedStructureIds = [];
            localStorage.removeItem('va_custom_structures');
            localStorage.removeItem('va_custom_situations');
            localStorage.removeItem('va_structure_overrides');
            localStorage.removeItem('va_situation_overrides');
            localStorage.removeItem('va_deleted_situations');
            localStorage.removeItem('va_deleted_structures');
            refreshAdminStatsAndSelects();
            if (structCount === 0) {
                showToast("Đã dọn sạch bộ nhớ tạm! Kho hiện khớp với file questions_data.js (0 cấu trúc).", "success");
            } else {
                showToast(`Đã khôi phục kho dữ liệu về nguyên bản file questions_data.js (${structCount} cấu trúc • ${sentenceCount} câu)!`, "success");
            }
        }

        function showToast(message, type = "info") {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const colors = {
                success: "bg-slate-900 text-white border-l-4 border-emerald-400",
                warning: "bg-slate-900 text-white border-l-4 border-amber-400",
                info: "bg-slate-900 text-white border-l-4 border-indigo-400"
            };
            toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-medium ${colors[type] || colors.info}`;
            toast.innerHTML = `<span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3200);
        }

        document.addEventListener('DOMContentLoaded', () => {

            updateAdminGeminiHeaderStatus();
            updateMatrixPreviewBanner();
            refreshAdminStatsAndSelects();
            runRealtimeDuplicateScan();
        });

        // ==================== XUẤT DỮ LIỆU THEO TỪNG CHẶNG (DATA LAYER: data/stage_X.js) ====================
        function openExportStageModal() {
            const existing = document.getElementById('admin-export-stage-modal');
            if (existing) existing.remove();

            const mergedAll = getMergedStructures();
            const stageCounts = {};
            mergedAll.forEach(st => {
                const sid = resolveAdminStageId(st);
                if (!stageCounts[sid]) stageCounts[sid] = { structs: 0, sits: 0 };
                stageCounts[sid].structs += 1;
                stageCounts[sid].sits += (st.situations || []).length;
            });

            const stagesList = (typeof ADMIN_ROADMAP_STAGES !== 'undefined' ? ADMIN_ROADMAP_STAGES : [
                { id: 'stage_1', title: 'Chặng 1: Khởi động & Giới thiệu bản thân' },
                { id: 'stage_2', title: 'Chặng 2: Nhịp sống, Ăn uống & Mua sắm' },
                { id: 'stage_3', title: 'Chặng 3: Hành động đang diễn ra & Mô tả' },
                { id: 'stage_4', title: 'Chặng 4: Kể chuyện Quá khứ & Chuyến đi' },
                { id: 'stage_5', title: 'Chặng 5: Kế hoạch, Khả năng & Lời khuyên' },
                { id: 'stage_6', title: 'Chặng 6: Trải nghiệm & Kết nối (HTHT)' },
                { id: 'stage_7', title: 'Chặng 7: Giao tiếp Lịch sự, Công sở & Điều kiện' },
                { id: 'stage_8', title: 'Chặng 8: Phản xạ B1 Thực chiến & Diễn đạt tự nhiên' }
            ]);

            const rowsHtml = stagesList.map(stInfo => {
                const stat = stageCounts[stInfo.id] || { structs: 0, sits: 0 };
                const hasData = stat.structs > 0;
                return `
                    <div class="flex items-center justify-between gap-3 p-3 rounded-2xl border ${hasData ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/70 opacity-70'}">
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">${stInfo.title}</div>
                            <div class="text-[11px] text-slate-500 mt-0.5">${stat.structs} cấu trúc • ${stat.sits} tình huống • file <code>data/${stInfo.id}.js</code></div>
                        </div>
                        <button type="button" onclick="exportStageDataJS('${stInfo.id}')" ${hasData ? '' : 'disabled'} class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold ${hasData ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} transition-all">
                            <i class="fa-solid fa-download mr-1"></i>Xuất ${stInfo.id}.js
                        </button>
                    </div>
                `;
            }).join('');

            const modal = document.createElement('div');
            modal.id = 'admin-export-stage-modal';
            modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4';
            modal.setAttribute('onclick', 'if(event.target === this) this.remove()');
            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-4 text-white flex items-center justify-between">
                        <div>
                            <h3 class="font-extrabold text-sm sm:text-base">Xuất dữ liệu theo từng Chặng (Data Layer)</h3>
                            <p class="text-[11px] text-emerald-100 mt-0.5">Chọn Chặng để tải file <code>stage_X.js</code> chép vào thư mục <code>data/</code></p>
                        </div>
                        <button type="button" onclick="document.getElementById('admin-export-stage-modal')?.remove()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-2.5">
                        ${rowsHtml}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function exportStageDataJS(stageId) {
            const mergedAll = getMergedStructures();
            const stageInfo = getAdminStageInfo(stageId);
            const stageStructsRaw = mergedAll.filter(st => resolveAdminStageId(st) === stageId);

            if (stageStructsRaw.length === 0) {
                showToast(`Chặng ${stageId} chưa có cấu trúc nào để xuất!`, "warning");
                return;
            }

            const cleanStructures = stageStructsRaw.map((st, idx) => {
                const normTopics = (Array.isArray(st.topics) && st.topics.length > 0)
                    ? Array.from(new Set(st.topics.map(t => normalizeAdminTopic(t))))
                    : ['daily'];
                const cleanSits = (st.situations || []).map(s => {
                    const copy = { ...s };
                    copy.topic = normalizeAdminTopic(copy.topic, normTopics);
                    delete copy.isCustomAdded;
                    delete copy.isEdited;
                    return copy;
                });
                return {
                    id: st.id,
                    number: idx + 1,
                    stageId,
                    stage: stageInfo.title,
                    orderInStage: idx + 1,
                    level: ({ basic: 'A2', intermediate: 'B1', advanced: 'C1' }[st.level] || st.level || 'B1'),
                    topics: normTopics,
                    title: st.title,
                    shortName: st.shortName,
                    formula: st.formula,
                    description: st.description,
                    tips: st.tips || [],
                    requiredPatterns: st.requiredPatterns || [st.shortName],
                    situations: cleanSits
                };
            });

            const structIdSet = new Set(cleanStructures.map(s => s.id));
            const existingVocab = Array.isArray(window.VOCAB_REPOSITORY_DATA) ? window.VOCAB_REPOSITORY_DATA : [];
            const stageVocab = existingVocab.filter(v => v && (v.stageId === stageId || structIdSet.has(v.structId)));
            const totalSits = cleanStructures.reduce((sum, s) => sum + s.situations.length, 0);

            const fileContent = `/**
 * DỮ LIỆU ${stageInfo.title.toUpperCase()} (data/${stageId}.js)
 * Xuất từ ViệtAnh Admin Studio ngày ${new Date().toLocaleDateString('vi-VN')}
 * Gồm: ${cleanStructures.length} Trạm ngữ pháp (${totalSits} tình huống) + ${stageVocab.length} từ vựng trọng tâm.
 */

if (window.VA_DATA_REGISTRY && typeof window.VA_DATA_REGISTRY.registerStage === 'function') {
    window.VA_DATA_REGISTRY.registerStage('${stageId}', {
        title: ${JSON.stringify(stageInfo.title)},
        structures: ${JSON.stringify(cleanStructures, null, 4)},
        vocab: ${JSON.stringify(stageVocab, null, 4)}
    });
}
`;

            const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${stageId}.js`;
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('admin-export-stage-modal')?.remove();
            showToast(`✅ Đã xuất file data/${stageId}.js (${cleanStructures.length} cấu trúc, ${totalSits} tình huống)!`, "success");
        }


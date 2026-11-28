/**
 * MODULE 1: QUẢN LÝ LƯU TRỮ & TRẠNG THÁI (js/storage_manager.js)
 * Phụ trách: Khởi tạo dữ liệu, quản lý State, LocalStorage (XP, Streak, Sổ tay, Hộp ôn tập 3 ngày, Tài khoản & Đồng bộ Admin)
 */

    // ==========================================
    // KHUNG SƠ ĐỒ HỌC A1–B1 CỐ ĐỊNH (8 CHẶNG & 5 CHỦ ĐỀ)
    // ==========================================
    const ROADMAP_STAGES = [
        {
            id: 'stage_1',
            number: 1,
            levelRange: 'A1',
            shortTitle: 'Chặng 1',
            title: 'Chặng 1: Khởi động & Giới thiệu bản thân',
            desc: 'Chào hỏi, tên, nghề nghiệp, quốc tịch (To be), thông tin cá nhân, This/That/These/Those, Have got, There is/are.'
        },
        {
            id: 'stage_2',
            number: 2,
            levelRange: 'A1',
            shortTitle: 'Chặng 2',
            title: 'Chặng 2: Nhịp sống, Ăn uống & Mua sắm',
            desc: 'Hiện tại đơn (+ / - / ?), trạng từ tần suất, mạo từ a/an/the, How much/many, lượng từ, gọi món & mua sắm.'
        },
        {
            id: 'stage_3',
            number: 3,
            levelRange: 'A1–A2',
            shortTitle: 'Chặng 3',
            title: 'Chặng 3: Hành động đang diễn ra & Mô tả',
            desc: 'Hiện tại tiếp diễn, đối chiếu Hiện tại đơn, mô tả ngoại hình/tính cách (What... like?), So sánh hơn & nhất, Wh-/How.'
        },
        {
            id: 'stage_4',
            number: 4,
            levelRange: 'A2',
            shortTitle: 'Chặng 4',
            title: 'Chặng 4: Kể chuyện Quá khứ & Chuyến đi',
            desc: 'Quá khứ đơn (Was/Were & V-ed/V2/Didn\'t/Did), lần đầu/lần cuối, cảm xúc, kể kỳ nghỉ & du lịch/sân bay.'
        },
        {
            id: 'stage_5',
            number: 5,
            levelRange: 'A2',
            shortTitle: 'Chặng 5',
            title: 'Chặng 5: Khả năng, Nghĩa vụ & Lời khuyên',
            desc: 'Can/Can\'t, Have to/Don\'t have to, Should/Shouldn\'t, gợi ý, đề nghị giúp đỡ & viết lời mời lịch sự.'
        },
        {
            id: 'stage_6',
            number: 6,
            levelRange: 'A2–B1',
            shortTitle: 'Chặng 6',
            title: 'Chặng 6: Kế hoạch, Dự định & Tương lai',
            desc: 'Ngày tháng, giờ giấc, lễ hội, lịch hẹn, Be going to, Present Continuous cho tương lai, Want/Would like, Will/Might.'
        },
        {
            id: 'stage_7',
            number: 7,
            levelRange: 'B1',
            shortTitle: 'Chặng 7',
            title: 'Chặng 7: Trải nghiệm & Giao tiếp Lịch sự',
            desc: 'Hiện tại hoàn thành (Ever/Never, For/Since) vs. Quá khứ đơn, Yêu cầu/Xin phép lịch sự, Đồng tình/Phản đối, Phỏng vấn 60 giây.'
        },
        {
            id: 'stage_8',
            number: 8,
            levelRange: 'B1',
            shortTitle: 'Chặng 8',
            title: 'Chặng 8: Phản xạ B1 Thực chiến (Mở rộng)',
            desc: 'It takes/took + time + to V, Used to/Be used to, Would rather... than, It\'s high time, If loại 1–2, Although/Not only... but also.'
        }
    ];

    const VALID_TOPICS = ['daily', 'food_shop', 'travel', 'office', 'interview'];

    function getStageInfoById(stageId) {
        return ROADMAP_STAGES.find(s => s.id === stageId) || ROADMAP_STAGES[ROADMAP_STAGES.length - 1];
    }

    function resolveStructureStageId(struct) {
        if (!struct) return 'stage_1';
        if (struct.stageId && ROADMAP_STAGES.some(s => s.id === struct.stageId)) {
            return struct.stageId;
        }
        const stageText = String(struct.stage || '').toLowerCase();
        const numMatch = stageText.match(/chặng\s*(\d+)/i) || stageText.match(/stage[_\s]*(\d+)/i);
        if (numMatch) {
            const idx = Math.min(ROADMAP_STAGES.length, Math.max(1, parseInt(numMatch[1], 10)));
            return `stage_${idx}`;
        }
        const lvl = (struct.level || 'B1').toUpperCase();
        if (lvl === 'A1') return 'stage_1';
        if (lvl === 'A2') return 'stage_4';
        return 'stage_8';
    }

    function normalizeTopicKey(rawTopic, fallbackTopics = []) {
        const clean = String(rawTopic || '').toLowerCase().trim();
        if (VALID_TOPICS.includes(clean)) return clean;
        if (['food', 'shop', 'shopping', 'restaurant', 'cafe'].includes(clean)) return 'food_shop';
        if (['work', 'business', 'email', 'study'].includes(clean)) return 'office';
        if (['career', 'job', 'goals'].includes(clean)) return 'interview';
        if (Array.isArray(fallbackTopics) && fallbackTopics.length > 0) {
            const firstValid = fallbackTopics.map(t => String(t || '').toLowerCase().trim()).find(t => VALID_TOPICS.includes(t));
            if (firstValid) return firstValid;
        }
        return 'daily';
    }
    

    // ==========================================
    // HỆ THỐNG ÔN TẬP THÔNG MINH (SPACED REPETITION)
    // ==========================================


    // 1. Kiểm tra và tự động đưa câu trả lời dưới 7.0 điểm vào Hộp ôn tập (hoặc xóa đi nếu đã đạt >= 7.0)
    function normalizeReviewMatchVi(str) {
        return String(str || '')
            .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    // 1. Kiểm tra và tự động đưa câu trả lời dưới 7.0 điểm vào Hộp ôn tập (hoặc xóa đi nếu đã đạt >= 7.0)
    function checkAndAddToReviewBox(structId, situationId, score, userTranslation, viSentence = "") {
        let reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
        const normVi = normalizeReviewMatchVi(viSentence);
        const sidStr = situationId !== undefined && situationId !== null ? String(situationId).trim() : '';

        const isSameReviewItem = (item) => {
            if (!item || typeof item !== 'object') return false;
            const itemSid = String(item.situationId || item.id || '').trim();
            if (sidStr && itemSid && itemSid === sidStr) return true;
            const itemVi = normalizeReviewMatchVi(item.vi);
            return Boolean(normVi && itemVi && itemVi === normVi);
        };

        const matchedIndices = [];
        reviewBox.forEach((item, idx) => {
            if (isSameReviewItem(item)) matchedIndices.push(idx);
        });

        if (score < 7.0) {
            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + 3); // Hẹn 3 ngày sau

            const reviewItem = {
                structId,
                situationId,
                vi: viSentence,
                score,
                userTranslation,
                addedAt: new Date().toISOString(),
                nextReviewDue: nextReviewDate.toISOString()
            };

            if (matchedIndices.length > 0) {
                reviewBox[matchedIndices[0]] = reviewItem;
                // Xóa các bản ghi trùng lặp phía sau (nếu có)
                for (let i = matchedIndices.length - 1; i >= 1; i--) {
                    reviewBox.splice(matchedIndices[i], 1);
                }
            } else {
                reviewBox.push(reviewItem);
            }
            localStorage.setItem('va_review_box', JSON.stringify(reviewBox));
        } else if (matchedIndices.length > 0) {
            // Đạt chuẩn (>= 7.0) -> Gỡ toàn bộ bản ghi khớp của câu này khỏi Hộp ôn tập
            for (let i = matchedIndices.length - 1; i >= 0; i--) {
                reviewBox.splice(matchedIndices[i], 1);
            }
            localStorage.setItem('va_review_box', JSON.stringify(reviewBox));
            if (typeof renderReviewPage === 'function') {
                const viewReview = document.getElementById('view-review');
                if (viewReview && !viewReview.classList.contains('hidden')) renderReviewPage();
            }
            showToast("Tuyệt vời! Câu này đã đạt chuẩn và được đưa ra khỏi Hộp ôn tập.", "success");
        }
        updateReviewBadgeCount();
    }

    // 2. Cập nhật số lượng thông báo (Badge) trên nút Hộp ôn tập
    function updateReviewBadgeCount() {
        const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
        const badgeEl = document.getElementById('review-badge-count');
        if (badgeEl) {
            badgeEl.textContent = reviewBox.length;
            badgeEl.style.display = reviewBox.length > 0 ? 'inline-flex' : 'none';
        }
    }

    // 3. Giao diện Modal Hộp ôn tập (renderReviewBoxModal) được quản lý tập trung tại js/app_controller.js

   // 4. Chế độ luyện tập nhanh một câu cụ thể từ Hộp ôn tập
    function startQuickReview(structId, situationId) {
        document.getElementById('review-box-modal')?.remove();
        loadSituation(structId, situationId);
        showToast('Đã chuyển đến câu ôn tập nhanh!', 'success');
    }

    // 5. Hàm điều hướng trực tiếp đến đúng cấu trúc và tình huống cần ôn
    function loadSituation(structId, situationId) {
        switchTab('practice');
        switchPracticeMode('structure');
        const struct = SENTENCE_STRUCTURES.find(s => s.id === structId);
        if (struct) {
            openStructureWorkspace(structId);
            const sitIndex = struct.situations.findIndex(s => s.id === situationId);
            if (sitIndex !== -1) {
                selectSituation(sitIndex);
            }
        }
    }

        // 1. CẤU HÌNH API & DỮ LIỆU KHỞI TẠO
        const apiKey = ""; // Khóa API cá nhân được quản lý an toàn qua BYOK trong localStorage ('va_gemini_api_key')

        window.getUserGeminiApiKey = function () {
            try {
                const stored = (localStorage.getItem('va_gemini_api_key') || '').trim();
                if (stored) return stored;
            } catch (e) {}
            return (apiKey && !apiKey.includes('[Dán_Mã')) ? apiKey : '';
        };

        // Đọc toàn bộ dữ liệu gốc từ questions_data.js (Tôn trọng mảng rỗng [] khi Admin đã dọn trống kho!)
        const rawBaseData = (typeof window.SENTENCE_STRUCTURES_DATA !== 'undefined' && Array.isArray(window.SENTENCE_STRUCTURES_DATA))
            ? window.SENTENCE_STRUCTURES_DATA
            : (typeof SENTENCE_STRUCTURES_DATA !== 'undefined' && Array.isArray(SENTENCE_STRUCTURES_DATA) ? SENTENCE_STRUCTURES_DATA : []);

        const initDeletedStructIds = JSON.parse(localStorage.getItem('va_deleted_structures')) || [];
        const initCustomStructures = JSON.parse(localStorage.getItem('va_custom_structures')) || [];

        const mapStructures = new Map();
        rawBaseData.forEach(st => {
            if (st && st.id && !initDeletedStructIds.includes(st.id)) {
                mapStructures.set(st.id, { ...st, situations: [...(st.situations || [])] });
            }
        });
        initCustomStructures.forEach(st => {
            if (st && st.id && !mapStructures.has(st.id)) {
                mapStructures.set(st.id, { ...st, situations: [...(st.situations || [])] });
            }
        });
        let SENTENCE_STRUCTURES = Array.from(mapStructures.values());

        // Phương án A (1 nguồn dữ liệu duy nhất): EXERCISE_BANK tự động tổng hợp từ SENTENCE_STRUCTURES (bỏ 16 câu cũ lệch trình độ)
        let EXERCISE_BANK = [];

        const TOPIC_LABELS = {
            daily: "Hàng ngày",
            food_shop: "Ăn uống & Mua sắm",
            travel: "Du lịch & Di chuyển",
            office: "Công sở & Học tập",
            interview: "Phỏng vấn & Mục tiêu"
        };

        const LEVEL_LABELS = {
            A1: { short: "A1", text: "A1 • Beginner", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            A2: { short: "A2", text: "A2 • Elementary", color: "bg-teal-50 text-teal-700 border-teal-200" },
            B1: { short: "B1", text: "B1 • Intermediate", color: "bg-sky-50 text-sky-700 border-sky-200" },
            B2: { short: "B2", text: "B2 • Upper-Inter", color: "bg-amber-50 text-amber-800 border-amber-200" },
            C1: { short: "C1", text: "C1 • Advanced", color: "bg-rose-50 text-rose-700 border-rose-200" },
            C2: { short: "C2", text: "C2 • Proficiency", color: "bg-purple-50 text-purple-700 border-purple-200" },
            // Tương thích ngược với dữ liệu cũ đã lưu trong localStorage
            basic: { short: "A2", text: "A2 • Elementary", color: "bg-teal-50 text-teal-700 border-teal-200" },
            intermediate: { short: "B1", text: "B1 • Intermediate", color: "bg-sky-50 text-sky-700 border-sky-200" },
            advanced: { short: "C1", text: "C1 • Advanced", color: "bg-rose-50 text-rose-700 border-rose-200" }
        };

        const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

        const STATUS_FILTER_LABELS = {
            all: { text: "Tất cả trạng thái", icon: "fa-layer-group" },
            unlearned: { text: "Chưa học", icon: "fa-circle-dot" },
            retry: { text: "Cần làm lại", icon: "fa-rotate-left" },
            completed: { text: "Đã đạt", icon: "fa-circle-check" }
        };

        function normalizeCEFRLevel(lvl) {
            const map = { basic: "A2", intermediate: "B1", advanced: "C1" };
            return map[lvl] || (CEFR_ORDER.includes(lvl) ? lvl : "B1");
        }

        function getSituationLearningStatus(sitId) {
            const passScore = state.completedSituations[sitId] || 0;
            if (passScore >= 7) return "completed";
            if (state.failedSituations[sitId] !== undefined) return "retry";
            return "unlearned";
        }

        const TENSE_LABELS = {
            present: "Thì Hiện tại",
            past: "Thì Quá khứ",
            future: "Thì Tương lai"
        };

        const FORM_LABELS = {
            affirmative: "Khẳng định (+)",
            negative: "Phủ định (-)",
            question: "Câu hỏi (?)"
        };

        const GRAMMAR_FEATURE_LABELS = {
            infinitive_gerund: "To-V & V-ing",
            polite_modal: "Cầu khiến / Xin phép",
            conjunction_inversion: "Liên từ & Đảo ngữ",
            habit_adaptation: "Thói quen & Thích nghi",
            concession: "Mệnh đề nhượng bộ",
            subjunctive_conditional: "Câu ước & Giả định"
        };

        // Hàm tự động phân loại thuộc tính ngữ pháp (Thì, Thể câu, Mẫu câu) cho mọi tình huống
        function getQuestionGrammarMeta(question, parentStruct = null) {
            const sample = (question.sampleCasual || "").trim();
            const lowerSample = sample.toLowerCase();
            const lowerVi = (question.vi || "").toLowerCase();
            const lowerCtx = (question.context || "").toLowerCase();

            // 1. Phân loại Thể câu (Sentence Form: question | negative | affirmative)
            let form = "affirmative";
            if (sample.endsWith("?") || (question.vi || "").endsWith("?") || lowerCtx.includes("câu hỏi")) {
                form = "question";
            } else if (
                lowerCtx.includes("phủ định") ||
                /\b(not|never|barely|hardly|no rush|don't|doesn't|didn't|won't|wouldn't|can't|couldn't|hadn't|isn't|aren't)\b/i.test(lowerSample)
            ) {
                form = "negative";
            }

            // 2. Phân loại Thì (Tense: past | future | present)
            // Xử lý thông minh cấu trúc giả định lùi thì (Would you mind if I + V-ed / I wish + V-ed / It's high time + V-ed)
            const structId = parentStruct ? parentStruct.id : (question.structureInfo ? question.structureInfo.id : null);
            const isExplicitPastContext =
                lowerCtx.includes("quá khứ") ||
                /\b(yesterday|ago|last night|back when|back in|when i was|when i first)\b/i.test(lowerSample) ||
                /\b(hôm qua|trước đây|đã từng|hồi còn|ngày xưa)\b/i.test(lowerVi);

            let tense = "present";
            if (isExplicitPastContext) {
                tense = "past";
            } else if (structId === 'struct_2' || (structId === 'struct_6' && !/\bhad(n't|\s+not)?\s+\w+/i.test(lowerSample)) || /\b(high time|about time)\b/i.test(lowerSample)) {
                // Câu xin phép hiện tại (Would you mind if I sat), câu ước ở hiện tại (I wish I had/were/could) hoặc It's high time -> tính là Hiện tại
                tense = "present";
            } else if (
                /\b(took|did|didn't|was|were|had|hadn't|tried|forgot|missed|delayed|booked|moved|used to)\b/i.test(lowerSample)
            ) {
                tense = "past";
            } else if (
                lowerCtx.includes("tương lai") ||
                /\b(will|it'll|you'll|we'll|tomorrow|soon|upcoming)\b/i.test(lowerSample) ||
                /\b(sẽ|ngày mai|chiều mai|sáng mai|tuần này|sắp tới)\b/i.test(lowerVi)
            ) {
                tense = "future";
            }

            return { tense, form };
        }

        // 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)
        let state = {
            practiceMode: 'structure', // 'structure' (mặc định) | 'topic'
            structViewMode: 'roadmap', // 'roadmap' (Sơ đồ 8 Chặng mặc định) | 'library' (Thư viện lọc)
            activeCheckpointStageId: null, // null | 'stage_1'..'stage_8' khi đang Ôn trộn cuối Chặng
            selectedStructureId: null, // null = đang ở màn hình Sơ đồ / Thư viện
            structTopicFilter: 'all',  // Bộ lọc chủ đề cho thư viện cấu trúc
            structLevelFilter: 'all',  // Bộ lọc trình độ cho thư viện cấu trúc
            structTenseFilter: 'all',  // Bộ lọc Thì cho thư viện cấu trúc
            structFormFilter: 'all',   // Bộ lọc Thể câu (+ / - / ?) cho thư viện cấu trúc
            structSearchQuery: '',     // Từ khóa tìm kiếm nhanh (Việt / Anh)
            structStatusFilter: 'all', // 'all' | 'unlearned' | 'retry' | 'completed'
            lockFilterInWorkspace: true,
            structAdvExpanded: false,
            visibleStructLimit: 12,
            currentSituationIndex: 0,
            formulaExpanded: true,
            // Tiến độ các tình huống đã đạt chuẩn (>=7.0 và đúng cấu trúc): { "s1_1": 8.5 }
            completedSituations: JSON.parse(localStorage.getItem('va_completed_situations')) || {},
            // Lưu các tình huống làm sai / chưa đạt để nhắc làm lại (không tích xanh): { "s1_2": 2.0 }
            failedSituations: JSON.parse(localStorage.getItem('va_failed_situations')) || {},
            // Thông tin tài khoản người dùng đăng nhập
            user: JSON.parse(localStorage.getItem('va_user')) || null,
            authMode: 'login',

            // State cho chế độ Chủ đề tự do
            currentTopic: 'all',
            currentLevel: 'all',
            topicTenseFilter: 'all',
            topicFormFilter: 'all',
            topicSearchQuery: '',
            topicAdvExpanded: false,
            filteredList: [...EXERCISE_BANK],
            currentIndex: 0,

            // Thống kê chung & Sổ tay
            xp: parseInt(localStorage.getItem('va_xp')) || 0,
            streak: 0,
            longestStreak: 0,
            streakActiveToday: false,
            streakHistory: [],
            notebook: JSON.parse(localStorage.getItem('va_notebook')) || [],
            lastResult: null,
            activeHints: { 1: false, 2: false, 3: false }
        };

        function getDateKeyWithOffset(daysOffset = 0) {
            const d = new Date();
            d.setDate(d.getDate() + daysOffset);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        function getStreakMeta() {
            try {
                const raw = JSON.parse(localStorage.getItem('va_streak_meta'));
                if (raw && typeof raw === 'object') {
                    return {
                        current: Number(raw.current) || 0,
                        longest: Number(raw.longest) || 0,
                        lastActiveDate: raw.lastActiveDate || null,
                        history: Array.isArray(raw.history) ? raw.history : []
                    };
                }
            } catch (e) {}
            return { current: 0, longest: 0, lastActiveDate: null, history: [] };
        }

        function saveStreakMeta(meta) {
            try {
                localStorage.setItem('va_streak_meta', JSON.stringify(meta));
                localStorage.setItem('va_streak', String(meta.current || 0));
            } catch (e) {}
        }

        // Đồng bộ chuỗi ngày Streak thật theo lịch mỗi khi mở ứng dụng
        function syncDailyStreakOnLoad() {
            const today = getDateKeyWithOffset(0);
            const yesterday = getDateKeyWithOffset(-1);
            const meta = getStreakMeta();

            // Nếu đã bỏ lỡ quá 1 ngày (lastActiveDate không phải hôm nay cũng không phải hôm qua) -> reset chuỗi hiện tại về 0 (vẫn giữ kỷ lục longest)
            if (meta.lastActiveDate && meta.lastActiveDate !== today && meta.lastActiveDate !== yesterday) {
                meta.current = 0;
                saveStreakMeta(meta);
            }

            state.streak = meta.current;
            state.longestStreak = Math.max(meta.longest, meta.current);
            state.streakActiveToday = (meta.lastActiveDate === today);
            state.streakHistory = meta.history || [];
            updateStatsUI();
        }

        // Ghi nhận 1 ngày luyện tập hợp lệ (tự gọi khi học viên dịch đạt chuẩn >= 7.0 hoặc luyện nói >= 80%)
        function recordDailyPracticeActivity() {
            const today = getDateKeyWithOffset(0);
            const yesterday = getDateKeyWithOffset(-1);
            const meta = getStreakMeta();

            if (meta.lastActiveDate === today) {
                state.streak = meta.current;
                state.longestStreak = Math.max(meta.longest, meta.current);
                state.streakActiveToday = true;
                return false;
            }

            if (meta.lastActiveDate === yesterday) {
                meta.current = (meta.current || 0) + 1;
            } else {
                meta.current = 1;
            }

            meta.lastActiveDate = today;
            meta.longest = Math.max(meta.longest || 0, meta.current);
            const histSet = new Set(Array.isArray(meta.history) ? meta.history : []);
            histSet.add(today);
            meta.history = Array.from(histSet).sort().slice(-60);

            saveStreakMeta(meta);
            state.streak = meta.current;
            state.longestStreak = meta.longest;
            state.streakActiveToday = true;
            state.streakHistory = meta.history;
            updateStatsUI();

            if (typeof showToast === 'function') {
                const msg = meta.current === 1
                    ? '🔥 Đã thắp lửa chuỗi học tập ngày đầu tiên hôm nay!'
                    : `🔥 Tuyệt vời! Chuỗi học tập của bạn đã tăng lên ${meta.current} ngày liên tiếp!`;
                showToast(msg, 'success');
            }
            return true;
        }

        function updateStatsUI() {
            const streakEl = document.getElementById('streak-count');
            const xpEl = document.getElementById('xp-count');
            const flameEl = document.getElementById('streak-flame-icon');
            const badgeWrap = document.getElementById('header-streak-badge');

            if (streakEl) streakEl.innerText = state.streak;
            if (xpEl) xpEl.innerText = state.xp;

            if (flameEl && badgeWrap) {
                if (state.streakActiveToday) {
                    flameEl.className = 'fa-solid fa-fire text-orange-500 text-xs sm:text-sm';
                    badgeWrap.className = 'flex items-center gap-1 bg-orange-50 border border-orange-200/80 px-2 sm:px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-orange-100/70 transition-all';
                    badgeWrap.title = `🔥 Đã giữ lửa hôm nay! Chuỗi hiện tại: ${state.streak} ngày (Kỷ lục: ${state.longestStreak} ngày)`;
                } else {
                    flameEl.className = 'fa-solid fa-fire text-slate-400 text-xs sm:text-sm';
                    badgeWrap.className = 'flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 sm:px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-orange-50 transition-all';
                    badgeWrap.title = state.streak > 0
                        ? `⏳ Chuỗi ${state.streak} ngày đang chờ! Hoàn thành 1 câu hôm nay để giữ lửa.`
                        : 'Hoàn thành 1 câu đạt chuẩn hôm nay để bắt đầu chuỗi ngày học tập!';
                }
            }
        }

        // ==================== SAO LƯU & KHÔI PHỤC TIẾN ĐỘ HỌC VIÊN (.JSON v2) ====================
        function safeReadStorageJSON(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                if (raw === null || raw === undefined || raw === '') return fallback;
                return JSON.parse(raw);
            } catch (e) {
                return fallback;
            }
        }

        function exportStudentProgressJSON() {
            const vocabBank = safeReadStorageJSON('va_vocab_bank', []);

            const payload = {
                app: 'VietAnh Master',
                type: 'student_progress_backup',
                version: 2,
                exportedAt: new Date().toISOString(),
                data: {
                    profile: state.user || safeReadStorageJSON('va_user', null),
                    preferences: {
                        theme: localStorage.getItem('va_theme') || 'light',
                        ttsVoiceName: localStorage.getItem('va_tts_voice_name') || '',
                        geminiModel: localStorage.getItem('va_gemini_model') || '',
                        sidebarCollapsed: localStorage.getItem('va_ds_collapsed') === 'true'
                    },
                    progress: {
                        xp: state.xp || 0,
                        streakMeta: getStreakMeta(),
                        completedSituations: state.completedSituations || {},
                        failedSituations: state.failedSituations || {},
                        xpTracker: getXpTracker(),
                        dailyCounts: safeReadStorageJSON('va_daily_counts', {})
                    },
                    vocabBank: Array.isArray(vocabBank) ? vocabBank : [],
                    notebook: Array.isArray(state.notebook) ? state.notebook : [],
                    reviewBox: safeReadStorageJSON('va_review_box', []),
                    errorLogs: safeReadStorageJSON('va_error_logs', []),
                    warmupProgress: safeReadStorageJSON('va_warmup_progress_v1', null),
                    activities: {
                        dictationDone: safeReadStorageJSON('va_dictation_done', {}),
                        adSpeak: safeReadStorageJSON('va_ad_speak_v1', {}),
                        vocabQuizBest: Number(localStorage.getItem('va_vocab_quiz_best')) || 0
                    }
                }
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vietanh_progress_${getTodayDateKey()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            if (typeof showToast === 'function') {
                showToast('✅ Đã tải file sao lưu tiến độ chuẩn v2 (.json) về máy!', 'success');
            }
        }

        async function importStudentProgressJSON(event) {
            const file = event?.target?.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const isV2 = parsed && parsed.type === 'student_progress_backup' && Number(parsed.version) >= 2 && parsed.data;
                const d = (parsed && parsed.type === 'student_progress_backup' && parsed.data) ? parsed.data : parsed;

                if (!d) {
                    throw new Error('File JSON không đúng định dạng sao lưu tiến độ của ViệtAnh Master.');
                }

                // Chuẩn hóa dữ liệu chung cho cả bản v2 (mới) và v1 (cũ)
                const progress = isV2 ? (d.progress || {}) : {
                    xp: d.xp,
                    streakMeta: d.streakMeta,
                    completedSituations: d.completedSituations,
                    failedSituations: d.failedSituations,
                    xpTracker: d.xpTracker,
                    dailyCounts: d.dailyCounts || {}
                };

                if (typeof progress.xp === 'undefined' && !progress.completedSituations && !d.notebook && !d.vocabBank) {
                    throw new Error('File JSON không đúng định dạng sao lưu tiến độ của ViệtAnh Master.');
                }

                const profile = isV2 ? (d.profile || null) : (d.user || null);
                const preferences = isV2 ? (d.preferences || {}) : {};
                const activities = isV2 ? (d.activities || {}) : {};

                // Giải mã vocabBank (hỗ trợ cả mảng chuẩn v2 lẫn chuỗi lồng trong vocabStorage ở v1)
                let vocabBank = [];
                if (Array.isArray(d.vocabBank)) {
                    vocabBank = d.vocabBank;
                } else if (d.vocabStorage && typeof d.vocabStorage.va_vocab_bank === 'string') {
                    try {
                        const parsedVocab = JSON.parse(d.vocabStorage.va_vocab_bank);
                        if (Array.isArray(parsedVocab)) vocabBank = parsedVocab;
                    } catch (e) {}
                }

                const completedCount = Object.keys(progress.completedSituations || {}).length;
                const vocabCount = vocabBank.length;
                const errorCount = Array.isArray(d.errorLogs) ? d.errorLogs.length : 0;
                const streakNum = progress.streakMeta?.current ?? 0;
                const expDate = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString('vi-VN') : 'Không rõ';

                const ok = confirm(
                    `Khôi phục tiến độ từ file "${file.name}" (bản v${parsed.version || 1})?\n\n` +
                    `• Thời điểm sao lưu: ${expDate}\n` +
                    `• Điểm XP: ${progress.xp || 0} XP | Chuỗi Streak: ${streakNum} ngày\n` +
                    `• Câu đã đạt: ${completedCount} | Từ vựng Sổ tay: ${vocabCount} | Sổ lỗi: ${errorCount}\n\n` +
                    `(Tiến độ hiện tại trên trình duyệt này sẽ được thay bằng bản sao lưu. Khóa Gemini AI vẫn giữ nguyên.)`
                );
                if (!ok) {
                    event.target.value = '';
                    return;
                }

                // 1. Khôi phục Tiến độ (progress)
                state.xp = Number(progress.xp) || 0;
                localStorage.setItem('va_xp', String(state.xp));

                if (progress.streakMeta && typeof progress.streakMeta === 'object') {
                    saveStreakMeta(progress.streakMeta);
                }

                state.completedSituations = (progress.completedSituations && typeof progress.completedSituations === 'object') ? progress.completedSituations : {};
                localStorage.setItem('va_completed_situations', JSON.stringify(state.completedSituations));

                state.failedSituations = (progress.failedSituations && typeof progress.failedSituations === 'object') ? progress.failedSituations : {};
                localStorage.setItem('va_failed_situations', JSON.stringify(state.failedSituations));

                if (progress.xpTracker && typeof progress.xpTracker === 'object') {
                    saveXpTracker(progress.xpTracker);
                }
                if (progress.dailyCounts && typeof progress.dailyCounts === 'object') {
                    localStorage.setItem('va_daily_counts', JSON.stringify(progress.dailyCounts));
                }

                // 2. Khôi phục Hồ sơ (profile)
                if (profile && typeof profile === 'object') {
                    state.user = profile;
                    localStorage.setItem('va_user', JSON.stringify(profile));
                }

                // 3. Khôi phục Cài đặt cá nhân (preferences)
                if (preferences.theme) {
                    localStorage.setItem('va_theme', preferences.theme);
                    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
                }
                if (typeof preferences.ttsVoiceName === 'string' && preferences.ttsVoiceName) {
                    localStorage.setItem('va_tts_voice_name', preferences.ttsVoiceName);
                }
                if (typeof preferences.geminiModel === 'string' && preferences.geminiModel) {
                    localStorage.setItem('va_gemini_model', preferences.geminiModel);
                }
                if (typeof preferences.sidebarCollapsed === 'boolean') {
                    localStorage.setItem('va_ds_collapsed', String(preferences.sidebarCollapsed));
                }

                // 4. Khôi phục Từ vựng, Sổ tay, Hộp ôn tập & Sổ lỗi
                localStorage.setItem('va_vocab_bank', JSON.stringify(vocabBank));

                state.notebook = Array.isArray(d.notebook) ? d.notebook : [];
                localStorage.setItem('va_notebook', JSON.stringify(state.notebook));

                const restoredReview = Array.isArray(d.reviewBox) ? d.reviewBox : [];
                localStorage.setItem('va_review_box', JSON.stringify(restoredReview));

                if (Array.isArray(d.errorLogs)) {
                    localStorage.setItem('va_error_logs', JSON.stringify(d.errorLogs));
                }

                // 5. Khôi phục Tiến độ 1000 từ cốt lõi (warmupProgress) & Các chế độ luyện tập phụ (activities)
                if (d.warmupProgress && typeof d.warmupProgress === 'object') {
                    localStorage.setItem('va_warmup_progress_v1', JSON.stringify(d.warmupProgress));
                }
                if (activities.dictationDone && typeof activities.dictationDone === 'object') {
                    localStorage.setItem('va_dictation_done', JSON.stringify(activities.dictationDone));
                }
                if (activities.adSpeak && typeof activities.adSpeak === 'object') {
                    localStorage.setItem('va_ad_speak_v1', JSON.stringify(activities.adSpeak));
                }
                if (typeof activities.vocabQuizBest === 'number' && activities.vocabQuizBest > 0) {
                    localStorage.setItem('va_vocab_quiz_best', String(activities.vocabQuizBest));
                }

                // 6. Đồng bộ lại toàn bộ giao diện
                syncDailyStreakOnLoad();
                cleanupOrphanedProgressIDs();
                updateNotebookBadge();
                renderAuthHeaderUI();
                if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
                if (typeof renderLearningRoadmap === 'function') renderLearningRoadmap();
                if (typeof renderStructureLibrary === 'function') renderStructureLibrary();
                if (window.VA_WARMUP && typeof window.VA_WARMUP.renderAll === 'function') {
                    window.VA_WARMUP.renderAll();
                }

                if (typeof showToast === 'function') {
                    showToast(`✅ Đã khôi phục tiến độ thành công (${state.xp} XP • ${completedCount} câu • ${vocabCount} từ)!`, 'success');
                }
            } catch (err) {
                if (typeof showToast === 'function') {
                    showToast(`❌ Không thể khôi phục: ${err.message || 'File JSON bị lỗi.'}`, 'warning');
                }
            } finally {
                if (event && event.target) event.target.value = '';
            }
        }

        function addXP(amount) {
            state.xp += amount;
            localStorage.setItem('va_xp', state.xp);
            updateStatsUI();
        }

        // ==========================================
        // HỆ THỐNG TÍNH ĐIỂM XP CHỐNG CÀY ẢO (LUYỆN MỚI VS ÔN LẠI)
        // ==========================================
        function getTodayDateKey() {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        function getXpTracker() {
            try {
                const raw = JSON.parse(localStorage.getItem('va_xp_tracker')) || {};
                if (!raw.questions || typeof raw.questions !== 'object') raw.questions = {};
                if (!raw.completedStructsBonus || typeof raw.completedStructsBonus !== 'object') raw.completedStructsBonus = {};
                return raw;
            } catch (e) {
                return { questions: {}, completedStructsBonus: {} };
            }
        }

        function saveXpTracker(tracker) {
            try {
                localStorage.setItem('va_xp_tracker', JSON.stringify(tracker));
            } catch (e) {}
        }

        state.sessionAttemptMeta = {};

        function getSessionAttemptMeta(questionId) {
            if (!questionId) return null;
            if (!state.sessionAttemptMeta[questionId]) {
                const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
                const inReviewBox = reviewBox.some(item => item.situationId === questionId);
                const inFailedList = state.failedSituations[questionId] !== undefined && (state.completedSituations[questionId] || 0) < 7;
                const wasCompletedBefore = (state.completedSituations[questionId] || 0) >= 7;
                state.sessionAttemptMeta[questionId] = {
                    attempts: 0,
                    viewedDirectAnswer: false,
                    usedHints: [],
                    wasDueOrFailedAtStart: inReviewBox || inFailedList,
                    wasCompletedBeforeVisit: wasCompletedBefore,
                    xpAwardedThisVisit: 0,
                    structBonusAwardedId: null
                };
            }
            return state.sessionAttemptMeta[questionId];
        }

        function initSessionAttemptForQuestion(question) {
            if (!question || !question.id) return;
            // Khởi tạo nếu chưa có trong phiên (giữ nguyên số lần thử & cờ xem đáp án nếu người dùng bấm Làm lại)
            getSessionAttemptMeta(question.id);
        }

        function markSessionHintUsed(level) {
            const q = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
            if (!q || !q.id) return;
            const meta = getSessionAttemptMeta(q.id);
            if (!meta.usedHints.includes(level)) {
                meta.usedHints.push(level);
            }
        }

        function markSessionDirectAnswerViewed() {
            const q = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
            if (!q || !q.id) return;
            const meta = getSessionAttemptMeta(q.id);
            meta.viewedDirectAnswer = true;
        }

        function incrementSessionAttemptCount(question) {
            if (!question || !question.id) return null;
            const meta = getSessionAttemptMeta(question.id);
            meta.attempts += 1;
            return meta;
        }

        /**
         * Tính và cộng điểm XP công bằng theo bảng quy tắc Luyện mới vs Ôn lại
         * @param {Object} question - Câu hỏi hiện tại
         * @param {Number} score - Điểm số (0-10)
         * @param {Boolean} isPassed - Đạt >= 7.0 và đúng cấu trúc mục tiêu
         * @param {Boolean} isReEvaluation - true khi Gemini AI phúc khảo nâng điểm (chỉ cộng phần chênh lệch)
         */
        function calculateAndAwardSentenceXP(question, score, isPassed, isReEvaluation = false) {
            if (!question || !question.id) {
                return { xp: 0, bonusStructXp: 0, totalXp: 0, badgeText: '+0 XP', reason: '' };
            }

            const qId = question.id;
            const today = getTodayDateKey();
            const tracker = getXpTracker();
            const meta = getSessionAttemptMeta(qId);

            if (!isPassed) {
                // Nếu trước đó trong chính lượt này Tầng 1 lỡ chấm đậu & cộng XP, nhưng Gemini AI phúc khảo phát hiện Chưa đạt -> hoàn tác XP đã cộng
                if (isReEvaluation && meta.xpAwardedThisVisit > 0) {
                    const refundBase = meta.xpAwardedThisVisit;
                    let refundBonus = 0;
                    if (meta.structBonusAwardedId && tracker.completedStructsBonus[meta.structBonusAwardedId]) {
                        delete tracker.completedStructsBonus[meta.structBonusAwardedId];
                        refundBonus = 30;
                        meta.structBonusAwardedId = null;
                    }
                    const totalRefund = refundBase + refundBonus;
                    state.xp = Math.max(0, state.xp - totalRefund);
                    localStorage.setItem('va_xp', state.xp);
                    updateStatsUI();
                    meta.xpAwardedThisVisit = 0;
                    if (!meta.wasCompletedBeforeVisit && tracker.questions[qId] && tracker.questions[qId].firstPassedDate === today) {
                        delete tracker.questions[qId];
                    }
                    saveXpTracker(tracker);
                }
                return {
                    xp: 0,
                    bonusStructXp: 0,
                    totalXp: 0,
                    badgeText: '+0 XP • Cần sửa lại',
                    reason: 'Chưa đạt yêu cầu cấu trúc hoặc ngữ nghĩa.'
                };
            }

            const existingRec = tracker.questions[qId] || null;
            const prevCompletedScore = state.completedSituations[qId] || 0;
            const wasPreviouslyPassed = Boolean((existingRec && existingRec.firstPassedDate) || prevCompletedScore >= 7);

            const usedHint2Or3 = meta.usedHints.includes(2) || meta.usedHints.includes(3);
            const usedAnyHint = meta.usedHints.length > 0;

            let targetXp = 0;
            let reasonLabel = '';

            // 1. Ưu tiên kiểm tra: Câu từ Hộp ôn tập / Cần làm lại
            if (meta.wasDueOrFailedAtStart && !wasPreviouslyPassed) {
                if (score >= 9.0 && !usedAnyHint && !meta.viewedDirectAnswer) {
                    targetXp = 10;
                    reasonLabel = 'Ôn tập xuất sắc';
                } else {
                    targetXp = 8;
                    reasonLabel = 'Hoàn thành Hộp ôn tập';
                }
            }
            // 2. Luyện mới lần đầu (chưa từng đạt trước phiên này)
            else if (!wasPreviouslyPassed || (existingRec && existingRec.firstPassedDate === today && isReEvaluation && meta.xpAwardedThisVisit > 0)) {
                if (meta.viewedDirectAnswer) {
                    targetXp = 2;
                    reasonLabel = 'Gõ lại sau xem đáp án';
                } else if (meta.attempts >= 2) {
                    targetXp = 7;
                    reasonLabel = 'Sửa sai thành công';
                } else if (score >= 9.0 && !usedHint2Or3) {
                    targetXp = 15;
                    reasonLabel = 'Luyện mới xuất sắc';
                } else {
                    targetXp = 10;
                    reasonLabel = 'Luyện mới đạt chuẩn';
                }
            }
            // 3. Ôn lại câu ĐÃ hoàn thành trước đó
            else {
                const firstDate = (existingRec && existingRec.firstPassedDate) ? existingRec.firstPassedDate : '2000-01-01';
                const prevBest = Math.max(prevCompletedScore, (existingRec && existingRec.bestScore) || 0);

                if (firstDate !== today) {
                    // Ôn lại chủ động ở ngày khác (tối đa 1 lần/câu/ngày)
                    if (!existingRec || existingRec.lastReviewXpDate !== today) {
                        targetXp = 3;
                        reasonLabel = 'Ôn lại chủ động';
                    } else {
                        targetXp = 0;
                        reasonLabel = 'Đã nhận XP ôn hôm nay';
                    }
                } else {
                    // Ôn lại trong cùng ngày: 0 XP, trừ trường hợp nâng hạng từ < 9.0 lên >= 9.0 (cộng bù +3 XP 1 lần)
                    if (prevBest < 9.0 && score >= 9.0 && (!existingRec || !existingRec.sameDayUpgradeClaimed) && !meta.viewedDirectAnswer) {
                        targetXp = 3;
                        reasonLabel = 'Nâng hạng Xuất sắc';
                    } else {
                        targetXp = 0;
                        reasonLabel = 'Đã hoàn thành hôm nay';
                    }
                }
            }

            // Tính phần XP thực nhận (chống cộng đúp khi Gemini AI phúc khảo trên cùng 1 lần làm)
            let awardedXp = isReEvaluation
                ? Math.max(0, targetXp - meta.xpAwardedThisVisit)
                : Math.max(0, targetXp - meta.xpAwardedThisVisit);

            meta.xpAwardedThisVisit = Math.max(meta.xpAwardedThisVisit, targetXp);

            // Cập nhật lịch sử câu trong tracker
            const rec = tracker.questions[qId] || {
                firstPassedDate: today,
                bestScore: score,
                lastReviewXpDate: null,
                lastSpeakXpDate: null,
                sameDayUpgradeClaimed: false
            };

            if (!rec.firstPassedDate) rec.firstPassedDate = today;
            if (reasonLabel === 'Ôn lại chủ động' && awardedXp > 0) rec.lastReviewXpDate = today;
            if (reasonLabel === 'Nâng hạng Xuất sắc' && awardedXp > 0) rec.sameDayUpgradeClaimed = true;
            if (score > (rec.bestScore || 0)) rec.bestScore = score;
            tracker.questions[qId] = rec;

            // 4. Kiểm tra Thưởng hoàn thành 100% Cấu trúc (+30 XP, mỗi cấu trúc 1 lần duy nhất)
            let bonusStructXp = 0;
            if (question.isStructureMode && question.structureInfo) {
                const struct = question.structureInfo;
                const allDone = struct.situations.every(s => {
                    if (s.id === qId) return true;
                    return (state.completedSituations[s.id] || 0) >= 7;
                });
                if (allDone && !tracker.completedStructsBonus[struct.id]) {
                    tracker.completedStructsBonus[struct.id] = true;
                    bonusStructXp = 30;
                    meta.structBonusAwardedId = struct.id;
                }
            }

            saveXpTracker(tracker);

            // Ghi nhận ngày học hợp lệ để tăng / giữ chuỗi Streak thật theo lịch
            recordDailyPracticeActivity();

            const totalXp = awardedXp + bonusStructXp;
            if (totalXp > 0) {
                addXP(totalXp);
            }

            let badgeText = awardedXp > 0
                ? `+${awardedXp} XP • ${reasonLabel}`
                : `+0 XP • ${reasonLabel || 'Đã ghi nhận'}`;
            if (bonusStructXp > 0) {
                badgeText += ` (+${bonusStructXp} XP trọn bộ!)`;
            }

            return {
                xp: awardedXp,
                bonusStructXp,
                totalXp,
                badgeText,
                reason: reasonLabel
            };
        }

        // Thưởng luyện nói ("ĐỌC THỬ" đạt >= 80%): +2 XP tối đa 1 lần/câu/ngày
        function awardSpeakingPracticeXP(question, overallPercent) {
            if (!question || !question.id || overallPercent < 80) return 0;
            const today = getTodayDateKey();
            const tracker = getXpTracker();
            const qId = question.id;
            const rec = tracker.questions[qId] || {
                firstPassedDate: null,
                bestScore: 0,
                lastReviewXpDate: null,
                lastSpeakXpDate: null,
                sameDayUpgradeClaimed: false
            };

            if (rec.lastSpeakXpDate === today) return 0;
            rec.lastSpeakXpDate = today;
            tracker.questions[qId] = rec;
            saveXpTracker(tracker);

            addXP(2);
            recordDailyPracticeActivity();
            if (typeof showToast === 'function') {
                showToast(`🎙️ Phát âm chuẩn ${overallPercent}%! Bạn nhận được +2 XP luyện nói.`, 'success');
            }
            return 2;
        }



        function renderAuthHeaderUI() {
            const container = document.getElementById('user-auth-area');
            if (!container) return;
            if (state.user) {
                const initial = state.user.name.charAt(0).toUpperCase();
                container.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 transition-all">
                        <div onclick="switchTab('profile')" class="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center cursor-pointer" title="Xem bảng tiến độ cá nhân">
                            ${initial}
                        </div>
                        <span onclick="switchTab('profile')" class="text-xs font-bold text-slate-700 hidden sm:inline max-w-[90px] truncate cursor-pointer">${state.user.name}</span>
                        <button onclick="logoutUser()" class="ml-1 text-slate-400 hover:text-rose-600 text-xs" title="Đăng xuất">
                            <i class="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <button onclick="switchTab('profile')" class="w-9 h-9 sm:w-auto sm:h-auto inline-flex items-center justify-center gap-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 transition-all" title="Đăng nhập">
                        <i class="fa-regular fa-circle-user text-sm sm:text-base"></i>
                        <span class="hidden sm:inline">Hồ sơ</span>
                    </button>
                `;
            }
        }

        function openAuthModal(mode = 'login') {
            document.getElementById('auth-modal').classList.remove('hidden');
            switchAuthMode(mode);
        }

        function closeAuthModal() {
            document.getElementById('auth-modal').classList.add('hidden');
        }

        function switchAuthMode(mode) {
            state.authMode = mode;
            const loginTab = document.getElementById('tab-login-btn');
            const regTab = document.getElementById('tab-register-btn');
            const nameGroup = document.getElementById('auth-name-group');
            const modalTitle = document.getElementById('auth-modal-title');
            const submitBtn = document.getElementById('auth-submit-btn');

            if (mode === 'register') {
                regTab.className = "py-2 rounded-lg bg-white text-indigo-600 shadow-2xs transition-all";
                loginTab.className = "py-2 rounded-lg text-slate-500 hover:text-slate-800 transition-all";
                nameGroup.classList.remove('hidden');
                modalTitle.innerText = "Tạo hồ sơ học viên";
                submitBtn.innerText = "Tạo & Lưu trên thiết bị";
            } else {
                loginTab.className = "py-2 rounded-lg bg-white text-indigo-600 shadow-2xs transition-all";
                regTab.className = "py-2 rounded-lg text-slate-500 hover:text-slate-800 transition-all";
                nameGroup.classList.remove('hidden');
                modalTitle.innerText = "Cập nhật hồ sơ học viên";
                submitBtn.innerText = "Lưu hồ sơ trên thiết bị";
            }
        }

        function handleAuthSubmit(e) {
            e.preventDefault();
            const email = document.getElementById('auth-email').value.trim();
            const rawName = document.getElementById('auth-name').value.trim();
            const displayName = rawName || email.split('@')[0] || "Học viên";

            state.user = {
                name: displayName,
                email: email,
                lastSync: new Date().toISOString()
            };
            localStorage.setItem('va_user', JSON.stringify(state.user));
            closeAuthModal();
            renderAuthHeaderUI();
            renderHomeDashboard();
            if (typeof renderProfilePage === 'function') renderProfilePage();
            showToast(`Chào mừng ${displayName}! Hồ sơ đã được lưu trên thiết bị này.`, "success");
        }

        function quickDemoLogin() {
            state.user = {
                name: "Học viên ViệtAnh",
                email: "hocvien@vietanhmaster.vn",
                lastSync: new Date().toISOString()
            };
            localStorage.setItem('va_user', JSON.stringify(state.user));
            closeAuthModal();
            renderAuthHeaderUI();
            renderHomeDashboard();
            if (typeof renderProfilePage === 'function') renderProfilePage();
            showToast("Đã thiết lập nhanh hồ sơ Học viên ViệtAnh trên thiết bị này!", "success");
        }

        function logoutUser() {
            state.user = null;
            localStorage.removeItem('va_user');
            renderAuthHeaderUI();
            renderHomeDashboard();
            if (typeof renderProfilePage === 'function') renderProfilePage();
            showToast("Đã chuyển về chế độ Khách tự học. Tiến độ trên máy vẫn được giữ nguyên.", "info");
        }


        // Tổng hợp động kho câu cho Tab 2 "Luyện theo Chủ đề tự do" từ 1 nguồn dữ liệu duy nhất (Phương án A)
        function rebuildExerciseBankFromStructures() {
            const rebuilt = [];
            SENTENCE_STRUCTURES.forEach(struct => {
                const structTopics = Array.isArray(struct.topics) && struct.topics.length > 0
                    ? struct.topics.map(t => normalizeTopicKey(t))
                    : ['daily'];
                (struct.situations || []).forEach(sit => {
                    const sitTopic = normalizeTopicKey(sit.topic, structTopics);
                    rebuilt.push({
                        ...sit,
                        topic: sitTopic,
                        parentTopics: Array.from(new Set([sitTopic, ...structTopics])),
                        sourceStructId: struct.id,
                        sourceStructShortName: struct.shortName || struct.title,
                        sourceStageId: struct.stageId,
                        isStructureMode: false
                    });
                });
            });
            EXERCISE_BANK = rebuilt;
            return EXERCISE_BANK;
        }

        // Tự động dọn sạch các ID mồ côi (câu cũ đã xóa ở Admin) khỏi Hộp ôn tập & mục Cần làm lại
        function cleanupOrphanedProgressIDs() {
            const validSitIds = new Set();
            SENTENCE_STRUCTURES.forEach(st => {
                (st.situations || []).forEach(s => {
                    if (s && s.id) validSitIds.add(s.id);
                });
            });

            // 1. Dọn Hộp ôn tập (va_review_box): bỏ ID mồ côi & tự gộp thẻ trùng lặp (giữ bản mới nhất)
            try {
                const reviewBox = JSON.parse(localStorage.getItem('va_review_box')) || [];
                const seenKeys = new Map();
                const cleanedReview = [];

                // Duyệt từ mới -> cũ để luôn giữ bản ghi cập nhật gần nhất
                for (let i = reviewBox.length - 1; i >= 0; i--) {
                    const item = reviewBox[i];
                    if (!item || !validSitIds.has(item.situationId)) continue;

                    const sidKey = `id:${String(item.situationId).trim()}`;
                    const viKey = (typeof normalizeReviewMatchVi === 'function' && item.vi)
                        ? `vi:${normalizeReviewMatchVi(item.vi)}`
                        : '';

                    if (seenKeys.has(sidKey) || (viKey && seenKeys.has(viKey))) continue;

                    seenKeys.set(sidKey, true);
                    if (viKey) seenKeys.set(viKey, true);
                    cleanedReview.unshift(item);
                }

                if (cleanedReview.length !== reviewBox.length) {
                    localStorage.setItem('va_review_box', JSON.stringify(cleanedReview));
                }
            } catch (e) {}

            // 2. Dọn danh sách Cần làm lại (va_failed_situations)
            try {
                let failedChanged = false;
                Object.keys(state.failedSituations || {}).forEach(id => {
                    if (!validSitIds.has(id)) {
                        delete state.failedSituations[id];
                        failedChanged = true;
                    }
                });
                if (failedChanged) {
                    localStorage.setItem('va_failed_situations', JSON.stringify(state.failedSituations));
                }
            } catch (e) {}

            updateReviewBadgeCount();
        }

        // Đồng bộ toàn diện từ Admin Studio (Hỗ trợ va_deleted_structures, 8 Chặng cố định, 5 Chủ đề, Phương án A & dọn ID mồ côi)
        function syncCustomContentFromAdminStudio() {
            try {
                const customStructures = JSON.parse(localStorage.getItem('va_custom_structures')) || [];
                const customSituationsMap = JSON.parse(localStorage.getItem('va_custom_situations')) || {};
                const structureOverrides = JSON.parse(localStorage.getItem('va_structure_overrides')) || {};
                const situationOverrides = JSON.parse(localStorage.getItem('va_situation_overrides')) || {};
                const deletedSituationIds = JSON.parse(localStorage.getItem('va_deleted_situations')) || [];
                const deletedStructureIds = JSON.parse(localStorage.getItem('va_deleted_structures')) || [];

                // 0. Loại bỏ các cấu trúc gốc đã bị ẩn/xóa từ Admin Studio
                SENTENCE_STRUCTURES = SENTENCE_STRUCTURES.filter(st => st && st.id && !deletedStructureIds.includes(st.id));

                // 1. Gộp các tình huống mới thêm vào các cấu trúc hiện có
                SENTENCE_STRUCTURES.forEach(struct => {
                    const extraSits = customSituationsMap[struct.id] || [];
                    extraSits.forEach(newSit => {
                        if (newSit && !struct.situations.some(s => s.id === newSit.id)) {
                            struct.situations.push(newSit);
                        }
                    });
                });

                // 2. Gộp các cấu trúc hoàn toàn mới do Admin tạo
                customStructures.forEach(cStruct => {
                    if (!cStruct || !cStruct.id || deletedStructureIds.includes(cStruct.id)) return;
                    if (!SENTENCE_STRUCTURES.some(s => s.id === cStruct.id)) {
                        const extraSits = customSituationsMap[cStruct.id] || [];
                        SENTENCE_STRUCTURES.push({
                            ...cStruct,
                            situations: [...(cStruct.situations || []), ...extraSits]
                        });
                    }
                });

                // 3. Áp dụng chỉnh sửa (Overrides), lọc câu đã xóa, chuẩn hóa stageId/orderInStage/topic
                SENTENCE_STRUCTURES.forEach((struct, idx) => {
                    if (structureOverrides[struct.id]) {
                        Object.assign(struct, structureOverrides[struct.id]);
                    }
                    const stageId = resolveStructureStageId(struct);
                    const stageInfo = getStageInfoById(stageId);
                    struct.stageId = stageId;
                    struct.stage = stageInfo.title;
                    struct.orderInStage = Number.isFinite(Number(struct.orderInStage)) ? Number(struct.orderInStage) : (idx + 1);
                    struct.topics = (Array.isArray(struct.topics) && struct.topics.length > 0)
                        ? Array.from(new Set(struct.topics.map(t => normalizeTopicKey(t))))
                        : ['daily'];

                    struct.situations = (struct.situations || [])
                        .filter(sit => sit && !deletedSituationIds.includes(sit.id))
                        .map(sit => {
                            const merged = situationOverrides[sit.id] ? { ...sit, ...situationOverrides[sit.id] } : { ...sit };
                            merged.topic = normalizeTopicKey(merged.topic, struct.topics);
                            return merged;
                        });

                    // Sắp xếp câu trong mỗi cấu trúc từ A1 -> B1 (tăng dần độ khó)
                    struct.situations.sort((a, b) => {
                        return CEFR_ORDER.indexOf(normalizeCEFRLevel(a.level)) - CEFR_ORDER.indexOf(normalizeCEFRLevel(b.level));
                    });
                });

                // 4. Sắp xếp các cấu trúc theo đúng Chặng 1..8 -> Thứ tự trong chặng
                SENTENCE_STRUCTURES.sort((a, b) => {
                    const sa = ROADMAP_STAGES.findIndex(s => s.id === a.stageId);
                    const sb = ROADMAP_STAGES.findIndex(s => s.id === b.stageId);
                    if (sa !== sb) return sa - sb;
                    return (a.orderInStage || 0) - (b.orderInStage || 0);
                });
                SENTENCE_STRUCTURES.forEach((st, idx) => { st.number = idx + 1; });

                // 5. Đồng bộ 1 nguồn sang Tab Chủ đề tự do (Phương án A) & Dọn ID mồ côi
                rebuildExerciseBankFromStructures();
                cleanupOrphanedProgressIDs();
            } catch (e) {
                console.warn("Không thể đồng bộ dữ liệu Admin Studio:", e);
            }
        }

        // 7. QUẢN LÝ SỔ TAY (LOCALSTORAGE)
        function saveCurrentToNotebook() {
            if (!state.lastResult) return;

            // Kiểm tra trùng lặp câu tiếng Việt
            const exists = state.notebook.some(item => item.vi === state.lastResult.vi);
            if (exists) {
                showToast("Mẫu câu này đã có trong Sổ tay của bạn rồi!", "info");
                return;
            }

            state.notebook.unshift(state.lastResult);
            localStorage.setItem('va_notebook', JSON.stringify(state.notebook));
            updateNotebookBadge();

            // Cập nhật trạng thái nút
            const bookmarkBtn = document.getElementById('bookmark-result-btn');
            const bookmarkIcon = document.getElementById('bookmark-icon');
            const bookmarkText = document.getElementById('bookmark-text');
            bookmarkBtn.classList.add('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');
            bookmarkIcon.className = "fa-solid fa-bookmark text-indigo-600";
            bookmarkText.innerText = "Đã lưu vào sổ tay";

            showToast("Đã lưu mẫu câu vào Sổ tay thành công!", "success");
        }

        function deleteFromNotebook(id) {
            state.notebook = state.notebook.filter(item => item.id !== id);
            localStorage.setItem('va_notebook', JSON.stringify(state.notebook));
            updateNotebookBadge();
            renderNotebook();
            showToast("Đã xóa mẫu câu khỏi Sổ tay.", "info");
        }

        function updateNotebookBadge() {
            document.getElementById('notebook-badge').innerText = state.notebook.length;
        }

        function renderNotebook() {
            const listEl = document.getElementById('notebook-list');
            const emptyEl = document.getElementById('notebook-empty');

            if (state.notebook.length === 0) {
                listEl.innerHTML = '';
                emptyEl.classList.remove('hidden');
                return;
            }

            emptyEl.classList.add('hidden');
            listEl.innerHTML = state.notebook.map(item => `
                <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 mb-1.5">
                                ${item.topic}
                            </span>
                            <h3 class="text-base sm:text-lg font-bold text-slate-900">"${item.vi}"</h3>
                        </div>
                        <button onclick="deleteFromNotebook('${item.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Xóa khỏi sổ tay">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <!-- Casual -->
                        <div class="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-3">
                            <div>
                                <span class="text-[11px] font-bold text-blue-600 uppercase">Tự nhiên (Casual)</span>
                                <p class="text-sm font-semibold text-slate-800 mt-0.5">${item.casual}</p>
                            </div>
                            <button onclick="speakText('${item.casual.replace(/'/g, "\\'")}', this)" class="w-8 h-8 rounded-full bg-white text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 hover:bg-blue-600 hover:text-white transition-all">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                        </div>

                        <!-- Formal -->
                        <div class="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-3">
                            <div>
                                <span class="text-[11px] font-bold text-purple-600 uppercase">Trang trọng (Formal)</span>
                                <p class="text-sm font-semibold text-slate-800 mt-0.5">${item.formal}</p>
                            </div>
                            <button onclick="speakText('${item.formal.replace(/'/g, "\\'")}', this)" class="w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-200 flex items-center justify-center shrink-0 hover:bg-purple-600 hover:text-white transition-all">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    window.openBackupRestoreSection = function () {
    if (typeof switchTab === 'function') {
        switchTab('profile');
    }

    setTimeout(() => {
        // 1. Ưu tiên tìm theo input/button sao lưu (không yêu cầu input phải hiện)
        let targetEl = document.querySelector(
            '[onchange*="importStudentProgressJSON"], [onclick*="exportStudentProgressJSON"]'
        );

        // 2. Nếu không thấy (hoặc nằm trong menu), tìm theo tiêu đề/nút có chữ "Sao lưu" hoặc "Khôi phục" đang hiển thị
        if (!targetEl || targetEl.closest('#va-system-menu-sheet, .va-desktop-sidebar, nav')) {
            const allEls = document.querySelectorAll('h2, h3, h4, button, label');
            targetEl = Array.from(allEls).find(el => {
                if (el.closest('#va-system-menu-sheet, .va-desktop-sidebar, nav')) return false;
                if (el.offsetParent === null) return false;
                const txt = (el.textContent || '').toLowerCase();
                return txt.includes('sao lưu') || txt.includes('khôi phục');
            }) || null;
        }

        if (targetEl) {
            const targetBox = targetEl.closest('.rounded-2xl, .rounded-xl, section') || targetEl.parentElement || targetEl;
            targetBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetBox.classList.add('ring-2', 'ring-indigo-400', 'transition-all');
            setTimeout(() => targetBox.classList.remove('ring-2', 'ring-indigo-400'), 2000);
        }
    }, 350);
};
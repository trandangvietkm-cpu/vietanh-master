/**
 * DỮ LIỆU CHẶNG 2: NHỊP SỐNG, ĂN UỐNG & MUA SẮM (data/stage_2.js)
 * - Gồm 6 Trạm ngữ pháp chuẩn A1 (đang triển khai Trạm 1: Hiện tại đơn + / -)
 * - Đăng ký tự động qua window.VA_DATA_REGISTRY.registerStage('stage_2', ...)
 * - Cấu trúc thuần dữ liệu (JSON-safe) sẵn sàng chuyển đổi sang Next.js / Database.
 */

if (window.VA_DATA_REGISTRY && typeof window.VA_DATA_REGISTRY.registerStage === 'function') {
    window.VA_DATA_REGISTRY.registerStage('stage_2', {
        title: 'Chặng 2: Nhịp sống, Ăn uống & Mua sắm',
        structures: [
            {
                id: "struct_present_simple",
                number: 7,
                stageId: "stage_2",
                stage: "Chặng 2: Nhịp sống, Ăn uống & Mua sắm",
                orderInStage: 1,
                level: "A1",
                topics: ["daily", "office", "food_shop"],
                title: "Thì Hiện tại đơn (+ / -) — Thói quen & Lịch trình hàng ngày",
                shortName: "Hiện tại đơn (+ / -)",
                formula: "(+) S + V(s/es)  |  (-) S + don't / doesn't + V",
                description: "Diễn tả thói quen lặp lại hàng ngày, lịch trình cố định và sở thích cá nhân ở hiện tại.",
                tips: [
                    "I, You, We, They + động từ nguyên mẫu (phủ định: don't + V).",
                    "He, She, It, Danh từ số ít + động từ thêm -s/-es (phủ định: doesn't + V nguyên mẫu, KHÔNG thêm -s/-es nữa).",
                    "Động từ tận cùng bằng o, s, ch, sh, x thêm -es (go → goes, watch → watches)."
                ],
                requiredPatterns: [],
                situations: [
                    {
                        id: "st2_01_01",
                        context: "Tình huống 1/15 • Thói quen buổi sáng",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Nói về giờ thức dậy hàng ngày với chủ ngữ I.",
                        vi: "Mình thức dậy lúc 6 giờ sáng mỗi ngày.",
                        sampleCasual: "I wake up at 6 AM every day.",
                        sampleFormal: "I wake up at 6:00 AM every morning.",
                        ipa: "/aɪ weɪk ʌp æt sɪks eɪ ɛm ˈɛvri deɪ/",
                        grammarHint: "Chủ ngữ 'I' dùng động từ nguyên mẫu 'wake up'; dùng giới từ 'at' trước giờ cụ thể.",
                        hints: [
                            { en: "wake up", vi: "thức dậy" },
                            { en: "at 6 AM", vi: "lúc 6 giờ sáng" },
                            { en: "every day", vi: "mỗi ngày" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I get up at 6 AM every day." }
                        ],
                        keywords: ["wake", "up", "6", "every", "day"]
                    },
                    {
                        id: "st2_01_02",
                        context: "Tình huống 2/15 • Đồ uống buổi sáng",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Nói về thói quen uống cà phê vào buổi sáng.",
                        vi: "Mình uống một tách cà phê vào buổi sáng.",
                        sampleCasual: "I drink a cup of coffee in the morning.",
                        sampleFormal: "I have a cup of coffee every morning.",
                        ipa: "/aɪ drɪŋk ə kʌp ʌv ˈkɔːfi ɪn ðə ˈmɔːrnɪŋ/",
                        grammarHint: "Dùng 'in the morning' cho buổi sáng; 'a cup of coffee' là một tách cà phê.",
                        hints: [
                            { en: "drink", vi: "uống" },
                            { en: "a cup of coffee", vi: "một tách cà phê" },
                            { en: "in the morning", vi: "vào buổi sáng" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I have a cup of coffee in the morning." }
                        ],
                        keywords: ["drink", "cup", "coffee", "morning"]
                    },
                    {
                        id: "st2_01_03",
                        context: "Tình huống 3/15 • Phương tiện đi làm",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Chia động từ tận cùng bằng -o (go → goes) với chủ ngữ He.",
                        vi: "Anh ấy đi làm bằng xe máy.",
                        sampleCasual: "He goes to work by motorbike.",
                        sampleFormal: "He commutes to work by motorbike.",
                        ipa: "/hiː ɡoʊz tuː wɜːrk baɪ ˈmoʊtərbaɪk/",
                        grammarHint: "Chủ ngữ 'He' (ngôi thứ 3 số ít) nên 'go' thêm '-es' thành 'goes'; dùng 'by + phương tiện'.",
                        hints: [
                            { en: "go to work", vi: "đi làm" },
                            { en: "by motorbike", vi: "bằng xe máy" }
                        ],
                        alternatives: [
                            { label: "Cách nói khác", en: "He rides a motorbike to work." }
                        ],
                        keywords: ["he", "goes", "work", "motorbike"]
                    },
                    {
                        id: "st2_01_04",
                        context: "Tình huống 4/15 • Nơi làm việc",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Chia động từ thêm -s (work → works) với chủ ngữ She.",
                        vi: "Cô ấy làm việc ở một công ty nhỏ tại Hà Nội.",
                        sampleCasual: "She works at a small company in Hanoi.",
                        sampleFormal: "She is employed at a small company in Hanoi.",
                        ipa: "/ʃiː wɜːrks æt ə smɔːl ˈkʌmpəni ɪn həˈnɔɪ/",
                        grammarHint: "Chủ ngữ 'She' nên 'work' thêm '-s' thành 'works'; dùng 'at/for a company'.",
                        hints: [
                            { en: "work at", vi: "làm việc ở" },
                            { en: "a small company", vi: "một công ty nhỏ" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "She works for a small company in Hanoi." }
                        ],
                        keywords: ["she", "works", "small", "company", "hanoi"]
                    },
                    {
                        id: "st2_01_05",
                        context: "Tình huống 5/15 • Bữa tối gia đình",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'have dinner' với chủ ngữ số nhiều We.",
                        vi: "Chúng tôi ăn tối cùng nhau lúc 7 giờ tối.",
                        sampleCasual: "We have dinner together at 7 PM.",
                        sampleFormal: "We eat dinner together at 7:00 PM.",
                        ipa: "/wiː hæv ˈdɪnər təˈɡɛðər æt ˈsɛvən piː ɛm/",
                        grammarHint: "Chủ ngữ 'We' giữ nguyên động từ 'have/eat'; 'together' đứng sau 'dinner'.",
                        hints: [
                            { en: "have dinner", vi: "ăn tối" },
                            { en: "together", vi: "cùng nhau" },
                            { en: "at 7 PM", vi: "lúc 7 giờ tối" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "We eat dinner together at 7 PM." }
                        ],
                        keywords: ["we", "have", "dinner", "together", "7"]
                    },
                    {
                        id: "st2_01_06",
                        context: "Tình huống 6/15 • Giải trí cuối tuần",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Nói về hoạt động cuối tuần với chủ ngữ They.",
                        vi: "Họ xem phim vào cuối tuần.",
                        sampleCasual: "They watch movies on weekends.",
                        sampleFormal: "They enjoy watching movies on the weekend.",
                        ipa: "/ðeɪ wɑːtʃ ˈmuːviz ɑːn ˈwiːkɛndz/",
                        grammarHint: "Chủ ngữ 'They' dùng 'watch' nguyên mẫu; 'on weekends' (Anh–Mỹ) hoặc 'at the weekend' (Anh–Anh).",
                        hints: [
                            { en: "watch movies", vi: "xem phim" },
                            { en: "on weekends", vi: "vào cuối tuần" }
                        ],
                        alternatives: [
                            { label: "Anh–Anh (UK)", en: "They watch films at the weekend." }
                        ],
                        keywords: ["they", "watch", "movies", "weekends"]
                    },
                    {
                        id: "st2_01_07",
                        context: "Tình huống 7/15 • Giờ mở cửa cửa hàng",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng Hiện tại đơn cho lịch trình cố định của danh từ số ít (The shop).",
                        vi: "Cửa hàng mở cửa lúc 8 giờ sáng.",
                        sampleCasual: "The shop opens at 8 AM.",
                        sampleFormal: "The store opens at 8:00 AM.",
                        ipa: "/ðə ʃɑːp ˈoʊpənz æt eɪt eɪ ɛm/",
                        grammarHint: "'The shop' là danh từ số ít (tương đương It) nên 'open' thêm '-s' thành 'opens'.",
                        hints: [
                            { en: "the shop", vi: "cửa hàng" },
                            { en: "open", vi: "mở cửa" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "The store opens at 8 AM." }
                        ],
                        keywords: ["shop", "opens", "8"]
                    },
                    {
                        id: "st2_01_08",
                        context: "Tình huống 8/15 • Thói quen học tập",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Nói về thời lượng học tiếng Anh mỗi tối.",
                        vi: "Mình học tiếng Anh 30 phút mỗi tối.",
                        sampleCasual: "I study English for 30 minutes every night.",
                        sampleFormal: "I practice English for thirty minutes each evening.",
                        ipa: "/aɪ ˈstʌdi ˈɪŋɡlɪʃ fɔːr ˈθɜːrti ˈmɪnɪts ˈɛvri naɪt/",
                        grammarHint: "Dùng 'for + khoảng thời gian' (for 30 minutes) để chỉ thời lượng.",
                        hints: [
                            { en: "study English", vi: "học tiếng Anh" },
                            { en: "for 30 minutes", vi: "trong 30 phút" },
                            { en: "every night", vi: "mỗi tối" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I learn English for 30 minutes every evening." }
                        ],
                        keywords: ["study", "english", "30", "minutes", "night"]
                    },
                    {
                        id: "st2_01_09",
                        context: "Tình huống 9/15 • Khẩu vị ăn uống (Phủ định)",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "negative",
                        explanation: "Câu phủ định Hiện tại đơn với I + don't + V.",
                        vi: "Mình không ăn đồ cay.",
                        sampleCasual: "I don't eat spicy food.",
                        sampleFormal: "I do not eat spicy food.",
                        ipa: "/aɪ doʊnt iːt ˈspaɪsi fuːd/",
                        grammarHint: "Phủ định của động từ thường với 'I' dùng 'don't + V nguyên mẫu' (không dùng 'I am not eat').",
                        hints: [
                            { en: "don't eat", vi: "không ăn" },
                            { en: "spicy food", vi: "đồ ăn cay" }
                        ],
                        alternatives: [],
                        keywords: ["don't", "eat", "spicy", "food"]
                    },
                    {
                        id: "st2_01_10",
                        context: "Tình huống 10/15 • Thói quen buổi sáng (Phủ định)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "negative",
                        explanation: "Câu phủ định với chủ ngữ số nhiều We + don't.",
                        vi: "Chúng tôi không xem tivi vào buổi sáng.",
                        sampleCasual: "We don't watch TV in the morning.",
                        sampleFormal: "We do not watch television in the morning.",
                        ipa: "/wiː doʊnt wɑːtʃ ˌtiːˈviː ɪn ðə ˈmɔːrnɪŋ/",
                        grammarHint: "Dùng 'We don't watch TV' và cụm chỉ buổi 'in the morning'.",
                        hints: [
                            { en: "don't watch TV", vi: "không xem tivi" },
                            { en: "in the morning", vi: "vào buổi sáng" }
                        ],
                        alternatives: [],
                        keywords: ["we", "don't", "watch", "tv", "morning"]
                    },
                    {
                        id: "st2_01_11",
                        context: "Tình huống 11/15 • Sở thích đồ uống (Phủ định)",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "negative",
                        explanation: "Câu phủ định ngôi thứ 3 số ít với He + doesn't + V nguyên mẫu.",
                        vi: "Anh ấy không uống trà.",
                        sampleCasual: "He doesn't drink tea.",
                        sampleFormal: "He does not drink tea.",
                        ipa: "/hiː ˈdʌzənt drɪŋk tiː/",
                        grammarHint: "Sau 'doesn't', động từ 'drink' phải giữ nguyên mẫu (KHÔNG viết 'doesn't drinks').",
                        hints: [
                            { en: "doesn't drink", vi: "không uống" },
                            { en: "tea", vi: "trà" }
                        ],
                        alternatives: [],
                        keywords: ["he", "doesn't", "drink", "tea"]
                    },
                    {
                        id: "st2_01_12",
                        context: "Tình huống 12/15 • Lịch làm việc cuối tuần (Phủ định)",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "negative",
                        explanation: "Câu phủ định với She + doesn't + V và giới từ 'on' trước thứ.",
                        vi: "Cô ấy không làm việc vào Chủ nhật.",
                        sampleCasual: "She doesn't work on Sundays.",
                        sampleFormal: "She does not work on Sundays.",
                        ipa: "/ʃiː ˈdʌzənt wɜːrk ɑːn ˈsʌndeɪz/",
                        grammarHint: "Dùng 'doesn't work' (không thêm -s vào work) và giới từ 'on' trước các thứ trong tuần.",
                        hints: [
                            { en: "doesn't work", vi: "không làm việc" },
                            { en: "on Sundays", vi: "vào các ngày Chủ nhật" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "She doesn't work on Sunday." }
                        ],
                        keywords: ["she", "doesn't", "work", "sundays"]
                    },
                    {
                        id: "st2_01_13",
                        context: "Tình huống 13/15 • Nơi sinh sống (Phủ định)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "negative",
                        explanation: "Câu phủ định với They + don't live.",
                        vi: "Họ không sống gần trung tâm thành phố.",
                        sampleCasual: "They don't live near the city center.",
                        sampleFormal: "They do not live near the city center.",
                        ipa: "/ðeɪ doʊnt lɪv nɪr ðə ˈsɪti ˈsɛntər/",
                        grammarHint: "Dùng 'They don't live' và cụm 'near the city center' (không có 'to' sau 'near').",
                        hints: [
                            { en: "don't live", vi: "không sống" },
                            { en: "near the city center", vi: "gần trung tâm thành phố" }
                        ],
                        alternatives: [],
                        keywords: ["they", "don't", "live", "near", "city", "center"]
                    },
                    {
                        id: "st2_01_14",
                        context: "Tình huống 14/15 • Giờ đi ngủ (Phủ định)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "negative",
                        explanation: "Nói về thói quen đi ngủ vào các ngày trong tuần.",
                        vi: "Mình không đi ngủ muộn vào các ngày trong tuần.",
                        sampleCasual: "I don't go to bed late on weekdays.",
                        sampleFormal: "I do not stay up late on weekdays.",
                        ipa: "/aɪ doʊnt ɡoʊ tuː bɛd leɪt ɑːn ˈwiːkdeɪz/",
                        grammarHint: "Cụm 'go to bed late' (đi ngủ muộn) và 'on weekdays' (vào các ngày trong tuần, thứ 2–6).",
                        hints: [
                            { en: "go to bed late", vi: "đi ngủ muộn" },
                            { en: "on weekdays", vi: "vào các ngày trong tuần" }
                        ],
                        alternatives: [],
                        keywords: ["don't", "go", "bed", "late", "weekdays"]
                    },
                    {
                        id: "st2_01_15",
                        context: "Tình huống 15/15 • Thói quen trước khi ngủ",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Tổng hợp chia động từ thêm -s với She (reads).",
                        vi: "Cô ấy đọc sách trước khi đi ngủ.",
                        sampleCasual: "She reads books before bed.",
                        sampleFormal: "She reads a book before going to sleep.",
                        ipa: "/ʃiː riːdz bʊks bɪˈfɔːr bɛd/",
                        grammarHint: "Chủ ngữ 'She' nên 'read' thêm '-s' thành 'reads'; cụm ngắn gọn 'before bed' rất tự nhiên.",
                        hints: [
                            { en: "read books", vi: "đọc sách" },
                            { en: "before bed", vi: "trước khi đi ngủ" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "She reads a book before bed." }
                        ],
                        keywords: ["she", "reads", "books", "before", "bed"]
                    }
                ]
            },
            {
                id: "struct_present_simple_q",
                number: 8,
                stageId: "stage_2",
                stage: "Chặng 2: Nhịp sống, Ăn uống & Mua sắm",
                orderInStage: 2,
                level: "A1",
                topics: ["daily", "office", "food_shop"],
                title: "Câu hỏi Hiện tại đơn & Trạng từ tần suất",
                shortName: "Câu hỏi HTĐ & Tần suất",
                formula: "(?) Do / Does + S + V?  |  S + always / usually / often / sometimes / never + V",
                description: "Đặt câu hỏi về thói quen, sở thích, lịch trình hàng ngày và diễn tả mức độ thường xuyên của hành động.",
                tips: [
                    "Câu hỏi Yes/No: Dùng 'Do' với I/You/We/They và 'Does' với He/She/It + động từ NGUYÊN MẪU (không thêm -s/-es).",
                    "Câu hỏi có từ để hỏi (What, Where, When, What time, How often): Từ để hỏi + do/does + S + V?",
                    "Trạng từ tần suất (always, usually, often, sometimes, never) đứng TRƯỚC động từ thường và SAU động từ To be."
                ],
                requiredPatterns: [],
                situations: [
                    {
                        id: "st2_02_01",
                        context: "Tình huống 1/15 • Hỏi sở thích đồ uống (Yes/No)",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "question",
                        explanation: "Đặt câu hỏi Yes/No với 'Do you + V?'.",
                        vi: "Bạn có thích cà phê không?",
                        sampleCasual: "Do you like coffee?",
                        sampleFormal: "Do you enjoy drinking coffee?",
                        ipa: "/duː juː laɪk ˈkɔːfi/",
                        grammarHint: "Đảo trợ động từ 'Do' lên đầu câu trước 'you', giữ nguyên động từ 'like'.",
                        hints: [
                            { en: "Do you like...", vi: "Bạn có thích..." },
                            { en: "coffee", vi: "cà phê" }
                        ],
                        alternatives: [],
                        keywords: ["do", "you", "like", "coffee"]
                    },
                    {
                        id: "st2_02_02",
                        context: "Tình huống 2/15 • Hỏi nơi ở (Yes/No)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "question",
                        explanation: "Hỏi xem ai đó có sống gần đây không.",
                        vi: "Bạn có sống gần đây không?",
                        sampleCasual: "Do you live near here?",
                        sampleFormal: "Do you live around this area?",
                        ipa: "/duː juː lɪv nɪr hɪr/",
                        grammarHint: "Dùng 'Do you live' + 'near here' (không thêm 'to' sau 'near').",
                        hints: [
                            { en: "live", vi: "sống" },
                            { en: "near here", vi: "gần đây" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "Do you live around here?" }
                        ],
                        keywords: ["do", "you", "live", "near", "here"]
                    },
                    {
                        id: "st2_02_03",
                        context: "Tình huống 3/15 • Hỏi lịch làm việc ngôi thứ 3 (Does)",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "question",
                        explanation: "Đặt câu hỏi Yes/No với 'Does he + V nguyên mẫu?'.",
                        vi: "Anh ấy có làm việc vào thứ Bảy không?",
                        sampleCasual: "Does he work on Saturdays?",
                        sampleFormal: "Does he work on Saturday?",
                        ipa: "/dʌz hiː wɜːrk ɑːn ˈsætərdeɪz/",
                        grammarHint: "Đã mượn 'Does' ở đầu câu nên động từ 'work' giữ nguyên mẫu (KHÔNG viết 'Does he works').",
                        hints: [
                            { en: "Does he work", vi: "Anh ấy có làm việc" },
                            { en: "on Saturdays", vi: "vào các ngày thứ Bảy" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "Does he work on Saturday?" }
                        ],
                        keywords: ["does", "he", "work", "saturdays"]
                    },
                    {
                        id: "st2_02_04",
                        context: "Tình huống 4/15 • Hỏi khả năng ngôn ngữ (Does)",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "question",
                        explanation: "Đặt câu hỏi với 'Does she speak...?'.",
                        vi: "Cô ấy có nói tiếng Anh không?",
                        sampleCasual: "Does she speak English?",
                        sampleFormal: "Does she speak English well?",
                        ipa: "/dʌz ʃiː spiːk ˈɪŋɡlɪʃ/",
                        grammarHint: "Chủ ngữ 'she' đi với trợ động từ 'Does' và động từ nguyên mẫu 'speak'.",
                        hints: [
                            { en: "speak English", vi: "nói tiếng Anh" }
                        ],
                        alternatives: [],
                        keywords: ["does", "she", "speak", "english"]
                    },
                    {
                        id: "st2_02_05",
                        context: "Tình huống 5/15 • Hỏi giờ giấc (What time)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "question",
                        explanation: "Dùng 'What time do you + V?' để hỏi giờ sinh hoạt.",
                        vi: "Bạn thường thức dậy lúc mấy giờ?",
                        sampleCasual: "What time do you usually wake up?",
                        sampleFormal: "What time do you usually get up in the morning?",
                        ipa: "/wʌt taɪm duː juː ˈjuːʒuəli weɪk ʌp/",
                        grammarHint: "Cấu trúc: 'What time + do you + usually + V?'. Trạng từ 'usually' đứng ngay trước 'wake up'.",
                        hints: [
                            { en: "What time", vi: "Mấy giờ" },
                            { en: "usually", vi: "thường" },
                            { en: "wake up", vi: "thức dậy" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "What time do you usually get up?" }
                        ],
                        keywords: ["what", "time", "do", "you", "usually", "wake", "up"]
                    },
                    {
                        id: "st2_02_06",
                        context: "Tình huống 6/15 • Hỏi nơi làm việc (Where)",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "question",
                        explanation: "Dùng 'Where do you work?' để hỏi công ty/nơi làm việc.",
                        vi: "Bạn làm việc ở đâu?",
                        sampleCasual: "Where do you work?",
                        sampleFormal: "Where are you currently working?",
                        ipa: "/wɛr duː juː wɜːrk/",
                        grammarHint: "Câu hỏi Wh- cơ bản: 'Where + do + you + work?'.",
                        hints: [
                            { en: "Where", vi: "Ở đâu" },
                            { en: "work", vi: "làm việc" }
                        ],
                        alternatives: [],
                        keywords: ["where", "do", "you", "work"]
                    },
                    {
                        id: "st2_02_07",
                        context: "Tình huống 7/15 • Hỏi hoạt động cuối tuần (What)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "question",
                        explanation: "Phân biệt trợ động từ 'do' và động từ chính 'do' (làm).",
                        vi: "Bạn thường làm gì vào cuối tuần?",
                        sampleCasual: "What do you usually do on weekends?",
                        sampleFormal: "What do you normally do on the weekend?",
                        ipa: "/wʌt duː juː ˈjuːʒuəli duː ɑːn ˈwiːkɛndz/",
                        grammarHint: "'do' thứ nhất là trợ động từ hỏi, 'do' thứ hai là động từ chính mang nghĩa 'làm'.",
                        hints: [
                            { en: "What do you usually do", vi: "Bạn thường làm gì" },
                            { en: "on weekends", vi: "vào cuối tuần" }
                        ],
                        alternatives: [
                            { label: "Anh–Anh (UK)", en: "What do you usually do at the weekend?" }
                        ],
                        keywords: ["what", "do", "you", "usually", "weekends"]
                    },
                    {
                        id: "st2_02_08",
                        context: "Tình huống 8/15 • Hỏi mức độ thường xuyên (How often)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "question",
                        explanation: "Dùng 'How often do you + V?' để hỏi tần suất.",
                        vi: "Bạn có hay đi tập thể dục không?",
                        sampleCasual: "How often do you exercise?",
                        sampleFormal: "How often do you work out?",
                        ipa: "/haʊ ˈɔːfən duː juː ˈɛksərsaɪz/",
                        grammarHint: "Dùng 'How often' (Thường xuyên cỡ nào) + 'do you' + động từ 'exercise / work out'.",
                        hints: [
                            { en: "How often", vi: "Thường xuyên như thế nào / có hay... không" },
                            { en: "exercise", vi: "tập thể dục" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "How often do you work out?" }
                        ],
                        keywords: ["how", "often", "do", "you", "exercise"]
                    },
                    {
                        id: "st2_02_09",
                        context: "Tình huống 9/15 • Hỏi giờ đóng cửa (What time does)",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "question",
                        explanation: "Dùng 'What time does + danh từ số ít + V?'.",
                        vi: "Cửa hàng đóng cửa lúc mấy giờ?",
                        sampleCasual: "What time does the shop close?",
                        sampleFormal: "What time does the store close?",
                        ipa: "/wʌt taɪm dʌz ðə ʃɑːp kloʊz/",
                        grammarHint: "'The shop' là số ít nên mượn 'does', động từ 'close' giữ nguyên mẫu.",
                        hints: [
                            { en: "the shop", vi: "cửa hàng" },
                            { en: "close", vi: "đóng cửa" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "What time does the store close?" }
                        ],
                        keywords: ["what", "time", "does", "shop", "close"]
                    },
                    {
                        id: "st2_02_10",
                        context: "Tình huống 10/15 • Trạng từ tần suất: always (100%)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Đặt 'always' trước động từ thường 'eat/have'.",
                        vi: "Mình luôn ăn sáng ở nhà.",
                        sampleCasual: "I always have breakfast at home.",
                        sampleFormal: "I always eat breakfast at home.",
                        ipa: "/aɪ ˈɔːlweɪz hæv ˈbrɛkfəst æt hoʊm/",
                        grammarHint: "'always' đứng trước động từ thường 'have/eat'; 'at home' là ở nhà.",
                        hints: [
                            { en: "always", vi: "luôn luôn" },
                            { en: "have breakfast", vi: "ăn sáng" },
                            { en: "at home", vi: "ở nhà" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I always eat breakfast at home." }
                        ],
                        keywords: ["always", "have", "breakfast", "home"]
                    },
                    {
                        id: "st2_02_11",
                        context: "Tình huống 11/15 • Trạng từ tần suất: usually (80%)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'usually' với chủ ngữ ngôi thứ 3 số ít 'She'.",
                        vi: "Cô ấy thường nấu ăn vào buổi tối.",
                        sampleCasual: "She usually cooks in the evening.",
                        sampleFormal: "She usually cooks dinner in the evening.",
                        ipa: "/ʃiː ˈjuːʒuəli kʊks ɪn ðə ˈiːvnɪŋ/",
                        grammarHint: "'usually' đứng trước 'cooks', và đừng quên thêm '-s' vào 'cook' vì chủ ngữ là 'She'.",
                        hints: [
                            { en: "usually", vi: "thường" },
                            { en: "cook", vi: "nấu ăn" },
                            { en: "in the evening", vi: "vào buổi tối" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "She usually cooks dinner in the evening." }
                        ],
                        keywords: ["she", "usually", "cooks", "evening"]
                    },
                    {
                        id: "st2_02_12",
                        context: "Tình huống 12/15 • Trạng từ tần suất: often (60%)",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'often' nói về thói quen đi ăn ngoài.",
                        vi: "Chúng tôi hay đi ăn ngoài vào tối thứ Sáu.",
                        sampleCasual: "We often eat out on Friday nights.",
                        sampleFormal: "We often dine out on Friday evenings.",
                        ipa: "/wiː ˈɔːfən iːt aʊt ɑːn ˈfraɪdeɪ naɪts/",
                        grammarHint: "Cụm 'eat out' nghĩa là đi ăn ngoài hàng; 'on Friday nights' là vào các tối thứ Sáu.",
                        hints: [
                            { en: "often", vi: "thường / hay" },
                            { en: "eat out", vi: "đi ăn ngoài" },
                            { en: "on Friday nights", vi: "vào tối thứ Sáu" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "We often eat out on Friday evening." }
                        ],
                        keywords: ["we", "often", "eat", "out", "friday"]
                    },
                    {
                        id: "st2_02_13",
                        context: "Tình huống 13/15 • Trạng từ tần suất: sometimes (40%)",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'sometimes' với hoạt động mua sắm trực tuyến.",
                        vi: "Mình thỉnh thoảng mua quần áo trên mạng.",
                        sampleCasual: "I sometimes buy clothes online.",
                        sampleFormal: "Sometimes I shop for clothes online.",
                        ipa: "/aɪ ˈsʌmtaɪmz baɪ kloʊðz ˈɑːnlaɪn/",
                        grammarHint: "'sometimes' có thể đặt trước động từ 'buy' hoặc đặt ngay đầu câu đều đúng.",
                        hints: [
                            { en: "sometimes", vi: "thỉnh thoảng" },
                            { en: "buy clothes", vi: "mua quần áo" },
                            { en: "online", vi: "trên mạng / trực tuyến" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "Sometimes I buy clothes online." }
                        ],
                        keywords: ["sometimes", "buy", "clothes", "online"]
                    },
                    {
                        id: "st2_02_14",
                        context: "Tình huống 14/15 • Trạng từ tần suất: never (0%)",
                        stageTag: "Chặng 2: Công việc",
                        level: "A1",
                        topic: "office",
                        tense: "present",
                        form: "negative",
                        explanation: "Vị trí của 'never' khi đi với động từ To be (đứng SAU is/am/are).",
                        vi: "Anh ấy không bao giờ đi làm muộn.",
                        sampleCasual: "He is never late for work.",
                        sampleFormal: "He is never late to work.",
                        ipa: "/hiː ɪz ˈnɛvər leɪt fɔːr wɜːrk/",
                        grammarHint: "Lưu ý quan trọng: 'never' đứng SAU động từ To be ('He is never late', KHÔNG viết 'He never is late').",
                        hints: [
                            { en: "never", vi: "không bao giờ" },
                            { en: "late for work", vi: "đi làm muộn" }
                        ],
                        alternatives: [
                            { label: "Dạng rút gọn", en: "He's never late for work." }
                        ],
                        keywords: ["he", "never", "late", "work"]
                    },
                    {
                        id: "st2_02_15",
                        context: "Tình huống 15/15 • Trả lời tần suất cụ thể (twice a week)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng cụm chỉ tần suất ở cuối câu (twice a week).",
                        vi: "Mình đi siêu thị hai lần một tuần.",
                        sampleCasual: "I go to the supermarket twice a week.",
                        sampleFormal: "I visit the supermarket twice per week.",
                        ipa: "/aɪ ɡoʊ tuː ðə ˈsuːpərmɑːrkɪt twaɪs ə wiːk/",
                        grammarHint: "Cụm tần suất cụ thể (once a day, twice a week, three times a month) luôn đặt ở cuối câu.",
                        hints: [
                            { en: "supermarket", vi: "siêu thị" },
                            { en: "twice a week", vi: "hai lần một tuần" }
                        ],
                        alternatives: [],
                        keywords: ["go", "supermarket", "twice", "week"]
                    }
                ]
            },
            {
                id: "struct_articles",
                number: 9,
                stageId: "stage_2",
                stage: "Chặng 2: Nhịp sống, Ăn uống & Mua sắm",
                orderInStage: 3,
                level: "A1",
                topics: ["daily", "food_shop"],
                title: "Mạo từ (a / an / the) — Danh từ xác định & không xác định",
                shortName: "Mạo từ (a / an / the)",
                formula: "a + phụ âm  |  an + nguyên âm (u, e, o, a, i)  |  the + vật đã xác định / duy nhất",
                description: "Phân biệt khi nào dùng a/an (nhắc lần đầu, chưa xác định), khi nào dùng the (cả hai cùng biết, nhắc lại lần 2) và khi nào không dùng mạo từ.",
                tips: [
                    "Dùng 'a' trước âm phụ âm (a book, a university) và 'an' trước âm nguyên âm (an apple, an hour).",
                    "Dùng 'the' khi cả người nói và người nghe đều biết rõ vật đang nói tới, hoặc khi nhắc lại vật đó lần thứ 2.",
                    "Không dùng 'a/an' trước danh từ số nhiều hoặc danh từ không đếm được (coffee, water, music)."
                ],
                requiredPatterns: [],
                situations: [
                    {
                        id: "st2_03_01",
                        context: "Tình huống 1/15 • Dùng 'a' trước âm phụ âm",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'a' trước danh từ số ít bắt đầu bằng phụ âm (phone).",
                        vi: "Mình có một chiếc điện thoại mới.",
                        sampleCasual: "I have a new phone.",
                        sampleFormal: "I own a new phone.",
                        ipa: "/aɪ hæv ə nuː foʊn/",
                        grammarHint: "'new' bắt đầu bằng phụ âm /n/ nên dùng mạo từ 'a' (a new phone).",
                        hints: [
                            { en: "a new phone", vi: "một chiếc điện thoại mới" }
                        ],
                        alternatives: [
                            { label: "Anh–Anh (UK)", en: "I've got a new phone." }
                        ],
                        keywords: ["have", "a", "new", "phone"]
                    },
                    {
                        id: "st2_03_02",
                        context: "Tình huống 2/15 • Dùng 'an' trước âm nguyên âm",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'an' trước danh từ bắt đầu bằng nguyên âm (apple).",
                        vi: "Cô ấy ăn một quả táo mỗi ngày.",
                        sampleCasual: "She eats an apple every day.",
                        sampleFormal: "She eats an apple each day.",
                        ipa: "/ʃiː iːts æn ˈæpəl ˈɛvri deɪ/",
                        grammarHint: "'apple' bắt đầu bằng nguyên âm /æ/ nên bắt buộc dùng 'an' (an apple).",
                        hints: [
                            { en: "an apple", vi: "một quả táo" },
                            { en: "every day", vi: "mỗi ngày" }
                        ],
                        alternatives: [],
                        keywords: ["she", "eats", "an", "apple", "every", "day"]
                    },
                    {
                        id: "st2_03_03",
                        context: "Tình huống 3/15 • Dùng 'an' trước tính từ bắt đầu bằng nguyên âm",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Mạo từ a/an đi theo âm của từ đứng ngay sau nó (old).",
                        vi: "Đó là một chiếc xe đạp cũ.",
                        sampleCasual: "That is an old bicycle.",
                        sampleFormal: "That is an old bike.",
                        ipa: "/ðæt ɪz æn oʊld ˈbaɪsɪkəl/",
                        grammarHint: "Dù 'bicycle' bắt đầu bằng phụ âm, nhưng đứng ngay sau mạo từ là 'old' (nguyên âm) nên dùng 'an old bicycle'.",
                        hints: [
                            { en: "an old bicycle", vi: "một chiếc xe đạp cũ" }
                        ],
                        alternatives: [
                            { label: "Dạng rút gọn", en: "That's an old bike." }
                        ],
                        keywords: ["that", "an", "old", "bicycle"]
                    },
                    {
                        id: "st2_03_04",
                        context: "Tình huống 4/15 • Dùng 'an' trước âm câm 'h' (hour)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Chữ 'h' trong 'hour' là âm câm nên dùng 'an hour'.",
                        vi: "Mình đọc sách một tiếng mỗi tối.",
                        sampleCasual: "I read books for an hour every night.",
                        sampleFormal: "I read for an hour each evening.",
                        ipa: "/aɪ riːd bʊks fɔːr æn ˈaʊər ˈɛvri naɪt/",
                        grammarHint: "'hour' đọc là /ˈaʊər/ (bắt đầu bằng nguyên âm) nên phải dùng 'an hour', không dùng 'a hour'.",
                        hints: [
                            { en: "for an hour", vi: "trong một tiếng" },
                            { en: "every night", vi: "mỗi tối" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I read for an hour every night." }
                        ],
                        keywords: ["read", "an", "hour", "every", "night"]
                    },
                    {
                        id: "st2_03_05",
                        context: "Tình huống 5/15 • Dùng 'the' cho vật đã xác định",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'the' khi cả hai đều biết rõ ly cà phê đang nói tới.",
                        vi: "Cà phê ở đây rất ngon.",
                        sampleCasual: "The coffee here is very good.",
                        sampleFormal: "The coffee here is delicious.",
                        ipa: "/ðə ˈkɔːfi hɪr ɪz ˈvɛri ɡʊd/",
                        grammarHint: "Nói về cà phê nói chung thì không dùng 'the', nhưng nói về cà phê 'ở quán này' (đã xác định) thì dùng 'The coffee here'.",
                        hints: [
                            { en: "The coffee here", vi: "Cà phê ở đây" },
                            { en: "very good", vi: "rất ngon" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "The coffee here is really good." }
                        ],
                        keywords: ["the", "coffee", "here", "good"]
                    },
                    {
                        id: "st2_03_06",
                        context: "Tình huống 6/15 • Dùng 'the' cho đồ vật quen thuộc trong phòng",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'the door' vì người nghe biết rõ cánh cửa nào.",
                        vi: "Làm ơn đóng cửa lại nhé.",
                        sampleCasual: "Please close the door.",
                        sampleFormal: "Could you please close the door?",
                        ipa: "/pliːz kloʊz ðə dɔːr/",
                        grammarHint: "Dùng 'the door' (cánh cửa xác định trong phòng), không dùng 'a door'.",
                        hints: [
                            { en: "Please", vi: "Làm ơn" },
                            { en: "close the door", vi: "đóng cửa lại" }
                        ],
                        alternatives: [],
                        keywords: ["please", "close", "the", "door"]
                    },
                    {
                        id: "st2_03_07",
                        context: "Tình huống 7/15 • Nhắc lần 1 dùng 'a', nhắc lần 2 dùng 'the'",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Kết hợp 'a restaurant' (lần 1) và 'The food' (xác định theo nhà hàng đó).",
                        vi: "Gần đây có một nhà hàng nhỏ. Đồ ăn ở đó rất rẻ.",
                        sampleCasual: "There is a small restaurant near here. The food is very cheap.",
                        sampleFormal: "There is a small restaurant nearby. The food there is quite affordable.",
                        ipa: "/ðɛr ɪz ə smɔːl ˈrɛstərɑːnt nɪr hɪr ðə fuːd ɪz ˈvɛri tʃiːp/",
                        grammarHint: "Nhắc nhà hàng lần đầu dùng 'a small restaurant'; câu sau đồ ăn đã xác định nên dùng 'The food'.",
                        hints: [
                            { en: "a small restaurant", vi: "một nhà hàng nhỏ" },
                            { en: "The food", vi: "Đồ ăn (ở đó)" },
                            { en: "very cheap", vi: "rất rẻ" }
                        ],
                        alternatives: [
                            { label: "Dạng rút gọn", en: "There's a small restaurant near here. The food is very cheap." }
                        ],
                        keywords: ["a", "small", "restaurant", "the", "food", "cheap"]
                    },
                    {
                        id: "st2_03_08",
                        context: "Tình huống 8/15 • Dùng 'the' với vật duy nhất (the sun / the sky)",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Các vật duy nhất trong tự nhiên luôn đi với 'the'.",
                        vi: "Hôm nay bầu trời rất xanh.",
                        sampleCasual: "The sky is very blue today.",
                        sampleFormal: "The sky is very clear and blue today.",
                        ipa: "/ðə skaɪ ɪz ˈvɛri bluː təˈdeɪ/",
                        grammarHint: "'The sky' (bầu trời), 'the sun' (mặt trời), 'the moon' (mặt trăng) luôn đi với 'the'.",
                        hints: [
                            { en: "The sky", vi: "Bầu trời" },
                            { en: "very blue", vi: "rất xanh" }
                        ],
                        alternatives: [],
                        keywords: ["the", "sky", "blue", "today"]
                    },
                    {
                        id: "st2_03_09",
                        context: "Tình huống 9/15 • Không dùng mạo từ khi nói sở thích chung",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Danh từ không đếm được nói chung (music) không dùng a/an/the.",
                        vi: "Mình thích nghe nhạc.",
                        sampleCasual: "I like listening to music.",
                        sampleFormal: "I enjoy listening to music.",
                        ipa: "/aɪ laɪk ˈlɪsənɪŋ tuː ˈmjuːzɪk/",
                        grammarHint: "Nói về âm nhạc nói chung thì dùng 'music' (KHÔNG viết 'the music' hay 'a music').",
                        hints: [
                            { en: "listening to music", vi: "nghe nhạc" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I love music." }
                        ],
                        keywords: ["like", "listening", "music"]
                    },
                    {
                        id: "st2_03_10",
                        context: "Tình huống 10/15 • Dùng 'the' với địa điểm quen thuộc trong nhà",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Các phòng trong nhà (the kitchen, the living room) đi với 'the'.",
                        vi: "Mẹ mình đang ở trong bếp.",
                        sampleCasual: "My mom is in the kitchen.",
                        sampleFormal: "My mother is in the kitchen.",
                        ipa: "/maɪ mɑːm ɪz ɪn ðə ˈkɪtʃən/",
                        grammarHint: "Dùng 'in the kitchen' (trong bếp) vì cả hai đều biết là căn bếp của nhà mình.",
                        hints: [
                            { en: "My mom", vi: "Mẹ mình" },
                            { en: "in the kitchen", vi: "ở trong bếp" }
                        ],
                        alternatives: [],
                        keywords: ["mom", "in", "the", "kitchen"]
                    },
                    {
                        id: "st2_03_11",
                        context: "Tình huống 11/15 • Dùng 'a' khi hỏi mua một món đồ bất kỳ",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'a' trước danh từ số ít chưa xác định (a jacket).",
                        vi: "Mình muốn mua một chiếc áo khoác.",
                        sampleCasual: "I want to buy a jacket.",
                        sampleFormal: "I would like to buy a jacket.",
                        ipa: "/aɪ wɑːnt tuː baɪ ə ˈdʒækɪt/",
                        grammarHint: "Chưa chỉ rõ chiếc áo khoác cụ thể nào nên dùng 'a jacket'.",
                        hints: [
                            { en: "want to buy", vi: "muốn mua" },
                            { en: "a jacket", vi: "một chiếc áo khoác" }
                        ],
                        alternatives: [
                            { label: "Lịch sự hơn", en: "I'd like to buy a jacket." }
                        ],
                        keywords: ["want", "buy", "a", "jacket"]
                    },
                    {
                        id: "st2_03_12",
                        context: "Tình huống 12/15 • Dùng 'the' khi chỉ rõ món đồ đang nhìn thấy",
                        stageTag: "Chặng 2: Mua sắm",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'the black jacket' khi đã xác định rõ chiếc áo màu đen đó.",
                        vi: "Mình thích chiếc áo khoác màu đen đó.",
                        sampleCasual: "I like the black jacket.",
                        sampleFormal: "I prefer the black jacket.",
                        ipa: "/aɪ laɪk ðə blæk ˈdʒækɪt/",
                        grammarHint: "Đã xác định cụ thể là chiếc áo màu đen (the black jacket) nên dùng 'the'.",
                        hints: [
                            { en: "the black jacket", vi: "chiếc áo khoác màu đen đó" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "I like that black jacket." }
                        ],
                        keywords: ["like", "the", "black", "jacket"]
                    },
                        {
                        id: "st2_03_13",
                        context: "Tình huống 13/15 • Ngoại lệ: Dùng 'a' trước chữ 'u' đọc là /juː/",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Dùng 'a' trước 'university' vì âm đầu là phụ âm /j/ (không phải nguyên âm).",
                        vi: "Cô ấy học ở một trường đại học tại Hà Nội.",
                        sampleCasual: "She studies at a university in Hanoi.",
                        sampleFormal: "She attends a university in Hanoi.",
                        ipa: "/ʃiː ˈstʌdiz æt ə ˌjuːnəˈvɜːrsəti ɪn həˈnɔɪ/",
                        grammarHint: "'university' viết bằng chữ 'u' nhưng phát âm bắt đầu bằng âm phụ âm /juː/ nên dùng 'a university', KHÔNG dùng 'an'.",
                        hints: [
                            { en: "study at", vi: "học tại" },
                            { en: "a university", vi: "một trường đại học" }
                        ],
                        alternatives: [
                            { label: "Tự nhiên khác", en: "She goes to a university in Hanoi." }
                        ],
                        keywords: ["she", "studies", "a", "university", "hanoi"]
                    },
                    {
                        id: "st2_03_14",
                        context: "Tình huống 14/15 • Dùng 'an' trước chữ 'u' đọc là nguyên âm /ʌ/",
                        stageTag: "Chặng 2: Nhịp sống",
                        level: "A1",
                        topic: "daily",
                        tense: "present",
                        form: "question",
                        explanation: "So sánh với 'a university': từ 'umbrella' đọc là /ʌmˈbrɛlə/ (nguyên âm) nên dùng 'an'.",
                        vi: "Bạn có một chiếc ô không?",
                        sampleCasual: "Do you have an umbrella?",
                        sampleFormal: "Do you have an umbrella with you?",
                        ipa: "/duː juː hæv æn ʌmˈbrɛlə/",
                        grammarHint: "'umbrella' bắt đầu bằng âm nguyên âm /ʌ/ nên dùng 'an umbrella' (khác với 'a university').",
                        hints: [
                            { en: "Do you have...", vi: "Bạn có..." },
                            { en: "an umbrella", vi: "một chiếc ô" }
                        ],
                        alternatives: [
                            { label: "Anh–Anh (UK)", en: "Have you got an umbrella?" }
                        ],
                        keywords: ["do", "you", "have", "an", "umbrella"]
                    },
                    {
                        id: "st2_03_15",
                        context: "Tình huống 15/15 • Không dùng mạo từ trước danh từ số nhiều nói chung",
                        stageTag: "Chặng 2: Ăn uống",
                        level: "A1",
                        topic: "food_shop",
                        tense: "present",
                        form: "affirmative",
                        explanation: "Nói về sở thích chung với danh từ số nhiều (vegetables) không dùng a/an/the.",
                        vi: "Mình thích ăn rau củ tươi.",
                        sampleCasual: "I like eating fresh vegetables.",
                        sampleFormal: "I enjoy eating fresh vegetables.",
                        ipa: "/aɪ laɪk ˈiːtɪŋ frɛʃ ˈvɛdʒtəbəlz/",
                        grammarHint: "'vegetables' là danh từ số nhiều nói chung nên KHÔNG dùng 'a/an' hay 'the' phía trước.",
                        hints: [
                            { en: "fresh vegetables", vi: "rau củ tươi" }
                        ],
                        alternatives: [
                            { label: "Gọn hơn", en: "I like fresh vegetables." }
                        ],
                        keywords: ["like", "eating", "fresh", "vegetables"]
                    }
                ]
            }


        ],
        vocab: [
            {
                "id": "v_s2_t1_01",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "wake up",
                "pos": "phr.v",
                "ipa": "/weɪk ʌp/",
                "vi": "thức dậy",
                "exampleEn": "I wake up at 6 AM every day.",
                "exampleVi": "Mình thức dậy lúc 6 giờ sáng mỗi ngày."
            },
            {
                "id": "v_s2_t1_02",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "food_shop",
                "level": "A1",
                "term": "coffee",
                "pos": "n",
                "ipa": "/ˈkɔːfi/",
                "vi": "cà phê",
                "exampleEn": "I drink a cup of coffee in the morning.",
                "exampleVi": "Mình uống một tách cà phê vào buổi sáng."
            },
            {
                "id": "v_s2_t1_03",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "motorbike",
                "pos": "n",
                "ipa": "/ˈmoʊtərbaɪk/",
                "vi": "xe máy",
                "exampleEn": "He goes to work by motorbike.",
                "exampleVi": "Anh ấy đi làm bằng xe máy."
            },
            {
                "id": "v_s2_t1_04",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "office",
                "level": "A1",
                "term": "company",
                "pos": "n",
                "ipa": "/ˈkʌmpəni/",
                "vi": "công ty",
                "exampleEn": "She works at a small company in Hanoi.",
                "exampleVi": "Cô ấy làm việc ở một công ty nhỏ tại Hà Nội."
            },
            {
                "id": "v_s2_t1_05",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "dinner",
                "pos": "n",
                "ipa": "/ˈdɪnər/",
                "vi": "bữa tối",
                "exampleEn": "We have dinner together at 7 PM.",
                "exampleVi": "Chúng tôi ăn tối cùng nhau lúc 7 giờ tối."
            },
            {
                "id": "v_s2_t1_06",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "weekend",
                "pos": "n",
                "ipa": "/ˈwiːkɛnd/",
                "vi": "cuối tuần",
                "exampleEn": "They watch movies on weekends.",
                "exampleVi": "Họ xem phim vào cuối tuần."
            },
            {
                "id": "v_s2_t1_07",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "food_shop",
                "level": "A1",
                "term": "shop",
                "pos": "n",
                "ipa": "/ʃɑːp/",
                "vi": "cửa hàng",
                "exampleEn": "The shop opens at 8 AM.",
                "exampleVi": "Cửa hàng mở cửa lúc 8 giờ sáng."
            },
            {
                "id": "v_s2_t1_08",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "food_shop",
                "level": "A1",
                "term": "spicy",
                "pos": "adj",
                "ipa": "/ˈspaɪsi/",
                "vi": "cay",
                "exampleEn": "I don't eat spicy food.",
                "exampleVi": "Mình không ăn đồ cay."
            },
            {
                "id": "v_s2_t1_09",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "weekday",
                "pos": "n",
                "ipa": "/ˈwiːkdeɪ/",
                "vi": "ngày trong tuần",
                "exampleEn": "I don't go to bed late on weekdays.",
                "exampleVi": "Mình không đi ngủ muộn vào các ngày trong tuần."
            },
            {
                "id": "v_s2_t1_10",
                "stageId": "stage_2",
                "structId": "struct_present_simple",
                "topic": "daily",
                "level": "A1",
                "term": "before bed",
                "pos": "phr",
                "ipa": "/bɪˈfɔːr bɛd/",
                "vi": "trước khi đi ngủ",
                "exampleEn": "She reads books before bed.",
                "exampleVi": "Cô ấy đọc sách trước khi đi ngủ."
            },
            {
                "id": "v_s2_t2_01",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "always",
                "pos": "adv",
                "ipa": "/ˈɔːlweɪz/",
                "vi": "luôn luôn",
                "exampleEn": "I always have breakfast at home.",
                "exampleVi": "Mình luôn ăn sáng ở nhà."
            },
            {
                "id": "v_s2_t2_02",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "usually",
                "pos": "adv",
                "ipa": "/ˈjuːʒuəli/",
                "vi": "thường xuyên",
                "exampleEn": "What time do you usually wake up?",
                "exampleVi": "Bạn thường thức dậy lúc mấy giờ?"
            },
            {
                "id": "v_s2_t2_03",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "often",
                "pos": "adv",
                "ipa": "/ˈɔːfən/",
                "vi": "thường, hay",
                "exampleEn": "We often eat out on Friday nights.",
                "exampleVi": "Chúng tôi hay đi ăn ngoài vào tối thứ Sáu."
            },
            {
                "id": "v_s2_t2_04",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "sometimes",
                "pos": "adv",
                "ipa": "/ˈsʌmtaɪmz/",
                "vi": "thỉnh thoảng",
                "exampleEn": "I sometimes buy clothes online.",
                "exampleVi": "Mình thỉnh thoảng mua quần áo trên mạng."
            },
            {
                "id": "v_s2_t2_05",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "never",
                "pos": "adv",
                "ipa": "/ˈnɛvər/",
                "vi": "không bao giờ",
                "exampleEn": "He is never late for work.",
                "exampleVi": "Anh ấy không bao giờ đi làm muộn."
            },
            {
                "id": "v_s2_t2_06",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "exercise",
                "pos": "v",
                "ipa": "/ˈɛksərsaɪz/",
                "vi": "tập thể dục",
                "exampleEn": "How often do you exercise?",
                "exampleVi": "Bạn có hay đi tập thể dục không?"
            },
            {
                "id": "v_s2_t2_07",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "breakfast",
                "pos": "n",
                "ipa": "/ˈbrɛkfəst/",
                "vi": "bữa sáng",
                "exampleEn": "I always have breakfast at home.",
                "exampleVi": "Mình luôn ăn sáng ở nhà."
            },
            {
                "id": "v_s2_t2_08",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "food_shop",
                "level": "A1",
                "term": "eat out",
                "pos": "phr.v",
                "ipa": "/iːt aʊt/",
                "vi": "đi ăn ngoài",
                "exampleEn": "We often eat out on Friday nights.",
                "exampleVi": "Chúng tôi hay đi ăn ngoài vào tối thứ Sáu."
            },
            {
                "id": "v_s2_t2_09",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "food_shop",
                "level": "A1",
                "term": "supermarket",
                "pos": "n",
                "ipa": "/ˈsuːpərmɑːrkɪt/",
                "vi": "siêu thị",
                "exampleEn": "I go to the supermarket twice a week.",
                "exampleVi": "Mình đi siêu thị hai lần một tuần."
            },
            {
                "id": "v_s2_t2_10",
                "stageId": "stage_2",
                "structId": "struct_present_simple_q",
                "topic": "daily",
                "level": "A1",
                "term": "twice a week",
                "pos": "phr",
                "ipa": "/twaɪs ə wiːk/",
                "vi": "hai lần một tuần",
                "exampleEn": "I go to the supermarket twice a week.",
                "exampleVi": "Mình đi siêu thị hai lần một tuần."
            },
            {
                "id": "v_s2_t3_01",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "food_shop",
                "level": "A1",
                "term": "apple",
                "pos": "n",
                "ipa": "/ˈæpəl/",
                "vi": "quả táo",
                "exampleEn": "She eats an apple every day.",
                "exampleVi": "Cô ấy ăn một quả táo mỗi ngày."
            },
            {
                "id": "v_s2_t3_02",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "bicycle",
                "pos": "n",
                "ipa": "/ˈbaɪsɪkəl/",
                "vi": "xe đạp",
                "exampleEn": "That is an old bicycle.",
                "exampleVi": "Đó là một chiếc xe đạp cũ."
            },
            {
                "id": "v_s2_t3_03",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "hour",
                "pos": "n",
                "ipa": "/ˈaʊər/",
                "vi": "giờ, tiếng đồng hồ",
                "exampleEn": "I read books for an hour every night.",
                "exampleVi": "Mình đọc sách một tiếng mỗi tối."
            },
            {
                "id": "v_s2_t3_04",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "food_shop",
                "level": "A1",
                "term": "restaurant",
                "pos": "n",
                "ipa": "/ˈrɛstərɑːnt/",
                "vi": "nhà hàng",
                "exampleEn": "There is a small restaurant near here.",
                "exampleVi": "Gần đây có một nhà hàng nhỏ."
            },
            {
                "id": "v_s2_t3_05",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "food_shop",
                "level": "A1",
                "term": "cheap",
                "pos": "adj",
                "ipa": "/tʃiːp/",
                "vi": "rẻ",
                "exampleEn": "The food is very cheap.",
                "exampleVi": "Đồ ăn ở đó rất rẻ."
            },
            {
                "id": "v_s2_t3_06",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "sky",
                "pos": "n",
                "ipa": "/skaɪ/",
                "vi": "bầu trời",
                "exampleEn": "The sky is very blue today.",
                "exampleVi": "Hôm nay bầu trời rất xanh."
            },
            {
                "id": "v_s2_t3_07",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "kitchen",
                "pos": "n",
                "ipa": "/ˈkɪtʃən/",
                "vi": "nhà bếp",
                "exampleEn": "My mom is in the kitchen.",
                "exampleVi": "Mẹ mình đang ở trong bếp."
            },
            {
                "id": "v_s2_t3_08",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "food_shop",
                "level": "A1",
                "term": "jacket",
                "pos": "n",
                "ipa": "/ˈdʒækɪt/",
                "vi": "áo khoác",
                "exampleEn": "I want to buy a jacket.",
                "exampleVi": "Mình muốn mua một chiếc áo khoác."
            },
                {
                "id": "v_s2_t3_09",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "university",
                "pos": "n",
                "ipa": "/ˌjuːnəˈvɜːrsəti/",
                "vi": "trường đại học",
                "exampleEn": "She studies at a university in Hanoi.",
                "exampleVi": "Cô ấy học ở một trường đại học tại Hà Nội."
            },
            {
                "id": "v_s2_t3_10",
                "stageId": "stage_2",
                "structId": "struct_articles",
                "topic": "daily",
                "level": "A1",
                "term": "umbrella",
                "pos": "n",
                "ipa": "/ʌmˈbrɛlə/",
                "vi": "cái ô / cây dù",
                "exampleEn": "Do you have an umbrella?",
                "exampleVi": "Bạn có một chiếc ô không?"
            }
        ]
    });
}
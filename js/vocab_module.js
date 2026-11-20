/**
 * MODULE 4 (HOÀN CHỈNH V3): TỪ VỰNG THÔNG MINH - IPA QUỐC TẾ, 6 MỐC THUỘC VĨNH VIỄN & CHỐNG LỖI DẤU NHÁY ĐƠN (js/vocab_module.js)
 * Tích hợp đầy đủ:
 *  1. Sửa triệt để lỗi nút Loa không đọc được câu có dấu nháy đơn (như "one's", "I'm", "don't") bằng hàm speakVocabById.
 *  2. Lộ trình 6 mốc Spaced Repetition: 3 ngày -> 7 ngày -> 14 ngày -> 30 ngày -> 90 ngày -> 🏆 Đã thuộc vĩnh viễn (+5 XP).
 *  3. Tự động lấy IPA chuẩn từ Từ điển Quốc tế (dictionaryapi.dev) + Mở rộng từ điển Offline + Cho phép sửa tay (✏️).
 *  4. Thêm ô chọn Trình độ (A1 -> C2), Icon gợi nhớ và Link ảnh minh họa trong cửa sổ Thêm/Sửa từ vựng.
 */

(function () {
    // 1. TỪ ĐIỂN IPA MỞ RỘNG CHO GIA ĐÌNH & ĐỜI SỐNG HÀNG NGÀY
    const EXTRA_IPA_DICT = {
        "mother": "ˈmʌðər", "mom": "mɑːm", "mum": "mʌm", "father": "ˈfɑːðər", "dad": "dæd",
        "parents": "ˈpɛrənts", "brother": "ˈbrʌðər", "sister": "ˈsɪstər", "son": "sʌn", "daughter": "ˈdɔːtər",
        "husband": "ˈhʌzbənd", "wife": "waɪf", "child": "tʃaɪld", "children": "ˈtʃɪldrən", "baby": "ˈbeɪbi",
        "friend": "frɛnd", "friends": "frɛndz", "love": "lʌv", "money": "ˈmʌni", "month": "mʌnθ",
        "monday": "ˈmʌndeɪ", "sunday": "ˈsʌndeɪ", "country": "ˈkʌntri", "another": "əˈnʌðər", "other": "ˈʌðər",
        "nothing": "ˈnʌθɪŋ", "something": "ˈsʌmθɪŋ", "everything": "ˈɛvriθɪŋ", "anything": "ˈɛniθɪŋ",
        "enough": "ɪˈnʌf", "tough": "tʌf", "rough": "rʌf", "laugh": "læf", "cough": "kɔːf",
        "blood": "blʌd", "flood": "flʌd", "young": "jʌŋ", "touch": "tʌtʃ", "double": "ˈdʌbəl",
        "trouble": "ˈtrʌbəl", "couple": "ˈkʌpəl", "cousin": "ˈkʌzən", "uncle": "ˈʌŋkəl", "aunt": "ænt",
        "world": "wɜːrld", "word": "wɜːrd", "work": "wɜːrk", "learn": "lɜːrn", "early": "ˈɜːrli",
        "heard": "hɜːrd", "heart": "hɑːrt", "wear": "wɛr", "bear": "bɛr", "pear": "pɛr",
        "tear": "tɪr", "fear": "fɪr", "dear": "dɪr", "hear": "hɪr", "clear": "klɪr",
        "break": "breɪk", "great": "ɡreɪt", "steak": "steɪk", "breakfast": "ˈbrɛkfəst",
        "healthy": "ˈhɛlθi", "weather": "ˈwɛðər", "heavy": "ˈhɛvi", "ready": "ˈrɛdi", "head": "hɛd",
        "bread": "brɛd", "dead": "dɛd", "lead": "liːd", "read": "riːd", "said": "sɛd",
        "woman": "ˈwʊmən", "women": "ˈwɪmɪn", "man": "mæn", "men": "mɛn", "person": "ˈpɜːrsən",
        "people": "ˈpiːpəl", "water": "ˈwɔːtər", "watch": "wɑːtʃ", "wash": "wɑːʃ", "want": "wɑːnt",
        "warm": "wɔːrm", "walk": "wɔːk", "talk": "tɔːk", "chalk": "tʃɔːk", "calm": "kɑːm",
        "half": "hæf", "calf": "kæf", "answer": "ˈænsər", "question": "ˈkwɛstʃən",
        "island": "ˈaɪlənd", "listen": "ˈlɪsən", "often": "ˈɔːfən", "castle": "ˈkæsəl",
        "debt": "dɛt", "doubt": "daʊt", "subtle": "ˈsʌtəl", "receipt": "rɪˈsiːt", "recipe": "ˈrɛsəpi",
        "schedule": "ˈskɛdʒuːl", "comfortable": "ˈkʌmfərtəbəl", "vegetable": "ˈvɛdʒtəbəl",
        "clothes": "kloʊðz", "wednesday": "ˈwɛnzdeɪ", "february": "ˈfɛbruɛri", "library": "ˈlaɪbrɛri",
        "obligation": "ˌɑːblɪˈɡeɪʃən"
    };

    if (typeof IPA_DICT !== 'undefined') {
        Object.assign(IPA_DICT, EXTRA_IPA_DICT);
    }

    // 2. TỪ ĐIỂN ANH - VIỆT CỐT LÕI (CORE MINI-DICTIONARY CHO GIAO TIẾP & TOÀN BỘ TỪ ĐƠN TRONG BÀI TẬP)
    const CORE_VI_DICT = {
        // Từ loại cơ bản, đại từ, liên từ, giới từ hay được chạm vào
        "i": "tôi, mình", "you": "bạn", "he": "anh ấy", "she": "cô ấy", "it": "nó, điều đó",
        "we": "chúng tôi, chúng ta", "they": "họ, chúng", "me": "tôi", "him": "anh ấy", "her": "cô ấy, của cô ấy",
        "us": "chúng tôi", "them": "họ", "my": "của tôi", "your": "của bạn", "his": "của anh ấy",
        "our": "của chúng ta", "their": "của họ", "this": "này, điều này", "that": "đó, rằng",
        "these": "những cái này", "those": "những cái đó", "who": "ai, người mà", "what": "cái gì, điều gì",
        "where": "ở đâu", "when": "khi nào, khi mà", "why": "tại sao", "how": "như thế nào, bao nhiêu",
        "which": "cái nào, điều mà", "with": "với, cùng với", "without": "mà không có", "for": "cho, vì, trong khoảng",
        "from": "từ", "to": "đến, để", "in": "trong, ở", "on": "trên, vào (ngày)", "at": "tại, lúc",
        "by": "bằng, bởi, trước lúc", "about": "về, khoảng", "as": "như là, khi, vì", "into": "vào trong",
        "like": "thích, giống như", "through": "xuyên qua, thông qua", "after": "sau khi", "over": "hơn, qua",
        "between": "ở giữa", "out": "ngoài, ra ngoài", "against": "chống lại", "during": "trong suốt",
        "before": "trước khi", "under": "dưới", "around": "xung quanh, khoảng", "among": "trong số",
        "and": "và", "but": "nhưng", "or": "hoặc", "so": "vì vậy, quá", "because": "bởi vì",
        "although": "mặc dù", "though": "mặc dù", "while": "trong khi", "if": "nếu", "unless": "trừ khi",
        "until": "cho đến khi", "since": "kể từ khi, bởi vì", "whether": "liệu rằng",
        "not": "không", "only": "chỉ, duy nhất", "also": "cũng, còn", "even": "thậm chí, ngay cả",
        "still": "vẫn", "already": "đã... rồi", "yet": "chưa, vậy mà", "just": "vừa mới, chỉ",
        "very": "rất", "really": "thực sự", "quite": "khá là", "pretty": "xinh đẹp / khá là",
        "super": "cực kỳ, siêu", "too": "quá, cũng", "enough": "đủ", "almost": "hầu như, gần như",
        "always": "luôn luôn", "usually": "thường xuyên", "often": "thường", "sometimes": "thỉnh thoảng",
        "rarely": "hiếm khi", "never": "không bao giờ", "ever": "từng, bao giờ", "again": "lại lần nữa",
        "together": "cùng nhau", "alone": "một mình", "away": "xa, đi xa", "back": "quay lại, phía sau",
        "here": "ở đây", "there": "ở đó", "now": "bây giờ", "today": "hôm nay", "tomorrow": "ngày mai",
        "yesterday": "hôm qua", "soon": "sớm thôi", "later": "sau đó, để sau", "tonight": "tối nay",

        // Tính từ thông dụng trong các bài tập (A1 -> C2)
        "good": "tốt, giỏi", "great": "tuyệt vời, rất lớn", "excellent": "xuất sắc, tuyệt vời",
        "wonderful": "tuyệt vời", "amazing": "đáng kinh ngạc, tuyệt vời", "awesome": "tuyệt đỉnh",
        "beautiful": "xinh đẹp, đẹp", "handsome": "đẹp trai", "cute": "dễ thương", "lovely": "đáng yêu",
        "smart": "thông minh, sắc sảo", "intelligent": "thông minh, trí tuệ", "clever": "khéo léo, lanh lợi",
        "kind": "tốt bụng, tử tế", "nice": "tốt, dễ mến", "friendly": "thân thiện", "polite": "lịch sự",
        "generous": "hào phóng, rộng lượng", "honest": "trung thực, thật thà", "patient": "kiên nhẫn / bệnh nhân",
        "calm": "bình tĩnh, êm đềm", "careful": "cẩn thận", "careless": "bất cẩn", "helpful": "hay giúp đỡ, hữu ích",
        "useful": "hữu ích, có ích", "important": "quan trọng", "necessary": "cần thiết", "essential": "thiết yếu",
        "special": "đặc biệt", "specific": "cụ thể", "clear": "rõ ràng, trong trẻo", "obvious": "hiển nhiên",
        "easy": "dễ dàng", "simple": "đơn giản", "hard": "khó khăn, chăm chỉ", "difficult": "khó khăn",
        "complex": "phức tạp", "complicated": "phức tạp, rắc rối", "challenging": "đầy thử thách",
        "busy": "bận rộn", "free": "rảnh rỗi, miễn phí, tự do", "available": "có sẵn, đang rảnh",
        "ready": "sẵn sàng", "late": "muộn, trễ", "early": "sớm", "fast": "nhanh", "quick": "nhanh chóng",
        "slow": "chậm", "new": "mới", "old": "cũ, già", "young": "trẻ", "modern": "hiện đại",
        "big": "to, lớn", "large": "rộng lớn", "huge": "khổng lồ", "small": "nhỏ", "tiny": "bé xíu",
        "long": "dài, lâu", "short": "ngắn, thấp", "high": "cao", "low": "thấp", "deep": "sâu",
        "hot": "nóng, cay", "warm": "ấm áp", "cool": "mát mẻ, ngầu", "cold": "lạnh", "stuffy": "ngột ngạt, bí bách",
        "fresh": "tươi mới, trong lành", "clean": "sạch sẽ", "dirty": "bẩn", "neat": "gọn gàng",
        "delicious": "ngon miệng", "tasty": "ngon, đậm đà", "hungry": "đói bụng", "thirsty": "khát nước",
        "full": "đầy, no", "empty": "trống rỗng", "tired": "mệt mỏi", "exhausted": "kiệt sức",
        "sleepy": "buồn ngủ", "sick": "ốm, mệt", "ill": "bị bệnh", "healthy": "khỏe mạnh, lành mạnh",
        "strong": "mạnh mẽ, khỏe", "weak": "yếu ớt", "safe": "an toàn", "dangerous": "nguy hiểm",
        "happy": "vui vẻ, hạnh phúc", "glad": "vui mừng", "excited": "hào hứng, phấn khích",
        "proud": "tự hào", "confident": "tự tin", "comfortable": "thoải mái, dễ chịu", "relaxed": "thư giãn",
        "sad": "buồn bã", "upset": "buồn bực, khó chịu", "worried": "lo lắng", "anxious": "bồn chồn, lo âu",
        "nervous": "hồi hộp, căng thẳng", "stressed": "căng thẳng", "angry": "tức giận", "mad": "giận dữ",
        "bored": "chán nản", "boring": "nhàm chán", "interesting": "thú vị", "interested": "quan tâm, thích thú",
        "surprised": "ngạc nhiên", "shocked": "bàng hoàng, sốc", "confused": "bối rối, khó hiểu",
        "afraid": "sợ hãi", "scared": "hoảng sợ", "lonely": "cô đơn", "sorry": "xin lỗi, lấy làm tiếc",
        "expensive": "đắt đỏ", "cheap": "rẻ", "affordable": "giá cả phải chăng", "reasonable": "hợp lý",
        "rich": "giàu có", "poor": "nghèo, tội nghiệp", "successful": "thành công", "famous": "nổi tiếng",
        "popular": "phổ biến, được yêu thích", "common": "phổ biến, chung", "normal": "bình thường",
        "regular": "thường xuyên, đều đặn", "correct": "chính xác, đúng", "right": "đúng, bên phải, quyền",
        "wrong": "sai", "true": "đúng sự thật", "false": "sai sự thật", "real": "thực tế, thật",
        "possible": "có thể xảy ra", "impossible": "bất khả thi", "likely": "có khả năng cao",
        "sure": "chắc chắn", "certain": "chắc chắn, nhất định", "fluent": "trôi chảy, lưu loát",
        "native": "bản xứ", "foreign": "nước ngoài", "local": "địa phương", "international": "quốc tế",

        // Động từ thông dụng (cả nguyên thể, thêm -s/-ed/-ing)
        "be": "thì, là, ở", "am": "là, đang", "is": "là, đang", "are": "là, đang", "was": "đã là, đã ở", "were": "đã là, đã ở", "been": "đã từng",
        "have": "có, ăn/uống", "has": "có", "had": "đã có", "having": "đang có",
        "do": "làm, thực hiện", "does": "làm", "did": "đã làm", "done": "đã làm xong", "doing": "đang làm",
        "make": "làm, tạo ra, khiến", "makes": "làm, tạo ra", "made": "đã làm, đã tạo ra", "making": "đang tạo ra",
        "take": "lấy, mang, mất (thời gian)", "takes": "lấy, mất (thời gian)", "took": "đã lấy, đã mất", "taken": "đã lấy",
        "get": "nhận được, trở nên, đến", "gets": "nhận được, trở nên", "got": "đã nhận, đã có", "getting": "đang trở nên",
        "go": "đi", "goes": "đi", "went": "đã đi", "gone": "đã đi", "going": "đang đi, sắp",
        "come": "đến", "comes": "đến", "came": "đã đến", "coming": "đang đến",
        "know": "biết", "knows": "biết", "knew": "đã biết", "known": "được biết đến",
        "think": "nghĩ, suy nghĩ", "thinks": "nghĩ", "thought": "đã nghĩ, suy nghĩ",
        "see": "nhìn thấy, hiểu, gặp", "sees": "nhìn thấy", "saw": "đã thấy", "seen": "đã nhìn thấy",
        "look": "nhìn, trông có vẻ", "looks": "trông có vẻ", "looked": "đã nhìn", "looking": "đang tìm/nhìn",
        "watch": "xem, theo dõi", "watched": "đã xem", "watching": "đang xem",
        "want": "muốn", "wants": "muốn", "wanted": "đã muốn", "need": "cần", "needs": "cần", "needed": "đã cần",
        "use": "sử dụng, dùng", "uses": "sử dụng", "used": "đã dùng, quen với", "using": "đang sử dụng",
        "find": "tìm thấy, cảm thấy", "finds": "tìm thấy", "found": "đã tìm thấy",
        "give": "đưa, cho, tặng", "gives": "cho, mang lại", "gave": "đã đưa", "given": "đã cho",
        "tell": "nói, kể cho", "tells": "kể, nói", "told": "đã bảo, đã kể",
        "say": "nói rằng", "says": "nói", "said": "đã nói", "speak": "nói, phát biểu", "spoke": "đã nói", "spoken": "được nói",
        "talk": "trò chuyện, nói chuyện", "talked": "đã nói chuyện", "talking": "đang nói chuyện",
        "ask": "hỏi, yêu cầu, nhờ", "asked": "đã hỏi", "answer": "trả lời / câu trả lời", "answered": "đã trả lời",
        "work": "làm việc / công việc", "works": "làm việc, hiệu quả", "worked": "đã làm việc", "working": "đang làm việc",
        "try": "cố gắng, thử", "tries": "cố gắng", "tried": "đã cố gắng, đã thử", "trying": "đang cố gắng",
        "call": "gọi điện, gọi là", "called": "đã gọi", "feel": "cảm thấy", "feels": "cảm thấy", "felt": "đã cảm thấy",
        "become": "trở nên, trở thành", "becomes": "trở nên", "became": "đã trở thành",
        "leave": "rời đi, để lại", "left": "đã rời đi, bên trái", "put": "đặt, để",
        "mean": "có nghĩa là, có ý", "means": "có nghĩa là", "meant": "đã có ý",
        "keep": "giữ, tiếp tục", "keeps": "giữ", "kept": "đã giữ",
        "let": "để cho, hãy", "begin": "bắt đầu", "began": "đã bắt đầu", "start": "bắt đầu, khởi đầu", "started": "đã bắt đầu",
        "stop": "dừng lại, ngừng", "stopped": "đã dừng", "finish": "hoàn thành, kết thúc", "finished": "đã hoàn thành",
        "help": "giúp đỡ", "helps": "giúp đỡ", "helped": "đã giúp",
        "show": "cho thấy, chỉ dẫn", "showed": "đã chỉ ra", "hear": "nghe thấy", "heard": "đã nghe",
        "play": "chơi, đóng vai", "run": "chạy, vận hành", "move": "di chuyển, chuyển nhà",
        "live": "sống, sinh sống", "lived": "đã sống", "believe": "tin tưởng", "hold": "cầm, nắm, tổ chức",
        "bring": "mang đến", "brought": "đã mang đến", "happen": "xảy ra", "happened": "đã xảy ra",
        "write": "viết", "wrote": "đã viết", "written": "đã viết", "read": "đọc", "reading": "đang đọc",
        "learn": "học, tìm hiểu", "learned": "đã học", "learning": "đang học", "study": "học tập, nghiên cứu",
        "change": "thay đổi", "changed": "đã thay đổi", "understand": "hiểu", "understood": "đã hiểu",
        "remember": "nhớ, ghi nhớ", "forget": "quên", "forgot": "đã quên", "forgotten": "đã quên",
        "buy": "mua", "bought": "đã mua", "pay": "trả tiền, thanh toán", "paid": "đã trả tiền",
        "cost": "tốn, trị giá / chi phí", "costs": "chi phí, tốn", "save": "tiết kiệm, lưu lại, cứu", "saves": "giúp tiết kiệm", "saved": "đã tiết kiệm",
        "spend": "dành (thời gian), tiêu (tiền)", "spent": "đã dành, đã tiêu",
        "reduce": "giảm bớt, cắt giảm", "reduces": "làm giảm", "reduced": "đã giảm",
        "cut": "cắt, cắt giảm", "cuts": "cắt giảm", "improve": "cải thiện, nâng cao", "improves": "cải thiện",
        "eat": "ăn", "ate": "đã ăn", "dine": "dùng bữa, ăn tối", "drink": "uống / đồ uống", "drank": "đã uống",
        "sleep": "ngủ", "slept": "đã ngủ", "wake": "thức dậy", "woke": "đã thức dậy",
        "meet": "gặp gỡ, đáp ứng", "met": "đã gặp", "wait": "chờ đợi", "waited": "đã đợi",
        "hope": "hy vọng", "wish": "ước, chúc", "wished": "đã ước", "regret": "hối tiếc, ân hận",
        "apologize": "xin lỗi", "explain": "giải thích", "explained": "đã giải thích",
        "decide": "quyết định", "decided": "đã quyết định", "choose": "chọn, lựa chọn", "chose": "đã chọn",
        "accept": "chấp nhận", "refuse": "từ chối", "agree": "đồng ý", "disagree": "không đồng ý",
        "prefer": "thích... hơn", "enjoy": "tận hưởng, yêu thích", "love": "yêu, rất thích", "hate": "ghét",
        "mind": "phiền, bận tâm / tâm trí", "care": "quan tâm, chăm sóc", "worry": "lo lắng",
        "matter": "vấn đề, quan trọng", "practice": "luyện tập, thực hành", "practicing": "đang luyện tập",
        "prepare": "chuẩn bị", "check": "kiểm tra", "fix": "sửa chữa", "solve": "giải quyết",
        "send": "gửi", "sent": "đã gửi", "receive": "nhận được", "arrive": "đến nơi", "arrived": "đã đến nơi",
        "travel": "đi du lịch, di chuyển", "visit": "thăm, ghé thăm", "stay": "ở lại, duy trì", "stayed": "đã ở lại",

        // Danh từ phổ biến trong công việc & đời sống
        "time": "thời gian, lần", "day": "ngày", "days": "những ngày", "week": "tuần", "month": "tháng", "year": "năm", "years": "những năm",
        "morning": "buổi sáng", "afternoon": "buổi chiều", "evening": "buổi tối", "night": "ban đêm, tối",
        "hour": "giờ, tiếng đồng hồ", "hours": "nhiều giờ", "minute": "phút", "minutes": "nhiều phút",
        "moment": "khoảnh khắc, lát", "schedule": "lịch trình, thời gian biểu", "plan": "kế hoạch / lên kế hoạch",
        "deadline": "hạn chót", "appointment": "cuộc hẹn", "meeting": "cuộc họp, buổi gặp",
        "family": "gia đình", "parents": "bố mẹ", "mother": "mẹ, người mẹ", "mom": "mẹ", "father": "bố, cha", "dad": "bố",
        "son": "con trai", "daughter": "con gái", "brother": "anh/em trai", "sister": "chị/em gái",
        "husband": "chồng", "wife": "vợ", "child": "đứa trẻ, con", "children": "trẻ em, con cái",
        "friend": "người bạn", "friends": "bạn bè", "colleague": "đồng nghiệp", "colleagues": "các đồng nghiệp",
        "boss": "sếp, cấp trên", "manager": "người quản lý", "customer": "khách hàng", "client": "khách hàng, đối tác",
        "people": "mọi người, người ta", "person": "người, cá nhân", "everyone": "mọi người", "someone": "ai đó",
        "anyone": "bất kỳ ai", "no": "không", "nobody": "không ai", "nothing": "không có gì", "something": "điều gì đó",
        "everything": "mọi thứ", "anything": "bất cứ điều gì",
        "home": "nhà, tổ ấm", "house": "ngôi nhà", "room": "căn phòng", "office": "văn phòng",
        "company": "công ty", "business": "công việc kinh doanh", "job": "công việc, nghề nghiệp",
        "career": "sự nghiệp", "project": "dự án", "task": "nhiệm vụ, công việc", "report": "báo cáo",
        "email": "thư điện tử", "message": "tin nhắn", "phone": "điện thoại", "call": "cuộc gọi",
        "computer": "máy tính", "laptop": "máy tính xách tay", "software": "phần mềm", "app": "ứng dụng",
        "application": "ứng dụng, đơn đăng ký", "system": "hệ thống", "data": "dữ liệu", "information": "thông tin",
        "problem": "vấn đề, rắc rối", "issue": "vấn đề", "bug": "lỗi phần mềm", "mistake": "lỗi, sai lầm",
        "error": "lỗi", "solution": "giải pháp", "idea": "ý tưởng", "advice": "lời khuyên",
        "opinion": "ý kiến, quan điểm", "reason": "lý do", "result": "kết quả", "experience": "kinh nghiệm, trải nghiệm",
        "skill": "kỹ năng", "skills": "các kỹ năng", "knowledge": "kiến thức", "education": "giáo dục",
        "language": "ngôn ngữ", "english": "tiếng Anh", "word": "từ vựng, lời nói", "words": "những từ ngữ",
        "sentence": "câu văn", "grammar": "ngữ pháp", "pronunciation": "cách phát âm", "accent": "giọng điệu",
        "book": "cuốn sách", "books": "những cuốn sách", "story": "câu chuyện", "movie": "bộ phim", "music": "âm nhạc",
        "food": "đồ ăn, thực phẩm", "meal": "bữa ăn", "breakfast": "bữa sáng", "lunch": "bữa trưa", "dinner": "bữa tối",
        "coffee": "cà phê", "tea": "trà", "water": "nước", "restaurant": "nhà hàng", "service": "dịch vụ, phục vụ",
        "attitude": "thái độ", "quality": "chất lượng", "price": "giá cả", "money": "tiền bạc", "budget": "ngân sách",
        "salary": "tiền lương", "income": "thu nhập", "market": "thị trường, chợ", "shop": "cửa hàng", "store": "cửa hàng",
        "city": "thành phố", "country": "đất nước, vùng quê", "world": "thế giới", "street": "đường phố", "road": "con đường",
        "traffic": "giao thông", "car": "xe hơi", "bus": "xe buýt", "train": "tàu hỏa", "subway": "tàu điện ngầm",
        "airport": "sân bay", "flight": "chuyến bay", "hotel": "khách sạn", "trip": "chuyến đi", "vacation": "kỳ nghỉ",
        "weather": "thời tiết", "rain": "cơn mưa / mưa", "sun": "mặt trời, nắng", "wind": "gió", "air": "không khí",
        "health": "sức khỏe", "body": "cơ thể", "heart": "trái tim", "life": "cuộc sống, cuộc đời",
        "way": "cách thức, con đường", "place": "nơi chốn, địa điểm", "part": "phần", "case": "trường hợp",
        "point": "điểm, ý chính", "fact": "sự thật, thực tế", "truth": "sự thật", "habit": "thói quen",
        "opportunity": "cơ hội", "chance": "cơ hội, khả năng", "choice": "sự lựa chọn", "decision": "quyết định",
        "effort": "nỗ lực, sự cố gắng", "success": "sự thành công", "goal": "mục tiêu", "dream": "ước mơ",
        "obligation": "nghĩa vụ, bổn phận", "responsibility": "trách nhiệm", "duty": "bổn phận, nhiệm vụ",
        "permission": "sự cho phép", "rule": "quy tắc", "law": "luật pháp", "peace": "sự bình yên, hòa bình"
    };

    // Bộ nhớ đệm tự học (Self-Learning Cache) lưu các từ đã tra API hoặc người dùng đã từng lưu
    function getLearnedViMeaningCache() {
        try {
            return JSON.parse(localStorage.getItem('va_vi_meaning_cache')) || {};
        } catch (e) {
            return {};
        }
    }

    function saveLearnedViMeaningCache(word, viMeaning) {
        if (!word || !viMeaning) return;
        const cleanW = word.trim().toLowerCase();
        const cleanVi = viMeaning.trim();
        if (!cleanW || !cleanVi) return;
        try {
            const cache = getLearnedViMeaningCache();
            cache[cleanW] = cleanVi;
            localStorage.setItem('va_vi_meaning_cache', JSON.stringify(cache));
        } catch (e) {}
    }

    // Chuẩn hóa từ gốc (Stemming cơ bản) nếu từ có hậu tố -s/-es/-ed/-ing/-ly
    function getBaseWordCandidates(lowerWord) {
        const candidates = [lowerWord];
        if (lowerWord.includes("'")) {
            const prefix = lowerWord.split("'")[0];
            if (prefix) candidates.push(prefix);
        }
        if (lowerWord.endsWith("ies") && lowerWord.length > 4) candidates.push(lowerWord.slice(0, -3) + "y");
        if (lowerWord.endsWith("es") && lowerWord.length > 3) candidates.push(lowerWord.slice(0, -2));
        if (lowerWord.endsWith("s") && lowerWord.length > 3) candidates.push(lowerWord.slice(0, -1));
        if (lowerWord.endsWith("ied") && lowerWord.length > 4) candidates.push(lowerWord.slice(0, -3) + "y");
        if (lowerWord.endsWith("ed") && lowerWord.length > 3) {
            candidates.push(lowerWord.slice(0, -2));
            candidates.push(lowerWord.slice(0, -1));
        }
        if (lowerWord.endsWith("ing") && lowerWord.length > 4) {
            candidates.push(lowerWord.slice(0, -3));
            candidates.push(lowerWord.slice(0, -3) + "e");
        }
        if (lowerWord.endsWith("ly") && lowerWord.length > 4) candidates.push(lowerWord.slice(0, -2));
        return candidates;
    }

    // Tra cứu tức thì trong Từ điển Cốt lõi + Cache + Khớp chính xác 100% với Hints (Tuyệt đối KHÔNG lấy nghĩa cả cụm gán cho 1 từ đơn)
    function lookupOfflineVietnameseMeaning(wordOrPhrase) {
        const cleanW = (wordOrPhrase || '').trim().toLowerCase().replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
        if (!cleanW) return '';

        // 1. Kiểm tra nếu người dùng đã lưu từ này hoặc từng tra trong Cache
        const cache = getLearnedViMeaningCache();
        if (cache[cleanW]) return cache[cleanW];

        // 2. Chỉ lấy từ hints nếu từ đang tra KHỚP CHÍNH XÁC 100% với cụm hint đó
        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        if (currentQ && Array.isArray(currentQ.hints)) {
            const exact = currentQ.hints.find(h => (h.en || '').trim().toLowerCase() === cleanW);
            if (exact && exact.vi) return exact.vi;
        }

        // 3. Tra trong Từ điển Cốt lõi CORE_VI_DICT (kèm biến thể nguyên mẫu)
        const candidates = getBaseWordCandidates(cleanW);
        for (const cand of candidates) {
            if (CORE_VI_DICT[cand]) return CORE_VI_DICT[cand];
        }

        return '';
    }

    // Tự động gọi API Dịch thuật Anh - Việt miễn phí (Google Translate GTX + MyMemory Fallback) cho mọi từ/cụm từ bất kỳ
    async function fetchVietnameseMeaningAPI(text) {
        const clean = (text || '').trim();
        if (!clean || clean.length > 80) return null;

        const offline = lookupOfflineVietnameseMeaning(clean);
        if (offline) return offline;

        // Ưu tiên 1: Google Translate бесплатный endpoint (cực nhanh & chuẩn nghĩa từ đơn tiếng Việt)
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(clean)}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                // Nếu có từ điển từ loại (dt=bd) cho từ đơn, ghép 2 nghĩa thông dụng nhất cho tự nhiên
                if (data && Array.isArray(data[1]) && data[1][0] && Array.isArray(data[1][0][1])) {
                    const topTerms = data[1][0][1].slice(0, 2).map(t => t.trim()).filter(Boolean);
                    if (topTerms.length > 0) {
                        const resultVi = topTerms.join(', ');
                        saveLearnedViMeaningCache(clean, resultVi);
                        return resultVi;
                    }
                }
                // Nếu là cụm từ hoặc chỉ có bản dịch chính (data[0])
                if (data && Array.isArray(data[0]) && data[0][0] && data[0][0][0]) {
                    const mainTrans = String(data[0][0][0]).trim();
                    if (mainTrans && mainTrans.toLowerCase() !== clean.toLowerCase()) {
                        saveLearnedViMeaningCache(clean, mainTrans);
                        return mainTrans;
                    }
                }
            }
        } catch (e) {}

        // Ưu tiên 2 (Dự phòng): MyMemory Translated API
        try {
            const res2 = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|vi`);
            if (res2.ok) {
                const data2 = await res2.json();
                const translated = data2?.responseData?.translatedText;
                if (translated && translated.toLowerCase() !== clean.toLowerCase()) {
                    const cleanTrans = translated.replace(/^[.,;:\s]+|[.,;:\s]+$/g, '').trim();
                    saveLearnedViMeaningCache(clean, cleanTrans);
                    return cleanTrans;
                }
            }
        } catch (e) {}

        return null;
    }

    function suggestVisualEmoji(enText, viText) {
        const combined = `${enText || ''} ${viText || ''}`.toLowerCase();
        if (/mother|mom|mẹ/.test(combined)) return "👩‍👧";
        if (/father|dad|bố|ba/.test(combined)) return "👨‍👧";
        if (/family|parents|gia đình/.test(combined)) return "👨‍👩‍👧‍👦";
        if (/time|minute|hour|morning|schedule|thời gian|phút|giờ|sáng|lịch/.test(combined)) return "⏳";
        if (/cost|money|price|expensive|buy|chi phí|tiền|đắt|mua/.test(combined)) return "💰";
        if (/work|office|meeting|project|report|công việc|họp|dự án|báo cáo/.test(combined)) return "💼";
        if (/coffee|food|dinner|breakfast|drink|eat|cà phê|ăn|uống|nhà hàng/.test(combined)) return "☕";
        if (/travel|airport|flight|train|bus|subway|du lịch|sân bay|tàu|xe/.test(combined)) return "✈️";
        if (/weather|rain|cold|stuffy|mưa|lạnh|thời tiết/.test(combined)) return "🌦️";
        if (/health|exercise|stress|relax|sức khỏe|tập|nghỉ ngơi/.test(combined)) return "🌿";
        if (/book|read|study|learn|english|language|sách|đọc|học|tiếng anh/.test(combined)) return "📘";
        if (/computer|software|app|bug|code|máy tính|phần mềm|lỗi/.test(combined)) return "💻";
        return "💡";
    }

    function isVocabDueForReview(item) {
        if (!item || !item.mastered || item.foreverMastered || !item.nextReviewDue) return false;
        return new Date(item.nextReviewDue).getTime() <= Date.now();
    }

    function getDaysUntilReview(item) {
        if (!item || !item.nextReviewDue) return 0;
        const diffMs = new Date(item.nextReviewDue).getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    function getVocabBank() {
        try {
            const raw = JSON.parse(localStorage.getItem('va_vocab_bank')) || [];
            let modified = false;
            raw.forEach(item => {
                const cleanKey = (item.en || '').trim().toLowerCase();
                if (EXTRA_IPA_DICT[cleanKey] && item.ipa !== `/${EXTRA_IPA_DICT[cleanKey]}/`) {
                    item.ipa = `/${EXTRA_IPA_DICT[cleanKey]}/`;
                    modified = true;
                }
                if (!item.emoji) {
                    item.emoji = suggestVisualEmoji(item.en, item.vi);
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('va_vocab_bank', JSON.stringify(raw));
            }
            return raw;
        } catch (e) {
            return [];
        }
    }

    function saveVocabBank(list) {
        localStorage.setItem('va_vocab_bank', JSON.stringify(list));
        updateCombinedNotebookBadge();
    }

    function getPhraseIPA(phrase) {
        if (!phrase) return "";
        const clean = phrase.replace(/^["']|["']$/g, '').trim();
        const lower = clean.toLowerCase();
        if (EXTRA_IPA_DICT[lower]) return `/${EXTRA_IPA_DICT[lower]}/`;
        if (typeof sentenceToIPA === 'function') {
            return sentenceToIPA(clean);
        }
        return `/${lower}/`;
    }

    async function fetchAccurateIPAFromDictionaryAPI(text) {
        if (!text) return null;
        const words = text.trim().replace(/[.,?!;:"']/g, '').split(/\s+/).filter(Boolean);
        if (words.length === 0 || words.length > 4) return null;

        try {
            const ipaParts = await Promise.all(words.map(async (w) => {
                const lower = w.toLowerCase();
                if (EXTRA_IPA_DICT[lower]) return EXTRA_IPA_DICT[lower];
                if (typeof IPA_DICT !== 'undefined' && IPA_DICT[lower]) return IPA_DICT[lower];

                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`);
                if (!res.ok) return null;
                const data = await res.json();
                const entry = data && data[0];
                if (!entry) return null;
                let phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text);
                if (phonetic) {
                    return phonetic.replace(/^\/|\/$/g, '').trim();
                }
                return null;
            }));

            if (ipaParts.every(Boolean)) {
                return `/${ipaParts.join(' ')}/`;
            }
        } catch (e) {
            // Đang offline thì dùng bộ từ điển nội bộ
        }
        return null;
    }

    async function autoRefineSavedVocabIPA(vocabId, enText) {
        const apiIpa = await fetchAccurateIPAFromDictionaryAPI(enText);
        if (!apiIpa) return;
        const list = getVocabBank();
        const target = list.find(item => item.id === vocabId);
        if (target && target.ipa !== apiIpa) {
            target.ipa = apiIpa;
            saveVocabBank(list);
            const vocabSection = document.getElementById('notebook-vocab-section');
            if (vocabSection && !vocabSection.classList.contains('hidden')) {
                renderVocabSection();
            }
        }
    }

    function updateCombinedNotebookBadge() {
        const badgeEl = document.getElementById('notebook-badge');
        const sentenceCount = (typeof state !== 'undefined' && Array.isArray(state.notebook)) ? state.notebook.length : 0;
        const vocabCount = getVocabBank().length;
        if (badgeEl) badgeEl.innerText = sentenceCount + vocabCount;

        const sentTabCount = document.getElementById('nb-tab-sent-count');
        const vocabTabCount = document.getElementById('nb-tab-vocab-count');
        if (sentTabCount) sentTabCount.innerText = sentenceCount;
        if (vocabTabCount) vocabTabCount.innerText = vocabCount;
    }

    window.saveWordToVocabBank = function (enText, viMeaning, btnEl = null) {
        const cleanEn = (enText || "").trim();
        const cleanVi = (viMeaning || "").trim();
        if (!cleanEn) return;

        const vocabList = getVocabBank();
        const existingIdx = vocabList.findIndex(item => (item.en || "").toLowerCase() === cleanEn.toLowerCase());

        if (existingIdx !== -1) {
            if (typeof showToast === 'function') {
                showToast(`Cụm từ "${cleanEn}" đã có sẵn trong Sổ tay từ vựng của bạn!`, "info");
            }
            return;
        }

        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        const exampleEn = currentQ ? (currentQ.sampleCasual || "") : "";
        const exampleVi = currentQ ? (currentQ.vi || "") : "";
        const level = currentQ && typeof normalizeCEFRLevel === 'function' ? normalizeCEFRLevel(currentQ.level) : "A2";
        const topicLabel = currentQ
            ? (currentQ.isStructureMode && currentQ.structureInfo ? currentQ.structureInfo.shortName : (typeof TOPIC_LABELS !== 'undefined' && TOPIC_LABELS[currentQ.topic] ? TOPIC_LABELS[currentQ.topic] : "Giao tiếp"))
            : "Từ vựng thực chiến";

        const newId = 'voc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const newVocab = {
            id: newId,
            en: cleanEn,
            vi: cleanVi || "Từ vựng trọng tâm",
            ipa: getPhraseIPA(cleanEn),
            emoji: suggestVisualEmoji(cleanEn, cleanVi),
            imageUrl: "",
            level: level,
            topic: topicLabel,
            exampleEn: exampleEn,
            exampleVi: exampleVi,
            mastered: false,
            foreverMastered: false,
            reviewStage: 0,
            nextReviewDue: null,
            addedAt: new Date().toISOString()
        };

        vocabList.unshift(newVocab);
        saveVocabBank(vocabList);
        autoRefineSavedVocabIPA(newId, cleanEn);

        if (typeof addXP === 'function') addXP(2);

        if (btnEl) {
            btnEl.className = "ml-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1 transition-all";
            btnEl.innerHTML = `<i class="fa-solid fa-check"></i><span>Đã lưu</span>`;
            btnEl.onclick = null;
        }

        if (typeof showToast === 'function') {
            showToast(`✨ Đã lưu "${cleanEn}" vào Kho từ vựng (+2 XP)!`, "success");
        }
    };

    window.speakHintByIndex = function (idx, btnEl) {
        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        if (!currentQ || !Array.isArray(currentQ.hints) || !currentQ.hints[idx]) return;
        const text = currentQ.hints[idx].en || "";
        if (text && typeof speakText === 'function') {
            speakText(text, btnEl);
        }
    };

    window.saveHintByIndex = function (idx, btnEl) {
        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        if (!currentQ || !Array.isArray(currentQ.hints) || !currentQ.hints[idx]) return;
        const h = currentQ.hints[idx];
        window.saveWordToVocabBank(h.en || "", h.vi || "", btnEl);
    };

    function enhanceHintsListWithSaveButtons() {
        const hintsList = document.getElementById('hints-list');
        if (!hintsList) return;

        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        if (!currentQ || !Array.isArray(currentQ.hints)) return;

        const vocabList = getVocabBank();
        const savedSet = new Set(vocabList.map(v => (v.en || "").toLowerCase()));

        hintsList.innerHTML = currentQ.hints.map((h, idx) => {
            const isSaved = savedSet.has((h.en || "").trim().toLowerCase());

            const saveBtnHTML = isSaved
                ? `<span class="ml-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1"><i class="fa-solid fa-check"></i>Đã lưu</span>`
                : `<button type="button" onclick="saveHintByIndex(${idx}, this)" class="ml-1 px-2 py-0.5 rounded-md bg-amber-100/80 hover:bg-indigo-600 text-amber-800 hover:text-white font-bold text-[10px] inline-flex items-center gap-1 transition-all">
                       <i class="fa-solid fa-plus text-[9px]"></i><span>Lưu từ</span>
                   </button>`;

            return `
                <div class="inline-flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
                    <span class="font-bold text-indigo-700">${h.en || ''}</span>
                    <span class="text-slate-400">•</span>
                    <span class="text-slate-600">${h.vi || ''}</span>
                    <button type="button" onclick="speakHintByIndex(${idx}, this)" class="ml-1 w-6 h-6 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 inline-flex items-center justify-center transition-all">
                        <i class="fa-solid fa-volume-low"></i>
                    </button>
                    ${saveBtnHTML}
                </div>
            `;
        }).join('');
    }

    window.speakNotebookSentenceById = function (sentId, type, btnEl) {
        const nbList = (typeof state !== 'undefined' && Array.isArray(state.notebook)) ? state.notebook : [];
        const item = nbList.find(s => String(s.id) === String(sentId));
        if (!item) return;
        const casualText = item.casual || item.sampleCasual || "";
        const formalText = item.formal || item.sampleFormal || casualText;
        const text = type === 'formal' ? formalText : casualText;
        if (text && typeof speakText === 'function') {
            speakText(text, btnEl);
        }
    };

    function safeRenderSentenceNotebook() {
        const listEl = document.getElementById('notebook-list');
        const emptyEl = document.getElementById('notebook-empty');
        if (!listEl || !emptyEl) return;

        const nbList = (typeof state !== 'undefined' && Array.isArray(state.notebook)) ? state.notebook : [];
        if (nbList.length === 0) {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');
        listEl.innerHTML = nbList.map(item => {
            const casualText = item.casual || item.sampleCasual || "";
            const formalText = item.formal || item.sampleFormal || casualText;
            return `
                <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 mb-1.5">
                                ${item.topic || 'Mẫu câu giao tiếp'}
                            </span>
                            <h3 class="text-base sm:text-lg font-bold text-slate-900">"${item.vi || ''}"</h3>
                        </div>
                        <button type="button" onclick="deleteFromNotebook('${item.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div class="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-3">
                            <div>
                                <span class="text-[11px] font-bold text-blue-600 uppercase">Tự nhiên (Casual)</span>
                                <p class="text-sm font-semibold text-slate-800 mt-0.5">${casualText}</p>
                            </div>
                            <button type="button" onclick="speakNotebookSentenceById('${item.id}', 'casual', this)" class="w-8 h-8 rounded-full bg-white text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 hover:bg-blue-600 hover:text-white transition-all">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                        </div>
                        <div class="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-3">
                            <div>
                                <span class="text-[11px] font-bold text-purple-600 uppercase">Trang trọng (Formal)</span>
                                <p class="text-sm font-semibold text-slate-800 mt-0.5">${formalText}</p>
                            </div>
                            <button type="button" onclick="speakNotebookSentenceById('${item.id}', 'formal', this)" class="w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-200 flex items-center justify-center shrink-0 hover:bg-purple-600 hover:text-white transition-all">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ==================== GIAO DIỆN NGĂN TỪ VỰNG & FLASHCARD TRONG SỔ TAY ====================
    let currentNotebookSubTab = 'vocab';
    let vocabFilterMode = 'all';
    let isFlashcardMode = false;
    let flashcardIndex = 0;
    let isFlashcardFlipped = false;

    function injectVocabSubTabsIntoNotebook() {
        const notebookView = document.getElementById('view-notebook');
        if (!notebookView || document.getElementById('notebook-subtabs-bar')) return;

        const firstHeaderBox = notebookView.firstElementChild;
        if (!firstHeaderBox) return;

        const subTabsBar = document.createElement('div');
        subTabsBar.id = 'notebook-subtabs-bar';
        subTabsBar.className = "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs";
        subTabsBar.innerHTML = `
            <div class="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl flex-1 max-w-md">
                <button id="nb-subtab-sentences" type="button" onclick="switchNotebookSubTab('sentences')" class="py-2 px-3 rounded-lg text-xs sm:text-sm font-extrabold bg-white text-indigo-600 shadow-2xs transition-all flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-quote-left text-xs"></i>
                    <span>Mẫu câu</span>
                    <span id="nb-tab-sent-count" class="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700">0</span>
                </button>
                <button id="nb-subtab-vocab" type="button" onclick="switchNotebookSubTab('vocab')" class="py-2 px-3 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-spell-check text-xs text-amber-500"></i>
                    <span>Từ vựng</span>
                    <span id="nb-tab-vocab-count" class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">0</span>
                </button>
            </div>

            <div id="vocab-toolbar-actions" class="hidden flex flex-wrap items-center gap-2">
                <button type="button" id="toggle-flashcard-btn" onclick="toggleVocabFlashcardMode()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-all">
                    <i class="fa-solid fa-clone"></i>
                    <span id="toggle-flashcard-text">Luyện Flashcard</span>
                </button>
                <button type="button" onclick="openQuickAddVocabModal()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all">
                    <i class="fa-solid fa-plus"></i>
                    <span>Tự thêm từ mới</span>
                </button>
            </div>
        `;

        const vocabSection = document.createElement('div');
        vocabSection.id = 'notebook-vocab-section';
        vocabSection.className = "hidden space-y-4";

        firstHeaderBox.insertAdjacentElement('afterend', subTabsBar);
        subTabsBar.insertAdjacentElement('afterend', vocabSection);
        updateCombinedNotebookBadge();
    }

    window.switchNotebookSubTab = function (subTab) {
        currentNotebookSubTab = subTab;
        injectVocabSubTabsIntoNotebook();

        const sentBtn = document.getElementById('nb-subtab-sentences');
        const vocabBtn = document.getElementById('nb-subtab-vocab');
        const sentList = document.getElementById('notebook-list');
        const sentEmpty = document.getElementById('notebook-empty');
        const vocabSection = document.getElementById('notebook-vocab-section');
        const vocabToolbar = document.getElementById('vocab-toolbar-actions');

        if (subTab === 'vocab') {
            if (vocabBtn) vocabBtn.className = "py-2 px-3 rounded-lg text-xs sm:text-sm font-extrabold bg-white text-indigo-600 shadow-2xs transition-all flex items-center justify-center gap-1.5";
            if (sentBtn) sentBtn.className = "py-2 px-3 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5";

            if (sentList) sentList.classList.add('hidden');
            if (sentEmpty) sentEmpty.classList.add('hidden');
            if (vocabSection) vocabSection.classList.remove('hidden');
            if (vocabToolbar) vocabToolbar.classList.remove('hidden');

            renderVocabSection();
        } else {
            if (sentBtn) sentBtn.className = "py-2 px-3 rounded-lg text-xs sm:text-sm font-extrabold bg-white text-indigo-600 shadow-2xs transition-all flex items-center justify-center gap-1.5";
            if (vocabBtn) vocabBtn.className = "py-2 px-3 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5";

            if (vocabSection) vocabSection.classList.add('hidden');
            if (vocabToolbar) vocabToolbar.classList.add('hidden');
            if (sentList) sentList.classList.remove('hidden');

            safeRenderSentenceNotebook();
        }
        updateCombinedNotebookBadge();
    };

    window.setVocabFilterMode = function (mode) {
        vocabFilterMode = mode;
        flashcardIndex = 0;
        isFlashcardFlipped = false;
        renderVocabSection();
    };

    // Lộ trình 6 mốc Spaced Repetition: 3 ngày -> 7 ngày -> 14 ngày -> 30 ngày -> 90 ngày -> 🏆 Đã thuộc vĩnh viễn
    window.toggleVocabMastered = function (id) {
        const list = getVocabBank();
        const target = list.find(item => item.id === id);
        if (!target) return;

        const isDue = isVocabDueForReview(target);
        if (!target.mastered || isDue) {
            target.mastered = true;
            const stage = (target.reviewStage || 0) + 1;
            target.reviewStage = stage;

            const daysMap = { 1: 3, 2: 7, 3: 14, 4: 30, 5: 90 };

            if (stage >= 6) {
                target.foreverMastered = true;
                target.nextReviewDue = null;
                if (typeof addXP === 'function') addXP(5);
                if (typeof showToast === 'function') {
                    showToast(`🏆 Tuyệt đỉnh! Bạn đã chinh phục vĩnh viễn từ "${target.en}" qua 6 chu kỳ (+5 XP)!`, "success");
                }
            } else {
                target.foreverMastered = false;
                const waitDays = daysMap[stage];
                const due = new Date();
                due.setDate(due.getDate() + waitDays);
                target.nextReviewDue = due.toISOString();

                if (typeof showToast === 'function') {
                    showToast(`🎉 Đã thuộc "${target.en}" (Mốc ${stage}/6)! Hẹn kiểm tra lại sau ${waitDays} ngày nữa.`, "success");
                }
            }
        } else {
            target.mastered = false;
            target.foreverMastered = false;
            target.reviewStage = 0;
            target.nextReviewDue = null;
            if (typeof showToast === 'function') {
                showToast(`Đã đưa "${target.en}" về lại danh sách Đang học.`, "info");
            }
        }

        saveVocabBank(list);
        renderVocabSection();
    };

    window.deleteVocabItem = function (id) {
        const list = getVocabBank().filter(item => item.id !== id);
        saveVocabBank(list);
        if (flashcardIndex >= list.length) flashcardIndex = Math.max(0, list.length - 1);
        renderVocabSection();
        if (typeof showToast === 'function') {
            showToast("Đã xóa từ vựng khỏi Sổ tay.", "info");
        }
    };

    window.toggleVocabFlashcardMode = function () {
        isFlashcardMode = !isFlashcardMode;
        flashcardIndex = 0;
        isFlashcardFlipped = false;
        const btnText = document.getElementById('toggle-flashcard-text');
        if (btnText) btnText.innerText = isFlashcardMode ? "Xem dạng Danh sách" : "Luyện Flashcard";
        renderVocabSection();
    };

    window.flipCurrentFlashcard = function () {
        isFlashcardFlipped = !isFlashcardFlipped;
        renderVocabSection();
    };

    window.stepFlashcard = function (delta, totalLen) {
        if (totalLen <= 0) return;
        flashcardIndex = (flashcardIndex + delta + totalLen) % totalLen;
        isFlashcardFlipped = false;
        renderVocabSection();
    };

    // Đọc từ hoặc câu ví dụ trực tiếp theo ID (Không bao giờ bị lỗi với dấu nháy đơn ' như one's, I'm, don't)
    window.speakVocabById = function (vocabId, field, btnEl, rate = 0.9) {
        const item = getVocabBank().find(v => v.id === vocabId);
        if (!item) return;
        const textToSpeak = field === 'example' ? (item.exampleEn || '') : (item.en || '');
        if (textToSpeak && typeof speakText === 'function') {
            speakText(textToSpeak, btnEl, rate);
        }
    };

    function renderVocabSection() {
        const container = document.getElementById('notebook-vocab-section');
        if (!container) return;

        const allVocab = getVocabBank();
        const dueCount = allVocab.filter(v => isVocabDueForReview(v)).length;
        const learningCount = allVocab.filter(v => !v.mastered || isVocabDueForReview(v)).length;
        const masteredCount = allVocab.filter(v => v.mastered && !isVocabDueForReview(v)).length;

        const filtered = allVocab.filter(v => {
            if (vocabFilterMode === 'learning') return !v.mastered || isVocabDueForReview(v);
            if (vocabFilterMode === 'due') return isVocabDueForReview(v);
            if (vocabFilterMode === 'mastered') return v.mastered && !isVocabDueForReview(v);
            return true;
        });

        if (allVocab.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3">
                    <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-2xl">
                        <i class="fa-solid fa-spell-check"></i>
                    </div>
                    <h3 class="font-extrabold text-slate-800 text-lg">Kho từ vựng của bạn đang trống</h3>
                    <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Khi đang luyện dịch câu, bạn hãy mở <strong>Gợi ý 1 (Từ vựng)</strong> và bấm nút <strong>"+ Lưu từ"</strong> bên cạnh bất kỳ cụm từ nào bạn muốn ghi nhớ nhé!
                    </p>
                </div>
            `;
            return;
        }

        const dueBtnHTML = dueCount > 0 ? `
            <button type="button" onclick="setVocabFilterMode('due')" class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${vocabFilterMode === 'due' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'}">
                ⏰ Cần ôn lại (${dueCount})
            </button>
        ` : '';

        const filterBarHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200/80">
                <div class="flex flex-wrap items-center gap-1.5">
                    <button type="button" onclick="setVocabFilterMode('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${vocabFilterMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        Tất cả (${allVocab.length})
                    </button>
                    <button type="button" onclick="setVocabFilterMode('learning')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${vocabFilterMode === 'learning' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
                        Đang học (${learningCount})
                    </button>
                    ${dueBtnHTML}
                    <button type="button" onclick="setVocabFilterMode('mastered')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${vocabFilterMode === 'mastered' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}">
                        Đã thuộc (${masteredCount})
                    </button>
                </div>
                <span class="text-[11px] text-slate-400 font-medium hidden sm:inline">Bấm ✏️ để sửa IPA/hình ảnh • Bấm ✓ Thuộc để tích lũy 6 mốc Vĩnh viễn</span>
            </div>
        `;

        if (filtered.length === 0) {
            container.innerHTML = filterBarHTML + `
                <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs sm:text-sm text-slate-500">
                    Không có từ vựng nào ở mục này.
                </div>
            `;
            return;
        }

        // CHẾ ĐỘ FLASHCARD LẬT THẺ
        if (isFlashcardMode) {
            const idx = Math.min(flashcardIndex, filtered.length - 1);
            const item = filtered[idx];
            const visualIcon = item.emoji || suggestVisualEmoji(item.en, item.vi);

            container.innerHTML = filterBarHTML + `
                <div class="bg-white rounded-3xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-400">
                        <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">${item.topic || 'Từ vựng'} • ${item.level || 'A2'}</span>
                        <span>Thẻ ${idx + 1} / ${filtered.length}</span>
                    </div>

                    <div onclick="flipCurrentFlashcard()" class="cursor-pointer min-h-[210px] rounded-2xl border-2 border-dashed ${isFlashcardFlipped ? 'border-emerald-300 bg-emerald-50/40' : 'border-indigo-200 bg-slate-50/70'} p-6 flex flex-col items-center justify-center gap-2 transition-all select-none">
                        ${!isFlashcardFlipped ? `
                            <div class="text-3xl mb-1">${visualIcon}</div>
                            <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Mặt trước (Tiếng Anh) — Chạm để lật xem nghĩa</span>
                            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">${item.en}</h3>
                            <p class="font-mono text-xs sm:text-sm text-indigo-600">${item.ipa || ''}</p>
                        ` : `
                            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.en}" class="w-20 h-20 object-cover rounded-2xl border border-emerald-200 shadow-2xs mb-1" onerror="this.style.display='none'">` : `<div class="text-3xl mb-1">${visualIcon}</div>`}
                            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Mặt sau (Nghĩa & Ngữ cảnh thực tế)</span>
                            <h3 class="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">${item.vi}</h3>
                            <p class="text-sm font-bold text-indigo-700">${item.en} <span class="font-mono text-xs font-normal text-slate-500">${item.ipa || ''}</span></p>
                            ${item.exampleEn ? `
                                <div class="mt-2 pt-2 border-t border-emerald-200/80 text-xs text-slate-600 max-w-md">
                                    <p class="font-semibold text-slate-800 italic">"${item.exampleEn}"</p>
                                    <p class="text-[11px] text-slate-500 mt-0.5">${item.exampleVi || ''}</p>
                                </div>
                            ` : ''}
                        `}
                    </div>

                    <div class="flex items-center justify-between gap-2 pt-1">
                        <button type="button" onclick="stepFlashcard(-1, ${filtered.length})" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                            <i class="fa-solid fa-chevron-left mr-1"></i>Trước
                        </button>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="speakVocabById('${item.id}', 'en', this, 0.9)" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs">
                                <i class="fa-solid fa-volume-high mr-1"></i>Nghe phát âm
                            </button>
                            <button type="button" onclick="toggleVocabMastered('${item.id}')" class="px-3.5 py-2.5 rounded-xl border text-xs font-extrabold ${item.mastered && !isVocabDueForReview(item) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'}">
                                <i class="fa-solid fa-check mr-1"></i>${item.foreverMastered ? '🏆 Đã thuộc vĩnh viễn' : (item.mastered && !isVocabDueForReview(item) ? `Đã thuộc (Ôn sau ${getDaysUntilReview(item)} ngày)` : 'Đánh dấu thuộc')}
                            </button>
                        </div>
                        <button type="button" onclick="stepFlashcard(1, ${filtered.length})" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                            Tiếp<i class="fa-solid fa-chevron-right ml-1"></i>
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // CHẾ ĐỘ DANH SÁCH THẺ TỪ VỰNG
        const cardsGridHTML = filtered.map(item => {
            const isDue = isVocabDueForReview(item);
            const daysLeft = getDaysUntilReview(item);
            const visualIcon = item.emoji || suggestVisualEmoji(item.en, item.vi);

            let reviewStatusBadge = '';
            if (item.foreverMastered || (item.reviewStage >= 6 && item.mastered)) {
                reviewStatusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs" title="Bạn đã hoàn thành đủ 6 chu kỳ ôn tập ngắt quãng!">🏆 Đã thuộc vĩnh viễn</span>`;
            } else if (isDue) {
                reviewStatusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">⏰ Đến hạn ôn (Mốc ${item.reviewStage || 1}/6)</span>`;
            } else if (item.mastered && item.nextReviewDue) {
                reviewStatusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Chu kỳ ${item.reviewStage || 1}/6: Hệ thống sẽ nhắc ôn lại sau ${daysLeft} ngày nữa">⏳ Ôn sau ${daysLeft} ngày (Mốc ${item.reviewStage || 1}/6)</span>`;
            }

            const visualBoxHTML = item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.en}" class="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0" onerror="this.style.display='none'">`
                : `<div class="w-11 h-11 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-xl shrink-0" title="Biểu tượng gợi nhớ">${visualIcon}</div>`;

            return `
                <div class="bg-white p-4 sm:p-5 rounded-2xl border ${isDue ? 'border-rose-300 bg-rose-50/10' : item.mastered ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200/90'} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
                    <div class="space-y-2.5">
                        <div class="flex items-start justify-between gap-2.5">
                            <div class="flex items-start gap-3 min-w-0">
                                ${visualBoxHTML}
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700">${item.level || 'A2'}</span>
                                        <span class="text-[11px] font-semibold text-slate-400 truncate">${item.topic || 'Từ vựng'}</span>
                                        ${reviewStatusBadge}
                                    </div>
                                    <h3 class="text-base sm:text-lg font-extrabold text-indigo-950 mt-1 flex items-center gap-2 flex-wrap">
                                        <span>${item.en}</span>
                                        <span onclick="openQuickAddVocabModal('${item.id}')" class="cursor-pointer font-mono text-xs font-normal text-indigo-600 hover:underline" title="Bấm để sửa phiên âm IPA">${item.ipa || ''}</span>
                                    </h3>
                                    <p class="text-sm font-bold text-emerald-700 mt-0.5">${item.vi}</p>
                                </div>
                            </div>

                            <div class="flex items-center gap-1 shrink-0">
                                <button type="button" onclick="speakVocabById('${item.id}', 'en', this, 0.9)" class="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all" title="Nghe phát âm chuẩn">
                                    <i class="fa-solid fa-volume-high text-xs"></i>
                                </button>
                                <button type="button" onclick="openQuickAddVocabModal('${item.id}')" class="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all" title="Sửa phiên âm IPA, nghĩa hoặc hình ảnh">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button type="button" onclick="toggleVocabMastered('${item.id}')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${item.mastered && !isDue ? 'bg-emerald-600 text-white border-emerald-600' : isDue ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'}" title="Đánh dấu thuộc & tích lũy 6 mốc Vĩnh viễn">
                                    <i class="fa-solid fa-check mr-0.5"></i>${isDue ? 'Ôn xong' : item.mastered ? 'Đã thuộc' : 'Thuộc'}
                                </button>
                                <button type="button" onclick="deleteVocabItem('${item.id}')" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all" title="Xóa từ này">
                                    <i class="fa-regular fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>

                        ${item.exampleEn ? `
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-0.5 flex items-center justify-between gap-2">
                                <div class="min-w-0">
                                    <p class="font-semibold text-slate-800 truncate">"${item.exampleEn}"</p>
                                    <p class="text-[11px] text-slate-500 truncate">${item.exampleVi || ''}</p>
                                </div>
                                <button type="button" onclick="speakVocabById('${item.id}', 'example', this, 0.92)" class="w-7 h-7 rounded-full bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0" title="Nghe cả câu ví dụ">
                                    <i class="fa-solid fa-volume-low text-[11px]"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = filterBarHTML + `<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">${cardsGridHTML}</div>`;
    }

    let ipaLookupTimer = null;
    window.autoPreviewModalIPA = function (enValue, forceViLookup = false) {
        const ipaInput = document.getElementById('custom-vocab-ipa');
        const viInput = document.getElementById('custom-vocab-vi');
        const emojiInput = document.getElementById('custom-vocab-emoji');
        if (!ipaInput) return;
        const clean = (enValue || '').trim();
        if (!clean) {
            ipaInput.value = '';
            return;
        }
        ipaInput.value = getPhraseIPA(clean);

        // Điền ngay nghĩa Offline từ CORE_VI_DICT nếu ô nghĩa đang trống hoặc được phép tự điền
        const canAutoFillVi = forceViLookup || (viInput && (!viInput.value.trim() || viInput.dataset.autoFilled === '1'));
        const offlineVi = lookupOfflineVietnameseMeaning(clean);
        if (canAutoFillVi && viInput && offlineVi) {
            viInput.value = offlineVi;
            viInput.dataset.autoFilled = '1';
            if (emojiInput) emojiInput.value = suggestVisualEmoji(clean, offlineVi);
        }

        clearTimeout(ipaLookupTimer);
        ipaLookupTimer = setTimeout(async () => {
            // 1. Lấy IPA chuẩn từ Từ điển Quốc tế
            const accurateIpa = await fetchAccurateIPAFromDictionaryAPI(clean);
            if (accurateIpa && document.getElementById('custom-vocab-ipa')) {
                document.getElementById('custom-vocab-ipa').value = accurateIpa;
            }

            // 2. Nếu chưa có nghĩa trong CORE_VI_DICT, gọi API dịch tự động Anh - Việt
            const currentViEl = document.getElementById('custom-vocab-vi');
            if (currentViEl && (!currentViEl.value.trim() || currentViEl.dataset.autoFilled === '1')) {
                const apiVi = await fetchVietnameseMeaningAPI(clean);
                if (apiVi && document.getElementById('custom-vocab-vi')) {
                    const targetVi = document.getElementById('custom-vocab-vi');
                    if (!targetVi.value.trim() || targetVi.dataset.autoFilled === '1') {
                        targetVi.value = apiVi;
                        targetVi.dataset.autoFilled = '1';
                        const targetEmoji = document.getElementById('custom-vocab-emoji');
                        if (targetEmoji) targetEmoji.value = suggestVisualEmoji(clean, apiVi);
                    }
                }
            }
        }, 300);
    };

    window.openQuickAddVocabModal = function (editId = null) {
        const list = getVocabBank();
        const editingItem = editId ? list.find(i => i.id === editId) : null;

        let modal = document.getElementById('quick-add-vocab-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quick-add-vocab-modal';
            modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4';
            document.body.appendChild(modal);
        }

        const titleText = editingItem ? `Chỉnh sửa từ: "${editingItem.en}"` : "Thêm Từ / Cụm từ mới";
        const enVal = editingItem ? (editingItem.en || '').replace(/"/g, '&quot;') : '';
        const ipaVal = editingItem ? (editingItem.ipa || '').replace(/"/g, '&quot;') : '';
        const viVal = editingItem ? (editingItem.vi || '').replace(/"/g, '&quot;') : '';
        const exVal = editingItem ? (editingItem.exampleEn || '').replace(/"/g, '&quot;') : '';
        const emojiVal = editingItem ? (editingItem.emoji || suggestVisualEmoji(editingItem.en, editingItem.vi)) : '';
        const imgVal = editingItem ? (editingItem.imageUrl || '').replace(/"/g, '&quot;') : '';
        const levelVal = editingItem ? (editingItem.level || 'B1') : 'A2';

        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
                <div class="bg-indigo-600 px-6 py-4 text-white flex items-center justify-between">
                    <h3 class="font-extrabold text-base flex items-center gap-2">
                        <i class="fa-solid ${editingItem ? 'fa-pen-to-square' : 'fa-spell-check'}"></i> ${titleText}
                    </h3>
                    <button type="button" onclick="document.getElementById('quick-add-vocab-modal').remove()" class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <form onsubmit="handleQuickAddVocabSubmit(event)" class="p-6 space-y-3.5">
                    <input type="hidden" id="custom-vocab-edit-id" value="${editingItem ? editingItem.id : ''}">
                    
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div class="sm:col-span-7">
                            <label class="block text-xs font-bold text-slate-700 mb-1">Từ / Cụm từ Tiếng Anh *</label>
                            <input id="custom-vocab-en" type="text" required value="${enVal}" oninput="autoPreviewModalIPA(this.value)" placeholder="VD: obligation" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="sm:col-span-5">
                            <label class="block text-xs font-bold text-indigo-700 mb-1">Phiên âm IPA (Tự động/Sửa)</label>
                            <input id="custom-vocab-ipa" type="text" value="${ipaVal}" placeholder="/ˌɑːblɪˈɡeɪʃən/" class="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/40 font-mono text-xs sm:text-sm text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Nghĩa Tiếng Việt *</label>
                        <input id="custom-vocab-vi" type="text" required value="${viVal}" placeholder="VD: nghĩa vụ, bổn phận" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div class="sm:col-span-3">
                            <label class="block text-xs font-bold text-slate-600 mb-1">Trình độ</label>
                            <select id="custom-vocab-level" class="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-indigo-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="A1" ${levelVal === 'A1' ? 'selected' : ''}>A1</option>
                                <option value="A2" ${levelVal === 'A2' ? 'selected' : ''}>A2</option>
                                <option value="B1" ${levelVal === 'B1' ? 'selected' : ''}>B1</option>
                                <option value="B2" ${levelVal === 'B2' ? 'selected' : ''}>B2</option>
                                <option value="C1" ${levelVal === 'C1' ? 'selected' : ''}>C1</option>
                                <option value="C2" ${levelVal === 'C2' ? 'selected' : ''}>C2</option>
                            </select>
                        </div>
                        <div class="sm:col-span-3">
                            <label class="block text-xs font-bold text-slate-600 mb-1">Icon gợi nhớ</label>
                            <input id="custom-vocab-emoji" type="text" value="${emojiVal}" placeholder="👩‍👧, 💡" class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="sm:col-span-6">
                            <label class="block text-xs font-bold text-slate-600 mb-1">Link ảnh (Tùy chọn)</label>
                            <input id="custom-vocab-img" type="url" value="${imgVal}" placeholder="https://..." class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-1">Câu ví dụ tiếng Anh (Tùy chọn)</label>
                        <input id="custom-vocab-ex" type="text" value="${exVal}" placeholder="VD: One has an obligation to one's friends." class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-2">
                        <button type="button" onclick="document.getElementById('quick-add-vocab-modal').remove()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100">Hủy</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                            ${editingItem ? 'Lưu thay đổi' : 'Lưu vào Sổ tay'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    };

    window.handleQuickAddVocabSubmit = function (e) {
        e.preventDefault();
        const editId = document.getElementById('custom-vocab-edit-id')?.value || '';
        const en = document.getElementById('custom-vocab-en').value.trim();
        const rawIpa = document.getElementById('custom-vocab-ipa')?.value.trim() || '';
        const vi = document.getElementById('custom-vocab-vi').value.trim();
        const level = document.getElementById('custom-vocab-level')?.value || 'A2';
        const emoji = document.getElementById('custom-vocab-emoji')?.value.trim() || suggestVisualEmoji(en, vi);
        const imageUrl = document.getElementById('custom-vocab-img')?.value.trim() || '';
        const ex = document.getElementById('custom-vocab-ex').value.trim();
        const formEl = document.querySelector('#quick-add-vocab-modal form');
        const exVi = (formEl && formEl.dataset.exampleVi) ? formEl.dataset.exampleVi : '';
        if (!en || !vi) return;

        let formattedIpa = rawIpa || getPhraseIPA(en);
        if (formattedIpa && !formattedIpa.startsWith('/')) formattedIpa = '/' + formattedIpa;
        if (formattedIpa && !formattedIpa.endsWith('/')) formattedIpa = formattedIpa + '/';

        saveLearnedViMeaningCache(en, vi);
        const list = getVocabBank();
        if (editId) {
            const idx = list.findIndex(i => i.id === editId);
            if (idx !== -1) {
                list[idx] = {
                    ...list[idx],
                    en,
                    vi,
                    level,
                    ipa: formattedIpa,
                    emoji,
                    imageUrl,
                    exampleEn: ex
                };
            }
            saveVocabBank(list);
            document.getElementById('quick-add-vocab-modal')?.remove();
            renderVocabSection();
            if (typeof showToast === 'function') showToast(`Đã cập nhật từ "${en}"!`, "success");
        } else {
            const newId = 'voc_' + Date.now();
            list.unshift({
                id: newId,
                en,
                vi,
                ipa: formattedIpa,
                emoji,
                imageUrl,
                level: level,
                topic: 'Tự ghi chép',
                exampleEn: ex,
                exampleVi: exVi,
                mastered: false,
                foreverMastered: false,
                reviewStage: 0,
                nextReviewDue: null,
                addedAt: new Date().toISOString()
            });
            saveVocabBank(list);
            if (!rawIpa) autoRefineSavedVocabIPA(newId, en);
            document.getElementById('quick-add-vocab-modal')?.remove();
            renderVocabSection();
            if (typeof addXP === 'function') addXP(2);
            if (typeof showToast === 'function') showToast(`✨ Đã thêm "${en}" vào Kho từ vựng (+2 XP)!`, "success");

            // Làm mới trạng thái viền xanh lá cho Ô từ ở "Câu trả lời chuẩn"
            const resultPanel = document.getElementById('result-panel');
            if (resultPanel) {
                resultPanel.querySelectorAll('[data-vocab-clean-word]').forEach(cardBox => {
                    if (cardBox.dataset.vocabCleanWord === en.toLowerCase()) {
                        cardBox.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50/40');
                    }
                });
            }
        }
    };

    window.renderNotebook = safeRenderSentenceNotebook;

    window.switchTab = function (tab) {
        const viewHome = document.getElementById('view-home');
        const viewPractice = document.getElementById('view-practice');
        const viewNotebook = document.getElementById('view-notebook');

        if (viewHome) viewHome.classList.add('hidden');
        if (viewPractice) viewPractice.classList.add('hidden');
        if (viewNotebook) viewNotebook.classList.add('hidden');

        if (tab === 'home') {
            if (viewHome) viewHome.classList.remove('hidden');
            if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
        } else if (tab === 'notebook') {
            if (viewNotebook) viewNotebook.classList.remove('hidden');
            injectVocabSubTabsIntoNotebook();
            const targetSub = getVocabBank().length > 0 ? 'vocab' : currentNotebookSubTab;
            switchNotebookSubTab(targetSub);
        } else {
            if (viewPractice) viewPractice.classList.remove('hidden');
        }
    };

    // ==================== TÍNH NĂNG V6: CHẠM VÀO CẢ Ô TỪ TRONG "CÂU TRẢ LỜI CHUẨN" LẪN "CÁCH DIỄN ĐẠT KHÁC" ====================

    // Khi người học bấm vào 1 từ trên câu Đáp án chuẩn hoặc Cách diễn đạt khác -> Mở ngay Modal Lưu từ đã điền sẵn Từ + Nghĩa chuẩn + IPA + Câu ví dụ gốc
    window.onSampleWordClick = function (encodedWord, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        const rawWord = decodeURIComponent(encodedWord || '').trim();
        const cleanWord = rawWord.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
        if (!cleanWord) return;

        const list = getVocabBank();
        const existing = list.find(item => (item.en || '').toLowerCase() === cleanWord.toLowerCase());
        if (existing) {
            if (typeof showToast === 'function') {
                showToast(`Từ "${cleanWord}" đã có trong Sổ tay! Bạn có thể xem hoặc chỉnh sửa tại đây.`, 'info');
            }
            window.openQuickAddVocabModal(existing.id);
            return;
        }

        const currentQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
        const exampleEn = currentQ ? (currentQ.sampleCasual || '') : '';
        const exampleVi = currentQ ? (currentQ.vi || '') : '';
        const level = currentQ && typeof normalizeCEFRLevel === 'function' ? normalizeCEFRLevel(currentQ.level) : 'A2';
        const exactVi = lookupOfflineVietnameseMeaning(cleanWord);

        window.openQuickAddVocabModal(null);

        const enInput = document.getElementById('custom-vocab-en');
        const ipaInput = document.getElementById('custom-vocab-ipa');
        const viInput = document.getElementById('custom-vocab-vi');
        const exInput = document.getElementById('custom-vocab-ex');
        const levelSelect = document.getElementById('custom-vocab-level');
        const emojiInput = document.getElementById('custom-vocab-emoji');

        const formEl = document.querySelector('#quick-add-vocab-modal form');
        if (formEl) {
            formEl.dataset.exampleVi = exampleVi;
        }

        if (enInput) enInput.value = cleanWord;
        if (ipaInput) ipaInput.value = getPhraseIPA(cleanWord);
        if (viInput) {
            viInput.value = exactVi || 'Đang tra nghĩa chuẩn...';
            viInput.dataset.autoFilled = '1';
            // Nếu người dùng tự gõ sửa tay vào ô nghĩa thì tắt cờ autoFilled để không bị API ghi đè
            viInput.addEventListener('input', function () {
                this.dataset.autoFilled = '0';
            }, { once: true });
        }
        if (exInput) exInput.value = exampleEn;
        if (levelSelect) levelSelect.value = level;
        if (emojiInput) emojiInput.value = suggestVisualEmoji(cleanWord, exactVi);

        // Nếu chưa có nghĩa trong CORE_VI_DICT thì gọi API lấy nghĩa chuẩn ngay lập tức
        if (!exactVi) {
            fetchVietnameseMeaningAPI(cleanWord).then(apiVi => {
                const targetVi = document.getElementById('custom-vocab-vi');
                if (targetVi && targetVi.dataset.autoFilled === '1') {
                    targetVi.value = apiVi || '';
                    if (!apiVi) targetVi.focus();
                    const targetEmoji = document.getElementById('custom-vocab-emoji');
                    if (targetEmoji && apiVi) targetEmoji.value = suggestVisualEmoji(cleanWord, apiVi);
                }
            });
        }

        window.autoPreviewModalIPA(cleanWord, true);
    };

    // 1. Gắn sự kiện lưu từ trực tiếp vào các Ô TỪ + IPA trong khung "Câu trả lời chuẩn & Luyện phát âm"
    function enhanceStandardAnswerWordCards(resultPanel, savedWordsSet) {
        if (!resultPanel) return;

        // Tìm tất cả các ô thẻ từ có chứa chữ tiếng Anh ở dòng trên và phiên âm /.../ ở dòng dưới
        const allSpans = resultPanel.querySelectorAll('span, div');
        let firstWordCardContainer = null;

        allSpans.forEach(el => {
            // Kiểm tra xem thẻ này có phải là dòng phiên âm /.../ nằm trong 1 ô từ không
            const text = (el.textContent || '').trim();
            if (text.length >= 2 && text.startsWith('/') && text.endsWith('/') && el.previousElementSibling) {
                const wordEl = el.previousElementSibling;
                const cardBox = el.parentElement;
                if (!cardBox || cardBox.dataset.vocabCardBound === '1') return;

                const rawWordText = (wordEl.textContent || '').trim();
                const cleanWord = rawWordText.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
                if (!cleanWord) return;

                cardBox.dataset.vocabCardBound = '1';
                cardBox.dataset.vocabCleanWord = cleanWord.toLowerCase();
                if (!firstWordCardContainer && cardBox.parentElement) {
                    firstWordCardContainer = cardBox.parentElement;
                }

                const encoded = encodeURIComponent(cleanWord);
                const isSaved = savedWordsSet.has(cleanWord.toLowerCase());

                // Cho phép bấm trực tiếp vào ô từ (Vừa phát âm vừa mở bảng lưu từ, hoặc thêm nút + nhỏ góc trên ô)
                cardBox.classList.add('relative', 'group', 'cursor-pointer', 'transition-all');
                if (isSaved) {
                    cardBox.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50/40');
                } else {
                    cardBox.classList.add('hover:border-indigo-400', 'hover:shadow-sm');
                }
                cardBox.title = `Chạm để lưu nhanh từ '${cleanWord}' vào Sổ tay (+2 XP)`;

                // Gắn sự kiện click vào cả ô từ để mở bảng Lưu từ (kèm đọc phát âm nhẹ)
                cardBox.addEventListener('click', function (ev) {
                    if (typeof speakText === 'function') {
                        speakText(cleanWord);
                    }
                    window.onSampleWordClick(encoded, ev);
                });
            }
        });

        // Thêm dòng chỉ dẫn ngay bên dưới khung "Câu trả lời chuẩn & Luyện phát âm"
        if (firstWordCardContainer && !document.getElementById('standard-box-word-tip')) {
            const tipEl = document.createElement('div');
            tipEl.id = 'standard-box-word-tip';
            tipEl.className = 'mt-2.5 pt-2 border-t border-indigo-100/80 flex items-center justify-between gap-2 text-[11px] font-bold text-indigo-600';
            tipEl.innerHTML = `
                <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-hand-pointer text-[10px]"></i>
                    <span>Mẹo: Chạm trực tiếp vào bất kỳ <strong>ô từ vựng</strong> nào ở trên để nghe phát âm & lưu nhanh vào Sổ tay (+2 XP)</span>
                </span>
            `;
            firstWordCardContainer.insertAdjacentElement('afterend', tipEl);
        }
    }

    function enhanceSampleCasualWithClickableWords() {
        const resultPanel = document.getElementById('result-panel');
        if (!resultPanel || resultPanel.classList.contains('hidden')) return;

        const vocabList = getVocabBank();
        const savedWordsSet = new Set(vocabList.map(v => (v.en || '').trim().toLowerCase()));

        // Chỉ gắn sự kiện chạm lưu từ vào các Ô TỪ + IPA trong khung "Câu trả lời chuẩn & Luyện phát âm"
        enhanceStandardAnswerWordCards(resultPanel, savedWordsSet);
    }

    let isEnhancingHints = false;
    function safeTriggerEnhanceHints() {
        if (isEnhancingHints) return;
        const hintsList = document.getElementById('hints-list');
        if (!hintsList) return;
        if (!hintsList.innerHTML.includes('saveHintByIndex') && !hintsList.innerHTML.includes('Đã lưu')) {
            isEnhancingHints = true;
            enhanceHintsListWithSaveButtons();
            setTimeout(() => { isEnhancingHints = false; }, 30);
        }
    }

    function initVocabModuleHooks() {
        const viewNotebook = document.getElementById('view-notebook');
        const mainEl = document.querySelector('main');
        if (viewNotebook && mainEl && viewNotebook.parentElement !== mainEl) {
            mainEl.appendChild(viewNotebook);
        }

        injectVocabSubTabsIntoNotebook();
        safeTriggerEnhanceHints();
        updateCombinedNotebookBadge();

        const hintsListEl = document.getElementById('hints-list');
        if (hintsListEl) {
            const observer = new MutationObserver(() => safeTriggerEnhanceHints());
            observer.observe(hintsListEl, { childList: true });
        }

        const resultPanelEl = document.getElementById('result-panel');
        if (resultPanelEl) {
            const resObserver = new MutationObserver(() => {
                if (!resultPanelEl.classList.contains('hidden')) {
                    setTimeout(enhanceSampleCasualWithClickableWords, 60);
                }
            });
            resObserver.observe(resultPanelEl, { attributes: true, childList: true });
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const txt = (btn.innerText || '').toLowerCase();
            if (txt.includes('kiểm tra') || txt.includes('xem đáp án') || txt.includes('đáp án')) {
                setTimeout(enhanceSampleCasualWithClickableWords, 120);
            }
        });

        // Bắt thêm phím tắt Enter (Kiểm tra) và F4 (Xem đáp án)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'F4') {
                setTimeout(enhanceSampleCasualWithClickableWords, 150);
            }
        });

        if (typeof window.updateNotebookBadge === 'function') {
            const origBadge = window.updateNotebookBadge;
            window.updateNotebookBadge = function () {
                origBadge.apply(this, arguments);
                updateCombinedNotebookBadge();
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVocabModuleHooks);
    } else {
        initVocabModuleHooks();
    }
})();

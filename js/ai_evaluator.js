/**
 * MODULE 2: TRÍ TUỆ NHÂN TẠO, CHẤM ĐIỂM & PHÁT ÂM (js/ai_evaluator.js)
 * Phụ trách: Gợi ý sư phạm 3 mức, Phiên âm quốc tế IPA, Chấm điểm dịch câu (Gemini API + Smart Local Evaluator),
 *            Tạo câu hỏi biến thể AI, Đọc giọng bản xứ (Web Speech API) và Thu âm chấm điểm phát âm từng từ.
 */

        // Hàm tự động sinh dữ liệu Gợi ý Mức 2 (Ngữ pháp), Mức 3 (Cách tạo câu) & Các cách nói tương tự
        function buildRichPedagogyData(question) {
            // 1. Mức 2: Gợi ý ngữ pháp
            let grammarHint = question.grammarHint || "";
            if (!grammarHint) {
                if (question.isStructureMode && question.structureInfo) {
                    const st = question.structureInfo;
                    const ctx = (question.context || "").toLowerCase();
                    let tenseNote = "Chú ý chia thì của động từ chính phù hợp với ngữ cảnh thời gian trong câu.";
                    if (ctx.includes("quá khứ") || question.vi.toLowerCase().includes("hôm qua") || question.vi.toLowerCase().includes("trước đây")) {
                        tenseNote = "Ngữ cảnh xảy ra trong quá khứ nên cần chia động từ ở thì Quá khứ (V-ed/V2 hoặc had + V3 đối với câu ước quá khứ).";
                    } else if (ctx.includes("tương lai") || question.vi.toLowerCase().includes("sẽ")) {
                        tenseNote = "Ngữ cảnh hướng tới tương lai nên ưu tiên dùng 'will' hoặc động từ khuyết thiếu phù hợp.";
                    } else if (ctx.includes("câu hỏi") || question.vi.includes("?")) {
                        tenseNote = "Đây là câu nghi vấn/lịch sự, hãy chú ý đảo trợ động từ lên trước chủ ngữ.";
                    }
                    grammarHint = `Áp dụng công thức <strong>${st.formula}</strong>. ${tenseNote}`;
                } else {
                    const isQuestion = question.vi.includes("?");
                    grammarHint = isQuestion
                        ? "Đây là câu hỏi giao tiếp thực tế: Hãy bắt đầu bằng trợ động từ (Do/Have/Can/Could/Would...) + Chủ ngữ + Động từ nguyên mẫu."
                        : "Xác định rõ mệnh đề chính (Chủ ngữ + Động từ chia theo thì) và liên từ nối hai vế câu (so, because, to, when...) sao cho tự nhiên.";
                }
            }

            // 2. Mức 3: Gợi ý cách tạo câu (Khung lắp ghép câu)
            let constructionHint = question.constructionHint || "";
            if (!constructionHint) {
                const words = question.sampleCasual.split(' ');
                const masked = words.map((w, idx) => {
                    // Giữ lại các từ đầu câu, từ nối và cấu trúc chính, ẩn bớt từ ở giữa để người học tự ghép
                    if (idx < 2 || idx === words.length - 1 || w.length <= 3 || idx % 2 === 0) return w;
                    return '<span class="text-indigo-500 font-mono">___</span>';
                }).join(' ');

                const hintSteps = (question.hints || []).map((h, i) => `<span class="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md text-xs font-semibold mr-1 mb-1">Bước ${i + 1}: ${h.en}</span>`).join(' <i class="fa-solid fa-arrow-right text-[10px] text-purple-400 mr-1"></i> ');

                constructionHint = `
                    <div class="mb-2">${hintSteps}</div>
                    <div class="text-xs text-slate-500 mb-1">Khung câu gợi ý (điền vào chỗ trống):</div>
                    <div class="font-semibold text-slate-900">${masked}</div>
                `;
            }

            // 3. Các cách nói khác tương tự (Alternatives)
            let alternatives = question.alternatives || [];
            if (!alternatives || alternatives.length === 0) {
                alternatives = generateAlternativeExpressions(question);
            }

            return { grammarHint, constructionHint, alternatives };
        }

        function toGerundPhrase(verb) {
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

        function buildCleanStructuralVariation(question) {
            const casual = (question.sampleCasual || "").trim();
            const formal = (question.sampleFormal || "").trim();
            const sid = (question.isStructureMode && question.structureInfo) ? question.structureInfo.id : "";

            // 1. Cấu trúc #1 (It takes/took + O + time + to V -> S + spend/spent + time + V-ing)
            if (sid === "struct_1" || /^it\s+(usually\s+)?(takes|took|will take|'ll take)/i.test(casual)) {
                let m = casual.match(/^It\s+(?:usually\s+)?takes\s+me\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spend + time + V-ing)", en: `I usually spend ${m[1]} ${toGerundPhrase(m[2])}${m[3]}` };
                m = casual.match(/^It\s+took\s+me\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spent + time + V-ing)", en: `I spent ${m[1]} ${toGerundPhrase(m[2])}${m[3]}` };
                m = casual.match(/^It\s+took\s+our\s+team\s+(.*?)\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (Spent + time + V-ing)", en: `Our team spent ${m[1]} ${toGerundPhrase(m[2])}${m[3]}` };
                m = casual.match(/^How\s+long\s+did\s+it\s+take\s+you\s+to\s+(\w+)\b(.*)$/i);
                if (m) return { label: "Cấu trúc tương đương (How much time did you spend...)", en: `How much time did you spend ${toGerundPhrase(m[1])}${m[2]}` };
            }

            // 2. Cấu trúc #2 (Would you mind -> Do you mind / Is it okay if I / Could you please)
            if (sid === "struct_2" || /would you (guys )?mind/i.test(casual)) {
                if (/would you (?:guys )?mind if i/i.test(casual)) {
                    const alt = casual.replace(/Would you (?:guys )?mind if I (\w+)/i, "Is it okay with you if I $1");
                    return { label: "Giao tiếp thân mật (Is it okay if I...)", en: alt };
                }
                const alt = casual.replace(/Would you mind/i, "Do you mind");
                if (alt !== casual) return { label: "Giao tiếp thân mật (Do you mind + V-ing)", en: alt };
            }

            // 3. Cấu trúc #3 (Not only... but also -> Both... and / ...as well as...)
            if (sid === "struct_3" || /not only/i.test(casual)) {
                const alt = casual
                    .replace(/not only/i, "both")
                    .replace(/,\s*but\s+(?:she's|he's|it's|she|he|it|they)\s+also/i, " and")
                    .replace(/\s+but\s+also\s+/i, " as well as ");
                if (alt !== casual) return { label: "Biến thể tương đương (Both... and / As well as)", en: alt };
            }

            // 4. Cấu trúc #4 (Used to / Be used to -> Be accustomed to / In the past)
            if (sid === "struct_4" || /used to/i.test(casual)) {
                if (/am|is|are|m|s|re\s+(?:already\s+|totally\s+|still\s+not\s+)?used to/i.test(casual)) {
                    const alt = casual.replace(/used to/i, "accustomed to");
                    return { label: "Biến thể nâng cao (Be accustomed to)", en: alt };
                }
                const alt = casual.replace(/I used to/i, "Back then, I would often");
                if (alt !== casual) return { label: "Diễn đạt thói quen xưa (Would often + V)", en: alt };
            }

            // 5. Cấu trúc #5 (No matter how/what/where -> However / Whatever / Wherever)
            if (sid === "struct_5" || /no matter/i.test(casual)) {
                const alt = casual
                    .replace(/No matter how/i, "However")
                    .replace(/No matter what/i, "Whatever")
                    .replace(/No matter where/i, "Wherever")
                    .replace(/No matter who/i, "Whoever")
                    .replace(/No matter when/i, "Whenever");
                if (alt !== casual) return { label: "Rút gọn chuẩn bản xứ (However / Whatever / Wherever)", en: alt };
            }

            // 6. Cấu trúc #6 (I wish -> If only)
            if (sid === "struct_6" || /\bi wish\b/i.test(casual)) {
                const alt = casual.replace(/\bI wish\b/i, "If only");
                if (alt !== casual) return { label: "Nhấn mạnh cảm xúc (If only - Giá như...)", en: alt };
            }

            // 7. Cấu trúc It's high time -> It's about time
            if (/high time|about time/i.test(casual)) {
                const alt = /high time/i.test(casual)
                    ? casual.replace(/high time/i, "about time")
                    : casual.replace(/about time/i, "high time");
                return { label: "Biến thể tương đương (It's about/high time)", en: alt };
            }

            // Mặc định biến đổi nhẹ nhàng các cụm thông dụng sang cách nói tự nhiên khác (Không dùng từ đệm sáo rỗng)
            let naturalAlt = casual
                .replace(/^Can we /i, "Could we possibly ")
                .replace(/^Do you have /i, "Have you got ")
                .replace(/^I'm feeling /i, "I feel ")
                .replace(/\ba lot of\b/i, "plenty of")
                .replace(/\babout\b/i, "roughly");

            if (naturalAlt === casual && formal && formal !== casual) {
                naturalAlt = formal.replace(/approximately/i, "around").replace(/prior to/i, "before");
            }

            return {
                label: "Biến thể giao tiếp linh hoạt (Alternative)",
                en: naturalAlt
            };
        }

        function generateAlternativeExpressions(question) {
            const casual = (question.sampleCasual || "").trim();
            const formal = (question.sampleFormal || "").trim();
            const list = [];

            // Mục 1: Cách diễn đạt Trang trọng / Công việc (Formal) nếu khác câu chuẩn Casual
            if (formal && formal.toLowerCase() !== casual.toLowerCase()) {
                list.push({
                    label: "Trang trọng / Công việc (Formal)",
                    en: formal,
                    speakable: formal
                });
            }

            // Mục 2: Biến thể cấu trúc tương đương (Sạch 100%, không chứa chữ "You can also say" hay "In fact")
            const structVar = buildCleanStructuralVariation(question);
            if (structVar && structVar.en && structVar.en.toLowerCase() !== casual.toLowerCase() && structVar.en.toLowerCase() !== formal.toLowerCase()) {
                list.push({
                    label: structVar.label,
                    en: structVar.en,
                    speakable: structVar.en
                });
            }

            // Nếu câu Formal trùng câu Casual và chưa đủ 2 câu, tạo thêm 1 biến thể từ vựng sạch
            if (list.length < 2) {
                const secondAlt = (formal || casual)
                    .replace(/approximately/i, "roughly")
                    .replace(/about (\d+)/i, "around $1")
                    .replace(/every morning/i, "each morning")
                    .replace(/right now/i, "at the moment");
                if (secondAlt.toLowerCase() !== casual.toLowerCase() && !list.some(x => x.en.toLowerCase() === secondAlt.toLowerCase())) {
                    list.push({
                        label: "Diễn đạt tương đương (Natural Variation)",
                        en: secondAlt,
                        speakable: secondAlt
                    });
                }
            }

            return list;
        }

        // BỘ CHUYỂN ĐỔI PHIÊN ÂM QUỐC TẾ IPA (ENGLISH -> IPA TRANSCRIBER)
        const IPA_DICT = {
            "i": "aɪ", "i'm": "aɪm", "i've": "aɪv", "i'd": "aɪd", "i'll": "aɪl", "me": "miː", "my": "maɪ",
            "you": "juː", "you're": "jʊr", "you'll": "juːl", "you'd": "juːd", "your": "jʊr", "we": "wiː", "we've": "wiːv", "we'll": "wiːl", "our": "ˈaʊər", "us": "ʌs",
            "he": "hiː", "he's": "hiːz", "his": "hɪz", "him": "hɪm", "she": "ʃiː", "she's": "ʃiːz", "her": "hɜːr",
            "it": "ɪt", "it's": "ɪts", "it'll": "ˈɪtəl", "they": "ðeɪ", "their": "ðɛr", "them": "ðɛm",
            "is": "ɪz", "am": "æm", "are": "ɑːr", "was": "wʌz", "were": "wɜːr", "be": "biː", "been": "bɪn", "being": "ˈbiːɪŋ",
            "have": "hæv", "has": "hæz", "had": "hæd", "hadn't": "ˈhædənt", "having": "ˈhævɪŋ",
            "do": "duː", "does": "dʌz", "doesn't": "ˈdʌzənt", "did": "dɪd", "didn't": "ˈdɪdənt", "don't": "doʊnt",
            "will": "wɪl", "would": "wʊd", "wouldn't": "ˈwʊdənt", "can": "kæn", "can't": "kænt", "could": "kʊd", "should": "ʃʊd", "may": "meɪ", "might": "maɪt", "must": "mʌst",
            "the": "ðə", "a": "ə", "an": "æn", "this": "ðɪs", "that": "ðæt", "these": "ðiːz", "those": "ðoʊz",
            "to": "tuː", "of": "ʌv", "in": "ɪn", "on": "ɑːn", "at": "æt", "for": "fɔːr", "with": "wɪð", "from": "frʌm", "by": "baɪ", "about": "əˈbaʊt", "around": "əˈraʊnd", "into": "ˈɪntuː", "under": "ˈʌndər", "over": "ˈoʊvər", "after": "ˈæftər", "before": "bɪˈfɔːr", "prior": "ˈpraɪər", "during": "ˈdʊrɪŋ", "while": "waɪl", "within": "wɪˈðɪn", "up": "ʌp", "down": "daʊn", "out": "aʊt", "off": "ɔːf", "through": "θruː",
            "and": "ænd", "or": "ɔːr", "but": "bʌt", "so": "soʊ", "because": "bɪˈkɔːz", "if": "ɪf", "when": "wɛn", "where": "wɛr", "who": "huː", "what": "wʌt", "how": "haʊ", "as": "æz", "than": "ðæn", "though": "ðoʊ",
            "not": "nɑːt", "no": "noʊ", "all": "ɔːl", "any": "ˈɛni", "some": "sʌm", "many": "ˈmɛni", "much": "mʌtʃ", "more": "mɔːr", "most": "moʊst", "other": "ˈʌðər", "others": "ˈʌðərz", "such": "sʌtʃ", "only": "ˈoʊnli", "also": "ˈɔːlsoʊ", "too": "tuː", "very": "ˈvɛri", "quite": "kwaɪt", "so": "soʊ", "just": "dʒʌst", "still": "stɪl", "already": "ɔːlˈrɛdi", "always": "ˈɔːlweɪz", "usually": "ˈjuːʒuəli", "typically": "ˈtɪpɪkli", "often": "ˈɔːfən", "never": "ˈnɛvər",
            "take": "teɪk", "takes": "teɪks", "took": "tʊk", "taking": "ˈteɪkɪŋ", "spend": "spɛnd", "spends": "spɛndz", "spent": "spɛnt",
            "minute": "ˈmɪnɪt", "minutes": "ˈmɪnɪts", "hour": "ˈaʊər", "hours": "ˈaʊərz", "day": "deɪ", "days": "deɪz", "week": "wiːk", "month": "mʌnθ", "months": "mʌnθs", "year": "jɪr", "years": "jɪrz", "morning": "ˈmɔːrnɪŋ", "afternoon": "ˌæftərˈnuːn", "tonight": "təˈnaɪt", "today": "təˈdeɪ", "today's": "təˈdeɪz", "tomorrow": "təˈmɑːroʊ", "yesterday": "ˈjɛstərdeɪ", "weekend": "ˈwiːkɛnd", "daily": "ˈdeɪli", "every": "ˈɛvri", "each": "iːtʃ", "time": "taɪm", "soon": "suːn", "lately": "ˈleɪtli", "recently": "ˈriːsəntli", "now": "naʊ",
            "drive": "draɪv", "driving": "ˈdraɪvɪŋ", "walk": "wɔːk", "commute": "kəˈmjuːt", "commuting": "kəˈmjuːtɪŋ", "work": "wɜːrk", "working": "ˈwɜːrkɪŋ", "job": "dʒɑːb", "office": "ˈɔːfɪs", "home": "hoʊm", "company": "ˈkʌmpəni", "company's": "ˈkʌmpəniz", "business": "ˈbɪznəs", "startup": "ˈstɑːrtʌp", "project": "ˈprɑːdʒɛkt", "meeting": "ˈmiːtɪŋ", "meetings": "ˈmiːtɪŋz", "presentation": "ˌprɛzənˈteɪʃən", "report": "rɪˈpɔːrt", "email": "ˈiːmeɪl", "documents": "ˈdɑːkjumənts", "proposal": "prəˈpoʊzəl", "schedule": "ˈskɛdʒuːl", "target": "ˈtɑːrɡɪt", "targets": "ˈtɑːrɡɪts", "plan": "plæn", "plans": "plænz", "strategy": "ˈstrætədʒi", "workflow": "ˈwɜːrkfloʊ",
            "mind": "maɪnd", "open": "ˈoʊpən", "opening": "ˈoʊpənɪŋ", "window": "ˈwɪndoʊ", "room": "ruːm", "stuffy": "ˈstʌfi", "here": "hɪr", "there": "ðɛr", "there's": "ðɛrz", "please": "pliːz", "sorry": "ˈsɑːri", "excuse": "ɪkˈskjuːz", "apologize": "əˈpɑːlədʒaɪz",
            "sit": "sɪt", "sat": "sæt", "seat": "siːt", "empty": "ˈɛmpti", "vacant": "ˈveɪkənt", "repeat": "rɪˈpiːt", "repeating": "rɪˈpiːtɪŋ", "said": "sɛd", "slowly": "ˈsloʊli", "music": "ˈmjuːzɪk", "loud": "laʊd", "loudly": "ˈlaʊdli", "playing": "ˈpleɪɪŋ",
            "send": "sɛnd", "sending": "ˈsɛndɪŋ", "resending": "ˌriːˈsɛndɪŋ", "link": "lɪŋk", "latest": "ˈleɪtɪst", "design": "dɪˈzaɪn", "again": "əˈɡɛn", "record": "rɪˈkɔːrd", "recorded": "rɪˈkɔːrdɪd", "notes": "noʊts", "prepare": "prɪˈpɛr",
            "photo": "ˈfoʊtoʊ", "picture": "ˈpɪktʃər", "photograph": "ˈfoʊtəɡræf", "group": "ɡruːp", "front": "frʌnt", "building": "ˈbɪldɪŋ", "buildings": "ˈbɪldɪŋz", "suitcase": "ˈsuːtkeɪs", "water": "ˈwɔːtər", "grab": "ɡræb", "watch": "wɑːtʃ", "watching": "ˈwɑːtʃɪŋ", "keeping": "ˈkiːpɪŋ", "eye": "aɪ",
            "friday": "ˈfraɪdeɪ", "family": "ˈfæməli", "matter": "ˈmætər", "urgent": "ˈɜːrdʒənt", "leave": "liːv", "handle": "ˈhændəl", "review": "rɪˈvjuː", "reviewing": "rɪˈvjuːɪŋ", "looking": "ˈlʊkɪŋ", "feedback": "ˈfiːdbæk", "honest": "ˈɑːnɪst", "candid": "ˈkændɪd",
            "beautiful": "ˈbjuːtɪfəl", "pretty": "ˈprɪti", "smart": "smɑːrt", "intelligent": "ɪnˈtɛlɪdʒənt", "kind": "kaɪnd", "fluent": "ˈfluːənt", "fluently": "ˈfluːəntli", "proficient": "prəˈfɪʃənt", "english": "ˈɪŋɡlɪʃ", "japanese": "ˌdʒæpəˈniːz", "speak": "spiːk", "speaks": "spiːks", "know": "noʊ", "knows": "noʊz",
            "app": "æp", "application": "ˌæplɪˈkeɪʃən", "save": "seɪv", "saves": "seɪvz", "cost": "kɔːst", "costs": "kɔːsts", "reduces": "rɪˈduːsɪz", "cuts": "kʌts",
            "restaurant": "ˈrɛstərɑːnt", "food": "fuːd", "cuisine": "kwɪˈziːn", "delicious": "dɪˈlɪʃəs", "great": "ɡreɪt", "service": "ˈsɜːrvɪs", "awesome": "ˈɔːsəm", "customer": "ˈkʌstəmər",
            "late": "leɪt", "arrived": "əˈraɪvd", "showed": "ʃoʊd", "forgot": "fərˈɡɑːt", "bring": "brɪŋ", "exercise": "ˈɛksərsaɪz", "regular": "ˈrɛɡjələr", "regularly": "ˈrɛɡjələrli", "improves": "ɪmˈpruːvz", "physical": "ˈfɪzɪkəl", "health": "hɛlθ", "stress": "strɛs", "relieves": "rɪˈliːvz",
            "requires": "rɪˈkwaɪərz", "demands": "dɪˈmændz", "technical": "ˈtɛknɪkəl", "knowledge": "ˈnɑːlɪdʒ", "communication": "kəˌmjuːnɪˈkeɪʃən", "skills": "skɪlz", "strong": "strɔːŋ", "good": "ɡʊd",
            "finish": "ˈfɪnɪʃ", "complete": "kəmˈpliːt", "ahead": "əˈhɛd", "beat": "biːt", "exceeded": "ɪkˈsiːdɪd", "automate": "ˈɔːtəmeɪt", "tasks": "tæsks", "people": "ˈpiːpəl", "create": "kriˈeɪt", "faster": "ˈfæstər", "grow": "ɡroʊ", "expand": "ɪkˈspænd", "market": "ˈmɑːrkɪt", "share": "ʃɛr", "trust": "trʌst", "lasting": "ˈlæstɪŋ", "builds": "bɪldz",
            "used": "juːst", "use": "juːs", "accustomed": "əˈkʌstəmd", "college": "ˈkɑːlɪdʒ", "university": "ˌjuːnɪˈvɜːrsəti", "stay": "steɪ", "studying": "ˈstʌdiɪŋ", "exams": "ɪɡˈzæmz", "drink": "drɪŋk", "coffee": "ˈkɔːfi", "cups": "kʌps", "three": "θriː", "two": "tuː", "five": "faɪv", "ten": "tɛn", "thirty": "ˈθɜːrti", "30": "ˈθɜːrti", "45": "ˈfɔːrti faɪv", "10": "tɛn", "3": "θriː", "2": "tuː",
            "waking": "ˈweɪkɪŋ", "early": "ˈɜːrli", "manager": "ˈmænɪdʒər", "pressure": "ˈprɛʃər", "high": "haɪ", "moved": "muːvd", "japan": "dʒəˈpæn", "train": "treɪn", "left": "lɛft", "side": "saɪd", "road": "roʊd", "uk": "ˌjuːˈkeɪ", "worry": "ˈwɜːri", "cold": "koʊld", "weather": "ˈwɛðər", "north": "nɔːrθ", "hate": "heɪt", "dislike": "dɪsˈlaɪk", "remotely": "rɪˈmoʊtli", "productive": "prəˈdʌktɪv", "find": "faɪnd",
            "busy": "ˈbɪzi", "makes": "meɪks", "dinner": "ˈdɪnər", "happens": "ˈhæpənz", "support": "səˈpɔːrt", "decision": "dɪˈsɪʒən", "hard": "hɑːrd", "tried": "traɪd", "explain": "ɪkˈspleɪn", "understand": "ˌʌndərˈstænd", "listen": "ˈlɪsən", "travel": "ˈtrævəl", "forget": "fərˈɡɛt", "passport": "ˈpæspɔːrt", "insurance": "ɪnˈʃʊrəns",
            "difficult": "ˈdɪfɪkəlt", "tough": "tʌf", "challenge": "ˈtʃælɪndʒ", "team": "tiːm", "overcome": "ˌoʊvərˈkʌm", "together": "təˈɡɛðər", "follow": "ˈfɑːloʊ", "safety": "ˈseɪfti", "rules": "ruːlz", "regulations": "ˌrɛɡjuˈleɪʃənz", "career": "kəˈrɪr", "profession": "prəˈfɛʃən", "choose": "tʃuːz", "success": "səkˈsɛs", "key": "kiː", "expensive": "ɪkˈspɛnsɪv", "costly": "ˈkɔːstli", "determined": "dɪˈtɜːrmɪnd", "buy": "baɪ", "purchase": "ˈpɜːrtʃəs", "call": "kɔːl", "available": "əˈveɪləbəl", "line": "laɪn", "hotline": "ˈhɑːtlaɪn", "perfect": "ˈpɜːrfɪkt", "flawless": "ˈflɔːləs", "initial": "ɪˈnɪʃəl", "need": "niːd", "backup": "ˈbækʌp", "contingency": "kənˈtɪndʒənsi",
            "wish": "wɪʃ", "free": "friː", "leisure": "ˈliːʒər", "read": "riːd", "books": "bʊks", "relax": "rɪˈlæks", "unwind": "ʌnˈwaɪnd", "native": "ˈneɪtɪv", "speaker": "ˈspiːkər", "come": "kʌm", "attend": "əˈtɛnd", "birthday": "ˈbɜːrθdeɪ", "party": "ˈpɑːrti", "shift": "ʃɪft", "duty": "ˈduːti", "new": "nuː", "closer": "ˈkloʊsər", "station": "ˈsteɪʃən", "subway": "ˈsʌbweɪ", "railway": "ˈreɪlweɪ", "airport": "ˈɛrpɔːrt", "bus": "bʌs", "last": "læst", "final": "ˈfaɪnəl", "missed": "mɪst", "miss": "mɪs",
            "double-checked": "ˈdʌbəl tʃɛkt", "hitting": "ˈhɪtɪŋ", "bought": "bɔːt", "purchased": "ˈpɜːrtʃəst", "pricey": "ˈpraɪsi", "jacket": "ˈdʒækɪt", "suit": "suːt", "raining": "ˈreɪnɪŋ", "rain": "reɪn", "heavy": "ˈhɛvi", "stop": "stɑːp", "go": "ɡoʊ", "get": "ɡɛt", "got": "ɡɑːt", "coworker": "ˈkoʊwɜːrkər", "colleague": "ˈkɑːliːɡ", "interrupt": "ˌɪntəˈrʌpt", "started": "ˈstɑːrtɪd", "begun": "bɪˈɡʌn", "learning": "ˈlɜːrnɪŋ", "coding": "ˈkoʊdɪŋ", "programming": "ˈproʊɡræmɪŋ", "school": "skuːl", "back": "bæk", "one": "wʌn", "polish": "ˈpɑːlɪʃ", "refine": "rɪˈfaɪn", "product": "ˈprɑːdʌkt", "official": "əˈfɪʃəl", "launch": "lɔːntʃ",
            "fix": "fɪks", "resolve": "rɪˈzɑːlv", "computer": "kəmˈpjuːtər", "bug": "bʌɡ", "issue": "ˈɪʃuː", "issues": "ˈɪʃuːz", "whole": "hoʊl", "full": "fʊl", "deliver": "dɪˈlɪvər", "package": "ˈpækɪdʒ", "address": "əˈdrɛs", "approximately": "əˈprɑːksɪmətli", "roughly": "ˈrʌfli", "nearly": "ˈnɪrli", "half": "hæf", "lot": "lɑːt", "patience": "ˈpeɪʃəns", "master": "ˈmæstər", "language": "ˈlæŋɡwɪdʒ", "foreign": "ˈfɔːrən", "long": "lɔːŋ", "longer": "ˈlɔːŋɡər", "expected": "ɪkˈspɛktɪd", "anticipated": "ænˈtɪsɪpeɪtɪd", "extra": "ˈɛkstrə", "additional": "əˈdɪʃənəl", "reach": "riːtʃ", "software": "ˈsɔːftwɛr", "seconds": "ˈsɛkəndz", "few": "fjuː", "export": "ɪkˈspɔːrt", "courage": "ˈkɜːrɪdʒ", "quit": "kwɪt", "stable": "ˈsteɪbəl"
        };

        function fallbackWordToIPA(word) {
            let w = word.toLowerCase();
            w = w.replace(/tion$/g, 'ʃən')
                 .replace(/sion$/g, 'ʒən')
                 .replace(/ing$/g, 'ɪŋ')
                 .replace(/ed$/g, 'd')
                 .replace(/ly$/g, 'li')
                 .replace(/er$/g, 'ər')
                 .replace(/ee/g, 'iː')
                 .replace(/ea/g, 'iː')
                 .replace(/oo/g, 'uː')
                 .replace(/ou/g, 'aʊ')
                 .replace(/ow/g, 'oʊ')
                 .replace(/ai/g, 'eɪ')
                 .replace(/ay/g, 'eɪ')
                 .replace(/sh/g, 'ʃ')
                 .replace(/ch/g, 'tʃ')
                 .replace(/th/g, 'θ')
                 .replace(/ph/g, 'f')
                 .replace(/ck/g, 'k');
            return w;
        }

        function sentenceToIPA(sentence) {
            if (!sentence) return "";
            const clean = sentence.replace(/^["']|["']$/g, '').trim();
            const tokens = clean.split(/\s+/);
            const ipaWords = tokens.map(token => {
                const puncMatch = token.match(/^([^a-zA-Z0-9']*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9']*)$/);
                if (!puncMatch) return token;
                const [, prefix, core, suffix] = puncMatch;
                const lower = core.toLowerCase();
                const mapped = IPA_DICT[lower] || fallbackWordToIPA(lower);
                const pause = /[.,;!?—-]/.test(suffix) ? suffix + " " : "";
                return mapped + pause;
            });
            return `/${ipaWords.join(' ').replace(/\s+/g, ' ').trim()}/`;
        }

        // Phát âm câu trả lời chuẩn ngay trên thẻ câu hỏi để người dùng luyện nghe trước khi nhập
        function speakTargetAnswer(rate = 0.95, btnEl = null) {
            const question = getActiveQuestionObject();
            if (!question) return;
            speakText(question.sampleCasual, btnEl, rate);
        }

        // 4. HỆ THỐNG CHẤM ĐIỂM TẦNG 1 (OFFLINE 0Đ • WORD-LEVEL DIFF + 3 TRẠNG THÁI + CHẶT TỪ NGUYÊN TỪ & CÂU HỎI)
        const CONTRACTION_EXPANSION_MAP = {
            "i'm": ["i", "am"], "you're": ["you", "are"], "he's": ["he", "is"], "she's": ["she", "is"],
            "it's": ["it", "is"], "we're": ["we", "are"], "they're": ["they", "are"],
            "i've": ["i", "have"], "you've": ["you", "have"], "we've": ["we", "have"], "they've": ["they", "have"],
            "i'd": ["i", "would"], "you'd": ["you", "would"], "he'd": ["he", "would"], "she'd": ["she", "would"], "we'd": ["we", "would"],
            "i'll": ["i", "will"], "you'll": ["you", "will"], "he'll": ["he", "will"], "she'll": ["she", "will"], "it'll": ["it", "will"], "we'll": ["we", "will"], "they'll": ["they", "will"],
            "'ll": ["will"],
            "don't": ["do", "not"], "doesn't": ["does", "not"], "didn't": ["did", "not"],
            "won't": ["will", "not"], "can't": ["can", "not"], "cannot": ["can", "not"],
            "couldn't": ["could", "not"], "wouldn't": ["would", "not"], "shouldn't": ["should", "not"],
            "isn't": ["is", "not"], "aren't": ["are", "not"], "wasn't": ["was", "not"], "weren't": ["were", "not"],
            "haven't": ["have", "not"], "hasn't": ["has", "not"], "hadn't": ["had", "not"],
            "that's": ["that", "is"], "there's": ["there", "is"], "let's": ["let", "us"]
        };

        const NUMBER_WORD_EQUIV = {
            "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
            "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
            "15": "fifteen", "20": "twenty", "30": "thirty", "45": "forty-five", "60": "sixty"
        };

        const DIFF_MINOR_WORDS = new Set(["a", "an", "the", "to", "of", "in", "on", "at", "for", "and", "or", "is", "am", "are"]);

        function escapeRegexPattern(str) {
            return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // So khớp NGUYÊN TỪ / NGUYÊN CỤM TỪ theo ranh giới từ (Tuyệt đối không khớp chuỗi con như "representation" chứa "presentation" hay "takes" chứa "take")
        function hasExactWholeWordOrPhrase(haystack, needle) {
            const h = (haystack || '').toLowerCase().trim();
            const n = (needle || '').toLowerCase().trim();
            if (!h || !n) return false;
            const re = new RegExp(`(?:^|[^a-z0-9'])${escapeRegexPattern(n)}(?:$|[^a-z0-9'])`, 'i');
            return re.test(h);
        }

        function normalizeSingleTokenForDiff(rawToken) {
            const clean = (rawToken || "")
                .toLowerCase()
                .replace(/[’‘`]/g, "'")
                .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
            if (!clean) return [];
            if (CONTRACTION_EXPANSION_MAP[clean]) {
                return CONTRACTION_EXPANSION_MAP[clean];
            }
            if (NUMBER_WORD_EQUIV[clean]) {
                return [NUMBER_WORD_EQUIV[clean]];
            }
            return [clean];
        }

        function tokenizeToExpandedAtoms(text) {
            const rawTokens = (text || "").trim().split(/\s+/).filter(Boolean);
            const atoms = [];
            rawTokens.forEach((raw, origIdx) => {
                const parts = normalizeSingleTokenForDiff(raw);
                if (parts.length === 0) return;
                parts.forEach(p => {
                    atoms.push({ norm: p, raw, origIdx });
                });
            });
            return { rawTokens, atoms };
        }

        function calcLevenshteinDistance(a, b) {
            if (a === b) return 0;
            if (!a) return b.length;
            if (!b) return a.length;
            const m = a.length, n = b.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let i = 0; i <= m; i++) dp[i][0] = i;
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
                }
            }
            return dp[m][n];
        }

        // Kiểm tra nghiêm ngặt lỗi gõ nhầm chính tả nhẹ (tránh nhầm từ khác nghĩa như representation vs presentation, hoặc chia sai động từ takes vs take)
        function isStrictLightTypo(userWord, targetWord) {
            if (!userWord || !targetWord) return false;
            if (userWord === targetWord) return false;
            // Phải có độ dài tối thiểu 5 ký tự và cùng chữ cái đầu tiên (loại trừ sai tiền tố như re-presentation vs presentation)
            if (userWord.length < 5 || targetWord.length < 5) return false;
            if (userWord[0] !== targetWord[0]) return false;
            // Loại trừ lỗi chia sai số nhiều / ngôi 3 số ít (-s / -d)
            if (userWord === targetWord + 's' || targetWord === userWord + 's') return false;
            if (userWord === targetWord + 'd' || targetWord === userWord + 'd') return false;
            // Chỉ chấp nhận tối đa đúng 1 lỗi ký tự (Levenshtein = 1)
            return calcLevenshteinDistance(userWord, targetWord) === 1;
        }

        // Thuật toán Word-level Diff (LCS Alignment + Phát hiện sai chính tả nhẹ chặt chẽ)
        function computeWordLevelDiff(userText, refText) {
            const uData = tokenizeToExpandedAtoms(userText);
            const rData = tokenizeToExpandedAtoms(refText);
            const uAtoms = uData.atoms;
            const rAtoms = rData.atoms;
            const m = uAtoms.length;
            const n = rAtoms.length;

            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (uAtoms[i - 1].norm === rAtoms[j - 1].norm) {
                        dp[i][j] = dp[i - 1][j - 1] + 1;
                    } else {
                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
            }

            const matchedUserAtomIdx = new Set();
            const matchedRefAtomIdx = new Set();
            let i = m, j = n;
            while (i > 0 && j > 0) {
                if (uAtoms[i - 1].norm === rAtoms[j - 1].norm) {
                    matchedUserAtomIdx.add(i - 1);
                    matchedRefAtomIdx.add(j - 1);
                    i--;
                    j--;
                } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                    i--;
                } else {
                    j--;
                }
            }

            const userTokenStatus = uData.rawTokens.map((raw, origIdx) => {
                const atomIndices = [];
                uAtoms.forEach((a, idx) => {
                    if (a.origIdx === origIdx) atomIndices.push(idx);
                });
                const matchedCount = atomIndices.filter(idx => matchedUserAtomIdx.has(idx)).length;
                const isExactMatch = atomIndices.length > 0 && matchedCount === atomIndices.length;
                return {
                    raw,
                    norm: atomIndices.map(idx => uAtoms[idx].norm).join(' '),
                    status: isExactMatch ? 'match' : 'wrong',
                    suggestion: ''
                };
            });

            const unmatchedRefTokens = [];
            const refAtomUsedByTypo = new Set();
            rAtoms.forEach((a, idx) => {
                if (!matchedRefAtomIdx.has(idx)) {
                    unmatchedRefTokens.push({ idx, norm: a.norm, raw: a.raw });
                }
            });

            // Bước 2: Chỉ gắn nhãn typo (màu vàng) khi thỏa điều kiện chặt isStrictLightTypo
            let typoCount = 0;
            userTokenStatus.forEach(tok => {
                if (tok.status !== 'wrong' || tok.norm.includes(' ')) return;
                const bestCand = unmatchedRefTokens.find(cand =>
                    !refAtomUsedByTypo.has(cand.idx) && isStrictLightTypo(tok.norm, cand.norm)
                );
                if (bestCand) {
                    tok.status = 'typo';
                    tok.suggestion = bestCand.raw.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
                    refAtomUsedByTypo.add(bestCand.idx);
                    typoCount++;
                }
            });

            const missingWords = [];
            const seenMissing = new Set();
            unmatchedRefTokens.forEach(cand => {
                if (refAtomUsedByTypo.has(cand.idx)) return;
                const cleanDisp = cand.raw.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '');
                if (cleanDisp && !seenMissing.has(cand.norm)) {
                    seenMissing.add(cand.norm);
                    missingWords.push(cleanDisp);
                }
            });

            const matchedAtoms = matchedUserAtomIdx.size;
            const denom = Math.max(m, n, 1);
            const ratio = Math.min(1, (matchedAtoms + typoCount * 0.7) / denom);
            const wrongCount = userTokenStatus.filter(t => t.status === 'wrong').length;

            return {
                refText,
                userTokens: userTokenStatus,
                missingWords,
                matchedAtoms,
                typoCount,
                wrongCount,
                ratio
            };
        }

        function escapeHtmlSafe(str) {
            return String(str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        // Chuyển điểm ngầm + isPassed thành 3 Trạng thái chuẩn (excellent | passed | retry)
        function resolveVerdictTier(score, isPassed) {
            if (!isPassed || score < 7.0) return 'retry';
            if (score >= 9.0) return 'excellent';
            return 'passed';
        }

        // Kiểm tra ngữ pháp nghiêm ngặt theo công thức cấu trúc & DẠNG CÂU HỎI (Đảo trợ động từ)
        function verifyStrictStructureSyntax(question, cleanUser, userExpandedText) {
            const sample = (question.sampleCasual || "").toLowerCase().trim();
            const isQuestionPrompt = (question.vi || "").trim().endsWith("?") || sample.endsWith("?");

            // Kiểm tra chung cho dạng Câu hỏi khi không ở Structure mode
            if (!question.isStructureMode || !question.structureInfo) {
                if (isQuestionPrompt && /^how\s+long\b/i.test(sample)) {
                    const hasAux = /\bhow\s+long\s+(do|does|did|will|would|can|could|have|has|had|is|are|was|were)\b/i.test(userExpandedText);
                    if (!hasAux) {
                        return { valid: false, partial: false, reason: "Câu hỏi với 'How long' cần đảo trợ động từ (do/does/did/will/can...) lên trước chủ ngữ." };
                    }
                }
                return { valid: true, partial: false, reason: "" };
            }

            const sid = question.structureInfo.id;

            // Cấu trúc #1: It takes / took / will take + (O) + [time] + to V & Câu hỏi How long does/did/will it take...
            if (sid === "struct_1") {
                if (/^how\s+long\b/i.test(sample)) {
                    const hasHowLong = /\bhow\s+long\b/i.test(userExpandedText);
                    if (!hasHowLong) {
                        return { valid: false, partial: false, reason: "Câu hỏi về thời gian này cần bắt đầu bằng 'How long...'." };
                    }
                    const validQuestionInversion = /\bhow\s+long\s+(does|did|will|would|can|could)\s+it\s+take\b/i.test(userExpandedText);
                    const validSpendQuestion = /\bhow\s+(much\s+time|long)\s+(do|does|did|will)\s+\w+\s+spend\b/i.test(userExpandedText);
                    if (!validQuestionInversion && !validSpendQuestion) {
                        return {
                            valid: false,
                            partial: true,
                            reason: "Thiếu trợ động từ đảo ngữ trong câu hỏi! Công thức chuẩn là 'How long did/does/will it take + (someone) + to V?' (không dùng 'How long it takes')."
                        };
                    }
                } else {
                    const hasTake = /\b(take|takes|took|taking)\b/i.test(cleanUser);
                    if (!hasTake) {
                        return { valid: false, partial: false, reason: "Bạn chưa dùng động từ 'take / takes / took' của cấu trúc mục tiêu." };
                    }
                }

                if (/\bto\s+\w+/i.test(sample) && !/\bto\s+[a-z]+/i.test(cleanUser)) {
                    return { valid: false, partial: true, reason: "Thiếu giới từ 'to' trước động từ nguyên mẫu (Công thức chuẩn: It takes + [thời gian] + to V)." };
                }
                const badOrder = /\b(takes|took)\s+(master|drive|walk|fix|finish|complete|learn|reach|get|make|prepare|deliver)\b/i.test(cleanUser);
                if (badOrder) {
                    return { valid: false, partial: true, reason: "Sai trật tự cấu trúc: Sau 'It takes/took' phải là [thời gian/công sức] trước, rồi mới đến 'to + V'." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Cấu trúc #2: Would you mind + V-ing / if I + V-ed
            if (sid === "struct_2") {
                if (!/\b(would|do)\s+you\s+(guys\s+)?mind\b/i.test(cleanUser)) {
                    return { valid: false, partial: /\bmind\b/i.test(cleanUser), reason: "Câu nhờ vả/xin phép lịch sự cần đảo ngữ 'Would you mind...' hoặc 'Do you mind...'." };
                }
                if (/mind\s+if\b/i.test(sample) && !/mind\s+if\b/i.test(cleanUser)) {
                    return { valid: false, partial: true, reason: "Tình huống xin phép này cần dùng 'Would you mind if I/we + V-ed'." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Cấu trúc #3: Not only ... but also
            if (sid === "struct_3") {
                if (!/\bnot\s+only\b/i.test(cleanUser) || !/\b(but|also)\b/i.test(cleanUser)) {
                    const hasOne = /\bnot\s+only\b/i.test(cleanUser);
                    return { valid: false, partial: hasOne, reason: "Cấu trúc này yêu cầu đủ cặp liên từ 'not only ... but (also) ...'." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Cấu trúc #4: Used to V / Be used to V-ing
            if (sid === "struct_4") {
                if (!/\bused?\s+to\b/i.test(cleanUser)) {
                    return { valid: false, partial: false, reason: "Bạn chưa sử dụng cụm 'used to' (hoặc 'use to' ở câu phủ định/nghi vấn)." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Cấu trúc #5: No matter how/what/where...
            if (sid === "struct_5") {
                if (!/(\bno\s+matter\s+(how|what|where|who|when|which)\b|\b(however|whatever|wherever|whoever|whenever)\b)/i.test(cleanUser)) {
                    return { valid: false, partial: false, reason: "Cấu trúc này cần mở đầu mệnh đề bằng 'No matter + how/what/where/who/when' (hoặc However/Whatever)." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Cấu trúc #6: I wish + S + V-ed / had V3 / would V
            if (sid === "struct_6") {
                if (!/(\bwish\b|\bif\s+only\b)/i.test(cleanUser)) {
                    return { valid: false, partial: false, reason: "Bạn chưa sử dụng 'I wish' (hoặc 'If only') cho câu ước." };
                }
                return { valid: true, partial: false, reason: "" };
            }

            // Các cấu trúc tùy chỉnh khác: kiểm tra khớp NGUYÊN CỤM từ requiredPatterns
            if (Array.isArray(question.structureInfo.requiredPatterns) && question.structureInfo.requiredPatterns.length > 0) {
                const matchedPat = question.structureInfo.requiredPatterns.some(pat =>
                    hasExactWholeWordOrPhrase(cleanUser, pat) || hasExactWholeWordOrPhrase(userExpandedText, pat)
                );
                if (!matchedPat) {
                    return { valid: false, partial: false, reason: `Bạn chưa áp dụng đúng cấu trúc trọng tâm "${question.structureInfo.shortName}".` };
                }
            }

            return { valid: true, partial: false, reason: "" };
        }

        // Kiểm tra Hình thức câu chuẩn (1.0đ = 0.5đ Viết hoa đầu câu + 0.5đ Dấu kết thúc câu)
        function checkSentenceFormat(userText, question) {
            const trimmed = (userText || "").trim();
            const issues = [];
            let formatScore = 0;

            const startsWithCap = /^[A-Z]/.test(trimmed);
            if (startsWithCap) {
                formatScore += 0.5;
            } else {
                issues.push("Chưa viết hoa chữ cái đầu câu");
            }

            const promptIsQuestion = (question.vi || "").trim().endsWith("?") || (question.sampleCasual || "").trim().endsWith("?");
            const endsWithQuestion = trimmed.endsWith("?");
            const endsWithValidPunc = /[.!?]$/.test(trimmed);

            if (promptIsQuestion) {
                if (endsWithQuestion) {
                    formatScore += 0.5;
                } else {
                    issues.push("Câu hỏi cần kết thúc bằng dấu hỏi chấm (?)");
                }
            } else if (endsWithValidPunc) {
                formatScore += 0.5;
            } else {
                issues.push("Thiếu dấu câu kết thúc (., ?, !)");
            }

            return { formatScore, issues };
        }

        // Thuật toán chấm điểm Tầng 1 (Điểm ngầm 4 thành phần -> Hiển thị 3 Trạng thái: Chuẩn xác / Đạt - Góp ý nhẹ / Chưa đạt)
        function localSmartEvaluator(question, userText) {
            const trimmedUser = (userText || "").trim();
            const cleanUser = trimmedUser.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:"()]/g, ' ').replace(/\s+/g, ' ').trim();
            const userExpandedAtoms = tokenizeToExpandedAtoms(trimmedUser).atoms;
            const userExpandedText = userExpandedAtoms.map(a => a.norm).join(' ');
            const userWords = cleanUser.split(/\s+/).filter(Boolean);

            // Thu thập toàn bộ đáp án tham chiếu hợp lệ (Casual, Formal, Alternatives) để chọn bản khớp nhất
            const pedagogy = buildRichPedagogyData(question);
            const candidateRefs = [];
            if (question.sampleCasual) candidateRefs.push(question.sampleCasual);
            if (question.sampleFormal && question.sampleFormal !== question.sampleCasual) candidateRefs.push(question.sampleFormal);
            (question.alternatives || []).forEach(a => { if (a && a.en) candidateRefs.push(a.en); });
            (pedagogy.alternatives || []).forEach(a => { if (a && a.en) candidateRefs.push(a.en); });

            const uniqueRefs = Array.from(new Set(candidateRefs.map(s => s.trim()).filter(Boolean)));
            let bestDiff = computeWordLevelDiff(trimmedUser, uniqueRefs[0] || "");
            for (let k = 1; k < uniqueRefs.length; k++) {
                const candDiff = computeWordLevelDiff(trimmedUser, uniqueRefs[k]);
                if (candDiff.ratio > bestDiff.ratio) {
                    bestDiff = candDiff;
                }
            }

            // 1. THÀNH PHẦN 1: Cấu trúc mục tiêu & Ngữ pháp câu hỏi (3.0đ ngầm)
            const syntaxCheck = verifyStrictStructureSyntax(question, cleanUser, userExpandedText);
            const usedTargetStructure = syntaxCheck.valid;
            let structureScore = 0;
            if (question.isStructureMode) {
                structureScore = syntaxCheck.valid ? 3.0 : (syntaxCheck.partial ? 1.0 : 0.0);
            } else {
                structureScore = (!syntaxCheck.valid)
                    ? 0.5
                    : ((userWords.length >= 3 && bestDiff.ratio >= 0.35)
                        ? Math.min(3.0, Math.round(bestDiff.ratio * 3.5 * 10) / 10)
                        : (bestDiff.ratio > 0.15 ? 1.0 : 0.0));
            }

            // 2. THÀNH PHẦN 2: Từ vựng & Ý chính (So khớp NGUYÊN TỪ theo ranh giới từ — không khớp chuỗi con!)
            const rawKeywords = Array.isArray(question.keywords) && question.keywords.length > 0
                ? question.keywords
                : tokenizeToExpandedAtoms(bestDiff.refText).atoms.map(a => a.norm).filter(w => w.length >= 4 && !DIFF_MINOR_WORDS.has(w)).slice(0, 5);

            let kwCredit = 0;
            let matchedKwExactCount = 0;
            const missingKeywords = [];
            const typoKeywords = [];
            const uNormWords = userExpandedAtoms.map(a => a.norm);

            rawKeywords.forEach(kw => {
                const kwClean = kw.toLowerCase().trim();
                const kwExpanded = tokenizeToExpandedAtoms(kwClean).atoms.map(a => a.norm).join(' ');
                const exactHit = hasExactWholeWordOrPhrase(cleanUser, kwClean)
                    || (kwExpanded && hasExactWholeWordOrPhrase(userExpandedText, kwExpanded));

                if (exactHit) {
                    kwCredit += 1.0;
                    matchedKwExactCount++;
                } else if (!kwClean.includes(' ') && kwClean.length >= 5) {
                    // Chỉ chấp nhận lỗi gõ nhầm chính tả nhẹ theo chuẩn chặt isStrictLightTypo
                    const nearMatch = uNormWords.find(uw => isStrictLightTypo(uw, kwClean));
                    if (nearMatch) {
                        kwCredit += 0.75;
                        typoKeywords.push(`"${nearMatch}" → "${kwClean}"`);
                    } else {
                        missingKeywords.push(kw);
                    }
                } else {
                    missingKeywords.push(kw);
                }
            });

            const keywordRatio = rawKeywords.length > 0 ? (kwCredit / rawKeywords.length) : bestDiff.ratio;
            const keywordScore = Math.round(keywordRatio * 3.5 * 100) / 100;

            // 3. THÀNH PHẦN 3: Độ khớp từng từ Word-Diff / LCS (2.5đ ngầm)
            const diffScore = Math.round(bestDiff.ratio * 2.5 * 100) / 100;

            // 4. THÀNH PHẦN 4: Hình thức câu chuẩn (1.0đ ngầm — chỉ tính khi câu có nội dung liên quan)
            const formatCheck = checkSentenceFormat(trimmedUser, question);
            const hasRealContent = (keywordScore + diffScore) >= 1.5 && userWords.length >= 2;
            const formatScore = hasRealContent ? formatCheck.formatScore : 0;

            // Tổng hợp điểm ngầm & áp dụng các ngưỡng chặn chống chấm quá thoáng
            let rawTotal = structureScore + keywordScore + diffScore + formatScore;

            const isExactContentMatch = uniqueRefs.some(ref => {
                const refExpanded = tokenizeToExpandedAtoms(ref).atoms.map(a => a.norm).join(' ');
                return refExpanded.length > 0 && refExpanded === userExpandedText;
            });

            if (isExactContentMatch) {
                rawTotal = 9.0 + formatCheck.formatScore;
            } else if (!hasRealContent) {
                rawTotal = Math.min(rawTotal, 2.0);
            } else {
                // Chặn trần 1: Sai cấu trúc mục tiêu hoặc sai ngữ pháp câu hỏi -> Chưa đạt (<= 6.0)
                if (!usedTargetStructure) {
                    rawTotal = Math.min(rawTotal, 6.0);
                }
                // Chặn trần 2: Khớp từ quá thấp (< 55%) -> Chưa đạt (<= 6.0)
                if (bestDiff.ratio < 0.55) {
                    rawTotal = Math.min(rawTotal, 6.0);
                }
                // Chặn trần 3: Khớp từ ở mức khá (< 72%) hoặc còn sai từ/sai chính tả -> Không thể đạt "Chuẩn xác" (>= 9.0)
                else if (bestDiff.ratio < 0.72 || bestDiff.wrongCount >= 2 || typoKeywords.length > 0) {
                    rawTotal = Math.min(rawTotal, 8.5);
                }
            }

            const score = Math.min(10, Math.max(1.0, Math.round(rawTotal * 2) / 2));
            const isPassed = score >= 7.0 && (!question.isStructureMode || usedTargetStructure);
            const verdict = resolveVerdictTier(score, isPassed);

            // 4 thẻ trạng thái gọn gàng (Không hiển thị số thập phân kiểu 1.5/2.5)
            const errorTags = [
                {
                    key: 'structure',
                    label: 'Cấu trúc',
                    ok: usedTargetStructure,
                    valueText: usedTargetStructure ? 'Đạt' : 'Chưa đúng',
                    detail: usedTargetStructure ? 'Áp dụng đúng cấu trúc mục tiêu' : syntaxCheck.reason
                },
                {
                    key: 'vocab',
                    label: 'Từ khóa',
                    ok: missingKeywords.length === 0 && typoKeywords.length === 0,
                    valueText: `${matchedKwExactCount}/${rawKeywords.length}`,
                    detail: missingKeywords.length > 0 ? `Thiếu/khác: ${missingKeywords.join(', ')}` : (typoKeywords.length > 0 ? `Gõ nhầm nhẹ: ${typoKeywords.join(', ')}` : 'Đủ từ khóa trọng tâm')
                },
                {
                    key: 'diff',
                    label: 'Khớp từ',
                    ok: bestDiff.ratio >= 0.72 && bestDiff.wrongCount <= 1,
                    valueText: `${Math.round(bestDiff.ratio * 100)}%`,
                    detail: `${Math.round(bestDiff.ratio * 100)}% tương đồng câu chuẩn`
                },
                {
                    key: 'format',
                    label: 'Hình thức',
                    ok: formatCheck.issues.length === 0,
                    valueText: formatCheck.issues.length === 0 ? 'Chuẩn' : 'Cần sửa',
                    detail: formatCheck.issues.length === 0 ? 'Viết hoa & dấu câu chuẩn' : formatCheck.issues.join('; ')
                }
            ];

            let title = "";
            let feedback = "";

            if (verdict === 'excellent') {
                title = "Chuẩn xác! Diễn đạt rất tự nhiên";
                feedback = formatCheck.issues.length > 0
                    ? `Nội dung và cấu trúc của bạn rất chuẩn! Chỉ lưu ý nhỏ về hình thức: ${formatCheck.issues.join(' & ')}.`
                    : "Bạn đã vận dụng chính xác cấu trúc mục tiêu, dùng đúng từ khóa và trật tự câu trôi chảy như người bản xứ.";
            } else if (verdict === 'passed') {
                title = "Đạt chuẩn — Có góp ý nhỏ";
                const notes = [];
                if (typoKeywords.length > 0) notes.push(`Chú ý lỗi chính tả nhẹ (${typoKeywords.join(', ')})`);
                if (missingKeywords.length > 0) notes.push(`Một vài từ khóa chưa khớp hẳn câu mẫu (${missingKeywords.join(', ')})`);
                if (formatCheck.issues.length > 0) notes.push(`Hình thức: ${formatCheck.issues.join(', ')}`);
                feedback = notes.length > 0
                    ? `Câu dịch của bạn đã đạt yêu cầu và được tích hoàn thành. ${notes.join('. ')}. Bạn có thể đối chiếu câu chuẩn ngay bên dưới để trau chuốt thêm!`
                    : "Bạn đã áp dụng đúng cấu trúc câu và truyền tải đúng ý chính. Hãy đối chiếu thêm câu chuẩn bên dưới để diễn đạt thật tự nhiên nhé!";
            } else if (!usedTargetStructure && syntaxCheck.reason) {
                title = "Chưa đạt — Sai cấu trúc / Ngữ pháp";
                feedback = `${syntaxCheck.reason} Hãy đối chiếu các từ bị gạch đỏ phía trên với Câu trả lời chuẩn ngay bên dưới rồi sửa lại nhé!`;
            } else {
                title = "Chưa đạt — Cần sửa lại";
                feedback = `Câu dịch mới khớp ${Math.round(bestDiff.ratio * 100)}% với đáp án chuẩn${missingKeywords.length > 0 ? ` và còn thiếu/sai từ khóa (${missingKeywords.join(', ')})` : ''}. Nếu bạn dùng cách diễn đạt đồng nghĩa khác, hãy bấm "Phúc khảo bằng Gemini AI" ở trên để kiểm tra ngữ nghĩa nhé!`;
            }

            return {
                score,
                verdict,
                used_target_structure: usedTargetStructure,
                title,
                feedback,
                casual_native: question.sampleCasual,
                formal_native: question.sampleFormal,
                alternatives: pedagogy.alternatives,
                wordDiff: bestDiff,
                breakdown: {
                    structureScore,
                    keywordScore: Math.round(keywordScore * 10) / 10,
                    diffScore: Math.round(diffScore * 10) / 10,
                    formatScore,
                    formatIssues: formatCheck.issues,
                    errorTags
                },
                source: 'local'
            };
        }

        // Chấm bài Tầng 1 tức thì (0.01s, Offline 100%, không tốn token API)
        async function evaluateTranslation() {
            const userText = document.getElementById('user-translation').value.trim();
            if (!userText) {
                showToast("Bạn hãy nhập câu dịch tiếng Anh trước khi kiểm tra nhé!", "warning");
                document.getElementById('user-translation').focus();
                return;
            }

            const question = getActiveQuestionObject();
            if (!question) return;

            if (typeof incrementSessionAttemptCount === 'function') {
                incrementSessionAttemptCount(question);
            }

            const loadingPanel = document.getElementById('loading-panel');
            if (loadingPanel) loadingPanel.classList.add('hidden');

            const localResult = localSmartEvaluator(question, userText);
            displayEvaluationResult(localResult, question, userText, false);
        }

        // Render khối "Bạn viết:" (Word-level Diff) + 4 thẻ trạng thái + Slot nút Gemini AI
        function renderWordDiffPanel(result, question, userText, isAnswerView) {
            const detailsBody = document.getElementById('result-details-body');
            if (!detailsBody) return;

            let diffContainer = document.getElementById('word-diff-comparison-box');
            if (!diffContainer) {
                diffContainer = document.createElement('div');
                diffContainer.id = 'word-diff-comparison-box';
                detailsBody.insertBefore(diffContainer, detailsBody.firstChild);
            }

            if (isAnswerView) {
                diffContainer.className = 'space-y-3';
                diffContainer.innerHTML = `<div id="gemini-reeval-slot"></div>`;
                if (typeof window.renderGeminiActionSlot === 'function') {
                    window.renderGeminiActionSlot(question, '', result);
                }
                return;
            }

            const wordDiff = result.wordDiff;
            const breakdown = result.breakdown;
            const safeUserSpeak = (userText || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            const tokensHtml = (wordDiff && Array.isArray(wordDiff.userTokens) && wordDiff.userTokens.length > 0)
                ? wordDiff.userTokens.map(tok => {
                    const safeRaw = escapeHtmlSafe(tok.raw);
                    if (tok.status === 'match') {
                        return `<span class="inline-block px-1.5 py-0.5 rounded-lg font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/70">${safeRaw}</span>`;
                    }
                    if (tok.status === 'typo') {
                        return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg font-bold text-amber-800 bg-amber-50 border border-amber-300" title="Gõ nhầm chính tả nhẹ — gợi ý: ${escapeHtmlSafe(tok.suggestion)}"><span class="underline decoration-wavy decoration-amber-500">${safeRaw}</span><span class="text-[11px] font-extrabold text-emerald-700 bg-white px-1 rounded">→ ${escapeHtmlSafe(tok.suggestion)}</span></span>`;
                    }
                    return `<span class="inline-block px-1.5 py-0.5 rounded-lg font-bold text-rose-700 bg-rose-100/90 border border-rose-200 line-through decoration-rose-500 decoration-2" title="Từ sai, chia sai dạng hoặc thừa so với câu chuẩn">${safeRaw}</span>`;
                }).join(' ')
                : `<span class="text-slate-700 font-semibold">${escapeHtmlSafe(userText)}</span>`;

            const missingHtml = (wordDiff && Array.isArray(wordDiff.missingWords) && wordDiff.missingWords.length > 0)
                ? `<div class="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                        <span class="font-bold text-slate-500"><i class="fa-solid fa-circle-plus text-indigo-500 mr-1"></i>Từ gợi ý còn thiếu:</span>
                        ${wordDiff.missingWords.slice(0, 8).map(w => `<span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70 font-bold">${escapeHtmlSafe(w)}</span>`).join('')}
                   </div>`
                : '';

            const breakdownTagsHtml = (breakdown && Array.isArray(breakdown.errorTags))
                ? `<div class="flex flex-wrap items-center gap-1.5 pt-1">
                        ${breakdown.errorTags.map(tag => {
                            const style = tag.ok
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200';
                            const icon = tag.ok ? 'fa-circle-check text-emerald-500' : 'fa-circle-xmark text-rose-500';
                            return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style}" title="${escapeHtmlSafe(tag.detail)}">
                                        <i class="fa-solid ${icon} text-[10px]"></i>
                                        <span>${escapeHtmlSafe(tag.label)}: ${escapeHtmlSafe(tag.valueText)}</span>
                                    </span>`;
                        }).join('')}
                   </div>`
                : '';

            const isGeminiVerified = result.source === 'gemini';
            const verifiedBadge = isGeminiVerified
                ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 border border-purple-200"><i class="fa-solid fa-sparkles mr-1"></i>Đã đồng bộ theo Gemini AI</span>`
                : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">So khớp trực quan</span>`;

            diffContainer.className = 'p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs space-y-3';
            diffContainer.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500">Bạn viết:</span>
                        ${verifiedBadge}
                    </div>
                    <button type="button" onclick="speakText('${safeUserSpeak}', this, 0.92)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 text-[11px] font-bold transition-all" title="Nghe lại chính câu bạn vừa viết">
                        <i class="fa-solid fa-volume-low text-xs"></i>
                        <span>Nghe câu bạn viết</span>
                    </button>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 text-sm sm:text-base leading-relaxed">
                    ${tokensHtml}
                </div>

                ${missingHtml}
                ${breakdownTagsHtml}

                <!-- Khu vực gắn nút Chấm bằng Gemini AI & Hộp nhận xét AI -->
                <div id="gemini-reeval-slot" class="pt-2 border-t border-slate-100"></div>
            `;

            if (typeof window.renderGeminiActionSlot === 'function') {
                window.renderGeminiActionSlot(question, userText, result);
            }
        }

        // Cầu nối ưu tiên kết quả từ Gemini AI (Đồng bộ cả 2 chiều: nâng lên Đạt/Chuẩn xác HOẶC hạ xuống Chưa đạt)
        window.applyReEvaluationResult = function (aiPayload) {
            if (!aiPayload || !state.lastEvaluationContext) return null;
            const { question, userText, result: prevResult } = state.lastEvaluationContext;
            const aiStructOk = question.isStructureMode ? Boolean(aiPayload.used_target_structure) : true;
            const aiMeaningOk = aiPayload.meaning_ok !== false;

            // Quy đổi verdict + score từ Gemini thành điểm ngầm nhất quán với 3 trạng thái
            let finalScore = Math.min(10, Math.max(0, Math.round(Number(aiPayload.score) * 2) / 2));
            if (aiPayload.verdict === 'excellent' && aiStructOk && aiMeaningOk) {
                finalScore = Math.max(finalScore, 9.5);
            } else if (aiPayload.verdict === 'passed' && aiStructOk && aiMeaningOk) {
                finalScore = Math.min(8.5, Math.max(finalScore, 7.5));
            } else if (aiPayload.verdict === 'retry') {
                finalScore = Math.min(finalScore, 5.5);
            }

            if (question.isStructureMode && !aiStructOk) {
                finalScore = Math.min(finalScore, 6.0);
            }
            if (!aiMeaningOk) {
                finalScore = Math.min(finalScore, 5.5);
            }

            const isPassed = finalScore >= 7.0 && (!question.isStructureMode || aiStructOk) && aiMeaningOk;
            const finalVerdict = resolveVerdictTier(finalScore, isPassed);
            const prevVerdict = prevResult.verdict || resolveVerdictTier(prevResult.score, prevResult.score >= 7.0 && (!question.isStructureMode || prevResult.used_target_structure));

            const titleMap = {
                excellent: 'Gemini AI xác nhận: Chuẩn xác!',
                passed: 'Gemini AI xác nhận: Đạt chuẩn (Góp ý nhỏ)',
                retry: 'Gemini AI nhận xét: Chưa đạt — Cần sửa lại'
            };

            const updatedResult = {
                ...prevResult,
                score: finalScore,
                verdict: finalVerdict,
                used_target_structure: aiStructOk,
                title: titleMap[finalVerdict],
                feedback: aiPayload.feedback || prevResult.feedback,
                source: 'gemini'
            };

            const xpInfo = displayEvaluationResult(updatedResult, question, userText, true);
            return {
                synced: true,
                changed: finalVerdict !== prevVerdict,
                upgraded: (prevVerdict === 'retry' && finalVerdict !== 'retry') || (prevVerdict === 'passed' && finalVerdict === 'excellent'),
                downgraded: prevVerdict !== 'retry' && finalVerdict === 'retry',
                verdict: finalVerdict,
                finalScore,
                xpAdded: xpInfo ? xpInfo.totalXp : 0
            };
        };

        // Hiển thị kết quả theo MÔ HÌNH 3 TRẠNG THÁI (Chuẩn xác / Đạt - Góp ý nhẹ / Chưa đạt)
        function displayEvaluationResult(result, question, userText, isReEvaluation = false) {
            const resultPanel = document.getElementById('result-panel');
            const scoreHeader = document.getElementById('score-header');
            const scoreCircle = document.getElementById('score-circle');
            const scoreBar = document.getElementById('score-bar');
            const scoreTitle = document.getElementById('score-title');
            const xpEarnedBadge = document.getElementById('xp-earned-badge');

            const isAnswerView = Boolean(result.isDirectAnswerView);
            const parsedScore = Number(result.score);
            const score = Number.isFinite(parsedScore) ? parsedScore : 0;
            const isPassed = !isAnswerView && score >= 7.0 && (!question.isStructureMode || Boolean(result.used_target_structure));
            const verdict = isAnswerView ? 'answer' : (result.verdict || resolveVerdictTier(score, isPassed));

            result.verdict = verdict;
            state.lastEvaluationContext = { question, userText, result };

            // === ĐỒNG BỘ HỘP ÔN TẬP (SPACED REPETITION) ===
            if (!isAnswerView && question) {
                const sId = question.isStructureMode ? question.structureInfo.id : (question.topic || 'topic');
                checkAndAddToReviewBox(sId, question.id, isPassed ? score : Math.min(score, 6.0), userText, question.vi);
            }

            let xpAwardInfo = { xp: 0, bonusStructXp: 0, totalXp: 0, badgeText: '', reason: '' };

            if (isAnswerView) {
                scoreCircle.innerHTML = `<i class="fa-solid fa-book-open-reader text-xl"></i><span class="text-[10px] font-semibold opacity-90 mt-0.5">Đáp án</span>`;
                scoreTitle.innerText = result.title;
                scoreBar.style.width = `100%`;
                scoreHeader.className = "p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/90 to-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4";
                scoreCircle.className = "w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-md shrink-0";
                scoreBar.className = "h-full bg-indigo-500 rounded-full transition-all duration-500";
                xpEarnedBadge.innerText = "";
                xpEarnedBadge.className = "hidden";
            } else {
                scoreTitle.innerText = result.title;
                xpEarnedBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800";

                if (verdict === 'excellent') {
                    scoreCircle.innerHTML = `<i class="fa-solid fa-check-double text-xl"></i><span class="text-[10px] font-extrabold tracking-tight mt-0.5">Chuẩn xác</span>`;
                    scoreBar.style.width = `100%`;
                    scoreHeader.className = "p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/90 to-teal-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4";
                    scoreCircle.className = "w-16 h-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md shrink-0";
                    scoreBar.className = "h-full bg-emerald-500 rounded-full transition-all duration-500";
                } else if (verdict === 'passed') {
                    scoreCircle.innerHTML = `<i class="fa-solid fa-check text-xl"></i><span class="text-[10px] font-extrabold tracking-tight mt-0.5">Đạt chuẩn</span>`;
                    scoreBar.style.width = `78%`;
                    scoreHeader.className = "p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/90 to-yellow-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4";
                    scoreCircle.className = "w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center shadow-md shrink-0";
                    scoreBar.className = "h-full bg-amber-500 rounded-full transition-all duration-500";
                } else {
                    scoreCircle.innerHTML = `<i class="fa-solid fa-rotate-right text-xl"></i><span class="text-[10px] font-extrabold tracking-tight mt-0.5">Chưa đạt</span>`;
                    scoreBar.style.width = `35%`;
                    scoreHeader.className = "p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/90 to-pink-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4";
                    scoreCircle.className = "w-16 h-16 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center shadow-md shrink-0";
                    scoreBar.className = "h-full bg-rose-500 rounded-full transition-all duration-500";
                }

                // TÍNH & ĐỒNG BỘ XP (Hỗ trợ cả cộng thưởng lẫn hoàn tác nếu Gemini hạ kết quả trong cùng lượt)
                if (typeof calculateAndAwardSentenceXP === 'function') {
                    xpAwardInfo = calculateAndAwardSentenceXP(question, score, isPassed, isReEvaluation);
                    xpEarnedBadge.innerText = xpAwardInfo.badgeText;
                }
            }

            // Hiển thị trạng thái hoàn thành Cấu trúc & Lưu tiến độ
            const structBanner = document.getElementById('structure-check-banner');
            if (question.isStructureMode && !isAnswerView) {
                structBanner.classList.remove('hidden');
                const iconBox = document.getElementById('structure-check-icon');
                const bannerTitle = document.getElementById('structure-check-title');
                const bannerSub = document.getElementById('structure-check-sub');

                if (isPassed) {
                    structBanner.className = "flex items-center gap-3 p-3.5 rounded-2xl border bg-emerald-50/70 border-emerald-200 text-emerald-900";
                    iconBox.className = "w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0";
                    iconBox.innerHTML = `<i class="fa-solid fa-check"></i>`;
                    bannerTitle.innerText = `Đã hoàn thành tình huống! Đúng cấu trúc: ${question.structureInfo.shortName}`;
                    bannerSub.innerText = verdict === 'excellent'
                        ? "Tình huống đã đạt mức Chuẩn xác và được tích xanh vào tiến độ học tập."
                        : "Tình huống đã đạt yêu cầu và được tích xanh. Bạn có thể sửa nhẹ để lên mức Chuẩn xác nếu muốn.";
                } else {
                    structBanner.className = "flex items-center gap-3 p-3.5 rounded-2xl border bg-rose-50/70 border-rose-200 text-rose-900";
                    iconBox.className = "w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0";
                    iconBox.innerHTML = `<i class="fa-solid fa-exclamation"></i>`;
                    bannerTitle.innerText = `Chưa hoàn thành — Cần đúng cấu trúc "${question.structureInfo.shortName}" & đúng nghĩa`;
                    bannerSub.innerText = "Câu này đã được lưu vào Hộp ôn tập để bạn sửa lại hoặc ôn sau.";
                }

                const prevBest = state.completedSituations[question.id] || 0;
                const sessionMeta = (typeof getSessionAttemptMeta === 'function') ? getSessionAttemptMeta(question.id) : null;

                if (isPassed) {
                    if (state.failedSituations[question.id] !== undefined) {
                        delete state.failedSituations[question.id];
                        localStorage.setItem('va_failed_situations', JSON.stringify(state.failedSituations));
                    }
                    if (score > prevBest) {
                        state.completedSituations[question.id] = score;
                        localStorage.setItem('va_completed_situations', JSON.stringify(state.completedSituations));
                    }
                    renderSituationStepper();

                    const struct = question.structureInfo;
                    const doneNow = struct.situations.filter(s => (state.completedSituations[s.id] || 0) >= 7).length;
                    if (prevBest < 7 && doneNow === struct.situations.length) {
                        const bonusText = xpAwardInfo.bonusStructXp > 0 ? ` (+${xpAwardInfo.bonusStructXp} XP thưởng trọn bộ!)` : '';
                        setTimeout(() => {
                            showToast(`🎉 Chúc mừng! Bạn đã chinh phục trọn bộ ${struct.situations.length}/${struct.situations.length} tình huống của cấu trúc "${struct.shortName}"${bonusText}!`, "success");
                        }, 400);
                    }
                } else {
                    // Nếu chưa từng hoàn thành trước lượt này (kể cả khi Gemini vừa hạ điểm Tầng 1 xuống Chưa đạt) -> ghi nhận Cần làm lại
                    const wasCompletedBefore = sessionMeta ? sessionMeta.wasCompletedBeforeVisit : (prevBest >= 7);
                    if (!wasCompletedBefore) {
                        state.failedSituations[question.id] = score;
                        localStorage.setItem('va_failed_situations', JSON.stringify(state.failedSituations));
                        delete state.completedSituations[question.id];
                        localStorage.setItem('va_completed_situations', JSON.stringify(state.completedSituations));
                    }
                    renderSituationStepper();
                }
            } else {
                structBanner.classList.add('hidden');
            }

            // Render Word-level Diff ("Bạn viết:") & Nút Gemini AI ngay phía trên Câu trả lời chuẩn
            renderWordDiffPanel(result, question, userText, isAnswerView);

            // Điền Câu trả lời chuẩn theo cấu trúc mục tiêu + Phiên âm IPA
            const standardSentence = question.sampleCasual;
            document.getElementById('standard-target-sentence').innerText = standardSentence;
            document.getElementById('standard-target-ipa').innerText = (question && question.ipa) ? question.ipa : sentenceToIPA(standardSentence);
            if (!isReEvaluation) {
                renderWordByWordIPA(standardSentence);
                resetSpeechEvalPanel();
            }

            // Ẩn hộp Nhận xét cục bộ khi đã có Nhận xét ưu tiên từ Gemini AI (tránh 2 nhận xét đối lập nhau)
            const localFeedbackBox = document.getElementById('local-feedback-box');
            if (localFeedbackBox) {
                if (result.source === 'gemini' && !isAnswerView) {
                    localFeedbackBox.classList.add('hidden');
                } else {
                    localFeedbackBox.classList.remove('hidden');
                }
            }

            document.getElementById('feedback-text').innerText = result.feedback;
            document.getElementById('casual-sentence').innerText = result.casual_native;
            document.getElementById('formal-sentence').innerText = result.formal_native;

            // Render danh sách Các cách nói khác tương tự
            const altListEl = document.getElementById('alternative-sentences-list');
            const adminCustomAlts = Array.isArray(question.alternatives) ? question.alternatives : [];
            const autoOrAiAlts = (result.alternatives && result.alternatives.length > 0)
                ? result.alternatives
                : buildRichPedagogyData(question).alternatives;
            const baseAlternatives = [...adminCustomAlts, ...autoOrAiAlts];

            const mergedAlternatives = [];
            const formalText = (question.sampleFormal || result.formal_native || "").trim();
            if (formalText && formalText.toLowerCase() !== standardSentence.trim().toLowerCase()) {
                mergedAlternatives.push({
                    label: "Trang trọng / Công việc (Formal)",
                    en: formalText,
                    speakable: formalText
                });
            }
            baseAlternatives.forEach(item => {
                const cleanEn = (item.en || "").replace(/^You can also say:\s*/i, "").replace(/^["']|["']$/g, "").trim();
                if (
                    cleanEn &&
                    cleanEn.toLowerCase() !== standardSentence.trim().toLowerCase() &&
                    !mergedAlternatives.some(m => m.en.toLowerCase() === cleanEn.toLowerCase())
                ) {
                    mergedAlternatives.push({
                        label: item.label || "Cách diễn đạt tương tự",
                        en: cleanEn,
                        speakable: (item.speakable || cleanEn).replace(/^["']|["']$/g, "").trim()
                    });
                }
            });

            altListEl.innerHTML = mergedAlternatives.map((alt, idx) => {
                const cleanSentenceText = (alt.en || "").replace(/^["']|["']$/g, "").trim();
                const safeSpeak = (alt.speakable || cleanSentenceText).replace(/'/g, "\\'");
                const isFormalTag = (alt.label || "").toLowerCase().includes("formal") || (alt.label || "").toLowerCase().includes("trang trọng");
                const badgeStyle = isFormalTag
                    ? "text-purple-700 bg-purple-100/90 border border-purple-200/60"
                    : "text-emerald-700 bg-emerald-100/80 border border-emerald-200/60";

                return `
                    <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200/70 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-all">
                        <div class="space-y-1 min-w-0 flex-1">
                            <span class="inline-flex items-center gap-1 text-[11px] font-bold ${badgeStyle} px-2.5 py-0.5 rounded-lg">
                                <i class="fa-solid ${isFormalTag ? 'fa-user-tie' : 'fa-wand-magic-sparkles'} text-[10px]"></i>
                                <span>${alt.label}</span>
                            </span>
                            <p id="alt-sent-${idx}" class="text-sm sm:text-base font-bold text-slate-800 pt-0.5 leading-snug">${cleanSentenceText}</p>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button onclick="copySentence('alt-sent-${idx}')" class="w-8 h-8 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 flex items-center justify-center transition-all" title="Sao chép câu này">
                                <i class="fa-regular fa-copy text-xs"></i>
                            </button>
                            <button onclick="speakText('${safeSpeak}', this)" class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center transition-all" title="Nghe phát âm câu này">
                                <i class="fa-solid fa-volume-high text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            const tagLabel = question.isStructureMode 
                ? `Cấu trúc: ${question.structureInfo.shortName}` 
                : (TOPIC_LABELS[question.topic] || "Giao tiếp");

            state.lastResult = {
                id: Date.now().toString(),
                topic: tagLabel,
                vi: question.vi,
                casual: result.casual_native,
                formal: result.formal_native,
                isDirectAnswerView: isAnswerView
            };

            const bookmarkBtn = document.getElementById('bookmark-result-btn');
            const bookmarkIcon = document.getElementById('bookmark-icon');
            const bookmarkText = document.getElementById('bookmark-text');
            bookmarkBtn.classList.remove('bg-indigo-50', 'border-indigo-300', 'text-indigo-700');
            bookmarkIcon.className = "fa-regular fa-bookmark text-indigo-500";
            bookmarkText.innerText = "Lưu vào sổ tay";

            toggleResultBodyCollapse(true);
            updateShowAnswerButtonUI(isAnswerView);

            resultPanel.classList.remove('hidden');
            if (!isReEvaluation) {
                scoreHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return xpAwardInfo;
        }

        // Bộ sinh biến thể thông minh cục bộ (khi chạy Offline hoặc chưa dán Gemini API Key)
        function buildLocalSmartVariation(struct) {
            const variationPool = {
                struct_1: [
                    {
                        vi: "Tôi thường mất khoảng 15 phút để chuẩn bị bữa sáng trước khi đi làm.",
                        hints: [{ en: "about 15 minutes", vi: "khoảng 15 phút" }, { en: "prepare breakfast", vi: "chuẩn bị bữa sáng" }],
                        sampleCasual: "It usually takes me about 15 minutes to make breakfast before work.",
                        sampleFormal: "It typically takes me approximately 15 minutes to prepare breakfast prior to leaving for work.",
                        keywords: ["takes", "15", "minutes", "breakfast", "work"]
                    },
                    {
                        vi: "Nhóm của chúng tôi đã mất gần một tháng để hoàn thành bản thiết kế giao diện mới.",
                        hints: [{ en: "nearly a month", vi: "gần một tháng" }, { en: "complete the new UI design", vi: "hoàn thành thiết kế giao diện mới" }],
                        sampleCasual: "It took our team nearly a month to finish the new interface design.",
                        sampleFormal: "It took our team almost a month to complete the new user interface design.",
                        keywords: ["took", "month", "team", "finish", "complete", "design"]
                    }
                ],
                struct_2: [
                    {
                        vi: "Bạn có phiền kiểm tra giúp tôi xem báo cáo này còn lỗi chính tả nào không?",
                        hints: [{ en: "checking this report", vi: "kiểm tra báo cáo này" }, { en: "any typos", vi: "lỗi chính tả nào" }],
                        sampleCasual: "Would you mind checking this report to see if there are any typos?",
                        sampleFormal: "Would you mind reviewing this report for any typographical errors?",
                        keywords: ["mind", "checking", "reviewing", "report"]
                    },
                    {
                        vi: "Bạn có phiền nếu chúng ta dời lịch hẹn sang sáng thứ Năm tuần sau không?",
                        hints: [{ en: "if we moved", vi: "nếu chúng ta dời (lùi thì)" }, { en: "next Thursday morning", vi: "sáng thứ Năm tuần sau" }],
                        sampleCasual: "Would you mind if we moved our appointment to next Thursday morning?",
                        sampleFormal: "Would you mind if we rescheduled our appointment to next Thursday morning?",
                        keywords: ["mind", "if we", "moved", "rescheduled", "thursday"]
                    }
                ],
                struct_3: [
                    {
                        vi: "Khóa học này không những cung cấp kiến thức thực tế mà còn giúp tôi tự tin hơn khi giao tiếp.",
                        hints: [{ en: "practical knowledge", vi: "kiến thức thực tế" }, { en: "more confident", vi: "tự tin hơn" }],
                        sampleCasual: "This course not only gives me practical knowledge, but it also makes me more confident.",
                        sampleFormal: "This course not only provides practical knowledge but also boosts my confidence in communication.",
                        keywords: ["not only", "course", "knowledge", "confident", "confidence"]
                    }
                ],
                struct_4: [
                    {
                        vi: "Trước đây tôi từng rất ngại nói tiếng Anh trước đám đông, nhưng giờ tôi đã quen với việc đó rồi.",
                        hints: [{ en: "used to be shy", vi: "từng rất ngại" }, { en: "used to speaking in public", vi: "quen với việc nói trước đám đông" }],
                        sampleCasual: "I used to be shy about speaking English in public, but I'm used to it now.",
                        sampleFormal: "I used to feel hesitant about speaking English in public, but I am accustomed to it now.",
                        keywords: ["used to", "english", "public"]
                    }
                ],
                struct_5: [
                    {
                        vi: "Dù lịch trình làm việc có dày đặc thế nào, bạn cũng nên dành 30 phút mỗi ngày để vận động.",
                        hints: [{ en: "No matter how packed your schedule is", vi: "Dù lịch trình dày đặc thế nào" }, { en: "work out / exercise", vi: "vận động" }],
                        sampleCasual: "No matter how packed your schedule is, you should spend 30 minutes a day exercising.",
                        sampleFormal: "No matter how demanding your schedule may be, you should dedicate 30 minutes daily to physical exercise.",
                        keywords: ["no matter how", "schedule", "30", "minutes"]
                    }
                ],
                struct_6: [
                    {
                        vi: "Tôi ước gì mình đã lưu file tài liệu trước khi máy tính bất ngờ bị sập nguồn.",
                        hints: [{ en: "I wish I had saved", vi: "Tôi ước gì mình đã lưu (quá khứ hoàn thành)" }, { en: "crashed / shut down", vi: "sập nguồn" }],
                        sampleCasual: "I wish I had saved the document before my computer suddenly crashed.",
                        sampleFormal: "I wish I had saved the document prior to the unexpected system shutdown.",
                        keywords: ["wish", "had", "saved", "computer", "document"]
                    }
                ]
            };

            const pool = variationPool[struct.id] || [];
            const existingVi = new Set(struct.situations.map(s => s.vi));
            const available = pool.filter(item => !existingVi.has(item.vi));

            if (available.length > 0) {
                return available[0];
            }

            const baseSituations = struct.situations;
            const randomBase = baseSituations[Math.floor(Math.random() * baseSituations.length)] || struct.situations[0];
            const cleanVi = randomBase.vi.replace(/(\[Biến thể mở rộng\]\s*|Trong công việc hàng ngày:\s*)+/gi, '').trim();

            return {
                vi: cleanVi,
                hints: randomBase.hints,
                sampleCasual: randomBase.sampleCasual,
                sampleFormal: randomBase.sampleFormal || randomBase.sampleCasual,
                keywords: randomBase.keywords
            };
        }

        // 5. TÍNH NĂNG TẠO CÂU MỚI BẰNG AI (HỖ TRỢ CẢ 2 CHẾ ĐỘ)
        async function generateNewQuestionWithAI() {
            const btn = document.getElementById('ai-generate-btn');
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-indigo-600"></i><span>Đang tạo...</span>`;

            if (state.practiceMode === 'structure') {
                const struct = SENTENCE_STRUCTURES.find(s => s.id === state.selectedStructureId);
                try {
                    const activeKey = (typeof window.getUserGeminiApiKey === "function") ? window.getUserGeminiApiKey() : apiKey;
                    if (!activeKey) {
                        throw new Error("Offline Mode");
                    }

                    const activeModel = localStorage.getItem("va_gemini_model") || "gemini-flash-lite-latest";
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(activeKey)}`;
                    const prompt = `Hãy tạo 1 tình huống luyện dịch mới từ tiếng Việt sang tiếng Anh áp dụng chính xác cấu trúc: "${struct.title}" (${struct.formula}).
Tình huống phải thực tế, tự nhiên cho người Việt, khác với các câu phổ thông. Trả về JSON gồm câu tiếng Việt, 3 từ khóa gợi ý, và 2 câu mẫu tiếng Anh (casual & formal) áp dụng cấu trúc này.`;

                    const payload = {
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: "OBJECT",
                                properties: {
                                    vi: { type: "STRING" },
                                    hints: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: { en: { type: "STRING" }, vi: { type: "STRING" } },
                                            required: ["en", "vi"]
                                        }
                                    },
                                    sampleCasual: { type: "STRING" },
                                    sampleFormal: { type: "STRING" },
                                    keywords: { type: "ARRAY", items: { type: "STRING" } }
                                },
                                required: ["vi", "hints", "sampleCasual", "sampleFormal", "keywords"]
                            }
                        }
                    };

                    const response = await fetchWithBackoff(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) throw new Error("AI Generate Failed");
                    const data = await response.json();
                    const generated = JSON.parse(data.candidates[0].content.parts[0].text);

                    const newSit = {
                        id: `${struct.id}_ai_${Date.now()}`,
                        context: `Tình huống ${struct.situations.length + 1} • Biến thể AI (${struct.shortName})`,
                        level: state.structLevelFilter === "all" ? "B1" : state.structLevelFilter,
                        ...generated
                    };

                    struct.situations.push(newSit);
                    state.currentSituationIndex = struct.situations.length - 1;
                    renderSituationStepper();
                    renderCurrentQuestion();
                    showToast("Đã tạo thêm tình huống mở rộng mới bằng AI!", "success");
                } catch (e) {
                    const localGen = buildLocalSmartVariation(struct);
                    const newSit = {
                        id: `${struct.id}_var_${Date.now()}`,
                        context: `Tình huống ${struct.situations.length + 1} • Biến thể mở rộng (${struct.shortName})`,
                        level: state.structLevelFilter === "all" ? "B1" : state.structLevelFilter,
                        ...localGen
                    };

                    struct.situations.push(newSit);
                    state.currentSituationIndex = struct.situations.length - 1;
                    renderSituationStepper();
                    renderCurrentQuestion();
                    showToast(`✨ Đã tạo Tình huống biến thể mới (#${struct.situations.length}) cho cấu trúc này!`, "success");
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                }
                return;
            }

            // Chế độ Chủ đề tự do cũ
            const topicKey = state.currentTopic === 'all' 
                ? ['daily', 'office', 'travel', 'interview'][Math.floor(Math.random() * 4)] 
                : state.currentTopic;
            const levelKey = state.currentLevel === 'all' ? 'B1' : state.currentLevel;

            const topicName = TOPIC_LABELS[topicKey];
            const levelName = LEVEL_LABELS[levelKey].text;

            try {
                const activeKey = (typeof window.getUserGeminiApiKey === "function") ? window.getUserGeminiApiKey() : apiKey;
                if (!activeKey) {
                    throw new Error("Offline Mode");
                }

                const activeModel = localStorage.getItem("va_gemini_model") || "gemini-flash-lite-latest";
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(activeKey)}`;
                const prompt = `Hãy tạo 1 bài tập luyện dịch câu từ tiếng Việt sang tiếng Anh thực tế, tự nhiên cho người Việt.
Chủ đề: ${topicName}
Cấp độ: ${levelName}
Yêu cầu trả về JSON gồm câu tiếng Việt tự nhiên (không sáo rỗng), 3 từ khóa/cụm từ gợi ý tiếng Anh đắt giá kèm nghĩa tiếng Việt, và 2 câu dịch mẫu (casual & formal).`;

                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                vi: { type: "STRING", description: "Câu tiếng Việt cần dịch" },
                                hints: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            en: { type: "STRING" },
                                            vi: { type: "STRING" }
                                        },
                                        required: ["en", "vi"]
                                    }
                                },
                                sampleCasual: { type: "STRING" },
                                sampleFormal: { type: "STRING" },
                                keywords: { type: "ARRAY", items: { type: "STRING" } }
                            },
                            required: ["vi", "hints", "sampleCasual", "sampleFormal", "keywords"]
                        }
                    }
                };

                const response = await fetchWithBackoff(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("AI Generate Failed");
                const data = await response.json();
                const generated = JSON.parse(data.candidates[0].content.parts[0].text);

                const newQuestion = {
                    id: 'ai_' + Date.now(),
                    topic: topicKey,
                    level: levelKey,
                    ...generated
                };

                EXERCISE_BANK.unshift(newQuestion);
                state.filteredList.unshift(newQuestion);
                state.currentIndex = 0;
                renderCurrentQuestion();
                showToast("Đã tạo câu luyện dịch mới bằng AI!", "success");

            } catch (err) {
                const newQuestion = {
                    id: 'var_' + Date.now(),
                    topic: topicKey,
                    level: levelKey,
                    vi: "Bạn có thể gửi cho tôi bản tóm tắt nội dung cuộc họp sáng nay trước 5 giờ chiều được không?",
                    hints: [{ en: "meeting summary", vi: "bản tóm tắt cuộc họp" }, { en: "by 5 PM", vi: "trước 5 giờ chiều" }],
                    sampleCasual: "Could you send me a quick summary of this morning's meeting by 5 PM?",
                    sampleFormal: "Would you please send me the summary of this morning's meeting prior to 5:00 PM?",
                    keywords: ["send", "summary", "meeting", "morning"]
                };
                EXERCISE_BANK.unshift(newQuestion);
                state.filteredList.unshift(newQuestion);
                state.currentIndex = 0;
                renderCurrentQuestion();
                showToast("✨ Đã tạo câu biến thể luyện dịch mới!", "success");
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        }


        // 6. PHÁT ÂM CHUẨN ANH-MỸ (WEB SPEECH API)
        function speakText(text, btnElement, customRate = 0.95) {
            if (!('speechSynthesis' in window)) {
                showToast("Trình duyệt của bạn không hỗ trợ đọc phát âm.", "warning");
                return;
            }

            // Dừng câu đang đọc trước đó
            window.speechSynthesis.cancel();
            document.querySelectorAll('.speaking-btn').forEach(el => el.classList.remove('speaking-btn'));

            const cleanText = text.replace(/^["']|["']$/g, '').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'en-US';
            utterance.rate = customRate; // Hỗ trợ tốc độ thường (0.95) và chậm (0.7)

            // Ưu tiên chọn giọng en-US tự nhiên nếu có
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) 
                                || voices.find(v => v.lang.startsWith('en-US'));
            if (preferredVoice) utterance.voice = preferredVoice;

            if (btnElement) {
                btnElement.classList.add('speaking-btn');
                utterance.onend = () => btnElement.classList.remove('speaking-btn');
                utterance.onerror = () => btnElement.classList.remove('speaking-btn');
            }

            window.speechSynthesis.speak(utterance);
        }

    // ==================== HỆ THỐNG LUYỆN NÓI & CHẤM ĐIỂM PHÁT ÂM TỪNG TỪ ====================
        let speechRecognizer = null;
        let isRecordingSpeech = false;
        let mediaRecorder = null;
        let audioChunks = [];
        let recordedAudioUrl = null;

        // 1. Tách câu chuẩn thành từng thẻ từ kèm phiên âm IPA bên dưới (giống thẻ màu hồng/trắng trong ảnh)
        function renderWordByWordIPA(sentence) {
            const container = document.getElementById('word-by-word-ipa-box');
            if (!container || !sentence) return;

            const cleanSentence = sentence.replace(/^["']|["']$/g, '').trim();
            const tokens = cleanSentence.split(/\s+/);

            container.innerHTML = tokens.map(token => {
                const puncMatch = token.match(/^([^a-zA-Z0-9']*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9']*)$/);
                const coreWord = puncMatch ? puncMatch[2].toLowerCase() : token.toLowerCase();
                const wordIpa = IPA_DICT[coreWord] || fallbackWordToIPA(coreWord);
                const safeSpeak = coreWord.replace(/'/g, "\\'");

                return `
                    <div onclick="speakText('${safeSpeak}', null, 0.9)" class="cursor-pointer group bg-white hover:bg-indigo-50 border border-indigo-200/80 hover:border-indigo-400 px-3 py-2 rounded-xl text-center shadow-2xs transition-all select-none" title="Bấm để nghe phát âm từ '${token}'">
                        <div class="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-700">${token}</div>
                        <div class="text-[11px] font-mono text-slate-400 group-hover:text-indigo-500 mt-0.5">/${wordIpa}/</div>
                    </div>
                `;
            }).join('');
        }

        function resetSpeechEvalPanel() {
            const panel = document.getElementById('speech-eval-panel');
            if (panel) panel.classList.add('hidden');
            if (isRecordingSpeech) stopSpeechPractice();
        }

        let recordedAudioMime = '';
        let lastRecognizedTranscript = '';
        let activeReplayPlayer = null;

        // Chọn định dạng âm thanh tương thích với iPhone (iOS Safari) và Android/PC
        function getSupportedAudioMimeType() {
            if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
            const candidates = [
                'audio/mp4',
                'audio/aac',
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus'
            ];
            for (const mime of candidates) {
                if (MediaRecorder.isTypeSupported(mime)) return mime;
            }
            return '';
        }

        // 2. Bật / Tắt chế độ Đọc thử (Thu âm + Nhận diện giọng nói cùng lúc, tương thích iPhone iOS)
        async function toggleSpeechPractice() {
            if (isRecordingSpeech) {
                stopSpeechPractice();
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                showToast("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Hãy mở bằng Chrome hoặc Safari nhé!", "warning");
                return;
            }

            const targetSentence = document.getElementById('standard-target-sentence').innerText.trim();
            if (!targetSentence) return;

            // Chuẩn bị giao diện đang nghe
            isRecordingSpeech = true;
            lastRecognizedTranscript = "";
            const btn = document.getElementById('practice-speak-btn');
            const icon = document.getElementById('practice-speak-icon');
            const text = document.getElementById('practice-speak-text');
            const panel = document.getElementById('speech-eval-panel');

            btn.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-md animate-pulse transition-all";
            icon.className = "fa-solid fa-stop";
            text.innerText = "ĐANG NGHE... (BẤM ĐỂ DỪNG)";
            panel.classList.remove('hidden');
            document.getElementById('speech-heard-text').innerText = "Đang lắng nghe bạn đọc câu tiếng Anh...";

            // Khởi động thu âm giọng thật bằng MediaRecorder (Chuẩn MIME cho iPhone/iOS)
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioChunks = [];
                    recordedAudioMime = getSupportedAudioMimeType();
                    mediaRecorder = recordedAudioMime
                        ? new MediaRecorder(stream, { mimeType: recordedAudioMime })
                        : new MediaRecorder(stream);

                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) audioChunks.push(e.data);
                    };
                    mediaRecorder.onstop = () => {
                        const actualMime = (mediaRecorder && mediaRecorder.mimeType) || recordedAudioMime || 'audio/mp4';
                        if (audioChunks.length > 0) {
                            const audioBlob = new Blob(audioChunks, { type: actualMime });
                            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
                            recordedAudioUrl = URL.createObjectURL(audioBlob);
                        }
                        const replayBtn = document.getElementById('replay-record-btn');
                        if (replayBtn) replayBtn.classList.remove('hidden');
                        stream.getTracks().forEach(track => track.stop());
                    };
                    // Truyền timeslice 250ms để Safari iOS liên tục đẩy dữ liệu âm thanh vào audioChunks
                    mediaRecorder.start(250);
                }
            } catch (err) {
                console.warn("Thiết bị ưu tiên dùng mic cho SpeechRecognition:", err);
                const replayBtn = document.getElementById('replay-record-btn');
                if (replayBtn) replayBtn.classList.remove('hidden');
            }

            // Khởi động nhận diện chữ tiếng Anh
            speechRecognizer = new SpeechRecognition();
            speechRecognizer.lang = 'en-US';
            speechRecognizer.interimResults = true;
            speechRecognizer.continuous = false;

            speechRecognizer.onresult = (event) => {
                let transcript = "";
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                lastRecognizedTranscript = transcript.trim();
                const replayBtn = document.getElementById('replay-record-btn');
                if (replayBtn) replayBtn.classList.remove('hidden');
                gradeSpokenSentence(targetSentence, transcript);
            };

            speechRecognizer.onerror = () => {
                stopSpeechPractice();
            };

            speechRecognizer.onend = () => {
                stopSpeechPractice();
            };

            speechRecognizer.start();
        }

        function stopSpeechPractice() {
            isRecordingSpeech = false;
            const btn = document.getElementById('practice-speak-btn');
            const icon = document.getElementById('practice-speak-icon');
            const text = document.getElementById('practice-speak-text');

            if (btn) {
                btn.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/90 hover:border-rose-300 text-xs font-extrabold shadow-2xs transition-all";
                icon.className = "fa-solid fa-microphone text-rose-500";
                text.innerText = "ĐỌC LẠI";
            }

            if (speechRecognizer) {
                try { speechRecognizer.stop(); } catch (e) {}
            }
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                try { mediaRecorder.stop(); } catch (e) {}
            }
        }

        // Phát lại giọng người học (Tương thích iPhone Safari + Dự phòng đọc lại câu vừa nhận diện nếu iOS khóa mic kép)
        function replayUserVoice() {
            const replayBtn = document.getElementById('replay-record-btn');
            if (recordedAudioUrl) {
                try {
                    if (activeReplayPlayer) {
                        activeReplayPlayer.pause();
                        activeReplayPlayer.currentTime = 0;
                    }
                    activeReplayPlayer = new Audio(recordedAudioUrl);
                    activeReplayPlayer.playsInline = true;
                    const playPromise = activeReplayPlayer.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // Dự phòng nếu Safari chặn blob hoặc mic kép bị rỗng trên iOS
                            const fallbackText = lastRecognizedTranscript || document.getElementById('standard-target-sentence')?.innerText || '';
                            if (fallbackText) speakText(fallbackText, replayBtn, 0.9);
                        });
                    }
                    return;
                } catch (e) {
                    console.warn("Lỗi phát file ghi âm trên iOS, chuyển sang đọc lại:", e);
                }
            }

            // Nếu iOS chặn thu âm đồng thời lúc nhận diện giọng nói -> Đọc lại câu hệ thống vừa nghe được từ bạn
            const fallbackText = lastRecognizedTranscript || document.getElementById('standard-target-sentence')?.innerText || '';
            if (fallbackText) {
                speakText(fallbackText, replayBtn, 0.9);
            } else {
                showToast("Chưa có dữ liệu ghi âm. Bạn hãy bấm ĐỌC LẠI nhé!", "info");
            }
        }

        // 3. Thuật toán tính khoảng cách chữ (Levenshtein) và chấm % cho từng từ
        function calcWordSimilarity(w1, w2) {
            if (w1 === w2) return 100;
            if (!w1 || !w2) return 0;
            const m = w1.length, n = w2.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let i = 0; i <= m; i++) dp[i][0] = i;
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    const cost = w1[i - 1] === w2[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
                }
            }
            const distance = dp[m][n];
            return Math.max(0, Math.round((1 - distance / Math.max(m, n)) * 100));
        }

        function gradeSpokenSentence(targetSentence, spokenTranscript) {
            const cleanHeard = spokenTranscript.toLowerCase().replace(/[.,?!;:"']/g, '').trim();
            document.getElementById('speech-heard-text').innerText = `"${cleanHeard}"`;

            const targetTokens = targetSentence.replace(/^["']|["']$/g, '').trim().split(/\s+/);
            const spokenWords = cleanHeard.split(/\s+/).filter(Boolean);
            const usedIndices = new Set();

            let totalScoreSum = 0;

            const cardsHTML = targetTokens.map(token => {
                const cleanTargetWord = token.toLowerCase().replace(/[^a-z0-9']/g, '');
                let bestScore = 0;
                let bestIdx = -1;

                spokenWords.forEach((sw, idx) => {
                    if (usedIndices.has(idx)) return;
                    const sim = calcWordSimilarity(cleanTargetWord, sw);
                    if (sim > bestScore) {
                        bestScore = sim;
                        bestIdx = idx;
                    }
                });

                if (bestScore >= 60 && bestIdx !== -1) {
                    usedIndices.add(bestIdx);
                } else if (bestScore < 50) {
                    bestScore = 0;
                }

                totalScoreSum += bestScore;

                // Phân màu: >=80% Xanh lá, 50-79% Vàng cam, <50% Đỏ
                let boxStyle = "bg-emerald-50 border-emerald-200 text-emerald-800";
                let pctColor = "text-emerald-600";
                if (bestScore < 50) {
                    boxStyle = "bg-rose-50 border-rose-200 text-rose-700";
                    pctColor = "text-rose-500";
                } else if (bestScore < 80) {
                    boxStyle = "bg-amber-50 border-amber-200 text-amber-800";
                    pctColor = "text-amber-600";
                }

                return `
                    <div class="text-center">
                        <div class="px-3 py-1.5 rounded-xl border font-extrabold text-xs sm:text-sm ${boxStyle}">
                            ${cleanTargetWord}
                        </div>
                        <div class="text-[10px] font-extrabold ${pctColor} mt-1">${bestScore}%</div>
                    </div>
                `;
            }).join('');

            document.getElementById('speech-word-scores').innerHTML = cardsHTML;

            const overallPercent = targetTokens.length > 0 ? Math.round(totalScoreSum / targetTokens.length) : 0;
            const totalPctEl = document.getElementById('speech-total-percent');
            const totalBarEl = document.getElementById('speech-total-bar');

            totalPctEl.innerText = `${overallPercent}%`;
            totalBarEl.style.width = `${overallPercent}%`;
            totalPctEl.className = overallPercent >= 80
                ? "text-2xl sm:text-3xl font-extrabold text-emerald-600"
                : overallPercent >= 50
                    ? "text-2xl sm:text-3xl font-extrabold text-amber-500"
                    : "text-2xl sm:text-3xl font-extrabold text-rose-600";

            if (overallPercent >= 80 && typeof awardSpeakingPracticeXP === 'function') {
                const activeQ = (typeof getActiveQuestionObject === 'function') ? getActiveQuestionObject() : null;
                awardSpeakingPracticeXP(activeQ, overallPercent);
            }
        }

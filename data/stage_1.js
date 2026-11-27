/**
 * DỮ LIỆU CHẶNG 1: KHỞI ĐỘNG & GIỚI THIỆU BẢN THÂN (data/stage_1.js)
 * Gồm: 5 Trạm ngữ pháp chuẩn A1 (75 tình huống) + 50 từ vựng trọng tâm.
 * Đăng ký tự động qua window.VA_DATA_REGISTRY.registerStage('stage_1', ...)
 */

if (window.VA_DATA_REGISTRY && typeof window.VA_DATA_REGISTRY.registerStage === 'function') {
    window.VA_DATA_REGISTRY.registerStage('stage_1', {
        title: 'Chặng 1: Khởi động & Giới thiệu bản thân',
        structures: [
    {
        "id": "struct_be_am_a1",
        "number": 1,
        "stageId": "stage_1",
        "stage": "Chặng 1: Khởi động & Giới thiệu bản thân",
        "orderInStage": 1,
        "level": "A1",
        "topics": [
            "daily",
            "office",
            "travel",
            "interview",
            "food_shop"
        ],
        "title": "Động từ To be (am / is / are) — Tên, nghề nghiệp & quốc tịch",
        "shortName": "To be (am/is/are)",
        "formula": "(+) S + am/is/are + N/Adj  |  (-) S + am not/isn't/aren't + N/Adj  |  (?) Am/Is/Are + S + ...?",
        "description": "Làm quen với động từ To be ở thì hiện tại đơn để giới thiệu tên gọi, nghề nghiệp và xuất xứ quốc tịch trong giao tiếp căn bản.",
        "tips": [
            "• I đi với am (dạng rút gọn: I'm)",
            "• He, She, It, Danh từ số ít đi với is (rút gọn: 's; phủ định: isn't)",
            "• You, We, They, Danh từ số nhiều đi với are (rút gọn: 're; phủ định: aren't)"
        ],
        "requiredPatterns": [
            "am",
            "is",
            "are",
            "'m",
            "'s",
            "'re",
            "isn't",
            "aren't"
        ],
        "situations": [
            {
                "context": "Tình huống 1/15 • Giới thiệu bản thân trong buổi gặp đầu tiên",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Câu giới thiệu bản thân đơn giản với tên và nghề nghiệp cấp A1",
                "vi": "Chào bạn, mình là Linh và mình là giáo viên.",
                "sampleCasual": "Hi, I'm Linh and I'm a teacher.",
                "sampleFormal": "Hello, my name is Linh and I am a teacher.",
                "ipa": "/haɪ aɪm lɪŋ ænd aɪm ə ˈtiːtʃər/",
                "grammarHint": "Dùng 'I'm' (viết tắt của I am) kèm mạo từ 'a' trước nghề nghiệp số ít.",
                "keywords": [
                    "hi",
                    "teacher",
                    "and"
                ],
                "hints": [
                    {
                        "en": "teacher",
                        "vi": "giáo viên"
                    },
                    {
                        "en": "I'm",
                        "vi": "mình là"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Đầy đủ",
                        "en": "Hi, I am Linh and I am a teacher.",
                        "speakable": "Hi, I am Linh and I am a teacher."
                    }
                ],
                "id": "sit_be_am_a1_01",
                "aiExplanation": {
                    "context_summary": "Câu chào hỏi và giới thiệu tên kèm nghề nghiệp cực kỳ phổ biến trong lần gặp đầu tiên.",
                    "grammar_points": [
                        "Chủ ngữ 'I' đi với động từ To be 'am' (rút gọn tự nhiên thành 'I'm').",
                        "Trước danh từ chỉ nghề nghiệp số ít ('teacher') bắt buộc phải có mạo từ 'a' (a teacher)."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Hi, my name is Linh and I work as a teacher.",
                            "note_vi": "Trang trọng hơn một chút, nhấn mạnh công việc hiện tại."
                        },
                        {
                            "en": "Hey, I'm Linh. I'm a teacher.",
                            "note_vi": "Tách thành 2 câu ngắn, rất tự nhiên trong giao tiếp đời thường."
                        }
                    ],
                    "pro_tip": "Người Việt hay quên mạo từ 'a/an' trước nghề nghiệp (viết nhầm thành 'I'm teacher'). Hãy luôn nhớ: 'I'm a teacher'."
                }
            },
            {
                "context": "Tình huống 2/15 • Giới thiệu quốc tịch khi làm thủ tục khách sạn",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "travel",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Giới thiệu quốc tịch cá nhân bằng cấu trúc to be quen thuộc",
                "vi": "Tôi là người Việt Nam và đây là bạn tôi.",
                "sampleCasual": "I'm Vietnamese and this is my friend.",
                "sampleFormal": "I am Vietnamese and this is my friend.",
                "ipa": "/aɪm ˌvjɛtnəˈmiːz ænd ðɪs ɪz maɪ frɛnd/",
                "grammarHint": "Dùng 'I'm' với tính từ chỉ quốc tịch 'Vietnamese' và 'this is' để giới thiệu người khác.",
                "keywords": [
                    "vietnamese",
                    "friend",
                    "this"
                ],
                "hints": [
                    {
                        "en": "Vietnamese",
                        "vi": "người Việt Nam"
                    },
                    {
                        "en": "friend",
                        "vi": "bạn bè"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Trang trọng",
                        "en": "I am Vietnamese and this is my companion.",
                        "speakable": "I am Vietnamese and this is my companion."
                    }
                ],
                "id": "sit_be_am_a1_02",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu quốc tịch của mình và giới thiệu người đi cùng khi du lịch hoặc gặp bạn mới.",
                    "grammar_points": [
                        "Cấu trúc 'I'm + tính từ chỉ quốc tịch' (Vietnamese) không cần dùng mạo từ 'a' phía trước.",
                        "Dùng 'this is + [người]' để giới thiệu một người đang đứng ngay cạnh bạn."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I'm from Vietnam and this is my friend.",
                            "note_vi": "Dùng 'from + tên nước' (from Vietnam) rất phổ biến và dễ nhớ."
                        },
                        {
                            "en": "I am Vietnamese, and this is my friend.",
                            "note_vi": "Dạng đầy đủ, lịch sự hơn khi làm thủ tục khách sạn."
                        }
                    ],
                    "pro_tip": "Tên quốc tịch (Vietnamese, Japanese, American) luôn viết hoa chữ cái đầu và không thêm 'a' nếu đứng một mình sau To be."
                }
            },
            {
                "context": "Tình huống 3/15 • Giới thiệu đồng nghiệp mới tại văn phòng",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "office",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Câu đơn giản giới thiệu nghề nghiệp người thứ ba",
                "vi": "Anh ấy là kỹ sư mới trong công ty.",
                "sampleCasual": "He's a new engineer in our office.",
                "sampleFormal": "He is a new engineer in our company.",
                "ipa": "/hiːz ə nuː ˌɛndʒəˈnɪr ɪn ˈaʊər ˈɔːfɪs/",
                "grammarHint": "Chủ ngữ ngôi thứ ba số ít 'He' đi cùng 'is' (dạng rút gọn là 'He's'). Chú ý mạo từ 'an' nếu không có tính từ 'new'.",
                "keywords": [
                    "new",
                    "engineer",
                    "office"
                ],
                "hints": [
                    {
                        "en": "engineer",
                        "vi": "kỹ sư"
                    },
                    {
                        "en": "office",
                        "vi": "văn phòng"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Đầy đủ",
                        "en": "He is a new engineer here.",
                        "speakable": "He is a new engineer here."
                    }
                ],
                "id": "sit_be_am_a1_03",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu một đồng nghiệp nam mới gia nhập văn phòng.",
                    "grammar_points": [
                        "Chủ ngữ ngôi thứ 3 số ít 'He' đi với 'is' (rút gọn: 'He's').",
                        "Dùng 'a new engineer' (vì 'new' bắt đầu bằng phụ âm /n/), nhưng nếu bỏ 'new' phải đổi thành 'an engineer'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He's the new engineer in our office.",
                            "note_vi": "Dùng 'the' nếu văn phòng chỉ có duy nhất một kỹ sư mới đó."
                        },
                        {
                            "en": "He just joined our company as an engineer.",
                            "note_vi": "Cách nói tự nhiên hơn trong môi trường công sở."
                        }
                    ],
                    "pro_tip": "Chú ý sự thay đổi của mạo từ: 'an engineer' (nguyên âm) nhưng 'a new engineer' (phụ âm)."
                }
            },
            {
                "context": "Tình huống 4/15 • Nói về xuất thân của bạn cùng nhóm",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Chủ ngữ She đi với to be cơ bản chỉ quốc tịch",
                "vi": "Cô ấy là người Nhật và rất thân thiện.",
                "sampleCasual": "She's Japanese and she is very friendly.",
                "sampleFormal": "She is Japanese and she is very friendly.",
                "ipa": "/ʃiːz ˌdʒæpəˈniːz ænd ʃiː ɪz ˈvɛri ˈfrɛndli/",
                "grammarHint": "Dùng 'She's' (She is) đi với tên quốc tịch hoặc tính từ miêu tả tính cách.",
                "keywords": [
                    "japanese",
                    "very",
                    "friendly"
                ],
                "hints": [
                    {
                        "en": "Japanese",
                        "vi": "người Nhật"
                    },
                    {
                        "en": "friendly",
                        "vi": "thân thiện"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Gọn gàng",
                        "en": "She's Japanese and very friendly.",
                        "speakable": "She's Japanese and very friendly."
                    }
                ],
                "id": "sit_be_am_a1_04",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu quốc tịch và khen ngợi tính cách của một người bạn nữ.",
                    "grammar_points": [
                        "Chủ ngữ 'She' đi với 'is' (rút gọn: 'She's').",
                        "Động từ To be nối trực tiếp với tính từ chỉ quốc tịch ('Japanese') và tính từ chỉ tính cách ('friendly')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "She's Japanese and very friendly.",
                            "note_vi": "Lược bỏ 'she is' lặp lại giúp câu gọn và tự nhiên hơn."
                        },
                        {
                            "en": "She's from Japan and she's super friendly.",
                            "note_vi": "Thân mật, giàu cảm xúc hơn trong văn nói."
                        }
                    ],
                    "pro_tip": "'friendly' có đuôi '-ly' nhưng là TÍNH TỪ (không phải trạng từ), nên đi trực tiếp sau động từ To be ('she is friendly')."
                }
            },
            {
                "context": "Tình huống 5/15 • Phỏng vấn giới thiệu vai trò của nhóm",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "interview",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Chủ ngữ số nhiều We đi với are chỉ nghề nghiệp",
                "vi": "Chúng tôi là sinh viên trường đại học quốc gia.",
                "sampleCasual": "We're students at the state university.",
                "sampleFormal": "We are students at the state university.",
                "ipa": "/wɪər ˈstuːdənts æt ðə steɪt ˌjuːnəˈvɜːrsəti/",
                "grammarHint": "Chủ ngữ số nhiều 'We' đi với 'are' (rút gọn: We're), danh từ số nhiều thêm 's'.",
                "keywords": [
                    "students",
                    "state",
                    "university"
                ],
                "hints": [
                    {
                        "en": "students",
                        "vi": "học sinh/sinh viên"
                    },
                    {
                        "en": "university",
                        "vi": "trường đại học"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Đầy đủ",
                        "en": "We are students here.",
                        "speakable": "We are students here."
                    }
                ],
                "id": "sit_be_am_a1_05",
                "aiExplanation": {
                    "context_summary": "Dùng khi giới thiệu vai trò của cả nhóm là sinh viên trong buổi gặp gỡ hoặc phỏng vấn.",
                    "grammar_points": [
                        "Chủ ngữ số nhiều 'We' đi với 'are' (rút gọn: 'We're').",
                        "Vì chủ ngữ là số nhiều ('We') nên danh từ nghề nghiệp 'student' phải thêm '-s' thành 'students' và bỏ 'a'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We're university students.",
                            "note_vi": "Ngắn gọn, tự nhiên khi giới thiệu chung."
                        },
                        {
                            "en": "We study at the national university.",
                            "note_vi": "Dùng động từ thường 'study' thay cho To be."
                        }
                    ],
                    "pro_tip": "Nhớ khớp số ít/số nhiều: 'I'm a student' (số ít có 'a'), nhưng 'We're students' (số nhiều bỏ 'a' và thêm '-s')."
                }
            },
            {
                "context": "Tình huống 6/15 • Đính chính thông tin nghề nghiệp trong cuộc nói chuyện",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "negative",
                "cefrReason": "Phủ định isn't với nghề nghiệp ở cấp độ căn bản A1",
                "vi": "Anh ấy không phải là bác sĩ, anh ấy là y tá.",
                "sampleCasual": "He isn't a doctor, he's a nurse.",
                "sampleFormal": "He is not a doctor, he is a nurse.",
                "ipa": "/hiː ˈɪzənt ə ˈdɑːktər hiːz ə nɜːrs/",
                "grammarHint": "Thể phủ định của is là 'is not' hoặc 'isn't', dùng 'a' trước danh từ nghề nghiệp.",
                "keywords": [
                    "doctor",
                    "nurse"
                ],
                "hints": [
                    {
                        "en": "doctor",
                        "vi": "bác sĩ"
                    },
                    {
                        "en": "nurse",
                        "vi": "y tá"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Phủ định tách rời",
                        "en": "He is not a doctor, he is a nurse.",
                        "speakable": "He is not a doctor, he is a nurse."
                    }
                ],
                "id": "sit_be_am_a1_06",
                "aiExplanation": {
                    "context_summary": "Dùng để đính chính nhẹ nhàng khi người nghe hiểu nhầm nghề nghiệp của ai đó.",
                    "grammar_points": [
                        "Thể phủ định của 'is' là 'is not' hoặc rút gọn 'isn't'.",
                        "Cả hai danh từ nghề nghiệp số ít ('doctor', 'nurse') đều cần mạo từ 'a' phía trước."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He's not a doctor; he's a nurse.",
                            "note_vi": "Cách rút gọn 'He's not' cũng cực kỳ phổ biến trong văn nói."
                        },
                        {
                            "en": "Actually, he's a nurse, not a doctor.",
                            "note_vi": "Thêm 'Actually' (Thực ra thì) giúp lời đính chính mềm mại hơn."
                        }
                    ],
                    "pro_tip": "Tránh nói 'He no doctor' hoặc 'He doesn't a doctor'. Phủ định của To be chỉ cần thêm 'not' ngay sau 'is'."
                }
            },
            {
                "context": "Tình huống 7/15 • Hỏi thông tin khách du lịch tại sân bay",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "travel",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi Yes/No đảo to be 'Are you' cơ bản A1",
                "vi": "Bạn có phải là khách du lịch đến từ Mỹ không?",
                "sampleCasual": "Are you a tourist from the US?",
                "sampleFormal": "Are you a tourist from the United States?",
                "ipa": "/ɑːr juː ə ˈtʊrɪst frəm ðə juː ˈɛs/",
                "grammarHint": "Đảo 'Are' lên đầu câu hỏi trước chủ ngữ 'you'.",
                "keywords": [
                    "tourist",
                    "from"
                ],
                "hints": [
                    {
                        "en": "tourist",
                        "vi": "khách du lịch"
                    },
                    {
                        "en": "from",
                        "vi": "đến từ"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Hỏi quốc tịch",
                        "en": "Are you American?",
                        "speakable": "Are you American?"
                    }
                ],
                "id": "sit_be_am_a1_07",
                "aiExplanation": {
                    "context_summary": "Câu hỏi lịch sự khi gặp người nước ngoài ở sân bay, điểm tham quan hoặc khách sạn để làm quen.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với To be: đảo 'Are' lên trước chủ ngữ 'you' ('Are you...?').",
                        "Tên nước dạng liên bang như 'the US' hoặc 'the United States' luôn có mạo từ 'the' phía trước."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are you visiting from the US?",
                            "note_vi": "Tự nhiên hơn, nhấn mạnh việc đang đi du lịch thăm thú."
                        },
                        {
                            "en": "Are you American?",
                            "note_vi": "Ngắn gọn, hỏi thẳng quốc tịch."
                        }
                    ],
                    "pro_tip": "Tránh dịch word-by-word thành 'Are you a tourist come from America?'. Chỉ cần dùng gọn 'from the US'."
                }
            },
            {
                "context": "Tình huống 8/15 • Xác nhận vai trò của một nhóm đối tác trong phòng họp",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "office",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi số nhiều với Are they và câu trả lời phủ định",
                "vi": "Họ là quản lý à? Không, họ không phải.",
                "sampleCasual": "Are they managers? No, they aren't.",
                "sampleFormal": "Are they managers? No, they are not.",
                "ipa": "/ɑːr ðeɪ ˈmænədʒərz noʊ ðeɪ ˈɑːrənt/",
                "grammarHint": "Đảo 'Are' lên đầu câu hỏi với 'they'; câu trả lời ngắn phủ định dùng 'No, they aren't'.",
                "keywords": [
                    "managers",
                    "no"
                ],
                "hints": [
                    {
                        "en": "managers",
                        "vi": "những người quản lý"
                    },
                    {
                        "en": "they aren't",
                        "vi": "họ không phải"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Rút gọn",
                        "en": "Are they the managers? No, they are not.",
                        "speakable": "Are they the managers? No, they are not."
                    }
                ],
                "id": "sit_be_am_a1_08",
                "aiExplanation": {
                    "context_summary": "Dùng để xác nhận chức vụ của một nhóm người trong cuộc họp hoặc sự kiện công ty.",
                    "grammar_points": [
                        "Câu hỏi Yes/No số nhiều: đảo 'Are' lên trước 'they' ('Are they managers?').",
                        "Trả lời ngắn phủ định: 'No, they aren't.' (lịch sự và chuẩn ngữ pháp hơn là chỉ nói cộc lốc 'No')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are they the managers? No, they're not.",
                            "note_vi": "Dạng rút gọn 'they're not' rất tự nhiên khi nói."
                        },
                        {
                            "en": "Are they in management? No, they aren't.",
                            "note_vi": "Cách nói chuyên nghiệp hơn trong môi trường công sở."
                        }
                    ],
                    "pro_tip": "Không viết tắt câu trả lời khẳng định ngắn ('Yes, they are' — KHÔNG viết 'Yes, they're'), nhưng câu phủ định ngắn thì rất hay viết tắt ('No, they aren't')."
                }
            },
            {
                "context": "Tình huống 9/15 • Hỏi về món ăn trong nhà hàng",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "food_shop",
                "tense": "present",
                "form": "question",
                "cefrReason": "Sử dụng cấu trúc S+be+N cơ bản với từ vựng thông dụng về đồ ăn.",
                "vi": "Đây có phải là món súp nóng không?",
                "sampleCasual": "Is this hot soup?",
                "sampleFormal": "Is this hot soup?",
                "ipa": "/ɪz ðɪs hɒt suːp/",
                "grammarHint": "Dùng 'Is' ở đầu câu để đặt câu hỏi Yes/No với danh từ.",
                "keywords": [
                    "is",
                    "this",
                    "hot",
                    "soup"
                ],
                "hints": [
                    {
                        "en": "Is this...",
                        "vi": "Đây có phải là..."
                    },
                    {
                        "en": "hot soup",
                        "vi": "súp nóng"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "Is that hot soup?",
                        "speakable": "Is that hot soup?"
                    }
                ],
                "id": "sit_be_am_a1_09",
                "aiExplanation": {
                    "context_summary": "Câu hỏi ngắn gọn, thực tế khi gọi món hoặc kiểm tra đồ ăn tại nhà hàng.",
                    "grammar_points": [
                        "Đảo 'Is' lên trước 'this' để tạo câu hỏi Yes/No cho 1 món vật/đồ ăn ngay trước mặt.",
                        "'soup' là danh từ không đếm được nên không dùng mạo từ 'a' trước 'hot soup'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is this soup hot?",
                            "note_vi": "Hỏi xem bát súp này có đang nóng không (nhấn mạnh nhiệt độ)."
                        },
                        {
                            "en": "Is this a hot soup?",
                            "note_vi": "Dùng khi muốn hỏi đây có phải loại món súp ăn nóng không."
                        }
                    ],
                    "pro_tip": "Phân biệt sắc thái: 'Is this hot soup?' (Đây có phải món súp nóng không?) vs. 'Is this soup hot?' (Súp này có nóng không?)."
                }
            },
            {
                "context": "Tình huống 10/15 • Phủ định về nghề nghiệp của người quen",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "negative",
                "cefrReason": "Sử dụng phủ định 'isn't' với danh từ chỉ nghề nghiệp đơn giản.",
                "vi": "Anh ấy không phải là đầu bếp của nhà hàng này.",
                "sampleCasual": "He isn't the chef here.",
                "sampleFormal": "He is not the chef here.",
                "ipa": "/hi ˈɪznt ðə ʃef hɪər/",
                "grammarHint": "Dùng 'isn't' (is not) để phủ định danh từ.",
                "keywords": [
                    "he",
                    "isn't",
                    "chef",
                    "here"
                ],
                "hints": [
                    {
                        "en": "He isn't",
                        "vi": "Anh ấy không phải là"
                    },
                    {
                        "en": "the chef",
                        "vi": "đầu bếp"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "He is not the cook here.",
                        "speakable": "He is not the cook here."
                    }
                ],
                "id": "sit_be_am_a1_10",
                "aiExplanation": {
                    "context_summary": "Dùng để đính chính vai trò của một người tại nhà hàng.",
                    "grammar_points": [
                        "Phủ định với chủ ngữ 'He': 'He isn't' (hoặc 'He is not').",
                        "Dùng 'the chef' vì đang nói tới vị trí đầu bếp cụ thể của nhà hàng này."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He's not the chef here.",
                            "note_vi": "Cách rút gọn rất phổ biến trong văn nói hàng ngày."
                        },
                        {
                            "en": "He doesn't work as the chef here.",
                            "note_vi": "Dùng động từ thường để diễn đạt rõ nghĩa hơn."
                        }
                    ],
                    "pro_tip": "Chú ý phát âm 'chef' là /ʃef/ (âm 'sh' nặng giống 'she'), không đọc là /tʃef/."
                }
            },
            {
                "context": "Tình huống 11/15 • Giới thiệu bạn mới tại quán cà phê",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Câu ghép đơn giản giới thiệu tên và quốc tịch.",
                "vi": "Đây là Mary, cô ấy là người Anh và là bạn tôi.",
                "sampleCasual": "This is Mary, she's British and my friend.",
                "sampleFormal": "This is Mary, she is British and my friend.",
                "ipa": "/ðɪs ɪz ˈmeəri, ʃiːz ˈbrɪtɪʃ ænd maɪ frend/",
                "grammarHint": "Kết hợp hai mệnh đề với 'and'.",
                "keywords": [
                    "this",
                    "she",
                    "British",
                    "friend"
                ],
                "hints": [
                    {
                        "en": "This is...",
                        "vi": "Đây là..."
                    },
                    {
                        "en": "she's British",
                        "vi": "cô ấy là người Anh"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "Meet Mary, she is British and my friend.",
                        "speakable": "Meet Mary, she is British and my friend."
                    }
                ],
                "id": "sit_be_am_a1_11",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu bạn mới kèm tên và quốc tịch trong buổi gặp gỡ thân mật.",
                    "grammar_points": [
                        "Dùng 'This is + [tên]' để giới thiệu người đứng cạnh mình.",
                        "Chủ ngữ 'she' đi với 'is' (rút gọn 'she's') nối với quốc tịch 'British' và mối quan hệ 'my friend'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "This is my friend Mary. She's from the UK.",
                            "note_vi": "Tách 2 câu ngắn giúp người nghe dễ tiếp nhận hơn."
                        },
                        {
                            "en": "Meet Mary, my friend from Britain.",
                            "note_vi": "Cách giới thiệu thân thiện, tự nhiên của người bản xứ."
                        }
                    ],
                    "pro_tip": "Quốc tịch của người nước Anh (UK) là 'British' (bao gồm cả Anh, Scotland, Wales) hoặc 'English' (riêng xứ England)."
                }
            },
            {
                "context": "Tình huống 12/15 • Hỏi thăm về đồng nghiệp tại văn phòng",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi Yes/No về nghề nghiệp với số nhiều.",
                "vi": "Họ có phải là nhân viên mới trong văn phòng không?",
                "sampleCasual": "Are they the new staff in the office?",
                "sampleFormal": "Are they the new staff in the office?",
                "ipa": "/ɑːr ðeɪ ðə njuː stɑːf ɪn ði ˈɒfɪs/",
                "grammarHint": "Dùng 'Are they' cho chủ ngữ số nhiều.",
                "keywords": [
                    "are",
                    "they",
                    "new",
                    "staff",
                    "office"
                ],
                "hints": [
                    {
                        "en": "Are they...",
                        "vi": "Họ có phải là..."
                    },
                    {
                        "en": "new staff",
                        "vi": "nhân viên mới"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "Are they new employees here?",
                        "speakable": "Are they new employees here?"
                    }
                ],
                "id": "sit_be_am_a1_12",
                "aiExplanation": {
                    "context_summary": "Dùng để hỏi thăm đồng nghiệp về nhóm nhân sự mới trong công ty.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với 'they': đảo 'Are' lên đầu câu ('Are they...?').",
                        "'staff' là danh từ tập hợp chỉ đội ngũ nhân viên (không thêm '-s' thành 'staffs')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are they the new employees?",
                            "note_vi": "'employees' đếm được số nhiều, rất thông dụng trong công sở."
                        },
                        {
                            "en": "Are they new here?",
                            "note_vi": "Cách hỏi ngắn gọn, thân thiện nhất của người bản xứ."
                        }
                    ],
                    "pro_tip": "Lưu ý quan trọng: Không viết 'new staffs'. Nếu muốn đếm từng người, dùng 'employees' hoặc 'staff members'."
                }
            },
            {
                "context": "Tình huống 13/15 • Mua sắm và hỏi về nguồn gốc sản phẩm",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
                "tense": "present",
                "form": "question",
                "cefrReason": "Sử dụng cấu trúc hỏi về nguồn gốc (quốc tịch/xuất xứ).",
                "vi": "Những chiếc túi này có phải là hàng của Pháp không?",
                "sampleCasual": "Are these bags from France?",
                "sampleFormal": "Are these bags from France?",
                "ipa": "/ɑːr ðiːz bæɡz frɒm frɑːns/",
                "grammarHint": "Dùng 'Are these' để hỏi về vật số nhiều.",
                "keywords": [
                    "are",
                    "these",
                    "bags",
                    "France"
                ],
                "hints": [
                    {
                        "en": "Are these...",
                        "vi": "Đây có phải là..."
                    },
                    {
                        "en": "from France",
                        "vi": "đến từ Pháp"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "Are these French bags?",
                        "speakable": "Are these French bags?"
                    }
                ],
                "id": "sit_be_am_a1_13",
                "aiExplanation": {
                    "context_summary": "Câu hỏi hữu ích khi đi mua sắm và muốn biết xuất xứ của sản phẩm.",
                    "grammar_points": [
                        "Với đồ vật số nhiều ở gần ('these bags'), đảo 'Are' lên đầu câu ('Are these bags...?').",
                        "Dùng 'from + tên nước' ('from France') để hỏi nguồn gốc xuất xứ."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are these bags made in France?",
                            "note_vi": "Cách hỏi phổ biến nhất khi mua sắm ('Có phải sản xuất tại Pháp không?')."
                        },
                        {
                            "en": "Are these French bags?",
                            "note_vi": "Dùng tính từ 'French' đứng trước 'bags'."
                        }
                    ],
                    "pro_tip": "Nhớ khớp số nhiều: 'these bags' (những chiếc túi này) luôn đi với 'Are', không dùng 'Is'."
                }
            },
            {
                "context": "Tình huống 14/15 • Giới thiệu bản thân trong buổi phỏng vấn",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "interview",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Sử dụng danh từ chỉ nghề nghiệp và tính từ mô tả.",
                "vi": "Tôi là một kế toán và tôi rất cẩn thận.",
                "sampleCasual": "I'm an accountant and I'm very careful.",
                "sampleFormal": "I am an accountant and I am very careful.",
                "ipa": "/aɪm ən əˈkaʊntənt ænd aɪm ˈverɪ ˈkeəfʊl/",
                "grammarHint": "Dùng 'an' trước danh từ bắt đầu bằng nguyên âm.",
                "keywords": [
                    "I'm",
                    "accountant",
                    "careful"
                ],
                "hints": [
                    {
                        "en": "an accountant",
                        "vi": "một kế toán"
                    },
                    {
                        "en": "very careful",
                        "vi": "rất cẩn thận"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "I am an accountant and I am diligent.",
                        "speakable": "I am an accountant and I am diligent."
                    }
                ],
                "id": "sit_be_am_a1_14",
                "aiExplanation": {
                    "context_summary": "Câu giới thiệu nghề nghiệp kết hợp điểm mạnh tính cách rất hợp dùng khi phỏng vấn xin việc.",
                    "grammar_points": [
                        "Dùng mạo từ 'an' trước 'accountant' vì từ này bắt đầu bằng âm nguyên âm /ə/.",
                        "Cấu trúc 'I'm + very + tính từ' ('I'm very careful') dùng để mô tả tính cách bản thân."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I'm an accountant and I'm very detail-oriented.",
                            "note_vi": "'detail-oriented' (tỉ mỉ, chú trọng chi tiết) là từ cực đắt giá khi phỏng vấn."
                        },
                        {
                            "en": "I work as an accountant, and I'm a careful person.",
                            "note_vi": "Tự nhiên, đầy đủ ý."
                        }
                    ],
                    "pro_tip": "Đừng quên đổi 'a' thành 'an' trước 'accountant' (an accountant, an engineer, an artist)."
                }
            },
            {
                "context": "Tình huống 15/15 • Hỏi về tình trạng của người quen",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "question",
                "cefrReason": "Sử dụng câu hỏi phủ định để xác nhận thông tin.",
                "vi": "Anh ấy không phải là bác sĩ của bạn sao?",
                "sampleCasual": "Isn't he your doctor?",
                "sampleFormal": "Is he not your doctor?",
                "ipa": "/ˈɪznt hi jɔːr ˈdɒktər/",
                "grammarHint": "Dùng 'Isn't' đầu câu để hỏi xác nhận.",
                "keywords": [
                    "isn't",
                    "he",
                    "your",
                    "doctor"
                ],
                "hints": [
                    {
                        "en": "Isn't he...",
                        "vi": "Anh ấy không phải là... sao?"
                    },
                    {
                        "en": "your doctor",
                        "vi": "bác sĩ của bạn"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Cách khác",
                        "en": "Is he not your doctor?",
                        "speakable": "Is he not your doctor?"
                    }
                ],
                "id": "sit_be_am_a1_15",
                "aiExplanation": {
                    "context_summary": "Câu hỏi phủ định dùng để xác nhận lại thông tin khi bạn khá chắc chắn hoặc hơi bất ngờ.",
                    "grammar_points": [
                        "Đảo 'Isn't' lên đầu câu ('Isn't he...?') để hỏi xác nhận mang sắc thái 'Không phải anh ấy là... sao?'.",
                        "Tính từ sở hữu 'your' đứng trước danh từ 'doctor'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is he your doctor?",
                            "note_vi": "Câu hỏi trung tính bình thường, không mang sắc thái ngạc nhiên."
                        },
                        {
                            "en": "He's your doctor, right?",
                            "note_vi": "Cách hỏi xác nhận cực kỳ tự nhiên trong văn nói hàng ngày."
                        }
                    ],
                    "pro_tip": "Khi trả lời câu hỏi phủ định như 'Isn't he your doctor?', hãy trả lời theo sự thật: nếu ĐÚNG là bác sĩ của bạn thì nói 'Yes, he is', nếu KHÔNG thì nói 'No, he isn't'."
                }
            }
        ]
    },
    {
        "id": "struct_possessive_adjectives_a1",
        "number": 2,
        "stageId": "stage_1",
        "stage": "Chặng 1: Khởi động & Giới thiệu bản thân",
        "orderInStage": 2,
        "level": "A1",
        "topics": [
            "daily",
            "interview",
            "food_shop",
            "office",
            "travel"
        ],
        "title": "Thông tin cá nhân & Gia đình (Tính từ sở hữu)",
        "shortName": "Possessive Adjectives",
        "formula": "Subject + be + (my/your/his/her/our/their) + Noun",
        "description": "Làm quen với việc sử dụng tính từ sở hữu để giới thiệu bản thân, gia đình và đồ vật cá nhân trong bối cảnh hàng ngày.",
        "tips": [
            "• Nhớ rằng tính từ sở hữu không thay đổi theo số nhiều.",
            "• Đừng nhầm lẫn giữa 'his' (của anh ấy) và 'her' (của cô ấy)."
        ],
        "requiredPatterns": [
            "my",
            "your",
            "his",
            "her",
            "our",
            "their",
            "is",
            "are",
            "am"
        ],
        "situations": [
            {
                "context": "Tình huống 1/15 • Giới thiệu tên của mình",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Sử dụng từ vựng cơ bản nhất để giới thiệu bản thân.",
                "vi": "Tên của tôi là Lan.",
                "sampleCasual": "My name is Lan.",
                "sampleFormal": "My name is Lan.",
                "ipa": "/maɪ neɪm ɪz læn/",
                "grammarHint": "Dùng 'my' cho ngôi thứ nhất số ít.",
                "keywords": [
                    "my",
                    "name",
                    "is"
                ],
                "hints": [
                    {
                        "en": "My",
                        "vi": "Của tôi"
                    },
                    {
                        "en": "name",
                        "vi": "tên"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_01",
                "aiExplanation": {
                    "context_summary": "Câu giới thiệu tên cơ bản và lịch sự nhất trong tiếng Anh.",
                    "grammar_points": [
                        "Tính từ sở hữu 'My' (của tôi) đứng trực tiếp trước danh từ 'name'.",
                        "'My name' là chủ ngữ số ít nên đi với động từ To be 'is'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I'm Lan.",
                            "note_vi": "Ngắn gọn, thân mật và phổ biến nhất trong giao tiếp hàng ngày."
                        },
                        {
                            "en": "My name's Lan.",
                            "note_vi": "Rút gọn 'name is' thành 'name's' nghe tự nhiên hơn khi nói."
                        }
                    ],
                    "pro_tip": "Không nói 'I name is Lan'. Phải dùng tính từ sở hữu 'My' trước danh từ 'name'."
                }
            },
            {
                "context": "Tình huống 2/15 • Giới thiệu nghề nghiệp của anh ấy",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "interview",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Cấu trúc đơn giản, từ vựng chỉ nghề nghiệp phổ biến.",
                "vi": "Nghề nghiệp của anh ấy là bác sĩ.",
                "sampleCasual": "His job is a doctor.",
                "sampleFormal": "His occupation is a doctor.",
                "ipa": "/hɪz dʒɑːb ɪz ə dɑːktər/",
                "grammarHint": "Dùng 'his' cho nam giới.",
                "keywords": [
                    "his",
                    "job",
                    "doctor"
                ],
                "hints": [
                    {
                        "en": "His",
                        "vi": "Của anh ấy"
                    },
                    {
                        "en": "job",
                        "vi": "công việc"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_02",
                "aiExplanation": {
                    "context_summary": "Câu luyện tập tính từ sở hữu 'His' để nói về nghề nghiệp của một người nam.",
                    "grammar_points": [
                        "Dùng tính từ sở hữu 'His' (của anh ấy) trước danh từ 'job'.",
                        "Lưu ý tự nhiên: Trong tiếng Anh thực tế, 'job' (công việc) ít khi ghép trực tiếp với danh từ chỉ người ('a doctor'); người bản xứ thường nói thẳng 'He is a doctor'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He is a doctor.",
                            "note_vi": "Cách nói tự nhiên và chuẩn bản xứ nhất."
                        },
                        {
                            "en": "His brother is a doctor.",
                            "note_vi": "Nếu muốn luyện 'His', ghép với người (His brother / His dad) sẽ tự nhiên hơn nhiều."
                        }
                    ],
                    "pro_tip": "Khi giao tiếp thực tế, hãy nói 'He is a doctor' thay vì dịch sát từng chữ từ tiếng Việt 'Nghề của anh ấy là bác sĩ' sang 'His job is a doctor'."
                }
            },
            {
                "context": "Tình huống 3/15 • Giới thiệu sở thích của cô ấy",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Từ vựng chỉ sở thích đơn giản, phù hợp trình độ A1.",
                "vi": "Sở thích của cô ấy là âm nhạc.",
                "sampleCasual": "Her hobby is music.",
                "sampleFormal": "Her hobby is music.",
                "ipa": "/hɜːr ˈhɑːbi ɪz ˈmjuːzɪk/",
                "grammarHint": "Dùng 'her' cho nữ giới.",
                "keywords": [
                    "her",
                    "hobby",
                    "music"
                ],
                "hints": [
                    {
                        "en": "Her",
                        "vi": "Của cô ấy"
                    },
                    {
                        "en": "hobby",
                        "vi": "sở thích"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_03",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu sở thích cá nhân của một người nữ.",
                    "grammar_points": [
                        "Tính từ sở hữu 'Her' (của cô ấy) đứng trước danh từ 'hobby'.",
                        "'music' là danh từ không đếm được nên không dùng mạo từ 'a/the'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "She loves music.",
                            "note_vi": "Ngắn gọn, tự nhiên hơn trong văn nói."
                        },
                        {
                            "en": "Her favorite hobby is listening to music.",
                            "note_vi": "Diễn đạt rõ ràng và đầy đủ hơn."
                        }
                    ],
                    "pro_tip": "Phân biệt rõ 'His' (của anh ấy — nam) và 'Her' (của cô ấy — nữ) để không bị nhầm lẫn khi nói nhanh."
                }
            },
            {
                "context": "Tình huống 4/15 • Giới thiệu gia đình của chúng tôi",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Sử dụng từ vựng gia đình cơ bản.",
                "vi": "Gia đình của chúng tôi rất lớn.",
                "sampleCasual": "Our family is big.",
                "sampleFormal": "Our family is large.",
                "ipa": "/ˈaʊər ˈfæməli ɪz bɪɡ/",
                "grammarHint": "Dùng 'our' cho nhóm bao gồm cả người nói.",
                "keywords": [
                    "our",
                    "family",
                    "big"
                ],
                "hints": [
                    {
                        "en": "Our",
                        "vi": "Của chúng tôi"
                    },
                    {
                        "en": "family",
                        "vi": "gia đình"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_04",
                "aiExplanation": {
                    "context_summary": "Dùng để mô tả quy mô gia đình của mình khi trò chuyện với bạn bè.",
                    "grammar_points": [
                        "Tính từ sở hữu 'Our' (của chúng tôi) đi với danh từ 'family'.",
                        "'family' trong câu này được xem là một đơn vị số ít nên đi với 'is'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We have a big family.",
                            "note_vi": "Cách nói cực kỳ phổ biến của người bản xứ."
                        },
                        {
                            "en": "Our family is quite large.",
                            "note_vi": "Trang trọng hơn một chút."
                        }
                    ],
                    "pro_tip": "Tính từ sở hữu ('Our') đứng trước danh từ để chỉ sự sở hữu chung, không dùng đại từ 'We' ('We family' là sai)."
                }
            },
            {
                "context": "Tình huống 5/15 • Giới thiệu bạn của họ",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Cấu trúc câu đơn giản với danh từ số ít.",
                "vi": "Bạn của họ là người tốt.",
                "sampleCasual": "Their friend is nice.",
                "sampleFormal": "Their friend is kind.",
                "ipa": "/ðer frend ɪz naɪs/",
                "grammarHint": "Dùng 'their' cho nhóm người khác.",
                "keywords": [
                    "their",
                    "friend",
                    "nice"
                ],
                "hints": [
                    {
                        "en": "Their",
                        "vi": "Của họ"
                    },
                    {
                        "en": "friend",
                        "vi": "bạn"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_05",
                "aiExplanation": {
                    "context_summary": "Dùng để khen ngợi tính cách tốt bụng, dễ mến của bạn bè ai đó.",
                    "grammar_points": [
                        "Tính từ sở hữu 'Their' (của họ) đứng trước danh từ 'friend'.",
                        "Vì 'friend' là số ít (1 người bạn) nên vẫn đi với động từ To be 'is' (không chia theo 'Their')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Their friend is really kind.",
                            "note_vi": "'kind' nhấn mạnh sự tốt bụng, tử tế."
                        },
                        {
                            "en": "Their friend is a nice person.",
                            "note_vi": "Đầy đủ hơn, giống cách nói 'là một người tốt' trong tiếng Việt."
                        }
                    ],
                    "pro_tip": "Rất nhiều người thấy 'Their' (số nhiều) liền chia 'are'. Hãy nhớ: To be chia theo DANH TỪ đi sau ('friend' là số ít → 'is')."
                }
            },
            {
                "context": "Tình huống 6/15 • Hỏi về tên của bạn",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "interview",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi đơn giản, sử dụng tính từ sở hữu 'your'.",
                "vi": "Tên của bạn là gì?",
                "sampleCasual": "What is your name?",
                "sampleFormal": "What is your name?",
                "ipa": "/wʌt ɪz jʊər neɪm/",
                "grammarHint": "Dùng 'your' khi hỏi trực tiếp đối phương.",
                "keywords": [
                    "what",
                    "your",
                    "name"
                ],
                "hints": [
                    {
                        "en": "What",
                        "vi": "Cái gì"
                    },
                    {
                        "en": "your",
                        "vi": "của bạn"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_06",
                "aiExplanation": {
                    "context_summary": "Câu hỏi cơ bản nhất để hỏi tên khi mới làm quen với ai đó.",
                    "grammar_points": [
                        "Cấu trúc câu hỏi Wh- với To be: 'What + is + your + danh từ?'.",
                        "Tính từ sở hữu 'your' (của bạn) đứng trước 'name'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "What's your name?",
                            "note_vi": "Dạng rút gọn tự nhiên và thông dụng nhất trong văn nói."
                        },
                        {
                            "en": "May I have your name?",
                            "note_vi": "Rất lịch sự, dùng ở lễ tân, khách sạn hoặc công sở."
                        }
                    ],
                    "pro_tip": "Phân biệt 'your' (của bạn — tính từ sở hữu) và 'you're' (viết tắt của 'you are'). Hai từ đọc giống nhau nhưng viết khác nhau."
                }
            },
            {
                "context": "Tình huống 7/15 • Phủ định về nghề nghiệp của cô ấy",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "interview",
                "tense": "present",
                "form": "negative",
                "cefrReason": "Kết hợp phủ định và tính từ sở hữu cơ bản.",
                "vi": "Nghề của cô ấy không phải là giáo viên.",
                "sampleCasual": "Her job isn't a teacher.",
                "sampleFormal": "Her occupation is not a teacher.",
                "ipa": "/hɜːr dʒɑːb ˈɪzənt ə ˈtiːtʃər/",
                "grammarHint": "Dùng 'isn't' để phủ định.",
                "keywords": [
                    "her",
                    "job",
                    "teacher"
                ],
                "hints": [
                    {
                        "en": "isn't",
                        "vi": "không phải là"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_07",
                "aiExplanation": {
                    "context_summary": "Câu luyện tập phủ định với tính từ sở hữu 'Her' và 'isn't'.",
                    "grammar_points": [
                        "Dùng tính từ sở hữu 'Her' trước danh từ và dùng 'isn't' (is not) để phủ định.",
                        "Lưu ý tự nhiên: Tương tự câu 2, trong tiếng Anh chuẩn, chủ ngữ chỉ vật ('Her job') không đồng nhất với danh từ chỉ người ('a teacher')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "She isn't a teacher.",
                            "note_vi": "Cách nói tự nhiên và chuẩn xác nhất của người bản xứ."
                        },
                        {
                            "en": "Her profession is not teaching.",
                            "note_vi": "Trang trọng, dùng danh động từ 'teaching' (việc giảng dạy) để khớp với 'profession'."
                        }
                    ],
                    "pro_tip": "Khi giao tiếp thực tế, tránh dịch word-by-word 'Nghề của cô ấy không phải giáo viên' thành 'Her job isn't a teacher'. Hãy nói thẳng 'She isn't a teacher'."
                }
            },
            {
                "context": "Tình huống 8/15 • Hỏi về gia đình của họ",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi Yes/No đơn giản với tính từ sở hữu.",
                "vi": "Gia đình của họ có nhỏ không?",
                "sampleCasual": "Is their family small?",
                "sampleFormal": "Is their family small?",
                "ipa": "/ɪz ðer ˈfæməli smɔːl/",
                "grammarHint": "Đảo 'Is' lên đầu câu hỏi.",
                "keywords": [
                    "their",
                    "family",
                    "small"
                ],
                "hints": [
                    {
                        "en": "Is",
                        "vi": "Có phải là"
                    },
                    {
                        "en": "small",
                        "vi": "nhỏ"
                    }
                ],
                "alternatives": [],
                "id": "sit_possessive_adjectives_a1_08",
                "aiExplanation": {
                    "context_summary": "Câu hỏi Yes/No đơn giản để hỏi thăm về gia đình của một nhóm người.",
                    "grammar_points": [
                        "Đảo 'Is' lên đầu câu hỏi trước cụm chủ ngữ số ít 'their family'.",
                        "Tính từ sở hữu 'their' đứng trước 'family'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Do they have a small family?",
                            "note_vi": "Cách hỏi rất tự nhiên với động từ 'have'."
                        },
                        {
                            "en": "Is their family big or small?",
                            "note_vi": "Câu hỏi lựa chọn thân thiện hơn trong hội thoại."
                        }
                    ],
                    "pro_tip": "Nhớ chia 'Is' (số ít) cho 'their family' vì 'family' là 1 gia đình."
                }
            },
            {
                "context": "Tình huống 9/15 • Hỏi về món ăn yêu thích của bạn",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "food_shop",
                "tense": "present",
                "form": "question",
                "cefrReason": "Sử dụng cấu trúc sở hữu cơ bản với danh từ đơn giản, từ vựng A1.",
                "vi": "Món ăn yêu thích của bạn là gì?",
                "sampleCasual": "What is your favorite food?",
                "sampleFormal": "What is your favorite food?",
                "ipa": "/wɒt ɪz jɔːr ˈfeɪvərɪt fuːd/",
                "grammarHint": "Cấu trúc câu hỏi với 'What' + 'is' + 'your' + 'noun'.",
                "keywords": [
                    "what",
                    "is",
                    "your",
                    "favorite",
                    "food"
                ],
                "hints": [
                    {
                        "en": "favorite food",
                        "vi": "món ăn yêu thích"
                    },
                    {
                        "en": "What is",
                        "vi": "Cái gì là"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Hỏi về đồ uống",
                        "en": "What is your favorite drink?",
                        "speakable": "What is your favorite drink?"
                    }
                ],
                "id": "sit_possessive_adjectives_a1_09",
                "aiExplanation": {
                    "context_summary": "Câu hỏi làm quen rất thú vị và phổ biến khi trò chuyện về ăn uống.",
                    "grammar_points": [
                        "Cấu trúc: 'What is + your + favorite + danh từ?'.",
                        "Tính từ 'favorite' (Anh-Mỹ) / 'favourite' (Anh-Anh) đứng giữa 'your' và 'food'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "What's your favorite food?",
                            "note_vi": "Rút gọn 'What's' cho tự nhiên khi nói."
                        },
                        {
                            "en": "What kind of food do you like?",
                            "note_vi": "Hỏi rộng hơn về gu ăn uống của đối phương."
                        }
                    ],
                    "pro_tip": "Không nói 'What is your food favorite?'. Trong tiếng Anh, tính từ ('favorite') luôn đứng TRƯỚC danh từ ('food')."
                }
            },
            {
                "context": "Tình huống 10/15 • Phủ định về màu sắc của chiếc xe",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "negative",
                "cefrReason": "Sử dụng phủ định 'is not' với tính từ sở hữu, từ vựng cơ bản.",
                "vi": "Chiếc xe của anh ấy không phải màu đỏ.",
                "sampleCasual": "His car isn't red.",
                "sampleFormal": "His car is not red.",
                "ipa": "/hɪz kɑːr ˈɪznt red/",
                "grammarHint": "Dùng 'isn't' hoặc 'is not' để phủ định tính chất.",
                "keywords": [
                    "his",
                    "car",
                    "is",
                    "not",
                    "red"
                ],
                "hints": [
                    {
                        "en": "His car",
                        "vi": "Xe của anh ấy"
                    },
                    {
                        "en": "is not",
                        "vi": "thì không phải"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Phủ định về màu xanh",
                        "en": "His car isn't blue.",
                        "speakable": "His car isn't blue."
                    }
                ],
                "id": "sit_possessive_adjectives_a1_10",
                "aiExplanation": {
                    "context_summary": "Dùng để mô tả hoặc đính chính màu sắc đồ vật của ai đó.",
                    "grammar_points": [
                        "Tính từ sở hữu 'His' đứng trước danh từ 'car'.",
                        "Phủ định tính chất màu sắc dùng 'isn't + màu sắc' ('isn't red')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "His car is not red.",
                            "note_vi": "Dạng đầy đủ, nhấn mạnh hơn vào chữ 'not'."
                        },
                        {
                            "en": "He doesn't have a red car.",
                            "note_vi": "Diễn đạt bằng động từ 'have'."
                        }
                    ],
                    "pro_tip": "Không cần thêm từ 'color' sau 'red' (tránh viết 'isn't red color'). Chỉ cần nói gọn 'His car isn't red'."
                }
            },
            {
                "context": "Tình huống 11/15 • Giới thiệu đồng nghiệp tại văn phòng",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Câu đơn giản giới thiệu người, từ vựng A1 về công việc.",
                "vi": "Đồng nghiệp của tôi là một người rất tốt bụng.",
                "sampleCasual": "My colleague is a very nice person.",
                "sampleFormal": "My colleague is a very nice person.",
                "ipa": "/maɪ ˈkɒliːɡ ɪz ə ˈveri naɪs ˈpɜːsn/",
                "grammarHint": "Sử dụng tính từ sở hữu 'My' để chỉ mối quan hệ.",
                "keywords": [
                    "my",
                    "colleague",
                    "is",
                    "nice",
                    "person"
                ],
                "hints": [
                    {
                        "en": "My colleague",
                        "vi": "Đồng nghiệp của tôi"
                    },
                    {
                        "en": "nice person",
                        "vi": "người tốt bụng"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Giới thiệu bạn bè",
                        "en": "My friend is a very nice person.",
                        "speakable": "My friend is a very nice person."
                    }
                ],
                "id": "sit_possessive_adjectives_a1_11",
                "aiExplanation": {
                    "context_summary": "Dùng để kể về một người đồng nghiệp thân thiện tại nơi làm việc.",
                    "grammar_points": [
                        "Tính từ sở hữu 'My' đứng trước 'colleague' (đồng nghiệp).",
                        "Cụm danh từ 'a very nice person' cần có mạo từ 'a' phía trước vì 'person' là danh từ đếm được số ít."
                    ],
                    "native_alternatives": [
                        {
                            "en": "My coworker is really nice.",
                            "note_vi": "'coworker' rất phổ biến trong tiếng Anh-Mỹ."
                        },
                        {
                            "en": "My colleague is very kind.",
                            "note_vi": "Ngắn gọn, không cần lặp lại từ 'person'."
                        }
                    ],
                    "pro_tip": "Chú ý phát âm 'colleague' là /ˈkɑːliːɡ/ (chỉ có 2 âm tiết, không đọc thành 3 âm tiết)."
                }
            },
            {
                "context": "Tình huống 12/15 • Hỏi thăm về nhà của bạn mới",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "daily",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi Yes/No đơn giản với tính từ sở hữu.",
                "vi": "Nhà của bạn có gần trung tâm thành phố không?",
                "sampleCasual": "Is your house near the city center?",
                "sampleFormal": "Is your house near the city center?",
                "ipa": "/ɪz jɔːr haʊs nɪər ðə ˈsɪti ˈsentər/",
                "grammarHint": "Đảo 'Is' lên đầu câu để tạo câu hỏi Yes/No.",
                "keywords": [
                    "is",
                    "your",
                    "house",
                    "near",
                    "city",
                    "center"
                ],
                "hints": [
                    {
                        "en": "your house",
                        "vi": "nhà của bạn"
                    },
                    {
                        "en": "near the city center",
                        "vi": "gần trung tâm thành phố"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Hỏi về trường học",
                        "en": "Is your school near the city center?",
                        "speakable": "Is your school near the city center?"
                    }
                ],
                "id": "sit_possessive_adjectives_a1_12",
                "aiExplanation": {
                    "context_summary": "Câu hỏi thăm quen thuộc về vị trí nhà ở của bạn bè hoặc đồng nghiệp.",
                    "grammar_points": [
                        "Đảo 'Is' lên đầu câu trước cụm chủ ngữ số ít 'your house'.",
                        "Giới từ 'near' đi trực tiếp với địa điểm ('near the city center'), không thêm 'to'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Do you live near the city center?",
                            "note_vi": "Cách hỏi rất phổ biến dùng động từ 'live'."
                        },
                        {
                            "en": "Is your house close to downtown?",
                            "note_vi": "Cách nói chuẩn Anh-Mỹ ('close to' có 'to', 'downtown' = trung tâm thành phố)."
                        }
                    ],
                    "pro_tip": "Ghi nhớ cặp đôi: 'near + địa điểm' (không có 'to') và 'close to + địa điểm' (có 'to')."
                }
            },
            {
                "context": "Tình huống 13/15 • Mua sắm đồ dùng cá nhân",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Sử dụng tính từ sở hữu trong ngữ cảnh mua sắm cơ bản.",
                "vi": "Túi của họ thì quá nhỏ cho những món đồ này.",
                "sampleCasual": "Their bag is too small for these items.",
                "sampleFormal": "Their bag is too small for these items.",
                "ipa": "/ðeər bæɡ ɪz tuː smɔːl fɔːr ðiːz ˈaɪtəmz/",
                "grammarHint": "Cấu trúc 'Subject + is + adjective + for + noun'.",
                "keywords": [
                    "their",
                    "bag",
                    "is",
                    "too",
                    "small"
                ],
                "hints": [
                    {
                        "en": "Their bag",
                        "vi": "Cái túi của họ"
                    },
                    {
                        "en": "too small",
                        "vi": "quá nhỏ"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Nói về cái hộp",
                        "en": "Their box is too small for these items.",
                        "speakable": "Their box is too small for these items."
                    }
                ],
                "id": "sit_possessive_adjectives_a1_13",
                "aiExplanation": {
                    "context_summary": "Dùng khi mua sắm hoặc đóng gói đồ đạc và thấy túi không đủ lớn.",
                    "grammar_points": [
                        "Tính từ sở hữu 'Their' đứng trước 'bag' (số ít → dùng 'is').",
                        "Cấu trúc 'too + tính từ + for + danh từ' diễn tả mức độ 'quá... đối với...'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Their bag isn't big enough for these things.",
                            "note_vi": "Dùng 'not big enough' (không đủ lớn) rất tự nhiên."
                        },
                        {
                            "en": "This stuff won't fit in their bag.",
                            "note_vi": "Cách nói đời thường cực chuẩn bản xứ."
                        }
                    ],
                    "pro_tip": "Phân biệt 'too small' (quá nhỏ — mang nghĩa tiêu cực, không dùng được) với 'very small' (rất nhỏ — chỉ mô tả mức độ)."
                }
            },
            {
                "context": "Tình huống 14/15 • Giới thiệu về chuyến đi của gia đình",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "travel",
                "tense": "present",
                "form": "affirmative",
                "cefrReason": "Sử dụng tính từ sở hữu 'our' trong ngữ cảnh du lịch.",
                "vi": "Chuyến đi của chúng tôi rất vui và thú vị.",
                "sampleCasual": "Our trip is very fun and interesting.",
                "sampleFormal": "Our trip is very fun and interesting.",
                "ipa": "/ˈaʊər trɪp ɪz ˈveri fʌn ænd ˈɪntrəstɪŋ/",
                "grammarHint": "Sử dụng 'Our' để chỉ sở hữu chung.",
                "keywords": [
                    "our",
                    "trip",
                    "is",
                    "fun",
                    "interesting"
                ],
                "hints": [
                    {
                        "en": "Our trip",
                        "vi": "Chuyến đi của chúng tôi"
                    },
                    {
                        "en": "fun and interesting",
                        "vi": "vui và thú vị"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Nói về kỳ nghỉ",
                        "en": "Our holiday is very fun and interesting.",
                        "speakable": "Our holiday is very fun and interesting."
                    }
                ],
                "id": "sit_possessive_adjectives_a1_14",
                "aiExplanation": {
                    "context_summary": "Chia sẻ cảm xúc hào hứng về một chuyến đi chơi cùng gia đình hoặc nhóm bạn.",
                    "grammar_points": [
                        "Tính từ sở hữu 'Our' (của chúng tôi) đứng trước danh từ số ít 'trip' → đi với 'is'.",
                        "Nối hai tính từ mô tả bằng 'and' ('fun and interesting')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We're having a really fun and interesting trip.",
                            "note_vi": "Dùng khi chuyến đi đang diễn ra."
                        },
                        {
                            "en": "Our trip is amazing!",
                            "note_vi": "Ngắn gọn, giàu cảm xúc hơn trong văn nói."
                        }
                    ],
                    "pro_tip": "Phân biệt 'fun' (vui vẻ, thú vị) và 'funny' (hài hước, buồn cười). Chuyến đi vui dùng 'fun', không dùng 'funny'."
                }
            },
            {
                "context": "Tình huống 15/15 • Hỏi về thông tin đồng nghiệp",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
                "tense": "present",
                "form": "question",
                "cefrReason": "Câu hỏi với 'What' về thông tin cá nhân cơ bản.",
                "vi": "Số điện thoại của cô ấy là bao nhiêu?",
                "sampleCasual": "What is her phone number?",
                "sampleFormal": "What is her phone number?",
                "ipa": "/wɒt ɪz hɜːr fəʊn ˈnʌmbər/",
                "grammarHint": "Cấu trúc hỏi thông tin với 'What is'.",
                "keywords": [
                    "what",
                    "is",
                    "her",
                    "phone",
                    "number"
                ],
                "hints": [
                    {
                        "en": "her phone number",
                        "vi": "số điện thoại của cô ấy"
                    },
                    {
                        "en": "What is",
                        "vi": "là gì"
                    }
                ],
                "alternatives": [
                    {
                        "label": "Hỏi về địa chỉ email",
                        "en": "What is her email address?",
                        "speakable": "What is her email address?"
                    }
                ],
                "id": "sit_possessive_adjectives_a1_15",
                "aiExplanation": {
                    "context_summary": "Câu hỏi thiết thực khi cần liên lạc với đồng nghiệp hoặc bạn bè.",
                    "grammar_points": [
                        "Trong tiếng Anh, hỏi số điện thoại dùng 'What is...' (KHÔNG dùng 'How many' hay 'How much').",
                        "Tính từ sở hữu 'her' đứng trước cụm danh từ 'phone number'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "What's her phone number?",
                            "note_vi": "Dạng rút gọn tự nhiên nhất khi nói."
                        },
                        {
                            "en": "Do you have her phone number?",
                            "note_vi": "Lịch sự hơn khi muốn xin số điện thoại từ người khác."
                        }
                    ],
                    "pro_tip": "Người Việt hay dịch 'là bao nhiêu' thành 'How much is her phone number?' — câu đó sai nghĩa! Hỏi số điện thoại, địa chỉ, giá trị định danh luôn dùng 'What is...'."
                }
            }
        ]
    },
    {
        "id": "struct_this_that_these_those_a1",
        "number": 3,
        "stageId": "stage_1",
        "stage": "Chặng 1: Khởi động & Giới thiệu bản thân",
        "orderInStage": 3,
        "level": "A1",
        "topics": [
            "daily",
            "food_shop",
            "office",
            "travel"
        ],
        "title": "Chỉ định người & đồ vật (This / That / These / Those)",
        "shortName": "This / That / These / Those",
        "formula": "This/That + is + N (số ít) | These/Those + are + N (số nhiều)",
        "description": "Dùng để chỉ định hoặc giới thiệu người và đồ vật ở gần (this / these) hay ở xa (that / those), phân biệt rõ số ít và số nhiều trong giao tiếp hằng ngày.",
        "tips": [
            "• Ở gần: dùng This (1 người/vật) đi với is, dùng These (từ 2 trở lên) đi với are.",
            "• Ở xa: dùng That (1 người/vật) đi với is (rút gọn: That's), dùng Those (từ 2 trở lên) đi với are.",
            "• Câu phủ định thêm not sau to be (isn't / aren't); câu hỏi đảo Is / Are lên đầu câu."
        ],
        "requiredPatterns": [
            "this",
            "that",
            "these",
            "those"
        ],
        "situations": [
            {
                "id": "s1_t3_01",
                "context": "Tình huống 1/15 • Giới thiệu người bạn đứng ngay cạnh",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Đây là bạn thân của tôi, Minh.",
                "sampleCasual": "This is my best friend, Minh.",
                "sampleFormal": "This is my close friend, Minh.",
                "keywords": [
                    "this",
                    "is",
                    "best friend"
                ],
                "hints": [
                    {
                        "en": "best friend",
                        "vi": "bạn thân"
                    }
                ],
                "grammarHint": "Giới thiệu 1 người đứng ngay gần dùng 'This is + ...'.",
                "aiExplanation": {
                    "context_summary": "Dùng để giới thiệu người bạn thân đang đứng ngay bên cạnh mình.",
                    "grammar_points": [
                        "Dùng 'This is' để giới thiệu 1 người ở gần (số ít).",
                        "Cụm danh từ 'my best friend' (bạn thân của tôi) đặt trước tên riêng."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Meet my best friend, Minh.",
                            "note_vi": "Thân mật, tự nhiên khi giới thiệu hai người với nhau."
                        },
                        {
                            "en": "This is Minh, my best friend.",
                            "note_vi": "Đảo tên lên trước cũng rất phổ biến."
                        }
                    ],
                    "pro_tip": "Không rút gọn 'This is' thành 'This's'. Luôn nói và viết đầy đủ 'This is'."
                }
            },
            {
                "id": "s1_t3_02",
                "context": "Tình huống 2/15 • Chỉ chiếc điện thoại mới trên tay",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Đây là chiếc điện thoại mới của tôi.",
                "sampleCasual": "This is my new phone.",
                "sampleFormal": "This is my new mobile phone.",
                "keywords": [
                    "this",
                    "is",
                    "new",
                    "phone"
                ],
                "hints": [
                    {
                        "en": "new",
                        "vi": "mới"
                    },
                    {
                        "en": "phone",
                        "vi": "điện thoại"
                    }
                ],
                "grammarHint": "Đồ vật số ít ở gần dùng 'This is + my + tính từ + danh từ'.",
                "aiExplanation": {
                    "context_summary": "Khoe chiếc điện thoại mới đang cầm trên tay với bạn bè.",
                    "grammar_points": [
                        "Dùng 'This is' cho 1 đồ vật số ít ở ngay gần / trên tay.",
                        "Trật tự cụm danh từ: tính từ sở hữu ('my') + tính từ ('new') + danh từ ('phone')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I just got a new phone.",
                            "note_vi": "Nhấn mạnh việc vừa mới mua điện thoại mới."
                        },
                        {
                            "en": "Check out my new phone!",
                            "note_vi": "Cách khoe đồ cực tự nhiên với bạn thân."
                        }
                    ],
                    "pro_tip": "Đặt tính từ 'new' trước danh từ 'phone' ('my new phone', không viết 'my phone new')."
                }
            },
            {
                "id": "s1_t3_03",
                "context": "Tình huống 3/15 • Chỉ văn phòng ở phía bên kia đường",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Kia là văn phòng của tôi.",
                "sampleCasual": "That is my office.",
                "sampleFormal": "That's my office.",
                "keywords": [
                    "that",
                    "is",
                    "office"
                ],
                "hints": [
                    {
                        "en": "office",
                        "vi": "văn phòng"
                    }
                ],
                "grammarHint": "Chỉ 1 địa điểm ở xa dùng 'That is' (hoặc rút gọn 'That's').",
                "aiExplanation": {
                    "context_summary": "Chỉ tay về phía văn phòng nằm ở khoảng cách xa (bên kia đường hoặc cuối hành lang).",
                    "grammar_points": [
                        "Dùng 'That is' (rút gọn: 'That's') để chỉ 1 vật hoặc 1 địa điểm ở XA.",
                        "Tính từ sở hữu 'my' đứng trước 'office'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "That's my office over there.",
                            "note_vi": "Thêm 'over there' (ở đằng kia) làm câu nói tự nhiên và rõ vị trí hơn."
                        },
                        {
                            "en": "My office is over there.",
                            "note_vi": "Cách diễn đạt trực tiếp khác."
                        }
                    ],
                    "pro_tip": "Khác với 'This is', bạn hoàn toàn có thể rút gọn 'That is' thành 'That's' khi nói cho mượt."
                }
            },
            {
                "id": "s1_t3_04",
                "context": "Tình huống 4/15 • Chỉ người quản lý đứng đằng xa",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Kia là quản lý mới của chúng tôi.",
                "sampleCasual": "That is our new manager.",
                "sampleFormal": "That's our new manager.",
                "keywords": [
                    "that",
                    "is",
                    "our",
                    "manager"
                ],
                "hints": [
                    {
                        "en": "our",
                        "vi": "của chúng tôi"
                    },
                    {
                        "en": "manager",
                        "vi": "quản lý"
                    }
                ],
                "grammarHint": "Chỉ 1 người ở xa dùng 'That is + our + new + manager'.",
                "aiExplanation": {
                    "context_summary": "Chỉ cho đồng nghiệp thấy người quản lý mới đang đứng ở đằng xa.",
                    "grammar_points": [
                        "Dùng 'That is' (hoặc 'That's') để chỉ 1 người ở khoảng cách xa.",
                        "Trật tự: 'our' (của chúng tôi) + 'new' (mới) + 'manager' (quản lý)."
                    ],
                    "native_alternatives": [
                        {
                            "en": "That's our new manager over there.",
                            "note_vi": "Tự nhiên hơn trong giao tiếp văn phòng."
                        },
                        {
                            "en": "He/She is our new manager.",
                            "note_vi": "Dùng đại từ nhân xưng khi cả hai đã nhìn vào người đó."
                        }
                    ],
                    "pro_tip": "Phân biệt: Đứng ngay cạnh để giới thiệu dùng 'This is'; chỉ từ xa dùng 'That is'."
                }
            },
            {
                "id": "s1_t3_05",
                "context": "Tình huống 5/15 • Cầm chùm chìa khóa trên tay",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Đây là những chiếc chìa khóa của tôi.",
                "sampleCasual": "These are my keys.",
                "sampleFormal": "These are my house keys.",
                "keywords": [
                    "these",
                    "are",
                    "keys"
                ],
                "hints": [
                    {
                        "en": "keys",
                        "vi": "những chiếc chìa khóa"
                    }
                ],
                "grammarHint": "Số nhiều ở gần dùng 'These are' và nhớ thêm 's' vào danh từ 'keys'.",
                "aiExplanation": {
                    "context_summary": "Cầm chùm chìa khóa trên tay và nói chúng là của mình.",
                    "grammar_points": [
                        "Dùng 'These are' cho đồ vật SỐ NHIỀU ở gần.",
                        "Danh từ 'key' phải thêm '-s' thành 'keys' để khớp với 'These are'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "These keys are mine.",
                            "note_vi": "Dùng đại từ sở hữu 'mine' (của tôi) ở cuối câu."
                        },
                        {
                            "en": "These are my house keys.",
                            "note_vi": "Nói rõ hơn là chìa khóa nhà."
                        }
                    ],
                    "pro_tip": "Chú ý phát âm phân biệt 'this' /ðɪs/ (âm 'i' ngắn, đuôi /s/) và 'these' /ðiːz/ (âm 'i' dài, đuôi /z/)."
                }
            },
            {
                "id": "s1_t3_06",
                "context": "Tình huống 6/15 • Giới thiệu đồng nghiệp đứng gần",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Đây là các đồng nghiệp của tôi.",
                "sampleCasual": "These are my colleagues.",
                "sampleFormal": "These are my coworkers.",
                "keywords": [
                    "these",
                    "are",
                    "colleagues"
                ],
                "hints": [
                    {
                        "en": "colleagues",
                        "vi": "các đồng nghiệp"
                    }
                ],
                "grammarHint": "Giới thiệu nhiều người ở gần dùng 'These are + my + danh từ số nhiều'.",
                "aiExplanation": {
                    "context_summary": "Giới thiệu một nhóm đồng nghiệp đang đứng gần mình.",
                    "grammar_points": [
                        "Dùng 'These are' để giới thiệu từ 2 người trở lên ở gần.",
                        "Danh từ số nhiều 'colleagues' có thêm '-s'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "These are my coworkers.",
                            "note_vi": "'coworkers' rất thông dụng ở Mỹ."
                        },
                        {
                            "en": "I'd like you to meet my colleagues.",
                            "note_vi": "Trang trọng, lịch sự trong môi trường công sở."
                        }
                    ],
                    "pro_tip": "Không dùng 'This are' cho số nhiều! Luôn nhớ cặp đôi: 'This is' (1) — 'These are' (nhiều)."
                }
            },
            {
                "id": "s1_t3_07",
                "context": "Tình huống 7/15 • Chọn hoa quả ở quầy đối diện",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Những quả táo kia rất tươi.",
                "sampleCasual": "Those apples are very fresh.",
                "sampleFormal": "Those apples are really fresh.",
                "keywords": [
                    "those",
                    "apples",
                    "are",
                    "fresh"
                ],
                "hints": [
                    {
                        "en": "apples",
                        "vi": "những quả táo"
                    },
                    {
                        "en": "fresh",
                        "vi": "tươi"
                    }
                ],
                "grammarHint": "Dùng 'Those + danh từ số nhiều + are + tính từ' để mô tả đồ vật ở xa.",
                "aiExplanation": {
                    "context_summary": "Nhận xét về chất lượng hoa quả ở quầy hàng phía đối diện khi đi chợ/siêu thị.",
                    "grammar_points": [
                        "Dùng 'Those + danh từ số nhiều' ('Those apples') để chỉ nhiều vật ở XA.",
                        "Động từ To be đi kèm phải là 'are' ('Those apples are very fresh')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Those apples look very fresh.",
                            "note_vi": "Dùng 'look' (trông có vẻ) cực kỳ tự nhiên khi nhìn đồ ăn từ xa."
                        },
                        {
                            "en": "Those apples are really fresh.",
                            "note_vi": "'really' nghe thân mật hơn 'very'."
                        }
                    ],
                    "pro_tip": "'Those' có thể đứng một mình ('Those are apples') hoặc đứng ngay trước danh từ số nhiều ('Those apples are fresh')."
                }
            },
            {
                "id": "s1_t3_08",
                "context": "Tình huống 8/15 • Chỉ đôi giày trưng bày trên kệ cao",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Đôi giày kia rất đẹp.",
                "sampleCasual": "Those shoes are very nice.",
                "sampleFormal": "Those shoes are very beautiful.",
                "keywords": [
                    "those",
                    "shoes",
                    "are",
                    "nice"
                ],
                "hints": [
                    {
                        "en": "shoes",
                        "vi": "đôi giày"
                    },
                    {
                        "en": "nice",
                        "vi": "đẹp"
                    }
                ],
                "grammarHint": "Trong tiếng Anh, 'shoes' luôn là danh từ số nhiều nên đi với 'Those ... are'.",
                "aiExplanation": {
                    "context_summary": "Khen một đôi giày trưng bày trên kệ cao trong cửa hàng.",
                    "grammar_points": [
                        "Trong tiếng Anh, những đồ vật đi theo cặp ('shoes', 'pants', 'glasses') luôn là danh từ SỐ NHIỀU.",
                        "Vì vậy phải dùng 'Those shoes are...' (không dùng 'That shoe is...')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I really like those shoes.",
                            "note_vi": "Cách khen đồ tự nhiên nhất khi đi mua sắm."
                        },
                        {
                            "en": "That pair of shoes is very nice.",
                            "note_vi": "Nếu dùng 'a pair of' (một đôi) thì lại chia số ít 'is'."
                        }
                    ],
                    "pro_tip": "Luôn nhớ: 'shoes' là số nhiều → 'Those shoes are...'. Chỉ dùng số ít khi có chữ 'pair' ('That pair of shoes is...')."
                }
            },
            {
                "id": "s1_t3_09",
                "context": "Tình huống 9/15 • Cầm nhầm túi xách ở quán cà phê",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Đây không phải là túi của tôi.",
                "sampleCasual": "This isn't my bag.",
                "sampleFormal": "This is not my bag.",
                "keywords": [
                    "this",
                    "isn't",
                    "bag"
                ],
                "hints": [
                    {
                        "en": "bag",
                        "vi": "túi xách"
                    }
                ],
                "grammarHint": "Câu phủ định với 'This': dùng 'This isn't' hoặc 'This is not'.",
                "aiExplanation": {
                    "context_summary": "Nói nhanh khi bạn phát hiện mình cầm nhầm túi xách của người khác.",
                    "grammar_points": [
                        "Câu phủ định với 'This': 'This isn't' (hoặc 'This is not').",
                        "Dùng 'This' vì chiếc túi đang nằm ngay trước mặt hoặc trên tay bạn."
                    ],
                    "native_alternatives": [
                        {
                            "en": "This bag isn't mine.",
                            "note_vi": "Dùng đại từ sở hữu 'mine' rất gọn và tự nhiên."
                        },
                        {
                            "en": "Oops, this isn't my bag.",
                            "note_vi": "Thêm 'Oops' nghe cực kỳ tự nhiên khi cầm nhầm đồ."
                        }
                    ],
                    "pro_tip": "Phủ định của 'This is' là 'This isn't' hoặc 'This is not' — tuyệt đối không dùng 'This don't'."
                }
            },
            {
                "id": "s1_t3_10",
                "context": "Tình huống 10/15 • Kiểm tra đúng chuyến xe buýt ở trạm",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Kia không phải là xe buýt của chúng ta.",
                "sampleCasual": "That isn't our bus.",
                "sampleFormal": "That is not our bus.",
                "keywords": [
                    "that",
                    "isn't",
                    "bus"
                ],
                "hints": [
                    {
                        "en": "bus",
                        "vi": "xe buýt"
                    }
                ],
                "grammarHint": "Câu phủ định với vật ở xa số ít dùng 'That isn't' hoặc 'That is not'.",
                "aiExplanation": {
                    "context_summary": "Báo cho bạn đi cùng biết chiếc xe buýt đang chạy tới không phải tuyến cần đi.",
                    "grammar_points": [
                        "Dùng 'That isn't' (hoặc 'That is not') cho 1 vật ở xa dạng phủ định.",
                        "Tính từ sở hữu 'our' (của chúng ta) đứng trước 'bus'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "That's not our bus.",
                            "note_vi": "Dạng rút gọn 'That's not' rất hay dùng khi nói gấp."
                        },
                        {
                            "en": "That's the wrong bus.",
                            "note_vi": "Cách nói ngắn gọn: 'Nhầm xe buýt rồi'."
                        }
                    ],
                    "pro_tip": "Khi nói nhanh, 'That's not' thường dễ phát âm và nhấn mạnh hơn 'That isn't'."
                }
            },
            {
                "id": "s1_t3_11",
                "context": "Tình huống 11/15 • Thử đồ trong cửa hàng quần áo",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Những chiếc áo này không đắt.",
                "sampleCasual": "These shirts aren't expensive.",
                "sampleFormal": "These shirts are not expensive.",
                "keywords": [
                    "these",
                    "shirts",
                    "aren't",
                    "expensive"
                ],
                "hints": [
                    {
                        "en": "shirts",
                        "vi": "những chiếc áo sơ mi"
                    },
                    {
                        "en": "expensive",
                        "vi": "đắt"
                    }
                ],
                "grammarHint": "Số nhiều ở gần dạng phủ định dùng 'These + N (số nhiều) + aren't + tính từ'.",
                "aiExplanation": {
                    "context_summary": "Nhận xét về giá cả khi đang cầm xem mấy chiếc áo trong cửa hàng.",
                    "grammar_points": [
                        "Số nhiều ở gần dạng phủ định: 'These + N (số nhiều) + aren't + tính từ'.",
                        "'shirts' có '-s' nên bắt buộc dùng 'aren't'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "These shirts are pretty affordable.",
                            "note_vi": "Nói theo hướng khẳng định ('giá khá phải chăng')."
                        },
                        {
                            "en": "These shirts aren't too pricey.",
                            "note_vi": "'pricey' là từ đồng nghĩa thân mật của 'expensive'."
                        }
                    ],
                    "pro_tip": "Nhớ phát âm rõ âm cuối /s/ của 'shirts' và âm /t/ của 'aren't' để người nghe hiểu đúng ý phủ định."
                }
            },
            {
                "id": "s1_t3_12",
                "context": "Tình huống 12/15 • Hỏi xác nhận ghế trống ở sân bay",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Những chiếc ghế kia không phải ghế của chúng ta.",
                "sampleCasual": "Those aren't our seats.",
                "sampleFormal": "Those seats do not belong to us.",
                "keywords": [
                    "those",
                    "aren't",
                    "seats"
                ],
                "hints": [
                    {
                        "en": "seats",
                        "vi": "những chiếc ghế / chỗ ngồi"
                    }
                ],
                "grammarHint": "Số nhiều ở xa dạng phủ định dùng 'Those aren't + our + danh từ số nhiều'.",
                "aiExplanation": {
                    "context_summary": "Nhắc người đi cùng khi thấy một dãy ghế ở xa không phải chỗ ngồi của mình.",
                    "grammar_points": [
                        "Số nhiều ở xa dạng phủ định: 'Those aren't + our + danh từ số nhiều'.",
                        "Danh từ 'seats' thêm '-s' để khớp với 'Those aren't'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Those seats aren't ours.",
                            "note_vi": "Dùng đại từ sở hữu 'ours' ở cuối câu."
                        },
                        {
                            "en": "Those aren't our seats—ours are over there.",
                            "note_vi": "Tự nhiên hơn trong ngữ cảnh thực tế ở sân bay/rạp phim."
                        }
                    ],
                    "pro_tip": "Ghi nhớ bảng 4 từ chỉ định: Gần (This / These) — Xa (That / Those); Số ít (is / isn't) — Số nhiều (are / aren't)."
                }
            },
            {
                "id": "s1_t3_13",
                "context": "Tình huống 13/15 • Hỏi đồng nghiệp về chiếc bút trên bàn",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Đây có phải là bút của bạn không?",
                "sampleCasual": "Is this your pen?",
                "sampleFormal": "Is this pen yours?",
                "keywords": [
                    "is",
                    "this",
                    "your",
                    "pen"
                ],
                "hints": [
                    {
                        "en": "pen",
                        "vi": "cây bút"
                    }
                ],
                "grammarHint": "Câu hỏi Yes/No với số ít ở gần: đảo 'Is' lên đầu câu -> 'Is this ...?'.",
                "aiExplanation": {
                    "context_summary": "Cầm cây bút trên bàn lên và hỏi xem có phải của đồng nghiệp không.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với vật số ít ở gần: đảo 'Is' lên đầu câu → 'Is this...?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is this pen yours?",
                            "note_vi": "Dùng 'yours' (của bạn) ở cuối câu."
                        },
                        {
                            "en": "Does this pen belong to you?",
                            "note_vi": "Trang trọng, lịch sự hơn."
                        }
                    ],
                    "pro_tip": "Trả lời câu hỏi 'Is this your pen?', người bản xứ thường dùng 'it': 'Yes, it is.' hoặc 'No, it isn't.' (ít lặp lại 'Yes, this is')."
                }
            },
            {
                "id": "s1_t3_14",
                "context": "Tình huống 14/15 • Hỏi về khách sạn nhìn thấy từ xa",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Kia có phải là khách sạn của bạn không?",
                "sampleCasual": "Is that your hotel?",
                "sampleFormal": "Is that hotel yours?",
                "keywords": [
                    "is",
                    "that",
                    "your",
                    "hotel"
                ],
                "hints": [
                    {
                        "en": "hotel",
                        "vi": "khách sạn"
                    }
                ],
                "grammarHint": "Câu hỏi Yes/No với vật ở xa số ít: đảo 'Is' lên đầu câu -> 'Is that ...?'.",
                "aiExplanation": {
                    "context_summary": "Chỉ vào tòa nhà khách sạn từ xa và hỏi xem có đúng khách sạn của bạn không.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với vật số ít ở xa: đảo 'Is' lên đầu câu → 'Is that...?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is that where you're staying?",
                            "note_vi": "Cách hỏi cực kỳ tự nhiên ('Đó có phải chỗ bạn đang ở không?')."
                        },
                        {
                            "en": "Is that your hotel over there?",
                            "note_vi": "Thêm 'over there' để nhấn mạnh khoảng cách xa."
                        }
                    ],
                    "pro_tip": "Chú ý trọng âm của 'hotel' rơi vào âm tiết thứ 2: /hoʊˈtel/, không đọc nhấn âm 1."
                }
            },
            {
                "id": "s1_t3_15",
                "context": "Tình huống 15/15 • Hỏi về đống sách trên bàn làm việc",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Đây có phải là những quyển sách của bạn không?",
                "sampleCasual": "Are these your books?",
                "sampleFormal": "Are these books yours?",
                "keywords": [
                    "are",
                    "these",
                    "your",
                    "books"
                ],
                "hints": [
                    {
                        "en": "books",
                        "vi": "những quyển sách"
                    }
                ],
                "grammarHint": "Câu hỏi Yes/No với số nhiều ở gần: đảo 'Are' lên đầu câu -> 'Are these ...?'.",
                "aiExplanation": {
                    "context_summary": "Chỉ vào chồng sách ngay trước mặt và hỏi xem có phải của bạn không.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với vật số nhiều ở gần: đảo 'Are' lên đầu câu → 'Are these...?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are these books yours?",
                            "note_vi": "Cách hỏi tương đương dùng 'yours'."
                        },
                        {
                            "en": "Are these your books here?",
                            "note_vi": "Nhấn mạnh đống sách ngay tại đây."
                        }
                    ],
                    "pro_tip": "Trả lời cho 'Are these / Are those...?', ta dùng 'they': 'Yes, they are.' hoặc 'No, they aren't.'."
                }
            }
        ]
    },
    {
        "id": "struct_have_has_a1",
        "number": 4,
        "stageId": "stage_1",
        "stage": "Chặng 1: Khởi động & Giới thiệu bản thân",
        "orderInStage": 4,
        "level": "A1",
        "topics": [
            "daily",
            "food_shop",
            "travel",
            "office"
        ],
        "title": "Động từ Have / Has — Nói về gia đình, đồ vật & đặc điểm cá nhân",
        "shortName": "Have / Has",
        "formula": "(+) S + have/has + N | (-) S + don't/doesn't have + N | (?) Do/Does + S + have + N?",
        "description": "Dùng để nói về những gì bạn hoặc người khác sở hữu như thành viên gia đình, đồ dùng cá nhân, thú cưng hay đặc điểm ngoại hình.",
        "tips": [
            "• I, You, We, They và danh từ số nhiều đi với have; He, She, It và danh từ số ít đi với has.",
            "• Phủ định: dùng don't have (với I/You/We/They) và doesn't have (với He/She/It — nhớ đưa has về nguyên mẫu have).",
            "• Câu hỏi: đảo Do / Does lên đầu câu và luôn giữ nguyên mẫu have (VD: Does she have a car?)."
        ],
        "requiredPatterns": [
            "have",
            "has",
            "haven't",
            "hasn't",
            "don't have",
            "doesn't have"
        ],
        "situations": [
            {
                "id": "s1_t4_01",
                "context": "Tình huống 1/15 • Giới thiệu gia đình với bạn mới",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Tôi có hai người con.",
                "sampleCasual": "I have two children.",
                "sampleFormal": "I have two kids.",
                "keywords": [
                    "i",
                    "have",
                    "two",
                    "children"
                ],
                "hints": [
                    {
                        "en": "children",
                        "vi": "những đứa con"
                    }
                ],
                "grammarHint": "Chủ ngữ 'I' đi với 'have'; số nhiều của 'child' là 'children'.",
                "aiExplanation": {
                    "context_summary": "Câu giới thiệu quen thuộc về gia đình khi trò chuyện với bạn mới.",
                    "grammar_points": [
                        "Chủ ngữ 'I' đi với động từ 'have'.",
                        "'children' là dạng số nhiều bất quy tắc của 'child' (KHÔNG thêm '-s' thành 'childrens')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I have two kids.",
                            "note_vi": "'kids' rất tự nhiên và phổ biến trong giao tiếp đời thường."
                        },
                        {
                            "en": "I've got two children.",
                            "note_vi": "Cách nói phổ biến ở Anh-Anh (UK)."
                        }
                    ],
                    "pro_tip": "Tuyệt đối tránh viết 'two childs' hoặc 'two childrens'. Số ít là 'one child', số nhiều là 'two children'."
                }
            },
            {
                "id": "s1_t4_02",
                "context": "Tình huống 2/15 • Kể về thú cưng trong nhà",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Chúng tôi có một con chó nhỏ.",
                "sampleCasual": "We have a small dog.",
                "sampleFormal": "We have a little dog.",
                "keywords": [
                    "we",
                    "have",
                    "small",
                    "dog"
                ],
                "hints": [
                    {
                        "en": "small",
                        "vi": "nhỏ"
                    },
                    {
                        "en": "dog",
                        "vi": "con chó"
                    }
                ],
                "grammarHint": "Chủ ngữ số nhiều 'We' đi với 'have + a + tính từ + danh từ'.",
                "aiExplanation": {
                    "context_summary": "Kể về thú cưng trong gia đình một cách gần gũi.",
                    "grammar_points": [
                        "Chủ ngữ số nhiều 'We' đi với 'have'.",
                        "Danh từ đếm được số ít ('dog') cần có mạo từ 'a' phía trước ('a small dog')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We have a little dog.",
                            "note_vi": "'little' mang sắc thái dễ thương, âu yếm hơn 'small'."
                        },
                        {
                            "en": "We've got a small dog.",
                            "note_vi": "Rất tự nhiên trong văn nói."
                        }
                    ],
                    "pro_tip": "Tránh nói 'We have small dog' thiếu 'a'."
                }
            },
            {
                "id": "s1_t4_03",
                "context": "Tình huống 3/15 • Mô tả ngoại hình của chị gái",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Cô ấy có mái tóc đen dài.",
                "sampleCasual": "She has long black hair.",
                "sampleFormal": "She has long, black hair.",
                "keywords": [
                    "she",
                    "has",
                    "long",
                    "black",
                    "hair"
                ],
                "hints": [
                    {
                        "en": "long",
                        "vi": "dài"
                    },
                    {
                        "en": "hair",
                        "vi": "tóc"
                    }
                ],
                "grammarHint": "Chủ ngữ 'She' đi với 'has'. 'Hair' không đếm được nên không dùng 'a'.",
                "aiExplanation": {
                    "context_summary": "Dùng để mô tả đặc điểm ngoại hình (mái tóc) của một người nữ.",
                    "grammar_points": [
                        "Chủ ngữ ngôi thứ 3 số ít 'She' bắt buộc dùng 'has' (không dùng 'have').",
                        "'hair' (mái tóc) là danh từ KHÔNG đếm được nên không dùng 'a' và không thêm '-s'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "She's got long black hair.",
                            "note_vi": "Cách nói thân mật của người bản xứ."
                        },
                        {
                            "en": "Her hair is long and black.",
                            "note_vi": "Dùng cấu trúc To be để miêu tả."
                        }
                    ],
                    "pro_tip": "Trật tự tính từ chuẩn: Độ dài đứng trước màu sắc ('long black hair', không nói 'black long hair')."
                }
            },
            {
                "id": "s1_t4_04",
                "context": "Tình huống 4/15 • Nói về phương tiện đi làm của đồng nghiệp",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Anh ấy có một chiếc ô tô mới.",
                "sampleCasual": "He has a new car.",
                "sampleFormal": "He owns a new car.",
                "keywords": [
                    "he",
                    "has",
                    "new",
                    "car"
                ],
                "hints": [
                    {
                        "en": "new",
                        "vi": "mới"
                    },
                    {
                        "en": "car",
                        "vi": "ô tô"
                    }
                ],
                "grammarHint": "Chủ ngữ 'He' đi với 'has + a + new + car'.",
                "aiExplanation": {
                    "context_summary": "Nói về tài sản/phương tiện mới của một đồng nghiệp nam.",
                    "grammar_points": [
                        "Chủ ngữ 'He' đi với 'has'.",
                        "Cụm danh từ số ít: 'a new car'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He just bought a new car.",
                            "note_vi": "Nhấn mạnh việc anh ấy vừa mới mua ô tô."
                        },
                        {
                            "en": "He's got a new car.",
                            "note_vi": "Tự nhiên trong văn nói hàng ngày."
                        }
                    ],
                    "pro_tip": "Nhớ chia 'has' cho 'He/She/It' ở câu khẳng định ('He has', không nói 'He have')."
                }
            },
            {
                "id": "s1_t4_05",
                "context": "Tình huống 5/15 • Nói về ngôi nhà của bạn bè",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Họ có một ngôi nhà lớn ở Hà Nội.",
                "sampleCasual": "They have a big house in Hanoi.",
                "sampleFormal": "They have a large house in Hanoi.",
                "keywords": [
                    "they",
                    "have",
                    "big",
                    "house",
                    "hanoi"
                ],
                "hints": [
                    {
                        "en": "big house",
                        "vi": "ngôi nhà lớn"
                    }
                ],
                "grammarHint": "Chủ ngữ 'They' đi với 'have'; địa điểm thành phố dùng giới từ 'in'.",
                "aiExplanation": {
                    "context_summary": "Kể về nơi ở của một gia đình hoặc nhóm bạn.",
                    "grammar_points": [
                        "Chủ ngữ số nhiều 'They' đi với 'have'.",
                        "Dùng giới từ 'in' trước tên thành phố ('in Hanoi')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "They live in a big house in Hanoi.",
                            "note_vi": "Nhấn mạnh việc họ đang sinh sống ở đó."
                        },
                        {
                            "en": "They own a large house in Hanoi.",
                            "note_vi": "'own' nhấn mạnh quyền sở hữu, trang trọng hơn."
                        }
                    ],
                    "pro_tip": "Luôn dùng 'in' trước tên thành phố và quốc gia (in Hanoi, in Vietnam)."
                }
            },
            {
                "id": "s1_t4_06",
                "context": "Tình huống 6/15 • Thông báo lịch họp ở công ty",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Tôi có một cuộc họp vào hôm nay.",
                "sampleCasual": "I have a meeting today.",
                "sampleFormal": "I have a meeting scheduled today.",
                "keywords": [
                    "i",
                    "have",
                    "meeting",
                    "today"
                ],
                "hints": [
                    {
                        "en": "meeting",
                        "vi": "cuộc họp"
                    },
                    {
                        "en": "today",
                        "vi": "hôm nay"
                    }
                ],
                "grammarHint": "Dùng 'I have a meeting today' (không cần giới từ trước 'today').",
                "aiExplanation": {
                    "context_summary": "Thông báo nhanh về lịch trình công việc trong ngày với đồng nghiệp.",
                    "grammar_points": [
                        "Chủ ngữ 'I' đi với 'have + a meeting'.",
                        "Không dùng giới từ ('in/on/at') trước 'today', 'tomorrow', 'yesterday'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I've got a meeting today.",
                            "note_vi": "Tự nhiên trong văn nói công sở."
                        },
                        {
                            "en": "I have a meeting scheduled for today.",
                            "note_vi": "Trang trọng, chuyên nghiệp hơn."
                        }
                    ],
                    "pro_tip": "Tránh viết 'on today' hay 'in today'. Chỉ cần đặt gọn chữ 'today' ở cuối câu."
                }
            },
            {
                "id": "s1_t4_07",
                "context": "Tình huống 7/15 • Chuẩn bị giấy tờ trước khi ra sân bay",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Minh có hộ chiếu và vé rồi.",
                "sampleCasual": "Minh has his passport and ticket.",
                "sampleFormal": "Minh has a passport and a ticket.",
                "keywords": [
                    "minh",
                    "has",
                    "passport",
                    "ticket"
                ],
                "hints": [
                    {
                        "en": "passport",
                        "vi": "hộ chiếu"
                    },
                    {
                        "en": "ticket",
                        "vi": "vé"
                    }
                ],
                "grammarHint": "Tên riêng 1 người ('Minh') là ngôi thứ 3 số ít nên đi với 'has'.",
                "aiExplanation": {
                    "context_summary": "Xác nhận giấy tờ đi lại đã đầy đủ trước giờ ra sân bay.",
                    "grammar_points": [
                        "Tên riêng 1 người ('Minh') tương đương với 'He' nên đi với 'has'.",
                        "Tính từ sở hữu 'his' dùng chung cho cả 'passport and ticket'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Minh already has his passport and ticket.",
                            "note_vi": "Thêm 'already' để nhấn mạnh nghĩa 'đã có rồi'."
                        },
                        {
                            "en": "Minh's got his passport and ticket.",
                            "note_vi": "Tự nhiên trong văn nói."
                        }
                    ],
                    "pro_tip": "Bất kỳ tên riêng 1 người nào (Minh, Lan, John...) đều chia như ngôi thứ 3 số ít → dùng 'has'."
                }
            },
            {
                "id": "s1_t4_08",
                "context": "Tình huống 8/15 • Thanh toán tiền ở cửa hàng",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Tôi không có tiền mặt.",
                "sampleCasual": "I don't have any cash.",
                "sampleFormal": "I do not have cash.",
                "keywords": [
                    "don't",
                    "have",
                    "cash"
                ],
                "hints": [
                    {
                        "en": "cash",
                        "vi": "tiền mặt"
                    }
                ],
                "grammarHint": "Phủ định với 'I' dùng 'I don't have'; có thể thêm 'any' trước danh từ không đếm được 'cash'.",
                "aiExplanation": {
                    "context_summary": "Câu cực kỳ cần thiết khi đi mua sắm, ăn uống và muốn hỏi thanh toán bằng thẻ/chuyển khoản.",
                    "grammar_points": [
                        "Phủ định của 'have' với chủ ngữ 'I' là 'don't have'.",
                        "'cash' không đếm được; trong câu phủ định thường thêm 'any' ('any cash') nghe sẽ tự nhiên hơn."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I don't have cash on me.",
                            "note_vi": "'on me' nghĩa là 'mang theo bên người' — cực kỳ chuẩn bản xứ!"
                        },
                        {
                            "en": "I'm out of cash.",
                            "note_vi": "Nghĩa là 'Mình hết tiền mặt rồi'."
                        }
                    ],
                    "pro_tip": "Khi nói chuyện ở cửa hàng, thêm 'on me' ('I don't have any cash on me') sẽ khiến câu tiếng Anh của bạn tự nhiên gấp đôi."
                }
            },
            {
                "id": "s1_t4_09",
                "context": "Tình huống 9/15 • Từ chối lời mời đi cà phê vì bận",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Chúng tôi không có thời gian hôm nay.",
                "sampleCasual": "We don't have time today.",
                "sampleFormal": "We do not have time today.",
                "keywords": [
                    "we",
                    "don't",
                    "have",
                    "time",
                    "today"
                ],
                "hints": [
                    {
                        "en": "time",
                        "vi": "thời gian"
                    }
                ],
                "grammarHint": "Phủ định với 'We' dùng 'We don't have + time + today'.",
                "aiExplanation": {
                    "context_summary": "Dùng để từ chối khéo lời mời hoặc báo lịch bận trong ngày.",
                    "grammar_points": [
                        "Phủ định với chủ ngữ 'We': 'We don't have'.",
                        "'time' (thời gian) là danh từ không đếm được nên không dùng 'a'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We're too busy today.",
                            "note_vi": "Diễn đạt tương đương: 'Hôm nay chúng tôi bận quá'."
                        },
                        {
                            "en": "We don't have any free time today.",
                            "note_vi": "Rõ nghĩa hơn ('không có thời gian rảnh')."
                        }
                    ],
                    "pro_tip": "Nhớ không dùng giới từ trước 'today' ('We don't have time today')."
                }
            },
            {
                "id": "s1_t4_10",
                "context": "Tình huống 10/15 • Hỏi thăm về anh chị em của bạn",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Anh ấy không có anh em trai.",
                "sampleCasual": "He doesn't have a brother.",
                "sampleFormal": "He does not have any brothers.",
                "keywords": [
                    "he",
                    "doesn't",
                    "have",
                    "brother"
                ],
                "hints": [
                    {
                        "en": "brother",
                        "vi": "anh/em trai"
                    }
                ],
                "grammarHint": "Phủ định với 'He' dùng 'doesn't have' (đưa 'has' về nguyên mẫu 'have').",
                "aiExplanation": {
                    "context_summary": "Chia sẻ thông tin về anh chị em trong gia đình của một người nam.",
                    "grammar_points": [
                        "Phủ định ngôi thứ 3 số ít ('He') dùng trợ động từ 'doesn't'.",
                        "Quy tắc vàng: Sau 'doesn't', động từ 'has' PHẢI trả về nguyên mẫu là 'have' ('doesn't have')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "He doesn't have any brothers.",
                            "note_vi": "Dùng 'any + số nhiều' rất tự nhiên để khẳng định không có anh/em trai nào."
                        },
                        {
                            "en": "He has no brothers.",
                            "note_vi": "Ngắn gọn, nhấn mạnh hơn."
                        }
                    ],
                    "pro_tip": "Tuyệt đối tránh viết 'He doesn't has a brother'. Đã có 'doesn't' thì phía sau luôn là 'have'."
                }
            },
            {
                "id": "s1_t4_11",
                "context": "Tình huống 11/15 • Làm việc tại văn phòng",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Cô ấy không có máy tính xách tay.",
                "sampleCasual": "She doesn't have a laptop.",
                "sampleFormal": "She does not have a laptop.",
                "keywords": [
                    "she",
                    "doesn't",
                    "have",
                    "laptop"
                ],
                "hints": [
                    {
                        "en": "laptop",
                        "vi": "máy tính xách tay"
                    }
                ],
                "grammarHint": "Chủ ngữ 'She' dạng phủ định: 'She doesn't have + a + laptop'.",
                "aiExplanation": {
                    "context_summary": "Nói về thiết bị làm việc của một đồng nghiệp nữ.",
                    "grammar_points": [
                        "Chủ ngữ 'She' dạng phủ định dùng 'doesn't have' (nguyên mẫu 'have').",
                        "Danh từ đếm được số ít 'laptop' cần mạo từ 'a'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "She doesn't own a laptop.",
                            "note_vi": "Trang trọng hơn một chút."
                        },
                        {
                            "en": "She hasn't got a laptop.",
                            "note_vi": "Cách nói phổ biến ở Anh-Anh (UK)."
                        }
                    ],
                    "pro_tip": "Luôn kiểm tra lại: 'She has a laptop' (+) → 'She doesn't have a laptop' (-)."
                }
            },
            {
                "id": "s1_t4_12",
                "context": "Tình huống 12/15 • Mượn đồ dùng văn phòng",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Bạn có bút không?",
                "sampleCasual": "Do you have a pen?",
                "sampleFormal": "Do you have a pen with you?",
                "keywords": [
                    "do",
                    "you",
                    "have",
                    "pen"
                ],
                "hints": [
                    {
                        "en": "pen",
                        "vi": "cây bút"
                    }
                ],
                "grammarHint": "Câu hỏi Yes/No với 'you': đảo 'Do' lên đầu câu -> 'Do you have + a + pen?'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi ngắn gọn, thông dụng nhất khi muốn mượn bút ở văn phòng hoặc lớp học.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với 'have': đảo 'Do' lên trước 'you' → 'Do you have + a + N?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Do you have a pen I could borrow?",
                            "note_vi": "Lịch sự hơn nhiều khi muốn mượn đồ của người khác."
                        },
                        {
                            "en": "Have you got a pen?",
                            "note_vi": "Cách hỏi quen thuộc trong tiếng Anh-Anh (UK)."
                        }
                    ],
                    "pro_tip": "Tránh hỏi cộc lốc 'You have a pen?'. Hãy tập thói quen luôn mở đầu bằng 'Do you have...'."
                }
            },
            {
                "id": "s1_t4_13",
                "context": "Tình huống 13/15 • Hỏi nhân viên quán ăn về thực đơn",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Các bạn có thực đơn tiếng Anh không?",
                "sampleCasual": "Do you have an English menu?",
                "sampleFormal": "Do you have a menu in English?",
                "keywords": [
                    "do",
                    "you",
                    "have",
                    "english",
                    "menu"
                ],
                "hints": [
                    {
                        "en": "English menu",
                        "vi": "thực đơn tiếng Anh"
                    }
                ],
                "grammarHint": "Trước 'English' (bắt đầu bằng nguyên âm 'e') dùng mạo từ 'an'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi cực kỳ hữu ích khi đi du lịch nước ngoài và vào nhà hàng địa phương.",
                    "grammar_points": [
                        "Câu hỏi với 'you' (ở đây chỉ nhà hàng/nhân viên) dùng 'Do you have...?'.",
                        "Từ 'English' bắt đầu bằng âm nguyên âm /ɪ/ nên bắt buộc dùng mạo từ 'an' ('an English menu')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Do you have a menu in English?",
                            "note_vi": "Cách diễn đạt tương đương, rất rõ ràng."
                        },
                        {
                            "en": "Could I see an English menu, please?",
                            "note_vi": "Lịch sự hơn khi gọi nhân viên phục vụ."
                        }
                    ],
                    "pro_tip": "Nhớ viết hoa chữ 'E' trong 'English' và dùng 'an' phía trước ('an English menu')."
                }
            },
            {
                "id": "s1_t4_14",
                "context": "Tình huống 14/15 • Hỏi về gia đình của đồng nghiệp nữ",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Cô ấy có chị gái không?",
                "sampleCasual": "Does she have a sister?",
                "sampleFormal": "Does she have an older sister?",
                "keywords": [
                    "does",
                    "she",
                    "have",
                    "sister"
                ],
                "hints": [
                    {
                        "en": "sister",
                        "vi": "chị/em gái"
                    }
                ],
                "grammarHint": "Câu hỏi với 'she': dùng 'Does she have ...?' (không dùng 'has' sau 'Does').",
                "aiExplanation": {
                    "context_summary": "Hỏi thăm về gia đình của một người bạn hoặc đồng nghiệp nữ.",
                    "grammar_points": [
                        "Chủ ngữ 'she' mượn trợ động từ 'Does' ở đầu câu hỏi.",
                        "Sau 'Does', động từ luôn giữ nguyên mẫu 'have' ('Does she have...?', KHÔNG viết 'Does she has')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Does she have an older sister?",
                            "note_vi": "Hỏi rõ là 'chị gái' (vì 'sister' nói chung có thể là chị hoặc em gái)."
                        },
                        {
                            "en": "Does she have any sisters?",
                            "note_vi": "Hỏi xem cô ấy có chị/em gái nào không."
                        }
                    ],
                    "pro_tip": "Trong tiếng Anh, 'sister' dùng cho cả chị gái và em gái. Nếu muốn phân biệt rõ, dùng 'older sister' (chị gái) hoặc 'younger sister' (em gái)."
                }
            },
            {
                "id": "s1_t4_15",
                "context": "Tình huống 15/15 • Hỏi thông tin phòng khách sạn",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Khách sạn này có wifi miễn phí không?",
                "sampleCasual": "Does this hotel have free wifi?",
                "sampleFormal": "Does this hotel have free Wi-Fi?",
                "keywords": [
                    "does",
                    "hotel",
                    "have",
                    "free",
                    "wifi"
                ],
                "hints": [
                    {
                        "en": "free wifi",
                        "vi": "wifi miễn phí"
                    }
                ],
                "grammarHint": "'This hotel' là danh từ số ít nên đảo 'Does' lên đầu câu và giữ nguyên mẫu 'have'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi gần như ai đi du lịch cũng cần dùng khi nhận phòng khách sạn.",
                    "grammar_points": [
                        "'this hotel' là danh từ số ít (tương đương 'it') nên câu hỏi đảo 'Does' lên đầu câu.",
                        "Động từ chính giữ nguyên mẫu 'have'; 'wifi' không đếm được nên không dùng 'a'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is there free Wi-Fi here?",
                            "note_vi": "Cách hỏi gọn hơn bằng 'Is there...'."
                        },
                        {
                            "en": "Do you offer free Wi-Fi?",
                            "note_vi": "Hỏi trực tiếp nhân viên lễ tân."
                        }
                    ],
                    "pro_tip": "Nhớ phát âm 'Wi-Fi' là /ˈwaɪ.faɪ/ (không đọc là 'uy-phi')."
                }
            }
        ]
    },
    {
        "id": "struct_there_is_are_a1",
        "number": 5,
        "stageId": "stage_1",
        "stage": "Chặng 1: Khởi động & Giới thiệu bản thân",
        "orderInStage": 5,
        "level": "A1",
        "topics": [
            "daily",
            "food_shop",
            "travel",
            "office"
        ],
        "title": "There is / There are — Mô tả phòng ốc & địa điểm xung quanh",
        "shortName": "There is / There are",
        "formula": "(+) There is + N (số ít) / There are + N (số nhiều) | (-) There isn't/aren't | (?) Is/Are there...?",
        "description": "Dùng để giới thiệu sự tồn tại của người, đồ vật hoặc địa điểm ở một nơi nào đó (trong phòng, trong nhà, ngoài phố).",
        "tips": [
            "• Dùng There is (rút gọn: There's) với danh từ số ít (a/an) hoặc danh từ không đếm được (water, milk).",
            "• Dùng There are với danh từ số nhiều (two, three, many, some + N-s/es).",
            "• Phủ định dùng There isn't / There aren't (thường đi kèm 'any'); câu hỏi đảo Is / Are lên đầu câu."
        ],
        "requiredPatterns": [
            "there is",
            "there's",
            "there are",
            "there isn't",
            "there aren't",
            "is there",
            "are there"
        ],
        "situations": [
            {
                "id": "s1_t5_01",
                "context": "Tình huống 1/15 • Mô tả nội thất phòng khách",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có một cái bàn lớn trong phòng khách.",
                "sampleCasual": "There is a big table in the living room.",
                "sampleFormal": "There's a large table in the living room.",
                "keywords": [
                    "there is",
                    "big",
                    "table",
                    "living room"
                ],
                "hints": [
                    {
                        "en": "table",
                        "vi": "cái bàn"
                    },
                    {
                        "en": "living room",
                        "vi": "phòng khách"
                    }
                ],
                "grammarHint": "'a big table' là danh từ số ít nên dùng 'There is + a + tính từ + danh từ'.",
                "aiExplanation": {
                    "context_summary": "Dùng để mô tả nội thất trong nhà khi giới thiệu không gian sống.",
                    "grammar_points": [
                        "Dùng 'There is' (có) cho danh từ đếm được số ít ('a big table').",
                        "Dùng giới từ 'in' cho không gian bên trong phòng ('in the living room')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There's a large table in the living room.",
                            "note_vi": "Rút gọn 'There's' nghe trôi chảy hơn trong văn nói."
                        },
                        {
                            "en": "Our living room has a big table.",
                            "note_vi": "Diễn đạt bằng động từ 'have'."
                        }
                    ],
                    "pro_tip": "Người Việt hay dịch 'Có một cái bàn...' thành 'Have a big table...'. Trong tiếng Anh, diễn tả sự tồn tại luôn phải dùng 'There is / There are'."
                }
            },
            {
                "id": "s1_t5_02",
                "context": "Tình huống 2/15 • Giới thiệu số phòng trong nhà",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có hai phòng ngủ trong nhà tôi.",
                "sampleCasual": "There are two bedrooms in my house.",
                "sampleFormal": "There are two bedrooms in our house.",
                "keywords": [
                    "there are",
                    "two",
                    "bedrooms",
                    "house"
                ],
                "hints": [
                    {
                        "en": "bedrooms",
                        "vi": "phòng ngủ"
                    }
                ],
                "grammarHint": "Số nhiều ('two bedrooms') dùng 'There are' và nhớ thêm 's' vào 'bedrooms'.",
                "aiExplanation": {
                    "context_summary": "Giới thiệu số lượng phòng ngủ trong nhà mình.",
                    "grammar_points": [
                        "Dùng 'There are' cho danh từ đếm được SỐ NHIỀU ('two bedrooms').",
                        "Đừng quên thêm '-s' vào 'bedrooms'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "My house has two bedrooms.",
                            "note_vi": "Cách nói ngắn gọn, tự nhiên tương đương."
                        },
                        {
                            "en": "It's a two-bedroom house.",
                            "note_vi": "Cách nói rất chuẩn bản xứ khi tả nhà cửa."
                        }
                    ],
                    "pro_tip": "Không rút gọn 'There are' thành 'There's' trong văn viết chuẩn khi đi với số nhiều ('two bedrooms')."
                }
            },
            {
                "id": "s1_t5_03",
                "context": "Tình huống 3/15 • Chỉ điểm hẹn gần nhà",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có một quán cà phê gần nhà tôi.",
                "sampleCasual": "There is a coffee shop near my house.",
                "sampleFormal": "There's a cafe near my house.",
                "keywords": [
                    "there is",
                    "coffee shop",
                    "near",
                    "house"
                ],
                "hints": [
                    {
                        "en": "coffee shop",
                        "vi": "quán cà phê"
                    },
                    {
                        "en": "near",
                        "vi": "gần"
                    }
                ],
                "grammarHint": "Dùng 'There is a coffee shop' + giới từ chỉ vị trí 'near my house'.",
                "aiExplanation": {
                    "context_summary": "Chỉ một địa điểm tiện lợi ngay gần nhà để hẹn bạn bè.",
                    "grammar_points": [
                        "Dùng 'There is' với 1 địa điểm số ít ('a coffee shop').",
                        "Giới từ 'near' đi thẳng với 'my house' (không thêm 'to')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There's a cafe near my house.",
                            "note_vi": "'cafe' ngắn gọn và rất phổ biến."
                        },
                        {
                            "en": "There's a coffee shop close to my place.",
                            "note_vi": "'my place' là cách gọi nhà mình rất thân mật."
                        }
                    ],
                    "pro_tip": "Phân biệt 'coffee' (cà phê — đồ uống) và 'coffee shop' (quán cà phê)."
                }
            },
            {
                "id": "s1_t5_04",
                "context": "Tình huống 4/15 • Mô tả không khí văn phòng",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có nhiều người trong văn phòng hôm nay.",
                "sampleCasual": "There are many people in the office today.",
                "sampleFormal": "There are a lot of people in the office today.",
                "keywords": [
                    "there are",
                    "many",
                    "people",
                    "office"
                ],
                "hints": [
                    {
                        "en": "many people",
                        "vi": "nhiều người"
                    },
                    {
                        "en": "office",
                        "vi": "văn phòng"
                    }
                ],
                "grammarHint": "'people' là danh từ số nhiều nên luôn đi với 'There are'.",
                "aiExplanation": {
                    "context_summary": "Nhận xét về không khí đông đúc tại văn phòng hôm nay.",
                    "grammar_points": [
                        "'people' là danh từ số nhiều bất quy tắc (của 'person') nên bắt buộc đi với 'There are'.",
                        "'many' dùng trước danh từ đếm được số nhiều."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There are a lot of people in the office today.",
                            "note_vi": "Trong câu khẳng định văn nói, 'a lot of' nghe tự nhiên hơn 'many'."
                        },
                        {
                            "en": "The office is really crowded today.",
                            "note_vi": "Mô tả trực tiếp bằng tính từ 'crowded' (đông đúc)."
                        }
                    ],
                    "pro_tip": "Không bao giờ thêm '-s' vào 'people' (không viết 'peoples' khi chỉ nhiều người) và luôn chia động từ số nhiều ('There are')."
                }
            },
            {
                "id": "s1_t5_05",
                "context": "Tình huống 5/15 • Mời khách uống nước",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có một ít nước trên bàn.",
                "sampleCasual": "There is some water on the table.",
                "sampleFormal": "There's some water on the table.",
                "keywords": [
                    "there is",
                    "some",
                    "water",
                    "table"
                ],
                "hints": [
                    {
                        "en": "some water",
                        "vi": "một ít nước"
                    },
                    {
                        "en": "on the table",
                        "vi": "trên bàn"
                    }
                ],
                "grammarHint": "'water' là danh từ không đếm được nên đi với 'There is' (không dùng 'There are').",
                "aiExplanation": {
                    "context_summary": "Mời khách uống nước hoặc chỉ chỗ để nước trên bàn.",
                    "grammar_points": [
                        "'water' là danh từ KHÔNG đếm được nên luôn đi với 'There is' (KHÔNG dùng 'There are').",
                        "Dùng 'some' (một ít) trong câu khẳng định với danh từ không đếm được."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There's some water on the table.",
                            "note_vi": "Rút gọn 'There's' rất tự nhiên khi nói."
                        },
                        {
                            "en": "Help yourself to some water on the table.",
                            "note_vi": "Cách mời khách tự nhiên như ở nhà."
                        }
                    ],
                    "pro_tip": "Quy tắc dễ nhớ: Danh từ không đếm được (water, milk, coffee, money, time) luôn chia như SỐ ÍT → dùng 'There is'."
                }
            },
            {
                "id": "s1_t5_06",
                "context": "Tình huống 6/15 • Giới thiệu khu vực quanh khách sạn",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có một công viên đẹp gần khách sạn.",
                "sampleCasual": "There is a nice park near the hotel.",
                "sampleFormal": "There is a beautiful park near the hotel.",
                "keywords": [
                    "there is",
                    "nice",
                    "park",
                    "hotel"
                ],
                "hints": [
                    {
                        "en": "park",
                        "vi": "công viên"
                    },
                    {
                        "en": "hotel",
                        "vi": "khách sạn"
                    }
                ],
                "grammarHint": "Một địa điểm số ít dùng 'There is + a + nice + park'.",
                "aiExplanation": {
                    "context_summary": "Giới thiệu tiện ích xung quanh khách sạn cho bạn đồng hành.",
                    "grammar_points": [
                        "Dùng 'There is' cho 1 địa điểm số ít ('a nice park').",
                        "Dùng 'the hotel' vì cả hai đều biết rõ khách sạn đang ở."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There's a lovely park near the hotel.",
                            "note_vi": "'lovely' mang sắc thái khen ngợi dễ thương, thư giãn."
                        },
                        {
                            "en": "There is a park right next to the hotel.",
                            "note_vi": "Nhấn mạnh công viên nằm ngay sát bên cạnh."
                        }
                    ],
                    "pro_tip": "Đừng quên mạo từ 'a' trước 'nice park' ('There is a nice park')."
                }
            },
            {
                "id": "s1_t5_07",
                "context": "Tình huống 7/15 • Kiểm tra đồ ăn trong bếp",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "affirmative",
                "vi": "Có ba quả táo trong tủ lạnh.",
                "sampleCasual": "There are three apples in the fridge.",
                "sampleFormal": "There are three apples in the refrigerator.",
                "keywords": [
                    "there are",
                    "three",
                    "apples",
                    "fridge"
                ],
                "hints": [
                    {
                        "en": "apples",
                        "vi": "những quả táo"
                    },
                    {
                        "en": "fridge",
                        "vi": "tủ lạnh"
                    }
                ],
                "grammarHint": "Dùng 'There are' cho danh từ đếm được số nhiều ('three apples').",
                "aiExplanation": {
                    "context_summary": "Kiểm tra đồ ăn còn sẵn trong tủ lạnh ở nhà.",
                    "grammar_points": [
                        "Số nhiều đếm được ('three apples') đi với 'There are'.",
                        "'fridge' là dạng viết ngắn cực kỳ thông dụng của 'refrigerator'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "We have three apples in the fridge.",
                            "note_vi": "Dùng 'We have' cũng rất tự nhiên trong gia đình."
                        },
                        {
                            "en": "There are three apples left in the fridge.",
                            "note_vi": "Thêm 'left' mang nghĩa 'còn lại 3 quả táo'."
                        }
                    ],
                    "pro_tip": "Trong giao tiếp hàng ngày, người bản xứ gần như luôn nói 'fridge' thay vì 'refrigerator' vì ngắn và dễ đọc hơn nhiều."
                }
            },
            {
                "id": "s1_t5_08",
                "context": "Tình huống 8/15 • Mô tả phòng ngủ tối giản",
                "topic": "daily",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Không có tivi trong phòng ngủ của tôi.",
                "sampleCasual": "There isn't a TV in my bedroom.",
                "sampleFormal": "There is not a TV in my bedroom.",
                "keywords": [
                    "there isn't",
                    "tv",
                    "bedroom"
                ],
                "hints": [
                    {
                        "en": "TV",
                        "vi": "tivi"
                    },
                    {
                        "en": "bedroom",
                        "vi": "phòng ngủ"
                    }
                ],
                "grammarHint": "Phủ định số ít dùng 'There isn't a + danh từ'.",
                "aiExplanation": {
                    "context_summary": "Mô tả không gian phòng ngủ đơn giản, không có tivi.",
                    "grammar_points": [
                        "Phủ định số ít dùng 'There isn't + a + danh từ' ('There isn't a TV')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "I don't have a TV in my bedroom.",
                            "note_vi": "Cách nói rất tự nhiên dùng 'I don't have'."
                        },
                        {
                            "en": "There's no TV in my bedroom.",
                            "note_vi": "Dùng 'There's no + N' (bỏ 'a') cực kỳ gọn và hay dùng khi nói."
                        }
                    ],
                    "pro_tip": "So sánh 2 cách nói phủ định: 'There isn't a TV' (có 'a') vs. 'There is no TV' (không có 'a')."
                }
            },
            {
                "id": "s1_t5_09",
                "context": "Tình huống 9/15 • Pha cà phê buổi sáng",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Không còn sữa trong tủ lạnh.",
                "sampleCasual": "There isn't any milk in the fridge.",
                "sampleFormal": "There is no milk in the fridge.",
                "keywords": [
                    "there isn't",
                    "any",
                    "milk",
                    "fridge"
                ],
                "hints": [
                    {
                        "en": "milk",
                        "vi": "sữa"
                    },
                    {
                        "en": "fridge",
                        "vi": "tủ lạnh"
                    }
                ],
                "grammarHint": "'milk' không đếm được nên dạng phủ định dùng 'There isn't any milk'.",
                "aiExplanation": {
                    "context_summary": "Nói khi mở tủ lạnh ra pha cà phê hoặc ăn sáng mà thấy hết sữa.",
                    "grammar_points": [
                        "'milk' là danh từ không đếm được nên phủ định dùng 'There isn't' (số ít).",
                        "Dùng 'any' trong câu phủ định ('There isn't any milk') để nhấn mạnh 'không còn chút nào'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There's no milk in the fridge.",
                            "note_vi": "Ngắn gọn, rất phổ biến trong văn nói."
                        },
                        {
                            "en": "We're out of milk.",
                            "note_vi": "Câu cửa miệng chuẩn bản xứ: 'Nhà mình hết sữa rồi'."
                        }
                    ],
                    "pro_tip": "Nhớ: Câu khẳng định dùng 'some' ('There is some milk'), câu phủ định và câu hỏi dùng 'any' ('There isn't any milk')."
                }
            },
            {
                "id": "s1_t5_10",
                "context": "Tình huống 10/15 • Vào phòng họp đông người",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Không có ghế trống nào trong phòng họp.",
                "sampleCasual": "There aren't any empty chairs in the meeting room.",
                "sampleFormal": "There are no empty chairs in the meeting room.",
                "keywords": [
                    "there aren't",
                    "empty",
                    "chairs",
                    "meeting room"
                ],
                "hints": [
                    {
                        "en": "empty chairs",
                        "vi": "ghế trống"
                    },
                    {
                        "en": "meeting room",
                        "vi": "phòng họp"
                    }
                ],
                "grammarHint": "Phủ định số nhiều dùng 'There aren't any + danh từ số nhiều'.",
                "aiExplanation": {
                    "context_summary": "Thông báo khi bước vào phòng họp và thấy tất cả ghế đều đã có người ngồi.",
                    "grammar_points": [
                        "Phủ định số nhiều dùng 'There aren't any + danh từ số nhiều' ('empty chairs').",
                        "Tính từ 'empty' (trống) đứng trước danh từ 'chairs'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There are no empty chairs in the meeting room.",
                            "note_vi": "Dùng 'no' thay cho 'not any', ngắn gọn và nhấn mạnh hơn."
                        },
                        {
                            "en": "All the chairs in the meeting room are taken.",
                            "note_vi": "Cách nói tự nhiên: 'Tất cả ghế đều có người ngồi rồi'."
                        }
                    ],
                    "pro_tip": "Không dùng 'no' chung với 'aren't' (tránh viết 'There aren't no chairs'). Chỉ chọn 1 trong 2: 'aren't any' hoặc 'are no'."
                }
            },
            {
                "id": "s1_t5_11",
                "context": "Tình huống 11/15 • Đi dạo khu phố yên tĩnh",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "negative",
                "vi": "Không có nhiều cửa hàng trên con phố này.",
                "sampleCasual": "There aren't many shops on this street.",
                "sampleFormal": "There are not many stores on this street.",
                "keywords": [
                    "there aren't",
                    "many",
                    "shops",
                    "street"
                ],
                "hints": [
                    {
                        "en": "shops",
                        "vi": "các cửa hàng"
                    },
                    {
                        "en": "on this street",
                        "vi": "trên con phố này"
                    }
                ],
                "grammarHint": "Dùng 'There aren't many + N (số nhiều)' và giới từ 'on' trước 'street'.",
                "aiExplanation": {
                    "context_summary": "Nhận xét về một con phố yên tĩnh, ít hàng quán.",
                    "grammar_points": [
                        "Phủ định số nhiều dùng 'There aren't many + N (số nhiều)'.",
                        "Dùng giới từ 'on' trước 'street' ('on this street' — Anh-Mỹ; Anh-Anh có thể dùng 'in this street')."
                    ],
                    "native_alternatives": [
                        {
                            "en": "There aren't many stores on this street.",
                            "note_vi": "Người Mỹ dùng 'stores' nhiều hơn 'shops'."
                        },
                        {
                            "en": "There are only a few shops on this street.",
                            "note_vi": "Nói theo hướng khẳng định ('chỉ có vài cửa hàng')."
                        }
                    ],
                    "pro_tip": "Ghi nhớ giới từ chỉ đường phố: 'on this street' (trên con phố này)."
                }
            },
            {
                "id": "s1_t5_12",
                "context": "Tình huống 12/15 • Hỏi đường tìm ngân hàng",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Có ngân hàng nào gần đây không?",
                "sampleCasual": "Is there a bank near here?",
                "sampleFormal": "Is there a bank nearby?",
                "keywords": [
                    "is there",
                    "bank",
                    "near here"
                ],
                "hints": [
                    {
                        "en": "bank",
                        "vi": "ngân hàng"
                    },
                    {
                        "en": "near here",
                        "vi": "gần đây"
                    }
                ],
                "grammarHint": "Câu hỏi số ít đảo 'Is' lên đầu câu: 'Is there a + danh từ + ...?'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi đường thiết thực khi bạn cần tìm ngân hàng hoặc cây ATM.",
                    "grammar_points": [
                        "Câu hỏi Yes/No với danh từ số ít: đảo 'Is' lên đầu câu → 'Is there a + N + ...?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Is there a bank nearby?",
                            "note_vi": "'nearby' (gần đây) là trạng từ gọn nhẹ thay cho 'near here'."
                        },
                        {
                            "en": "Excuse me, is there a bank around here?",
                            "note_vi": "Thêm 'Excuse me' giúp câu hỏi người lạ lịch sự hơn nhiều."
                        }
                    ],
                    "pro_tip": "Khi hỏi đường người lạ, luôn thêm 'Excuse me,' ở đầu câu để tạo thiện cảm ngay lập tức."
                }
            },
            {
                "id": "s1_t5_13",
                "context": "Tình huống 13/15 • Hỏi nhân viên tại quán ăn",
                "topic": "food_shop",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Có nhà vệ sinh ở đây không?",
                "sampleCasual": "Is there a restroom here?",
                "sampleFormal": "Is there a bathroom here?",
                "keywords": [
                    "is there",
                    "restroom",
                    "here"
                ],
                "hints": [
                    {
                        "en": "restroom",
                        "vi": "nhà vệ sinh"
                    }
                ],
                "grammarHint": "Câu hỏi ngắn gọn, lịch sự ở nơi công cộng: 'Is there a restroom here?'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi lịch sự và cực kỳ thông dụng tại nhà hàng, quán cà phê hoặc trung tâm thương mại.",
                    "grammar_points": [
                        "Đảo 'Is' lên đầu câu: 'Is there a restroom here?'.",
                        "'restroom' là cách gọi lịch sự cho nhà vệ sinh công cộng (Anh-Mỹ)."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Where is the restroom?",
                            "note_vi": "Hỏi thẳng vị trí nhà vệ sinh ở đâu."
                        },
                        {
                            "en": "Is there a bathroom here?",
                            "note_vi": "Cũng rất phổ biến trong giao tiếp hàng ngày ở Mỹ (ở Anh dùng 'toilet' hoặc 'loo')."
                        }
                    ],
                    "pro_tip": "Ở nơi công cộng tại Mỹ, dùng 'restroom' sẽ lịch sự và tự nhiên hơn 'toilet'."
                }
            },
            {
                "id": "s1_t5_14",
                "context": "Tình huống 14/15 • Hỏi thăm về lớp học tiếng Anh",
                "topic": "office",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Có nhiều học viên trong lớp không?",
                "sampleCasual": "Are there many students in the class?",
                "sampleFormal": "Are there a lot of students in the class?",
                "keywords": [
                    "are there",
                    "many",
                    "students",
                    "class"
                ],
                "hints": [
                    {
                        "en": "students",
                        "vi": "học viên / sinh viên"
                    },
                    {
                        "en": "class",
                        "vi": "lớp học"
                    }
                ],
                "grammarHint": "Câu hỏi số nhiều đảo 'Are' lên đầu câu: 'Are there many + N (số nhiều)?'.",
                "aiExplanation": {
                    "context_summary": "Hỏi thăm về sĩ số của một lớp học.",
                    "grammar_points": [
                        "Câu hỏi Yes/No số nhiều: đảo 'Are' lên đầu câu → 'Are there many + N (số nhiều)?'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Are there a lot of students in the class?",
                            "note_vi": "Tự nhiên trong văn nói hàng ngày."
                        },
                        {
                            "en": "How many students are there in the class?",
                            "note_vi": "Nếu muốn hỏi con số cụ thể ('Có bao nhiêu học viên?')."
                        }
                    ],
                    "pro_tip": "Phân biệt: 'Are there many...?' (hỏi Có/Không) vs. 'How many ... are there?' (hỏi số lượng cụ thể)."
                }
            },
            {
                "id": "s1_t5_15",
                "context": "Tình huống 15/15 • Hỏi lễ tân khách sạn chỗ ăn tối",
                "topic": "travel",
                "level": "A1",
                "tense": "present",
                "form": "question",
                "vi": "Có nhà hàng ngon nào gần khách sạn không?",
                "sampleCasual": "Are there any good restaurants near the hotel?",
                "sampleFormal": "Are there any nice restaurants near the hotel?",
                "keywords": [
                    "are there",
                    "any",
                    "good",
                    "restaurants",
                    "hotel"
                ],
                "hints": [
                    {
                        "en": "good restaurants",
                        "vi": "nhà hàng ngon"
                    }
                ],
                "grammarHint": "Câu hỏi số nhiều với 'any': 'Are there any + tính từ + N (số nhiều)?'.",
                "aiExplanation": {
                    "context_summary": "Câu hỏi rất hay dùng với lễ tân khách sạn khi đi du lịch và muốn tìm chỗ ăn tối.",
                    "grammar_points": [
                        "Câu hỏi số nhiều dùng 'Are there any + tính từ + N (số nhiều)?'.",
                        "Dùng 'any' trong câu hỏi số nhiều mang nghĩa 'có... nào không'."
                    ],
                    "native_alternatives": [
                        {
                            "en": "Can you recommend any good restaurants near here?",
                            "note_vi": "Nhờ lễ tân gợi ý trực tiếp — cực kỳ tự nhiên và lịch sự."
                        },
                        {
                            "en": "Are there any nice places to eat near the hotel?",
                            "note_vi": "'places to eat' là cụm rất hay thay cho 'restaurants'."
                        }
                    ],
                    "pro_tip": "Nhớ chia số nhiều 'restaurants' sau 'Are there any...'."
                }
            }
        ]
    }
],
       vocab: [
            // --- TRẠM 1.1: Động từ To be (am / is / are) — 10 từ ---
            {
                "id": "v_s1_t1_01",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "daily",
                "level": "A1",
                "term": "teacher",
                "pos": "n",
                "ipa": "/ˈtiːtʃər/",
                "vi": "giáo viên",
                "exampleEn": "I'm a teacher.",
                "exampleVi": "Tôi là giáo viên."
            },
            {
                "id": "v_s1_t1_02",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "office",
                "level": "A1",
                "term": "engineer",
                "pos": "n",
                "ipa": "/ˌendʒəˈnɪr/",
                "vi": "kỹ sư",
                "exampleEn": "He's a new engineer.",
                "exampleVi": "Anh ấy là kỹ sư mới."
            },
            {
                "id": "v_s1_t1_03",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "daily",
                "level": "A1",
                "term": "friendly",
                "pos": "adj",
                "ipa": "/ˈfrendli/",
                "vi": "thân thiện",
                "exampleEn": "She is very friendly.",
                "exampleVi": "Cô ấy rất thân thiện."
            },
            {
                "id": "v_s1_t1_04",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "travel",
                "level": "A1",
                "term": "tourist",
                "pos": "n",
                "ipa": "/ˈtʊrɪst/",
                "vi": "khách du lịch",
                "exampleEn": "Are you a tourist?",
                "exampleVi": "Bạn có phải là khách du lịch không?"
            },
            {
                "id": "v_s1_t1_05",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "daily",
                "level": "A1",
                "term": "doctor",
                "pos": "n",
                "ipa": "/ˈdɑːktər/",
                "vi": "bác sĩ",
                "exampleEn": "He isn't a doctor.",
                "exampleVi": "Anh ấy không phải là bác sĩ."
            },
            {
                "id": "v_s1_t1_06",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "interview",
                "level": "A1",
                "term": "accountant",
                "pos": "n",
                "ipa": "/əˈkaʊntənt/",
                "vi": "kế toán",
                "exampleEn": "I'm an accountant.",
                "exampleVi": "Tôi là một kế toán."
            },
            {
                "id": "v_s1_t1_07",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "office",
                "level": "A1",
                "term": "staff",
                "pos": "n",
                "ipa": "/stæf/",
                "vi": "nhân viên",
                "exampleEn": "Are they the new staff?",
                "exampleVi": "Họ có phải là nhân viên mới không?"
            },
            {
                "id": "v_s1_t1_08",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "daily",
                "level": "A1",
                "term": "nurse",
                "pos": "n",
                "ipa": "/nɜːrs/",
                "vi": "y tá",
                "exampleEn": "He isn't a doctor, he's a nurse.",
                "exampleVi": "Anh ấy không phải là bác sĩ, anh ấy là y tá."
            },
            {
                "id": "v_s1_t1_09",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "chef",
                "pos": "n",
                "ipa": "/ʃef/",
                "vi": "đầu bếp",
                "exampleEn": "He isn't the chef here.",
                "exampleVi": "Anh ấy không phải là đầu bếp của nhà hàng này."
            },
            {
                "id": "v_s1_t1_10",
                "stageId": "stage_1",
                "structId": "struct_be_am_a1",
                "topic": "interview",
                "level": "A1",
                "term": "careful",
                "pos": "adj",
                "ipa": "/ˈkerfəl/",
                "vi": "cẩn thận",
                "exampleEn": "I'm an accountant and I'm very careful.",
                "exampleVi": "Tôi là một kế toán và tôi rất cẩn thận."
            },

            // --- TRẠM 1.2: Tính từ sở hữu (Possessive Adjectives) — 10 từ ---
            {
                "id": "v_s1_t2_01",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "daily",
                "level": "A1",
                "term": "family",
                "pos": "n",
                "ipa": "/ˈfæməli/",
                "vi": "gia đình",
                "exampleEn": "Our family is big.",
                "exampleVi": "Gia đình của chúng tôi rất lớn."
            },
            {
                "id": "v_s1_t2_02",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "daily",
                "level": "A1",
                "term": "hobby",
                "pos": "n",
                "ipa": "/ˈhɑːbi/",
                "vi": "sở thích",
                "exampleEn": "Her hobby is music.",
                "exampleVi": "Sở thích của cô ấy là âm nhạc."
            },
            {
                "id": "v_s1_t2_03",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "favorite",
                "pos": "adj",
                "ipa": "/ˈfeɪvərɪt/",
                "vi": "yêu thích",
                "exampleEn": "What is your favorite food?",
                "exampleVi": "Món ăn yêu thích của bạn là gì?"
            },
            {
                "id": "v_s1_t2_04",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "office",
                "level": "A1",
                "term": "colleague",
                "pos": "n",
                "ipa": "/ˈkɑːliːɡ/",
                "vi": "đồng nghiệp",
                "exampleEn": "My colleague is very nice.",
                "exampleVi": "Đồng nghiệp của tôi rất tốt bụng."
            },
            {
                "id": "v_s1_t2_05",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "daily",
                "level": "A1",
                "term": "city center",
                "pos": "n",
                "ipa": "/ˌsɪti ˈsentər/",
                "vi": "trung tâm thành phố",
                "exampleEn": "Is your house near the city center?",
                "exampleVi": "Nhà của bạn có gần trung tâm thành phố không?"
            },
            {
                "id": "v_s1_t2_06",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "travel",
                "level": "A1",
                "term": "trip",
                "pos": "n",
                "ipa": "/trɪp/",
                "vi": "chuyến đi",
                "exampleEn": "Our trip is very fun.",
                "exampleVi": "Chuyến đi của chúng tôi rất vui."
            },
            {
                "id": "v_s1_t2_07",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "office",
                "level": "A1",
                "term": "phone number",
                "pos": "n",
                "ipa": "/foʊn ˈnʌmbər/",
                "vi": "số điện thoại",
                "exampleEn": "What is her phone number?",
                "exampleVi": "Số điện thoại của cô ấy là bao nhiêu?"
            },
            {
                "id": "v_s1_t2_08",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "interview",
                "level": "A1",
                "term": "job",
                "pos": "n",
                "ipa": "/dʒɑːb/",
                "vi": "công việc / nghề nghiệp",
                "exampleEn": "His job is a doctor.",
                "exampleVi": "Nghề nghiệp của anh ấy là bác sĩ."
            },
            {
                "id": "v_s1_t2_09",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "daily",
                "level": "A1",
                "term": "house",
                "pos": "n",
                "ipa": "/haʊs/",
                "vi": "ngôi nhà",
                "exampleEn": "Is your house near the city center?",
                "exampleVi": "Nhà của bạn có gần trung tâm thành phố không?"
            },
            {
                "id": "v_s1_t2_10",
                "stageId": "stage_1",
                "structId": "struct_possessive_adjectives_a1",
                "topic": "travel",
                "level": "A1",
                "term": "interesting",
                "pos": "adj",
                "ipa": "/ˈɪntrəstɪŋ/",
                "vi": "thú vị",
                "exampleEn": "Our trip is very fun and interesting.",
                "exampleVi": "Chuyến đi của chúng tôi rất vui và thú vị."
            },

            // --- TRẠM 1.3: Chỉ định (This / That / These / Those) — 10 từ ---
            {
                "id": "v_s1_t3_01",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "daily",
                "level": "A1",
                "term": "best friend",
                "pos": "n",
                "ipa": "/best frend/",
                "vi": "bạn thân",
                "exampleEn": "This is my best friend, Minh.",
                "exampleVi": "Đây là bạn thân của tôi, Minh."
            },
            {
                "id": "v_s1_t3_02",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "office",
                "level": "A1",
                "term": "manager",
                "pos": "n",
                "ipa": "/ˈmænɪdʒər/",
                "vi": "quản lý",
                "exampleEn": "That is our new manager.",
                "exampleVi": "Kia là quản lý mới của chúng tôi."
            },
            {
                "id": "v_s1_t3_03",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "daily",
                "level": "A1",
                "term": "key",
                "pos": "n",
                "ipa": "/kiː/",
                "vi": "chìa khóa",
                "exampleEn": "These are my keys.",
                "exampleVi": "Đây là những chiếc chìa khóa của tôi."
            },
            {
                "id": "v_s1_t3_04",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "fresh",
                "pos": "adj",
                "ipa": "/freʃ/",
                "vi": "tươi",
                "exampleEn": "Those apples are very fresh.",
                "exampleVi": "Những quả táo kia rất tươi."
            },
            {
                "id": "v_s1_t3_05",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "expensive",
                "pos": "adj",
                "ipa": "/ɪkˈspensɪv/",
                "vi": "đắt tiền",
                "exampleEn": "These shirts aren't expensive.",
                "exampleVi": "Những chiếc áo này không đắt."
            },
            {
                "id": "v_s1_t3_06",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "travel",
                "level": "A1",
                "term": "seat",
                "pos": "n",
                "ipa": "/siːt/",
                "vi": "ghế / chỗ ngồi",
                "exampleEn": "Those aren't our seats.",
                "exampleVi": "Những chiếc ghế kia không phải ghế của chúng ta."
            },
            {
                "id": "v_s1_t3_07",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "travel",
                "level": "A1",
                "term": "hotel",
                "pos": "n",
                "ipa": "/hoʊˈtel/",
                "vi": "khách sạn",
                "exampleEn": "Is that your hotel?",
                "exampleVi": "Kia có phải là khách sạn của bạn không?"
            },
            {
                "id": "v_s1_t3_08",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "office",
                "level": "A1",
                "term": "office",
                "pos": "n",
                "ipa": "/ˈɔːfɪs/",
                "vi": "văn phòng",
                "exampleEn": "That is my office.",
                "exampleVi": "Kia là văn phòng của tôi."
            },
            {
                "id": "v_s1_t3_09",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "shoes",
                "pos": "n",
                "ipa": "/ʃuːz/",
                "vi": "đôi giày",
                "exampleEn": "Those shoes are very nice.",
                "exampleVi": "Đôi giày kia rất đẹp."
            },
            {
                "id": "v_s1_t3_10",
                "stageId": "stage_1",
                "structId": "struct_this_that_these_those_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "shirt",
                "pos": "n",
                "ipa": "/ʃɜːrt/",
                "vi": "áo sơ mi",
                "exampleEn": "These shirts aren't expensive.",
                "exampleVi": "Những chiếc áo này không đắt."
            },

            // --- TRẠM 1.4: Động từ Have / Has — 10 từ ---
            {
                "id": "v_s1_t4_01",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "daily",
                "level": "A1",
                "term": "child",
                "pos": "n",
                "ipa": "/tʃaɪld/",
                "vi": "đứa con (số nhiều: children)",
                "exampleEn": "I have two children.",
                "exampleVi": "Tôi có hai người con."
            },
            {
                "id": "v_s1_t4_02",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "daily",
                "level": "A1",
                "term": "hair",
                "pos": "n",
                "ipa": "/her/",
                "vi": "tóc",
                "exampleEn": "She has long black hair.",
                "exampleVi": "Cô ấy có mái tóc đen dài."
            },
            {
                "id": "v_s1_t4_03",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "office",
                "level": "A1",
                "term": "meeting",
                "pos": "n",
                "ipa": "/ˈmiːtɪŋ/",
                "vi": "cuộc họp",
                "exampleEn": "I have a meeting today.",
                "exampleVi": "Tôi có một cuộc họp vào hôm nay."
            },
            {
                "id": "v_s1_t4_04",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "travel",
                "level": "A1",
                "term": "passport",
                "pos": "n",
                "ipa": "/ˈpæspɔːrt/",
                "vi": "hộ chiếu",
                "exampleEn": "Minh has his passport and ticket.",
                "exampleVi": "Minh có hộ chiếu và vé rồi."
            },
            {
                "id": "v_s1_t4_05",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "cash",
                "pos": "n",
                "ipa": "/kæʃ/",
                "vi": "tiền mặt",
                "exampleEn": "I don't have any cash.",
                "exampleVi": "Tôi không có tiền mặt."
            },
            {
                "id": "v_s1_t4_06",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "office",
                "level": "A1",
                "term": "laptop",
                "pos": "n",
                "ipa": "/ˈlæptɑːp/",
                "vi": "máy tính xách tay",
                "exampleEn": "She doesn't have a laptop.",
                "exampleVi": "Cô ấy không có máy tính xách tay."
            },
            {
                "id": "v_s1_t4_07",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "menu",
                "pos": "n",
                "ipa": "/ˈmenjuː/",
                "vi": "thực đơn",
                "exampleEn": "Do you have an English menu?",
                "exampleVi": "Các bạn có thực đơn tiếng Anh không?"
            },
            {
                "id": "v_s1_t4_08",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "travel",
                "level": "A1",
                "term": "ticket",
                "pos": "n",
                "ipa": "/ˈtɪkɪt/",
                "vi": "vé",
                "exampleEn": "Minh has his passport and ticket.",
                "exampleVi": "Minh có hộ chiếu và vé rồi."
            },
            {
                "id": "v_s1_t4_09",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "daily",
                "level": "A1",
                "term": "brother",
                "pos": "n",
                "ipa": "/ˈbrʌðər/",
                "vi": "anh / em trai",
                "exampleEn": "He doesn't have a brother.",
                "exampleVi": "Anh ấy không có anh em trai."
            },
            {
                "id": "v_s1_t4_10",
                "stageId": "stage_1",
                "structId": "struct_have_has_a1",
                "topic": "daily",
                "level": "A1",
                "term": "sister",
                "pos": "n",
                "ipa": "/ˈsɪstər/",
                "vi": "chị / em gái",
                "exampleEn": "Does she have a sister?",
                "exampleVi": "Cô ấy có chị gái không?"
            },

            // --- TRẠM 1.5: There is / There are — 10 từ ---
            {
                "id": "v_s1_t5_01",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "daily",
                "level": "A1",
                "term": "living room",
                "pos": "n",
                "ipa": "/ˈlɪvɪŋ ruːm/",
                "vi": "phòng khách",
                "exampleEn": "There is a big table in the living room.",
                "exampleVi": "Có một cái bàn lớn trong phòng khách."
            },
            {
                "id": "v_s1_t5_02",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "daily",
                "level": "A1",
                "term": "bedroom",
                "pos": "n",
                "ipa": "/ˈbedruːm/",
                "vi": "phòng ngủ",
                "exampleEn": "There are two bedrooms in my house.",
                "exampleVi": "Có hai phòng ngủ trong nhà tôi."
            },
            {
                "id": "v_s1_t5_03",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "fridge",
                "pos": "n",
                "ipa": "/frɪdʒ/",
                "vi": "tủ lạnh",
                "exampleEn": "There are three apples in the fridge.",
                "exampleVi": "Có ba quả táo trong tủ lạnh."
            },
            {
                "id": "v_s1_t5_04",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "office",
                "level": "A1",
                "term": "empty",
                "pos": "adj",
                "ipa": "/ˈempti/",
                "vi": "trống",
                "exampleEn": "There aren't any empty chairs.",
                "exampleVi": "Không có ghế trống nào."
            },
            {
                "id": "v_s1_t5_05",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "travel",
                "level": "A1",
                "term": "street",
                "pos": "n",
                "ipa": "/striːt/",
                "vi": "con phố / đường phố",
                "exampleEn": "There aren't many shops on this street.",
                "exampleVi": "Không có nhiều cửa hàng trên con phố này."
            },
            {
                "id": "v_s1_t5_06",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "restroom",
                "pos": "n",
                "ipa": "/ˈrestruːm/",
                "vi": "nhà vệ sinh",
                "exampleEn": "Is there a restroom here?",
                "exampleVi": "Có nhà vệ sinh ở đây không?"
            },
            {
                "id": "v_s1_t5_07",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "travel",
                "level": "A1",
                "term": "restaurant",
                "pos": "n",
                "ipa": "/ˈrestərɑːnt/",
                "vi": "nhà hàng",
                "exampleEn": "Are there any good restaurants near the hotel?",
                "exampleVi": "Có nhà hàng ngon nào gần khách sạn không?"
            },
            {
                "id": "v_s1_t5_08",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "food_shop",
                "level": "A1",
                "term": "coffee shop",
                "pos": "n",
                "ipa": "/ˈkɔːfi ʃɑːp/",
                "vi": "quán cà phê",
                "exampleEn": "There is a coffee shop near my house.",
                "exampleVi": "Có một quán cà phê gần nhà tôi."
            },
            {
                "id": "v_s1_t5_09",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "travel",
                "level": "A1",
                "term": "park",
                "pos": "n",
                "ipa": "/pɑːrk/",
                "vi": "công viên",
                "exampleEn": "There is a nice park near the hotel.",
                "exampleVi": "Có một công viên đẹp gần khách sạn."
            },
            {
                "id": "v_s1_t5_10",
                "stageId": "stage_1",
                "structId": "struct_there_is_are_a1",
                "topic": "travel",
                "level": "A1",
                "term": "bank",
                "pos": "n",
                "ipa": "/bæŋk/",
                "vi": "ngân hàng",
                "exampleEn": "Is there a bank near here?",
                "exampleVi": "Có ngân hàng nào gần đây không?"
            }
        ]
    });
}

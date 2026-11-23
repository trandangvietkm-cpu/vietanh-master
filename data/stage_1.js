/**
 * DỮ LIỆU CHẶNG 1: KHỞI ĐỘNG & GIỚI THIỆU BẢN THÂN (data/stage_1.js)
 * Gồm: 5 Trạm ngữ pháp chuẩn A1 (75 tình huống) + 35 từ vựng trọng tâm.
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
                "id": "sit_be_am_a1_01"
            },
            {
                "context": "Tình huống 2/15 • Giới thiệu quốc tịch khi làm thủ tục khách sạn",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "travel",
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
                "id": "sit_be_am_a1_02"
            },
            {
                "context": "Tình huống 3/15 • Giới thiệu đồng nghiệp mới tại văn phòng",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "office",
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
                "id": "sit_be_am_a1_03"
            },
            {
                "context": "Tình huống 4/15 • Nói về xuất thân của bạn cùng nhóm",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_be_am_a1_04"
            },
            {
                "context": "Tình huống 5/15 • Phỏng vấn giới thiệu vai trò của nhóm",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "interview",
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
                "id": "sit_be_am_a1_05"
            },
            {
                "context": "Tình huống 6/15 • Đính chính thông tin nghề nghiệp trong cuộc nói chuyện",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_be_am_a1_06"
            },
            {
                "context": "Tình huống 7/15 • Hỏi thông tin khách du lịch tại sân bay",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "travel",
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
                "id": "sit_be_am_a1_07"
            },
            {
                "context": "Tình huống 8/15 • Xác nhận vai trò của một nhóm đối tác trong phòng họp",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "office",
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
                "id": "sit_be_am_a1_08"
            },
            {
                "context": "Tình huống 9/15 • Hỏi về món ăn trong nhà hàng",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "food_shop",
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
                "id": "sit_be_am_a1_09"
            },
            {
                "context": "Tình huống 10/15 • Phủ định về nghề nghiệp của người quen",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_be_am_a1_10"
            },
            {
                "context": "Tình huống 11/15 • Giới thiệu bạn mới tại quán cà phê",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
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
                "id": "sit_be_am_a1_11"
            },
            {
                "context": "Tình huống 12/15 • Hỏi thăm về đồng nghiệp tại văn phòng",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
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
                "id": "sit_be_am_a1_12"
            },
            {
                "context": "Tình huống 13/15 • Mua sắm và hỏi về nguồn gốc sản phẩm",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
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
                "id": "sit_be_am_a1_13"
            },
            {
                "context": "Tình huống 14/15 • Giới thiệu bản thân trong buổi phỏng vấn",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "interview",
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
                "id": "sit_be_am_a1_14"
            },
            {
                "context": "Tình huống 15/15 • Hỏi về tình trạng của người quen",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_be_am_a1_15"
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
                "id": "sit_possessive_adjectives_a1_01"
            },
            {
                "context": "Tình huống 2/15 • Giới thiệu nghề nghiệp của anh ấy",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "interview",
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
                "id": "sit_possessive_adjectives_a1_02"
            },
            {
                "context": "Tình huống 3/15 • Giới thiệu sở thích của cô ấy",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_03"
            },
            {
                "context": "Tình huống 4/15 • Giới thiệu gia đình của chúng tôi",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_04"
            },
            {
                "context": "Tình huống 5/15 • Giới thiệu bạn của họ",
                "stageTag": "Chặng 1: Làm quen",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_05"
            },
            {
                "context": "Tình huống 6/15 • Hỏi về tên của bạn",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "interview",
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
                "id": "sit_possessive_adjectives_a1_06"
            },
            {
                "context": "Tình huống 7/15 • Phủ định về nghề nghiệp của cô ấy",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "interview",
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
                "id": "sit_possessive_adjectives_a1_07"
            },
            {
                "context": "Tình huống 8/15 • Hỏi về gia đình của họ",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_08"
            },
            {
                "context": "Tình huống 9/15 • Hỏi về món ăn yêu thích của bạn",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "food_shop",
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
                "id": "sit_possessive_adjectives_a1_09"
            },
            {
                "context": "Tình huống 10/15 • Phủ định về màu sắc của chiếc xe",
                "stageTag": "Chặng 2: Phản xạ",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_10"
            },
            {
                "context": "Tình huống 11/15 • Giới thiệu đồng nghiệp tại văn phòng",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
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
                "id": "sit_possessive_adjectives_a1_11"
            },
            {
                "context": "Tình huống 12/15 • Hỏi thăm về nhà của bạn mới",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "daily",
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
                "id": "sit_possessive_adjectives_a1_12"
            },
            {
                "context": "Tình huống 13/15 • Mua sắm đồ dùng cá nhân",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "food_shop",
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
                "id": "sit_possessive_adjectives_a1_13"
            },
            {
                "context": "Tình huống 14/15 • Giới thiệu về chuyến đi của gia đình",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "travel",
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
                "id": "sit_possessive_adjectives_a1_14"
            },
            {
                "context": "Tình huống 15/15 • Hỏi về thông tin đồng nghiệp",
                "stageTag": "Chặng 3: Ứng dụng A1",
                "level": "A1",
                "topic": "office",
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
                "id": "sit_possessive_adjectives_a1_15"
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
                "grammarHint": "Giới thiệu 1 người đứng ngay gần dùng 'This is + ...'."
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
                "grammarHint": "Đồ vật số ít ở gần dùng 'This is + my + tính từ + danh từ'."
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
                "grammarHint": "Chỉ 1 địa điểm ở xa dùng 'That is' (hoặc rút gọn 'That's')."
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
                "grammarHint": "Chỉ 1 người ở xa dùng 'That is + our + new + manager'."
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
                "grammarHint": "Số nhiều ở gần dùng 'These are' và nhớ thêm 's' vào danh từ 'keys'."
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
                "grammarHint": "Giới thiệu nhiều người ở gần dùng 'These are + my + danh từ số nhiều'."
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
                "grammarHint": "Dùng 'Those + danh từ số nhiều + are + tính từ' để mô tả đồ vật ở xa."
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
                "grammarHint": "Trong tiếng Anh, 'shoes' luôn là danh từ số nhiều nên đi với 'Those ... are'."
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
                "grammarHint": "Câu phủ định với 'This': dùng 'This isn't' hoặc 'This is not'."
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
                "grammarHint": "Câu phủ định với vật ở xa số ít dùng 'That isn't' hoặc 'That is not'."
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
                "grammarHint": "Số nhiều ở gần dạng phủ định dùng 'These + N (số nhiều) + aren't + tính từ'."
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
                "grammarHint": "Số nhiều ở xa dạng phủ định dùng 'Those aren't + our + danh từ số nhiều'."
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
                "grammarHint": "Câu hỏi Yes/No với số ít ở gần: đảo 'Is' lên đầu câu -> 'Is this ...?'."
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
                "grammarHint": "Câu hỏi Yes/No với vật ở xa số ít: đảo 'Is' lên đầu câu -> 'Is that ...?'."
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
                "grammarHint": "Câu hỏi Yes/No với số nhiều ở gần: đảo 'Are' lên đầu câu -> 'Are these ...?'."
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
                "grammarHint": "Chủ ngữ 'I' đi với 'have'; số nhiều của 'child' là 'children'."
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
                "grammarHint": "Chủ ngữ số nhiều 'We' đi với 'have + a + tính từ + danh từ'."
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
                "grammarHint": "Chủ ngữ 'She' đi với 'has'. 'Hair' không đếm được nên không dùng 'a'."
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
                "grammarHint": "Chủ ngữ 'He' đi với 'has + a + new + car'."
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
                "grammarHint": "Chủ ngữ 'They' đi với 'have'; địa điểm thành phố dùng giới từ 'in'."
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
                "grammarHint": "Dùng 'I have a meeting today' (không cần giới từ trước 'today')."
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
                "grammarHint": "Tên riêng 1 người ('Minh') là ngôi thứ 3 số ít nên đi với 'has'."
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
                "grammarHint": "Phủ định với 'I' dùng 'I don't have'; có thể thêm 'any' trước danh từ không đếm được 'cash'."
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
                "grammarHint": "Phủ định với 'We' dùng 'We don't have + time + today'."
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
                "grammarHint": "Phủ định với 'He' dùng 'doesn't have' (đưa 'has' về nguyên mẫu 'have')."
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
                "grammarHint": "Chủ ngữ 'She' dạng phủ định: 'She doesn't have + a + laptop'."
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
                "grammarHint": "Câu hỏi Yes/No với 'you': đảo 'Do' lên đầu câu -> 'Do you have + a + pen?'."
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
                "grammarHint": "Trước 'English' (bắt đầu bằng nguyên âm 'e') dùng mạo từ 'an'."
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
                "grammarHint": "Câu hỏi với 'she': dùng 'Does she have ...?' (không dùng 'has' sau 'Does')."
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
                "grammarHint": "'This hotel' là danh từ số ít nên đảo 'Does' lên đầu câu và giữ nguyên mẫu 'have'."
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
                "grammarHint": "'a big table' là danh từ số ít nên dùng 'There is + a + tính từ + danh từ'."
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
                "grammarHint": "Số nhiều ('two bedrooms') dùng 'There are' và nhớ thêm 's' vào 'bedrooms'."
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
                "grammarHint": "Dùng 'There is a coffee shop' + giới từ chỉ vị trí 'near my house'."
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
                "grammarHint": "'people' là danh từ số nhiều nên luôn đi với 'There are'."
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
                "grammarHint": "'water' là danh từ không đếm được nên đi với 'There is' (không dùng 'There are')."
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
                "grammarHint": "Một địa điểm số ít dùng 'There is + a + nice + park'."
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
                "grammarHint": "Dùng 'There are' cho danh từ đếm được số nhiều ('three apples')."
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
                "grammarHint": "Phủ định số ít dùng 'There isn't a + danh từ'."
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
                "grammarHint": "'milk' không đếm được nên dạng phủ định dùng 'There isn't any milk'."
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
                "grammarHint": "Phủ định số nhiều dùng 'There aren't any + danh từ số nhiều'."
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
                "grammarHint": "Dùng 'There aren't many + N (số nhiều)' và giới từ 'on' trước 'street'."
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
                "grammarHint": "Câu hỏi số ít đảo 'Is' lên đầu câu: 'Is there a + danh từ + ...?'."
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
                "grammarHint": "Câu hỏi ngắn gọn, lịch sự ở nơi công cộng: 'Is there a restroom here?'."
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
                "grammarHint": "Câu hỏi số nhiều đảo 'Are' lên đầu câu: 'Are there many + N (số nhiều)?'."
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
                "grammarHint": "Câu hỏi số nhiều với 'any': 'Are there any + tính từ + N (số nhiều)?'."
            }
        ]
    }
],
        vocab: [
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
    }
]
    });
}

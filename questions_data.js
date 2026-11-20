/**
 * FILE DỮ LIỆU ĐỘC LẬP: questions_data.js
 * Tự động gộp và xuất từ ViệtAnh Admin Studio (CMS v3.0 • Sơ đồ 8 Chặng A1–B1) ngày 20/11/2026
 * Tổng cộng: 1 Cấu trúc câu • 15 Tình huống thực chiến.
 */

window.SENTENCE_STRUCTURES_DATA = [
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
    }
];

window.EXERCISE_BANK_DATA = [];

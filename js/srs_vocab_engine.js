/**
 * SRS VOCAB ENGINE (js/srs_vocab_engine.js)
 * Tầng Logic thuần (0% DOM) — Sẵn sàng chuyển thẳng sang Next.js (lib/srsVocabEngine.js)
 */
(function (global) {
    function escapeRegex(str) {
        return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    /**
     * 1. Xác định Hộp Leitner hiện tại của từ (1 | 2 | 3 | 4 = Đã thuộc)
     */
    function getVocabBox(item) {
        if (!item) return 1;
        if (item.foreverMastered || (item.mastered && (item.reviewStage || 0) >= 3)) return 4;
        const stage = Number(item.reviewStage) || 0;
        if (stage <= 0) return 1;
        if (stage === 1) return 2;
        if (stage === 2) return 3;
        return 4;
    }

    /**
     * 2. Kiểm tra từ có đang đến hạn ôn không
     */
    function isDueForReview(item, nowTs = Date.now()) {
        if (!item || item.foreverMastered) return false;
        const box = getVocabBox(item);
        if (box === 1) return true; // Hộp 1 luôn sẵn sàng ôn
        if (!item.nextReviewDue) return true;
        return new Date(item.nextReviewDue).getTime() <= nowTs;
    }

    /**
     * 3. Thống kê số lượng từ theo 4 Hộp
     */
    function getBoxStats(vocabList, nowTs = Date.now()) {
        const list = Array.isArray(vocabList) ? vocabList : [];
        const stats = { total: list.length, dueTotal: 0, box1: 0, box2: 0, box3: 0, box4: 0 };
        list.forEach(item => {
            const box = getVocabBox(item);
            stats[`box${box}`] += 1;
            if (isDueForReview(item, nowTs)) stats.dueTotal += 1;
        });
        return stats;
    }

    /**
     * 4. Tự động bổ sung câu ví dụ thật từ VA_DICTIONARY_CORE nếu từ trong sổ chưa có ví dụ
     */
    function enrichVocabWithContext(item, dictObj) {
        const word = String(item.en || '').trim();
        const lower = word.toLowerCase();
        const dictHit = (dictObj && dictObj[lower]) ? dictObj[lower] : null;

        const fullSentence = (item.exampleEn && item.exampleEn.trim())
            ? item.exampleEn.trim()
            : (dictHit && dictHit.example ? dictHit.example : '');

        const sentenceVi = (item.exampleVi && item.exampleVi.trim())
            ? item.exampleVi.trim()
            : (dictHit && dictHit.exampleVi ? dictHit.exampleVi : '');

        let exactAnswer = word;
        let maskedSentence = fullSentence;
        let hasValidBlank = false;

        if (fullSentence && word.length >= 2) {
            const escaped = escapeRegex(word);
            const regex = new RegExp(`\\b(${escaped}(?:s|es|ed|d|ing)?)\\b`, 'i');
            const match = fullSentence.match(regex);
            if (match) {
                exactAnswer = match[1];
                maskedSentence = fullSentence.replace(regex, '_____');
                hasValidBlank = true;
            }
        }

        return {
            ...item,
            box: getVocabBox(item),
            word,
            vi: item.vi || (dictHit ? dictHit.vi : ''),
            ipa: item.ipa || (dictHit ? dictHit.ipa : ''),
            pos: item.pos || (dictHit ? dictHit.pos : ''),
            fullSentence,
            maskedSentence,
            sentenceVi,
            exactAnswer,
            hasValidBlank
        };
    }

    /**
     * 5. Tạo câu hỏi theo đúng độ khó của Hộp Leitner:
     *    - Hộp 1: Nhìn câu tô sáng từ -> Chọn nghĩa tiếng Việt
     *    - Hộp 2: Câu khuyết từ + nghĩa -> Chọn từ tiếng Anh
     *    - Hộp 3 & 4: Nghĩa tiếng Việt + câu khuyết -> Tự gõ từ tiếng Anh
     */
    function buildReviewQuestion(rawItem, allVocab, dictObj) {
        const item = enrichVocabWithContext(rawItem, dictObj);
        const mode = item.box === 1 ? 'meaning_quiz' : (item.box === 2 ? 'cloze_quiz' : 'cloze_typing');

        // Gom nguồn đáp án nhiễu từ Sổ tay + Từ điển 3K
        const dictEntries = dictObj ? Object.entries(dictObj) : [];
        const options = [];

        if (mode === 'meaning_quiz') {
            const poolVi = [];
            (allVocab || []).forEach(v => {
                if (v.en && v.en.toLowerCase() !== item.word.toLowerCase() && v.vi) poolVi.push(v.vi);
            });
            if (poolVi.length < 3) {
                const sampleDict = shuffleArray(dictEntries).slice(0, 20);
                sampleDict.forEach(([w, info]) => {
                    if (w.toLowerCase() !== item.word.toLowerCase() && info?.vi) poolVi.push(info.vi);
                });
            }
            const distractors = shuffleArray([...new Set(poolVi)]).slice(0, 3);
            options.push(...shuffleArray([item.vi, ...distractors]));
        } else if (mode === 'cloze_quiz') {
            const poolEn = [];
            (allVocab || []).forEach(v => {
                if (v.en && v.en.toLowerCase() !== item.word.toLowerCase()) poolEn.push(v.en);
            });
            if (poolEn.length < 3) {
                const samePos = dictEntries.filter(([w, info]) => w.toLowerCase() !== item.word.toLowerCase() && (!item.pos || info?.pos === item.pos));
                shuffleArray(samePos.length >= 3 ? samePos : dictEntries).slice(0, 10).forEach(([w]) => poolEn.push(w));
            }
            const distractors = shuffleArray([...new Set(poolEn)]).slice(0, 3);
            options.push(...shuffleArray([item.exactAnswer, ...distractors]));
        }

        return { ...item, mode, options };
    }

    /**
     * 6. Chấm đáp án & tính trạng thái Hộp mới sau khi trả lời
     */
    function evaluateAnswer(question, userInput) {
        const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const u = norm(userInput);
        let isCorrect = false;

        if (question.mode === 'meaning_quiz') {
            isCorrect = u === norm(question.vi);
        } else {
            isCorrect = u === norm(question.exactAnswer) || u === norm(question.word);
        }

        const curStage = Number(question.reviewStage) || 0;
        const now = new Date();
        let nextStage = curStage;
        let nextMastered = false;
        let nextForever = false;
        let waitDays = 0;
        let xpGain = 0;

        if (isCorrect) {
            nextStage = curStage + 1;
            const daysMap = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
            xpGain = question.box === 1 ? 15 : (question.box === 2 ? 20 : 30);

            if (nextStage >= 6) {
                nextMastered = true;
                nextForever = true;
                waitDays = 0;
            } else {
                nextMastered = nextStage >= 3;
                waitDays = daysMap[nextStage] || 7;
            }
        } else {
            // Trả lời sai -> Đưa về Hộp 1 để củng cố lại
            nextStage = 0;
            nextMastered = false;
            nextForever = false;
            waitDays = 0;
            xpGain = 0;
        }

        let nextReviewDue = null;
        if (waitDays > 0) {
            const dueDate = new Date(now.getTime() + waitDays * 86400000);
            nextReviewDue = dueDate.toISOString();
        }

        return {
            isCorrect,
            xpGain,
            waitDays,
            newBox: nextForever ? 4 : Math.min(4, nextStage + 1),
            patch: {
                reviewStage: nextStage,
                mastered: nextMastered,
                foreverMastered: nextForever,
                nextReviewDue
            }
        };
    }

    function buildTypingHint(answer, revealCount = 1) {
        return String(answer || '').split('').map((ch, idx) => {
            if (ch === ' ' || ch === '-') return ch;
            return idx < revealCount ? ch : '_';
        }).join(' ');
    }

    global.SrsVocabEngine = {
        getVocabBox,
        isDueForReview,
        getBoxStats,
        buildReviewQuestion,
        evaluateAnswer,
        buildTypingHint
    };
})(window);
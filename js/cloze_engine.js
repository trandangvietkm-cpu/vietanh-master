/**
 * CLOZE ENGINE (js/cloze_engine.js)
 * Tầng Logic thuần (0% DOM) — Sẵn sàng chuyển thẳng sang Next.js (lib/clozeEngine.js)
 */
(function (global) {
    const POS_LABELS = {
        n: 'Danh từ (n)',
        v: 'Động từ (v)',
        adj: 'Tính từ (adj)',
        adv: 'Trạng từ (adv)',
        prep: 'Giới từ (prep)',
        conj: 'Liên từ (conj)',
        phr: 'Cụm từ (phr)',
        pron: 'Đại từ (pron)',
        det: 'Từ hạn định (det)',
        interj: 'Thán từ (interj)'
    };

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
     * 1. Xây dựng kho câu Cloze từ window.VA_DICTIONARY_CORE
     * Tự động lọc các từ có đủ example + exampleVi và tìm đúng vị trí từ khóa trong câu
     */
    function buildClozePool(dictObj) {
        if (!dictObj || typeof dictObj !== 'object') return [];
        const pool = [];

        for (const [rawWord, info] of Object.entries(dictObj)) {
            if (!info || !info.example || !info.exampleVi) continue;
            const word = String(rawWord || '').trim();
            if (!word || word.length < 2 || word.endsWith('-')) continue;

            // Bắt từ khóa trong câu ví dụ (hỗ trợ cả dạng chia số nhiều/thì cơ bản)
            const escaped = escapeRegex(word);
            const regex = new RegExp(`\\b(${escaped}(?:s|es|ed|d|ing)?)\\b`, 'i');
            const match = String(info.example).match(regex);
            if (!match) continue;

            const exactAnswer = match[1];
            const maskedSentence = String(info.example).replace(regex, '_____');

            pool.push({
                id: `cloze_${word.toLowerCase().replace(/\s+/g, '_')}`,
                word,
                ipa: info.ipa || '',
                pos: info.pos || '',
                posLabel: POS_LABELS[info.pos] || info.pos || 'Từ vựng',
                vi: info.vi || '',
                level: (info.level || 'A1').toUpperCase(),
                sentence: maskedSentence,
                fullSentence: info.example,
                exampleVi: info.exampleVi,
                answer: exactAnswer
            });
        }
        return pool;
    }

    /**
     * 2. Sinh 1 lượt luyện tập (mặc định 10 câu) kèm 3 đáp án nhiễu cùng từ loại/cấp độ
     */
    function generateSession(pool, { level = 'ALL', count = 10 } = {}) {
        if (!Array.isArray(pool) || pool.length === 0) return [];

        const filtered = level === 'ALL'
            ? pool
            : pool.filter(item => item.level === level);

        const source = filtered.length >= 4 ? filtered : pool;
        const selected = shuffleArray(source).slice(0, Math.min(count, source.length));

        return selected.map(q => {
            // Ưu tiên chọn 3 từ nhiễu cùng từ loại & cùng cấp độ
            let candidates = pool.filter(d =>
                d.word.toLowerCase() !== q.word.toLowerCase() &&
                d.answer.toLowerCase() !== q.answer.toLowerCase() &&
                d.pos && d.pos === q.pos && d.level === q.level
            );
            if (candidates.length < 3) {
                candidates = pool.filter(d =>
                    d.word.toLowerCase() !== q.word.toLowerCase() &&
                    d.answer.toLowerCase() !== q.answer.toLowerCase() &&
                    d.pos && d.pos === q.pos
                );
            }
            if (candidates.length < 3) {
                candidates = pool.filter(d => d.word.toLowerCase() !== q.word.toLowerCase());
            }

            const distractors = shuffleArray(candidates).slice(0, 3).map(d => d.word);
            const options = shuffleArray([q.answer, ...distractors]);

            return { ...q, options };
        });
    }

    /**
     * 3. Chấm điểm câu trả lời (không phân biệt hoa/thường & khoảng trắng thừa)
     */
    function checkAnswer(question, userInput) {
        if (!question) return false;
        const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const u = norm(userInput);
        return u === norm(question.answer) || u === norm(question.word);
    }

    /**
     * 4. Tính điểm XP công bằng cho mỗi câu đúng
     */
    function calculateXP({ mode = 'quiz', isCorrect = false, combo = 0, usedHint = false }) {
        if (!isCorrect) return 0;
        let base = mode === 'typing' ? (usedHint ? 10 : 15) : 10;
        const bonus = combo >= 3 ? 5 : 0;
        return base + bonus;
    }

    /**
     * 5. Tạo chuỗi gợi ý từng chữ cái cho chế độ Tự gõ
     */
    function buildTypingHint(answer, revealCount = 1) {
        const chars = String(answer || '').split('');
        return chars.map((ch, idx) => {
            if (ch === ' ' || ch === '-') return ch;
            return idx < revealCount ? ch : '_';
        }).join(' ');
    }

    global.ClozeEngine = {
        buildClozePool,
        generateSession,
        checkAnswer,
        calculateXP,
        buildTypingHint
    };
})(window);
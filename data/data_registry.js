/**
 * BỘ ĐĂNG KÝ & QUẢN LÝ TẦNG DỮ LIỆU THEO CHẶNG (data/data_registry.js)
 * Kiến trúc hệ thống:
 *  - Tách rời dữ liệu từng Chặng (data/stage_1.js ... data/stage_8.js) để dễ mở rộng, bảo trì.
 *  - Chạy tương thích 100% trên cả môi trường mở file trực tiếp (file://) lẫn Web tĩnh (GitHub Pages / Netlify).
 *  - Tự động chống trùng lặp ID và đồng bộ về chuẩn toàn cục (SENTENCE_STRUCTURES_DATA, VOCAB_REPOSITORY_DATA, EXERCISE_BANK_DATA).
 */

(function (global) {
    'use strict';

    global.SENTENCE_STRUCTURES_DATA = Array.isArray(global.SENTENCE_STRUCTURES_DATA) ? global.SENTENCE_STRUCTURES_DATA : [];
    global.VOCAB_REPOSITORY_DATA = Array.isArray(global.VOCAB_REPOSITORY_DATA) ? global.VOCAB_REPOSITORY_DATA : [];
    global.EXERCISE_BANK_DATA = Array.isArray(global.EXERCISE_BANK_DATA) ? global.EXERCISE_BANK_DATA : [];

    const loadedStages = {};
    const seenStructIds = new Set(global.SENTENCE_STRUCTURES_DATA.map(s => s && s.id).filter(Boolean));
    const seenVocabIds = new Set(global.VOCAB_REPOSITORY_DATA.map(v => v && v.id).filter(Boolean));
    const seenExerciseIds = new Set(global.EXERCISE_BANK_DATA.map(e => e && e.id).filter(Boolean));

    function registerStage(stageId, payload) {
        if (!stageId || !payload || typeof payload !== 'object') return;

        const structures = Array.isArray(payload.structures) ? payload.structures : [];
        const vocab = Array.isArray(payload.vocab) ? payload.vocab : [];
        const exercises = Array.isArray(payload.exercises) ? payload.exercises : [];

        let addedStructs = 0;
        let addedVocab = 0;

        structures.forEach(st => {
            if (!st || !st.id || seenStructIds.has(st.id)) return;
            if (!st.stageId) st.stageId = stageId;
            seenStructIds.add(st.id);
            global.SENTENCE_STRUCTURES_DATA.push(st);
            addedStructs++;
        });

        vocab.forEach(v => {
            if (!v || !v.id || seenVocabIds.has(v.id)) return;
            if (!v.stageId) v.stageId = stageId;
            seenVocabIds.add(v.id);
            global.VOCAB_REPOSITORY_DATA.push(v);
            addedVocab++;
        });

        exercises.forEach(ex => {
            if (!ex || !ex.id || seenExerciseIds.has(ex.id)) return;
            seenExerciseIds.add(ex.id);
            global.EXERCISE_BANK_DATA.push(ex);
        });

        loadedStages[stageId] = {
            stageId,
            title: payload.title || stageId,
            structuresCount: addedStructs,
            vocabCount: addedVocab,
            loadedAt: Date.now()
        };
    }

    function getLoadedStages() {
        return Object.values(loadedStages);
    }

    function isStageLoaded(stageId) {
        return Boolean(loadedStages[stageId]);
    }

    global.VA_DATA_REGISTRY = {
        registerStage,
        getLoadedStages,
        isStageLoaded
    };
})(window);

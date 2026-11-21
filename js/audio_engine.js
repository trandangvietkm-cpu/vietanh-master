/**
 * MODULE AUDIO ENGINE: ĐỘNG CƠ PHÁT ÂM DÙNG CHUNG (js/audio_engine.js)
 * Tách độc lập từ ai_evaluator.js theo kiến trúc hệ thống (Single Responsibility):
 *  - Lớp 1: Thẻ <audio> cố định (va-persistent-audio-player) phát MP3 xuyên màn hình khóa
 *  - Lớp 2: Silent WAV Keep-Alive giữ kết nối Audio Session khi đếm ngược
 *  - Lớp 3: Media Session API đồng bộ điều khiển ngoài màn hình khóa
 *  - Hệ thống chọn giọng Web Speech API tối ưu + Modal Cài đặt giọng đọc
 */

// 6. HỆ THỐNG PHÁT ÂM LAI (HƯỚNG 1: WEB SPEECH API TỐI ƯU + CHỌN GIỌNG | HƯỚNG 2: ƯU TIÊN FILE MP3 TẠO SẴN)
        const VA_TTS_VOICE_STORAGE_KEY = 'va_tts_voice_name';
        let cachedEnglishVoices = [];
        let activeMp3Audio = null;
        const missingMp3AudioIds = new Set();

        function scoreEnglishVoice(voice) {
            if (!voice || !voice.lang) return -1;
            const lang = voice.lang.toLowerCase();
            if (!lang.startsWith('en')) return -1;
            const name = (voice.name || '').toLowerCase();
            let score = 0;
            if (lang === 'en-us') score += 50;
            else if (lang === 'en-gb') score += 35;
            else score += 20;

            if (name.includes('natural') || name.includes('neural')) score += 60;
            if (name.includes('online')) score += 25;
            if (name.includes('aria') || name.includes('jenny') || name.includes('guy') || name.includes('ava')) score += 30;
            if (name.includes('enhanced') || name.includes('premium')) score += 35;
            if (name.includes('google us english') || name.includes('google uk english')) score += 40;
            else if (name.includes('google')) score += 25;
            if (name.includes('samantha') || name.includes('daniel') || name.includes('karen')) score += 20;
            if (name.includes('compact') || name.includes('espeak')) score -= 30;
            return score;
        }

        function refreshAvailableEnglishVoices() {
            if (!('speechSynthesis' in window)) return [];
            const all = window.speechSynthesis.getVoices() || [];
            cachedEnglishVoices = all
                .filter(v => v && v.lang && v.lang.toLowerCase().startsWith('en'))
                .sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a));
            return cachedEnglishVoices;
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            refreshAvailableEnglishVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                refreshAvailableEnglishVoices();
                if (typeof refreshAvailableVietnameseVoices === 'function') refreshAvailableVietnameseVoices();
            };
        }

        function getSelectedEnglishVoice() {
            const list = cachedEnglishVoices.length > 0 ? cachedEnglishVoices : refreshAvailableEnglishVoices();
            if (list.length === 0) return null;
            const savedName = (localStorage.getItem(VA_TTS_VOICE_STORAGE_KEY) || '').trim();
            if (savedName) {
                const exact = list.find(v => v.name === savedName);
                if (exact) return exact;
            }
            return list[0];
        }

        let vaPlaybackToken = 0;

        // LỚP 1: Dùng duy nhất 1 thẻ <audio> cố định cho toàn ứng dụng (giúp phát xuyên màn hình khóa trên iOS/Android)
        function getPersistentAudioPlayer() {
            if (!window.__vaPersistentAudio) {
                const el = document.createElement('audio');
                el.id = 'va-persistent-audio-player';
                el.setAttribute('playsinline', '');
                el.setAttribute('webkit-playsinline', '');
                el.preload = 'auto';
                el.style.display = 'none';
                if (document.body) document.body.appendChild(el);
                window.__vaPersistentAudio = el;
            }
            return window.__vaPersistentAudio;
        }

        // LỚP 2: Âm thanh im lặng siêu nhẹ (Silent WAV 1 giây) giữ kết nối Audio Session khi đếm ngược / nghỉ giữa 2 câu
        let cachedSilentWavUrl = null;
        function getSilentWavDataUrl() {
            if (cachedSilentWavUrl) return cachedSilentWavUrl;
            try {
                const sampleRate = 8000;
                const numSamples = sampleRate; // 1 giây im lặng 8-bit mono
                const buffer = new ArrayBuffer(44 + numSamples);
                const view = new DataView(buffer);
                const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
                writeStr(0, 'RIFF');
                view.setUint32(4, 36 + numSamples, true);
                writeStr(8, 'WAVE');
                writeStr(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, 1, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate, true);
                view.setUint16(32, 1, true);
                view.setUint16(34, 8, true);
                writeStr(36, 'data');
                view.setUint32(40, numSamples, true);
                for (let i = 0; i < numSamples; i++) view.setUint8(44 + i, 128); // 128 = silence in 8-bit PCM
                const blob = new Blob([buffer], { type: 'audio/wav' });
                cachedSilentWavUrl = URL.createObjectURL(blob);
                return cachedSilentWavUrl;
            } catch (e) {
                return '';
            }
        }

        function playSilentKeepAliveAudio() {
            const url = getSilentWavDataUrl();
            if (!url) return;
            const audio = getPersistentAudioPlayer();
            try {
                audio.onended = null;
                audio.onerror = null;
                audio.loop = true;
                audio.playbackRate = 1.0;
                if (audio.src !== url) audio.src = url;
                const p = audio.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
                activeMp3Audio = audio;
            } catch (e) {}
        }

        function stopSilentKeepAliveAudio() {
            const audio = window.__vaPersistentAudio;
            if (!audio) return;
            try {
                audio.loop = false;
                if (cachedSilentWavUrl && audio.src === cachedSilentWavUrl) {
                    audio.pause();
                }
            } catch (e) {}
        }

        // LỚP 3: Media Session API (Hiển thị điều khiển ngoài màn hình khóa điện thoại)
        function updateMediaSessionMetadata(cfg = {}) {
            if (!('mediaSession' in navigator)) return;
            try {
                if (typeof MediaMetadata !== 'undefined') {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: cfg.title || 'ViệtAnh Master',
                        artist: cfg.artist || 'Luyện Nghe–Nói & Shadowing',
                        album: cfg.album || 'ViệtAnh Master'
                    });
                }
                navigator.mediaSession.playbackState = cfg.isPlaying ? 'playing' : 'paused';
                navigator.mediaSession.setActionHandler('play', cfg.onPlay || null);
                navigator.mediaSession.setActionHandler('pause', cfg.onPause || null);
                navigator.mediaSession.setActionHandler('previoustrack', cfg.onPrev || null);
                navigator.mediaSession.setActionHandler('nexttrack', cfg.onNext || null);
            } catch (e) {}
        }

        function clearMediaSession() {
            if (!('mediaSession' in navigator)) return;
            try {
                navigator.mediaSession.playbackState = 'none';
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            } catch (e) {}
        }

        function stopAllPlayback() {
            vaPlaybackToken++;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            const audio = activeMp3Audio || window.__vaPersistentAudio;
            if (audio) {
                try {
                    audio.onended = null;
                    audio.onerror = null;
                    audio.loop = false;
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {}
                activeMp3Audio = null;
            }
            document.querySelectorAll('.speaking-btn').forEach(el => el.classList.remove('speaking-btn'));
        }

        function speakWithWebSpeechAPI(cleanText, btnElement, customRate = 0.95, onComplete = null, token = vaPlaybackToken) {
            if (!('speechSynthesis' in window)) {
                showToast("Trình duyệt của bạn không hỗ trợ đọc phát âm.", "warning");
                if (typeof onComplete === 'function' && token === vaPlaybackToken) onComplete();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const chosenVoice = getSelectedEnglishVoice();
            utterance.lang = chosenVoice ? chosenVoice.lang : 'en-US';
            utterance.rate = customRate;
            if (chosenVoice) utterance.voice = chosenVoice;

            let finished = false;
            const handleDone = () => {
                if (finished) return;
                finished = true;
                if (btnElement) btnElement.classList.remove('speaking-btn');
                if (typeof onComplete === 'function' && token === vaPlaybackToken) {
                    onComplete();
                }
            };

            if (btnElement) btnElement.classList.add('speaking-btn');
            utterance.onend = handleDone;
            utterance.onerror = handleDone;
            window.speechSynthesis.speak(utterance);
        }

        // Hỗ trợ cả file MP3 tạo sẵn (audio/<id>.mp3) và Web Speech API tối ưu + callback onComplete
        function speakText(text, btnElement = null, customRate = 0.95, options = {}) {
            const cleanText = String(text || '').replace(/^["']|["']$/g, '').trim();
            const onComplete = (options && typeof options.onComplete === 'function') ? options.onComplete : null;
            if (!cleanText) {
                if (onComplete) onComplete();
                return;
            }

            stopAllPlayback();
            const myToken = vaPlaybackToken;

            // Tự nhận diện audioId nếu đang đọc đúng câu chuẩn của câu hỏi hiện tại
            let audioId = options && options.audioId ? String(options.audioId).trim() : '';
            if (!audioId && !(options && options.forceTTS) && typeof getActiveQuestionObject === 'function') {
                const activeQ = getActiveQuestionObject();
                if (activeQ && activeQ.id && activeQ.sampleCasual && activeQ.sampleCasual.trim().toLowerCase() === cleanText.toLowerCase()) {
                    audioId = String(activeQ.id).trim();
                }
            }

            if (audioId && !missingMp3AudioIds.has(audioId) && !(options && options.forceTTS)) {
                const audioUrl = `./audio/${encodeURIComponent(audioId)}.mp3`;
                const audio = getPersistentAudioPlayer();
                audio.onended = null;
                audio.onerror = null;
                audio.loop = false;
                audio.src = audioUrl;
                audio.playbackRate = customRate;
                activeMp3Audio = audio;

                if (btnElement) btnElement.classList.add('speaking-btn');

                let fallbackTriggered = false;
                const triggerFallback = () => {
                    if (fallbackTriggered || myToken !== vaPlaybackToken) return;
                    fallbackTriggered = true;
                    missingMp3AudioIds.add(audioId);
                    if (activeMp3Audio === audio) activeMp3Audio = null;
                    if (btnElement) btnElement.classList.remove('speaking-btn');
                    speakWithWebSpeechAPI(cleanText, btnElement, customRate, onComplete, myToken);
                };

                audio.onended = () => {
                    if (activeMp3Audio === audio) activeMp3Audio = null;
                    if (btnElement) btnElement.classList.remove('speaking-btn');
                    if (onComplete && myToken === vaPlaybackToken) onComplete();
                };
                audio.onerror = triggerFallback;

                const playPromise = audio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(triggerFallback);
                }
                return;
            }

            speakWithWebSpeechAPI(cleanText, btnElement, customRate, onComplete, myToken);
        }

        // Modal chọn giọng đọc (Web Speech API) + thông tin chế độ MP3
        function openVoiceSettingsModal() {
            const existing = document.getElementById('va-voice-settings-modal');
            if (existing) existing.remove();

            const voices = refreshAvailableEnglishVoices();
            const currentVoice = getSelectedEnglishVoice();
            const savedName = (localStorage.getItem(VA_TTS_VOICE_STORAGE_KEY) || '').trim();
            const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            const optionsHtml = voices.length > 0
                ? `<option value="" ${!savedName ? 'selected' : ''}>✨ Tự động chọn giọng hay nhất (${esc(voices[0].name)})</option>` +
                  voices.slice(0, 25).map(v => {
                      const isSel = savedName === v.name ? 'selected' : '';
                      const tag = scoreEnglishVoice(v) >= 95 ? ' ★' : '';
                      return `<option value="${esc(v.name)}" ${isSel}>${esc(v.name)} (${esc(v.lang)})${tag}</option>`;
                  }).join('')
                : `<option value="">Trình duyệt đang dùng giọng mặc định hệ thống</option>`;

            const modal = document.createElement('div');
            modal.id = 'va-voice-settings-modal';
            modal.className = 'fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
            modal.setAttribute('onclick', 'if(event.target === this) this.remove()');
            modal.innerHTML = `
                <div class="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
                    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-slate-50">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base shrink-0">
                                <i class="fa-solid fa-headphones"></i>
                            </div>
                            <div>
                                <h3 class="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">Cài đặt Giọng đọc</h3>
                                <p class="text-[11px] text-slate-500">Chọn giọng đọc phù hợp trên thiết bị của bạn</p>
                            </div>
                        </div>
                        <button type="button" onclick="document.getElementById('va-voice-settings-modal')?.remove()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="space-y-1.5">
                            <label for="va-voice-select" class="block text-xs font-bold text-slate-700">Giọng đọc tiếng Anh:</label>
                            <select id="va-voice-select" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                ${optionsHtml}
                            </select>
                            <p class="text-[11px] text-slate-400">Dấu <strong>★</strong> là các giọng tự nhiên chất lượng cao trên thiết bị của bạn.</p>
                        </div>
                        <p class="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                            <i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i>
                            Các câu trong lộ trình ưu tiên dùng giọng thu âm chuẩn; tùy chọn trên áp dụng cho từ vựng lẻ và câu luyện thêm.
                        </p>
                        <div class="flex items-center justify-between gap-2 pt-1">
                            <button type="button" onclick="previewSelectedVoice()" class="px-4 py-2.5 rounded-xl text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all">
                                <i class="fa-solid fa-play mr-1"></i>Nghe thử
                            </button>
                            <button type="button" onclick="saveSelectedVoice()" class="flex-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all">
                                Lưu giọng đọc
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function previewSelectedVoice() {
            const sel = document.getElementById('va-voice-select');
            if (sel) localStorage.setItem(VA_TTS_VOICE_STORAGE_KEY, sel.value);
            speakText("Hi, I'm Linh and I'm a teacher.", null, 0.95, { forceTTS: true });
        }

        function saveSelectedVoice() {
            const sel = document.getElementById('va-voice-select');
            if (sel) localStorage.setItem(VA_TTS_VOICE_STORAGE_KEY, sel.value);
            document.getElementById('va-voice-settings-modal')?.remove();
            showToast("Đã lưu tùy chọn giọng đọc tiếng Anh!", "success");
        }

        // Tự động gắn nút chọn giọng nhỏ gọn ngay cạnh nút "Chậm" (không cần sửa index.html)
        document.addEventListener('DOMContentLoaded', () => {
            const slowBtn = document.getElementById('slow-listen-btn');
            if (slowBtn && slowBtn.parentElement && !document.getElementById('voice-settings-btn')) {
                const vBtn = document.createElement('button');
                vBtn.id = 'voice-settings-btn';
                vBtn.type = 'button';
                vBtn.onclick = openVoiceSettingsModal;
                vBtn.className = 'w-8 h-8 rounded-xl text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-100 border border-indigo-200/70 flex items-center justify-center transition-all shrink-0';
                vBtn.title = 'Chọn giọng đọc tiếng Anh';
                vBtn.innerHTML = '<i class="fa-solid fa-sliders"></i>';
                slowBtn.parentElement.appendChild(vBtn);
            }
        });


        // ==================== HỆ THỐNG PHÁT ÂM TIẾNG VIỆT LAI (MP3 audio/<id>_vi.mp3 + WEB SPEECH API vi-VN) ====================
        let cachedVietnameseVoices = [];
        const missingViMp3AudioIds = new Set();

        function scoreVietnameseVoice(voice) {
            if (!voice || !voice.lang) return -1;
            const lang = voice.lang.toLowerCase();
            if (!lang.startsWith('vi')) return -1;
            const name = (voice.name || '').toLowerCase();
            let score = 50;
            if (lang === 'vi-vn') score += 20;
            if (name.includes('natural') || name.includes('neural')) score += 60;
            if (name.includes('online')) score += 25;
            if (name.includes('hoaimy') || name.includes('namminh') || name.includes('linh')) score += 35;
            if (name.includes('google')) score += 30;
            if (name.includes('an') || name.includes('microsoft')) score += 15;
            if (name.includes('espeak') || name.includes('compact')) score -= 30;
            return score;
        }

        function refreshAvailableVietnameseVoices() {
            if (!('speechSynthesis' in window)) return [];
            const all = window.speechSynthesis.getVoices() || [];
            cachedVietnameseVoices = all
                .filter(v => v && v.lang && v.lang.toLowerCase().startsWith('vi'))
                .sort((a, b) => scoreVietnameseVoice(b) - scoreVietnameseVoice(a));
            return cachedVietnameseVoices;
        }

        function getSelectedVietnameseVoice() {
            const list = cachedVietnameseVoices.length > 0 ? cachedVietnameseVoices : refreshAvailableVietnameseVoices();
            return list.length > 0 ? list[0] : null;
        }

        function speakVietnameseWithWebSpeechAPI(cleanText, btnElement, customRate = 1.0, onComplete = null, token = vaPlaybackToken) {
            if (!('speechSynthesis' in window)) {
                if (typeof onComplete === 'function' && token === vaPlaybackToken) onComplete();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const chosenVoice = getSelectedVietnameseVoice();
            utterance.lang = chosenVoice ? chosenVoice.lang : 'vi-VN';
            utterance.rate = customRate;
            if (chosenVoice) utterance.voice = chosenVoice;

            let finished = false;
            const handleDone = () => {
                if (finished) return;
                finished = true;
                if (btnElement) btnElement.classList.remove('speaking-btn');
                if (typeof onComplete === 'function' && token === vaPlaybackToken) {
                    onComplete();
                }
            };

            if (btnElement) btnElement.classList.add('speaking-btn');
            utterance.onend = handleDone;
            utterance.onerror = handleDone;
            window.speechSynthesis.speak(utterance);
        }

        // Phát âm câu tiếng Việt: Ưu tiên MP3 tạo sẵn (audio/<id>_vi.mp3 - chạy xuyên màn hình khóa), tự lùi về Web Speech API (vi-VN)
        function speakVietnameseText(text, btnElement = null, customRate = 1.0, options = {}) {
            const cleanText = String(text || '').replace(/^["'“”]|["'“”]$/g, '').trim();
            const onComplete = (options && typeof options.onComplete === 'function') ? options.onComplete : null;
            if (!cleanText) {
                if (onComplete) onComplete();
                return;
            }

            stopAllPlayback();
            const myToken = vaPlaybackToken;
            const audioId = options && options.audioId ? String(options.audioId).trim() : '';

            if (audioId && !missingViMp3AudioIds.has(audioId) && !(options && options.forceTTS)) {
                const audioUrl = `./audio/${encodeURIComponent(audioId)}_vi.mp3`;
                const audio = getPersistentAudioPlayer();
                audio.onended = null;
                audio.onerror = null;
                audio.loop = false;
                audio.src = audioUrl;
                audio.playbackRate = customRate;
                activeMp3Audio = audio;

                if (btnElement) btnElement.classList.add('speaking-btn');

                let fallbackTriggered = false;
                const triggerFallback = () => {
                    if (fallbackTriggered || myToken !== vaPlaybackToken) return;
                    fallbackTriggered = true;
                    missingViMp3AudioIds.add(audioId);
                    if (activeMp3Audio === audio) activeMp3Audio = null;
                    if (btnElement) btnElement.classList.remove('speaking-btn');
                    speakVietnameseWithWebSpeechAPI(cleanText, btnElement, customRate, onComplete, myToken);
                };

                audio.onended = () => {
                    if (activeMp3Audio === audio) activeMp3Audio = null;
                    if (btnElement) btnElement.classList.remove('speaking-btn');
                    if (onComplete && myToken === vaPlaybackToken) onComplete();
                };
                audio.onerror = triggerFallback;

                const playPromise = audio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(triggerFallback);
                }
                return;
            }

            speakVietnameseWithWebSpeechAPI(cleanText, btnElement, customRate, onComplete, myToken);
        }

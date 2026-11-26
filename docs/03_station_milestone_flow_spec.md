# Đặc tả Kỹ thuật 03: Luồng Hoàn thành Trạm & Chuyển bước Học sâu (Station Milestone Flow)

- **Phiên bản:** 1.0 (Giai đoạn 1 — Khép kín vòng lặp 4 bước)
- **Ngày cập nhật:** 27/11/2026
- **Các file liên quan:**
  - `js/station_milestone.js` *(Module độc lập 3 lớp — lõi tính năng)*
  - `js/app_controller.js` *(Quy tắc mở Tab mặc định khi vào Trạm)*
  - `js/ai_evaluator.js` *(Điểm móc hoàn thành phòng Luyện dịch)*
  - `js/audio_drill.js` *(Điểm móc hoàn thành phòng Nghe chép & Nghe–Nói)*
  - `js/dashboard_roadmap.js` *(Hiển thị huy hiệu 2 cấp trên Sơ đồ học & Thư viện lọc)*
  - `index.html` *(Nhúng `<script src="js/station_milestone.js"></script>` ngay sau `ai_evaluator.js`)*

---

## 1. Phễu học sâu 4 bước & Quy tắc mở Tab thông minh

Mỗi Trạm học được chuẩn hóa theo phễu làm chủ ngôn ngữ 4 tầng tuần tự:

`Lý thuyết (theory)` → `Luyện dịch (practice)` → `Nghe chép (dictation)` → `Nghe–Nói (audiodrill)` → `Trạm tiếp theo (next_station)`

### Quy tắc mở Tab mặc định (`openStructureWorkspace` trong `js/app_controller.js`)
Hệ thống tự động chọn Tab mở đầu dựa trên **trạng thái thực tế của Trạm**, không phụ thuộc vào việc người dùng bấm từ Trang chủ hay Sơ đồ học:

| Trạng thái của Trạm | Điều kiện kiểm tra (`hasAnyAttempt`) | Tab mở mặc định | Mục đích UX |
| :--- | :--- | :--- | :--- |
| **Trạm mới tinh (`0/15`)** | Chưa có câu nào đạt $\ge 7$ và chưa có câu sai | **`Lý thuyết`** | Đảm bảo người học (đặc biệt mức A1) xem công thức và 10 từ vựng trọng tâm trước khi dịch. |
| **Đang học dở (`1/15` – `14/15`)** | Đã có ít nhất 1 câu đạt hoặc 1 câu sai | **`Luyện dịch`** | Giữ nguyên mạch làm bài, nhảy thẳng tới câu chưa đạt tiếp theo. |
| **Đã hoàn thành (`15/15`)** | Đạt đủ 15/15 câu | **`Luyện dịch`** | Cho phép ôn nhanh hoặc tự chuyển sang Nghe chép / Nghe–Nói. |

---

## 2. Kiến trúc 3 lớp của `js/station_milestone.js`

Module được tách thành 3 lớp độc lập (IIFE, export qua `window.VA_STATION_MILESTONE`) để tránh trộn lẫn giao diện vào logic chấm bài:

### Lớp 1: Cấu hình luồng học (Data-First Config)
- Mảng `STATION_FLOW_STEPS` định nghĩa 4 bước chuẩn (`theory`, `practice`, `dictation`, `audiodrill`), bao gồm: nhãn hiển thị, icon, tiêu đề chúc mừng (`celebrationTitle`), mô tả (`celebrationSubtitle`) và bước tiếp theo mặc định (`defaultNext`).

### Lớp 2: Trạng thái tiến độ & Cờ chống lặp (State Layer)
- Lưu trong `localStorage` dưới key **`va_station_milestones`**, cấu trúc theo từng `structId`:
  ```json
  {
    "struct_possessive": {
      "practice":   { "completedAt": "2026-11-27T01:20:00.000Z", "celebrated": true },
      "dictation":  { "completedAt": "2026-11-27T01:35:00.000Z", "celebrated": true },
      "audiodrill": { "completedAt": "2026-11-27T01:45:00.000Z", "celebrated": true }
    }
  }
  - **Chống làm phiền khi ôn lại:** Hàm `onSkillCompleted()` luôn kiểm tra `hasCelebrated(structId, skillKey)`. Nếu đã từng hiện Popup cho kỹ năng đó của Trạm thì không bật lại ở các lần ôn tập sau.

### Lớp 3: Giao diện Popup & Sự kiện (UI / Event Layer)
- **Thời điểm kích hoạt (Cách B):** Độ trễ **`1200ms` (1.2 giây)** sau khi chấm xong câu cuối để học viên kịp đọc kết quả câu vừa làm. Chỉ bật nếu học viên vẫn đang ở đúng Trạm đó (`state.activeTab === 'practice'` và `state.selectedStructureId === struct.id`).
- **Quy tắc điều hướng nghiêm ngặt (`resolveNextAction`):**
  - Xong `Luyện dịch` → Nút chính: **Chuyển sang phòng Nghe chép** (nút phụ: *Thử sức Nghe–Nói* nếu chưa xong Nghe–Nói).
  - Xong `Nghe chép` → Nút chính: **Chuyển sang phòng Nghe–Nói** (`altAction: null` — **không** hiện nút nhảy sang Trạm tiếp theo để tránh đứt gãy phản xạ nói).
  - Xong `Nghe–Nói` → Nếu đủ cả 3 phòng thì Nút chính: **Sang Trạm tiếp theo**; nếu còn thiếu phòng nào thì tự động gợi ý quay lại hoàn tất phòng còn thiếu đó (không hiện nút phụ trùng với phòng vừa xong).
- **Xử lý phím `Esc` an toàn:** Bắt sự kiện `keydown` ở pha `capture` (`true`) kèm `stopImmediatePropagation()` để đóng Popup mà **không** kích hoạt nhầm hàm `retryCurrentQuestion()` (làm mất câu vừa gõ).
- **Nhãn đáy theo ngữ cảnh:** Tự động đổi giữa *"Ở lại xem lại câu vừa dịch"* / *"Ở lại phòng Nghe chép"* / *"Ở lại phòng Nghe–Nói"*.

---

## 3. Các điểm móc nối (Hooks) & Huy hiệu 2 cấp

### 3 điểm móc kích hoạt `VA_STATION_MILESTONE.onSkillCompleted(...)`
1. **Phòng Luyện dịch (`js/ai_evaluator.js` — trong `displayEvaluationResult`):**
   - Điều kiện: `prevBest < 7 && doneNow === struct.situations.length` (đúng khoảnh khắc số câu đạt nhảy từ `N-1 → N`, không phụ thuộc thứ tự câu).
   - Truyền `skillKey: 'practice'` và `bonusXp`.
2. **Phòng Nghe chép (`js/audio_drill.js` — trong `goNextDictationQuestion`):**
   - Điều kiện: Hoàn thành câu cuối cùng của danh sách và `doneCount >= total` trong `va_dictation_done`.
   - Truyền `skillKey: 'dictation'`. Đặt `loadDictationQuestion(0, false)` để không tự phát âm thanh đè lên Popup.
3. **Phòng Nghe–Nói (`js/audio_drill.js` — trong `startAudioDrillCurrentItem`):**
   - Điều kiện: Trình phát rảnh tay chạy hết câu cuối cùng (không bật lặp vô hạn `continuousLoop`) và đang ở trong một Trạm có `structId`.
   - Truyền `skillKey: 'audiodrill'`.

### Huy hiệu 2 cấp trên Sơ đồ học & Thư viện lọc (`js/dashboard_roadmap.js`)
Dùng hàm phụ `getStationMasteryFlags(structId, isPracticeDone)` đọc trạng thái từ `VA_STATION_MILESTONE.getProgress(structId)`:

| Cấp độ | Điều kiện | Hiển thị trên Sơ đồ học |
| :--- | :--- | :--- |
| **Cấp 1: Hoàn thành** | Đạt 15/15 câu Luyện dịch (`isPracticeDone === true`) | Nút tròn tích xanh (`#059669`) + nhãn **`✓ Hoàn thành`** (xanh ngọc) |
| **Cấp 2: Làm chủ Trạm** | Đạt 15/15 Luyện dịch **+** xong `Nghe chép` **+** xong `Nghe–Nói` | Nút tròn vương miện vàng (`#f59e0b`) + viền vàng + nhãn **`👑 Làm chủ Trạm`** |

---

## 4. Lộ trình nâng cấp Giai đoạn 2 & Chuyển đổi Next.js

### Nâng cấp Giai đoạn 2 cho phòng Nghe–Nói
- Giữ nguyên 2 chế độ rảnh tay hiện tại (*Phản xạ Nói* & *Nghe & Shadowing*).
- Bổ sung chế độ thứ 3: **Kiểm tra Nói (Mic)** tái sử dụng trực tiếp lõi chấm phát âm từng từ (`toggleSpeechPractice` & `gradeSpokenSentence` trong `js/ai_evaluator.js`), yêu cầu đạt >= 80% để tích xanh từng câu.

### Bảng ánh xạ sang Next.js + Supabase
| Thành phần bản thuần JS | Tương ứng trên Next.js + Supabase |
| :--- | :--- |
| `STATION_FLOW_STEPS` & `resolveNextAction` | `src/config/learningFlow.ts` (giữ nguyên logic thuần) |
| `localStorage['va_station_milestones']` | Bảng PostgreSQL `user_station_progress` (`practice_completed_at`, `dictation_completed_at`, `audiodrill_completed_at`) |
| `openModal()` trong `station_milestone.js` | React Component `<StationMilestoneModal />` dùng chung cho cả 3 phòng |
| `hasAnyAttempt ? 'practice' : 'theory'` | Hàm thuần `resolveInitialStationTab(progress)` trong route `/station/[id]` |

---

## 5. Checklist kiểm thử (Smoke Test)

1. **Test nhanh giao diện qua F12 Console (không cần dịch lại 15 câu):**
   - `VA_STATION_MILESTONE.preview('practice')` → Kiểm tra nút chính sang **Nghe chép**, nút phụ *Thử sức Nghe–Nói*.
   - `VA_STATION_MILESTONE.preview('dictation')` → Kiểm tra nút chính sang **Nghe–Nói**, **không** có nút sang Trạm tiếp theo, nhãn đáy *"Ở lại phòng Nghe chép"*.
   - `VA_STATION_MILESTONE.preview('audiodrill')` → Kiểm tra tiêu đề *"Làm chủ trọn vẹn Trạm học!"* và nút dẫn sang Trạm tiếp theo (khi đã xong 2 phòng trước).
2. **Test phím `Esc`:** Khi Popup đang mở ở phòng Luyện dịch, bấm `Esc` → Popup đóng, nội dung trong ô nhập dịch không bị xóa.
3. **Test chống lặp:** Dịch lại câu 15/15 ở Trạm đã hoàn thành → báo `+0 XP` và **không** bật lại Popup.
4. **Test mở Tab mặc định:** Bấm *Bắt đầu* ở Trạm `0/15` → mở tab `Lý thuyết`; bấm *Học tiếp* ở Trạm đang học dở → mở tab `Luyện dịch`.
5. **Test huy hiệu 2 cấp:** Trạm mới xong Luyện dịch hiện `✓ Hoàn thành` (xanh ngọc); Trạm xong đủ 3 phòng hiện `👑 Làm chủ Trạm` (vàng) trên cả Desktop và Mobile.
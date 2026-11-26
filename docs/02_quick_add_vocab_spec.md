# ĐẶC TẢ KỸ THUẬT: HỘP TỰ THÊM & CHỈNH SỬA TỪ VỰNG (QUICK ADD VOCAB MODAL)
**Ứng dụng:** ViệtAnh Master  
**Phiên bản:** 2.0 (Chống trùng lặp & Cập nhật đè bảo toàn SRS)  
**Module phụ trách:** `js/vocab_module.js`  
**Kho lưu trữ:** `localStorage` (`va_vocab_bank`) & Bộ nhớ đệm nghĩa (`va_vi_meaning_cache`)

---

## 1. Mục tiêu & Phạm vi
* Cho phép học viên chủ động thêm mới hoặc chỉnh sửa từ/cụm từ cá nhân ngay trong **Sổ tay** hoặc khi chạm vào ô từ ở **Câu trả lời chuẩn**.
* Hỗ trợ **tự động điền thông minh** (IPA, nghĩa tiếng Việt, từ loại, trình độ CEFR, câu ví dụ & bản dịch ví dụ) để giảm tối đa thao tác nhập tay.
* **Chống trùng lặp tuyệt đối:** Không tạo nhiều thẻ giống nhau cho cùng một từ, bảo toàn 100% lịch sử ôn tập SRS và chống cộng trùng điểm XP.

---

## 2. Các hàm cốt lõi (Core Functions)
1. **`openQuickAddVocabModal(editId = null)`**: Khởi tạo và hiển thị modal ở 1 trong 2 chế độ:
   * `editId === null`: Chế độ **Thêm mới** (*"Thêm Từ / Cụm từ mới"*).
   * `editId !== null`: Chế độ **Chỉnh sửa** (*"Chỉnh sửa từ: ..."*), nạp sẵn toàn bộ dữ liệu hiện có của thẻ.
2. **`autoPreviewModalIPA(enValue, forceViLookup = false)`**: Lắng nghe sự kiện `oninput` trên ô tiếng Anh để tự động tra cứu và điền sẵn các trường liên quan.
3. **`handleQuickAddVocabSubmit(e)`**: Xử lý chuẩn hóa dữ liệu, kiểm tra trùng lặp, lưu vào `va_vocab_bank`, cập nhật giao diện và cộng XP hợp lệ.

---

## 3. Luồng tự động tra cứu & điền sẵn (Auto-Fill Pipeline)
Khi người dùng gõ vào ô **Từ / Cụm từ Tiếng Anh**, hàm `autoPreviewModalIPA()` chạy theo 3 tầng ưu tiên:

* **Tầng 1 — Kho Từ điển Lõi Offline (`window.VA_DICTIONARY_CORE` • ~1ms):**
  * Tra khớp trực tiếp hoặc theo từ gốc (`getBaseWordCandidates`).
  * Nếu khớp: Điền ngay `ipa`, `vi`, `pos`, `level`, `exampleEn` và tự chọn `emoji` gợi nhớ. Đồng thời gọi ngầm `fetchVietnameseMeaningAPI()` để dịch `exampleEn` sang `exampleVi`.
* **Tầng 2 — Từ điển dự phòng Offline:**
  * Nếu chưa có trong Kho lõi, ghép IPA từ `EXTRA_IPA_DICT` / `sentenceToIPA()`.
  * Tra nghĩa theo thứ tự: `va_vi_meaning_cache` (cache tự học) → `hints` của câu đang luyện → `CORE_VI_DICT`.
* **Tầng 3 — API Trực tuyến (Debounce 300ms):**
  * Gọi `dictionaryapi.dev` để lấy IPA chuẩn quốc tế (cho cụm ≤ 4 từ).
  * Gọi Google Translate GTX (dự phòng MyMemory API) nếu ô nghĩa tiếng Việt vẫn đang trống hoặc mang cờ `dataset.autoFilled = '1'`.
  * *Cơ chế tôn trọng người dùng:* Nếu học viên tự gõ sửa tay vào ô nghĩa (`autoFilled = '0'`), API sẽ không ghi đè.

---

## 4. Logic xử lý khi bấm "Lưu vào Sổ tay" (3 nhánh)
Hàm `handleQuickAddVocabSubmit(e)` chuẩn hóa cặp dấu gạch chéo `/.../` cho IPA, lưu nghĩa vào `va_vi_meaning_cache`, sau đó rẽ 3 nhánh:

| Nhánh | Điều kiện kích hoạt | Hành vi hệ thống | Tiến độ SRS & XP |
| :--- | :--- | :--- | :--- |
| **1. Chỉnh sửa thẻ cũ** | Có `editId` | Cập nhật trực tiếp các trường nội dung tại vị trí cũ trong mảng `va_vocab_bank`. | Giữ nguyên SRS • `+0 XP` |
| **2. Trùng lặp (Cập nhật đè)** | `editId` rỗng **và** `en.toLowerCase()` đã tồn tại trong `va_vocab_bank` | Hiện hộp thoại `confirm()` hỏi xác nhận cập nhật đè. Nếu chọn **OK**: ghi đè nghĩa, IPA, từ loại, trình độ, ví dụ mới lên thẻ cũ và đẩy thẻ lên đầu danh sách. Nếu chọn **Hủy**: giữ nguyên modal để sửa lại. | **Giữ nguyên 100% tiến độ SRS** (`mastered`, `foreverMastered`, `reviewStage`, `nextReviewDue`) • **`+0 XP`** (chống cày XP ảo) |
| **3. Thêm mới hoàn toàn** | `editId` rỗng **và** từ chưa tồn tại | Tạo thẻ mới với `id = 'voc_' + Date.now()`, `topic = 'Tự ghi chép'`, đưa lên đầu mảng `va_vocab_bank`. Làm mới viền xanh lá nếu từ đang hiện ở khung Đáp án chuẩn. | Khởi tạo SRS ở Mốc 0 • **`+2 XP`** |

---

## 5. Cấu trúc bản ghi trong Sổ tay (`va_vocab_bank`)
```json
{
  "id": "voc_1764160000000",
  "en": "doctor",
  "vi": "bác sĩ",
  "ipa": "/ˈdɑːktər/",
  "pos": "n",
  "level": "A1",
  "emoji": "💡",
  "imageUrl": "",
  "topic": "Tự ghi chép",
  "exampleEn": "You should see a doctor.",
  "exampleVi": "Bạn nên đi khám bác sĩ.",
  "mastered": false,
  "foreverMastered": false,
  "reviewStage": 0,
  "nextReviewDue": null,
  "addedAt": "2026-11-26T14:00:00.000Z"
}
# ĐẶC TẢ KỸ THUẬT: CƠ CHẾ TỪ VỰNG TRỌNG TÂM CỦA TRẠM
**Ứng dụng:** ViệtAnh Master  
**Phiên bản:** 2.0 (Kiến trúc Data-First)  
**Phạm vi áp dụng:** Tab Lý thuyết của từng Trạm ngữ pháp (`renderStationVocabInTheory`)

---

## 1. Mục tiêu & Nguyên tắc kiến trúc
* **Data-First (Dữ liệu dẫn dắt giao diện):** Tách biệt hoàn toàn dữ liệu từ vựng biên soạn với logic hiển thị. Giao diện chỉ đóng vai trò đọc và hiển thị đúng danh sách từ đã được kiểm duyệt (đủ IPA, từ loại, nghĩa tiếng Việt).
* **Chống nhiễu nội dung:** Loại bỏ tình trạng tự động cắt mạo từ (`a/an/the`), lặp từ, hoặc tra nhầm từ loại khi tự động bóc tách từ câu mẫu.
* **Sẵn sàng cho Next.js & Database:** Dữ liệu thuần JSON-safe, liên kết chặt qua khóa ngoại `structId`.

---

## 2. Luồng dữ liệu (Data Flow)
1. **Tầng Dữ liệu (`data/stage_1.js`, `data/stage_2.js`, ...):** Khai báo mảng `vocab` riêng cho từng Chặng, gắn khóa `structId` trỏ về từng Trạm.
2. **Tầng Đăng ký (`data/data_registry.js`):** Hàm `VA_DATA_REGISTRY.registerStage()` tự động chống trùng `id`, gắn `stageId` và gom toàn bộ vào kho toàn cục `window.VOCAB_REPOSITORY_DATA`.
3. **Tầng Xử lý & Hiển thị (`js/modals_search.js`):**
   * `_buildStationVocabCache()` xây dựng bộ nhớ đệm (cache) theo cơ chế 2 tầng ưu tiên.
   * `getStationVocabItems(structId)` trả về danh sách từ của Trạm.
   * `renderStationVocabInTheory(struct)` hiển thị danh sách lên giao diện kèm nút nghe phát âm (`speakStationVocabItem`) và lưu Sổ tay (`saveStationVocabItem`).

---

## 3. Chuẩn cấu trúc dữ liệu (Vocab Schema)
Mọi mục từ vựng trong mảng `vocab` của các file `data/stage_x.js` bắt buộc tuân thủ cấu trúc JSON-safe sau:

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Có | Mã định danh duy nhất toàn cục | `"v_st2_01"` |
| `stageId` | `string` | Có | Mã Chặng chứa từ vựng | `"stage_2"` |
| `structId` | `string` | Có | Khóa liên kết tới Trạm ngữ pháp | `"struct_present_simple"` |
| `topic` | `string` | Có | Chủ đề chuẩn (`daily`, `food_shop`, `office`, `travel`, `interview`) | `"daily"` |
| `level` | `string` | Có | Trình độ CEFR (`A1` – `C2`) | `"A1"` |
| `term` | `string` | Có | Từ hoặc cụm từ tiếng Anh *(hỗ trợ tương thích ngược `word`)* | `"wake up"` |
| `pos` | `string` | Có | Từ loại viết gọn (`n`, `v`, `adj`, `adv`, `phr.v`, `phr`) *(tương thích ngược `type`)* | `"phr.v"` |
| `ipa` | `string` | Có | Phiên âm chuẩn IPA | `"/weɪk ʌp/"` |
| `vi` | `string` | Có | Nghĩa tiếng Việt ngắn gọn, sát ngữ cảnh Trạm | `"thức dậy"` |
| `exampleEn` | `string` | Không | Câu ví dụ tiếng Anh (tùy chọn) | `"I wake up at 6 AM."` |
| `exampleVi` | `string` | Không | Nghĩa câu ví dụ (tùy chọn) | `"Mình thức dậy lúc 6 giờ."` |

---

## 4. Cơ chế xử lý 2 tầng ưu tiên (Two-Tier Resolution)
Hàm `_buildStationVocabCache(targetCount = 15)` trong `js/modals_search.js` duyệt qua từng Trạm theo 2 tầng tách bạch:

### Tầng 1 — Ưu tiên tuyệt đối (Dữ liệu biên soạn)
* Lọc tất cả bản ghi trong `window.VOCAB_REPOSITORY_DATA` có `item.structId === struct.id`.
* Nếu tìm thấy ít nhất 1 từ (`manualItems.length > 0`):
  * Chuẩn hóa trường `term` (fallback `word`) và `pos` (fallback `type`).
  * Khử trùng cục bộ trong phạm vi Trạm (`localSeen`) bằng hàm `_normalizeVocabKey()`.
  * Lưu kết quả vào `byStructId` và **dừng xử lý Trạm này ngay lập tức** (không chạy Tầng 2).

### Tầng 2 — Dự phòng (Tự động trích xuất)
* **Chỉ kích hoạt** khi một Trạm hoàn toàn chưa có mảng `vocab` biên soạn (`manualItems.length === 0`).
* Quét lần lượt mảng `hints` và `keywords` trong `struct.situations` (tối đa `targetCount = 15` từ).
* Lọc bỏ từ dừng (`stopWords`), mẫu câu ngữ pháp (`grammarPhraseRegex`), khử trùng toàn cục (`globalAutoSeen`), và tra cứu bổ sung `pos`, `ipa`, `vi` từ Từ điển 3K (`window.VA_DICTIONARY_CORE`).

---

## 5. Tối ưu hiệu năng (Caching)
Để tránh chạy lại vòng lặp quét toàn bộ kho dữ liệu mỗi khi người dùng chuyển Trạm, `_vaStationVocabCache` sử dụng chữ ký trạng thái (`signature`):
```text
signature = `${allStructs.length}_${repo.length}_${Object.keys(dict).length}_${targetCount}`
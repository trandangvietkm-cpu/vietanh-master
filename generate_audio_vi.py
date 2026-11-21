"""
Tool tạo hàng loạt file MP3 giọng Tiếng Việt AI tự nhiên (Microsoft Edge Neural TTS — Miễn phí 100%)
Đọc trực tiếp từ toàn bộ file data/stage_*.js -> xuất ra ./audio/<id>_vi.mp3
Có sẵn cơ chế: nghỉ nhịp chống chặn (rate-limit), tự thử lại 3 lần khi lỗi mạng/NoAudioReceived, và tự xóa file 0 KB.

Cài thư viện (chỉ cần chạy 1 lần duy nhất):
    pip install edge-tts

Cách chạy (tạo toàn bộ file tiếng Việt còn thiếu):
    python generate_audio_vi.py

Tùy chọn nâng cao:
    python generate_audio_vi.py --voice nam       # Dùng giọng Nam (vi-VN-NamMinhNeural)
    python generate_audio_vi.py --all             # Tạo cả tiếng Việt (<id>_vi.mp3) lẫn tiếng Anh (<id>.mp3)
    python generate_audio_vi.py --overwrite       # Ghi đè lại kể cả file đã tồn tại
"""
import argparse
import asyncio
import glob
import json
import os
import re
import sys

try:
    import edge_tts
except ImportError:
    print("❌ Chưa cài thư viện edge-tts. Hãy chạy lệnh sau rồi thử lại:")
    print("   pip install edge-tts")
    sys.exit(1)

VOICE_VI_FEMALE = "vi-VN-HoaiMyNeural"   # Giọng Nữ miền Bắc (Mặc định — tự nhiên, rõ ràng)
VOICE_VI_MALE   = "vi-VN-NamMinhNeural"  # Giọng Nam
VOICE_EN        = "en-US-JennyNeural"    # Giọng Nữ Anh-Mỹ (dùng khi chạy --all)

DATA_GLOB  = os.path.join("data", "stage_*.js")
OUTPUT_DIR = "audio"


def load_situations_from_stage_file(js_path):
    with open(js_path, "r", encoding="utf-8") as f:
        text = f.read()

    m = re.search(r'"?structures"?\s*:\s*(\[[\s\S]*?\])\s*,\s*"?vocab"?\s*:', text)
    if not m:
        print(f"  [Bỏ qua] Không tìm thấy mảng structures trong {js_path}")
        return []

    structures = json.loads(m.group(1))
    items = []
    for st in structures:
        for sit in st.get("situations", []):
            sit_id = str(sit.get("id", "")).strip()
            vi_text = str(sit.get("vi", "")).strip()
            en_text = str(sit.get("sampleCasual", "")).strip()
            if sit_id and (vi_text or en_text):
                items.append((sit_id, vi_text, en_text))
    return items


def is_valid_audio_file(path):
    return os.path.exists(path) and os.path.getsize(path) > 1024


async def generate_one_with_retry(text, voice, out_path, max_retries=3):
    clean_text = text.strip().strip('"“”')
    for attempt in range(1, max_retries + 1):
        try:
            comm = edge_tts.Communicate(clean_text, voice)
            await comm.save(out_path)
            if is_valid_audio_file(out_path):
                return True
        except Exception as e:
            # Xóa file lỗi/0 KB nếu lỡ tạo ra
            if os.path.exists(out_path) and os.path.getsize(out_path) <= 1024:
                try:
                    os.remove(out_path)
                except OSError:
                    pass
            if attempt < max_retries:
                wait_s = attempt * 1.5
                print(f"    [Thử lại {attempt}/{max_retries - 1} sau {wait_s}s] {out_path} ({type(e).__name__})")
                await asyncio.sleep(wait_s)
            else:
                print(f"    [LỖI] Không tạo được {out_path}: {e}")
                return False
    return False


async def main():
    parser = argparse.ArgumentParser(description="Xuất hàng loạt MP3 tiếng Việt từ data/stage_*.js")
    parser.add_argument("--voice", choices=["nu", "nam"], default="nu", help="Chọn giọng Việt: nu (HoaiMy) hoặc nam (NamMinh)")
    parser.add_argument("--all", action="store_true", help="Xuất thêm cả file tiếng Anh (<id>.mp3)")
    parser.add_argument("--overwrite", action="store_true", help="Ghi đè lại các file MP3 đã tồn tại")
    args = parser.parse_args()

    vi_voice = VOICE_VI_MALE if args.voice == "nam" else VOICE_VI_FEMALE
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    stage_files = sorted(glob.glob(DATA_GLOB))
    if not stage_files:
        print(f"❌ Không tìm thấy file nào khớp '{DATA_GLOB}'. Hãy đặt script này ở thư mục gốc (cùng chỗ với index.html).")
        sys.exit(1)

    all_items = []
    for path in stage_files:
        items = load_situations_from_stage_file(path)
        print(f"📄 {path}: tìm thấy {len(items)} câu")
        all_items.extend(items)

    print(f"\n🎙️ Bắt đầu xuất MP3 Tiếng Việt ({vi_voice}) vào thư mục '{OUTPUT_DIR}/'...")
    created_vi = 0
    skipped_vi = 0
    failed_vi = 0
    created_en = 0

    for idx, (sit_id, vi_text, en_text) in enumerate(all_items, 1):
        # 1. Xuất file Tiếng Việt: audio/<id>_vi.mp3
        if vi_text:
            vi_path = os.path.join(OUTPUT_DIR, f"{sit_id}_vi.mp3")
            if args.overwrite or not is_valid_audio_file(vi_path):
                ok = await generate_one_with_retry(vi_text, vi_voice, vi_path)
                if ok:
                    created_vi += 1
                    print(f"  [{idx}/{len(all_items)}] [OK-VI] {vi_path}")
                else:
                    failed_vi += 1
                await asyncio.sleep(0.35)
            else:
                skipped_vi += 1

        # 2. (Tùy chọn --all) Xuất thêm file Tiếng Anh: audio/<id>.mp3
        if args.all and en_text:
            en_path = os.path.join(OUTPUT_DIR, f"{sit_id}.mp3")
            if args.overwrite or not is_valid_audio_file(en_path):
                ok = await generate_one_with_retry(en_text, VOICE_EN, en_path)
                if ok:
                    created_en += 1
                    print(f"  [{idx}/{len(all_items)}] [OK-EN] {en_path}")
                await asyncio.sleep(0.35)

    print(f"\n✅ Hoàn tất! Đã tạo mới {created_vi} file tiếng Việt (bỏ qua {skipped_vi} file đã có, lỗi {failed_vi}).")
    if args.all:
        print(f"✅ Đã tạo mới thêm {created_en} file tiếng Anh.")
    if failed_vi > 0:
        print("💡 Nếu có câu bị lỗi mạng tạm thời, bạn chỉ cần chạy lại 'python generate_audio_vi.py' để tạo nốt những câu còn thiếu.")


if __name__ == "__main__":
    asyncio.run(main())

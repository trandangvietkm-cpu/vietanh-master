"""
Tool tạo hàng loạt file MP3 giọng AI tự nhiên (Microsoft Edge Neural TTS — Miễn phí 100%)
cho toàn bộ câu hỏi trong questions_data.js -> lưu vào thư mục ./audio/<id>.mp3

Cách chạy trên máy tính (chỉ cần chạy 1 lần mỗi khi thêm Chặng mới):
    pip install edge-tts
    python generate_audio_stage1.py
"""
import asyncio
import json
import os
import re
import edge_tts

VOICE = "en-US-JennyNeural"  # Có thể đổi sang "en-US-AriaNeural" (Nữ) hoặc "en-US-GuyNeural" (Nam)
INPUT_FILE = "questions_data.js"
OUTPUT_DIR = "audio"

def load_situations(js_path):
    with open(js_path, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.search(r"window\.SENTENCE_STRUCTURES_DATA\s*=\s*(\[[\s\S]*?\]);", text)
    if not m:
        raise ValueError("Không tìm thấy window.SENTENCE_STRUCTURES_DATA trong questions_data.js")
    structures = json.loads(m.group(1))
    items = []
    for st in structures:
        for sit in st.get("situations", []):
            if sit.get("id") and sit.get("sampleCasual"):
                items.append((sit["id"], sit["sampleCasual"]))
    return items

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    items = load_situations(INPUT_FILE)
    print(f"Tìm thấy {len(items)} câu. Bắt đầu xuất MP3 với giọng {VOICE}...")

    created = 0
    for sit_id, sentence in items:
        out_path = os.path.join(OUTPUT_DIR, f"{sit_id}.mp3")
        if os.path.exists(out_path):
            continue
        comm = edge_tts.Communicate(sentence, VOICE)
        await comm.save(out_path)
        created += 1
        print(f"  [OK] {out_path}")

    print(f"Hoàn tất! Đã tạo mới {created} file MP3 trong thư mục '{OUTPUT_DIR}/'.")

if __name__ == "__main__":
    asyncio.run(main())

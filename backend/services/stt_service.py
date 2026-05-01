import whisper
import tempfile
import subprocess
import os

model = whisper.load_model("base")

def transcribe_audio(file):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(file.file.read())
            webm_path = tmp.name

        wav_path = webm_path.replace(".webm", ".wav")

        # 🔥 convert webm → wav using ffmpeg
        subprocess.run([
            "ffmpeg", "-i", webm_path,
            "-ar", "16000", "-ac", "1",
            wav_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        result = model.transcribe(wav_path)

        os.remove(webm_path)
        os.remove(wav_path)

        print("🧠 Whisper output:", result["text"])

        return {
            "text": result["text"],
            "language_detected": result.get("language", "unknown"),
            "confidence": 0.9
        }

    except Exception as e:
        print("❌ Whisper failed:", e)
        return {
            "text": "",
            "language_detected": "unknown",
            "confidence": 0.0
        }
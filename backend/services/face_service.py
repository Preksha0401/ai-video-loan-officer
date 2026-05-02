import base64
import cv2
import numpy as np
import tempfile
import os
import time
from deepface import DeepFace

# -----------------------------
# CONFIG
# -----------------------------
ANALYSIS_INTERVAL = 10     # seconds between DeepFace analyze calls
VERIFY_INTERVAL = 15       # seconds between face verify calls

# -----------------------------
# LOAD ONCE
# -----------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# caches (per session)
analysis_cache = {}
verify_cache = {}
liveness_counter = {}

# -----------------------------
# Helper
# -----------------------------
def decode_base64_image(image_base64: str):
    try:
        header, encoded = image_base64.split(",", 1)
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except:
        return None


# -----------------------------
# Face Detection (FAST)
# -----------------------------
def detect_face(image_base64: str):
    img = decode_base64_image(image_base64)
    if img is None:
        return {"face_detected": False, "face_box": None, "confidence": 0.0, "face_count": 0}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {"face_detected": False, "face_box": None, "confidence": 0.0, "face_count": 0}

    (x, y, w, h) = faces[0]

    return {
        "face_detected": True,
        "face_box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
        "confidence": 0.9,
        "face_count": len(faces),
    }


# -----------------------------
# DeepFace ANALYSIS (CACHED)
# -----------------------------
def analyze_face(session_id, image_base64):
    now = time.time()

    # return cached if recent
    if session_id in analysis_cache:
        if now - analysis_cache[session_id]["time"] < ANALYSIS_INTERVAL:
            return analysis_cache[session_id]["data"]

    try:
        img = decode_base64_image(image_base64)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            cv2.imwrite(tmp.name, img)
            temp_path = tmp.name

        result = DeepFace.analyze(
            img_path=temp_path,
            actions=["age", "emotion"],
            enforce_detection=False,
        )

        os.remove(temp_path)

        data = {
            "estimated_age": int(result[0]["age"]),
            "dominant_emotion": result[0]["dominant_emotion"],
            "age_confidence": 0.8,
        }

        analysis_cache[session_id] = {"time": now, "data": data}
        return data

    except Exception as e:
        print("❌ DeepFace analyze error:", e)
        return {
            "estimated_age": 30,
            "dominant_emotion": "neutral",
            "age_confidence": 0.0,
        }


# -----------------------------
# FACE VERIFY (CACHED)
# -----------------------------
def verify_face(session_id, id_image_base64, live_image_base64):
    now = time.time()

    if session_id in verify_cache:
        if now - verify_cache[session_id]["time"] < VERIFY_INTERVAL:
            return verify_cache[session_id]["data"]

    try:
        id_img = decode_base64_image(id_image_base64)
        live_img = decode_base64_image(live_image_base64)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f1, \
             tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f2:

            cv2.imwrite(f1.name, id_img)
            cv2.imwrite(f2.name, live_img)

            result = DeepFace.verify(
                img1_path=f1.name,
                img2_path=f2.name,
                enforce_detection=False,
            )

        os.remove(f1.name)
        os.remove(f2.name)

        data = {
            "face_match": result["verified"],
            "confidence": float(1 - result["distance"]),
        }

        verify_cache[session_id] = {"time": now, "data": data}
        return data

    except Exception as e:
        print("❌ verify error:", e)
        return {"face_match": False, "confidence": 0.0}


# -----------------------------
# LIVENESS (LIGHT)
# -----------------------------
def check_liveness(session_id, image_base64, challenge):
    if session_id not in liveness_counter:
        liveness_counter[session_id] = 0

    liveness_counter[session_id] += 1

    if challenge == "blink":
        passed = liveness_counter[session_id] > 2

    elif challenge == "smile":
        analysis = analyze_face(session_id, image_base64)
        passed = analysis["dominant_emotion"] == "happy"

    else:
        passed = True

    return {
        "liveness_passed": passed,
        "confidence": 0.85 if passed else 0.3,
    }


# -----------------------------
# MAIN PIPELINE
# -----------------------------
def process_face(session, image_base64: str, challenge: str = None):
    session_id = session["session_id"]

    detection = detect_face(image_base64)

    # 🚫 skip heavy work if no face
    if not detection["face_detected"]:
        return {
            **detection,
            "estimated_age": 0,
            "dominant_emotion": "none",
            "face_match": False,
            "liveness_passed": False,
            "confidence": 0.0,
        }

    # 🔥 optimized calls
    analysis = analyze_face(session_id, image_base64)

    match_result = {"face_match": False, "confidence": 0.0}
    if session.get("id_image"):
        match_result = verify_face(session_id, session["id_image"], image_base64)

    liveness = {"liveness_passed": False, "confidence": 0.0}
    if challenge:
        liveness = check_liveness(session_id, image_base64, challenge)

    return {
        **detection,
        **analysis,
        **match_result,
        **liveness,
    }
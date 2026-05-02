import base64
import cv2
import numpy as np
import tempfile
import os
from deepface import DeepFace

# Load Haar Cascade once
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Memory for liveness tracking
liveness_counter = {}


# -----------------------------
# 🧠 Helper: base64 → image
# -----------------------------
def decode_base64_image(image_base64: str):
    try:
        header, encoded = image_base64.split(",", 1)
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print("❌ decode error:", e)
        return None


# -----------------------------
# 👁️ Face Detection
# -----------------------------
def detect_face(image_base64: str):
    img = decode_base64_image(image_base64)
    if img is None:
        return {
            "face_detected": False,
            "face_box": None,
            "confidence": 0.0,
            "face_count": 0,
        }

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {
            "face_detected": False,
            "face_box": None,
            "confidence": 0.0,
            "face_count": 0,
        }

    (x, y, w, h) = faces[0]

    return {
        "face_detected": True,
        "face_box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
        "confidence": 0.9,  # heuristic
        "face_count": len(faces),
    }


# -----------------------------
# 😄 DeepFace Analysis
# -----------------------------
def analyze_face(image_base64: str):
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

        return {
            "estimated_age": int(result[0]["age"]),
            "dominant_emotion": result[0]["dominant_emotion"],
            "age_confidence": 0.8,
        }

    except Exception as e:
        print("❌ DeepFace error:", e)

        return {
            "estimated_age": 30,
            "dominant_emotion": "neutral",
            "age_confidence": 0.0,
        }


# -----------------------------
# 🔍 Face Match (ID vs Live)
# -----------------------------
def verify_face(id_image_base64: str, live_image_base64: str):
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

        return {
            "face_match": result["verified"],
            "confidence": float(1 - result["distance"]),
        }

    except Exception as e:
        print("❌ Face verify error:", e)

        return {
            "face_match": False,
            "confidence": 0.0,
        }


# -----------------------------
# 👀 Liveness Check (Simulated)
# -----------------------------
def check_liveness(image_base64: str, challenge: str, session_id: str):
    if session_id not in liveness_counter:
        liveness_counter[session_id] = 0

    liveness_counter[session_id] += 1

    # simple logic
    if challenge == "blink":
        passed = liveness_counter[session_id] > 2

    elif challenge == "smile":
        analysis = analyze_face(image_base64)
        passed = analysis["dominant_emotion"] == "happy"

    else:
        passed = True

    return {
        "liveness_passed": passed,
        "challenge": challenge,
        "confidence": 0.85 if passed else 0.3,
    }


# -----------------------------
# 🔗 MAIN PIPELINE
# -----------------------------
def process_face(session, image_base64: str, challenge: str = None):
    detection = detect_face(image_base64)
    analysis = analyze_face(image_base64)

    match_result = {"face_match": False, "confidence": 0.0}

    if session.get("id_image") and session["id_image"]:
        match_result = verify_face(session["id_image"], image_base64)

    liveness = {
        "liveness_passed": False,
        "confidence": 0.0,
    }

    if challenge:
        liveness = check_liveness(image_base64, challenge, session["session_id"])

    return {
        **detection,
        **analysis,
        **match_result,
        **liveness,
    }
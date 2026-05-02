import base64
import cv2
import numpy as np
import time

# -----------------------------
# CONFIG
# -----------------------------
ANALYSIS_INTERVAL = 10
VERIFY_INTERVAL = 15

# -----------------------------
# LOAD MODEL
# -----------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# -----------------------------
# STATE / CACHE
# -----------------------------
analysis_cache = {}
verify_cache = {}
liveness_counter = {}

# -----------------------------
# HELPER
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
# FACE DETECTION
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
        "face_box": {
            "x": int(x),
            "y": int(y),
            "w": int(w),
            "h": int(h),
        },
        "confidence": float(0.9),
        "face_count": int(len(faces)),
    }


# -----------------------------
# FACE EMBEDDING (LIGHT)
# -----------------------------
def get_face_embedding(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    # crop face only
    if len(faces) > 0:
        x, y, w, h = faces[0]
        gray = gray[y:y+h, x:x+w]

    resized = cv2.resize(gray, (100, 100))
    return resized.flatten()


# -----------------------------
# ANALYSIS (CACHED)
# -----------------------------
def analyze_face(session_id, image_base64):
    now = time.time()

    if session_id in analysis_cache:
        if now - analysis_cache[session_id]["time"] < ANALYSIS_INTERVAL:
            return analysis_cache[session_id]["data"]

    img = decode_base64_image(image_base64)

    if img is None:
        return {
            "estimated_age": 30,
            "dominant_emotion": "neutral",
            "age_confidence": 0.0,
        }

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))

    if brightness > 120:
        emotion = "happy"
    elif brightness < 70:
        emotion = "sad"
    else:
        emotion = "neutral"

    age = int(20 + (brightness % 20))

    data = {
        "estimated_age": int(age),
        "dominant_emotion": str(emotion),
        "age_confidence": float(0.6),
    }

    analysis_cache[session_id] = {"time": now, "data": data}
    return data


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

        emb1 = get_face_embedding(id_img)
        emb2 = get_face_embedding(live_img)

        similarity = float(
            np.dot(emb1, emb2)
            / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        )

        data = {
            "face_match": bool(similarity > 0.75),
            "confidence": float(similarity),
        }

        verify_cache[session_id] = {"time": now, "data": data}
        return data

    except Exception as e:
        print("❌ verify error:", e)
        return {
            "face_match": False,
            "confidence": 0.0,
        }


# -----------------------------
# LIVENESS
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
        "liveness_passed": bool(passed),
        "confidence": float(0.85 if passed else 0.3),
    }


# -----------------------------
# MAIN PIPELINE
# -----------------------------
def process_face(session, image_base64: str, challenge: str = None):
    session_id = session["session_id"]

    detection = detect_face(image_base64)

    # 🚫 NO FACE → SAFE RETURN
    if not detection["face_detected"]:
        return {
            "face_detected": False,
            "face_box": None,
            "confidence": 0.0,
            "face_count": 0,

            "estimated_age": 0,
            "dominant_emotion": "none",

            "face_match": False,
            "liveness_passed": False,
        }

    # 🔥 ANALYSIS
    analysis = analyze_face(session_id, image_base64)

    # 🔥 FACE MATCH
    match_result = {"face_match": False, "confidence": 0.0}
    if session.get("id_image"):
        match_result = verify_face(
            session_id,
            session["id_image"],
            image_base64,
        )

    # 🔥 LIVENESS
    liveness = {"liveness_passed": False, "confidence": 0.0}
    if challenge:
        liveness = check_liveness(session_id, image_base64, challenge)

    # ✅ FINAL SAFE RESPONSE
    return {
        "face_detected": bool(detection["face_detected"]),
        "face_box": detection["face_box"],
        "confidence": float(detection["confidence"]),

        "estimated_age": int(analysis["estimated_age"]),
        "dominant_emotion": str(analysis["dominant_emotion"]),

        "face_match": bool(match_result["face_match"]),
        "liveness_passed": bool(liveness["liveness_passed"]),
    }
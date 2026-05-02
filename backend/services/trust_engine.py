from datetime import datetime

class TrustEngine:
    def __init__(self):
        self.score = 100
        self.history = []

    def _log(self, signal, impact):
        self.history.append({
            "signal": signal,
            "impact": impact,
            "time": datetime.now().isoformat()
        })

    def update(self, signal_type: str, value):
        impact = 0

        if signal_type == "face_match":
            if value < 0.5:
                impact = -15   # 🔥 reduced
        elif signal_type == "liveness_failed":
            impact = -15

        elif signal_type == "hesitation":
            if value > 5:
                impact = -5
        elif signal_type == "consistent_answers":
            impact = +5
        elif signal_type == "income_inconsistency":
            impact = -20

        elif signal_type == "voice_stress":
            impact = -10

        elif signal_type == "answer_contradiction":
            impact = -25

        elif signal_type == "consistent_answers":
            impact = +5

        self.score = max(30, min(100, self.score + impact))

        self._log(signal_type, impact)

        return self.score

    def get_explanation(self):
        explanations = []
        for h in self.history[-5:]:
            if h["impact"] < 0:
                explanations.append(f"⚠ {h['signal'].replace('_',' ')}")
            else:
                explanations.append(f"✅ {h['signal'].replace('_',' ')}")
        return explanations

    def get_band(self):
        if self.score < 40:
            return "REJECT"
        elif self.score < 60:
            return "CONDITIONAL"
        return "APPROVED"
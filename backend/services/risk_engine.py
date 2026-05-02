class RiskEngine:

    def evaluate(self, session_data, trust_score):
        income = session_data.get("income", 0)
        employment = session_data.get("employment", "")
        loan_type = session_data.get("loan_type", "Personal")

        credit_score = 720  # simulated (as per your spec)

        reasons = []

        # ✅ Minimum income rules
        min_income_map = {
            "Personal": 20000,
            "Business": 25000,
            "Education": 10000,
            "Vehicle": 20000,
        }

        min_income = min_income_map.get(loan_type, 20000)

        # ❌ REJECTION CONDITIONS
        if trust_score < 30:
            return {
                "decision": "REJECTED",
                "risk_band": "HIGH",
                "reasons": ["Low trust score"],
            }

        if income < min_income:
            return {
                "decision": "REJECTED",
                "risk_band": "HIGH",
                "reasons": [f"Income below ₹{min_income} requirement"],
            }

        if credit_score < 600:
            return {
                "decision": "REJECTED",
                "risk_band": "HIGH",
                "reasons": ["Low credit score"],
            }

        # ⚠ CONDITIONAL
        if 30 <= trust_score < 50:
            return {
                "decision": "CONDITIONAL",
                "risk_band": "MEDIUM",
                "reasons": ["Moderate trust score"],
            }

        # ✅ APPROVED
        return {
            "decision": "APPROVED",
            "risk_band": "LOW",
            "reasons": [
                "High trust score",
                "Income meets eligibility",
                "Good credit profile"
            ],
        }
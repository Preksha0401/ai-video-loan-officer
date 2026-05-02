class RiskEngine:

    def evaluate(self, session_data, trust_score):
        income = session_data.get("income", 0)
        employment = session_data.get("employment", "")
        loan_type = session_data.get("loan_type", "Personal")

        credit_score = 720  # simulated

        reasons = []
        explanation = []

        # -------------------------
        # 💰 INCOME ANALYSIS
        # -------------------------
        if income >= 50000:
            explanation.append(f"Strong income ₹{income}/month supports repayment capacity")
        else:
            explanation.append(f"Moderate income ₹{income}/month — risk slightly higher")

        # -------------------------
        # 👔 EMPLOYMENT
        # -------------------------
        if employment in ["salaried", "full-time"]:
            explanation.append("Stable employment detected")
        else:
            explanation.append("Non-stable employment — higher risk")

        # -------------------------
        # 📊 TRUST SCORE
        # -------------------------
        if trust_score >= 80:
            explanation.append("High behavioral trust score — low fraud risk")
        elif trust_score >= 60:
            explanation.append("Moderate trust score — minor inconsistencies detected")
        else:
            explanation.append("Low trust score — risk signals detected")

        # -------------------------
        # 📉 POLICY CHECK
        # -------------------------
        min_income_map = {
            "Personal": 20000,
            "Business": 25000,
            "Education": 10000,
            "Vehicle": 20000,
        }

        min_income = min_income_map.get(loan_type, 20000)

        if income < min_income:
            return {
                "decision": "REJECTED",
                "risk_band": "HIGH",
                "reasons": [f"Income below ₹{min_income} requirement"],
                "explanation": explanation
            }

        # -------------------------
        # 🎯 FINAL DECISION
        # -------------------------
        if trust_score < 30:
            return {
                "decision": "REJECTED",
                "risk_band": "HIGH",
                "reasons": ["Low trust score"],
                "explanation": explanation
            }

        if 30 <= trust_score < 50:
            return {
                "decision": "CONDITIONAL",
                "risk_band": "MEDIUM",
                "reasons": ["Moderate trust score"],
                "explanation": explanation
            }

        return {
            "decision": "APPROVED",
            "risk_band": "LOW",
            "reasons": [
                "High trust score",
                "Income meets eligibility",
                "Good credit profile"
            ],
            "explanation": explanation
        }
import math

class OfferEngine:

    def calculate_emi(self, principal, rate, tenure_months):
        r = rate / (12 * 100)
        emi = (principal * r * (1 + r) ** tenure_months) / ((1 + r) ** tenure_months - 1)
        return round(emi, 2)

    def generate_offer(self, session, trust_score):
        income = session.get("income", 0)
        requested_amount = session.get("loan_amount", 100000)

        # 🎯 Risk-based interest rate
        if trust_score >= 80:
            rate = 10.5
        elif trust_score >= 60:
            rate = 12.5
        else:
            rate = 15.0

        # 🎯 Cap loan based on income
        max_loan = income * 20
        approved_amount = min(requested_amount, max_loan)

        tenures = [12, 24, 36]

        offers = []

        for t in tenures:
            emi = self.calculate_emi(approved_amount, rate, t)

            offers.append({
                "tenure": t,
                "emi": emi,
                "total_payment": round(emi * t, 2)
            })

        return {
            "approved_amount": approved_amount,
            "interest_rate": rate,
            "offers": offers
        }
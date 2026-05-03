# AI Video Loan Officer — TenzorX 2026

## Overview
An end-to-end AI-powered system that conducts a real-time video interview, extracts structured data from speech, verifies identity, evaluates trust, and generates an instant loan decision with offer — all without human intervention.

---

## Problem Statement
Traditional loan processes are:

- Manual and time-consuming  
- Form-heavy and user-unfriendly  
- Prone to fraud (detected after submission)  
- Lacking real-time intelligence  

---

## Solution
This system functions as a fully automated AI Loan Officer that:

- Interacts with users through conversation instead of forms  
- Extracts financial data from speech  
- Verifies identity using face recognition and liveness detection  
- Detects fraud signals during the interview  
- Generates instant loan decisions and EMI offers  
- Produces a downloadable loan offer PDF  

---

## Key Features

### Agentic AI Interview
- Dynamic, context-aware questioning  
- Adapts in real time without a fixed script  

### Speech to Structured Data
- Converts user responses into structured JSON  
- Extracts income, employment details, and loan purpose  

### Face Verification and Liveness Detection
- Real-time face detection using OpenCV  
- Liveness checks (blink/smile detection)  
- ID and live face comparison  

### Real-Time Trust Score Engine
Evaluates behavioral signals such as:

- Response hesitation  
- Answer inconsistencies  
- Face mismatch  
- Liveness failure  

Score updates continuously during the interview.

### AI Decision Engine
Combines:

- Trust score  
- Income eligibility  
- Policy rules  

Outputs:

- APPROVED  
- CONDITIONAL  
- REJECTED  

### Loan Offer Generator
- EMI calculation  
- Multiple tenure options  
- Instant offer generation  

### PDF Generation
- User selects preferred EMI plan  
- Downloadable loan offer is generated  

---

## System Architecture

```

User (Voice + Video)
↓
Speech-to-Text (Browser Speech API)
↓
AI Interview Engine (LLM)
↓
Data Extraction (JSON)
↓
Face and Liveness Verification
↓
Trust Engine (Real-time scoring)
↓
Decision Engine
↓
Offer Engine (EMI + Tenure)
↓
PDF Generation

```

The entire pipeline operates in real time without manual review or post-processing.

---

## Tech Stack

### Frontend
- React.js  
- Web Speech API  
- Canvas API  
- Tailwind CSS  

### Backend
- FastAPI  
- Python  

### AI and Intelligence
- Mistral (LLM for conversation and extraction)  
- Custom logic for speech-to-JSON conversion  

### Computer Vision
- OpenCV (face detection)  
- Lightweight liveness detection  

### System Design
- Session-based architecture  
- Real-time signal processing  
- Modular components:
  - Interview Engine  
  - Trust Engine  
  - Decision Engine  

---

## Trust Score Signals

| Signal                 | Description               |
|------------------------|---------------------------|
| Hesitation             | Slow response time        |
| Income Inconsistency   | Conflicting answers       |
| Face Match             | ID vs live mismatch       |
| Liveness Failure       | Possible spoofing         |
| Behavioral Consistency | Stable responses          |

---

## Decision Logic
- Trust Score ≥ 50 → Approved  
- Trust Score 30–49 → Conditional  
- Trust Score < 30 → Rejected  

Additional checks include:

- Minimum income requirements  
- Simulated credit score  
- Employment validation  

---

## Additional Capabilities
- Document upload (ID verification)  
- Explainable AI decisions with reasoning  

---

## How to Run

### Backend
```

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

```

### Frontend
```

cd frontend
npm install
npm run dev

```

---

## Demo Flow
1. User applies for a loan  
2. Receives a link to the interview  
3. Starts a video-based AI interview  
4. Responds naturally via speech  
5. System performs:
   - Data extraction  
   - Identity verification  
   - Trust evaluation  
6. Instant decision is generated  
7. Loan offer is presented  
8. User selects EMI plan  
9. PDF offer is generated  

---

## Differentiators
- Real-time evaluation instead of post-processing  
- Multimodal AI (voice, facial, behavioral signals)  
- Explainable decisions  
- Fully functional prototype  
- End-to-end automation  

---

## Impact
- Faster loan approvals (minutes instead of days)  
- Reduced fraud risk  
- Improved user experience  
- Scalable for financial institutions  

---

## Team
CampusCoders

---

## Demo
(https://drive.google.com/file/d/1-RAtEcrx5WQA9ETv7W9j9b9gBues4EAs/view?usp=drive_link)

---

## Closing Note
This project demonstrates a shift from traditional form-based systems to intelligent, real-time AI-driven financial decision-making.
```


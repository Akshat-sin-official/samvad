# Autonomous BRD-to-Data Intelligence Agent

**Enterprise-Grade AI Architecture Generator**

![Status](https://img.shields.io/badge/Status-MVP-success)
![Tech](https://img.shields.io/badge/Tech-FastAPI%20%7C%20React%20%7C%20Vertex%20AI-blue)

## 1. Project Overview

This system is a deterministic multi-agent AI workflow engine that converts raw business ideas into enterprise-ready technical documentation. It is NOT a chatbot. It orchestrates a sequential pipeline using Google Cloud Vertex AI (Gemini 1.5 Pro & Flash) to generate:

1.  **Structured Business Requirements Document (BRD)**
2.  **Gap & Risk Analysis**
3.  **Normalized Data Dictionary (Database Schema)**
4.  **Compliance & Security Audit (PII, GDPR, Encryption)**

The output is strictly structured JSON, validated against Pydantic schemas to ensure engineering reliability.

---

## 2. Architecture Explanation

### **Frontend**
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Radix UI (Shadcn-like).
- **Design Logic**: Split-screen interface. Left panel for input, Right panel for multi-tabbed structured output.
- **Key Features**: Real-time loading states, copy-to-clipboard, responsive layout, dark-mode inspired "Enterprise" aesthetic.

### **Backend**
- **Tech Stack**: Python 3.11, FastAPI, Uvicorn, Vertex AI SDK.
- **Agent Design**:
    - `BRD Agent` (Gemini 1.5 Pro): Generates requirements.
    - `Gap Agent` (Gemini 1.5 Pro): Critiques the BRD for missing logic.
    - `Data Agent` (Gemini 1.5 Pro): Transforms BRD into Entity-Relationship models.
    - `Compliance Agent` (Gemini 1.5 Flash): Audits data models for regulatory risks.
- **Orchestration**: A linear, deterministic pipeline ensuring `Input -> BRD -> Gap -> Model -> Compliance`.

---

## 3. Setup Steps (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud Project with Vertex AI API enabled.

### Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment:
   - Copy `.env.example` to `.env`
   - Fill in `PROJECT_ID` and `LOCATION`.
   - Ensure you have Google Application Credentials set up (run `gcloud auth application-default login` or set `GOOGLE_APPLICATION_CREDENTIALS` path).

5. Run Server:
   ```bash
   uvicorn backend.main:app --reload --port 8080
   ```

### Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Development Server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 4. Vertex AI Setup Guide

1. **Create a Google Cloud Project**: Go to [Google Cloud Console](https://console.cloud.google.com/).
2. **Enable Vertex AI API**: Search for "Vertex AI" and enable the API.
3. **Authentication**:
   - For local development: Install `gcloud` CLI and run `gcloud auth application-default login`.
   - For Cloud Run: Create a Service Account with `Vertex AI User` role.

---

## 5. Environment Variable Configuration

Create a `.env` file in `backend/` based on `.env.example`:

```env
PROJECT_ID=your-gcp-project-id
LOCATION=us-central1
# Optional if using default credentials
# GOOGLE_APPLICATION_CREDENTIALS=keywords/key.json 
```

---

## 6. Docker Build Instructions

To containerize the backend for production:

1. **Build the image**:
   ```bash
   docker build -t auto-brd-backend ./backend
   ```

2. **Run container locally**:
   ```bash
   docker run -p 8080:8080 -e PROJECT_ID=your-id -e LOCATION=us-central1 -v ~/.config/gcloud:/root/.config/gcloud auto-brd-backend
   ```

---

## 7. Cloud Run Deployment Steps

1. **Submit Build to Container Registry/Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/auto-brd-backend ./backend
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy auto-brd-backend \
     --image gcr.io/YOUR_PROJECT_ID/auto-brd-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars PROJECT_ID=YOUR_PROJECT_ID,LOCATION=us-central1
   ```

3. **Frontend Deployment**:
   - Build frontend: `npm run build`
   - Deploy `dist/` to structure hosting (Firebase Hosting, Vercel, or GCS bucket).

---

**Built for the Hackathon 2026.**

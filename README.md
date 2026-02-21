# Autonomous BRD-to-Data Intelligence Agent

**Enterprise-Grade AI Architecture Generator**

![Status](https://img.shields.io/badge/Status-MVP-success)
![Tech](https://img.shields.io/badge/Tech-FastAPI%20%7C%20React%20%7C%20Vertex%20AI-blue)

## 1. Project Overview

This system is a deterministic multi-agent AI workflow engine that converts raw business ideas into enterprise-ready technical documentation. It orchestrates a sequential pipeline using Google Cloud Vertex AI (Gemini 2.0 Flash & Flash Lite) to generate:

1.  **Structured Business Requirements Document (BRD)**
2.  **Gap & Risk Analysis**
3.  **Normalized Data Dictionary (Database Schema)**
4.  **Compliance & Security Audit (PII, GDPR, Encryption)**

The output is always strictly structured JSON, validated against Pydantic schemas to ensure engineering reliability, and rendered dynamically on the frontend.

---

## 2. Key Features Implemented

### **Generative AI Pipeline**
- **Multi-Agent Orchestration**: Specialized agents handle individual steps of the architectural breakdown.
    - `BRD Agent` (Gemini 2.0 Flash): Requirements generation.
    - `Gap Agent` (Gemini 2.0 Flash): Logic critique.
    - `Data Agent` (Gemini 2.0 Flash): Entity-Relationship modeling.
    - `Compliance Agent` (Gemini 2.0 Flash Lite): Regulatory risk audit.
- **Pydantic Validation**: All Agent outputs are strictly enforced via Pydantic schema validation.

### **Authentication & Security**
- **Firebase Authentication**: Full integration with Firebase for JWT-based Email/Password and Google OAuth login flows.
- **Custom Application-Level 2FA (TOTP)**: 
  - Complete backend integration logic built in Python utilizing `pyotp` and Firebase Firestore to securely store generated secrets.
  - Interactive "Enable 2FA" panel to instantly generate and display QR codes for Authenticator Apps (Authy, Google Authenticator).
  - Secure React app-level `TwoFactorGate` interceptor enforcing a TOTP challenge upon every fresh sign-in if 2FA is toggled on.
- **Environment & Secret Protection**: `.env` and `.gitignore` configured to securely house API keys and secrets. 

### **UI / UX Features**
- **Sleek Enterprise Design Pattern**:
  - React 18 frontend leveraging Tailwind CSS & Radix UI primitives.
  - Granular application states with smooth `framer-motion` animations, minimal monochromatic toast alerts, and a professional aesthetic.
- **Account & Project Settings**:
  - Comprehensive user settings dashboard to view and tweak profile options, security preferences, password resets, and 2FA states.
- **Project Versioning & History**:
  - Persistent storage in Firestore, allowing users to save multiple Projects and quickly toggle between historical architectural generation versions per project.

---

## 3. Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Radix UI (Shadcn-inspired components)
- **State Management**: `zustand` / React Context (`useAuth`)
- **API Communication**: `axios` with JWT request interceptors

### **Backend**
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **AI Core**: Google Vertex AI SDK (`google-genai`)
- **Database**: Google Cloud Firestore (Firebase Admin SDK)
- **Authentication**: JWT token validation mirroring Firebase Auth
- **Security Utilities**: `pyotp` (TOTP generation), `qrcode`

---

## 4. Setup Steps (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud Project with the **Vertex AI API** enabled.
- Firebase Project configured and enabled.

### Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create and activate the virtual environment:
   ```bash
   python -m venv venv
   # Mac/Linux:
   source venv/bin/activate  
   # Windows:
   .\venv\Scripts\activate
   ```
3. Install strict dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment:
   - Copy `.env.example` to `.env`
   - Fill in your `PROJECT_ID` and `LOCATION`.
   - Ensure your Firebase Private Key JSON file path is correctly linked to `GOOGLE_APPLICATION_CREDENTIALS` (or run `gcloud auth application-default login`).
5. Run Server:
   ```bash
   uvicorn backend.main:app --reload --port 8080
   ```
   *Note: if dealing with relative imports from the root folder, run `python -m uvicorn backend.main:app --reload --port 8080` from the root directory instead.*

### Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Copy `.env.example` to `.env`.
   - Insert your Firebase Configuration keys (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc).
4. Run Development Server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

---

## 5. Firebase & Vertex AI Setup Guide

1. **Google Cloud Project**: Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project. Enable the **Vertex AI** billing API.
2. **Firebase Auth**: Go to the [Firebase Console](https://console.firebase.google.com/), add your GCP project, and initialize the **Authentication** and **Firestore Database** modules. 
3. **Admin SDK**: Under Project Settings > Service Accounts, generate a new Private Key and save it securely on your backend (e.g., `backend/firebase_key.json`).

---

## 6. Deployment (Docker & Cloud Run)

To containerize the backend for production:

1. **Build the image**:
   ```bash
   docker build -t auto-brd-backend ./backend
   ```
2. **Run container locally to test**:
   ```bash
   docker run -p 8080:8080 -e PROJECT_ID=your-id -e LOCATION=us-central1 -v ~/.config/gcloud:/root/.config/gcloud auto-brd-backend
   ```
3. **Deploy to Cloud Run via gcloud CLI**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/auto-brd-backend ./backend
   
   gcloud run deploy auto-brd-backend \
     --image gcr.io/YOUR_PROJECT_ID/auto-brd-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars PROJECT_ID=YOUR_PROJECT_ID,LOCATION=us-central1
   ```
4. **Deploy Frontend**:
   - `npm run build` inside `/frontend`.
   - Take the output folder `dist/` and deploy it onto Firebase Hosting, Vercel, or AWS S3. 

---

**Built for Hackathon 2026.**

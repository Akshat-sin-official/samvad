# Technology Stack

This document lists all technologies, frameworks, libraries, and services used in the Autonomous BRD application.

## Frontend

### Core Framework & Language
- **React** (v19.2.0) - UI library
- **TypeScript** (v5.9.3) - Type-safe JavaScript
- **Vite** (v7.3.1) - Build tool and dev server

### UI Libraries & Components
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-accordion` (v1.2.12)
  - `@radix-ui/react-scroll-area` (v1.2.10)
  - `@radix-ui/react-slot` (v1.2.4)
  - `@radix-ui/react-tabs` (v1.1.13)
- **Lucide React** (v0.574.0) - Icon library
- **Framer Motion** (v11.18.2) - Animation library
- **Mermaid** (v11.12.3) - Diagram rendering

### Styling
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **Tailwind CSS Animate** (v1.0.7) - Animation utilities
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.24) - CSS vendor prefixing
- **Tailwind PostCSS** (v4.1.18) - Tailwind PostCSS plugin
- **clsx** (v2.1.1) - Conditional className utility
- **tailwind-merge** (v3.4.1) - Merge Tailwind classes
- **class-variance-authority** (v0.7.1) - Component variant management

### State Management & Data Fetching
- **Axios** (v1.13.5) - HTTP client
- **React Hooks** - Built-in state management

### Authentication & Backend Services
- **Firebase** (v11.1.0) - Authentication service
  - Firebase Authentication (Google Sign-In)
  - Firebase App initialization

### Development Tools
- **ESLint** (v9.39.1) - Code linting
  - `@eslint/js` (v9.39.1)
  - `eslint-plugin-react-hooks` (v7.0.1)
  - `eslint-plugin-react-refresh` (v0.4.24)
- **TypeScript ESLint** (v8.48.0) - TypeScript linting
- **Vercel Speed Insights** (v1.3.1) - Performance monitoring

### Build & Type Definitions
- `@types/node` (v24.10.1)
- `@types/react` (v19.2.7)
- `@types/react-dom` (v19.2.3)
- `@vitejs/plugin-react` (v5.1.1)
- `globals` (v16.5.0)
- `postcode` (v5.1.0)

## Backend

### Core Framework & Language
- **Python** (v3.11) - Programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **Uvicorn** - ASGI server for running FastAPI

### AI & Machine Learning
- **Google Cloud AI Platform** (`google-cloud-aiplatform`)
  - Vertex AI integration
  - Gemini 1.5 Pro (for BRD, gap analysis, data model generation)
  - Gemini 1.5 Flash (for compliance analysis)

### Database & Storage
- **Google Cloud Firestore** (`google-cloud-firestore`)
  - NoSQL document database
  - User profiles and settings storage
  - Project and artifact persistence

### Data Validation & Serialization
- **Pydantic** - Data validation using Python type annotations
  - Request/response models
  - Schema validation for AI agent outputs

### Authentication & Security
- **Google OAuth2** (`google.oauth2.id_token`)
  - Firebase ID token verification
  - User authentication middleware

### Utilities
- **python-dotenv** - Environment variable management
- **requests** - HTTP library (for additional API calls if needed)

### Containerization
- **Docker** - Containerization
  - Base image: `python:3.11-slim`
  - Multi-stage build optimization

## Infrastructure & Deployment

### Cloud Platform
- **Google Cloud Platform (GCP)**
  - Project: `brdsys`
  - Region: `us-central1`

### Backend Hosting
- **Google Cloud Run** - Serverless container platform
  - Auto-scaling FastAPI backend
  - Managed container orchestration
  - Artifact Registry for Docker images

### Frontend Hosting
- **Vercel** - Frontend deployment platform
  - Static site hosting
  - Edge network distribution
  - Environment variable management

### Database Hosting
- **Cloud Firestore (Native Mode)**
  - Serverless NoSQL database
  - Automatic scaling
  - Real-time synchronization

### Authentication Service
- **Firebase Authentication**
  - Google Sign-In provider
  - ID token generation and verification
  - User session management

## Development Tools & Workflow

### Version Control
- **Git** - Source code version control

### Package Management
- **npm** - Node.js package manager (frontend)
- **pip** - Python package manager (backend)

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **TypeScript** - Static type checking

### Build Tools
- **Vite** - Frontend build tool
- **TypeScript Compiler** - Type checking and compilation
- **Docker** - Container builds

## APIs & External Services

### Google Cloud Services
- **Vertex AI API** - AI model access
- **Firestore API** - Database operations
- **Cloud Run API** - Deployment and management
- **Cloud Build API** - Container builds
- **Artifact Registry API** - Docker image storage

### Authentication
- **Google OAuth 2.0** - User authentication
- **Firebase Auth REST API** - Authentication operations

## Architecture Patterns

### Frontend Architecture
- **Component-based architecture** (React)
- **Context API** - Global state (Auth context)
- **Custom Hooks** - Reusable logic (`useAuth`)
- **Axios Interceptors** - Request/response middleware

### Backend Architecture
- **RESTful API** (FastAPI)
- **Dependency Injection** (FastAPI Depends)
- **Multi-agent orchestration** - Sequential AI agent pipeline
- **Schema validation** - Pydantic models for type safety

### Data Flow
- **Client → Firebase Auth → Backend API → Vertex AI → Firestore → Client**
- **Token-based authentication** (Bearer tokens)
- **CORS** - Cross-origin resource sharing

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API endpoint
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### Backend (.env)
- `PROJECT_ID` - GCP project ID (`brdsys`)
- `LOCATION` - GCP region (`us-central1`)
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account key path (optional, uses ADC in production)

## Key Features & Integrations

### AI Agents
- **BRD Agent** - Business requirements document generation
- **Gap Analysis Agent** - Requirement gap detection
- **Data Model Agent** - Database schema generation
- **Compliance Agent** - Security and compliance analysis

### Data Models
- **BRD Schema** - Structured business requirements
- **Gap Schema** - Missing requirements and risks
- **Data Model Schema** - Entity and field definitions
- **Compliance Schema** - PII, encryption, retention policies

### User Features
- **Google Sign-In** - OAuth authentication
- **Project Management** - Create, list, view projects
- **Artifact Generation** - AI-powered BRD creation
- **User Settings** - Profile and preferences
- **Search & Filter** - Project discovery

## Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Operating System
- **Development**: Windows 10/11, macOS, Linux
- **Production**: Linux (Cloud Run containers)

---

*Last updated: February 2026*

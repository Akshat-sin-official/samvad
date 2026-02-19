## Core Product Features

- **Input – Raw Idea Ingestion**
  - Free-form text box to paste or type any product / business idea.
  - Guest mode and login flow (mocked) for differentiating saved vs unsaved work.

- **One-Click Artifact Generation**
  - Single **“Generate Artifacts”** action that orchestrates multiple agents in sequence.
  - Demo mode with preloaded example so stakeholders can see the full experience without API setup.

- **Structured BRD Generation**
  - Converts raw description into a structured Business Requirements Document:
    - Problem statement
    - Business objectives
    - In-scope vs out-of-scope items
    - User roles
    - Functional requirements
    - Non-functional requirements
    - Data requirements
    - KPIs, assumptions, risks
  - Rich BRD visualisation (`BRD` tab) with:
    - Executive summary card
    - Objectives list
    - Target audience chips
    - Scope in / scope out sections
    - Risks and assumptions blocks

- **Gap & Risk Analysis**
  - Dedicated **“Risks & Gaps”** tab powered by a gap-analysis agent.
  - Identifies:
    - Missing or under-specified requirements
    - Clarification questions to ask stakeholders
    - Risk flags (business, technical, operational)
  - UI presents gaps and risks as structured, readable cards.

- **Data Model / Data Dictionary Generation**
  - **“Data Model”** tab showing:
    - Entities (tables / core objects)
    - Fields (name, type, description, sensitivity)
  - Normalised view designed to be directly usable by engineers and data teams.

- **Compliance & Data Sensitivity Insights**
  - **“Compliance”** tab summarising:
    - PII fields
    - Financial and other sensitive fields
    - Encryption recommendations (at rest / in transit)
    - Retention policy suggestions
    - Access control recommendations
  - Designed for quick review by security / compliance stakeholders.

- **Architecture (Optional, When Available)**
  - **“Architecture”** tab that displays:
    - A Mermaid-based system diagram (when provided by backend or demo data).
    - High-level microservices / components and cloud resources.
  - UI gracefully hides this tab if no architecture is present (live API).

- **Transparency & AI Trace (When Metadata Available)**
  - Bottom **transparency footer** that can show:
    - Primary model used
    - Confidence score
    - Token usage
    - Latency
  - Only visible when metadata is present (e.g. demo data).

## Navigation & Workspace Features

- **Dashboard (Projects View)**
  - Sidebar “Dashboard” entry that routes to a **Projects** screen.
  - Projects screen lists sample projects with:
    - Names, short descriptions
    - Last updated timestamps
    - Owner and status indicators
  - Designed explanation line for PPT: “Manage and organize your architecture specifications.”

- **Dashboard BRD Library (Sidebar)**
  - Dashboard sidebar dropdown listing known BRDs (library).
  - Each entry shows:
    - BRD name
    - Last updated time
  - Click to open a **BRD detail view** with:
    - Title, description, updated info
    - Placeholder section describing that full content comes from backend or storage.

- **Search BRDs (Glassmorphism Popup)**
  - Command-style search overlay (glassmorphism):
    - Backdrop blur and centered card.
    - Search input with instant filtering over the BRD library (by name/description).
  - Results list with:
    - BRD title
    - Updated time
    - Optional description line
  - Selecting a result focuses the chosen BRD in the detail view.

- **New Project / New Spec Flow**
  - Main split-screen generator:
    - Left: “Project Context” panel with **Problem Statement** input.
    - Right: artifacts canvas with tabs for Architecture / BRD / Data Model / Risks & Gaps / Compliance.
  - Loading state: “Orchestrating Agents” visual with spinner and copy.
  - Empty state: “Waiting for Input” message when no result yet.

## User Experience & UI Features

- **Modern, Enterprise-Grade UI**
  - Dark sidebar with clear, high-contrast nav.
  - Light main canvas with card-based layout and subtle shadows.
  - Consistent use of icons and typography for a “tool, not toy” look.

- **Guest Mode Banner**
  - Top warning banner when not logged in: explains that work is not saved.
  - CTA to open login modal.

- **Login Modal (Mocked)**
  - Centered, branded login popup:
    - Samvad.ai logo and tagline
    - Primary “Log In” and secondary “Sign Up”
    - “Continue as Guest” option
  - Compliance cues: SOC2 / Enterprise badges.

- **Settings Screen**
  - Left-side mini-nav with sections:
    - Profile
    - Security
    - Notifications
    - Billing
    - Appearance
  - Right-side content with:
    - Profile form (avatar, display name, email, bio)
    - Security section (password change, 2FA CTA)
    - Notification toggles (BRD complete, team invites, weekly digest)
    - Billing section (plan, payment method placeholder)
    - Appearance section (theme choice Light / Dark / System)

## Backend & Intelligence Features (For PPT Notes)

- **Deterministic Multi-Agent Pipeline (FastAPI Backend)**
  - Orchestrator coordinates 4 specialized agents:
    - BRD Agent
    - Gap Detection Agent
    - Data Model Agent
    - Compliance Agent
  - Each step feeds into the next for structured, layered output.

- **Strict JSON Schemas via Pydantic**
  - Each agent’s output is validated against a schema:
    - `BRDSchema`, `GapSchema`, `DataModelSchema`, `ComplianceSchema`.
  - Helper logic extracts JSON from LLM responses and retries on validation failures.

- **Vertex AI / Gemini Integration (Configurable)**
  - Uses Vertex AI SDK with:
    - Gemini 1.5 Pro (requirements, gaps, data model).
    - Gemini 1.5 Flash (compliance).
  - Project and location configured via `PROJECT_ID` and `LOCATION` in backend config.

## Demo / Hackathon-Ready Characteristics

- **Demo Data Path**
  - Frontend can run entirely on demo data without a working backend or credentials.
  - Perfect for PPT demos and offline product walkthroughs.

- **Real API Path (When Configured)**
  - Same UI works with live Vertex AI backend once:
    - Credentials are configured (ADC or service account).
    - Vertex AI API is enabled for the GCP project.


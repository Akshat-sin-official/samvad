# Agent Pipeline Documentation

This document explains the logic, inputs, outputs, and AI model behind each tab in the Samvad.ai artifact viewer.

---

## How It Works (Overview)

The system orchestrates a **linear + parallel** pipeline of five specialized AI agents, each powered by **Gemini 2.0 Flash** via Google Vertex AI. The pipeline structure is:

```
[Step 1] BRD Agent              ← runs first (all others depend on it)
               │
       ┌───────┼───────┐
[Step 2a]     [Step 2b]   [Step 2c]
Gap Agent  Data Model Agent  Architecture Agent  ← run in parallel
                 │
           [Step 3]
        Compliance Agent        ← runs last (depends on data model)
```

---

## Tab 1: Business Requirements Document (BRD)

**Agent File:** `backend/services/brd_agent.py`  
**Model:** `gemini-2.0-flash-001`  
**Input:** User's Guiding Directions text + uploaded raw communication data (emails, transcripts)

### What It Does
Acts as a **Senior Business Analyst**. When raw communication data is uploaded (Problem Statement 2 mode), it **filters out all noise** (small talk, lunch plans, unrelated chatter) and extracts only genuine project decisions and requirements. When no data is uploaded, it generates a BRD from the idea text alone.

### Output Fields
| Field | Description |
|---|---|
| `project_title` | A concise 4–5 word title for the project |
| `problem_statement` | The core business problem being solved |
| `business_objectives` | 4–6 measurable goals |
| `scope` | What is in scope vs. explicitly out of scope |
| `user_roles` | All actors/stakeholders interacting with the system |
| `functional_requirements` | 8–12 specific, concrete features |
| `non_functional_requirements` | Performance, security, and scalability needs |
| `data_requirements` | Data types, retention, processing needs |
| `kpis` | Key Performance Indicators to measure success |
| `assumptions` | Assumptions made during analysis |
| `risks` | Identified project and technical risks |

---

## Tab 2: Architecture Diagram

**Agent File:** `backend/services/architecture_agent.py`  
**Model:** `gemini-2.0-flash-001`  
**Input:** The complete BRD JSON output from Step 1

### What It Does
Acts as a **Principal Cloud Architect**. It reads the BRD and designs a production-grade system architecture blueprint tailored to the requirements. It also generates a **live Mermaid.js flowchart** showing how the components communicate with each other.

### Output Fields
| Field | Description |
|---|---|
| `components` | Microservices and services, each with a name, responsibility, and tech stack recommendation |
| `infrastructure` | Cloud resources needed (compute, DB, storage, networking, security), with justification |
| `mermaid_diagram` | A `flowchart LR` Mermaid.js string, rendered as a live interactive diagram in the UI |

---

## Tab 3: Data Model

**Agent File:** `backend/services/data_model_agent.py`  
**Model:** `gemini-2.0-flash-001`  
**Input:** The complete BRD JSON output from Step 1

### What It Does
Acts as a **Senior Database Architect**. It reads the BRD and designs a normalized data model — identifying all business entities, their fields, data types, and data sensitivity classifications. It intentionally hints at foreign-key relationships between entities to support ER diagram generation.

### Output Fields
| Field | Description |
|---|---|
| `entities` | A list of business entities (tables), each containing: |
| → `name` | Entity name (e.g., `User`, `Order`, `Product`) |
| → `fields` | List of fields with name, type, description |
| → sensitivity | `Public`, `Internal`, `Confidential`, or `Restricted` per field |

---

## Tab 4: Gap Analysis

**Agent File:** `backend/services/gap_agent.py`  
**Model:** `gemini-2.0-flash-001`  
**Input:** The complete BRD JSON output from Step 1

### What It Does
Acts as a **Critical Business Analyst**. It reads the BRD and performs a **second-opinion review**, acting as a skeptic asking: "What did we miss? What is unclear? What could go wrong?" It does not generate new requirements — it audits the existing ones.

### Output Fields
| Field | Description |
|---|---|
| `missing_requirements` | Requirements that are vital but absent from the BRD |
| `clarification_questions` | Ambiguous points that need stakeholder answers before development |
| `risks` | Technical, business, or operational risk flags |

---

## Tab 5: Compliance Audit

**Agent File:** `backend/services/compliance_agent.py`  
**Model:** `gemini-2.0-flash-lite-001` (fastest model — compliance rules are well-understood)  
**Input:** The **Data Model JSON** from Step 2b (NOT the BRD directly)

### What It Does
Acts as a **Global Security & Compliance Officer** with expertise in **GDPR, CCPA, and HIPAA**. It scans every field in the data model and flags sensitive data, recommends specific encryption protocols, data retention timelines, and access control strategies.

> **Important:** The Compliance Audit is driven by the *data model*, not the original idea. It looks at what data will actually be *stored in your database* and audits those specific fields.

### Output Fields
| Field | Description |
|---|---|
| `pii_fields` | All fields classified as Personally Identifiable Information (e.g., `email`, `full_name`, `ip_address`) |
| `financial_fields` | Sensitive financial data fields (e.g., `credit_card_number`, `bank_account`) |
| `recommended_encryption` | Specific protocols: AES-256 at rest, TLS 1.3 in transit, bcrypt for passwords, etc. |
| `retention_policy_suggestions` | Retention windows: e.g., "7 years for financial records per SOX", "30 days for access logs" |
| `access_control_recommendations` | Role-Based Access Control (RBAC) rules, MFA requirements, least-privilege policies |

---

## Pipeline Execution Summary

| Step | Agent | Model | Depends On | Runs |
|---|---|---|---|---|
| 1 | BRD Agent | `gemini-2.0-flash-001` | User Input | Sequential (first) |
| 2a | Gap Agent | `gemini-2.0-flash-001` | BRD | Parallel |
| 2b | Data Model Agent | `gemini-2.0-flash-001` | BRD | Parallel |
| 2c | Architecture Agent | `gemini-2.0-flash-001` | BRD | Parallel |
| 3 | Compliance Agent | `gemini-2.0-flash-lite-001` | Data Model | Sequential (last) |

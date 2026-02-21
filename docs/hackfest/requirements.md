# HackFest 2.0 — Dataset Recommendations for Problem Statements

**Event:** HackFest 2.0 | GDG Cloud New Delhi × Turgon  
**Date:** Feb 21–22, 2026  
**Prepared for:** Hackathon participants  

---

## Problem Statement 1: Data Dictionary Agent

**What participants need:** Rich, multi-table relational databases with foreign keys, constraints, diverse data types, and enough complexity for meaningful schema extraction, data quality analysis, and AI-generated business context.

### Primary Recommendation

**Brazilian E-Commerce Public Dataset by Olist**  
🔗 https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce  
📜 License: **CC BY-NC-SA 4.0** (Creative Commons — free for non-commercial/educational use)

**Why this dataset is ideal:**
- **9 interlinked CSV tables** (orders, customers, sellers, products, order_items, payments, reviews, geolocation, product_category_name_translation) — perfect for testing schema extraction with real foreign-key relationships.
- **100K+ orders** with diverse data types: timestamps, floats, categorical, text (review comments), geospatial (lat/lng) — gives participants rich material for data quality analysis (nulls, freshness, completeness).
- **Clear business context** — e-commerce domain is universally understandable, so AI-generated business summaries can be meaningfully evaluated.
- **Well-documented ER diagram** available — participants can validate their auto-generated dictionaries against ground truth.
- The mix of clean and messy data (some nulls, inconsistent categories) makes data quality metrics genuinely useful.

### Secondary Recommendation

**Bike Store Relational Database (SQL)**  
🔗 https://www.kaggle.com/datasets/dillonmyrick/bike-store-sample-database  
📜 License: **CC0 (Public Domain)**

**Why this is a strong alternative:**
- **9 tables** with clear schema separation: `sales.stores`, `sales.staffs`, `production.categories`, `production.brands`, `production.products`, `sales.customers`, `sales.orders`, `sales.order_items`, `production.stocks`.
- Pre-built **SQL schema with explicit primary keys, foreign keys, and constraints** — exactly what the Data Dictionary Agent needs to extract.
- Smaller and cleaner than Olist, making it useful as a **quick-test / demo database** while Olist serves as the primary complex dataset.
- CC0 license means zero restrictions.

### Tertiary Option

**Chinook Database** (classic sample DB)  
🔗 https://github.com/lerocha/chinook-database (GitHub)  
📜 License: **MIT**

**Why it's useful:**
- Available as SQLite, PostgreSQL, MySQL, SQL Server — participants can test multi-database connector support directly.
- 11 tables modeling a digital media store (artists, albums, tracks, invoices, customers, employees) with clear relationships.
- MIT license — fully permissive.

---

## Problem Statement 2: BRD (Business Requirements Document) Agent

**What participants need:** Realistic business communication data — emails, meeting transcripts, chat messages — that contain project requirements, decisions, stakeholder feedback, and timelines scattered across noisy conversations.

### Primary Recommendation

**The Enron Email Dataset**  
🔗 https://www.kaggle.com/datasets/wcukierski/enron-email-dataset  
📜 License: **Public Domain** (released by the Federal Energy Regulatory Commission as part of a public investigation; freely available)

**Why this dataset is ideal:**
- **~500,000 real emails** from ~150 Enron employees — authentic business communication with project discussions, decisions, meeting scheduling, and stakeholder interactions buried in everyday noise.
- Perfect for testing the **noise filtering** requirement: participants must extract project-relevant requirements from a sea of routine emails (lunch plans, FYIs, newsletters).
- Contains real organizational hierarchy signals (to/cc/bcc patterns) useful for **stakeholder analysis** in BRDs.
- Emails span multiple projects and time periods, so the agent can be tested on extracting requirements for a specific topic or timeline.
- This is the gold standard for email NLP research — well understood, extensively used, zero licensing concerns.

### Secondary Recommendation

**AMI Meeting Corpus**  
🔗 https://huggingface.co/datasets/knkarthick/AMI (HuggingFace — transcripts + summaries)  
🔗 https://groups.inf.ed.ac.uk/ami/corpus/ (Full corpus)  
📜 License: **CC BY 4.0** (Creative Commons Attribution)

**Why this is a strong complement:**
- **279 meeting transcripts** with summaries — around two-thirds are from a **scenario-based design project** where participants play roles (project manager, industrial designer, interface designer, marketing) taking a product from kickoff to completion.
- The scenario meetings contain exactly what a BRD agent needs to extract: **requirements discussions, design decisions, stakeholder disagreements, feature prioritization, and timelines**.
- Pre-existing abstractive and extractive summaries serve as **ground truth** for evaluating whether the BRD agent correctly identified key decisions.
- CC BY 4.0 — fully open for any use with attribution.

### Tertiary Option

**Meeting Transcripts Dataset (Kaggle)**  
🔗 https://www.kaggle.com/datasets/abhishekunnam/meeting-transcripts  
📜 License: Check Kaggle page (community-uploaded)

**Why it's useful:**
- Simpler meeting transcript dataset for quick prototyping before testing on the larger AMI corpus.

### Usage Guidance for Participants
Combine Enron emails (as the "email channel") with AMI transcripts (as the "meeting transcript channel") to simulate the multi-channel ingestion the problem statement requires. Participants can also generate synthetic Slack messages from the Enron data to cover the chat channel requirement.

---

## Problem Statement 3: Data Policy Compliance Agent

**What participants need:** Two things: (a) policy documents (ideally PDFs) with enforceable business rules, and (b) a company database where some records violate those policies — enabling the agent to flag violations with explainable justifications.

### Primary Recommendation (Database)

**IBM Transactions for Anti-Money Laundering (AML)**  
🔗 https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml  
📜 License: **CDLA-Sharing-1.0** (Community Data License Agreement — permissive, allows sharing and use)

**Why this dataset is ideal:**
- **Synthetic financial transaction data** with explicit **laundering tags** — transactions are pre-labeled as compliant or violating, providing ground truth for the compliance agent.
- Entirely synthetic (generated via multi-agent simulation) — no privacy concerns, no PII issues.
- Multiple transaction types (bank transfers, credit card, checks, purchases) with amounts, timestamps, and account relationships — rich enough to define meaningful compliance policies against.
- Participants can write PDF policy documents like "Flag any single transaction exceeding $10,000" or "Flag accounts with >5 transfers to the same beneficiary within 24 hours" and validate their agent's detection accuracy.
- Published by IBM Research with an academic paper backing its realism.

### Secondary Recommendation (Database)

**Synthetic Financial Datasets for Fraud Detection (PaySim)**  
🔗 https://www.kaggle.com/datasets/ealaxi/paysim1  
📜 License: **CC BY-SA 4.0**

**Why this is a strong alternative:**
- **6.3 million synthetic transactions** based on real mobile money logs from an African country.
- Contains `isFraud` and `isFlaggedFraud` columns — pre-labeled violations.
- Transaction types include CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER with amounts and balances — easy to write compliance rules against (e.g., "flag transfers where origin balance drops below zero", "flag cash-outs exceeding the daily limit").
- CC BY-SA is permissive for hackathon use.

### Tertiary Recommendation (Database)

**Employee Policy Compliance Dataset**  
🔗 https://www.kaggle.com/datasets/laraibnadeem2023/employee-policy-compliance-dataset  
📜 License: Check Kaggle page

**Why it's useful:**
- Directly models HR/employee policy compliance — attendance violations, leave policy breaches, training completion status.
- Smaller and simpler — good for quick demos if participants want to show an HR compliance use case rather than financial.

### For Policy Documents (PDFs)

The problem statement requires ingesting **free-text PDF policy documents**. Since policies are domain-specific, participants should **create their own 2–3 page PDF policy documents** tailored to whichever database they choose. This is straightforward and actually more realistic. Here are ready-to-use public policy templates:

- **GDPR Violations Dataset** (for reference policy text): https://www.kaggle.com/datasets/jessemostipak/gdpr-violations — License: CC0. Contains real GDPR enforcement actions with article references and summaries of violations. Participants can use the referenced GDPR articles as their policy PDF source.
- **Actual GDPR Text**: https://gdpr-info.eu/ — The full regulation text is public law, freely usable. Participants can create PDFs from specific articles (e.g., Article 5 data minimization, Article 17 right to erasure) and test whether their agent can extract enforceable rules from legal language.
- **US Bank Secrecy Act / AML regulations**: Publicly available government documents that pair naturally with the IBM AML dataset.

---

## Summary Table

| Problem Statement | Primary Dataset | License | Tables/Size | Why It Fits |
|---|---|---|---|---|
| **PS1: Data Dictionary Agent** | Olist Brazilian E-Commerce | CC BY-NC-SA 4.0 | 9 tables, 100K+ orders | Rich relational schema with FK relationships, diverse data types, real data quality issues |
| **PS1 (alt)** | Bike Store SQL Database | CC0 Public Domain | 9 tables with explicit SQL schema | Pre-built PK/FK constraints, multi-database compatible |
| **PS2: BRD Agent** | Enron Email Dataset | Public Domain | 500K+ emails | Real business communication with project discussions buried in noise |
| **PS2 (complement)** | AMI Meeting Corpus | CC BY 4.0 | 279 meeting transcripts | Scenario-based design project meetings with requirements, decisions, summaries |
| **PS3: Policy Compliance** | IBM AML Transactions | CDLA-Sharing 1.0 | Millions of labeled transactions | Pre-labeled compliant/violating financial transactions, fully synthetic |
| **PS3 (alt)** | PaySim Financial Dataset | CC BY-SA 4.0 | 6.3M transactions | Fraud-labeled mobile money transactions with clear rule-checkable fields |

---

## License Quick Reference

All recommended datasets use permissive or public licenses suitable for hackathon use:

| License | Commercial Use | Attribution Required | Share-Alike |
|---|---|---|---|
| CC0 (Public Domain) | ✅ | ❌ | ❌ |
| Public Domain | ✅ | ❌ | ❌ |
| MIT | ✅ | ✅ | ❌ |
| CC BY 4.0 | ✅ | ✅ | ❌ |
| CC BY-SA 4.0 | ✅ | ✅ | ✅ |
| CC BY-NC-SA 4.0 | ❌ (non-commercial only) | ✅ | ✅ |
| CDLA-Sharing 1.0 | ✅ | ✅ | ✅ (for data) |

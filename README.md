# ARGUS: AI-Powered Claim Verification & Epistemic Reasoning System

[![Version](https://img.shields.io/badge/version-2.4--academic-blue.svg)]()
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Type](https://img.shields.io/badge/architecture-7--agent--multi--system-darkgreen.svg)]()

> **ARGUS** is an academic prototype for agentic claim verification. It decomposes natural-language assertions into atomic, falsifiable subclaims, retrieves peer-reviewed empirical evidence, evaluates source authority and causal directness, detects multi-source contradictions, and computes a transparent probabilistic verdict grounded in scientific falsification.

---

## 🏛️ System Architecture

```text
USER ENTERS CLAIM
       │
       ▼
[Claim Analyzer Agent] ───────► Decomposes into Atomic Subclaims, Extracts Entities & Predicates
       │
       ▼
[Research Planner Agent] ─────► Formulates Boolean Queries, Institutional & Domain Vectors
       │
       ▼
[Evidence Retriever Agent] ───► Hybrid BM25 Academic Corpus Search + Search Grounding
       │
       ▼
[Evidence Analyzer Agent] ────► Stance Classification, Causal Testing vs Correlation
       │
       ▼
[Contradiction Detector] ─────► Direct Falsification vs Temporal Drift vs Boundary Conditions
       │
       ▼
[Reasoning Agent] ────────────► Epistemic Synthesis under Uncertainty & Boundary Constraints
       │
       ▼
[Verdict Agent] ──────────────► Mathematical Confidence (6 Factors) + Provenance Report
```

---

## ✨ Core Principles & Safety Standards

1. **Epistemic Defensibility (No "Lie Detection"):** ARGUS never claims "this person is lying" or "this statement is objectively true." It uses Popperian falsification and Bayesian uncertainty: *"Supported by available evidence"*, *"Contradicted by clinical trials"*, *"Partially supported under specific boundary conditions"*.
2. **Transparent Mathematical Confidence:** Confidence is NOT an arbitrary hallucinated LLM integer. It is computed via a transparent, deterministic multi-factor formula evaluating Source Authority, Relevance, Diversity, Agreement, Directness, and Recency.
3. **No Fake Progress:** The frontend reflects real backend agent state transitions, live latency metrics, and audit logs.
4. **Direct Provenance Traceability:** Every subclaim and verdict conclusion is traceable to retrieved passages, DOIs, and institutional domains (.edu, .gov, PubMed, Nature).

---

## 🚀 Running the Prototype

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Academic Documentation Index

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Agent descriptions, data flows, telemetry, and failure recovery.
- [`METHODOLOGY.md`](./METHODOLOGY.md) - Mathematical confidence scoring formula, BM25 ranking, and stance classification.
- [`EVALUATION.md`](./EVALUATION.md) - Benchmark suite details, evaluation metrics, confusion matrix, and failure analysis.
- [`LIMITATIONS.md`](./LIMITATIONS.md) - Scope boundaries, epistemic constraints, and future work.

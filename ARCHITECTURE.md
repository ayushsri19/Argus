# ARGUS System Architecture

## 1. Overview
ARGUS is designed as a decoupled multi-agent cognitive architecture where specialized agents handle discrete phases of verification, combining deterministic symbolic NLP algorithms with generative models for reasoning synthesis.

---

## 2. Multi-Agent Roles

### Agent 1: Claim Analyzer Agent (`src/agents/claimAnalyzer.ts`)
- **Input:** Raw claim text.
- **Functions:**
  - Tokenization, entity isolation (`CHEMICAL`, `ORGANIZATION`, `QUANTITY`, `TEMPORAL`, `PHENOMENON`).
  - Taxonomic categorization: `SCIENTIFIC`, `MEDICAL`, `HISTORICAL`, `STATISTICAL`, `PREDICTIVE`, `ANECDOTAL`.
  - Atomic subclaim decomposition into independent, falsifiable propositions.
  - Identification of semantic ambiguities and causal predicates.
- **Output:** Structured `ClaimAnalysis` object.

### Agent 2: Research Planner Agent (`src/agents/researchPlanner.ts`)
- **Input:** `ClaimAnalysis`.
- **Functions:**
  - Translates subclaims into targeted queries with Boolean modifiers (`AND`, `OR`, `site:.edu`, `site:.gov`).
  - Formulates counter-factual searches to actively seek falsifying counter-evidence.
  - Categorizes queries into `EXACT_MATCH`, `SEMANTIC_EXPLORATION`, and `COUNTER_EVIDENCE`.
- **Output:** Array of `SearchQuery` instructions with priorities.

### Agent 3: Evidence Retriever Agent (`src/agents/evidenceRetriever.ts`)
- **Input:** Query specifications.
- **Functions:**
  - Hybrid retrieval: Queries authoritative local academic corpora indexed via Okapi BM25 and TF-IDF cosine similarity.
  - Searches live academic grounding via Google Search Grounding when API credentials exist.
  - Applies institutional source filters prioritizing peer-reviewed publications and government archives.
- **Output:** Candidate `EvidenceItem` passages.

### Agent 4: Evidence Analyzer Agent (`src/agents/evidenceAnalyzer.ts`)
- **Input:** Raw evidence candidates.
- **Functions:**
  - Rule-based and model-assisted stance classification: `SUPPORTS`, `CONTRADICTS`, `QUALIFIES`, `IRRELEVANT`.
  - Evaluates directness: distinguishes controlled causal experiments from observational correlations.
  - Computes source authority score (0–100) based on domain TLDs, journal indexing, and publisher prestige.
- **Output:** Enriched, scored `EvidenceItem` instances.

### Agent 5: Contradiction Detection Agent (`src/agents/contradictionDetector.ts`)
- **Input:** Evidence set and subclaims.
- **Functions:**
  - Distinguishes direct empirical conflict from:
    - Contextual qualifications (dosage, demographic sub-groups)
    - Temporal divergence (older preliminary work vs recent meta-analyses)
    - Methodological discrepancies (observational survey vs double-blind RCT).
- **Output:** Array of `ContradictionFinding` records.

### Agent 6: Epistemic Reasoning Agent (`src/agents/reasoningAgent.ts`)
- **Input:** Full evidence matrix and contradiction findings.
- **Functions:**
  - Formulates holistic synthesis adhering strictly to epistemic safety bounds.
  - Articulates explicit underlying assumptions, boundary conditions, and residual uncertainties.
- **Output:** Structured `ReasoningOutput`.

### Agent 7: Verdict Agent (`src/agents/verdictAgent.ts`)
- **Input:** Synthesis and evidence corpus.
- **Functions:**
  - Applies the 6-factor deterministic confidence scoring formula.
  - Synthesizes final verdict: `SUPPORTED`, `MOSTLY SUPPORTED`, `PARTIALLY SUPPORTED`, `MIXED / CONTESTED`, `MOSTLY CONTRADICTED`, `CONTRADICTED`, `INSUFFICIENT EVIDENCE`.
  - Generates comprehensive provenance report.
- **Output:** Complete `InvestigationResult`.

---

## 3. Data Flow & Telemetry

```text
Request (POST /api/investigate/stream)
   ├── Orchestrator boots investigation session
   ├── HistoryStore initializes audit trail
   ├── Stage events emitted via Server-Sent Events (SSE)
   ├── In-Memory EvidenceStore indexes passages
   └── Final InvestigationResult returned and cached
```

---

## 4. Failure Modes & Error Recovery

| Failure Scenario | Fallback Behavior |
| :--- | :--- |
| Gemini API unavailable or rate-limited | Automatic fallback to deterministic rule-based NLP (regex NER, BM25, heuristic stance engine) |
| Empty search results retrieved | Escalates to broader semantic queries; if still empty, yields `INSUFFICIENT EVIDENCE` |
| Opposing peer-reviewed sources | Detects cross-source contradiction, downgrades consensus score, yields `MIXED / CONTESTED` |
| Highly subjective or non-falsifiable claim | Flagged during semantic decomposition as `OPINION` or ambiguous assertion |

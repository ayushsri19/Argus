# ARGUS Scientific Methodology & Mathematical Foundations

## 1. Multi-Factor Mathematical Confidence Scoring

Confidence is computed using a weighted linear combination of six normalized empirical metrics ($S \in [0, 100]$):

$$\text{Confidence} = w_1 S_{\text{auth}} + w_2 S_{\text{rel}} + w_3 S_{\text{div}} + w_4 S_{\text{agr}} + w_5 S_{\text{dir}} + w_6 S_{\text{rec}}$$

### Weights Calibration
- **Source Authority ($w_1 = 0.25$):** Reflects empirical rigor, institutional validation, and peer-review status.
- **Empirical Relevance ($w_2 = 0.20$):** Measures lexical and semantic overlap between the claim and the retrieved passage.
- **Domain Diversity ($w_3 = 0.15$):** Normalized Shannon entropy across distinct publishers to prevent single-source bias:
  $$H(D) = -\sum_{i=1}^{K} p_i \log_2(p_i)$$
- **Cross-Source Agreement ($w_4 = 0.20$):** Consensus ratio among retrieved sources:
  $$S_{\text{agr}} = \frac{\max(N_{\text{support}}, N_{\text{contradict}})}{N_{\text{total}}}$$
- **Directness ($w_5 = 0.10$):** High score for double-blind, randomized controlled trials establishing causality; reduced score for observational correlations.
- **Recency ($w_6 = 0.10$):** Exponential temporal decay applied to publications older than 10 years to reflect evolving scientific consensus.

---

## 2. Information Retrieval & BM25 Scoring

Local authoritative passage retrieval uses Okapi BM25:

$$\text{BM25}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

Where:
- $k_1 = 1.2$ controls term frequency saturation.
- $b = 0.75$ controls document length normalization.
- $|D|$ is the passage token length, and $\text{avgdl}$ is the corpus average length.

---

## 3. Stance Classification Taxonomy

Passages are categorized into four epistemically disjoint stances:
1. **`SUPPORTS`**: Provides direct empirical data, statistical confirmation, or causal proof corroborating the proposition.
2. **`CONTRADICTS`**: Rebuts, refutes, or demonstrates non-replicability or opposite effect sizes.
3. **`QUALIFIES`**: Supports under restricted conditions (e.g. specific dosages, baseline health, or demographic cohorts) while refuting universal claims.
4. **`IRRELEVANT`**: Mentions topic keywords without evaluating the core causal relationship.

---

## 4. Epistemic Safety & Scientific Non-Dogmatism

ARGUS enforces strict epistemic guardrails:
- **No Moral Judgment:** Eliminates terms like "lying", "fake news", "fraud", or "truth".
- **Falsifiability Criteria:** Evaluates claims against empirical observations, recognizing that scientific conclusions remain subject to revision as new data emerges.
- **Explicit Nuance:** Prefers `PARTIALLY SUPPORTED` or `MIXED / CONTESTED` over binary true/false decisions when boundary conditions or conflicting trials exist.

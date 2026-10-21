# ARGUS Scope, Limitations & Epistemic Boundaries

## 1. System Scope Boundaries
ARGUS is designed specifically for **empirical, factual, and scientific claims**. It is not suited for:
- **Subjective Value Judgments:** "Beethoven's 9th Symphony is superior to Mozart's 40th."
- **Normative Moral Claims:** "Income tax is theft" or "Capitalism is good."
- **Speculative Future Predictions:** "Stock XYZ will double by 2030."
- **Unfalsifiable Metaphysical Assertions:** Questions beyond empirical observation.

---

## 2. Failure Cases & Edge Scenarios

1. **Pre-Consensus Emerging Science:** During early phases of novel phenomena (e.g. initial weeks of an emerging pathogen), published literature is scarce, conflicting, and preliminary. ARGUS will appropriately yield `INSUFFICIENT EVIDENCE`.
2. **Systemic Publication Bias:** Peer-reviewed journals disproportionately publish statistically significant positive results over null results (the "file drawer problem"), potentially inflating corroboration metrics.
3. **Correlational Over-Interpretation:** While the system flags observational studies, complex confounding variables in social science or nutritional epidemiology may occasionally introduce noise.

---

## 3. Ethical Considerations

- **Epistemic Humility:** ARGUS does not act as an infallible arbiter of truth. By displaying confidence intervals, contradictory viewpoints, and explicit assumptions, it invites critical examination by researchers.
- **Fairness & Source Neutrality:** Sources are assessed based on empirical methodology and institutional validation rather than ideological leaning.
- **Privacy:** Inquiries submitted to the system are not used to train external models.

---

## 4. Future Research Directions

- **Vector Database Integration:** Transitioning the lightweight local evidence store to an enterprise vector database (e.g. pgvector, Milvus) with dense neural embeddings.
- **Automated Causal Graph Extraction:** Constructing Directed Acyclic Graphs (DAGs) using Pearl's do-calculus to verify whether confounders were blocked in observational studies.
- **Cross-Lingual Verification:** Expanding multi-agent retrieval to multilingual academic literature in Chinese, Spanish, German, and French repositories.

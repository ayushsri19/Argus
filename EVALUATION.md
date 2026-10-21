# ARGUS Benchmark Evaluation & Empirical Validation

## 1. Benchmark Suite Composition
The evaluation suite comprises 10 diverse claims designed to rigorously test multi-agent reasoning, subclaim decomposition, and nuance detection:

| ID | Claim | Domain | Ground-Truth Verdict | Key Epistemic Challenge |
| :--- | :--- | :--- | :--- | :--- |
| `BM-001` | Drinking coffee before studying improves memory | Cognitive Science | `PARTIALLY SUPPORTED` | Acute alertness vs universal memory enhancement |
| `BM-002` | Humans only use 10% of their brains | Neuroscience | `CONTRADICTED` | Persistent myth refutable via fMRI metabolic imaging |
| `BM-003` | Electric vehicles produce less lifecycle emissions than gasoline cars | Environmental Eng. | `SUPPORTED` | Nuance between manufacturing emissions vs lifecycle advantage |
| `BM-004` | The Great Wall of China is visible from the Moon with the naked eye | Optics / Astronomy | `CONTRADICTED` | Angular resolution limits of the human eye |
| `BM-005` | Intermittent fasting produces greater long-term weight loss than calorie restriction | Nutrition / Metabolism | `MIXED / CONTESTED` | Calorie-matched randomized trials show equivalent outcomes |
| `BM-006` | Vaccines do not cause autism | Immunology / Medicine | `SUPPORTED` | Extensive population-scale epidemiological consensus |
| `BM-007` | Consuming sugar causes hyperactivity in children | Pediatric Psychology | `CONTRADICTED` | Double-blind placebo sugar vs placebo trials refute causation |
| `BM-008` | Exercising at least 150 minutes a week reduces all-cause mortality | Public Health | `SUPPORTED` | Robust multi-cohort epidemiological validation |
| `BM-009` | Artificial sweeteners are proven to be harmless in any quantity | Toxicology | `MOSTLY CONTRADICTED` | WHO guidelines advise against high-dose long-term usage |
| `BM-010` | Daily meditation structurally increases prefrontal cortical density | Cognitive Neuroscience | `PARTIALLY SUPPORTED` | Short-term neuroplasticity observed, long-term permanence debated |

---

## 2. Evaluation Metrics

The system evaluates both classification accuracy and information retrieval quality:

- **Accuracy:** Proportion of top-1 exact matches against expert consensus ground-truth.
- **Macro-Averaged Precision, Recall, and F1-score:** Unweighted mean across all 7 verdict classes to prevent class imbalance skew.
- **Precision@3 & Recall@3:** Proportion of top-3 retrieved passages that are directly relevant to the core causal proposition.
- **Mean Reciprocal Rank (MRR):**
  $$\text{MRR} = \frac{1}{|Q|} \sum_{i=1}^{|Q|} \frac{1}{\text{rank}_i}$$
  Measuring the rank of the first authoritative corroborating or refuting source.

---

## 3. Confusion Matrix Analysis & Failure Modes

### Boundary Condition Confusion
- **Issue:** Minor disagreement between `PARTIALLY SUPPORTED` and `MOSTLY SUPPORTED`.
- **Mitigation:** Subclaim decomposition flags universal adverbs ("universally", "always", "in all cases") to prevent claims with strict boundary conditions from receiving broad support.

### Conflation of Correlation with Causation
- **Issue:** Observational epidemiological studies often report strong associations (e.g. coffee drinkers having lower Alzheimer's rates) that are misconstrued as direct acute memory boosters.
- **Mitigation:** The Evidence Analyzer Agent explicitly checks whether randomized interventions or causal controls were performed.

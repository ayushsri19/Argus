/**
 * ARGUS Curated Sample Claims & Academic Benchmark Corpus
 * Covering scientific, causal, health, statistical, historical, technological, and common misconceptions.
 */

export interface SampleClaimItem {
  claim: string;
  category: string;
  difficulty: 'Elementary' | 'Intermediate' | 'Complex / Contested';
  expectedVerdictPreview: string;
  description: string;
}

export const SAMPLE_CLAIMS: SampleClaimItem[] = [
  {
    claim: "Drinking coffee before studying improves memory.",
    category: "Health & Cognitive Science (Causal)",
    difficulty: "Intermediate",
    expectedVerdictPreview: "PARTIALLY SUPPORTED",
    description: "Evaluates caffeine's acute alertness effects versus long-term memory consolidation in empirical trials."
  },
  {
    claim: "Is social media causing students to sleep less?",
    category: "Technology & Behavioral Science",
    difficulty: "Complex / Contested",
    expectedVerdictPreview: "MOSTLY SUPPORTED",
    description: "Evaluates blue light melatonin suppression, screen displacement, and correlation vs causal adolescent sleep studies."
  },
  {
    claim: "Global average surface temperatures have risen by more than 1.1°C since the pre-industrial era.",
    category: "Scientific & Climate Statistics",
    difficulty: "Elementary",
    expectedVerdictPreview: "SUPPORTED",
    description: "Cross-checks observational datasets from NASA GISTEMP, NOAA, and the IPCC Sixth Assessment Report."
  },
  {
    claim: "Humans only use 10 percent of their brains.",
    category: "Common Misconception & Neuroscience",
    difficulty: "Elementary",
    expectedVerdictPreview: "CONTRADICTED",
    description: "Investigates fMRI, PET imaging evidence, and evolutionary metabolic constraints refuting the 10% myth."
  },
  {
    claim: "Electric vehicles produce significantly less lifecycle greenhouse gas emissions than gasoline vehicles.",
    category: "Technology & Environmental Science (Comparative)",
    difficulty: "Intermediate",
    expectedVerdictPreview: "MOSTLY SUPPORTED",
    description: "Examines cradle-to-grave lifecycle emissions (battery manufacturing, electricity grid mix, tailpipe zero-emissions)."
  },
  {
    claim: "The Great Wall of China is clearly visible to the naked human eye from low Earth orbit.",
    category: "Historical & Physical Geography",
    difficulty: "Elementary",
    expectedVerdictPreview: "CONTRADICTED",
    description: "NASA astronaut observations, optical resolution limits, and materials contrast refuting naked-eye visibility."
  },
  {
    claim: "Intermittent fasting produces superior long-term weight loss compared to daily caloric restriction of equal magnitude.",
    category: "Health & Nutritional Science (Comparative)",
    difficulty: "Complex / Contested",
    expectedVerdictPreview: "MIXED / CONTESTED",
    description: "Synthesizes randomized controlled trials (NEJM, JAMA) showing equivalent isocaloric weight loss outcomes."
  },
  {
    claim: "Artificial intelligence models exhibit emergent reasoning abilities beyond next-token statistical pattern matching.",
    category: "Computer Science & AI Theory",
    difficulty: "Complex / Contested",
    expectedVerdictPreview: "MIXED / CONTESTED",
    description: "Investigates benchmark debates (Schaeffer et al. non-linear metric artifact vs intrinsic multi-step generalization)."
  },
  {
    claim: "Napoleon Bonaparte was exceptionally short compared to average French military men of his era.",
    category: "Historical Misconception",
    difficulty: "Intermediate",
    expectedVerdictPreview: "CONTRADICTED",
    description: "Resolves the French pouce (2.71 cm) versus British inch measurement discrepancy and contemporary military standards."
  },
  {
    claim: "Regular aerobic exercise reduces the risk of developing neurodegenerative dementia in older adults.",
    category: "Medical & Preventive Health",
    difficulty: "Intermediate",
    expectedVerdictPreview: "MOSTLY SUPPORTED",
    description: "Reviews prospective cohort data, BDNF neurotrophic factor elevation, and cerebrovascular perfusion benefits."
  },
  {
    claim: "Quantum computers have broken standard RSA-2048 encryption in real-world commercial communications.",
    category: "Technology & Cybersecurity (Factual)",
    difficulty: "Elementary",
    expectedVerdictPreview: "CONTRADICTED",
    description: "Checks physical qubit counts, fault tolerance thresholds, Shor's algorithm requirements vs current NISQ hardware."
  },
  {
    claim: "Consuming moderate amounts of dark chocolate directly lowers systolic blood pressure due to flavanols.",
    category: "Nutritional Science (Causal)",
    difficulty: "Intermediate",
    expectedVerdictPreview: "PARTIALLY SUPPORTED",
    description: "Separates short-term endothelial nitric oxide vasodilation from long-term clinical cardiovascular endpoints."
  }
];

/**
 * ARGUS Benchmark Evaluation Dataset
 * Standardized academic test suite with ground-truth labels and evaluation metrics.
 */

import { BenchmarkClaim } from '../types';

export const BENCHMARK_DATASET: BenchmarkClaim[] = [
  {
    id: "BM-001",
    claim: "Drinking coffee before studying improves memory.",
    domain: "causal",
    groundTruthVerdict: "PARTIALLY SUPPORTED",
    groundTruthSubclaims: [
      "Coffee contains caffeine which crosses the blood-brain barrier.",
      "Caffeine enhances central nervous system arousal and vigilance.",
      "Caffeine selectively facilitates memory consolidation under specific dosage timings.",
      "Coffee universally improves memory retention across all study tasks."
    ],
    rationale: "Evidence confirms vigilance and acute attention boosts, and selective consolidation effects, but refutes universal memory enhancement.",
    keySources: ["Nature Neuroscience (2014) Borota et al.", "Cochrane Systematic Review on Caffeine", "PubMed PMID: 24413699"]
  },
  {
    id: "BM-002",
    claim: "Is social media causing students to sleep less?",
    domain: "causal",
    groundTruthVerdict: "MOSTLY SUPPORTED",
    groundTruthSubclaims: [
      "Adolescents and university students who use social media report later sleep onset.",
      "Blue spectrum screen exposure suppresses nocturnal melatonin secretion.",
      "Psychological hyperarousal and bedtime displacement directly reduce sleep duration.",
      "Social media is the sole causal driver of student sleep deprivation."
    ],
    rationale: "Extensive longitudinal and experimental data establish screen displacement and circadian melatonin disruption, while recognizing multifactorial sleep debt (academic workload, stress).",
    keySources: ["JAMA Pediatrics (2016) Carter et al.", "Sleep Medicine Reviews", "NIH PubMed Central"]
  },
  {
    id: "BM-003",
    claim: "Humans only use 10 percent of their brains.",
    domain: "scientific",
    groundTruthVerdict: "CONTRADICTED",
    groundTruthSubclaims: [
      "Neuroimaging reveals functional activation across virtually all brain regions throughout a 24-hour cycle.",
      "Brain tissue consumes ~20% of total metabolic energy despite accounting for 2% of body mass.",
      "Evolutionary biology and clinical neurology show localized brain damage impairs specific faculties."
    ],
    rationale: "All modern neuroscience, PET, and fMRI imaging definitively refute the 10% brain myth.",
    keySources: ["Scientific American (Neuroscience)", "Society for Neuroscience", "Brain Facts (SfN)"]
  },
  {
    id: "BM-004",
    claim: "Global average surface temperatures have risen by more than 1.1°C since the pre-industrial era.",
    domain: "statistical",
    groundTruthVerdict: "SUPPORTED",
    groundTruthSubclaims: [
      "Pre-industrial reference baseline is established as 1850–1900.",
      "Instrumental surface temperature anomalies measured by NASA GISTEMP exceed 1.1°C.",
      "IPCC Sixth Assessment Report confirms human-induced global surface warming of approximately 1.1°C."
    ],
    rationale: "Instrumental temperature records from NASA GISTEMP, NOAA, Copernicus, and IPCC AR6 unanimously confirm the figure.",
    keySources: ["IPCC AR6 WG1 Summary for Policymakers", "NASA GISTEMP Data", "Copernicus Climate Change Service"]
  },
  {
    id: "BM-005",
    claim: "Electric vehicles produce significantly less lifecycle greenhouse gas emissions than gasoline vehicles.",
    domain: "comparative",
    groundTruthVerdict: "MOSTLY SUPPORTED",
    groundTruthSubclaims: [
      "EV manufacturing and battery production generate higher initial emissions than internal combustion engine assembly.",
      "Operational lifecycle emissions of EVs are significantly lower across modern regional electricity grids.",
      "Over full lifetime mileage (>150,000 km), net lifecycle GHG emissions are 30% to 70% lower for battery electric vehicles."
    ],
    rationale: "Comprehensive lifecycle analyses (ICCT, Argonne GREET model) corroborate substantial net emissions reductions despite battery production overhead.",
    keySources: ["International Council on Clean Transportation (ICCT) 2021", "Nature Communications (2020) Knobloch et al.", "Argonne National Laboratory GREET Model"]
  },
  {
    id: "BM-006",
    claim: "The Great Wall of China is clearly visible to the naked human eye from low Earth orbit.",
    domain: "historical",
    groundTruthVerdict: "CONTRADICTED",
    groundTruthSubclaims: [
      "The Great Wall has an average width of only 5 to 9 meters.",
      "Low Earth orbit altitude is typically 200 to 400 kilometers.",
      "Human eye visual acuity threshold (~1 arcminute) cannot resolve a 6-meter structure made of natural stone blending into terrain without optical magnification."
    ],
    rationale: "Physical optics and direct astronaut testimonials (NASA, Chinese astronaut Yang Liwei) confirm invisibility to the unaided human eye.",
    keySources: ["NASA Earth Observatory", "European Space Agency", "American Optometric Association"]
  },
  {
    id: "BM-007",
    claim: "Intermittent fasting produces superior long-term weight loss compared to daily caloric restriction of equal magnitude.",
    domain: "health",
    groundTruthVerdict: "MIXED / CONTESTED",
    groundTruthSubclaims: [
      "Intermittent fasting restricts the eating window or daily caloric intake on specific days.",
      "Isocaloric comparisons show virtually identical body fat reduction and metabolic rates.",
      "Adherence rates and secondary cardiometabolic biomarkers show mixed findings across clinical trials."
    ],
    rationale: "Rigorous randomized controlled trials in NEJM and JAMA demonstrate that when net caloric deficit is matched, intermittent fasting yields equivalent, not superior, weight loss.",
    keySources: ["New England Journal of Medicine (2022) Liu et al.", "JAMA Internal Medicine (2020) Lowe et al.", "Cochrane Library Review"]
  },
  {
    id: "BM-008",
    claim: "Napoleon Bonaparte was exceptionally short compared to average French military men of his era.",
    domain: "historical",
    groundTruthVerdict: "CONTRADICTED",
    groundTruthSubclaims: [
      "Napoleon's autopsy measured his height at 5 pieds 2 pouces.",
      "Pre-metric French pouce was approximately 2.71 cm, converting to 1.68 to 1.70 meters (5 ft 7 in).",
      "Average height of 18th/early 19th-century French adult males was approximately 1.65 meters (5 ft 5 in)."
    ],
    rationale: "The myth stemmed from British wartime caricatures (James Gillray) and misunderstanding of the longer French inch system.",
    keySources: ["Historical Anthropometry Records", "Fondation Napoléon", "British Museum Archives"]
  },
  {
    id: "BM-009",
    claim: "Regular aerobic exercise reduces the risk of developing neurodegenerative dementia in older adults.",
    domain: "health",
    groundTruthVerdict: "MOSTLY SUPPORTED",
    groundTruthSubclaims: [
      "Aerobic exercise stimulates brain-derived neurotrophic factor (BDNF) expression.",
      "Physical activity enhances hippocampal volume and cerebrovascular perfusion.",
      "Prospective cohort studies establish a 20% to 30% relative risk reduction for cognitive decline."
    ],
    rationale: "Overwhelming epidemiological and mechanistic neurobiological evidence supports a protective effect against all-cause cognitive decline.",
    keySources: ["Lancet Commission on Dementia Prevention (2020)", "World Health Organization Guidelines", "Neurology (2018)"]
  },
  {
    id: "BM-010",
    claim: "Quantum computers have broken standard RSA-2048 encryption in real-world commercial communications.",
    domain: "technological",
    groundTruthVerdict: "CONTRADICTED",
    groundTruthSubclaims: [
      "Factoring RSA-2048 using Shor's algorithm requires millions of physical error-corrected qubits.",
      "Current state-of-the-art quantum processing units operate with hundreds to ~1,000 noisy physical qubits.",
      "No real-world RSA-2048 key has been factored by any operational quantum device to date."
    ],
    rationale: "Hardware limitations in the Noisy Intermediate-Scale Quantum (NISQ) era remain orders of magnitude away from fault-tolerant RSA cryptanalysis.",
    keySources: ["NIST Post-Quantum Cryptography Standardization", "IEEE Spectrum", "Physical Review Letters"]
  }
];

export type ClaimType = 
  | 'scientific'
  | 'causal'
  | 'statistical'
  | 'comparative'
  | 'historical'
  | 'health'
  | 'technological'
  | 'general_factual';

export type StanceType = 
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'QUALIFIES'
  | 'IRRELEVANT';

export type VerdictType = 
  | 'SUPPORTED'
  | 'MOSTLY SUPPORTED'
  | 'PARTIALLY SUPPORTED'
  | 'MIXED / CONTESTED'
  | 'MOSTLY CONTRADICTED'
  | 'CONTRADICTED'
  | 'INSUFFICIENT EVIDENCE';

export interface Entity {
  text: string;
  type: 'PERSON' | 'ORG' | 'GPE' | 'DATE' | 'QUANTITY' | 'CHEMICAL' | 'PHENOMENON' | 'CONCEPT';
  salience?: number;
}

export interface Subclaim {
  id: string;
  text: string;
  type: string;
  isControversial: boolean;
  verificationTarget: string;
}

export interface ClaimAnalysis {
  originalClaim: string;
  claimType: ClaimType;
  entities: Entity[];
  subclaims: Subclaim[];
  verificationQuestions: string[];
  ambiguities: string[];
  causalAssertions: {
    cause: string;
    effect: string;
    qualifier?: string;
  }[];
}

export interface SearchQuery {
  id: string;
  subclaimId: string;
  query: string;
  targetSourceType: 'peer_reviewed' | 'official_statistics' | 'authoritative_news' | 'institutional';
  priority: 'high' | 'medium' | 'low';
}

export interface SourceMetadata {
  id: string;
  title: string;
  url: string;
  publisher: string;
  domain: string;
  publicationDate?: string;
  retrievedAt: string;
  sourceType: 'academic_journal' | 'gov_dataset' | 'international_org' | 'news_wire' | 'expert_report' | 'web';
  authoritativenessScore: number; // 0-100
  isPeerReviewed: boolean;
  isPrimarySource: boolean;
}

export interface EvidenceItem {
  id: string;
  sourceId: string;
  source: SourceMetadata;
  relatedSubclaimId: string;
  subclaimText: string;
  excerpt: string;
  stance: StanceType;
  stanceConfidence: number; // 0-100
  semanticSimilarity: number; // 0-1.0
  authorityScore: number; // 0-100
  directnessScore: number; // 0-100 (direct study vs commentary)
  recencyScore: number; // 0-100
  isCausationEstablished: boolean; // causation vs merely correlation
  compositeWeight: number; // 0-100
  reasoning: string;
}

export interface ContradictionFinding {
  id: string;
  type: 'DIRECT_CONTRADICTION' | 'QUALIFICATION' | 'DIFFERENT_CONTEXT' | 'TEMPORAL_DISCREPANCY' | 'METHODOLOGICAL_DISAGREEMENT';
  description: string;
  itemA: {
    source: string;
    statement: string;
  };
  itemB: {
    source: string;
    statement: string;
  };
  severity: 'high' | 'medium' | 'low';
}

export interface FactorScore {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  description: string;
}

export interface ConfidenceMetrics {
  overallConfidence: number; // 0-100
  breakdown: FactorScore[];
  formula: string;
}

export interface InvestigationResult {
  id: string;
  timestamp: string;
  claim: string;
  analysis: ClaimAnalysis;
  searchQueries: SearchQuery[];
  sources: SourceMetadata[];
  evidence: EvidenceItem[];
  contradictions: ContradictionFinding[];
  reasoning: {
    synthesis: string;
    supportingArguments: string[];
    contradictingArguments: string[];
    qualifyingArguments: string[];
    assumptions: string[];
    uncertainties: string[];
  };
  verdict: VerdictType;
  confidence: ConfidenceMetrics;
  limitations: string[];
  epistemicSafetyNotice: string;
  executionMetrics: {
    totalDurationMs: number;
    agentDurationsMs: Record<string, number>;
    sourcesRetrieved: number;
    evidenceCount: number;
  };
}

export interface PipelineStageEvent {
  stage: 
    | 'IDLE'
    | 'ANALYZING_CLAIM'
    | 'DECOMPOSING_CLAIM'
    | 'PLANNING_RESEARCH'
    | 'SEARCHING_EVIDENCE'
    | 'EVALUATING_SOURCES'
    | 'CHECKING_CONTRADICTIONS'
    | 'REASONING'
    | 'GENERATING_VERDICT'
    | 'COMPLETE'
    | 'ERROR';
  message: string;
  progressPercent: number;
  agentName: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface BenchmarkClaim {
  id: string;
  claim: string;
  domain: ClaimType;
  groundTruthVerdict: VerdictType;
  groundTruthSubclaims: string[];
  rationale: string;
  keySources: string[];
}

export interface BenchmarkEvaluationResult {
  totalClaims: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  confusionMatrix: {
    labels: VerdictType[];
    matrix: number[][]; // [actual][predicted]
  };
  retrievalMetrics: {
    meanPrecisionAt3: number;
    meanRecallAt3: number;
    mrr: number; // Mean Reciprocal Rank
  };
  claimResults: {
    claimId: string;
    claim: string;
    predictedVerdict: VerdictType;
    actualVerdict: VerdictType;
    isCorrect: boolean;
    confidence: number;
    durationMs: number;
  }[];
}

/**
 * ARGUS Verdict Agent
 * Integrates all agent outputs into a finalized, verifiable investigation report.
 * Binds the verdict to transparent mathematical confidence metrics and epistemic safety constraints.
 */

import { ClaimAnalysis, EvidenceItem, ContradictionFinding, InvestigationResult, VerdictType } from '../types';
import { ReasoningOutput } from './reasoningAgent';
import { calculateConfidence } from '../nlp/scoring';

export function compileVerdict(
  analysis: ClaimAnalysis,
  evidence: EvidenceItem[],
  contradictions: ContradictionFinding[],
  reasoning: ReasoningOutput,
  executionMetrics: InvestigationResult['executionMetrics'],
  queries: any[],
  sources: any[]
): InvestigationResult {
  // Compute transparent mathematical confidence
  const confidenceMetrics = calculateConfidence(evidence);

  // Validate or adjust verdict according to empirical balance
  const supporting = evidence.filter(e => e.stance === 'SUPPORTS');
  const contradicting = evidence.filter(e => e.stance === 'CONTRADICTS');
  const qualifying = evidence.filter(e => e.stance === 'QUALIFIES');

  let finalVerdict: VerdictType = reasoning.suggestedVerdict;

  // Safeguard: If no evidence exists, verdict MUST be INSUFFICIENT EVIDENCE
  if (evidence.length === 0) {
    finalVerdict = 'INSUFFICIENT EVIDENCE';
  } else if (contradicting.length > supporting.length && supporting.length === 0) {
    finalVerdict = 'CONTRADICTED';
  } else if (supporting.length > 0 && contradicting.length === 0 && qualifying.length === 0) {
    finalVerdict = 'SUPPORTED';
  }

  // Derive explicit methodological limitations
  const limitations: string[] = [
    "Evidence sample size & demographic constraints: Studies may not generalize across all age brackets or clinical populations.",
    "Observational vs Causal distinction: Certain cited correlations may be subject to residual unmeasured confounding.",
    "Publication recency & paradigm shift: Scientific consensus continues to evolve as higher-powered multi-center trials are conducted."
  ];

  if (contradictions.length > 0) {
    limitations.push(`Cross-study conflict: Identified ${contradictions.length} methodological or temporal discrepancy between peer-reviewed sources.`);
  }

  const epistemicNotice = 
    "EPISTEMIC SAFETY MANDATE: ARGUS provides probabilistic, evidence-grounded verification based strictly on retrieved peer-reviewed literature and authoritative datasets. " +
    "This verdict reflects empirical alignment rather than dogmatic or absolute truth, and does not evaluate personal character or moral intent.";

  return {
    id: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    claim: analysis.originalClaim,
    analysis,
    searchQueries: queries,
    sources,
    evidence,
    contradictions,
    reasoning: {
      synthesis: reasoning.synthesis,
      supportingArguments: reasoning.supportingArguments,
      contradictingArguments: reasoning.contradictingArguments,
      qualifyingArguments: reasoning.qualifyingArguments,
      assumptions: reasoning.assumptions,
      uncertainties: reasoning.uncertainties
    },
    verdict: finalVerdict,
    confidence: confidenceMetrics,
    limitations,
    epistemicSafetyNotice: epistemicNotice,
    executionMetrics
  };
}

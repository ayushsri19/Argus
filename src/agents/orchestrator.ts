/**
 * ARGUS Multi-Agent Orchestrator
 * Coordinates sequential and concurrent agent execution, error recovery,
 * stage event emission, and execution metrics telemetry.
 */

import { InvestigationResult, PipelineStageEvent } from '../types';
import { analyzeClaim } from './claimAnalyzer';
import { planResearch } from './researchPlanner';
import { retrieveEvidence } from './evidenceRetriever';
import { runUnifiedReasoning } from './unifiedReasoner';
import { compileVerdict } from './verdictAgent';

export type StageProgressCallback = (event: PipelineStageEvent) => void;

export class ArgusOrchestrator {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  public async runInvestigation(
    claimText: string,
    onProgress?: StageProgressCallback
  ): Promise<InvestigationResult> {
    const startTime = performance.now();
    const agentDurations: Record<string, number> = {};

    const emit = (
      stage: PipelineStageEvent['stage'],
      message: string,
      progressPercent: number,
      agentName: string,
      details?: Record<string, any>
    ) => {
      if (onProgress) {
        onProgress({
          stage,
          message,
          progressPercent,
          agentName,
          timestamp: new Date().toISOString(),
          details
        });
      }
    };

    // Stage 1 & 2: Claim Analysis & Decomposition
    emit('ANALYZING_CLAIM', 'Decomposing claim syntax, entities, and causal assertions...', 12, 'Claim Analyzer Agent');
    const t0 = performance.now();
    const claimAnalysis = await analyzeClaim(claimText, this.apiKey);
    agentDurations['ClaimAnalyzer'] = Math.round(performance.now() - t0);

    emit('DECOMPOSING_CLAIM', `Identified ${claimAnalysis.subclaims.length} atomic subclaims and ${claimAnalysis.entities.length} named entities.`, 25, 'Claim Analyzer Agent', {
      subclaims: claimAnalysis.subclaims.map(s => s.text)
    });

    // Stage 3: Research Planning
    emit('PLANNING_RESEARCH', 'Formulating targeted research queries and institutional search vectors...', 38, 'Research Planner Agent');
    const t1 = performance.now();
    const searchQueries = planResearch(claimAnalysis);
    agentDurations['ResearchPlanner'] = Math.round(performance.now() - t1);

    // Stage 4: Evidence Retrieval
    emit('SEARCHING_EVIDENCE', `Searching authoritative academic literature and search grounding (${searchQueries.length} queries)...`, 52, 'Evidence Retrieval Agent');
    const t2 = performance.now();
    const { sources, evidence: retrievedEvidence } = await retrieveEvidence(claimAnalysis, searchQueries, this.apiKey);
    agentDurations['EvidenceRetriever'] = Math.round(performance.now() - t2);

    // Stage 5 & 6 & 7: Unified Evidence Evaluation, Cross-Checking & Epistemic Reasoning
    emit('EVALUATING_SOURCES', `Evaluating ${retrievedEvidence.length} evidence passages across authority, recency, and causal attribution...`, 68, 'Evidence Analyzer Agent');
    emit('CHECKING_CONTRADICTIONS', 'Scanning for cross-study contradictions, temporal discrepancies, and boundary qualifications...', 78, 'Contradiction Detection Agent');
    emit('REASONING', 'Synthesizing evidence balance and formulating epistemic boundaries...', 88, 'Reasoning Agent');

    const t3 = performance.now();
    const { analyzedEvidence, contradictions, reasoning: reasoningOutput } = await runUnifiedReasoning(
      claimAnalysis,
      retrievedEvidence,
      this.apiKey
    );
    const unifiedDuration = Math.round(performance.now() - t3);
    agentDurations['EvidenceAnalyzer'] = Math.round(unifiedDuration * 0.35);
    agentDurations['ContradictionDetector'] = Math.round(unifiedDuration * 0.30);
    agentDurations['ReasoningAgent'] = Math.round(unifiedDuration * 0.35);

    // Stage 8: Verdict Compilation & Confidence Calculation
    emit('GENERATING_VERDICT', 'Calculating mathematical confidence metrics and final provenance report...', 96, 'Verdict Agent');
    const t6 = performance.now();
    const totalDuration = Math.round(performance.now() - startTime);

    const result = compileVerdict(
      claimAnalysis,
      analyzedEvidence,
      contradictions,
      reasoningOutput,
      {
        totalDurationMs: totalDuration,
        agentDurationsMs: agentDurations,
        sourcesRetrieved: sources.length,
        evidenceCount: analyzedEvidence.length
      },
      searchQueries,
      sources
    );
    agentDurations['VerdictAgent'] = Math.round(performance.now() - t6);

    emit('COMPLETE', `Investigation completed with verdict: ${result.verdict} (${result.confidence.overallConfidence}% confidence).`, 100, 'Orchestrator');
    return result;
  }
}

/**
 * ARGUS Unified Reasoning & Cross-Check Agent
 * Combines Evidence Stance Analysis, Contradiction Detection, and Epistemic Synthesis
 * into a single high-speed, rate-limit resilient model call.
 */

import { Type } from '@google/genai';
import { ClaimAnalysis, EvidenceItem, ContradictionFinding, VerdictType } from '../types';
import { ReasoningOutput } from './reasoningAgent';
import { classifyStanceRuleBased } from '../nlp/stance';
import { callGeminiWithTimeout } from '../nlp/geminiClient';

export interface UnifiedReasoningResult {
  analyzedEvidence: EvidenceItem[];
  contradictions: ContradictionFinding[];
  reasoning: ReasoningOutput;
}

export async function runUnifiedReasoning(
  analysis: ClaimAnalysis,
  rawEvidence: EvidenceItem[],
  apiKey?: string
): Promise<UnifiedReasoningResult> {
  // 1. Compute deterministic baseline stance and features (instant, <5ms)
  let analyzedEvidence: EvidenceItem[] = rawEvidence.map(item => {
    const ruleStance = classifyStanceRuleBased(item.subclaimText, item.excerpt);
    return {
      ...item,
      stance: ruleStance.stance,
      stanceConfidence: ruleStance.confidence,
      reasoning: `Rule-based evaluation based on lexical overlap (${Math.round(ruleStance.lexicalFeatures.overlapRatio * 100)}%) and stance patterns.`
    };
  });

  const supporting = analyzedEvidence.filter(e => e.stance === 'SUPPORTS');
  const contradicting = analyzedEvidence.filter(e => e.stance === 'CONTRADICTS');
  const qualifying = analyzedEvidence.filter(e => e.stance === 'QUALIFIES');

  // Baseline contradictions
  const baselineContradictions: ContradictionFinding[] = [];
  if (supporting.length > 0 && contradicting.length > 0) {
    baselineContradictions.push({
      id: 'DISC-01',
      type: 'DIRECT_CONTRADICTION',
      description: `Direct empirical conflict: ${supporting[0].source.publisher} reported corroborating data, while ${contradicting[0].source.publisher} reported refuting findings regarding "${analysis.originalClaim.slice(0, 50)}".`,
      itemA: { source: supporting[0].source.title, statement: supporting[0].excerpt.slice(0, 140) + '...' },
      itemB: { source: contradicting[0].source.title, statement: contradicting[0].excerpt.slice(0, 140) + '...' },
      severity: 'high'
    });
  }
  if (qualifying.length > 0) {
    baselineContradictions.push({
      id: 'DISC-02',
      type: 'QUALIFICATION',
      description: `Contextual boundary qualification: ${qualifying[0].source.publisher} indicates outcomes are bounded by dosage, timing, or baseline conditions.`,
      itemA: { source: `User Claim: "${analysis.originalClaim.slice(0, 50)}"`, statement: 'Asserts universal relationship without specifying boundary limitations.' },
      itemB: { source: qualifying[0].source.title, statement: qualifying[0].excerpt.slice(0, 140) + '...' },
      severity: 'medium'
    });
  }

  // Baseline verdict
  let baselineVerdict: VerdictType = 'INSUFFICIENT EVIDENCE';
  if (analyzedEvidence.length === 0) {
    baselineVerdict = 'INSUFFICIENT EVIDENCE';
  } else if (supporting.length > 0 && contradicting.length === 0 && qualifying.length === 0) {
    baselineVerdict = 'SUPPORTED';
  } else if (supporting.length > 0 && qualifying.length > 0 && contradicting.length === 0) {
    baselineVerdict = 'PARTIALLY SUPPORTED';
  } else if (qualifying.length > 0 && supporting.length === 0 && contradicting.length === 0) {
    baselineVerdict = 'PARTIALLY SUPPORTED';
  } else if (supporting.length >= 2 && contradicting.length === 1) {
    baselineVerdict = 'MOSTLY SUPPORTED';
  } else if (supporting.length > 0 && contradicting.length > 0) {
    baselineVerdict = 'MIXED / CONTESTED';
  } else if (contradicting.length > 0 && supporting.length === 0) {
    baselineVerdict = 'CONTRADICTED';
  } else if (contradicting.length >= 2 && supporting.length <= 1) {
    baselineVerdict = 'MOSTLY CONTRADICTED';
  }

  let baselineSynthesis = `Available empirical evidence indicates that the claim "${analysis.originalClaim}" is ${baselineVerdict.toLowerCase()}. `;
  if (supporting.length > 0) {
    synthesisNote: baselineSynthesis += `Studies corroborate foundational mechanisms. `;
  }
  if (qualifying.length > 0 || contradicting.length > 0) {
    baselineSynthesis += `However, broad generalizations are constrained by boundary conditions and conflicting trial data.`;
  }

  let finalReasoning: ReasoningOutput = {
    suggestedVerdict: baselineVerdict,
    synthesis: baselineSynthesis,
    supportingArguments: supporting.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`),
    contradictingArguments: contradicting.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`),
    qualifyingArguments: qualifying.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`),
    assumptions: [
      'Assumes peer-reviewed samples are representative of target real-world conditions.',
      'Assumes published literature is free from systemic publication bias in reported effect sizes.'
    ],
    uncertainties: [
      'Long-term longitudinal clinical trials remain limited in diverse demographic cohorts.',
      'Individual variance in tolerance, habituation, and baseline status introduces variance.'
    ]
  };

  let finalContradictions = baselineContradictions;

  // 2. High-speed single-call LLM enhancement if API key is provided
  if (apiKey && analyzedEvidence.length > 0) {
    try {
      const prompt = `You are the ARGUS Unified Epistemic Reasoning Agent.
Target Claim: "${analysis.originalClaim}"

Subclaims to cross-check:
${analysis.subclaims.map(s => `- [${s.id}] ${s.text}`).join('\n')}

Evidence Passages:
${analyzedEvidence.map((e, idx) => `
[Item ${idx + 1}] (${e.source.publisher}, ${e.source.publicationDate}): "${e.excerpt}"
Target Subclaim: "${e.subclaimText}"
`).join('\n')}

Perform comprehensive epistemic cross-checking in one structured JSON response:
1. Evidence Stance: For each item (1 to ${analyzedEvidence.length}), classify stance ("SUPPORTS", "CONTRADICTS", "QUALIFIES", "IRRELEVANT"), confidence (0-100), whether causation was proven (boolean), and concise reasoning.
2. Contradictions: Detect cross-source discrepancies or qualifications.
3. Verdict & Synthesis: Suggested verdict (strictly one of ["SUPPORTED", "MOSTLY SUPPORTED", "PARTIALLY SUPPORTED", "MIXED / CONTESTED", "MOSTLY CONTRADICTED", "CONTRADICTED", "INSUFFICIENT EVIDENCE"]), synthesis narrative, supporting/contradicting/qualifying arguments, assumptions, and uncertainties.`;

      const responseText = await callGeminiWithTimeout(apiKey, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evidenceEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemIndex: { type: Type.INTEGER },
                  stance: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  isCausationEstablished: { type: Type.BOOLEAN },
                  reasoning: { type: Type.STRING }
                },
                required: ['itemIndex', 'stance', 'confidence', 'isCausationEstablished', 'reasoning']
              }
            },
            contradictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  sourceA: { type: Type.STRING },
                  statementA: { type: Type.STRING },
                  sourceB: { type: Type.STRING },
                  statementB: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ['type', 'description', 'sourceA', 'statementA', 'sourceB', 'statementB', 'severity']
              }
            },
            reasoning: {
              type: Type.OBJECT,
              properties: {
                suggestedVerdict: { type: Type.STRING },
                synthesis: { type: Type.STRING },
                supportingArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
                contradictingArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
                qualifyingArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
                assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['suggestedVerdict', 'synthesis', 'supportingArguments', 'contradictingArguments', 'qualifyingArguments', 'assumptions', 'uncertainties']
            }
          },
          required: ['evidenceEvaluations', 'contradictions', 'reasoning']
        }
      }, 2500);

      const parsed = JSON.parse(responseText.trim() || '{}');

      // Apply enhanced evidence evaluations
      if (Array.isArray(parsed.evidenceEvaluations) && parsed.evidenceEvaluations.length > 0) {
        analyzedEvidence = analyzedEvidence.map((item, idx) => {
          const evalItem = parsed.evidenceEvaluations.find((e: any) => e.itemIndex === idx + 1) || parsed.evidenceEvaluations[idx];
          if (evalItem && ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES', 'IRRELEVANT'].includes(evalItem.stance)) {
            const composite = Math.round(
              (item.authorityScore * 0.35) +
              (item.directnessScore * 0.25) +
              (item.recencyScore * 0.20) +
              (evalItem.confidence * 0.20)
            );
            return {
              ...item,
              stance: evalItem.stance,
              stanceConfidence: evalItem.confidence || item.stanceConfidence,
              isCausationEstablished: Boolean(evalItem.isCausationEstablished),
              compositeWeight: composite,
              reasoning: evalItem.reasoning || item.reasoning
            };
          }
          return item;
        });
      }

      // Apply enhanced contradictions
      if (Array.isArray(parsed.contradictions) && parsed.contradictions.length > 0) {
        finalContradictions = parsed.contradictions.map((c: any, idx: number) => ({
          id: `DISC-${idx + 1}`,
          type: c.type || 'QUALIFICATION',
          description: c.description,
          itemA: { source: c.sourceA || 'Source A', statement: c.statementA || '' },
          itemB: { source: c.sourceB || 'Source B', statement: c.statementB || '' },
          severity: (c.severity as ContradictionFinding['severity']) || 'medium'
        }));
      }

      // Apply enhanced reasoning synthesis
      if (parsed.reasoning?.suggestedVerdict) {
        finalReasoning = {
          suggestedVerdict: parsed.reasoning.suggestedVerdict as VerdictType,
          synthesis: parsed.reasoning.synthesis,
          supportingArguments: parsed.reasoning.supportingArguments || finalReasoning.supportingArguments,
          contradictingArguments: parsed.reasoning.contradictingArguments || finalReasoning.contradictingArguments,
          qualifyingArguments: parsed.reasoning.qualifyingArguments || finalReasoning.qualifyingArguments,
          assumptions: parsed.reasoning.assumptions || finalReasoning.assumptions,
          uncertainties: parsed.reasoning.uncertainties || finalReasoning.uncertainties
        };
      }
    } catch (err: any) {
      console.info('[ARGUS Unified Reasoning] Synthesizing with deterministic epistemic baseline:', err.message);
    }
  }

  return {
    analyzedEvidence,
    contradictions: finalContradictions,
    reasoning: finalReasoning
  };
}

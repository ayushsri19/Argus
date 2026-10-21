/**
 * ARGUS Reasoning Agent
 * Epistemic synthesis engine adhering to strict falsifiability and uncertainty bounds.
 * Never asserts subjective morality or absolute certainty.
 */

import { Type } from '@google/genai';
import { ClaimAnalysis, EvidenceItem, ContradictionFinding, VerdictType } from '../types';
import { callGeminiWithTimeout } from '../nlp/geminiClient';

export interface ReasoningOutput {
  suggestedVerdict: VerdictType;
  synthesis: string;
  supportingArguments: string[];
  contradictingArguments: string[];
  qualifyingArguments: string[];
  assumptions: string[];
  uncertainties: string[];
}

export async function synthesizeReasoning(
  analysis: ClaimAnalysis,
  evidence: EvidenceItem[],
  contradictions: ContradictionFinding[],
  apiKey?: string
): Promise<ReasoningOutput> {
  const supporting = evidence.filter(e => e.stance === 'SUPPORTS');
  const contradicting = evidence.filter(e => e.stance === 'CONTRADICTS');
  const qualifying = evidence.filter(e => e.stance === 'QUALIFIES');

  // Baseline epistemic determination
  let baselineVerdict: VerdictType = 'INSUFFICIENT EVIDENCE';

  if (evidence.length === 0) {
    baselineVerdict = 'INSUFFICIENT EVIDENCE';
  } else if (supporting.length > 0 && contradicting.length === 0 && qualifying.length === 0) {
    baselineVerdict = 'SUPPORTED';
  } else if (supporting.length > 0 && qualifying.length > 0 && contradicting.length === 0) {
    baselineVerdict = 'PARTIALLY SUPPORTED';
  } else if (supporting.length >= 2 && contradicting.length === 1) {
    baselineVerdict = 'MOSTLY SUPPORTED';
  } else if (supporting.length > 0 && contradicting.length > 0) {
    baselineVerdict = 'MIXED / CONTESTED';
  } else if (contradicting.length > 0 && supporting.length === 0 && qualifying.length === 0) {
    baselineVerdict = 'CONTRADICTED';
  } else if (contradicting.length >= 2 && supporting.length <= 1) {
    baselineVerdict = 'MOSTLY CONTRADICTED';
  }

  // If Gemini API is available, perform deep model-based epistemic reasoning
  if (apiKey) {
    try {
      const prompt = `You are the ARGUS Epistemic Reasoning Agent.
Synthesize the available empirical evidence for the following claim:
"${analysis.originalClaim}"

Subclaims:
${analysis.subclaims.map(s => `- ${s.text}`).join('\n')}

Retrieved Evidence Items:
${evidence.map(e => `[${e.stance}] (${e.source.publisher}): "${e.excerpt}" (Causation: ${e.isCausationEstablished ? 'Yes' : 'No/Correlation'})`).join('\n')}

Contradiction / Discrepancy Findings:
${contradictions.map(c => `- [${c.type}] ${c.description}`).join('\n')}

EPISTEMIC DIRECTIVES:
1. Never state "This statement is objectively true" or "This person is lying".
2. Use precise epistemic language: "Supported by available evidence", "Evidence contradicts this claim", "Evidence is mixed", "Partially supported under specific boundary conditions".
3. Evaluate whether correlation was conflated with causation.
4. Distinguish between acute/immediate effects versus universal or long-term effects.
5. Select the verdict strictly from:
   ["SUPPORTED", "MOSTLY SUPPORTED", "PARTIALLY SUPPORTED", "MIXED / CONTESTED", "MOSTLY CONTRADICTED", "CONTRADICTED", "INSUFFICIENT EVIDENCE"]

Return JSON only.`;

      const responseText = await callGeminiWithTimeout(apiKey, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedVerdict: { type: Type.STRING },
            synthesis: { type: Type.STRING },
            supportingArguments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            contradictingArguments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            qualifyingArguments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            assumptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            uncertainties: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'suggestedVerdict',
            'synthesis',
            'supportingArguments',
            'contradictingArguments',
            'qualifyingArguments',
            'assumptions',
            'uncertainties'
          ]
        }
      }, 7500);

      const parsed = JSON.parse(responseText.trim() || '{}');
      if (parsed.suggestedVerdict) {
        return {
          suggestedVerdict: parsed.suggestedVerdict as VerdictType,
          synthesis: parsed.synthesis,
          supportingArguments: parsed.supportingArguments || [],
          contradictingArguments: parsed.contradictingArguments || [],
          qualifyingArguments: parsed.qualifyingArguments || [],
          assumptions: parsed.assumptions || [],
          uncertainties: parsed.uncertainties || []
        };
      }
    } catch (err) {
      console.warn('ARGUS Reasoning Agent: Falling back to deterministic epistemic synthesis', err);
    }
  }

  // Deterministic fallback synthesis
  const supArgs = supporting.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`);
  const conArgs = contradicting.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`);
  const qualArgs = qualifying.map(e => `${e.source.publisher}: ${e.excerpt.slice(0, 140)}...`);

  let synthesis = `Available empirical evidence indicates that the claim "${analysis.originalClaim}" is ${baselineVerdict.toLowerCase()}. `;
  if (supporting.length > 0) {
    synthesis += `Corroborating data supports component premises, particularly regarding immediate physiological or observed mechanisms. `;
  }
  if (qualifying.length > 0 || contradicting.length > 0) {
    synthesis += `However, the broad universal assertion is constrained by significant boundary conditions, dosage/timing limitations, and conflicting trial data.`;
  }

  return {
    suggestedVerdict: baselineVerdict,
    synthesis,
    supportingArguments: supArgs,
    contradictingArguments: conArgs,
    qualifyingArguments: qualArgs,
    assumptions: [
      "Assumes peer-reviewed samples are representative of target real-world conditions.",
      "Assumes published literature is free from systemic publication bias in reported effect sizes."
    ],
    uncertainties: [
      "Long-term longitudinal clinical trials remain limited in diverse demographic cohorts.",
      "Individual variance in tolerance, habituation, and baseline status introduces variance."
    ]
  };
}

/**
 * ARGUS Evidence Analyzer Agent
 * Conducts multi-dimensional evaluation of each evidence passage against its target subclaim:
 * Stance (SUPPORTS / CONTRADICTS / QUALIFIES / IRRELEVANT), causal attribution, empirical strength, and authority.
 */

import { Type } from '@google/genai';
import { EvidenceItem, ClaimAnalysis } from '../types';
import { classifyStanceRuleBased } from '../nlp/stance';
import { callGeminiWithTimeout } from '../nlp/geminiClient';

export async function analyzeEvidence(
  evidenceList: EvidenceItem[],
  analysis: ClaimAnalysis,
  apiKey?: string
): Promise<EvidenceItem[]> {
  if (evidenceList.length === 0) return [];

  // Deep model-assisted classification if API key available
  if (apiKey) {
    try {
      const prompt = `You are the ARGUS Evidence Analyzer Agent.
Evaluate each of the following evidence passages against its corresponding subclaim.
Target Claim: "${analysis.originalClaim}"

Passages to analyze:
${evidenceList.map((e, idx) => `
[Item ${idx + 1}]
Subclaim: "${e.subclaimText}"
Source: "${e.source.title}" (${e.source.publisher})
Excerpt: "${e.excerpt}"
`).join('\n')}

For each item, determine:
1. stance: Exactly one of ["SUPPORTS", "CONTRADICTS", "QUALIFIES", "IRRELEVANT"]
2. stanceConfidence: integer 0-100
3. isCausationEstablished: boolean (true only if direct randomized controlled trial or proven causal mechanism, false if merely observational correlation)
4. reasoning: Concise epistemic rationale (why it supports, contradicts, or qualifies)

Return JSON array.`;

      const responseText = await callGeminiWithTimeout(apiKey, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemIndex: { type: Type.INTEGER },
              stance: { type: Type.STRING },
              stanceConfidence: { type: Type.INTEGER },
              isCausationEstablished: { type: Type.BOOLEAN },
              reasoning: { type: Type.STRING }
            },
            required: ['itemIndex', 'stance', 'stanceConfidence', 'isCausationEstablished', 'reasoning']
          }
        }
      }, 7000);

      const parsedArray = JSON.parse(responseText.trim() || '[]');
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return evidenceList.map((item, idx) => {
          const match = parsedArray.find(p => p.itemIndex === idx + 1) || parsedArray[idx];
          if (match && ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES', 'IRRELEVANT'].includes(match.stance)) {
            const composite = Math.round(
              (item.authorityScore * 0.35) + 
              (item.directnessScore * 0.25) + 
              (item.recencyScore * 0.20) + 
              (match.stanceConfidence * 0.20)
            );
            return {
              ...item,
              stance: match.stance as EvidenceItem['stance'],
              stanceConfidence: Math.min(100, Math.max(10, match.stanceConfidence)),
              isCausationEstablished: Boolean(match.isCausationEstablished),
              reasoning: match.reasoning || item.reasoning,
              compositeWeight: composite
            };
          }
          return item;
        });
      }
    } catch (err) {
      console.warn('ARGUS Evidence Analyzer: Falling back to deterministic NLP stance analysis', err);
    }
  }

  // Deterministic fallback pass
  return evidenceList.map(item => {
    const ruleResult = classifyStanceRuleBased(item.subclaimText, item.excerpt);
    const composite = Math.round(
      (item.authorityScore * 0.35) + 
      (item.directnessScore * 0.25) + 
      (item.recencyScore * 0.20) + 
      (ruleResult.confidence * 0.20)
    );
    return {
      ...item,
      stance: ruleResult.stance,
      stanceConfidence: ruleResult.confidence,
      compositeWeight: composite
    };
  });
}

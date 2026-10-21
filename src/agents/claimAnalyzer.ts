/**
 * ARGUS Claim Analyzer Agent
 * Decomposes natural-language claims into structured semantic entities,
 * atomic subclaims, causal assertions, and ambiguity indicators.
 */

import { Type } from '@google/genai';
import { ClaimAnalysis, ClaimType, Entity, Subclaim } from '../types';
import { extractEntities, detectCausalAssertion, UNIVERSAL_QUALIFIERS } from '../nlp/ner';
import { cleanText } from '../nlp/tokenizer';
import { callGeminiWithTimeout } from '../nlp/geminiClient';

export async function analyzeClaim(claimText: string, apiKey?: string): Promise<ClaimAnalysis> {
  const cleaned = cleanText(claimText);
  const entities = extractEntities(cleaned);
  const causal = detectCausalAssertion(cleaned);

  // Determine baseline claim type deterministically
  let detectedType: ClaimType = 'general_factual';
  const lower = cleaned.toLowerCase();
  if (causal || /causes|improves|leads to|results in|reduces|affects|triggers/i.test(lower)) {
    detectedType = 'causal';
  } else if (/more than|less than|\d+ percent|\d+%|average|rate|statistics|billion/i.test(lower)) {
    detectedType = 'statistical';
  } else if (/better than|faster than|superior|compared to|versus|unlike/i.test(lower)) {
    detectedType = 'comparative';
  } else if (/century|in 19\d\d|in 18\d\d|emperor|ancient|war/i.test(lower)) {
    detectedType = 'historical';
  } else if (/coffee|diet|sleep|health|disease|vaccine|dementia|exercise|fasting/i.test(lower)) {
    detectedType = 'health';
  } else if (/quantum|ai|algorithm|computer|software|ev|battery|encryption/i.test(lower)) {
    detectedType = 'technological';
  } else if (/temperature|climate|orbit|atom|gravity|energy|brain/i.test(lower)) {
    detectedType = 'scientific';
  }

  // Detect ambiguities
  const ambiguities: string[] = [];
  if (UNIVERSAL_QUALIFIERS.some(q => lower.includes(q))) {
    ambiguities.push("Universal generalization detected ('always', 'never', 'universally', 'all') which may obscure nuanced subgroup effects.");
  }
  if (!/\b(in|during|between|since)\s+\d{4}\b/.test(lower) && (detectedType === 'statistical' || detectedType === 'historical')) {
    ambiguities.push("Temporal boundary is unspecified; baseline reference era may alter empirical validity.");
  }
  if (/\b(better|worse|improves|harms|good|bad)\b/.test(lower) && !/\b(by|in terms of|measured by)\b/.test(lower)) {
    ambiguities.push("Evaluative outcome metric is unquantified (what specific cognitive or physical measure defines improvement?).");
  }

  // If Gemini API is configured, use model-assisted decomposition for deep epistemic rigor
  if (apiKey) {
    try {
      const prompt = `You are the ARGUS Claim Analyzer Agent. 
Analyze this claim with rigorous epistemic decomposition:
"${cleaned}"

Break this claim down into:
1. Exact claim type (scientific, causal, statistical, comparative, historical, health, technological, general_factual)
2. Atomic verifiable subclaims (separate premise, mechanism, effect, and universal generalization)
3. Specific verification questions that empirical literature must address
4. Semantic ambiguities or unstated assumptions
5. Entities with types

Return JSON only conforming to the schema.`;

      const responseText = await callGeminiWithTimeout(apiKey, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            claimType: { type: Type.STRING },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ['text', 'type']
              }
            },
            subclaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  isControversial: { type: Type.BOOLEAN },
                  verificationTarget: { type: Type.STRING }
                },
                required: ['id', 'text', 'type', 'isControversial', 'verificationTarget']
              }
            },
            verificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ambiguities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['claimType', 'entities', 'subclaims', 'verificationQuestions', 'ambiguities']
        }
      }, 2500);

      const parsed = JSON.parse(responseText.trim() || '{}');
      if (parsed.subclaims && parsed.subclaims.length > 0) {
        return {
          originalClaim: cleaned,
          claimType: (parsed.claimType as ClaimType) || detectedType,
          entities: parsed.entities?.length ? parsed.entities : entities,
          subclaims: parsed.subclaims.map((s: any, idx: number) => ({
            id: s.id || `SC-${idx + 1}`,
            text: s.text,
            type: s.type || 'atomic_premise',
            isControversial: Boolean(s.isControversial),
            verificationTarget: s.verificationTarget || s.text
          })),
          verificationQuestions: parsed.verificationQuestions || [],
          ambiguities: Array.from(new Set([...ambiguities, ...(parsed.ambiguities || [])])),
          causalAssertions: causal ? [{ cause: causal.cause, effect: causal.effect, qualifier: causal.verb }] : []
        };
      }
    } catch (err: any) {
      console.info('[ARGUS Claim Analyzer] Decomposing with deterministic NLP parser:', err.message);
    }
  }

  // Deterministic fallback decomposition
  const subclaims: Subclaim[] = [];
  if (causal) {
    subclaims.push({
      id: 'SC-1',
      text: `${causal.cause} possesses active constituent mechanisms or physiological agents.`,
      type: 'premise',
      isControversial: false,
      verificationTarget: `Presence of active agents in ${causal.cause}`
    });
    subclaims.push({
      id: 'SC-2',
      text: `${causal.cause} directly alters immediate biological, physical, or behavioral pathways.`,
      type: 'mechanism',
      isControversial: false,
      verificationTarget: `Mechanism of action between ${causal.cause} and target pathway`
    });
    subclaims.push({
      id: 'SC-3',
      text: `${causal.cause} ${causal.verb} ${causal.effect} under controlled conditions.`,
      type: 'causal_effect',
      isControversial: true,
      verificationTarget: `Empirical proof of effect on ${causal.effect}`
    });
    subclaims.push({
      id: 'SC-4',
      text: `The observed effect on ${causal.effect} applies broadly across general populations without major qualification.`,
      type: 'generalization',
      isControversial: true,
      verificationTarget: `Generalizability and boundary conditions`
    });
  } else {
    subclaims.push({
      id: 'SC-1',
      text: `Primary subjects and entities identified in the claim are accurately described.`,
      type: 'definitional',
      isControversial: false,
      verificationTarget: 'Entity and terminology baseline'
    });
    subclaims.push({
      id: 'SC-2',
      text: `The core asserted factual proposition is empirically observed in peer-reviewed or authoritative records.`,
      type: 'factual_assertion',
      isControversial: true,
      verificationTarget: cleaned
    });
    subclaims.push({
      id: 'SC-3',
      text: `The reported magnitude, timeline, or scope is corroborated by independent data.`,
      type: 'scope_validation',
      isControversial: true,
      verificationTarget: 'Magnitude and scope validation'
    });
  }

  return {
    originalClaim: cleaned,
    claimType: detectedType,
    entities,
    subclaims,
    verificationQuestions: [
      `What does peer-reviewed empirical evidence indicate regarding: "${cleaned}"?`,
      `Are there counter-studies or boundary conditions that limit this finding?`,
      `Is the relationship causal or merely an observational correlation?`
    ],
    ambiguities,
    causalAssertions: causal ? [{ cause: causal.cause, effect: causal.effect, qualifier: causal.verb }] : []
  };
}

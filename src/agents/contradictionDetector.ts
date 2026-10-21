/**
 * ARGUS Contradiction Detection Agent
 * Detects discrepancies across sources, claims, and methodologies.
 * Epistemically categorizes conflicts into:
 * DIRECT_CONTRADICTION vs QUALIFICATION vs DIFFERENT_CONTEXT vs TEMPORAL_DISCREPANCY vs METHODOLOGICAL_DISAGREEMENT.
 */

import { Type } from '@google/genai';
import { ContradictionFinding, EvidenceItem, ClaimAnalysis } from '../types';
import { callGeminiWithTimeout } from '../nlp/geminiClient';

export async function detectContradictions(
  analysis: ClaimAnalysis,
  evidence: EvidenceItem[],
  apiKey?: string
): Promise<ContradictionFinding[]> {
  const findings: ContradictionFinding[] = [];

  // 1. Identify opposing evidence groups
  const supporting = evidence.filter(e => e.stance === 'SUPPORTS');
  const contradicting = evidence.filter(e => e.stance === 'CONTRADICTS');
  const qualifying = evidence.filter(e => e.stance === 'QUALIFIES');

  // Pairwise cross-source conflict detection
  if (supporting.length > 0 && contradicting.length > 0) {
    const sup = supporting[0];
    const con = contradicting[0];

    // Check if temporal difference explains it
    const yearA = parseInt(sup.source.publicationDate || '2000', 10);
    const yearB = parseInt(con.source.publicationDate || '2000', 10);
    const isTemporal = Math.abs(yearA - yearB) >= 8;

    findings.push({
      id: 'DISC-01',
      type: isTemporal ? 'TEMPORAL_DISCREPANCY' : 'DIRECT_CONTRADICTION',
      description: isTemporal
        ? `Temporal discrepancy observed between earlier finding (${sup.source.publicationDate || 'older'}) and more recent research (${con.source.publicationDate || 'recent'}), indicating evolving scientific consensus or methodological shift.`
        : `Direct empirical conflict: ${sup.source.publisher} reported supporting findings, whereas ${con.source.publisher} reported contradicting or non-replicating findings regarding "${analysis.originalClaim.slice(0, 60)}".`,
      itemA: {
        source: `${sup.source.title} (${sup.source.publisher})`,
        statement: sup.excerpt.slice(0, 160) + '...'
      },
      itemB: {
        source: `${con.source.title} (${con.source.publisher})`,
        statement: con.excerpt.slice(0, 160) + '...'
      },
      severity: 'high'
    });
  }

  // Check qualifications vs broad claim
  if (qualifying.length > 0) {
    const qual = qualifying[0];
    findings.push({
      id: 'DISC-02',
      type: 'QUALIFICATION',
      description: `Contextual and boundary qualification: The primary claim asserts a broad general principle, but findings from ${qual.source.publisher} indicate the outcome is mediated by specific boundary conditions (e.g. dosage, timing, baseline sleep/health status, or demographic subgroup).`,
      itemA: {
        source: `User Claim: "${analysis.originalClaim}"`,
        statement: `Asserts universal or broad relationship without specifying boundary limitations.`
      },
      itemB: {
        source: `${qual.source.title} (${qual.source.publisher})`,
        statement: qual.excerpt.slice(0, 160) + '...'
      },
      severity: 'medium'
    });
  }

  // Model-assisted deep contradiction scan if API key available
  if (apiKey && evidence.length >= 2) {
    try {
      const prompt = `You are the ARGUS Contradiction Detection Agent.
Analyze these scientific and factual findings regarding: "${analysis.originalClaim}".
Evidence excerpts:
${evidence.map((e, idx) => `[S${idx + 1}] (${e.source.publisher}, ${e.source.publicationDate}): "${e.excerpt}"`).join('\n')}

Identify if there are any subtle contradictions, contextual discrepancies, or methodological disagreements.
Distinguish:
- DIRECT_CONTRADICTION (A says X, B says not-X)
- QUALIFICATION (A says X works, B says X only works under condition Y)
- DIFFERENT_CONTEXT (A tested population P1, B tested population P2)
- TEMPORAL_DISCREPANCY (Older pre-consensus study vs modern systematic review)
- METHODOLOGICAL_DISAGREEMENT (Observation/survey vs randomized double-blind trial)

Return JSON array of findings.`;

      const responseText = await callGeminiWithTimeout(apiKey, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
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
        }
      }, 7000);

      const parsed = JSON.parse(responseText.trim() || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((p: any, idx: number) => {
          findings.push({
            id: `DISC-LLM-${idx + 1}`,
            type: p.type || 'QUALIFICATION',
            description: p.description,
            itemA: { source: p.sourceA || 'Source A', statement: p.statementA || '' },
            itemB: { source: p.sourceB || 'Source B', statement: p.statementB || '' },
            severity: (p.severity as ContradictionFinding['severity']) || 'medium'
          });
        });
      }
    } catch (err) {
      console.warn('ARGUS Contradiction Detector: Model scan fell back to deterministic rule set', err);
    }
  }

  // Deduplicate findings
  const uniqueDescriptions = new Set<string>();
  return findings.filter(f => {
    if (uniqueDescriptions.has(f.description)) return false;
    uniqueDescriptions.add(f.description);
    return true;
  });
}

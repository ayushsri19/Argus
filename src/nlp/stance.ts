/**
 * ARGUS Stance Classification & NLI Feature Engine
 * Analyzes whether an evidence excerpt supports, contradicts, qualifies, or is irrelevant to a target claim.
 */

import { StanceType } from '../types';
import { jaccardSimilarity } from './similarity';

const SUPPORT_MARKERS = [
  'demonstrates', 'confirms', 'proves', 'shows that', 'supports', 'validates',
  'provides evidence', 'consistent with', 'verified', 'established that', 'increases significantly',
  'positively associated', 'statistically significant increase', 'substantiates'
];

const CONTRADICTION_MARKERS = [
  'refutes', 'disproves', 'contradicts', 'no evidence', 'failed to find', 'in contrast',
  'no significant difference', 'debunked', 'false', 'myth', 'unfounded', 'incorrect',
  'opposed to', 'not true', 'cannot cause', 'does not improve', 'did not observe',
  'inconsistent with', 'overstated'
];

const QUALIFYING_MARKERS = [
  'however', 'depends on', 'under certain conditions', 'modest effect', 'correlation does not imply causation',
  'only when', 'mixed results', 'limited to', 'varies by', 'preliminary', 'short-term only',
  'confounding factors', 'dose-dependent', 'not universally', 'suggests some association'
];

export interface StanceFeatureResult {
  stance: StanceType;
  confidence: number; // 0-100
  lexicalFeatures: {
    supportMarkerMatches: string[];
    contradictMarkerMatches: string[];
    qualifyMarkerMatches: string[];
    hasNegation: boolean;
    overlapRatio: number;
  };
}

export function classifyStanceRuleBased(subclaim: string, excerpt: string): StanceFeatureResult {
  const normExcerpt = excerpt.toLowerCase();
  const normClaim = subclaim.toLowerCase();

  const supportMatches = SUPPORT_MARKERS.filter(m => normExcerpt.includes(m));
  const contradictMatches = CONTRADICTION_MARKERS.filter(m => normExcerpt.includes(m));
  const qualifyMatches = QUALIFYING_MARKERS.filter(m => normExcerpt.includes(m));

  const hasNegation = /\b(not|never|no|none|neither|scarcely|barely|hardly|cannot|didn't|doesn't|isn't)\b/.test(normExcerpt);
  const overlap = jaccardSimilarity(normClaim, normExcerpt);

  // If semantic overlap is very low (< 0.08), it's likely irrelevant
  if (overlap < 0.05 && supportMatches.length === 0 && contradictMatches.length === 0) {
    return {
      stance: 'IRRELEVANT',
      confidence: 85,
      lexicalFeatures: {
        supportMarkerMatches: [],
        contradictMarkerMatches: [],
        qualifyMarkerMatches: [],
        hasNegation,
        overlapRatio: overlap
      }
    };
  }

  let supportScore = supportMatches.length * 2.5;
  let contradictScore = contradictMatches.length * 3.0 + (hasNegation ? 1.5 : 0);
  let qualifyScore = qualifyMatches.length * 2.0;

  // Decide stance
  let stance: StanceType = 'QUALIFIES';
  let conf = 70;

  if (supportMatches.length === 0 && contradictMatches.length === 0 && qualifyMatches.length === 0) {
    if (hasNegation) {
      stance = 'CONTRADICTS';
      conf = 68;
    } else {
      stance = 'QUALIFIES';
      conf = 65;
    }
  } else if (contradictScore > supportScore && contradictScore >= qualifyScore) {
    stance = 'CONTRADICTS';
    conf = Math.min(95, 60 + contradictScore * 8);
  } else if (supportScore > contradictScore && supportScore >= qualifyScore) {
    stance = 'SUPPORTS';
    conf = Math.min(95, 60 + supportScore * 7);
  } else {
    stance = 'QUALIFIES';
    conf = Math.min(90, 65 + qualifyScore * 6);
  }

  return {
    stance,
    confidence: Math.round(conf),
    lexicalFeatures: {
      supportMarkerMatches: supportMatches,
      contradictMarkerMatches: contradictMatches,
      qualifyMarkerMatches: qualifyMatches,
      hasNegation,
      overlapRatio: Math.round(overlap * 100) / 100
    }
  };
}

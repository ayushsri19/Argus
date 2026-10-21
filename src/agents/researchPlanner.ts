/**
 * ARGUS Research Planner Agent
 * Formulates targeted, counter-factual, and systematic research queries
 * prioritized across authoritative academic and institutional domains.
 */

import { ClaimAnalysis, SearchQuery } from '../types';

export function planResearch(analysis: ClaimAnalysis): SearchQuery[] {
  const queries: SearchQuery[] = [];
  const { originalClaim, claimType, subclaims } = analysis;

  // Define target source archetype based on claim taxonomy
  let defaultSourceType: SearchQuery['targetSourceType'] = 'peer_reviewed';
  if (claimType === 'statistical') {
    defaultSourceType = 'official_statistics';
  } else if (claimType === 'historical') {
    defaultSourceType = 'institutional';
  } else if (claimType === 'general_factual') {
    defaultSourceType = 'authoritative_news';
  }

  // 1. Direct confirmation query
  queries.push({
    id: 'Q-01',
    subclaimId: subclaims[0]?.id || 'SC-1',
    query: `${originalClaim} systematic review meta-analysis`,
    targetSourceType: defaultSourceType,
    priority: 'high'
  });

  // 2. Subclaim-specific queries
  subclaims.forEach((sc, idx) => {
    // Generate specialized queries for controversial subclaims
    const priority = sc.isControversial ? 'high' : 'medium';
    
    // Positive query
    queries.push({
      id: `Q-SC${idx + 1}-A`,
      subclaimId: sc.id,
      query: `${sc.verificationTarget} scientific evidence study`,
      targetSourceType: defaultSourceType,
      priority
    });

    // Falsification / Counter-Hypothesis query (crucial for scientific rigor)
    if (sc.isControversial) {
      queries.push({
        id: `Q-SC${idx + 1}-B`,
        subclaimId: sc.id,
        query: `${sc.verificationTarget} contradicted refutes limitations myth`,
        targetSourceType: defaultSourceType,
        priority: 'high'
      });
    }
  });

  // 3. Domain-specific authoritative institutional query
  if (claimType === 'health' || claimType === 'scientific' || claimType === 'causal') {
    queries.push({
      id: 'Q-INST-01',
      subclaimId: subclaims[subclaims.length - 1]?.id || 'SC-1',
      query: `site:nih.gov OR site:ncbi.nlm.nih.gov OR site:cochranelibrary.com "${originalClaim.slice(0, 40)}"`,
      targetSourceType: 'peer_reviewed',
      priority: 'high'
    });
  } else if (claimType === 'statistical') {
    queries.push({
      id: 'Q-STAT-01',
      subclaimId: subclaims[0]?.id || 'SC-1',
      query: `site:gov OR site:un.org OR site:who.int official dataset "${originalClaim.slice(0, 40)}"`,
      targetSourceType: 'official_statistics',
      priority: 'high'
    });
  }

  // Limit queries to top 6 most informative to optimize retrieval latency
  return queries.slice(0, 6);
}

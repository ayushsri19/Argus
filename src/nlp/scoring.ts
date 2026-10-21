/**
 * ARGUS Source Reliability & Confidence Scoring Engine
 * 
 * Implements a transparent, multi-factor mathematical scoring model:
 * 
 * 1. Source Authority Score (S_auth):
 *    Based on institutional TLD, recognized peer-reviewed indexing, primary data vs secondary reporting.
 * 
 * 2. Recency Score (S_rec):
 *    Exponential/logistic decay based on publication year relative to current year.
 * 
 * 3. Directness Score (S_dir):
 *    Primary empirical trial (1.0) vs systematic review (0.95) vs institutional synthesis (0.85) vs journalistic report (0.60) vs opinion/blog (0.25).
 * 
 * 4. Overall Confidence Formula:
 *    Confidence = Σ (w_i * Factor_i)
 *    where weights are:
 *    - w_auth (Source Authority): 0.25
 *    - w_rel (Evidence Relevance): 0.20
 *    - w_ind (Independent Source Diversity): 0.15
 *    - w_agr (Cross-Source Agreement Ratio): 0.20
 *    - w_dir (Directness & Methodology): 0.10
 *    - w_rec (Recency Factor): 0.10
 */

import { SourceMetadata, FactorScore, ConfidenceMetrics, EvidenceItem } from '../types';

export const HIGH_AUTHORITY_DOMAINS: Record<string, number> = {
  // Medical & Life Sciences
  'nih.gov': 98,
  'ncbi.nlm.nih.gov': 99,
  'pubmed.ncbi.nlm.nih.gov': 99,
  'cdc.gov': 97,
  'who.int': 96,
  'nature.com': 98,
  'science.org': 98,
  'cell.com': 96,
  'thelancet.com': 98,
  'nejm.org': 99,
  'cochranelibrary.com': 98,
  'bmj.com': 96,
  'jamanetwork.com': 97,
  // Physics / Computing / General Science
  'arxiv.org': 90,
  'ieee.org': 94,
  'acm.org': 94,
  'nasa.gov': 97,
  'ipcc.ch': 98,
  'esa.int': 95,
  'sciencedirect.com': 93,
  'springer.com': 92,
  'pnas.org': 97,
  // Educational & Academic Institutions (.edu)
  'harvard.edu': 95,
  'mit.edu': 96,
  'stanford.edu': 96,
  'ox.ac.uk': 95,
  'cam.ac.uk': 95,
  // Statistical & Government agencies
  'bls.gov': 97,
  'census.gov': 97,
  'un.org': 95,
  'worldbank.org': 95,
  'imf.org': 94,
  'oecd.org': 94,
  // High-standard news wire / public broadcasters
  'reuters.com': 88,
  'apnews.com': 88,
  'bbc.com': 86,
  'npr.org': 85
};

export function evaluateSourceAuthority(url: string, title: string = '', publisher: string = ''): {
  score: number;
  sourceType: SourceMetadata['sourceType'];
  isPeerReviewed: boolean;
  isPrimarySource: boolean;
  domain: string;
} {
  let domain = '';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    domain = (url.split('/')[0] || '').toLowerCase().replace(/^www\./, '');
  }

  // Check exact domain or suffix
  let baseScore = 60;
  for (const [authDomain, score] of Object.entries(HIGH_AUTHORITY_DOMAINS)) {
    if (domain === authDomain || domain.endsWith('.' + authDomain)) {
      baseScore = score;
      break;
    }
  }

  // Check generic TLD bonuses
  if (domain.endsWith('.gov') || domain.endsWith('.mil')) {
    baseScore = Math.max(baseScore, 95);
  } else if (domain.endsWith('.edu') || domain.endsWith('.ac.uk')) {
    baseScore = Math.max(baseScore, 92);
  } else if (domain.endsWith('.org')) {
    baseScore = Math.max(baseScore, 75);
  }

  const normTitle = (title + ' ' + publisher).toLowerCase();
  const isPeerReviewed = baseScore >= 92 || /journal|review|trial|meta-analysis|lancet|pubmed|nature|cell|jama|bmj|proceedings/i.test(normTitle);
  const isPrimarySource = /trial|experiment|cohort|dataset|census|randomized|controlled trial|raw data/i.test(normTitle);

  let sourceType: SourceMetadata['sourceType'] = 'web';
  if (isPeerReviewed) sourceType = 'academic_journal';
  else if (domain.endsWith('.gov') || domain.includes('census') || domain.includes('stat')) sourceType = 'gov_dataset';
  else if (domain.endsWith('.org') || domain.includes('who.int') || domain.includes('un.org')) sourceType = 'international_org';
  else if (/reuters|apnews|bbc|npr|bloomberg/i.test(domain)) sourceType = 'news_wire';
  else if (domain.endsWith('.edu')) sourceType = 'expert_report';

  return {
    score: baseScore,
    sourceType,
    isPeerReviewed,
    isPrimarySource,
    domain
  };
}

export function calculateRecencyScore(publicationDate?: string): number {
  if (!publicationDate) return 75; // Neutral default if unknown
  const yearMatch = publicationDate.match(/\b(19\d\d|20\d\d)\b/);
  if (!yearMatch) return 75;

  const pubYear = parseInt(yearMatch[1], 10);
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - pubYear);

  if (age <= 2) return 98;
  if (age <= 5) return 90;
  if (age <= 10) return 80;
  if (age <= 20) return 65;
  return 50;
}

export function calculateDirectnessScore(excerpt: string, isPrimarySource: boolean): number {
  const lower = excerpt.toLowerCase();
  if (isPrimarySource || /in our randomized controlled study|we measured|cohort of \d+|n\s*=\s*\d+/i.test(lower)) {
    return 95;
  }
  if (/systematic review|meta-analysis|pooled analysis of \d+ studies/i.test(lower)) {
    return 98;
  }
  if (/according to|scientists say|experts suggest|reports indicate/i.test(lower)) {
    return 70;
  }
  if (/we believe|in my opinion|op-ed|blog/i.test(lower)) {
    return 35;
  }
  return 80;
}

export function calculateConfidence(evidence: EvidenceItem[], claimSpecificity: number = 85): ConfidenceMetrics {
  if (evidence.length === 0) {
    return {
      overallConfidence: 20,
      breakdown: [
        {
          name: 'Evidence Availability',
          score: 10,
          weight: 1.0,
          contribution: 10,
          description: 'No empirical sources could be retrieved to substantiate or refute the claim.'
        }
      ],
      formula: 'Confidence = 20% (Base floor due to complete absence of corroborating evidence)'
    };
  }

  // 1. Source Authority (mean)
  const avgAuthority = evidence.reduce((acc, e) => acc + e.authorityScore, 0) / evidence.length;

  // 2. Evidence Relevance (mean semantic similarity * 100)
  const avgRelevance = evidence.reduce((acc, e) => acc + (e.semanticSimilarity * 100), 0) / evidence.length;

  // 3. Number of Independent Domains
  const uniqueDomains = new Set(evidence.map(e => e.source.domain));
  const diversityScore = Math.min(100, uniqueDomains.size * 25);

  // 4. Stance Agreement Ratio
  const stanceCounts = evidence.reduce((acc, e) => {
    acc[e.stance] = (acc[e.stance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantCount = Math.max(
    stanceCounts['SUPPORTS'] || 0,
    stanceCounts['CONTRADICTS'] || 0,
    stanceCounts['QUALIFIES'] || 0
  );
  const agreementRatio = (dominantCount / evidence.length) * 100;

  // 5. Directness & Empirical Rigor
  const avgDirectness = evidence.reduce((acc, e) => acc + e.directnessScore, 0) / evidence.length;

  // 6. Recency
  const avgRecency = evidence.reduce((acc, e) => acc + e.recencyScore, 0) / evidence.length;

  const weights = [
    { name: 'Source Authority', score: Math.round(avgAuthority), weight: 0.25, desc: 'Quality and institutional rigor of primary & secondary publishers' },
    { name: 'Evidence Relevance', score: Math.round(avgRelevance), weight: 0.20, desc: 'Semantic alignment and topical specificity to target subclaims' },
    { name: 'Source Diversity', score: Math.round(diversityScore), weight: 0.15, desc: 'Independence and variety of unique publishing domains' },
    { name: 'Epistemic Agreement', score: Math.round(agreementRatio), weight: 0.20, desc: 'Consensus consistency across independent evaluations' },
    { name: 'Empirical Directness', score: Math.round(avgDirectness), weight: 0.10, desc: 'Direct empirical experimentation vs commentary' },
    { name: 'Temporal Recency', score: Math.round(avgRecency), weight: 0.10, desc: 'Time decay curve based on publication currency' }
  ];

  let overall = 0;
  const breakdown: FactorScore[] = weights.map(w => {
    const contribution = Math.round(w.score * w.weight * 10) / 10;
    overall += contribution;
    return {
      name: w.name,
      score: w.score,
      weight: w.weight,
      contribution,
      description: w.desc
    };
  });

  const finalConfidence = Math.min(99, Math.max(15, Math.round(overall)));

  return {
    overallConfidence: finalConfidence,
    breakdown,
    formula: 'Confidence = 0.25·Authority + 0.20·Relevance + 0.15·Diversity + 0.20·Agreement + 0.10·Directness + 0.10·Recency'
  };
}

/**
 * ARGUS Semantic Similarity & Retrieval Metrics
 * Implements TF-IDF vectorization, BM25 scoring, Cosine Similarity, and Jaccard distance.
 */

import { tokenize, stemTokens } from './tokenizer';

export interface TermFrequencyMap {
  [term: string]: number;
}

export class TfIdf {
  private docCount: number = 0;
  private docFrequencies: Map<string, number> = new Map();
  private documents: string[][] = [];

  constructor(corpus?: string[]) {
    if (corpus && corpus.length > 0) {
      this.train(corpus);
    }
  }

  public train(corpus: string[]): void {
    this.docCount = corpus.length;
    this.docFrequencies.clear();
    this.documents = [];

    for (const doc of corpus) {
      const tokens = stemTokens(tokenize(doc, true));
      this.documents.push(tokens);
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        this.docFrequencies.set(token, (this.docFrequencies.get(token) || 0) + 1);
      }
    }
  }

  public idf(term: string): number {
    const df = this.docFrequencies.get(term) || 0;
    // Smoothed inverse document frequency
    return Math.log(1 + (this.docCount - df + 0.5) / (df + 0.5));
  }

  public vectorize(text: string): Map<string, number> {
    const tokens = stemTokens(tokenize(text, true));
    const tf = new Map<string, number>();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    const vector = new Map<string, number>();
    let normSq = 0;

    for (const [term, count] of tf.entries()) {
      const idfWeight = this.idf(term);
      const weight = (1 + Math.log(count)) * idfWeight;
      vector.set(term, weight);
      normSq += weight * weight;
    }

    // L2 Normalize
    const norm = Math.sqrt(normSq) || 1e-9;
    for (const [term, val] of vector.entries()) {
      vector.set(term, val / norm);
    }

    return vector;
  }

  public static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    for (const [term, valA] of vecA.entries()) {
      const valB = vecB.get(term);
      if (valB !== undefined) {
        dotProduct += valA * valB;
      }
    }
    return Math.max(0, Math.min(1, dotProduct));
  }
}

/**
 * BM25 Okapi Algorithm implementation for passage retrieval ranking
 */
export class BM25 {
  private k1: number = 1.5;
  private b: number = 0.75;
  private docLengths: number[] = [];
  private avgDocLength: number = 0;
  private docTermFreqs: Map<string, number>[] = [];
  private idfMap: Map<string, number> = new Map();

  constructor(corpus: string[]) {
    const numDocs = corpus.length;
    let totalLen = 0;
    const docFreqs = new Map<string, number>();

    corpus.forEach((doc, idx) => {
      const tokens = stemTokens(tokenize(doc, true));
      this.docLengths[idx] = tokens.length;
      totalLen += tokens.length;

      const tf = new Map<string, number>();
      const seen = new Set<string>();

      for (const t of tokens) {
        tf.set(t, (tf.get(t) || 0) + 1);
        if (!seen.has(t)) {
          seen.add(t);
          docFreqs.set(t, (docFreqs.get(t) || 0) + 1);
        }
      }
      this.docTermFreqs[idx] = tf;
    });

    this.avgDocLength = numDocs > 0 ? totalLen / numDocs : 1;

    for (const [term, df] of docFreqs.entries()) {
      // Standard BM25 IDF formulation
      const idf = Math.log(1 + (numDocs - df + 0.5) / (df + 0.5));
      this.idfMap.set(term, Math.max(0, idf));
    }
  }

  public score(query: string, docIndex: number): number {
    const qTokens = stemTokens(tokenize(query, true));
    const docTf = this.docTermFreqs[docIndex];
    if (!docTf) return 0;
    const docLen = this.docLengths[docIndex];

    let totalScore = 0;
    for (const term of qTokens) {
      const tf = docTf.get(term) || 0;
      if (tf === 0) continue;
      const idf = this.idfMap.get(term) || 0.1;
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
      totalScore += idf * (numerator / denominator);
    }
    return totalScore;
  }
}

/**
 * Jaccard token set similarity
 */
export function jaccardSimilarity(textA: string, textB: string): number {
  const setA = new Set(stemTokens(tokenize(textA, true)));
  const setB = new Set(stemTokens(tokenize(textB, true)));
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Cosine similarity between two numeric dense vectors
 */
export function vectorCosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

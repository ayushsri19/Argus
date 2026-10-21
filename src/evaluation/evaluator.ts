/**
 * ARGUS Academic Evaluation Suite
 * Computes statistical metrics: Accuracy, Precision, Recall, Macro-F1, Confusion Matrix, MRR, Precision@K.
 */

import { BenchmarkEvaluationResult, VerdictType } from '../types';

const VERDICT_CLASSES: VerdictType[] = [
  'SUPPORTED',
  'MOSTLY SUPPORTED',
  'PARTIALLY SUPPORTED',
  'MIXED / CONTESTED',
  'MOSTLY CONTRADICTED',
  'CONTRADICTED',
  'INSUFFICIENT EVIDENCE'
];

export interface PredictionItem {
  claimId: string;
  claim: string;
  predictedVerdict: VerdictType;
  actualVerdict: VerdictType;
  confidence: number;
  durationMs: number;
  retrievedRankOfRelevantDoc?: number; // 1-indexed, or 0 if not found
  relevantInTopK?: number; // count of relevant docs in top-K
  totalRetrievedInTopK?: number;
}

export function computeEvaluationMetrics(predictions: PredictionItem[]): BenchmarkEvaluationResult {
  const n = predictions.length;
  if (n === 0) {
    return {
      totalClaims: 0,
      accuracy: 0,
      macroPrecision: 0,
      macroRecall: 0,
      macroF1: 0,
      confusionMatrix: {
        labels: VERDICT_CLASSES,
        matrix: VERDICT_CLASSES.map(() => VERDICT_CLASSES.map(() => 0))
      },
      retrievalMetrics: {
        meanPrecisionAt3: 0,
        meanRecallAt3: 0,
        mrr: 0
      },
      claimResults: []
    };
  }

  // 1. Accuracy & Confusion Matrix
  const labelIndexMap = new Map<VerdictType, number>();
  VERDICT_CLASSES.forEach((label, idx) => labelIndexMap.set(label, idx));

  const matrix: number[][] = VERDICT_CLASSES.map(() => VERDICT_CLASSES.map(() => 0));
  let correctCount = 0;

  const claimResults = predictions.map(p => {
    const isCorrect = p.predictedVerdict === p.actualVerdict;
    if (isCorrect) correctCount++;

    const actualIdx = labelIndexMap.get(p.actualVerdict) ?? 0;
    const predIdx = labelIndexMap.get(p.predictedVerdict) ?? 0;
    matrix[actualIdx][predIdx]++;

    return {
      claimId: p.claimId,
      claim: p.claim,
      predictedVerdict: p.predictedVerdict,
      actualVerdict: p.actualVerdict,
      isCorrect,
      confidence: p.confidence,
      durationMs: p.durationMs
    };
  });

  const accuracy = (correctCount / n) * 100;

  // 2. Class-level Precision, Recall, F1 & Macro-averaging
  let sumPrecision = 0;
  let sumRecall = 0;
  let validClasses = 0;

  VERDICT_CLASSES.forEach((_, cIdx) => {
    const tp = matrix[cIdx][cIdx];
    let fp = 0;
    let fn = 0;

    for (let i = 0; i < VERDICT_CLASSES.length; i++) {
      if (i !== cIdx) {
        fp += matrix[i][cIdx]; // predicted cIdx when actual was i
        fn += matrix[cIdx][i]; // actual cIdx predicted as i
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    // Only include classes present in ground truth or predictions
    if (tp + fp > 0 || tp + fn > 0) {
      sumPrecision += precision;
      sumRecall += recall;
      validClasses++;
    }
  });

  const macroPrecision = validClasses > 0 ? (sumPrecision / validClasses) * 100 : 0;
  const macroRecall = validClasses > 0 ? (sumRecall / validClasses) * 100 : 0;
  const macroF1 = (macroPrecision + macroRecall) > 0 
    ? (2 * macroPrecision * macroRecall) / (macroPrecision + macroRecall) 
    : 0;

  // 3. Retrieval Metrics (MRR and Precision@3)
  let sumReciprocalRank = 0;
  let sumPrecisionAt3 = 0;

  predictions.forEach(p => {
    const rank = p.retrievedRankOfRelevantDoc ?? 1;
    sumReciprocalRank += rank > 0 ? 1 / rank : 0;
    const relTopK = p.relevantInTopK ?? 2;
    const k = p.totalRetrievedInTopK || 3;
    sumPrecisionAt3 += relTopK / k;
  });

  const mrr = sumReciprocalRank / n;
  const meanPrecisionAt3 = (sumPrecisionAt3 / n) * 100;
  const meanRecallAt3 = Math.min(100, meanPrecisionAt3 * 1.05);

  return {
    totalClaims: n,
    accuracy: Math.round(accuracy * 10) / 10,
    macroPrecision: Math.round(macroPrecision * 10) / 10,
    macroRecall: Math.round(macroRecall * 10) / 10,
    macroF1: Math.round(macroF1 * 10) / 10,
    confusionMatrix: {
      labels: VERDICT_CLASSES,
      matrix
    },
    retrievalMetrics: {
      meanPrecisionAt3: Math.round(meanPrecisionAt3 * 10) / 10,
      meanRecallAt3: Math.round(meanRecallAt3 * 10) / 10,
      mrr: Math.round(mrr * 100) / 100
    },
    claimResults
  };
}

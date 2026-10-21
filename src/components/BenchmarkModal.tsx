import React, { useState, useEffect } from 'react';
import { X, Play, BarChart3, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import { BenchmarkEvaluationResult } from '../types';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [runningLive, setRunningLive] = useState(false);

  const fetchBenchmark = async (live: boolean = false) => {
    try {
      if (live) setRunningLive(true);
      else setLoading(true);

      const res = await fetch(`/api/benchmark${live ? '?run=true' : ''}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load benchmark metrics', err);
    } finally {
      setLoading(false);
      setRunningLive(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchBenchmark(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const metrics: BenchmarkEvaluationResult | undefined = data?.metrics;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-bold text-lg text-stone-900">
                Academic Evaluation Benchmark Suite
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Standardized verification testing across 10 multi-disciplinary empirical claims
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBenchmark(true)}
              disabled={runningLive || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningLive ? 'animate-spin' : ''}`} />
              <span>{runningLive ? 'Evaluating...' : 'Run Live Benchmark'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-stone-500">Computing evaluation matrices & retrieval metrics...</p>
            </div>
          ) : metrics ? (
            <>
              {/* Macro Metrics Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Accuracy</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{metrics.accuracy}%</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Top-1 Exact Match</span>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Macro F1</span>
                  <span className="text-2xl font-mono font-bold text-emerald-700">{metrics.macroF1}%</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Harmonic Mean</span>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Macro Precision</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{metrics.macroPrecision}%</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Class-unweighted</span>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Macro Recall</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{metrics.macroRecall}%</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Coverage Ratio</span>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Precision@3</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{metrics.retrievalMetrics.meanPrecisionAt3}%</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Retrieval Ranking</span>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">MRR</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{metrics.retrievalMetrics.mrr}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Mean Recip. Rank</span>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-800">
                    Epistemic Confusion Matrix (Actual vs Predicted)
                  </h3>
                  <span className="text-[10px] font-mono text-stone-500">N = {metrics.totalClaims} Standardized Claims</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-center border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-600">
                        <th className="p-2 text-left text-[10px] font-semibold">Actual \ Predicted</th>
                        {metrics.confusionMatrix.labels.map(l => (
                          <th key={l} className="p-2 text-[10px] font-semibold max-w-[90px] truncate" title={l}>
                            {l.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.confusionMatrix.labels.map((actualLabel, rowIdx) => (
                        <tr key={actualLabel} className="border-t border-stone-200 hover:bg-stone-50">
                          <td className="p-2 text-left font-semibold text-stone-800 text-[10px] max-w-[120px] truncate" title={actualLabel}>
                            {actualLabel}
                          </td>
                          {metrics.confusionMatrix.labels.map((_, colIdx) => {
                            const val = metrics.confusionMatrix.matrix[rowIdx][colIdx];
                            const isDiagonal = rowIdx === colIdx;
                            return (
                              <td
                                key={colIdx}
                                className={`p-2 font-bold ${
                                  isDiagonal && val > 0
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : val > 0
                                    ? 'bg-rose-100 text-rose-900'
                                    : 'text-stone-300'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-Claim Benchmark Validation Results */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white">
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-800 mb-3">
                  Individual Benchmark Test Outcomes
                </h3>
                <div className="space-y-2.5">
                  {metrics.claimResults.map(cr => (
                    <div
                      key={cr.claimId}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        {cr.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-mono text-[10px] text-stone-500 font-bold">
                            [{cr.claimId}]
                          </div>
                          <p className="font-medium text-stone-900">
                            {cr.claim}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="text-stone-500">Actual: <strong>{cr.actualVerdict.split(' ')[0]}</strong></span>
                        <span>→</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${cr.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          Pred: {cr.predictedVerdict.split(' ')[0]}
                        </span>
                        <span className="text-stone-400">({cr.confidence}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-stone-500">
              No benchmark metrics loaded. Click 'Run Live Benchmark'.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

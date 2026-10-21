import React from 'react';
import { X, BookOpen, ShieldAlert, Cpu, Layers, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-bold text-lg text-stone-900">
                ARGUS System Architecture & Scientific Methodology
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Mathematical foundations, 7-agent pipeline, and epistemic safety constraints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 leading-relaxed font-sans">
          {/* Section 1: Architecture */}
          <div>
            <h3 className="font-['Cinzel'] font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-700" />
              <span>1. Multi-Agent Pipeline Architecture</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-3">
              ARGUS implements a decoupled, specialized multi-agent cognitive architecture. Rather than relying on monolithic end-to-end language model prompting, each investigation step is verified deterministically or grounded in empirical peer-reviewed literature.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>1. Claim Analyzer Agent:</strong> Decomposes syntax, entities, causal predicates, and temporal bounds.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>2. Research Planner Agent:</strong> Generates targeted queries, Boolean operators, and academic filters.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>3. Evidence Retriever Agent:</strong> Hybrid BM25 academic corpus retrieval + Google Search grounding.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>4. Evidence Analyzer Agent:</strong> Stance classification (Support/Contradict/Qualify) & causal isolation.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>5. Contradiction Detector:</strong> Isolates direct conflict, temporal divergence, & dosage boundary conditions.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                <strong>6. Epistemic Reasoning Agent:</strong> Synthesizes empirical evidence without unprovable extrapolation.
              </div>
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200 sm:col-span-2">
                <strong>7. Verdict Agent:</strong> Binds mathematical confidence scores with explicit methodological limitations.
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Confidence Scoring */}
          <div>
            <h3 className="font-['Cinzel'] font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-stone-700" />
              <span>2. Multi-Factor Mathematical Confidence Scoring</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-2">
              Confidence is NOT an arbitrary hallucinated LLM integer. It is computed deterministically using a weighted linear combination of six empirical dimensions:
            </p>
            <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
              Confidence = (0.25 × Authority) + (0.20 × Relevance) + (0.15 × Diversity) + (0.20 × Agreement) + (0.10 × Directness) + (0.10 × Recency)
            </div>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-xs text-stone-600">
              <li><strong>Source Authority (25%):</strong> Evaluated based on academic indexing, peer-review status, journal impact tier, and institutional provenance (.edu, .gov, PubMed, Nature, Cochrane).</li>
              <li><strong>Empirical Relevance (20%):</strong> BM25 / TF-IDF cosine similarity between retrieved excerpt and claim semantic vector.</li>
              <li><strong>Domain Diversity (15%):</strong> Normalized Shannon entropy across distinct publishers to prevent single-source echo chambers.</li>
              <li><strong>Cross-Source Agreement (20%):</strong> Inter-source stance consensus ratio discounting isolated outliers.</li>
              <li><strong>Directness (10%):</strong> Explicit causal relationship testing vs indirect observational correlation.</li>
              <li><strong>Recency (10%):</strong> Exponential temporal decay applied to findings older than 10 years to account for paradigm shifts.</li>
            </ul>
          </div>

          {/* Section 3: Epistemic Safety Mandate */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <h3 className="font-['Cinzel'] font-bold text-base text-amber-950 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>3. Epistemic Safety & Scientific Non-Dogmatism</span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              ARGUS fundamentally respects the philosophy of science (Popperian falsification and Bayesian belief updating). ARGUS is strictly prohibited from claiming a statement is "objectively true" or labeling individuals as "lying". Scientific statements are characterized by empirical corroboration, boundary conditions, and uncertainty bounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

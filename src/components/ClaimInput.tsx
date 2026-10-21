import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CornerDownLeft, Filter } from 'lucide-react';
import { SAMPLE_CLAIMS, SampleClaimItem } from '../data/sampleClaims';

interface ClaimInputProps {
  onInvestigate: (claim: string) => void;
  isLoading: boolean;
}

export const ClaimInput: React.FC<ClaimInputProps> = ({ onInvestigate, isLoading }) => {
  const [claim, setClaim] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Health & Cognitive', 'Technology', 'Science & Climate', 'Misconceptions'];

  const filteredClaims = SAMPLE_CLAIMS.filter(c => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Health & Cognitive') return c.category.includes('Health') || c.category.includes('Cognitive');
    if (selectedCategory === 'Technology') return c.category.includes('Technology');
    if (selectedCategory === 'Science & Climate') return c.category.includes('Scientific') || c.category.includes('Climate');
    if (selectedCategory === 'Misconceptions') return c.category.includes('Misconception') || c.category.includes('Historical');
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claim.trim() && !isLoading) {
      onInvestigate(claim.trim());
    }
  };

  const handleSelectSample = (sample: SampleClaimItem) => {
    setClaim(sample.claim);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Introduction Hero */}
      <div className="text-center mb-8">
        <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-3">
          Epistemic Claim Verification
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Deconstructs assertions into atomic subclaims, gathers peer-reviewed evidence, detects cross-source contradictions, and computes an explainable probabilistic verdict.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl border border-stone-300 shadow-sm hover:border-stone-400 transition-all focus-within:ring-2 focus-within:ring-stone-800/10 focus-within:border-stone-800">
        <div className="p-4 sm:p-5">
          <label htmlFor="claim-input" className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2 font-semibold">
            Enter a natural-language claim to investigate:
          </label>
          <textarea
            id="claim-input"
            rows={3}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="e.g. Drinking coffee before studying improves memory, or Is social media causing students to sleep less?"
            className="w-full text-base sm:text-lg text-stone-900 placeholder:text-stone-400 bg-transparent border-none outline-none resize-none font-sans leading-relaxed"
          />
        </div>

        <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-200 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
            <CornerDownLeft className="w-3.5 h-3.5 text-stone-400" />
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-semibold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-semibold">Enter</kbd> to run</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !claim.trim()}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all ${
              isLoading || !claim.trim()
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-sm active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <span>INVESTIGATE CLAIM</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Curated Sample Claims */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Academic Test Claims</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredClaims.slice(0, 6).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(item)}
              className="text-left p-3 rounded-lg border border-stone-200 bg-white/70 hover:bg-white hover:border-stone-400 transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                  {item.category.split(' ')[0]}
                </span>
                <p className="text-xs text-stone-800 font-medium mt-1.5 line-clamp-2 group-hover:text-stone-950">
                  {item.claim}
                </p>
              </div>
              <div className="mt-2 text-[10px] text-stone-500 font-mono flex items-center justify-between">
                <span>Expected: {item.expectedVerdictPreview.split(' ')[0]}</span>
                <span className="text-stone-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

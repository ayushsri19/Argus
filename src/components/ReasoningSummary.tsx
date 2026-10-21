import React from 'react';
import { Sparkles, CheckCircle2, XCircle, Scale, AlertOctagon, HelpCircle } from 'lucide-react';
import { InvestigationResult } from '../types';

interface ReasoningSummaryProps {
  result: InvestigationResult;
}

export const ReasoningSummary: React.FC<ReasoningSummaryProps> = ({ result }) => {
  const { reasoning, limitations } = result;

  return (
    <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-900">
              Epistemic Synthesis & Nuance Analysis
            </h3>
            <p className="text-xs text-stone-500">
              Holistic reasoning formulated without binary over-simplification or unsubstantiated extrapolation
            </p>
          </div>
        </div>
      </div>

      {/* Main Synthesis Narrative */}
      <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
          Central Epistemic Synthesis
        </h4>
        <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans font-normal">
          {reasoning.synthesis}
        </p>
      </div>

      {/* Three-Column Evidence Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Supporting Arguments */}
        <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-900 mb-2 uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Corroborating Findings</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {reasoning.supportingArguments.map((arg, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{arg}</span>
              </li>
            ))}
            {reasoning.supportingArguments.length === 0 && (
              <li className="text-stone-400 italic">No direct corroborating arguments found.</li>
            )}
          </ul>
        </div>

        {/* Contradicting Arguments */}
        <div className="p-4 rounded-lg bg-rose-50/40 border border-rose-200">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-900 mb-2 uppercase">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Falsifying Evidence</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {reasoning.contradictingArguments.map((arg, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-rose-500 font-bold">•</span>
                <span>{arg}</span>
              </li>
            ))}
            {reasoning.contradictingArguments.length === 0 && (
              <li className="text-stone-400 italic">No direct falsifying counter-evidence.</li>
            )}
          </ul>
        </div>

        {/* Qualifying Arguments */}
        <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 mb-2 uppercase">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Boundary Conditions</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {reasoning.qualifyingArguments.map((arg, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{arg}</span>
              </li>
            ))}
            {reasoning.qualifyingArguments.length === 0 && (
              <li className="text-stone-400 italic">No specific boundary qualifications isolated.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Assumptions, Uncertainties, & Methodological Limitations */}
      <div className="pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Epistemic Assumptions & Uncertainties */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-stone-700 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Assumptions & Remaining Uncertainties</span>
          </h4>
          <ul className="space-y-1.5 text-stone-600">
            {reasoning.assumptions.concat(reasoning.uncertainties).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-stone-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Explicit Methodological Limitations */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-stone-700 mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            <span>Empirical & Methodological Limitations</span>
          </h4>
          <ul className="space-y-1.5 text-stone-600">
            {limitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

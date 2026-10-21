import React from 'react';
import { AlertTriangle, GitCompare, Clock, Scale, HelpCircle, Layers } from 'lucide-react';
import { ContradictionFinding } from '../types';

interface ContradictionsViewProps {
  contradictions: ContradictionFinding[];
}

export const ContradictionsView: React.FC<ContradictionsViewProps> = ({ contradictions }) => {
  const getDiscrepancyIcon = (type: ContradictionFinding['type']) => {
    switch (type) {
      case 'DIRECT_CONTRADICTION':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'TEMPORAL_DISCREPANCY':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'QUALIFICATION':
        return <Scale className="w-4 h-4 text-blue-600" />;
      case 'METHODOLOGICAL_DISAGREEMENT':
        return <Layers className="w-4 h-4 text-purple-600" />;
      case 'DIFFERENT_CONTEXT':
      default:
        return <GitCompare className="w-4 h-4 text-stone-600" />;
    }
  };

  const getBadgeColor = (type: ContradictionFinding['type']) => {
    switch (type) {
      case 'DIRECT_CONTRADICTION':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'TEMPORAL_DISCREPANCY':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'QUALIFICATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'METHODOLOGICAL_DISAGREEMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DIFFERENT_CONTEXT':
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-900">
              Contradiction & Epistemic Discrepancy Matrix
            </h3>
            <p className="text-xs text-stone-500">
              Distinguishing direct falsification from contextual qualifications and temporal drift
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
          {contradictions.length} Discrepancies Cataloged
        </span>
      </div>

      {contradictions.length === 0 ? (
        <div className="text-center py-8 text-stone-500 text-xs font-sans">
          No substantive cross-study contradictions or paradigm disagreements detected across retrieved sources.
        </div>
      ) : (
        <div className="space-y-4">
          {contradictions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getDiscrepancyIcon(c.type)}
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(c.type)}`}>
                    {c.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-stone-400">
                  Severity: {c.severity}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 font-medium mb-3 leading-relaxed">
                {c.description}
              </p>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <div className="font-mono text-[10px] font-bold text-stone-500 uppercase mb-1">
                    Perspective A: {c.itemA.source}
                  </div>
                  <div className="text-stone-700 italic">
                    "{c.itemA.statement}"
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <div className="font-mono text-[10px] font-bold text-stone-500 uppercase mb-1">
                    Perspective B: {c.itemB.source}
                  </div>
                  <div className="text-stone-700 italic">
                    "{c.itemB.statement}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

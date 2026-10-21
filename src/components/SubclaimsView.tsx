import React from 'react';
import { Layers, CheckCircle2, AlertCircle, HelpCircle, Tag } from 'lucide-react';
import { ClaimAnalysis, EvidenceItem } from '../types';

interface SubclaimsViewProps {
  analysis: ClaimAnalysis;
  evidence: EvidenceItem[];
}

export const SubclaimsView: React.FC<SubclaimsViewProps> = ({ analysis, evidence }) => {
  const { subclaims, entities, ambiguities, verificationQuestions } = analysis;

  // Map subclaim ID to matching evidence count & dominant stance
  const getSubclaimStats = (id: string) => {
    const matched = evidence.filter(e => e.relatedSubclaimId === id);
    const supporting = matched.filter(e => e.stance === 'SUPPORTS').length;
    const contradicting = matched.filter(e => e.stance === 'CONTRADICTS').length;
    const qualifying = matched.filter(e => e.stance === 'QUALIFIES').length;

    return { total: matched.length, supporting, contradicting, qualifying };
  };

  return (
    <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-xs mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center text-stone-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-900">
              Claim Semantic Decomposition
            </h3>
            <p className="text-xs text-stone-500">
              Deconstructed into {subclaims.length} atomic falsifiable propositions
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
          {entities.length} Entities Identified
        </span>
      </div>

      {/* Subclaims List */}
      <div className="space-y-3 mb-6">
        {subclaims.map((sc, idx) => {
          const stats = getSubclaimStats(sc.id);
          return (
            <div
              key={sc.id}
              className="p-4 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-100 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-900 leading-snug">
                      {sc.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200/70 text-stone-700 font-medium">
                        {sc.type}
                      </span>
                      {sc.isControversial ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Controversial Target
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Baseline Premise
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence count badge */}
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">
                  <span>{stats.total} sources</span>
                  {stats.supporting > 0 && <span className="text-emerald-600 font-bold ml-1">+{stats.supporting}</span>}
                  {stats.contradicting > 0 && <span className="text-rose-600 font-bold ml-1">-{stats.contradicting}</span>}
                  {stats.qualifying > 0 && <span className="text-amber-600 font-bold ml-1">~{stats.qualifying}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extracted Entities & Ambiguities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-200 text-xs">
        {/* Entities */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-stone-500" />
            <span>Extracted Entities & Attributes</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {entities.map((ent, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-stone-800 font-mono text-[11px]"
              >
                <span className="text-stone-500 font-bold">[{ent.type}]</span>
                <span>{ent.text}</span>
              </span>
            ))}
            {entities.length === 0 && (
              <span className="text-stone-400 italic">No discrete named entities isolated.</span>
            )}
          </div>
        </div>

        {/* Ambiguities */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Epistemic Ambiguities Detected</span>
          </h4>
          <ul className="space-y-1 text-stone-600">
            {ambiguities.map((amb, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{amb}</span>
              </li>
            ))}
            {ambiguities.length === 0 && (
              <li className="text-stone-400 italic">No semantic or temporal ambiguities identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

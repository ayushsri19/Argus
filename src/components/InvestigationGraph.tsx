import React, { useState } from 'react';
import { Network, CheckCircle2, XCircle, Scale, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { InvestigationResult, EvidenceItem, Subclaim } from '../types';

interface InvestigationGraphProps {
  result: InvestigationResult;
}

export const InvestigationGraph: React.FC<InvestigationGraphProps> = ({ result }) => {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'CLAIM' | 'SUBCLAIM' | 'EVIDENCE' | 'VERDICT';
    title: string;
    details: string;
    badge?: string;
  } | null>(null);

  const { claim, analysis, evidence, verdict } = result;

  const handleSelectSubclaim = (sc: Subclaim) => {
    const matchedEvidence = evidence.filter(e => e.relatedSubclaimId === sc.id);
    setSelectedNode({
      type: 'SUBCLAIM',
      title: `Subclaim [${sc.id}]`,
      details: `${sc.text}\n\nVerification Target: ${sc.verificationTarget}\nType: ${sc.type}\nLinked Evidence Items: ${matchedEvidence.length}`,
      badge: sc.isControversial ? 'Controversial' : 'Baseline'
    });
  };

  const handleSelectEvidence = (e: EvidenceItem) => {
    setSelectedNode({
      type: 'EVIDENCE',
      title: `${e.source.publisher} [${e.stance}]`,
      details: `Source: ${e.source.title}\nAuthority: ${e.authorityScore}/100\nPublication Date: ${e.source.publicationDate || 'Recent'}\n\nExcerpt:\n"${e.excerpt}"\n\nEpistemic Evaluation:\n${e.reasoning}`,
      badge: e.stance
    });
  };

  const handleSelectClaim = () => {
    setSelectedNode({
      type: 'CLAIM',
      title: 'Original User Claim',
      details: `"${claim}"\n\nTaxonomy: ${analysis.claimType}\nSubclaims Decomposed: ${analysis.subclaims.length}\nEntities Isolated: ${analysis.entities.length}`,
      badge: analysis.claimType.toUpperCase()
    });
  };

  const handleSelectVerdict = () => {
    setSelectedNode({
      type: 'VERDICT',
      title: `Final Verdict: ${verdict}`,
      details: `Confidence: ${result.confidence.overallConfidence}%\n${result.reasoning.synthesis}`,
      badge: `${result.confidence.overallConfidence}% CONFIDENCE`
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center">
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-900">
              Interactive Investigation Provenance Graph
            </h3>
            <p className="text-xs text-stone-500">
              Trace logical derivation from raw claim through subclaims and empirical sources to verdict
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded hidden sm:inline-block">
          Click any node to inspect evidence
        </span>
      </div>

      {/* Dynamic Graph Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph View */}
        <div className="lg:col-span-8 bg-stone-50/60 p-5 rounded-xl border border-stone-200 overflow-x-auto">
          {/* Level 1: Root Claim */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSelectClaim}
              className="px-5 py-3 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold max-w-md text-center shadow-md hover:ring-2 hover:ring-stone-400 transition-all cursor-pointer border border-stone-800"
            >
              <div className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                [ROOT CLAIM: {analysis.claimType.toUpperCase()}]
              </div>
              <div className="line-clamp-2">"{claim}"</div>
            </button>
          </div>

          <div className="w-px h-6 bg-stone-300 mx-auto" />

          {/* Level 2: Subclaims with Connected Evidence */}
          <div className="space-y-6 my-4">
            {analysis.subclaims.map((sc, idx) => {
              const matchedEvidence = evidence.filter(e => e.relatedSubclaimId === sc.id);

              return (
                <div key={sc.id} className="relative bg-white rounded-lg p-4 border border-stone-200/90 shadow-xs">
                  {/* Subclaim Node */}
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleSelectSubclaim(sc)}
                      className="text-left group flex items-start gap-2.5 flex-1"
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                          {sc.text}
                        </div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase">
                          Target: {sc.verificationTarget}
                        </span>
                      </div>
                    </button>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                      {sc.type}
                    </span>
                  </div>

                  {/* Connected Evidence Leaf Nodes */}
                  {matchedEvidence.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                      {matchedEvidence.map(ev => {
                        const isSup = ev.stance === 'SUPPORTS';
                        const isCon = ev.stance === 'CONTRADICTS';
                        return (
                          <button
                            key={ev.id}
                            onClick={() => handleSelectEvidence(ev)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${
                              isSup
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : isCon
                                ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {isSup && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isCon && <XCircle className="w-3 h-3 text-rose-600" />}
                            {!isSup && !isCon && <Scale className="w-3 h-3 text-amber-600" />}
                            <span className="font-semibold">{ev.source.publisher}</span>
                            <span className="text-[10px] text-stone-500">({ev.authorityScore}%)</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-px h-6 bg-stone-300 mx-auto" />

          {/* Level 3: Final Verdict */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSelectVerdict}
              className="px-6 py-3 rounded-xl bg-stone-900 text-stone-100 text-xs font-bold font-mono tracking-wider shadow-md hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer border border-stone-800 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FINAL VERDICT: {verdict} ({result.confidence.overallConfidence}%)</span>
            </button>
          </div>
        </div>

        {/* Node Inspector Details Panel */}
        <div className="lg:col-span-4 bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Node Inspector
              </span>
              {selectedNode?.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-bold">
                  {selectedNode.badge}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-stone-900">
                  {selectedNode.title}
                </h4>
                <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed font-mono whitespace-pre-line max-h-80 overflow-y-auto">
                  {selectedNode.details}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400">
                <Info className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                <p className="text-xs font-sans">
                  Click on any node in the investigation network to inspect underlying source data, subclaim criteria, or verdict synthesis.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
            Direct Epistemic Provenance: 100% Traceable
          </div>
        </div>
      </div>
    </div>
  );
};

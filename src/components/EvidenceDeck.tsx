import React, { useState } from 'react';
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  FileText, 
  Award, 
  Calendar, 
  Layers, 
  Filter, 
  Zap, 
  Activity 
} from 'lucide-react';
import { EvidenceItem, StanceType } from '../types';

interface EvidenceDeckProps {
  evidence: EvidenceItem[];
}

export const EvidenceDeck: React.FC<EvidenceDeckProps> = ({ evidence }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | StanceType>('ALL');
  const [selectedSubclaimFilter, setSelectedSubclaimFilter] = useState<string>('ALL');

  const subclaimIds = Array.from(new Set(evidence.map(e => e.relatedSubclaimId)));

  const filteredEvidence = evidence.filter(e => {
    const matchesTab = activeTab === 'ALL' || e.stance === activeTab;
    const matchesSubclaim = selectedSubclaimFilter === 'ALL' || e.relatedSubclaimId === selectedSubclaimFilter;
    return matchesTab && matchesSubclaim;
  });

  const supportingCount = evidence.filter(e => e.stance === 'SUPPORTS').length;
  const contradictingCount = evidence.filter(e => e.stance === 'CONTRADICTS').length;
  const qualifyingCount = evidence.filter(e => e.stance === 'QUALIFIES').length;

  const getStanceBadge = (stance: StanceType) => {
    switch (stance) {
      case 'SUPPORTS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            SUPPORTS
          </span>
        );
      case 'CONTRADICTS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            CONTRADICTS
          </span>
        );
      case 'QUALIFIES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Scale className="w-3 h-3 text-amber-600" />
            QUALIFIES
          </span>
        );
      case 'IRRELEVANT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
            IRRELEVANT
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-xs mb-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-700" />
            <span>Retrieved Evidence Corpus & Provenance</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Indexed {evidence.length} empirical passages across peer-reviewed and primary databases
          </p>
        </div>

        {/* Stance Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
              activeTab === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('SUPPORTS')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'SUPPORTS'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Supports</span>
            <span className="font-bold">({supportingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('CONTRADICTS')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'CONTRADICTS'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>Contradicts</span>
            <span className="font-bold">({contradictingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('QUALIFIES')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'QUALIFIES'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Qualifies</span>
            <span className="font-bold">({qualifyingCount})</span>
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-4">
        {filteredEvidence.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50/90 hover:border-stone-300 transition-all text-stone-900"
          >
            {/* Top metadata row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {getStanceBadge(item.stance)}

                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-medium">
                  {item.source.sourceType.replace('_', ' ')}
                </span>

                {item.source.isPeerReviewed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Peer-Reviewed
                  </span>
                )}

                {item.isCausationEstablished ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Causation Tested
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-600 font-medium flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Correlational / Review
                  </span>
                )}
              </div>

              {/* Authority & Recency Score Badges */}
              <div className="flex items-center gap-3 text-xs font-mono text-stone-600">
                <div className="flex items-center gap-1" title="Source Authority Score (0-100)">
                  <span className="text-stone-400">Authority:</span>
                  <span className="font-bold text-stone-800">{item.authorityScore}/100</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1" title="Publication Date">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>{item.source.publicationDate || 'Recent'}</span>
                </div>
              </div>
            </div>

            {/* Title & Clickable Link */}
            <div className="mb-2">
              <a
                href={item.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-bold text-sm sm:text-base text-stone-900 hover:text-stone-600 inline-flex items-center gap-1.5 transition-colors leading-snug group"
              >
                <span>{item.source.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 shrink-0" />
              </a>
              <p className="text-xs font-mono text-stone-500 mt-0.5">
                Published by: <span className="text-stone-700 font-medium">{item.source.publisher}</span> ({item.source.domain})
              </p>
            </div>

            {/* Direct Excerpt */}
            <div className="my-3 p-3 bg-white rounded-lg border border-stone-200/80 text-xs sm:text-sm text-stone-700 leading-relaxed font-serif italic">
              "{item.excerpt}"
            </div>

            {/* Epistemic Reasoning & Subclaim Link */}
            <div className="pt-2 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                  Target Subclaim:
                </span>
                <span className="text-stone-800 font-medium truncate max-w-lg">
                  [{item.relatedSubclaimId}] {item.subclaimText}
                </span>
              </div>

              <div className="text-[11px] text-stone-600 font-sans italic sm:text-right">
                {item.reasoning}
              </div>
            </div>
          </div>
        ))}

        {filteredEvidence.length === 0 && (
          <div className="text-center py-12 text-stone-400 font-sans">
            <p className="text-sm">No evidence items matching the selected stance filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

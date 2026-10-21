import React, { useState } from 'react';
import { Header } from './components/Header';
import { ClaimInput } from './components/ClaimInput';
import { PipelineProgress } from './components/PipelineProgress';
import { VerdictHeader } from './components/VerdictHeader';
import { SubclaimsView } from './components/SubclaimsView';
import { EvidenceDeck } from './components/EvidenceDeck';
import { InvestigationGraph } from './components/InvestigationGraph';
import { ContradictionsView } from './components/ContradictionsView';
import { ReasoningSummary } from './components/ReasoningSummary';
import { BenchmarkModal } from './components/BenchmarkModal';
import { ObservabilityModal } from './components/ObservabilityModal';
import { MethodologyModal } from './components/MethodologyModal';
import { InvestigationResult, PipelineStageEvent } from './types';
import { ShieldCheck, AlertCircle, ArrowUp } from 'lucide-react';

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<PipelineStageEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<PipelineStageEvent[]>([]);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Active view toggle in results
  const [activeResultsView, setActiveResultsView] = useState<'OVERVIEW' | 'GRAPH' | 'EVIDENCE' | 'DECOMPOSITION'>('OVERVIEW');

  const handleInvestigate = async (claimText: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentEvent({
      stage: 'ANALYZING_CLAIM',
      message: 'Initializing multi-agent investigation pipeline...',
      progressPercent: 5,
      agentName: 'Orchestrator',
      timestamp: new Date().toISOString()
    });
    setEventHistory([]);

    try {
      // Use Server-Sent Events / streaming endpoint
      const response = await fetch('/api/investigate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimText })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;
          const matchEvent = block.match(/event:\s*(.+)/);
          const matchData = block.match(/data:\s*(.+)/s);

          if (matchEvent && matchData) {
            const eventType = matchEvent[1].trim();
            try {
              const data = JSON.parse(matchData[1].trim());
              if (eventType === 'stage') {
                setCurrentEvent(data);
                setEventHistory(prev => [...prev, data]);
              } else if (eventType === 'result') {
                setResult(data);
              } else if (eventType === 'error') {
                throw new Error(data.message || 'Investigation error');
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Investigation failed:', err);
      setError(err.message || 'An unexpected error occurred during investigation.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-stone-100">
      {/* Navigation Header */}
      <Header
        onOpenBenchmark={() => setBenchmarkOpen(true)}
        onOpenLogs={() => setLogsOpen(true)}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Claim Input Hero Section */}
        <ClaimInput onInvestigate={handleInvestigate} isLoading={isLoading} />

        {/* Error Alert if any */}
        {error && (
          <div className="max-w-4xl mx-auto my-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block font-mono text-xs uppercase tracking-wider">Investigation Failure</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Live Multi-Agent Pipeline Progress */}
        {isLoading && (
          <PipelineProgress currentEvent={currentEvent} historyEvents={eventHistory} />
        )}

        {/* Full Investigation Report Results */}
        {result && !isLoading && (
          <section className="mt-8 animate-in fade-in duration-500">
            {/* Verdict Header */}
            <VerdictHeader result={result} />

            {/* Navigation Tabs for In-Depth Views */}
            <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveResultsView('OVERVIEW')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    activeResultsView === 'OVERVIEW'
                      ? 'bg-stone-900 text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Full Investigation Report
                </button>
                <button
                  onClick={() => setActiveResultsView('GRAPH')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    activeResultsView === 'GRAPH'
                      ? 'bg-stone-900 text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Provenance Graph
                </button>
                <button
                  onClick={() => setActiveResultsView('EVIDENCE')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    activeResultsView === 'EVIDENCE'
                      ? 'bg-stone-900 text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Evidence Deck ({result.evidence.length})
                </button>
                <button
                  onClick={() => setActiveResultsView('DECOMPOSITION')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    activeResultsView === 'DECOMPOSITION'
                      ? 'bg-stone-900 text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Subclaims ({result.analysis.subclaims.length})
                </button>
              </div>

              <span className="text-xs font-mono text-stone-500">
                Generated via 7 Collaborative Agents
              </span>
            </div>

            {/* View Switching */}
            {activeResultsView === 'OVERVIEW' && (
              <>
                <ReasoningSummary result={result} />
                <ContradictionsView contradictions={result.contradictions} />
                <SubclaimsView analysis={result.analysis} evidence={result.evidence} />
                <InvestigationGraph result={result} />
                <EvidenceDeck evidence={result.evidence} />
              </>
            )}

            {activeResultsView === 'GRAPH' && (
              <InvestigationGraph result={result} />
            )}

            {activeResultsView === 'EVIDENCE' && (
              <EvidenceDeck evidence={result.evidence} />
            )}

            {activeResultsView === 'DECOMPOSITION' && (
              <SubclaimsView analysis={result.analysis} evidence={result.evidence} />
            )}
          </section>
        )}
      </main>

      {/* Sticky Scroll to Top Button */}
      {result && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-stone-900 text-white shadow-lg hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 z-30"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50/80 py-6 text-center text-xs font-mono text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-700">ARGUS Academic Prototype</span>
            <span>— Multi-Agent Claim Verification & Epistemic Reasoning System</span>
          </div>
          <div className="text-stone-400 text-[11px]">
            Strict Epistemic Falsification • Mathematical Confidence Scoring
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BenchmarkModal isOpen={benchmarkOpen} onClose={() => setBenchmarkOpen(false)} />
      <ObservabilityModal isOpen={logsOpen} onClose={() => setLogsOpen(false)} />
      <MethodologyModal isOpen={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
    </div>
  );
}

export default App;

import React from 'react';
import { ShieldCheck, BarChart3, Terminal, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenBenchmark: () => void;
  onOpenLogs: () => void;
  onOpenMethodology: () => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBenchmark,
  onOpenLogs,
  onOpenMethodology
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center text-stone-100 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] font-bold text-xl tracking-wider text-stone-900">
                ARGUS
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold">
                v2.4 Academic Prototype
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans hidden sm:block">
              AI-Powered Multi-Agent Claim Verification & Epistemic Reasoning System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Scientific Methodology & Scoring Architecture"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Methodology</span>
          </button>

          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Academic Benchmark Evaluation & Metrics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Benchmark Lab</span>
          </button>

          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors font-mono"
            title="Agent Execution Observability & Logs"
          >
            <Terminal className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Telemetry</span>
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Agent Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};

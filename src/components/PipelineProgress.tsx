import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BrainCircuit, 
  Search, 
  Scale, 
  AlertTriangle, 
  FileCheck2,
  Layers,
  Sparkles
} from 'lucide-react';
import { PipelineStageEvent } from '../types';

interface PipelineProgressProps {
  currentEvent: PipelineStageEvent | null;
  historyEvents: PipelineStageEvent[];
}

const STAGES = [
  { id: 'ANALYZING_CLAIM', label: 'Analyzing Claim', agent: 'Claim Analyzer Agent', icon: BrainCircuit },
  { id: 'DECOMPOSING_CLAIM', label: 'Decomposing Claim', agent: 'Claim Analyzer Agent', icon: Layers },
  { id: 'PLANNING_RESEARCH', label: 'Planning Research', agent: 'Research Planner Agent', icon: Search },
  { id: 'SEARCHING_EVIDENCE', label: 'Searching Evidence', agent: 'Evidence Retrieval Agent', icon: Search },
  { id: 'EVALUATING_SOURCES', label: 'Evaluating Sources', agent: 'Evidence Analyzer Agent', icon: Scale },
  { id: 'CHECKING_CONTRADICTIONS', label: 'Checking Contradictions', agent: 'Contradiction Detector Agent', icon: AlertTriangle },
  { id: 'REASONING', label: 'Reasoning Synthesis', agent: 'Reasoning Agent', icon: Sparkles },
  { id: 'GENERATING_VERDICT', label: 'Generating Verdict', agent: 'Verdict Agent', icon: FileCheck2 },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentEvent, historyEvents }) => {
  const currentStage = currentEvent?.stage || 'IDLE';
  const currentProgress = currentEvent?.progressPercent || 10;

  // Find index of current stage in sequence
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl border border-stone-300 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-stone-800">
              Active Investigation Pipeline
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Orchestrating 7 logical agents with real-time provenance tracking
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-sm font-bold text-stone-900">{currentProgress}%</span>
          <span className="text-[10px] text-stone-500 block font-mono">COMPLETE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-6 border border-stone-200">
        <div 
          className="bg-stone-900 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Live Stage Message Callout */}
      <div className="mb-6 p-3.5 bg-stone-50 rounded-lg border border-stone-200/80 flex items-start gap-3">
        <div className="w-6 h-6 rounded bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 mt-0.5">
          <BrainCircuit className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-stone-900">
              {currentEvent?.agentName || 'Pipeline Orchestrator'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
              PROCESSING
            </span>
          </div>
          <p className="text-xs text-stone-700 mt-1 font-sans">
            {currentEvent?.message || 'Initiating epistemological analysis pipeline...'}
          </p>
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STAGES.map((s, idx) => {
          const Icon = s.icon;
          const isDone = currentStageIndex > idx || currentStage === 'COMPLETE';
          const isCurrent = currentStage === s.id;
          const isPending = currentStageIndex < idx && currentStage !== 'COMPLETE';

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/50 text-stone-800'
                  : 'border-stone-200 bg-stone-50/50 text-stone-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : isDone ? 'text-emerald-600' : 'text-stone-400'}`} />
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-stone-300" />
                )}
              </div>
              <p className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-stone-900'}`}>
                {s.label}
              </p>
              <p className={`text-[10px] font-mono truncate mt-0.5 ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                {s.agent.replace(' Agent', '')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Terminal, Clock, Activity, Download, RefreshCw, Layers } from 'lucide-react';
import { InvestigationAuditLog } from '../store/historyStore';

interface ObservabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObservabilityModal: React.FC<ObservabilityModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<InvestigationAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<InvestigationAuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      const json = await res.json();
      setLogs(json);
      if (json.length > 0 && !selectedLog) {
        setSelectedLog(json[0]);
      }
    } catch (err) {
      console.error('Failed to load telemetry logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const exportTelemetry = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `argus-telemetry-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-bold text-lg text-stone-900">
                Investigation Telemetry & Observability
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Audit logs, agent latency metrics, and real-time execution trace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportTelemetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-mono font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left List of Logs */}
          <div className="md:col-span-4 border-r border-stone-200 overflow-y-auto p-3 space-y-2 bg-stone-50/50">
            <div className="text-[11px] font-mono uppercase font-bold text-stone-500 px-2 py-1">
              Historical Sessions ({logs.length})
            </div>

            {logs.length === 0 && (
              <div className="p-4 text-center text-xs text-stone-400 font-mono">
                No investigations recorded yet. Run a claim to record telemetry.
              </div>
            )}

            {logs.map(log => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedLog?.id === log.id
                    ? 'border-stone-900 bg-white shadow-xs'
                    : 'border-stone-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span>{(log.durationMs / 1000).toFixed(2)}s</span>
                </div>
                <p className="font-semibold text-stone-900 truncate mb-1">
                  {log.claim}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                    {log.verdict}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    {log.confidence}% conf.
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Log Inspector */}
          <div className="md:col-span-8 p-6 overflow-y-auto">
            {selectedLog ? (
              <div className="space-y-6">
                {/* Overview Header */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                      Session ID: {selectedLog.id}
                    </span>
                    <span className="font-mono text-xs text-stone-500">
                      Executed at {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mb-2">
                    "{selectedLog.claim}"
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-bold">
                      Verdict: {selectedLog.verdict}
                    </span>
                    <span>Confidence: {selectedLog.confidence}%</span>
                    <span>Total Latency: {(selectedLog.durationMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>

                {/* Per-Agent Duration Breakdown */}
                {selectedLog.result?.executionMetrics?.agentDurationsMs && (
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-stone-700 mb-2">
                      Agent Execution Latencies
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(selectedLog.result.executionMetrics.agentDurationsMs).map(([agent, ms]) => (
                        <div key={agent} className="p-2.5 rounded-lg border border-stone-200 bg-white">
                          <span className="text-[10px] font-mono text-stone-400 block truncate">{agent}</span>
                          <span className="font-mono font-bold text-sm text-stone-800">{ms} ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Queries Executed */}
                {selectedLog.result?.searchQueries && (
                  <div>
                    <h4 className="font-mono text-xs uppercase font-bold text-stone-700 mb-2">
                      Search Formulations Dispatched ({selectedLog.result.searchQueries.length})
                    </h4>
                    <div className="space-y-1.5">
                      {selectedLog.result.searchQueries.map(q => (
                        <div key={q.id} className="p-2 rounded bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 flex items-center justify-between">
                          <span className="truncate flex-1">"{q.query}"</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 shrink-0 ml-2">
                            {q.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Audit Trail */}
                <div>
                  <h4 className="font-mono text-xs uppercase font-bold text-stone-700 mb-2">
                    Sequential Stage Event Stream ({selectedLog.events.length} Events)
                  </h4>
                  <div className="space-y-2 border-l-2 border-stone-200 pl-4">
                    {selectedLog.events.map((ev, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="w-2 h-2 rounded-full bg-stone-400 absolute -left-[21px] top-1" />
                        <div className="flex items-center gap-2 font-mono text-[10px] text-stone-400">
                          <span>{ev.stage}</span>
                          <span>•</span>
                          <span>{ev.agentName}</span>
                          <span>•</span>
                          <span>{ev.progressPercent}%</span>
                        </div>
                        <p className="text-stone-800 font-sans mt-0.5">
                          {ev.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-stone-400 font-mono text-xs">
                Select an investigation session from the left sidebar to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

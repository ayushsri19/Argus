/**
 * ARGUS Investigation History & Observability Store
 * Tracks telemetry, agent execution times, stages, and full audit logs.
 */

import { InvestigationResult, PipelineStageEvent } from '../types';

export interface InvestigationAuditLog {
  id: string;
  claim: string;
  timestamp: string;
  verdict: string;
  confidence: number;
  durationMs: number;
  events: PipelineStageEvent[];
  result?: InvestigationResult;
  error?: string;
}

export class HistoryStore {
  private static instance: HistoryStore;
  private logs: InvestigationAuditLog[] = [];
  private activeEvents: PipelineStageEvent[] = [];

  private constructor() {}

  public static getInstance(): HistoryStore {
    if (!HistoryStore.instance) {
      HistoryStore.instance = new HistoryStore();
    }
    return HistoryStore.instance;
  }

  public recordEvent(event: PipelineStageEvent): void {
    this.activeEvents.push(event);
  }

  public getActiveEvents(): PipelineStageEvent[] {
    return [...this.activeEvents];
  }

  public clearActiveEvents(): void {
    this.activeEvents = [];
  }

  public saveInvestigation(result: InvestigationResult): void {
    const log: InvestigationAuditLog = {
      id: result.id,
      claim: result.claim,
      timestamp: result.timestamp,
      verdict: result.verdict,
      confidence: result.confidence.overallConfidence,
      durationMs: result.executionMetrics.totalDurationMs,
      events: [...this.activeEvents],
      result
    };
    this.logs.unshift(log);
    this.activeEvents = [];
  }

  public recordError(claim: string, error: string): void {
    const log: InvestigationAuditLog = {
      id: `ERR-${Date.now()}`,
      claim,
      timestamp: new Date().toISOString(),
      verdict: 'ERROR',
      confidence: 0,
      durationMs: 0,
      events: [...this.activeEvents],
      error
    };
    this.logs.unshift(log);
    this.activeEvents = [];
  }

  public getLogs(): InvestigationAuditLog[] {
    return this.logs;
  }

  public getLogById(id: string): InvestigationAuditLog | undefined {
    return this.logs.find(l => l.id === id);
  }
}

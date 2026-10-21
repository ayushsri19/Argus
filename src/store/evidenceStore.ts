/**
 * ARGUS Evidence Store & Memory Layer
 * Structured in-memory and local storage backed repository for evidence provenance,
 * with fast indexing, keyword filtering, stance filtering, and vector upgrade hooks.
 */

import { EvidenceItem } from '../types';

export interface StoredEvidenceRecord extends EvidenceItem {
  indexedAt: string;
  tags?: string[];
  vectorEmbedding?: number[]; // Reserved for vector database upgrade
}

export class EvidenceStore {
  private static instance: EvidenceStore;
  private records: Map<string, StoredEvidenceRecord> = new Map();

  private constructor() {}

  public static getInstance(): EvidenceStore {
    if (!EvidenceStore.instance) {
      EvidenceStore.instance = new EvidenceStore();
    }
    return EvidenceStore.instance;
  }

  public storeEvidence(items: EvidenceItem[]): void {
    const now = new Date().toISOString();
    items.forEach(item => {
      this.records.set(item.id, {
        ...item,
        indexedAt: now
      });
    });
  }

  public getAll(): StoredEvidenceRecord[] {
    return Array.from(this.records.values());
  }

  public getBySubclaim(subclaimId: string): StoredEvidenceRecord[] {
    return this.getAll().filter(r => r.relatedSubclaimId === subclaimId);
  }

  public getByStance(stance: EvidenceItem['stance']): StoredEvidenceRecord[] {
    return this.getAll().filter(r => r.stance === stance);
  }

  public search(query: string): StoredEvidenceRecord[] {
    const q = query.toLowerCase();
    return this.getAll().filter(r => 
      r.excerpt.toLowerCase().includes(q) ||
      r.source.title.toLowerCase().includes(q) ||
      r.source.publisher.toLowerCase().includes(q) ||
      r.subclaimText.toLowerCase().includes(q)
    );
  }

  public clear(): void {
    this.records.clear();
  }

  public exportJson(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }
}

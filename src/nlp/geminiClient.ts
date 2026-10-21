/**
 * Centralized Gemini Client Utility for ARGUS
 * Provides high-speed, timeout-protected, and rate-limit/demand aware model calls.
 */

import { GoogleGenAI, GenerateContentConfig } from '@google/genai';
import fs from 'fs';
import path from 'path';

export const GEMINI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_TIMEOUT_MS = 2500;

const RATE_LIMIT_FILE = path.join(process.cwd(), '.rate_limit.json');

// Dynamic backoff tracker for 429 (rate-limit) or 503 (model demand spike)
let backoffUntil = 0;
try {
  if (fs.existsSync(RATE_LIMIT_FILE)) {
    const data = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf8'));
    if (data.backoffUntil && typeof data.backoffUntil === 'number' && data.backoffUntil > Date.now()) {
      backoffUntil = data.backoffUntil;
    }
  }
} catch (e) {
  // Ignore filesystem read errors
}

export function isInBackoff(): boolean {
  return Date.now() < backoffUntil;
}

export function markBackoff(durationMs: number = 30000): void {
  backoffUntil = Math.max(backoffUntil, Date.now() + durationMs);
  try {
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify({ backoffUntil }), 'utf8');
  } catch (e) {
    // Ignore filesystem write errors
  }
}

function handleApiError(err: any): void {
  const msg = (err?.message || '') + JSON.stringify(err || '');
  if (msg.includes('PerDay') || msg.includes('daily') || msg.includes('21h') || msg.includes('774') || msg.includes('limit: 20')) {
    // Daily quota exhaustion - avoid calling API for 1 hour
    markBackoff(3600 * 1000);
    console.warn('[ARGUS Gemini Gateway] Daily quota limit reached (20 RPD). Switching to deterministic NLP engine.');
  } else if (err?.status === 429 || err?.status === 503 || msg.includes('429') || msg.includes('503') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('demand')) {
    // Minute rate-limit (5 RPM) or demand spike
    markBackoff(30000);
    console.warn('[ARGUS Gemini Gateway] Temporary rate-limit / demand spike. Switching to deterministic NLP engine for 30s.');
  }
}

/**
 * Execute Gemini model call with timeout protection and upstream status awareness
 */
export async function callGeminiWithTimeout(
  apiKey: string,
  prompt: string,
  config?: GenerateContentConfig,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string> {
  if (isInBackoff()) {
    throw new Error('Gemini API currently in rate-limit backoff. Fast deterministic engine engaged.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const apiPromise = (async () => {
    try {
      const res = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config
      });
      return res.text || '';
    } catch (err: any) {
      handleApiError(err);
      throw err;
    }
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (typeof (timer as any)?.unref === 'function') {
      (timer as any).unref();
    }
  });

  return await Promise.race([apiPromise, timeoutPromise]);
}

/**
 * Execute Gemini model call returning full response (e.g. for grounding chunks)
 */
export async function callGeminiFullResponseWithTimeout(
  apiKey: string,
  prompt: string,
  config?: GenerateContentConfig,
  timeoutMs: number = 3000
) {
  if (isInBackoff()) {
    throw new Error('Gemini API currently in rate-limit backoff. Curated corpus engaged.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const apiPromise = (async () => {
    try {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config
      });
    } catch (err: any) {
      handleApiError(err);
      throw err;
    }
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (typeof (timer as any)?.unref === 'function') {
      (timer as any).unref();
    }
  });

  return await Promise.race([apiPromise, timeoutPromise]);
}

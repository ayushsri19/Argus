/**
 * ARGUS Named Entity Recognition & Linguistic Feature Extractor
 * Deterministic pattern-based & heuristic entity recognizer.
 */

import { Entity } from '../types';

const CHEMICAL_PATTERNS = [
  /\b(caffeine|nicotine|aspirin|melatonin|dopamine|serotonin|cortisol|insulin|glucose|vaccine|mrna|antibiotic|fluoride|carbon\s+dioxide|methane|aspartame)\b/gi,
  /\b([a-z]+ine|[a-z]+ol|[a-z]+ide|[a-z]+ate|[a-z]+ic\s+acid)\b/gi
];

const ORG_PATTERNS = [
  /\b(who|cdc|fda|nih|nasa|ipcc|mit|harvard|oxford|stanford|un|unesco|european\s+commission|world\s+bank|imf|pfizer|moderna|google|meta|openai|microsoft)\b/gi,
  /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:University|Institute|Association|Organization|Agency|Administration|Commission|Center|Hospital|Department))\b/g
];

const QUANTITY_PATTERNS = [
  /\b(\d+(?:\.\d+)?\s*(?:%|percent|percentage\s+points?|hours?|mins?|minutes?|mg|grams?|kg|liters?|ml|ppm|billion|million|trillion|dollars?|\$|fold))\b/gi,
  /\b((?:more\s+than|less\s+than|approximately|nearly|around|over|under)\s+\d+(?:\.\d+)?)\b/gi
];

const DATE_PATTERNS = [
  /\b((?:19|20)\d{2})\b/g,
  /\b(in\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(?:19|20)\d{2})\b/gi,
  /\b(during\s+the\s+(?:19th|20th|21st)\s+century)\b/gi
];

const GPE_PATTERNS = [
  /\b(united\s+states|usa|us|united\s+kingdom|uk|china|india|germany|france|japan|canada|australia|brazil|russia|europe|asia|africa|antarctica|arctic)\b/gi
];

export const CAUSAL_VERBS = [
  'causes', 'cause', 'caused', 'causing',
  'improves', 'improve', 'improved', 'improving',
  'reduces', 'reduce', 'reduced', 'reducing',
  'prevents', 'prevent', 'prevented', 'preventing',
  'cures', 'cure', 'cured', 'curing',
  'triggers', 'trigger', 'triggered', 'triggering',
  'leads to', 'led to', 'leading to',
  'results in', 'resulted in', 'resulting in',
  'boosts', 'boost', 'boosted', 'boosting',
  'enhances', 'enhance', 'enhanced', 'enhancing',
  'destroys', 'destroy', 'destroyed', 'destroying'
];

export const UNIVERSAL_QUALIFIERS = [
  'always', 'never', 'universally', '100%', 'every', 'all', 'completely', 'proven', 'guaranteed'
];

export const HEDGING_QUALIFIERS = [
  'may', 'might', 'can', 'suggests', 'indicates', 'associated with', 'correlated with', 'some', 'partially', 'potentially'
];

export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  const seen = new Set<string>();

  const addEntity = (entityText: string, type: Entity['type']) => {
    const norm = entityText.trim().toLowerCase();
    if (!seen.has(norm) && norm.length > 2) {
      seen.add(norm);
      entities.push({
        text: entityText.trim(),
        type,
        salience: 0.8
      });
    }
  };

  // 1. Chemicals / Substances
  for (const regex of CHEMICAL_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity(match[0], 'CHEMICAL');
    }
  }

  // 2. Quantities
  for (const regex of QUANTITY_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity(match[0], 'QUANTITY');
    }
  }

  // 3. Dates
  for (const regex of DATE_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity(match[0], 'DATE');
    }
  }

  // 4. Organizations
  for (const regex of ORG_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity(match[0], 'ORG');
    }
  }

  // 5. Locations (GPE)
  for (const regex of GPE_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity(match[0], 'GPE');
    }
  }

  // Capitalized multi-word phrases as proper names / concepts if not already matched
  const capitalizedRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  let capMatch;
  while ((capMatch = capitalizedRegex.exec(text)) !== null) {
    if (!seen.has(capMatch[0].toLowerCase())) {
      addEntity(capMatch[0], 'CONCEPT');
    }
  }

  return entities;
}

export function detectCausalAssertion(text: string): { cause: string; effect: string; verb: string } | null {
  const lower = text.toLowerCase();
  for (const verb of CAUSAL_VERBS) {
    const idx = lower.indexOf(verb);
    if (idx !== -1) {
      const cause = text.slice(0, idx).trim();
      const effect = text.slice(idx + verb.length).trim();
      if (cause.length > 2 && effect.length > 2) {
        return { cause, effect, verb };
      }
    }
  }
  return null;
}

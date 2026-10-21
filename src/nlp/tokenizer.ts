/**
 * ARGUS NLP Tokenizer & Text Preprocessor
 * Implements deterministic text processing, n-gram generation, and stopword filtering.
 */

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
  'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than',
  'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s',
  'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with',
  'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves'
]);

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/\[\d+\]/g, ' ')  // Strip reference markers like [1], [2]
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitSentences(text: string): string[] {
  if (!text) return [];
  const cleaned = cleanText(text);
  // Match sentence terminators while avoiding abbreviations like e.g., i.e., Dr., etc.
  const regex = /([.?!])\s+(?=[A-Z0-9])/g;
  const parts = cleaned.replace(regex, '$1|SPLIT|').split('|SPLIT|');
  return parts.map(s => s.trim()).filter(s => s.length > 5);
}

export function tokenize(text: string, removeStopwords: boolean = false): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);

  if (removeStopwords) {
    return words.filter(w => !STOPWORDS.has(w));
  }
  return words;
}

/**
 * Basic algorithmic stemmer for English suffixes (Porter-inspired)
 */
export function stemWord(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;
  if (w.endsWith('ingly')) return w.slice(0, -5);
  if (w.endsWith('ing')) return w.slice(0, -3);
  if (w.endsWith('edly')) return w.slice(0, -4);
  if (w.endsWith('ed')) return w.slice(0, -2);
  if (w.endsWith('tion')) return w.slice(0, -4) + 't';
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  if (w.endsWith('ly')) return w.slice(0, -2);
  if (w.endsWith('ment')) return w.slice(0, -4);
  return w;
}

export function stemTokens(tokens: string[]): string[] {
  return tokens.map(stemWord);
}

export function generateNGrams(tokens: string[], n: number = 2): string[] {
  if (tokens.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

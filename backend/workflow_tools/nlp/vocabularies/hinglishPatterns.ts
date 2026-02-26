/**
 * Hinglish Code-Switching Patterns
 * Natural Hindi-English mixing rules
 */

export const HINGLISH_WORDS = [
  'yaar', 'dekho', 'samjhe', 'bas', 'achha', 'theek hai',
  'arre', 'kya', 'hai', 'na', 'bhai', 'sahi', 'bilkul'
];

export const HINGLISH_PATTERNS = {
  greeting: ['Arre yaar', 'Dekho', 'Suno'],
  confirmation: ['samjhe?', 'theek hai?', 'na?', 'hai na?'],
  emphasis: ['bilkul', 'ekdum', 'sahi mein'],
  closing: ['Bas itna hi', 'Samjh gaye?', 'Simple hai']
};

export const CONVERSATIONAL_MARKERS = {
  start: ['Let me tell you', 'Listen', 'You know what'],
  middle: ['basically', 'actually', 'you see'],
  end: ['that\'s it', 'simple', 'got it?']
};

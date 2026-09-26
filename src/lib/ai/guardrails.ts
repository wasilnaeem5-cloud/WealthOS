export interface GuardrailValidationResult {
  isValid: boolean;
  sanitizedContent: string;
  violations: string[];
}

const FORBIDDEN_PHRASES = [
  'guaranteed return',
  'guaranteed profit',
  'buy this stock',
  'sell your holdings',
  'crypto trading',
  'insider tip',
];

/**
 * Validates AI responses against guardrail safety rules.
 */
export function validateAIResponse(response: string): GuardrailValidationResult {
  const lower = response.toLowerCase();
  const violations: string[] = [];

  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      violations.push(`Response contains forbidden phrase: "${phrase}"`);
    }
  }

  let sanitized = response;
  if (violations.length > 0) {
    sanitized += '\n\n*Note: WealthOS projections are educational estimates based on assumptions, not guaranteed investment outcomes or brokerage instructions.*';
  }

  return {
    isValid: violations.length === 0,
    sanitizedContent: sanitized,
    violations,
  };
}

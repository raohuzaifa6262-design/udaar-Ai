/**
 * Roman Urdu Transaction Parser for UdhaarAI
 * 
 * This module extracts customerName, amount, and transactionType ('udhaar' | 'payment')
 * from natural Roman Urdu transaction texts entered by shopkeepers.
 */

export type TransactionType = 'udhaar' | 'payment';

export interface ParseResultSuccess {
  success: true;
  customerName: string;
  amount: number;
  transactionType: TransactionType;
  matchedPattern: string;
}

export interface ParseResultError {
  success: false;
  error: string;
  rawInput: string;
}

export type ParseResult = ParseResultSuccess | ParseResultError;

interface ParsingRule {
  name: string;
  pattern: RegExp;
  type: TransactionType;
}

/**
 * Array of predefined Roman Urdu transaction patterns.
 * Using case-insensitive regex rules with capturing groups:
 * - Group 1: Customer Name
 * - Group 2: Amount (digits)
 */
const PARSING_RULES: ParsingRule[] = [
  // 1. Ahmed ne 1000 wapas diye / wapas / wapis / wapsi / wps
  {
    name: 'Payment (Wapas Diye)',
    pattern: /^([a-z\s]+?)\s+(?:ne|se|nay)\s+(\d+)\s+(?:wapas|wapis|wapsi|wps)\s*(?:diye|diya|deya|deye|dya|kiya|kiye)?$/i,
    type: 'payment',
  },
  // 2. Rashid se 3000 mile / mila / milay / received
  {
    name: 'Payment (Mile)',
    pattern: /^([a-z\s]+?)\s+(?:se|ne|nay)\s+(\d+)\s+(?:mile|mila|milay|mille|received|recieved)$/i,
    type: 'payment',
  },
  // 3. Ali ko 2500 udhaar diya / udhar / udaar / udhaari
  {
    name: 'Udhaar (Diya)',
    pattern: /^([a-z\s]+?)\s+(?:ko|ne|nay)\s+(\d+)\s+(?:udhaar|udhar|udaar|udhaari)\s*(?:diya|diye|dya|deya|deye)?$/i,
    type: 'udhaar',
  },
  // 4. Bilal ko 500 baki / baqi / balance
  {
    name: 'Udhaar (Baki)',
    pattern: /^([a-z\s]+?)\s+(?:ko)\s+(\d+)\s+(?:baki|baqi|balance)$/i,
    type: 'udhaar',
  },
  // 5. Ali ko 2500 diya (implied udhaar)
  {
    name: 'Udhaar (Diya Implied)',
    pattern: /^([a-z\s]+?)\s+(?:ko|ne|nay)\s+(\d+)\s+(?:diya|diye|dya|deya|deye)$/i,
    type: 'udhaar',
  },
  // 6. Ali ko 2500 udhaar (implied diya)
  {
    name: 'Udhaar (Implied)',
    pattern: /^([a-z\s]+?)\s+(?:ko|ne|nay)\s+(\d+)\s+(?:udhaar|udhar|udaar|udhaari)$/i,
    type: 'udhaar',
  }
];

/**
 * Normalizes input string by trimming, removing excessive whitespace,
 * and cleaning common abbreviations or typos.
 */
function normalizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
}

/**
 * Capitalizes each word in the customer's name for neatness.
 */
function formatCustomerName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parses Roman Urdu transaction text.
 * 
 * @param input The raw input text entered by the user
 * @returns ParseResult indicating success or failure with extracted details
 * 
 * @example
 * parseTransaction("Ali ko 2500 udhaar diya")
 * // returns { success: true, customerName: "Ali", amount: 2500, transactionType: "udhaar", matchedPattern: "Udhaar (Diya)" }
 * 
 * @example
 * parseTransaction("Ahmed ne 1000 wapas diye")
 * // returns { success: true, customerName: "Ahmed", amount: 1000, transactionType: "payment", matchedPattern: "Payment (Wapas Diye)" }
 */
export function parseTransaction(input: string): ParseResult {
  if (!input || input.trim() === '') {
    return {
      success: false,
      error: 'Input text cannot be empty.',
      rawInput: input || '',
    };
  }

  const normalized = normalizeInput(input);

  // Iterate over matching rules
  for (const rule of PARSING_RULES) {
    const match = normalized.match(rule.pattern);
    if (match) {
      const rawName = match[1];
      const rawAmount = match[2];

      const customerName = formatCustomerName(rawName);
      const amount = parseInt(rawAmount, 10);

      // Validation check
      if (isNaN(amount) || amount <= 0) {
        return {
          success: false,
          error: `Parsed amount is invalid: "${rawAmount}". Amount must be a positive number.`,
          rawInput: input,
        };
      }

      if (!customerName) {
        return {
          success: false,
          error: 'Parsed customer name is empty.',
          rawInput: input,
        };
      }

      return {
        success: true,
        customerName,
        amount,
        transactionType: rule.type,
        matchedPattern: rule.name,
      };
    }
  }

  // Error case: None of the rules matched
  return {
    success: false,
    error: 'Unrecognized Roman Urdu transaction format. Please use patterns like "Ali ko 2500 udhaar diya" or "Ahmed ne 1000 wapas".',
    rawInput: input,
  };
}

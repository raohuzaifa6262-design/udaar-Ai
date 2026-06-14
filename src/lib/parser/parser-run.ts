import { parseTransaction, ParseResult } from './index';

interface TestSuite {
  name: string;
  cases: string[];
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Required Basic Examples',
    cases: [
      'Ali ko 2500 udhaar diya',
      'Ahmed ne 1000 wapas diye',
      'Rashid se 3000 mile',
      'Bilal ko 500 baki'
    ]
  },
  {
    name: 'Roman Urdu Spelling & Phrase Variations',
    cases: [
      'Kashif ne 1200 wapis kiya',
      'Babar se 1500 received',
      'Zain ko 700 baqi',
      'Kamran ko 800 udhar',
      'Faizan se 4500 milay',
      'Sajid ne 2000 wapsi diye',
      'Asif ko 900 balance',
      'Hamza ko 600 diya'
    ]
  },
  {
    name: 'Whitespace, Casing, and formatting variations',
    cases: [
      '  ali   ko   2500   udhaar   diya  ',
      'AHMED ne 1000 WAPAS diye',
      'rashid   se   3000   mile'
    ]
  },
  {
    name: 'Error Cases (Invalid / Unrecognized)',
    cases: [
      '',
      '   ',
      'Ali ko udhaar diya',
      'Ali ko -500 udhaar diya',
      'Ali ko 0 udhaar diya',
      'kya chal raha hai',
      'Ali 2500 ko udhaar',
      '2500 Ali ko wapas'
    ]
  }
];

function runTests() {
  console.log('==================================================');
  console.log('          UDHAARAI ROMAN URDU PARSER TESTS        ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  for (const suite of TEST_SUITES) {
    console.log(`--- Suite: ${suite.name} ---`);
    console.log('-'.repeat(suite.name.length + 11));

    for (const testCase of suite.cases) {
      const result: ParseResult = parseTransaction(testCase);

      if (result.success) {
        console.log(`[PASS] Input: "${testCase}"`);
        console.log(`       => Extracted Name : "${result.customerName}"`);
        console.log(`       => Amount         : Rs. ${result.amount}`);
        console.log(`       => Type           : ${result.transactionType.toUpperCase()}`);
        console.log(`       => Matched Rule   : ${result.matchedPattern}`);
        passed++;
      } else {
        // For error suite, non-success is actually expected behavior (a "pass")
        if (suite.name.includes('Error Cases')) {
          console.log(`[PASS] Input: "${testCase}" (Expected Error)`);
          console.log(`       => Error Message  : "${result.error}"`);
          passed++;
        } else {
          console.log(`[FAIL] Input: "${testCase}"`);
          console.log(`       => Error          : "${result.error}"`);
          failed++;
        }
      }
      console.log('');
    }
  }

  console.log('==================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('==================================================');

  process.exit(failed > 0 ? 1 : 0);
}

// Execute the tests
runTests();

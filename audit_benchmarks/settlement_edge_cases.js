const { calculateBalances, calculateSettlements } = require('D:/wiselySplit/wiselySplit/server/src/services/settlementService');

console.log('--- Probing Edge Cases & Correctness Vulnerabilities in settlementService ---');

// Edge Case 1: Unequal split / Floating point inaccuracy leading to sum(balances) != 0
// If expenses have un-normalized floating point splits:
const members1 = [
  { memberId: 'm1', name: 'Alice' },
  { memberId: 'm2', name: 'Bob' },
  { memberId: 'm3', name: 'Charlie' }
];

// Suppose an expense of 100 is split as 33.33, 33.33, 33.33 (total 99.99, 1 paise lost)
const expenses1 = [
  {
    amount: 100,
    paidBy: 'm1',
    splitBetween: [
      { memberId: 'm1', amount: 33.33 },
      { memberId: 'm2', amount: 33.33 },
      { memberId: 'm3', amount: 33.33 },
    ]
  }
];

const balances1 = calculateBalances(expenses1, members1, []);
console.log('Edge Case 1 (1 paise lost in split inputs):');
console.log('Balances:', balances1);
const settlements1 = calculateSettlements(balances1, members1);
console.log('Settlements:', settlements1);
const totalPaid1 = settlements1.reduce((sum, s) => sum + s.amount, 0);
console.log('Total settled:', totalPaid1, 'vs Alice balance:', balances1['m1']);

// Edge Case 2: Rounding threshold (Math.abs(rounded) < 0.01 ? 0 : rounded)
// If someone owes 0.004, it becomes 0.
// If someone owes 0.006, it rounds to 0.01.
console.log('\nEdge Case 2 (Sub-paise rounding):');
const expenses2 = [
  {
    amount: 10,
    paidBy: 'm1',
    splitBetween: [
      { memberId: 'm1', amount: 9.994 },
      { memberId: 'm2', amount: 0.006 },
    ]
  }
];
const balances2 = calculateBalances(expenses2, [members1[0], members1[1]], []);
console.log('Balances:', balances2);

// Edge Case 3: Paid settlements exceeding balance
console.log('\nEdge Case 3 (Overpaid settlement):');
const paidSettlements3 = [
  {
    from: { memberId: 'm2', name: 'Bob' },
    to: { memberId: 'm1', name: 'Alice' },
    amount: 50
  }
];
const balances3 = calculateBalances(expenses1, members1, paidSettlements3);
console.log('Balances after paying ₹50 on ₹33.33 debt:', balances3);
const settlements3 = calculateSettlements(balances3, members1);
console.log('Settlements after overpayment:', settlements3);

// Edge Case 4: Non-existent member in expenses
console.log('\nEdge Case 4 (Ghost member in expense):');
const expenses4 = [
  {
    amount: 100,
    paidBy: 'm_ghost',
    splitBetween: [
      { memberId: 'm1', amount: 50 },
      { memberId: 'm2', amount: 50 },
    ]
  }
];
const balances4 = calculateBalances(expenses4, members1, []);
console.log('Balances with ghost payer:', balances4);

// Edge Case 5: Zero balance / perfectly balanced group
console.log('\nEdge Case 5 (All zero balances):');
const balances5 = { m1: 0, m2: 0, m3: 0 };
const settlements5 = calculateSettlements(balances5, members1);
console.log('Settlements for zero balances:', settlements5);


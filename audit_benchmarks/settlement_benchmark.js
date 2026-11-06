const path = require('path');
const { calculateBalances, calculateSettlements } = require('D:/wiselySplit/wiselySplit/server/src/services/settlementService');

// Replicate the project's exact equal split function from expenseController.js
const createEqualSplit = (amount, members) => {
  const amountInPaise = Math.round(Number(amount) * 100);
  const baseShare = Math.floor(amountInPaise / members.length);
  const remainder = amountInPaise % members.length;

  return members.map((member, index) => ({
    memberId: member.memberId,
    amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
  }));
};

function runSettlementBenchmark() {
  console.log('================================================================');
  console.log('       WISELYSPLIT SETTLEMENT SIMPLIFICATION BENCHMARK          ');
  console.log('================================================================');
  console.log('Configuration: 100 random test groups, 10 members, 50 expenses each');
  console.log('Using ACTUAL project settlementService implementation.\n');

  const TOTAL_GROUPS = 100;
  const MEMBERS_PER_GROUP = 10;
  const EXPENSES_PER_GROUP = 50;

  const results = [];
  let totalRawTransactions = 0;
  let totalPairwiseTransactions = 0;
  let totalSimplifiedTransactions = 0;

  let totalMoneyOwedAll = 0;
  let totalMoneyReceivedAll = 0;
  let totalSettlementAmountAll = 0;

  const correctnessIssues = [];

  for (let g = 1; g <= TOTAL_GROUPS; g++) {
    // 1. Generate 10 members
    const members = [];
    for (let m = 0; m < MEMBERS_PER_GROUP; m++) {
      members.push({
        memberId: `mem_${g}_${m + 1}`,
        name: `Member ${m + 1}`,
      });
    }

    // 2. Generate 50 expenses
    const expenses = [];
    let groupRawTransactions = 0;

    // Track pairwise raw debts to compute bilateral debts before simplification
    const pairwiseMatrix = {};
    members.forEach(m1 => {
      pairwiseMatrix[m1.memberId] = {};
      members.forEach(m2 => {
        pairwiseMatrix[m1.memberId][m2.memberId] = 0;
      });
    });

    for (let e = 1; e <= EXPENSES_PER_GROUP; e++) {
      // Random payer
      const payerIndex = Math.floor(Math.random() * members.length);
      const paidBy = members[payerIndex].memberId;

      // Random amount between 50.00 and 5000.00 with 2 decimal places
      const rawAmount = (Math.random() * 4950 + 50);
      const amount = Math.round(rawAmount * 100) / 100;

      // Expense can be split among all members or a subset (>= 2 members)
      // 70% of expenses split among all members, 30% split among a random subset of 2-8 members
      let splitMembers = members;
      if (Math.random() < 0.3) {
        const subsetSize = Math.floor(Math.random() * 7) + 2; // 2 to 8 members
        const shuffled = [...members].sort(() => Math.random() - 0.5);
        // Ensure payer is included
        const subset = shuffled.slice(0, subsetSize);
        if (!subset.some(m => m.memberId === paidBy)) {
          subset[0] = members[payerIndex];
        }
        splitMembers = subset;
      }

      const splitBetween = createEqualSplit(amount, splitMembers);

      // Verify that split sum matches expense amount exactly
      const splitSumPaise = splitBetween.reduce((sum, s) => sum + Math.round(s.amount * 100), 0);
      if (splitSumPaise !== Math.round(amount * 100)) {
        correctnessIssues.push({
          group: g,
          expense: e,
          issue: `Split sum ${splitSumPaise / 100} does not equal expense total ${amount}`,
        });
      }

      // Count individual debt obligations created by this expense
      splitBetween.forEach(split => {
        if (split.memberId !== paidBy) {
          groupRawTransactions++;
          pairwiseMatrix[split.memberId][paidBy] += split.amount;
        }
      });

      expenses.push({
        _id: `exp_${g}_${e}`,
        description: `Expense ${e} in group ${g}`,
        amount,
        currency: 'INR',
        paidBy,
        splitType: 'EQUAL',
        splitBetween,
      });
    }

    // Calculate pairwise net transactions before multi-party simplification
    let groupPairwiseTransactions = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const id1 = members[i].memberId;
        const id2 = members[j].memberId;
        const netPaise = Math.round((pairwiseMatrix[id1][id2] - pairwiseMatrix[id2][id1]) * 100);
        if (Math.abs(netPaise) >= 1) {
          groupPairwiseTransactions++;
        }
      }
    }

    // 3. Execute actual calculateBalances
    const balances = calculateBalances(expenses, members, []);

    // Verify balances
    let sumCreditorsPaise = 0;
    let sumDebtorsPaise = 0;
    let netBalancePaise = 0;

    members.forEach(m => {
      const b = balances[m.memberId] || 0;
      const bPaise = Math.round(b * 100);
      netBalancePaise += bPaise;
      if (bPaise > 0) sumCreditorsPaise += bPaise;
      if (bPaise < 0) sumDebtorsPaise += Math.abs(bPaise);
    });

    const moneyOwed = sumDebtorsPaise / 100;
    const moneyReceived = sumCreditorsPaise / 100;

    if (sumCreditorsPaise !== sumDebtorsPaise) {
      correctnessIssues.push({
        group: g,
        issue: `Balance asymmetry: Creditors expect ₹${moneyReceived}, but Debtors owe ₹${moneyOwed}. Discrepancy: ₹${(sumCreditorsPaise - sumDebtorsPaise) / 100}`,
      });
    }

    // 4. Execute actual calculateSettlements
    const settlements = calculateSettlements(balances, members);
    const groupSimplifiedTransactions = settlements.length;

    // Verify settlements correctness
    let settlementTotalPaise = 0;
    const memberNetSettledPaise = {};
    members.forEach(m => { memberNetSettledPaise[m.memberId] = 0; });

    const seenPairs = new Set();
    let hasDuplicate = false;

    settlements.forEach((s, idx) => {
      const sPaise = Math.round(s.amount * 100);
      settlementTotalPaise += sPaise;

      // Check positive amount
      if (s.amount <= 0) {
        correctnessIssues.push({ group: g, issue: `Non-positive settlement amount ₹${s.amount}` });
      }

      // Check self-payment
      if (s.from.memberId === s.to.memberId) {
        correctnessIssues.push({ group: g, issue: `Self settlement detected for ${s.from.memberId}` });
      }

      // Check duplicate settlement pair
      const pairKey = `${s.from.memberId}->${s.to.memberId}`;
      if (seenPairs.has(pairKey)) {
        hasDuplicate = true;
        correctnessIssues.push({ group: g, issue: `Duplicate settlement pair: ${pairKey}` });
      }
      seenPairs.add(pairKey);

      // Track net flow
      memberNetSettledPaise[s.from.memberId] -= sPaise;
      memberNetSettledPaise[s.to.memberId] += sPaise;
    });

    // Check if each member's net settlement exactly equals their balance
    let allBalancesMatch = true;
    members.forEach(m => {
      const expectedPaise = Math.round((balances[m.memberId] || 0) * 100);
      const actualPaise = memberNetSettledPaise[m.memberId] || 0;
      if (expectedPaise !== actualPaise) {
        allBalancesMatch = false;
        correctnessIssues.push({
          group: g,
          issue: `Member ${m.name} (${m.memberId}) expected net settlement ${expectedPaise / 100}, but got ${actualPaise / 100}`,
        });
      }
    });

    // Total settlement sum comparison
    const settlementSum = settlementTotalPaise / 100;
    if (settlementTotalPaise !== sumDebtorsPaise) {
      correctnessIssues.push({
        group: g,
        issue: `Total settlement sum ₹${settlementSum} does not match total debt ₹${moneyOwed}`,
      });
    }

    const rawReductionPct = ((groupRawTransactions - groupSimplifiedTransactions) / groupRawTransactions) * 100;
    const pairwiseReductionPct = groupPairwiseTransactions > 0
      ? ((groupPairwiseTransactions - groupSimplifiedTransactions) / groupPairwiseTransactions) * 100
      : 0;

    totalRawTransactions += groupRawTransactions;
    totalPairwiseTransactions += groupPairwiseTransactions;
    totalSimplifiedTransactions += groupSimplifiedTransactions;

    totalMoneyOwedAll += moneyOwed;
    totalMoneyReceivedAll += moneyReceived;
    totalSettlementAmountAll += settlementSum;

    results.push({
      group: g,
      rawTransactions: groupRawTransactions,
      pairwiseTransactions: groupPairwiseTransactions,
      simplifiedTransactions: groupSimplifiedTransactions,
      moneyOwed,
      moneyReceived,
      settlementSum,
      rawReductionPct,
      pairwiseReductionPct,
      allBalancesMatch,
      hasDuplicate,
    });
  }

  // Averages
  const avgRaw = totalRawTransactions / TOTAL_GROUPS;
  const avgPairwise = totalPairwiseTransactions / TOTAL_GROUPS;
  const avgSimplified = totalSimplifiedTransactions / TOTAL_GROUPS;
  const avgRawReduction = ((avgRaw - avgSimplified) / avgRaw) * 100;
  const avgPairwiseReduction = ((avgPairwise - avgSimplified) / avgPairwise) * 100;

  console.log('----------------------------------------------------------------');
  console.log('BENCHMARK SUMMARY RESULTS:');
  console.log('----------------------------------------------------------------');
  console.log(`Total Test Groups                  : ${TOTAL_GROUPS}`);
  console.log(`Members per Group                  : ${MEMBERS_PER_GROUP}`);
  console.log(`Expenses per Group                 : ${EXPENSES_PER_GROUP}`);
  console.log(`Total Expenses Evaluated           : ${TOTAL_GROUPS * EXPENSES_PER_GROUP}`);
  console.log('----------------------------------------------------------------');
  console.log(`Average Raw Transactions / Group   : ${avgRaw.toFixed(2)}`);
  console.log(`Average Pairwise Debts / Group     : ${avgPairwise.toFixed(2)}`);
  console.log(`Average Simplified Transactions    : ${avgSimplified.toFixed(2)}`);
  console.log(`Average Reduction vs Raw Expenses  : ${avgRawReduction.toFixed(2)}%`);
  console.log(`Average Reduction vs Pairwise Net  : ${avgPairwiseReduction.toFixed(2)}%`);
  console.log('----------------------------------------------------------------');
  console.log(`Total Money Owed Across 100 Groups : ₹${totalMoneyOwedAll.toFixed(2)}`);
  console.log(`Total Money Received Across 100 Grp: ₹${totalMoneyReceivedAll.toFixed(2)}`);
  console.log(`Total Settlement Transactions Sum  : ₹${totalSettlementAmountAll.toFixed(2)}`);
  console.log(`Net Conservation Check (Owed-Rcvd) : ₹${(totalMoneyOwedAll - totalMoneyReceivedAll).toFixed(4)}`);
  console.log(`Conservation Check (Owed-Settled)  : ₹${(totalMoneyOwedAll - totalSettlementAmountAll).toFixed(4)}`);
  console.log('----------------------------------------------------------------');
  console.log(`Correctness Issues / Invariants Log: ${correctnessIssues.length} issues found`);
  if (correctnessIssues.length > 0) {
    console.log('Sample Issues:');
    correctnessIssues.slice(0, 10).forEach(issue => console.log('  -', JSON.stringify(issue)));
  } else {
    console.log('All 100 groups satisfied conservation of money and exact balance matching!');
  }
  console.log('================================================================\n');

  return {
    totalGroups: TOTAL_GROUPS,
    avgRaw,
    avgPairwise,
    avgSimplified,
    avgRawReduction,
    avgPairwiseReduction,
    totalMoneyOwedAll,
    totalMoneyReceivedAll,
    totalSettlementAmountAll,
    correctnessIssues,
    resultsSummary: {
      minSimplified: Math.min(...results.map(r => r.simplifiedTransactions)),
      maxSimplified: Math.max(...results.map(r => r.simplifiedTransactions)),
    }
  };
}

if (require.main === module) {
  runSettlementBenchmark();
}

module.exports = { runSettlementBenchmark };


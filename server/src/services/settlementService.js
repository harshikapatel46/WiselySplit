const calculateBalances = (expenses, members, paidSettlements = []) => {
  const balances = {};

  members.forEach((member) => {
    balances[member.memberId] = 0;
  });

  // Calculate balances from expenses
  expenses.forEach((expense) => {
    if (balances[expense.paidBy] !== undefined) {
      balances[expense.paidBy] += Number(expense.amount);
    }

    expense.splitBetween.forEach((split) => {
      if (balances[split.memberId] !== undefined) {
        balances[split.memberId] -= Number(split.amount);
      }
    });
  });

  // Apply already-paid settlements
  paidSettlements.forEach((settlement) => {
    const fromId = settlement.from.memberId;
    const toId = settlement.to.memberId;
    const amount = Number(settlement.amount);

    // Debtor has paid -> reduce their debt (increase balance towards 0)
    if (balances[fromId] !== undefined) {
      balances[fromId] += amount;
    }

    // Creditor has received -> reduce their credit (decrease balance towards 0)
    if (balances[toId] !== undefined) {
      balances[toId] -= amount;
    }
  });

  // Normalize balances to 2 decimal places (paise) and eliminate -0 or amounts < ₹0.01
  Object.keys(balances).forEach((memberId) => {
    const rounded = Math.round(balances[memberId] * 100) / 100;
    balances[memberId] = Math.abs(rounded) < 0.01 ? 0 : rounded;
  });

  return balances;
};

const calculateSettlements = (balances, members) => {
  const creditors = [];
  const debtors = [];

  members.forEach((member) => {
    const balance = balances[member.memberId] || 0;
    const balanceInPaise = Math.round(balance * 100);

    if (balanceInPaise >= 1) {
      creditors.push({
        memberId: member.memberId,
        name: member.name,
        amountInPaise: balanceInPaise,
      });
    } else if (balanceInPaise <= -1) {
      debtors.push({
        memberId: member.memberId,
        name: member.name,
        amountInPaise: Math.abs(balanceInPaise),
      });
    }
  });

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountInPaise = Math.min(debtor.amountInPaise, creditor.amountInPaise);

    if (amountInPaise >= 1) {
      settlements.push({
        from: {
          memberId: debtor.memberId,
          name: debtor.name,
        },
        to: {
          memberId: creditor.memberId,
          name: creditor.name,
        },
        amount: Number((amountInPaise / 100).toFixed(2)),
      });
    }

    debtor.amountInPaise -= amountInPaise;
    creditor.amountInPaise -= amountInPaise;

    if (debtor.amountInPaise < 1) {
      i++;
    }

    if (creditor.amountInPaise < 1) {
      j++;
    }
  }

  return settlements;
};

module.exports = {
  calculateBalances,
  calculateSettlements,
};
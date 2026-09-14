const calculateBalances = (expenses, members) => {
  const balances = {};

  members.forEach((member) => {
    balances[member.memberId] = 0;
  });

  expenses.forEach((expense) => {
    balances[expense.paidBy] += Number(expense.amount);

    expense.splitBetween.forEach((split) => {
      balances[split.memberId] -= Number(split.amount);
    });
  });
  paidSettlements.forEach((settlement) => {
    const fromId = settlement.from.memberId;
    const toId = settlement.to.memberId;
    const amount = Number(settlement.amount);

    if(balances[fromId] !== undefined) {
      balances[fromId] += amount;
    }
    if ( balances[toId] !== undefined) {
      balances[toId] -= amount;
    }
  } );
  return balances;
};

const calculateSettlements = (balances, members) => {
  const creditors = [];
  const debtors = [];

  members.forEach((member) => {
    const balance = balances[member.memberId];

    if (balance > 0.01) {
      creditors.push({  
        memberId: member.memberId,
        name: member.name,
        amount: balance,
      });
    } else if (balance < -0.01) {
      debtors.push({    
        memberId: member.memberId,
        name: member.name,
        amount: Math.abs(balance),
      });
    }
  });

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: {
        memberId: debtor.memberId,
        name: debtor.name,
      },
      to: {
        memberId: creditor.memberId,
        name: creditor.name,
      },
      amount: Number(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) {
      i++;
    }

    if (creditor.amount < 0.01) {
      j++;
    }
  }

  return settlements;
};
module.exports = {
  calculateBalances,
  calculateSettlements,
};

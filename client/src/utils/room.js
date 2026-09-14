export const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const settlementKey = ({ from, to, amount }) =>
  `${from.memberId}-${to.memberId}-${amount}`;

export const uniqueSettlements = (settlements) =>
  Array.from(
    new Map(
      settlements.map((settlement) => [settlementKey(settlement), settlement]),
    ).values(),
  );

export function buildExpensePayload({
  roomCode,
  description,
  amount,
  paidBy,
  members,
  splitType = "EQUAL",
  exactAmounts = {},
}) {
  const total = Number(amount);
  let splitbetween;

  if (splitType === "EXACT") {
    splitbetween = members.map((member) => ({
      memberId: member.memberId,
      amount: Number(exactAmounts[member.memberId] || 0),
    }));
    const splitTotal = splitbetween.reduce(
      (sum, member) => sum + member.amount,
      0,
    );
    if(Math.abs(splitTotal - total) > 0.01) {
      throw new Error("Exact amounts do not sum up to total amount");
    }
  }else{
    const splitAmount = total / members.length;
    splitbetween = members.map((member) => ({
      memberId: member.memberId,
      amount: Number(splitAmount.toFixed(2)),
    }));  
  }
  return {
    roomCode,
    description: description.trim(),
    amount: total,
    currency: "INR",
    paidBy,
    splitType,
    splitBetween: splitbetween,
  };
}

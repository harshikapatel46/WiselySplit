import { useState } from "react";

const roundCurrency = (value) => Number(value.toFixed(2));

function buildEqualSplit(amount, members) {
  const amountInPaise = Math.round(Number(amount) * 100);
  const baseShare = Math.floor(amountInPaise / members.length);
  const remainder = amountInPaise % members.length;

  return members.map((member, index) => ({
    memberId: member.memberId,
    amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
  }));
}

function buildExpensePayload({
  description,
  amount,
  paidBy,
  members,
  splitType,
  exactAmounts,
  percentageValues,
  shareValues,
}) {
  const total = Number(amount);
  let splitBetween;

  if (splitType === "EQUAL") {
    splitBetween = buildEqualSplit(total, members);
  } else if (splitType === "EXACT") {
    splitBetween = members.map((member) => ({
      memberId: member.memberId,
      amount: Number(exactAmounts[member.memberId] || 0),
    }));
  } else if (splitType === "PERCENTAGE") {
    splitBetween = members.map((member) => ({
      memberId: member.memberId,
      amount: roundCurrency((total * Number(percentageValues[member.memberId] || 0)) / 100),
    }));
  } else {
    const totalShares = members.reduce(
      (sum, member) => sum + Number(shareValues[member.memberId] || 0),
      0,
    );
    splitBetween = members.map((member) => ({
      memberId: member.memberId,
      amount: roundCurrency((total * Number(shareValues[member.memberId] || 0)) / totalShares),
    }));
  }

  const allocated = splitBetween.reduce((sum, split) => sum + split.amount, 0);
  splitBetween[splitBetween.length - 1].amount = roundCurrency(
    splitBetween[splitBetween.length - 1].amount + total - allocated,
  );

  return {
    description: description.trim(),
    amount: total,
    currency: "INR",
    paidBy,
    splitType,
    splitBetween,
  };
}

export default function AddExpenseModal({ roomCode, members, onClose, onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("EQUAL");
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentageValues, setPercentageValues] = useState({});
  const [shareValues, setShareValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const total = Number(amount);
    const exactTotal = members.reduce(
      (sum, member) => sum + Number(exactAmounts[member.memberId] || 0),
      0,
    );
    const percentageTotal = members.reduce(
      (sum, member) => sum + Number(percentageValues[member.memberId] || 0),
      0,
    );
    const totalShares = members.reduce(
      (sum, member) => sum + Number(shareValues[member.memberId] || 0),
      0,
    );

    if (
      !description.trim() ||
      !amount ||
      total <= 0 ||
      !paidBy ||
      !members.length
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (splitType === "EXACT" && Math.abs(exactTotal - total) > 0.01) {
      setError("Exact amounts must add up to the expense total.");
      return;
    }

    if (splitType === "PERCENTAGE" && Math.abs(percentageTotal - 100) > 0.01) {
      setError("Percentages must add up to 100%.");
      return;
    }

    if (splitType === "SHARES" && totalShares <= 0) {
      setError("Enter at least one share.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = buildExpensePayload({
        roomCode,
        description,
        amount,
        paidBy,
        members,
        splitType,
        exactAmounts,
        percentageValues,
        shareValues,
      });

      await onAdd(payload);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  }

  const splitInput = (member, values, setValues, suffix) => (
    <div key={member.memberId} className="flex items-center gap-3">
      <span className="flex-1 font-bold">{member.name}</span>
      <div className="flex w-32">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          value={values[member.memberId] || ""}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [member.memberId]: event.target.value,
            }))
          }
          className="w-full rounded-l-lg border-2 border-r-0 border-black bg-white px-2 py-2 font-bold outline-none focus:bg-[#fff4a8]"
        />
        <span className="flex items-center rounded-r-lg border-2 border-black bg-[#ffd34e] px-3 font-black">
          {suffix}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
    >
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
      <div className="w-full max-w-lg rounded-3xl border-4 border-black bg-[#fffaf0] p-6 shadow-[9px_9px_0_#ff83d8] sm:p-8">
        
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full border-2 border-black bg-[#ffd34e] px-3 py-1 text-xs font-black uppercase">
              New expense
            </span>

            <h2
              id="add-expense-title"
              className="mt-3 text-3xl font-black uppercase"
            >
              Add expense.
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close add expense form"
            className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-black bg-white text-xl font-black shadow-[3px_3px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          
          <div>
            <label
              htmlFor="expense-description"
              className="text-xs font-black uppercase tracking-wider"
            >
              What did you buy?
            </label>

            <input
              id="expense-description"
              type="text"
              placeholder="Dinner, hotel, taxi..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-4 font-bold outline-none placeholder:text-black/30 focus:bg-[#fff4a8]"
              required
            />
          </div>

       
          <div>
            <label
              htmlFor="expense-amount"
              className="text-xs font-black uppercase tracking-wider"
            >
              How much?
            </label>

            <div className="mt-2 flex">
              <span className="flex items-center rounded-l-xl border-[3px] border-r-0 border-black bg-[#ffd34e] px-5 text-xl font-black">
                ₹
              </span>

              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="1200"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-r-xl border-[3px] border-black bg-white px-4 py-4 text-lg font-black outline-none focus:bg-[#fff4a8]"
                required
              />
            </div>
          </div>

         
          <div>
            <label
              htmlFor="expense-payer"
              className="text-xs font-black uppercase tracking-wider"
            >
              Who paid?
            </label>

            <select
              id="expense-payer"
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-4 font-bold outline-none focus:bg-[#fff4a8]"
              required
            >
              <option value="">Select member</option>

              {members.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

        
          <div>
            <label
              htmlFor="split-type"
              className="text-xs font-black uppercase tracking-wider"
            >
              Split type
            </label>

            <select
              id="split-type"
              value={splitType}
              onChange={(event) => setSplitType(event.target.value)}
              className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-4 font-bold outline-none focus:bg-[#fff4a8]"
            >
              <option value="EQUAL">Equal</option>
              <option value="EXACT">Exact amount</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="SHARES">Shares</option>
            </select>
          </div>

          {/* Exact Amount UI */}
          {splitType === "EXACT" && (
            <div className="rounded-2xl border-[3px] border-black bg-[#c8a7ff] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wider">
                Amount for each person
              </p>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.memberId}
                    className="flex items-center gap-3"
                  >
                    <span className="flex-1 font-bold">{member.name}</span>

                    <div className="flex w-32">
                      <span className="flex items-center rounded-l-lg border-2 border-r-0 border-black bg-[#ffd34e] px-3 font-black">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={exactAmounts[member.memberId] || ""}
                        onChange={(event) =>
                          setExactAmounts((previous) => ({
                            ...previous,
                            [member.memberId]: event.target.value,
                          }))
                        }
                        className="w-full rounded-r-lg border-2 border-black bg-white px-2 py-2 font-bold outline-none focus:bg-[#fff4a8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      
          {splitType === "PERCENTAGE" && (
            <div className="rounded-2xl border-[3px] border-black bg-[#ff83d8] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wider">
                Percentage for each person
              </p>
              <div className="space-y-3">
                {members.map((member) =>
                  splitInput(member, percentageValues, setPercentageValues, "%"),
                )}
              </div>
              <p className="mt-3 text-xs font-bold">
                Total: {members.reduce((sum, member) => sum + Number(percentageValues[member.memberId] || 0), 0)}% / 100%
              </p>
            </div>
          )}

         
          {splitType === "SHARES" && (
            <div className="rounded-2xl border-[3px] border-black bg-[#8df5b0] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-wider">
                Shares for each person
              </p>
              <div className="space-y-3">
                {members.map((member) =>
                  splitInput(member, shareValues, setShareValues, "sh"),
                )}
              </div>
              <p className="mt-3 text-xs font-bold">
                Total shares: {members.reduce((sum, member) => sum + Number(shareValues[member.memberId] || 0), 0)}
              </p>
            </div>
          )}

          <div className="rounded-2xl border-[3px] border-black bg-[#f8f1e7] p-4">
            <div className="flex justify-between font-bold">
              <span>Split</span>

              <span>
                {splitType === "EQUAL"
                  ? "Equally"
                  : splitType === "EXACT"
                    ? "Exact amounts"
                    : splitType === "PERCENTAGE"
                      ? "Percentage"
                      : "Shares"}
              </span>
            </div>

            <div className="mt-2 flex justify-between font-bold">
              <span>Currency</span>
              <span>₹ INR</span>
            </div>
          </div>

          
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl border-[3px] border-black bg-[#171717] py-4 font-black text-white shadow-[5px_5px_0_#ffd34e] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#ffd34e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "ADDING..." : "ADD EXPENSE →"}
          </button>
        </form>
      </div>
    </div>
  );
}

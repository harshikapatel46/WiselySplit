import { formatINR } from "../../utils/room";

export default function Expenses({ expenses, members, onAdd }) {
  return (
    <section className="mt-10 rounded-3xl border-4 border-black bg-[#fffaf0] p-5 shadow-[7px_7px_0_#171717] sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-black/50">
            The damage
          </span>
          <h2 className="mt-1 text-4xl font-black uppercase leading-none">
            Expenses.
          </h2>
          <p className="mt-2 text-sm font-medium text-black/55">
            Every rupee accounted for.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border-[3px] border-black bg-[#ffd34e] px-6 py-3 font-black shadow-[4px_4px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#171717] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          + ADD EXPENSE
        </button>
      </div>
      <div className="mt-7">
        {expenses.length === 0 ? (
          <div className="rounded-2xl border-[3px] border-dashed border-black/40 bg-[#f8f1e7] p-10 text-center">
            <div className="text-4xl">🧾</div>
            <p className="mt-3 text-lg font-black">No expenses yet.</p>
            <p className="mt-1 text-sm font-medium text-black/50">
              Add the first one and let the split begin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const payer = members.find(
                (member) => member.memberId === expense.paidBy,
              );
              return (
                <div
                  key={expense._id}
                  className="rounded-2xl border-[3px] border-black bg-white p-4 transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#9ed8ff] font-black">
                        {payer?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black">
                          {expense.description}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase text-black/45">
                          Paid by {payer?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-black">
                        {formatINR(expense.amount)}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-black/40">
                          Equal split
                        </span>
                        {expense.status === "pending" && (
                          <span className="rounded-full border-2 border-black bg-[#ffd34e] px-2 py-1 text-[10px] font-black">
                             PENDING SYNC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

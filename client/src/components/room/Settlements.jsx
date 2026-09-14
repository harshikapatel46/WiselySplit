import { useState } from "react";
import { formatINR, settlementKey, uniqueSettlements } from "../../utils/room";

export default function Settlements({ settlements, onMarkPaid }) {
  const [processingKey, setProcessingKey] = useState("");

  const visibleSettlements = uniqueSettlements(settlements);

  async function handleMarkPaid(settlement) {
    const key = settlementKey(settlement);

    if (processingKey === key) return;

    try {
      setProcessingKey(key);
      await onMarkPaid(settlement);
    } catch (error) {
      console.error("Failed to mark settlement as paid:", error);
    } finally {
      setProcessingKey("");
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-black/50">
            Final boss
          </span>

          <h2 className="mt-1 text-4xl font-black uppercase leading-none">
            Settle up.
          </h2>
        </div>

        <p className="text-sm font-medium text-black/55">
          Fewer payments. Less headache.
        </p>
      </div>

      {visibleSettlements.length === 0 ? (
        <div className="rounded-3xl border-4 border-black bg-[#8df5b0] p-10 text-center shadow-[7px_7px_0_#171717]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-white text-3xl">
            ✓
          </div>

          <h3 className="mt-4 text-2xl font-black uppercase">
            All settled up!
          </h3>

          <p className="mt-2 font-medium text-black/60">
            No payments needed right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSettlements.map((settlement) => {
            const key = settlementKey(settlement);
            const processing = processingKey === key;

            return (
              <div
                key={key}
                className="rounded-2xl border-4 border-black bg-[#fffaf0] p-5 shadow-[5px_5px_0_#171717]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#ff83d8] text-xl font-black">
                      {settlement.from.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <p className="text-lg font-black">
                        {settlement.from.name}
                        <span className="mx-2 text-black/40">→</span>
                        {settlement.to.name}
                      </p>

                      <p className="mt-1 text-sm font-medium text-black/55">
                        Pay {settlement.to.name} to settle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-2xl font-black">
                      {formatINR(settlement.amount)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleMarkPaid(settlement)}
                      disabled={processing}
                      className={`rounded-xl border-[3px] border-black px-4 py-3 text-sm font-black ${
                        processing
                          ? "bg-white"
                          : "bg-[#ffd34e] shadow-[3px_3px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                      }`}
                    >
                      {processing ? "SAVING..." : "MARK PAID"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

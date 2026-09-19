import { useEffect, useState } from "react";
import { formatINR } from "../../utils/room";
import { getSettlementHistory } from "../../services/roomApi";

export default function SettlementHistory({ roomCode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getSettlementHistory(roomCode);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to load settlement history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [roomCode]);

  return (
    <section className="mt-10">
      <div className="mb-5">
        <span className="text-xs font-black uppercase tracking-widest text-black/50">
          Completed payments
        </span>

        <h2 className="mt-1 text-4xl font-black uppercase leading-none">
          Payment history.
        </h2>
      </div>

      {loading ? (
        <div className="rounded-2xl border-4 border-black bg-[#fffaf0] p-6 font-black">
          Loading history...
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border-4 border-black bg-[#fffaf0] p-6 font-bold">
          No payments completed yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((settlement) => (
            <div
              key={settlement._id}
              className="flex flex-col gap-3 rounded-2xl border-4 border-black bg-[#fffaf0] p-5 shadow-[4px_4px_0_#171717] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-[#8df5b0] text-lg font-black">
                  ✓
                </div>

                <div>
                  <p className="font-black">
                    {settlement.from.name}
                    <span className="mx-2 text-black/40">→</span>
                    {settlement.to.name}
                  </p>

                  <p className="text-xs font-semibold text-black/50">
                    {new Date(settlement.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-xl font-black">
                {formatINR(settlement.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
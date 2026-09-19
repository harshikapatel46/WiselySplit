import { useState } from "react";
import { getExpenseInsights } from "../../services/roomApi";

export default function AIInsights({ roomCode, className = "" }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExpenseInsights(roomCode);
      setInsights(response.data);
    } catch (error) {
      console.error("AI insights error:", error);
      setError("Could not generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={className || "mt-6"}>
      <div className="mb-5">
        <span className="text-xs font-black uppercase tracking-widest text-black/50">
          Smart analysis
        </span>

        <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-4xl font-black uppercase leading-none">
              AI Insights.
            </h2>
            <p className="mt-2 text-sm font-medium text-black/55">
              Understand where your group's money is going.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl border-[3px] border-black bg-[#ff83d8] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "ANALYZING..." : "GENERATE INSIGHTS"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-4 border-black bg-[#ffd34e] p-5 font-bold">
          {error}
        </div>
      )}

      {insights && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-4 border-black bg-[#fffaf0] p-5 shadow-[5px_5px_0_#171717] sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-widest text-black/50">
              Summary
            </p>
            <p className="mt-2 text-xl font-black">{insights.summary}</p>
          </div>

          <div className="rounded-2xl border-4 border-black bg-[#8df5b0] p-5 shadow-[5px_5px_0_#171717]">
            <p className="text-xs font-black uppercase tracking-widest text-black/50">
              Top category
            </p>
            <p className="mt-2 text-2xl font-black">{insights.topCategory}</p>
          </div>

          <div className="rounded-2xl border-4 border-black bg-[#ffd34e] p-5 shadow-[5px_5px_0_#171717]">
            <p className="text-xs font-black uppercase tracking-widest text-black/50">
              Observation
            </p>
            <p className="mt-2 font-bold">{insights.observation}</p>
          </div>

          <div className="rounded-2xl border-4 border-black bg-[#ff83d8] p-5 shadow-[5px_5px_0_#171717] sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-widest text-black/50">
              Suggestion
            </p>
            <p className="mt-2 text-lg font-black">{insights.suggestion}</p>
          </div>
        </div>
      )}
    </section>
  );
}

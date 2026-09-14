import { formatINR } from "../../utils/room";

export default function BalanceOverview({ balances }) {
  const settledCount = balances.filter(
    (member) => Math.abs(member.balance) < 0.01,
  ).length;
  const settledPercent = balances.length
    ? Math.round((settledCount / balances.length) * 100)
    : 100;
  const outstanding = balances.reduce(
    (total, member) => total + Math.max(0, member.balance),
    0,
  );
  const orbitStyle = {
    background: `conic-gradient(#b9d39a 0 ${settledPercent}%, #f6d766 ${settledPercent}% 100%)`,
  };

  return (
    <div className="mb-7 grid gap-6 rounded-[1.75rem] bg-[#fffdf8] p-6 shadow-[0_10px_25px_rgba(65,58,42,.08)] sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="balance-orbit mx-auto" style={orbitStyle}>
        <div className="balance-orbit__content">
          <p className="text-4xl font-black leading-none">{settledPercent}</p>
          <p className="mt-1 text-xs font-bold text-black/50">% settled</p>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-black/50">
          Balance overview
        </p>
        <h3 className="mt-2 text-2xl font-black">
          {settledCount === balances.length ? "All clear" : "Almost balanced"}
        </h3>
        <p className="mt-2 text-sm font-semibold text-black/55">
          {settledCount} of {balances.length} members have no outstanding
          balance.
        </p>
        <p className="mt-5 text-lg font-black">
          {formatINR(outstanding)}{" "}
          <span className="text-sm font-semibold text-black/50">
            left to settle
          </span>
        </p>
      </div>
    </div>
  );
}

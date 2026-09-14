import { formatINR } from "../../utils/room";
import BalanceOverview from "./BalanceOverview";

export default function Balances({ balances }) {
  return (
    <section className="mt-8">
      <div className="mb-5">
        <span className="text-xs font-black uppercase tracking-widest text-black/50">
          Money situation
        </span>
        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2 className="text-4xl font-black uppercase leading-none">
            Balances.
          </h2>
          <p className="text-sm font-medium text-black/55">
            Who owes. Who gets paid.
          </p>
        </div>
      </div>
      <BalanceOverview balances={balances} />
      <div className="grid gap-4 sm:grid-cols-2">
        {balances.map((member) => {
          const status =
            member.balance > 0
              ? "Gets back"
              : member.balance < 0
                ? "Owes"
                : "Settled";
          const color =
            member.balance > 0
              ? "bg-[#8df5b0]"
              : member.balance < 0
                ? "bg-[#ffd34e]"
                : "bg-[#fffaf0]";
          return (
            <div
              key={member.memberId}
              className={`rounded-2xl border-4 border-black p-5 shadow-[5px_5px_0_#171717] ${color}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white font-black">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="text-lg font-black">{member.name}</p>
                  <p className="text-xs font-black uppercase tracking-wider">
                    {status}
                  </p>
                </div>
                <p className="text-right text-2xl font-black sm:text-3xl">
                  {formatINR(Math.abs(member.balance))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

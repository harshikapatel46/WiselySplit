import { useState } from "react";

const colors = ["bg-[#ffd34e]", "bg-[#8df5b0]", "bg-[#ff83d8]", "bg-[#9ed8ff]"];

export default function Members({ members, onJoin, disabled }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onJoin(name);
      setName("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="rounded-3xl border-4 border-black bg-[#fffaf0] p-5 shadow-[7px_7px_0_#171717] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-block rounded-full border-2 border-black bg-[#ffd34e] px-3 py-1 text-xs font-black uppercase">
              Step 01
            </span>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none">
              Join the split.
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium text-black/60">
              Add your name and jump into the shared expense room.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl"
          >
            <input
              type="text"
              placeholder="Your name..."
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={disabled || submitting}
              className="min-h-13.5 flex-1 rounded-xl border-[3px] border-black bg-white px-4 font-bold outline-none placeholder:text-black/35 focus:bg-[#fff4a8] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={disabled || submitting}
              className="min-h-13.5 rounded-xl border-[3px] border-black bg-[#171717] px-7 font-black text-white shadow-[4px_4px_0_#ffd34e] transition hover:translate-x-0.5over:translate-y-[2px] hover:shadow-[2px_2px_0_#ffd34e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "JOINING..." : "JOIN →"}
            </button>
          </form>
        </div>
      </section>
      <section className="mt-8 rounded-3xl border-4 border-black bg-[#c8a7ff] p-5 shadow-[7px_7px_0_#171717] sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest">
              The crew
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase">Members</h2>
          </div>
          <div className="rounded-full border-[3px] border-black bg-[#fffaf0] px-4 py-2 text-sm font-black">
            {members.length} people
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {members.map((member, index) => (
            <div
              key={member.memberId}
              className="flex items-center gap-2 rounded-full border-[3px] border-black bg-[#fffaf0] px-4 py-2 font-bold shadow-[3px_3px_0_#171717]"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-sm font-black ${colors[index % colors.length]}`}
              >
                {member.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              {member.name}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

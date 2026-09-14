export default function Header({ room, isOnline }) {
  return (
    <header>
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#bfd4f0] text-lg font-black">
                ₹
              </div>
              <span className=" font-bold text-4xl mt-3 tracking-tight">
                wiselySplit
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] mt-3 font-bold ${isOnline ? "bg-[#b9d39a]" : "bg-[#f6d766]"}`}
              >
                ● {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-black/50">
              Shared room
            </p>
            <h1 className="mt-1 text-4xl font-black leading-none sm:text-5xl">
              {room.name}
            </h1>
            <p className="mt-3 text-sm font-semibold text-black/55">
              Room code{" "}
              <span className="ml-1 rounded-full bg-[#fffdf8] px-3 py-1 text-[#2c2d28]">
                {room.roomCode}
              </span>
            </p>
          </div>
          <div className="rounded-full bg-[#f6d766] px-4 py-3 text-sm font-black">
            ₹ INR
          </div>
        </div>
      </div>
    </header>
  );
}

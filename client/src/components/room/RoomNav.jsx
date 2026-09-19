import { Link, useLocation } from "react-router-dom";

export default function RoomNav({ roomCode, active }) {
  const location = useLocation();

  const currentTab =
    active ||
    (location.pathname.endsWith("/history")
      ? "history"
      : location.pathname.endsWith("/insights")
        ? "insights"
        : "room");

  const navItems = [
    {
      id: "room",
      label: "ROOM",
      to: `/room/${roomCode}`,
    },
    {
      id: "history",
      label: "PAYMENT HISTORY",
      to: `/room/${roomCode}/history`,
    },
    {
      id: "insights",
      label: "AI INSIGHTS",
      to: `/room/${roomCode}/insights`,
    },
  ];

  return (
    <nav
      aria-label="Room navigation"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg rounded-full border-[3px] border-black bg-[#fffdf8]/95 p-1.5 backdrop-blur-md shadow-[4px_4px_0_#171717]"
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex items-center justify-center rounded-full py-2.5 px-1.5 text-[11px] sm:text-xs md:text-sm font-black transition-all ${
                isActive
                  ? "bg-[#171717] text-white shadow-[2px_2px_0_#171717]"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

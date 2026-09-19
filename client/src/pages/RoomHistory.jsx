import { useParams } from "react-router-dom";
import Header from "../components/room/Header";
import SettlementHistory from "../components/room/SettlementHistory";
import RoomNav from "../components/room/RoomNav";
import useRoomData from "../hooks/useRoomData";

export default function RoomHistory() {
  const { roomCode } = useParams();
  const { room, isOnline, loading, error, refreshRoom } = useRoomData(roomCode);

  if (loading && !room) {
    return (
      <main className="fintech-theme grid min-h-screen place-items-center p-5">
        <div className="rounded-3xl border-4 border-black bg-[#ffd34e] p-8 text-center font-black shadow-[7px_7px_0_#171717]">
          LOADING THE SPLIT...
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="fintech-theme grid min-h-screen place-items-center p-5">
        <div className="max-w-md rounded-3xl border-4 border-black bg-[#ff83d8] p-8 text-center shadow-[7px_7px_0_#171717]">
          <h1 className="text-3xl font-black uppercase">Oops!</h1>
          <p className="mt-3 font-bold">
            {error || "This room is unavailable."}
          </p>
          <button
            type="button"
            onClick={refreshRoom}
            className="mt-6 rounded-xl border-[3px] border-black bg-white px-5 py-3 font-black shadow-[3px_3px_0_#171717]"
          >
            TRY AGAIN
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="fintech-theme min-h-screen">
      <Header room={room} isOnline={isOnline} />
      <main className="mx-auto max-w-6xl px-5 py-8 pb-28 sm:px-8">
        <SettlementHistory roomCode={roomCode} className="mt-2" />
      </main>
      <RoomNav roomCode={roomCode} active="history" />
    </div>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";
import AddExpenseModal from "../components/room/AddExpenseModal";
import Balances from "../components/room/Balances";
import Expenses from "../components/room/Expenses";
import Header from "../components/room/Header";
import Members from "../components/room/Members";
import Settlements from "../components/room/Settlements";
import useRoomData from "../hooks/useRoomData";

export default function Room() {
  const { roomCode } = useParams();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const {
    room,
    expenses,
    balances,
    settlements,
    isOnline,
    loading,
    error,
    setError,
    refreshRoom,
    addMember,
    addExpense,
    paySettlement,
  } = useRoomData(roomCode);

  async function handleJoin(name) {
    try {
      setError("");
      await addMember(name);
    } catch {
      setError("Failed to join room.");
    }
  }
  async function handleAdd(expense) {
    try {
      setError("");
      await addExpense(expense);
    } catch {
      setError("Failed to add expense.");
      throw new Error("Expense creation failed");
    }
  }

  if (loading && !room)
    return (
      <main className="fintech-theme grid min-h-screen place-items-center p-5">
        <div className="rounded-3xl border-4 border-black bg-[#ffd34e] p-8 text-center font-black shadow-[7px_7px_0_#171717]">
          LOADING THE SPLIT...
        </div>
      </main>
    );
  if (!room)
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

  return (
    <div className="fintech-theme min-h-screen">
      <Header room={room} isOnline={isOnline} />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border-[3px] border-black bg-[#ff83d8] p-4 font-bold shadow-[3px_3px_0_#171717]"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="text-xl font-black"
            >
              ×
            </button>
          </div>
        )}
        <Members
          members={room.members || []}
          onJoin={handleJoin}
          disabled={!isOnline}
        />
        <Balances balances={balances} />
        <Settlements 
        settlements={settlements} onMarkPaid={paySettlement} />
        <Expenses
          expenses={expenses}
          members={room.members || []}
          onAdd={() => setShowExpenseForm(true)}
        />
      </main>
      {showExpenseForm && (
        <AddExpenseModal
          roomCode={roomCode}
          members={room.members || []}
          onClose={() => setShowExpenseForm(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

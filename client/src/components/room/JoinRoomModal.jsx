import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../../services/roomApi";

export default function JoinRoomModal({
  isOpen,
  onClose,
  initialRoomCode = "",
}) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const navigate = useNavigate();

  const [prevInitial, setPrevInitial] = useState(initialRoomCode);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialRoomCode !== prevInitial) {
    setPrevInitial(initialRoomCode);
    setRoomCode(initialRoomCode.toUpperCase());
  }

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setError("");
      setIsDuplicate(false);
      setName("");
      if (!initialRoomCode) {
        setRoomCode("");
      }
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError("Please enter a room code.");
      return;
    }

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsDuplicate(false);

      await joinRoom(cleanCode, cleanName);

      onClose();
      navigate(`/room/${cleanCode}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Room not found. Please check the code and try again.");
      } else if (err.response?.status === 400) {
        const msg = err.response.data?.message || "Invalid room code or name.";
        setError(msg);
        if (msg.toLowerCase().includes("already in the room")) {
          setIsDuplicate(true);
        }
      } else {
        setError("Failed to join room. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEnterDirectly() {
    const cleanCode = roomCode.trim().toUpperCase();
    if (cleanCode) {
      onClose();
      navigate(`/room/${cleanCode}`);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-room-title"
    >
      <div className="w-full max-w-md rounded-3xl border-4 border-black bg-[#fffaf0] p-6 shadow-[9px_9px_0_#ffd34e] sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full border-2 border-black bg-[#ffd34e] px-3 py-1 text-xs font-black uppercase">
              Join split
            </span>
            <h2
              id="join-room-title"
              className="mt-3 text-3xl font-black uppercase leading-none"
            >
              Join a room.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close join room form"
            className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-black bg-white text-xl font-black shadow-[3px_3px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="join-room-code"
              className="text-xs font-black uppercase tracking-wider text-black/70"
            >
              Room code
            </label>
            <input
              id="join-room-code"
              type="text"
              placeholder="e.g. 7X9K2P"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-3.5 font-bold uppercase tracking-widest outline-none placeholder:text-black/30 placeholder:normal-case placeholder:tracking-normal focus:bg-[#fff4a8] disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label
              htmlFor="join-user-name"
              className="text-xs font-black uppercase tracking-wider text-black/70"
            >
              Your name
            </label>
            <input
              id="join-user-name"
              type="text"
              placeholder="e.g. Maya, Sam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-xl border-[3px] border-black bg-white px-4 py-3.5 font-bold outline-none placeholder:text-black/30 focus:bg-[#fff4a8] disabled:opacity-60"
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border-[3px] border-black bg-[#ff83d8] p-3 text-sm font-bold shadow-[2px_2px_0_#171717]"
            >
              <p>{error}</p>
              {isDuplicate && (
                <button
                  type="button"
                  onClick={handleEnterDirectly}
                  className="mt-2 inline-block rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[1px_1px_0_#171717] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  Enter room anyway →
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-[3px] border-black bg-[#171717] py-3.5 font-black text-white shadow-[4px_4px_0_#ffd34e] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "JOINING ROOM..." : "JOIN ROOM →"}
          </button>
        </form>
      </div>
    </div>
  );
}


import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { joinRoom } from "../services/roomApi";

export default function JoinRoom() {
  const { roomCode: paramRoomCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefillCode = (
    paramRoomCode ||
    searchParams.get("code") ||
    searchParams.get("join") ||
    ""
  ).toUpperCase();

  const [roomCode, setRoomCode] = useState(prefillCode);
  const [prevPrefill, setPrevPrefill] = useState(prefillCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  if (prefillCode !== prevPrefill) {
    setPrevPrefill(prefillCode);
    setRoomCode(prefillCode);
  }

  async function handleJoinRoom(event) {
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
      navigate(`/room/${cleanCode}`);
    }
  }

  return (
    <main className="fintech-page">
      <div className="fintech-page__shell">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-7 rounded-full bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#565750] shadow-sm"
        >
          ← Back
        </button>
        <section className="fintech-page__card">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#ffd34e] text-2xl font-black">
            →
          </div>
          <p className="fintech-page__eyebrow mt-7">Join shared space</p>
          <h1 className="mt-2 text-4xl font-black text-[#2c2d28]">
            Join a room
          </h1>
          <p className="mt-3 font-semibold leading-relaxed text-[#77776e]">
            Enter the room code and your name to join your group’s split.
          </p>
          <form onSubmit={handleJoinRoom} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="room-code-input"
                className="text-xs font-bold tracking-wide text-[#565750]"
              >
                ROOM CODE
              </label>
              <input
                id="room-code-input"
                type="text"
                placeholder="e.g. 7X9K2P"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                disabled={loading}
                className="mt-2 box-border uppercase tracking-widest font-bold placeholder:normal-case placeholder:tracking-normal"
                required
              />
            </div>
            <div>
              <label
                htmlFor="user-name-input"
                className="text-xs font-bold tracking-wide text-[#565750]"
              >
                YOUR NAME
              </label>
              <input
                id="user-name-input"
                type="text"
                placeholder="e.g. Maya, Sam"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
                className="mt-2 box-border font-bold"
                required
              />
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-[#f5b4d3] p-4 text-sm font-semibold"
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
              className="fintech-page__button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Joining room..." : "Join room →"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}


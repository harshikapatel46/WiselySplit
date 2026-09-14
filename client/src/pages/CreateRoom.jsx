import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function handleCreateRoom(event) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/rooms", {
        name: name.trim(),
        currency: "INR",
      });
      navigate(`/room/${response.data.roomCode}`);
    } catch {
      setError("We couldn't create that room. Please try again.");
    } finally {
      setLoading(false);
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
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f5b4d3] text-2xl">
            +
          </div>
          <p className="fintech-page__eyebrow mt-7">New shared space</p>
          <h1 className="mt-2 text-4xl font-black text-[#2c2d28]">
            Create a room
          </h1>
          <p className="mt-3 font-semibold leading-relaxed text-[#77776e]">
            Start a shared tab for your trip, flat, or next dinner out.
          </p>
          <form onSubmit={handleCreateRoom} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="room-name"
                className="text-xs font-bold tracking-wide text-[#565750]"
              >
                ROOM NAME
              </label>
              <input
                id="room-name"
                type="text"
                placeholder="Goa getaway, Friday pizza..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 box-border"
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#bfd4f0] px-5 py-4">
              <span className="text-sm font-bold">Currency</span>
              <span className="text-sm font-bold">₹ INR</span>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-2xl bg-[#f5b4d3] p-4 text-sm font-semibold"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="fintech-page__button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating room..." : "Create room →"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

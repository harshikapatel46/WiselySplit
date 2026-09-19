import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import Room from "./pages/Room";
import RoomHistory from "./pages/RoomHistory";
import RoomInsights from "./pages/RoomInsights";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/:roomCode" element={<Room />} />
        <Route path="/room/:roomCode/history" element={<RoomHistory />} />
        <Route path="/room/:roomCode/insights" element={<RoomInsights />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

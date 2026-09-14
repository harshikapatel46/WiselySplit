const Room = require("../models/Room");
const crypto = require("crypto");

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createRoom = async (req, res) => {
  try {
    const { name, currency = "INR" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const room = await Room.create({
      name,
      roomCode: generateRoomCode(),
      baseCurrency: currency,
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Member name is required",
      });
    }
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    const member = {
      memberId: crypto.randomUUID(),
      name: name.trim(),
    };

    room.members.push(member);
    await room.save();

    
    const io = req.app.get("io");
    console.log("Member joined:", roomCode, member);

    io.to(roomCode).emit("member:joined", {
      memberId: member.memberId,
      name: member.name,
    });

 

    res.status(200).json({
      message: "Joined room successfully",
      member,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to join room",
    });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch room",
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
};

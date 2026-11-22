const Room = require("../models/Room");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const {
  calculateBalances,
  calculateSettlements,
} = require("../services/settlementService");
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

    const trimmedName = (name || "").trim();
    if (!trimmedName) {
      return res.status(400).json({
        message: "Member name is required",
      });
    }

    const normalizedRoomCode = (roomCode || "").trim().toUpperCase();
    const room = await Room.findOne({ roomCode: normalizedRoomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const existingMember = room.members.find(
      (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingMember) {
      return res.status(400).json({
        message: "A member with this name is already in the room",
      });
    }

    const member = {
      memberId: crypto.randomUUID(),
      name: trimmedName,
    };

    room.members.push(member);
    await room.save();

    const io = req.app.get("io");
    if (io) {
      console.log("Member joined:", normalizedRoomCode, member);
      io.to(normalizedRoomCode).emit("member:joined", {
        memberId: member.memberId,
        name: member.name,
      });
    }

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
    const normalizedRoomCode = (roomCode || "").trim().toUpperCase();

    const room = await Room.findOne({ roomCode: normalizedRoomCode }).lean();

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

const getRoomDashboard = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const normalizedRoomCode = (roomCode || "").trim().toUpperCase();

    const [room, expenses, paidSettlements] = await Promise.all([
      Room.findOne({ roomCode: normalizedRoomCode }).lean(),
      Expense.find({ roomCode: normalizedRoomCode })
        .sort({ createdAt: -1 })
        .lean(),
      Settlement.find({ roomCode: normalizedRoomCode, status: "PAID" }).lean(),
    ]);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const balances = calculateBalances(expenses, room.members, paidSettlements);
    const settlements = calculateSettlements(balances, room.members);

    const formattedBalances = room.members.map((member) => {
      const rawBalance = balances[member.memberId] || 0;
      const rounded = Math.round(rawBalance * 100) / 100;
      const normalized = Math.abs(rounded) < 0.01 ? 0 : rounded;

      return {
        memberId: member.memberId,
        name: member.name,
        balance: normalized,
      };
    });

    res.status(200).json({
      room,
      expenses,
      balances: formattedBalances,
      settlements,
    });
  } catch (error) {
    console.error("GET ROOM DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch room dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  getRoomDashboard,
};

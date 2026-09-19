const Expense = require("../models/Expense");
const Room = require("../models/Room");
const {
  calculateBalances,
  calculateSettlements,
} = require("../services/settlementService");

const Settlement = require("../models/Settlement");
const { generateExpenseInsights } = require("../services/aiInsightService");
const createEqualSplit = (amount, members) => {
  const amountInPaise = Math.round(Number(amount) * 100);
  const baseShare = Math.floor(amountInPaise / members.length);
  const remainder = amountInPaise % members.length;

  return members.map((member, index) => ({
    memberId: member.memberId,
    amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
  }));
};

const createExpense = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const {
      description,
      amount,
      currency = "INR",
      paidBy,
      splitType = "EQUAL",
      splitBetween: requestedSplit,
    } = req.body;

    if (
      !description ||
      amount === undefined ||
      amount === null ||
      !currency ||
      !paidBy
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || Math.round(parsedAmount * 100) < 1) {
      return res.status(400).json({
        message: "Expense amount must be at least ₹0.01",
      });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.members.length === 0) {
      return res.status(400).json({
        message: "No members in this room",
      });
    }

    let splitBetween = createEqualSplit(amount, room.members);

    if (requestedSplit) {
      if (!Array.isArray(requestedSplit)) {
        return res.status(400).json({
          message: "Split amounts must be provided as a list.",
        });
      }

      const memberIds = new Set(room.members.map((member) => member.memberId));
      const requestedIds = new Set(
        requestedSplit.map((split) => split.memberId),
      );
      const splitTotal = requestedSplit.reduce(
        (sum, split) => sum + Number(split.amount),
        0,
      );
      const isValidSplit =
        requestedSplit.length === room.members.length &&
        requestedIds.size === room.members.length &&
        requestedSplit.every(
          (split) =>
            memberIds.has(split.memberId) &&
            Number.isFinite(Number(split.amount)) &&
            Number(split.amount) >= 0,
        ) &&
        Math.abs(splitTotal - Number(amount)) < 0.01;

      if (!isValidSplit) {
        return res.status(400).json({
          message:
            "Split amounts must cover every member and equal the expense total.",
        });
      }

      splitBetween = requestedSplit.map((split) => ({
        memberId: split.memberId,
        amount: Number(Number(split.amount).toFixed(2)),
      }));
    }

    const expense = await Expense.create({
      roomCode,
      description,
      amount: Number(amount),
      currency,
      paidBy,
      splitType,
      splitBetween,
    });
    const io = req.app.get("io");

    io.to(roomCode).emit("expense:created", expense);

    console.log(`Expense created in room ${roomCode}:`, expense);
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create expense",
    });
  }
};
const getExpenses = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const expenses = await Expense.find({ roomCode }).sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
};

const getBalances = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const expenses = await Expense.find({ roomCode });

    const paidSettlements = await Settlement.find({ roomCode, status: "PAID" });

    const balances = calculateBalances(expenses, room.members, paidSettlements);

    const result = room.members.map((member) => {
      const rawBalance = balances[member.memberId] || 0;
      const rounded = Math.round(rawBalance * 100) / 100;
      const normalized = Math.abs(rounded) < 0.01 ? 0 : rounded;
      return {
        memberId: member.memberId,
        name: member.name,
        balance: normalized,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("BALANCE ERROR:", error);

    res.status(500).json({
      message: "Failed to calculate balances",
      error: error.message,
    });
  }
};
const getSettlements = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const expenses = await Expense.find({ roomCode });

    const paidSettlements = await Settlement.find({ roomCode, status: "PAID" });

    const balances = calculateBalances(expenses, room.members, paidSettlements);

    const settlements = calculateSettlements(balances, room.members);

    res.status(200).json(settlements);
  } catch (error) {
    console.error("SETTLEMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to calculate settlements",
    });
  }
};
const markSettlementsAsPaid = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { from, to, amount } = req.body;

    const parsedAmount = Number(amount);
    if (
      !from?.memberId ||
      !to?.memberId ||
      !Number.isFinite(parsedAmount) ||
      Math.round(parsedAmount * 100) < 1
    ) {
      return res.status(400).json({
        message:
          "Valid settlement details with an amount of at least ₹0.01 are required.",
      });
    }

    if (from.memberId === to.memberId) {
      return res.status(400).json({
        message: "Cannot settle with yourself.",
      });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const fromMember = room.members.find((m) => m.memberId === from.memberId);
    const toMember = room.members.find((m) => m.memberId === to.memberId);

    if (!fromMember || !toMember) {
      return res.status(400).json({
        message: "Both members must be part of the room.",
      });
    }

    const settlement = await Settlement.create({
      roomCode,
      from: {
        memberId: fromMember.memberId,
        name: fromMember.name,
      },
      to: {
        memberId: toMember.memberId,
        name: toMember.name,
      },
      amount: Number((Math.round(parsedAmount * 100) / 100).toFixed(2)),
      status: "PAID",
    });

    const io = req.app.get("io");
    if (io) {
      io.to(roomCode).emit("settlement:paid", settlement);
    }

    res.status(201).json(settlement);
  } catch (error) {
    console.error("MARK SETTLEMENT ERROR:", error);

    res.status(500).json({
      message: "Failed to mark settlement as paid",
    });
  }
};

const getSettlementHistory = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const history = await Settlement.find({ roomCode, status: "PAID" }).sort({
      createdAt: -1,
    });

    res.status(200).json(history);
  } catch (error) {
    console.error("GET SETTLEMENT HISTORY ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch settlement history",
    });
  }
};
const getExpenseInsights = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const expenses = await Expense.find({ roomCode }).sort({
      createdAt: -1,
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        summary: "No expenses yet.",
        topCategory: "None",
        observation: "Add some expenses to generate spending insights.",
        suggestion: "Start by adding your first shared expense.",
      });
    }

    const insights = await generateExpenseInsights(expenses);

    res.status(200).json(insights);
  } catch (error) {
    console.error("INSIGHT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate expense insights",
      error: error.message,
    });
  }
};
module.exports = {
  createExpense,
  getExpenses,
  getBalances,
  getSettlements,
  markSettlementsAsPaid,
  getSettlementHistory,
   getExpenseInsights,
};

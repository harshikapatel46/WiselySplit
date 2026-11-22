const express = require("express");

const {
  createExpense,
  getExpenses,
  getBalances,
  getSettlements,
  getFinancialSummary,
  markSettlementsAsPaid,
  getSettlementHistory,
  getExpenseInsights,
} = require("../controllers/expenseController");

const router = express.Router();

router.post("/:roomCode", createExpense);

router.get("/:roomCode/balances", getBalances);
router.get("/:roomCode/settlements", getSettlements);
router.get("/:roomCode/summary", getFinancialSummary);
router.get("/:roomCode/settlements/history", getSettlementHistory);
 
router.post("/:roomCode/settlements/pay", markSettlementsAsPaid);
router.get("/:roomCode/insights", getExpenseInsights);
router.get("/:roomCode", getExpenses);

module.exports = router;

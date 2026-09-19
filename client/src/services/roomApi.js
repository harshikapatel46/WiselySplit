import api from "./api";

export async function getRoomData(roomCode) {
  const [roomResponse, expenseResponse, balanceResponse, settlementResponse] =
    await Promise.all([
      api.get(`/rooms/${roomCode}`),
      api.get(`/expenses/${roomCode}`),
      api.get(`/expenses/${roomCode}/balances`),
      api.get(`/expenses/${roomCode}/settlements`),
    ]);

  return {
    room: roomResponse.data,
    expenses: expenseResponse.data,
    balances: balanceResponse.data,
    settlements: settlementResponse.data,
  };
}

export async function getFinancialSummary(roomCode) {
  const [balanceResponse, settlementResponse] = await Promise.all([
    api.get(`/expenses/${roomCode}/balances`),
    api.get(`/expenses/${roomCode}/settlements`),
  ]);

  return {
    balances: balanceResponse.data,
    settlements: settlementResponse.data,
  };
}

export const joinRoom = (roomCode, name) =>
  api.post(`/rooms/${roomCode}/join`, { name });

export const createExpense = (roomCode, expense) =>
  api.post(`/expenses/${roomCode}`, expense);

export const markSettlementAsPaid = (roomCode, settlement) =>
  api.post(`/expenses/${roomCode}/settlements/pay`, settlement);
export const getExpenseInsights = (roomCode) =>
  api.get(`/expenses/${roomCode}/insights`);
export const getSettlementHistory = (roomCode) =>
  api.get(`/expenses/${roomCode}/settlements/history`);


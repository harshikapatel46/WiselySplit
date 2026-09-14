
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createExpense,
  getFinancialSummary,
  getRoomData,
  joinRoom,
  markSettlementAsPaid,
} from "../services/roomApi";
import {
  deletePendingExpense,
  getPendingExpenses,
  savePendingExpense,
} from "../services/offlineDB";
import socket from "../services/socket";

const emptyData = {
  room: null,
  expenses: [],
  balances: [],
  settlements: [],
};

const toExpensePayload = ({
  description,
  amount,
  currency,
  paidBy,
  splitType,
  splitBetween,
}) => ({
  description,
  amount,
  currency,
  paidBy,
  splitType,
  splitBetween,
});

const isTemporaryApiFailure = (error) =>
  !navigator.onLine || !error.response || error.response.status >= 500;

export default function useRoomData(roomCode) {
  const [data, setData] = useState(emptyData);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestId = useRef(0);
  const expenseIds = useRef(new Set());
  const isSyncing = useRef(false);

  const addExpenseToState = useCallback((expense) => {
    if (expenseIds.current.has(expense._id)) return false;

    expenseIds.current.add(expense._id);

    setData((current) => ({
      ...current,
      expenses: [expense, ...current.expenses],
    }));

    return true;
  }, []);

  const refreshFinancialSummary = useCallback(async () => {
    const summary = await getFinancialSummary(roomCode);

    setData((current) => ({
      ...current,
      ...summary,
    }));
  }, [roomCode]);

  const refreshRoom = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError("");

    try {
      const [nextData, pendingExpenses] = await Promise.all([
        getRoomData(roomCode),
        getPendingExpenses(roomCode),
      ]);

      if (currentRequest === requestId.current) {
        const pendingIds = new Set(
          pendingExpenses.map((expense) => expense.localId),
        );

        const expenses = [
          ...pendingExpenses.map((expense) => ({
            ...expense,
            _id: expense.localId,
          })),
          ...nextData.expenses.filter(
            (expense) => !pendingIds.has(expense._id),
          ),
        ];

        expenseIds.current = new Set(
          expenses.map((expense) => expense._id),
        );

        setData({
          ...nextData,
          expenses,
        });
      }
    } catch (requestError) {
      if (currentRequest === requestId.current) {
        setError(
          requestError.response?.status === 404
            ? "Room not found."
            : "Could not load this room.",
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [roomCode]);

  const syncPendingExpenses = useCallback(async () => {
    if (!navigator.onLine || isSyncing.current) return;

    isSyncing.current = true;

    try {
      const pendingExpenses = await getPendingExpenses(roomCode);

      if (!pendingExpenses.length) return;

      for (const pendingExpense of pendingExpenses) {
        const { localId } = pendingExpense;

        try {
          const response = await createExpense(
            roomCode,
            toExpensePayload(pendingExpense),
          );

          await deletePendingExpense(localId);

          setData((current) => ({
            ...current,
            expenses: current.expenses.filter(
              (item) => item.localId !== localId,
            ),
          }));

          expenseIds.current.delete(localId);

          addExpenseToState(response.data);
        } catch (syncError) {
          console.error("Failed to sync expense:", syncError);
          return;
        }
      }

      await refreshFinancialSummary();
    } finally {
      isSyncing.current = false;
    }
  }, [addExpenseToState, refreshFinancialSummary, roomCode]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      refreshRoom()
        .finally(syncPendingExpenses)
        .catch(() => {});
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [refreshRoom, syncPendingExpenses]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingExpenses();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingExpenses]);

  useEffect(() => {
    const handleExpenseCreated = (expense) => {
      if (addExpenseToState(expense)) {
        refreshFinancialSummary().catch(() => {});
      }
    };

    const handleMemberJoined = (member) => {
      setData((current) => {
        if (
          !current.room ||
          current.room.members.some(
            (item) => item.memberId === member.memberId,
          )
        ) {
          return current;
        }

        return {
          ...current,
          room: {
            ...current.room,
            members: [...current.room.members, member],
          },
          balances: [
            ...current.balances,
            {
              ...member,
              balance: 0,
            },
          ],
        };
      });
    };

    const handleSettlementPaid = () => {
      refreshFinancialSummary().catch(() => {});
    };

    socket.connect();

    socket.emit("join-room", roomCode);

    socket.on("expense:created", handleExpenseCreated);
    socket.on("member:joined", handleMemberJoined);
    socket.on("settlement:paid", handleSettlementPaid);

    return () => {
      socket.off("expense:created", handleExpenseCreated);
      socket.off("member:joined", handleMemberJoined);
      socket.off("settlement:paid", handleSettlementPaid);

      socket.emit("leave-room", roomCode);
      socket.disconnect();
    };
  }, [addExpenseToState, refreshFinancialSummary, roomCode]);

  const addMember = useCallback(
    async (name) => {
      await joinRoom(roomCode, name.trim());
      await refreshRoom();
    },
    [refreshRoom, roomCode],
  );

  const addExpense = useCallback(
    async (expense) => {
      try {
        const response = await createExpense(roomCode, expense);

        if (addExpenseToState(response.data)) {
          await refreshFinancialSummary();
        }
      } catch (requestError) {
        if (!isTemporaryApiFailure(requestError)) {
          throw requestError;
        }

        console.log("Expense API failed. Saving offline...");

        const localId = await savePendingExpense(roomCode, expense);

        addExpenseToState({
          ...expense,
          _id: localId,
          localId,
          status: "pending",
          createdOffline: true,
        });

        return;
      }
    },
    [addExpenseToState, refreshFinancialSummary, roomCode],
  );

  const paySettlement = useCallback(
    async (settlement) => {
      await markSettlementAsPaid(roomCode, settlement);
      await refreshFinancialSummary();
    },
    [refreshFinancialSummary, roomCode],
  );

  return {
    ...data,
    isOnline,
    loading,
    error,
    setError,
    refreshRoom,
    syncPendingExpenses,
    addMember,
    addExpense,
    paySettlement,
  };
}

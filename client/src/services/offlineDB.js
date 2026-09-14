import { openDB } from "idb";

const dbPromise = openDB("wiselySplit-db", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("pendingExpenses")) {
      db.createObjectStore("pendingExpenses", {
        keyPath: "localId",
      });
    }

    if (!db.objectStoreNames.contains("roomCache")) {
      db.createObjectStore("roomCache", {
        keyPath: "roomCode",
      });
    }
  },
});

export async function savePendingExpense(expense) {
  const localId = crypto.randomUUID();

  const db = await dbPromise;

  await db.put("pendingExpenses", {
    ...expense,
    localId,
    createdOffline: true,
    status: "pending",
  });

  return localId;
}

export async function getPendingExpenses(roomCode) {
  const db = await dbPromise;

  const expenses = await db.getAll("pendingExpenses");

  return roomCode
    ? expenses.filter((expense) => expense.roomCode === roomCode)
    : expenses;
}

export async function deletePendingExpense(localId) {
  const db = await dbPromise;

  await db.delete("pendingExpenses", localId);
}

export async function saveRoomCache(roomCode, data) {
  const db = await dbPromise;

  await db.put("roomCache", {
    roomCode,
    ...data,
  });
}

export async function getRoomCache(roomCode) {
  const db = await dbPromise;

  return db.get("roomCache", roomCode);
}
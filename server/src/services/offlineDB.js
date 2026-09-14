import { openDB } from "idb";

const dbPromise = openDB("wiselySplit-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("pendingExpenses")) {
      db.createObjectStore("pendingExpenses", {
        keyPath: "localId",
      });
    }
  },
});

export const savePendingExpense = async (expense) => {
  const db = await dbPromise;

  await db.put("pendingExpenses", {
    ...expense,
    localId: crypto.randomUUID(),
    createdOffline: true,
     status: "pending",
  });
};

export const getPendingExpenses = async () => {
  const db = await dbPromise;

  return db.getAll("pendingExpenses");
};

export const deletePendingExpense = async (localId) => {
  const db = await dbPromise;

  await db.delete("pendingExpenses", localId);
};
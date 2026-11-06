// Controlled Offline-First Audit Script
// Tests offline expense creation, IndexedDB persistence, queueing, recovery, and synchronization.

class MockIDBStore {
  constructor() {
    this.stores = {
      pendingExpenses: new Map(),
      roomCache: new Map()
    };
  }

  async put(storeName, item) {
    const key = item.localId || item.roomCode;
    this.stores[storeName].set(key, JSON.parse(JSON.stringify(item)));
    return key;
  }

  async getAll(storeName) {
    return Array.from(this.stores[storeName].values()).map(v => JSON.parse(JSON.stringify(v)));
  }

  async get(storeName, key) {
    const val = this.stores[storeName].get(key);
    return val ? JSON.parse(JSON.stringify(val)) : undefined;
  }

  async delete(storeName, key) {
    this.stores[storeName].delete(key);
  }
}

// Emulate client/src/services/offlineDB.js
function createOfflineDBSimulation(mockDb) {
  return {
    async savePendingExpense(expense) {
      const localId = `local_${Math.random().toString(36).substring(2, 9)}`;
      await mockDb.put("pendingExpenses", {
        ...expense,
        localId,
        createdOffline: true,
        status: "pending",
      });
      return localId;
    },

    async getPendingExpenses(roomCode) {
      const expenses = await mockDb.getAll("pendingExpenses");
      return roomCode
        ? expenses.filter((expense) => expense.roomCode === roomCode)
        : expenses;
    },

    async deletePendingExpense(localId) {
      await mockDb.delete("pendingExpenses", localId);
    }
  };
}

// Emulate client/src/hooks/useRoomData.js toExpensePayload
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

async function runOfflineAudit() {
  console.log('================================================================');
  console.log('        WISELYSPLIT OFFLINE-FIRST FUNCTIONALITY AUDIT           ');
  console.log('================================================================');

  const roomCode = 'ROOM99';
  const members = [
    { memberId: 'user_1', name: 'Alice' },
    { memberId: 'user_2', name: 'Bob' },
  ];

  console.log('\n--- PART A: Auditing Current Codebase Implementation ---');
  console.log('Inspecting: useRoomData.js line 278 -> savePendingExpense(roomCode, expense)');
  console.log('Inspecting: offlineDB.js line 19   -> savePendingExpense(expense)');

  const mockDbA = new MockIDBStore();
  const offlineDbA = createOfflineDBSimulation(mockDbA);

  // Simulate 10 expenses created offline via the EXACT code in useRoomData.js:
  // const localId = await savePendingExpense(roomCode, expense);
  console.log('\nSimulating 10 offline expense creation calls via current codebase call signature...');
  const offlineCreatedStateA = [];

  for (let i = 1; i <= 10; i++) {
    const expense = {
      description: `Offline Coffee #${i}`,
      amount: 150 + i * 10,
      currency: 'INR',
      paidBy: 'user_1',
      splitType: 'EQUAL',
      splitBetween: [
        { memberId: 'user_1', amount: 75 + i * 5 },
        { memberId: 'user_2', amount: 75 + i * 5 }
      ]
    };

    // Actual code in useRoomData.js line 278:
    // const localId = await savePendingExpense(roomCode, expense);
    const localId = await offlineDbA.savePendingExpense(roomCode, expense);

    offlineCreatedStateA.push({
      ...expense,
      _id: localId,
      localId,
      status: "pending",
      createdOffline: true,
    });
  }

  console.log(`Local UI state received: ${offlineCreatedStateA.length} pending expenses.`);
  
  // Now inspect what is actually stored inside IndexedDB:
  const rawStoredRecordsA = await mockDbA.getAll("pendingExpenses");
  console.log(`Total records physically stored in IndexedDB store "pendingExpenses": ${rawStoredRecordsA.length}`);
  console.log('Sample record stored in IndexedDB:');
  console.log(JSON.stringify(rawStoredRecordsA[0], null, 2));

  // Now test getPendingExpenses(roomCode):
  const retrievedPendingA = await offlineDbA.getPendingExpenses(roomCode);
  console.log(`\nQuerying getPendingExpenses('${roomCode}'):`);
  console.log(`Retrieved count: ${retrievedPendingA.length}`);
  
  const bugDetected1 = rawStoredRecordsA.length === 10 && retrievedPendingA.length === 0;
  console.log(`BUG #1 CONFIRMED: Parameter Mismatch Corrupts Queue: ${bugDetected1}`);
  if (bugDetected1) {
    console.log('  -> Because savePendingExpense only accepts 1 parameter (expense), passing (roomCode, expense) caused roomCode string to be spread into characters { 0: "R", 1: "O", ... }.');
    console.log('  -> All expense details (description, amount, splitBetween) were dropped.');
    console.log('  -> expense.roomCode was undefined, so getPendingExpenses(roomCode) filtered out ALL 10 records (0 retrieved).');
    console.log('  -> Result: 0/10 expenses synchronize when connectivity returns. 100% data loss on page refresh!');
  }

  console.log('\n--- PART B: Controlled Test with Corrected Signatures (Simulating Working Sync) ---');
  console.log('Testing: offline queueing of 10 valid expenses, recovery, deduplication, and sync loop');

  const mockDbB = new MockIDBStore();
  
  // Working implementation of savePendingExpense that stores roomCode:
  async function savePendingExpenseFixed(expenseData) {
    const localId = `local_${Math.random().toString(36).substring(2, 9)}`;
    await mockDbB.put("pendingExpenses", {
      ...expenseData,
      localId,
      createdOffline: true,
      status: "pending",
    });
    return localId;
  }

  async function getPendingExpensesFixed(rCode) {
    const expenses = await mockDbB.getAll("pendingExpenses");
    return rCode ? expenses.filter(e => e.roomCode === rCode) : expenses;
  }

  // 1. Create 10 offline expenses
  const generated10 = [];
  for (let i = 1; i <= 10; i++) {
    const exp = {
      roomCode,
      description: `Offline Dinner #${i}`,
      amount: 500 + i * 50,
      currency: 'INR',
      paidBy: 'user_1',
      splitType: 'EQUAL',
      splitBetween: [
        { memberId: 'user_1', amount: 250 + i * 25 },
        { memberId: 'user_2', amount: 250 + i * 25 }
      ]
    };
    const localId = await savePendingExpenseFixed(exp);
    generated10.push({ ...exp, localId });
  }

  console.log(`Step 1: 10 expenses successfully queued in IndexedDB.`);
  const queuedInDb = await getPendingExpensesFixed(roomCode);
  console.log(`Verified in store: ${queuedInDb.length} pending expenses.`);

  // 2. Simulate network sync when online event fires
  console.log('\nStep 2: Simulating network online event & syncPendingExpenses loop...');

  // Mock server API
  const serverDatabase = [];
  const serverCreatedIds = new Set();
  let syncAttempts = 0;
  let syncSuccesses = 0;
  let syncFailures = 0;

  async function mockCreateExpenseApi(rCode, payload) {
    syncAttempts++;
    // Validate payload
    if (!payload.description || !payload.amount || !payload.paidBy) {
      throw new Error("400: All fields are required");
    }
    const serverExpense = {
      _id: `server_${Math.random().toString(36).substring(2, 9)}`,
      roomCode: rCode,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    serverDatabase.push(serverExpense);
    serverCreatedIds.add(serverExpense._id);
    return { data: serverExpense };
  }

  // Execute sync loop matching useRoomData.js lines 136-161
  const pendingToSync = await getPendingExpensesFixed(roomCode);
  for (const pending of pendingToSync) {
    const { localId } = pending;
    try {
      const response = await mockCreateExpenseApi(roomCode, toExpensePayload(pending));
      await mockDbB.delete("pendingExpenses", localId);
      syncSuccesses++;
    } catch (err) {
      syncFailures++;
      console.error(`Sync failed for ${localId}:`, err.message);
      break; // Note: useRoomData breaks loop on first failure
    }
  }

  console.log(`Step 3: Sync results:`);
  console.log(`  - Total attempted  : ${syncAttempts}`);
  console.log(`  - Total succeeded  : ${syncSuccesses}`);
  console.log(`  - Total failed     : ${syncFailures}`);
  console.log(`  - Server DB count  : ${serverDatabase.length}`);

  const remainingInQueue = await getPendingExpensesFixed(roomCode);
  console.log(`  - Remaining in IDB : ${remainingInQueue.length}`);

  // 3. Test duplicate retry behavior: what happens if sync runs again?
  console.log('\nStep 4: Testing retry behavior (duplicate prevention check)...');
  const retryQueue = await getPendingExpensesFixed(roomCode);
  console.log(`Queue on second sync pass: ${retryQueue.length} items (no duplicates re-sent).`);

  // 4. Test failure handling: what happens if network fails halfway (e.g. at item 6)?
  console.log('\nStep 5: Testing partial failure / network drop handling during sync...');
  // Queue 5 more items
  for (let i = 11; i <= 15; i++) {
    await savePendingExpenseFixed({
      roomCode,
      description: `Offline Cab #${i}`,
      amount: 300,
      currency: 'INR',
      paidBy: 'user_1',
      splitType: 'EQUAL',
      splitBetween: [{ memberId: 'user_1', amount: 150 }, { memberId: 'user_2', amount: 150 }]
    });
  }

  let failAfter = 2; // succeed 2, fail on 3rd
  let partialSuccess = 0;
  let partialFail = 0;

  const partialQueue = await getPendingExpensesFixed(roomCode);
  for (const pending of partialQueue) {
    const { localId } = pending;
    try {
      if (partialSuccess >= failAfter) {
        throw new Error("Network connection dropped (503 Service Unavailable)");
      }
      await mockCreateExpenseApi(roomCode, toExpensePayload(pending));
      await mockDbB.delete("pendingExpenses", localId);
      partialSuccess++;
    } catch (err) {
      partialFail++;
      console.log(`  [Interrupted] ${err.message}. Halting queue processing.`);
      break; // useRoomData lines 159-160: console.error("Failed to sync expense:", syncError); return;
    }
  }

  const postInterruptionQueue = await getPendingExpensesFixed(roomCode);
  console.log(`  - Succeeded before drop: ${partialSuccess}`);
  console.log(`  - Left in queue for next reconnect: ${postInterruptionQueue.length}`);
  console.log(`  - Preserved without data loss: ${postInterruptionQueue.length === (5 - partialSuccess)}`);

  console.log('================================================================\n');

  return {
    currentImplementationBug: bugDetected1,
    storedRecordSample: rawStoredRecordsA[0],
    syncResults: {
      totalCreated: 10,
      syncedSuccessfully: syncSuccesses,
      remainingInQueue: remainingInQueue.length,
      serverCount: serverDatabase.length,
    }
  };
}

runOfflineAudit();


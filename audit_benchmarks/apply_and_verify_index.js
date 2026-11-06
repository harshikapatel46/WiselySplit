const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const mongoose = require(`${serverDir}/node_modules/mongoose`);
const Expense = require(`${serverDir}/src/models/Expense`);

async function verifyIndex() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  console.log('\n--- Syncing Indexes ---');
  await Expense.syncIndexes();
  const indexes = await Expense.collection.getIndexes();
  console.log('Current Expense collection indexes:');
  console.log(JSON.stringify(indexes, null, 2));

  console.log('\n--- Evaluating Query Plan After Indexing ---');
  const expExplain = await Expense.find({ roomCode: 'AUDIT_BENCHMARK_ROOM' })
    .sort({ createdAt: -1 })
    .explain('executionStats');

  console.log('\nQuery: Expense.find({ roomCode }).sort({ createdAt: -1 })');
  console.log('  Execution Stage:', expExplain.executionStats.executionStages.stage);
  console.log('  Total Docs Examined:', expExplain.executionStats.totalDocsExamined);
  console.log('  nReturned:', expExplain.executionStats.nReturned);
  console.log('  Execution Time (ms):', expExplain.executionStats.executionTimeMillis);
  if (expExplain.executionStats.executionStages.inputStage) {
    console.log('  Input Stage:', expExplain.executionStats.executionStages.inputStage.stage);
    console.log('  Index Name:', expExplain.executionStats.executionStages.inputStage.indexName);
  }

  const findOnlyExplain = await Expense.find({ roomCode: 'AUDIT_BENCHMARK_ROOM' })
    .explain('executionStats');

  console.log('\nQuery: Expense.find({ roomCode }) [used in getBalances & getSettlements]');
  console.log('  Execution Stage:', findOnlyExplain.executionStats.executionStages.stage);
  console.log('  Total Docs Examined:', findOnlyExplain.executionStats.totalDocsExamined);
  console.log('  nReturned:', findOnlyExplain.executionStats.nReturned);
  if (findOnlyExplain.executionStats.executionStages.inputStage) {
    console.log('  Input Stage:', findOnlyExplain.executionStats.executionStages.inputStage.stage);
    console.log('  Index Name:', findOnlyExplain.executionStats.executionStages.inputStage.indexName);
  }

  process.exit(0);
}

verifyIndex().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

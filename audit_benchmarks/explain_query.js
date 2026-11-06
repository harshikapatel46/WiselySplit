const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const mongoose = require(`${serverDir}/node_modules/mongoose`);
const Expense = require(`${serverDir}/src/models/Expense`);
const Settlement = require(`${serverDir}/src/models/Settlement`);
const Room = require(`${serverDir}/src/models/Room`);

async function explainQueries() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- MongoDB Query Execution Plan (explain("executionStats")) ---');

  const expExplain = await Expense.find({ roomCode: 'AUDIT_BENCHMARK_ROOM' }).sort({ createdAt: -1 }).explain('executionStats');
  console.log('\n1. Expense.find({ roomCode }).sort({ createdAt: -1 }):');
  console.log('   Stage:', expExplain.executionStats.executionStages.stage);
  console.log('   Total Docs Examined:', expExplain.executionStats.totalDocsExamined);
  console.log('   nReturned:', expExplain.executionStats.nReturned);
  console.log('   Execution Time (ms):', expExplain.executionStats.executionTimeMillis);
  if (expExplain.executionStats.executionStages.inputStage) {
    console.log('   Input Stage:', expExplain.executionStats.executionStages.inputStage.stage);
  }

  const roomExplain = await Room.findOne({ roomCode: 'AUDIT_BENCHMARK_ROOM' }).explain('executionStats');
  console.log('\n2. Room.findOne({ roomCode }):');
  console.log('   Stage:', roomExplain.executionStats.executionStages.stage);
  console.log('   Total Docs Examined:', roomExplain.executionStats.totalDocsExamined);
  console.log('   nReturned:', roomExplain.executionStats.nReturned);
  if (roomExplain.executionStats.executionStages.inputStage) {
    console.log('   Input Stage:', roomExplain.executionStats.executionStages.inputStage.stage);
    console.log('   Index Name:', roomExplain.executionStats.executionStages.inputStage.indexName);
  }

  const setExplain = await Settlement.find({ roomCode: 'AUDIT_BENCHMARK_ROOM', status: 'PAID' }).explain('executionStats');
  console.log('\n3. Settlement.find({ roomCode, status: "PAID" }):');
  console.log('   Stage:', setExplain.executionStats.executionStages.stage);
  console.log('   Total Docs Examined:', setExplain.executionStats.totalDocsExamined);
  console.log('   nReturned:', setExplain.executionStats.nReturned);
  if (setExplain.executionStats.executionStages.inputStage) {
    console.log('   Input Stage:', setExplain.executionStats.executionStages.inputStage.stage);
    console.log('   Index Name:', setExplain.executionStats.executionStages.inputStage.indexName);
  }

  process.exit(0);
}

explainQueries().catch(err => { console.error(err); process.exit(1); });


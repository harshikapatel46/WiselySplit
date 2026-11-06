const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const { generateExpenseInsights } = require(`${serverDir}/src/services/aiInsightService`);

async function testSingle() {
  const sampleExpenses = [
    { description: 'Dinner at Beach Shack', amount: 2400, currency: 'INR', createdAt: new Date().toISOString() },
    { description: 'Taxi to Airport', amount: 850, currency: 'INR', createdAt: new Date().toISOString() },
    { description: 'Grocery and drinks', amount: 1200, currency: 'INR', createdAt: new Date().toISOString() },
  ];

  console.log('Testing single call with configured model in aiInsightService...');
  const start = Date.now();
  try {
    const result = await generateExpenseInsights(sampleExpenses);
    const latency = Date.now() - start;
    console.log(`Call SUCCESS in ${latency}ms!`);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    const latency = Date.now() - start;
    console.error(`Call FAILED after ${latency}ms:`, err.message || err);
    if (err.status) console.error('Status code:', err.status);
    if (err.errorDetails) console.error('Details:', err.errorDetails);
  }
}

testSingle();

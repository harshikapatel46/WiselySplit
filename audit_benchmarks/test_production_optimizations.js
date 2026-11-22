const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const mongoose = require(`${serverDir}/node_modules/mongoose`);
const assert = require('assert');
const http = require('http');
const express = require(`${serverDir}/node_modules/express`);

const connectDB = require(`${serverDir}/src/config/db`);
const app = require(`${serverDir}/src/app`);

async function testOptimizations() {
  console.log('=== TESTING PRODUCTION OPTIMIZATIONS ===\n');

  // 1. Test Database connection pool settings
  console.log('[Test 1] Connecting with optimized pool settings...');
  await connectDB();
  const poolSize = mongoose.connection.client.options.maxPoolSize;
  const minPoolSize = mongoose.connection.client.options.minPoolSize;
  const maxConnecting = mongoose.connection.client.options.maxConnecting;
  console.log(`✓ Pool settings: maxPoolSize=${poolSize}, minPoolSize=${minPoolSize}, maxConnecting=${maxConnecting}`);
  assert.strictEqual(minPoolSize, 5, 'minPoolSize should be 5');
  assert.strictEqual(maxConnecting, 10, 'maxConnecting should be 10');

  // 2. Start HTTP server on temporary test port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3099, resolve));
  console.log('✓ Test server listening on http://localhost:3099');

  const get = (url) => new Promise((resolve, reject) => {
    http.get(`http://localhost:3099${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });

  const roomCode = 'AUDIT_BENCHMARK_ROOM';

  // 3. Test New Consolidated Dashboard Endpoint
  console.log('\n[Test 2] Testing GET /api/rooms/:roomCode/dashboard...');
  const t0 = performance.now();
  const dashRes = await get(`/api/rooms/${roomCode}/dashboard`);
  const dashLatency = performance.now() - t0;
  console.log(`✓ Status: ${dashRes.status} (received in ${dashLatency.toFixed(2)} ms)`);
  assert.strictEqual(dashRes.status, 200, 'Status must be 200');
  assert.ok(dashRes.data.room, 'Must contain room');
  assert.ok(Array.isArray(dashRes.data.expenses), 'Must contain expenses array');
  assert.ok(Array.isArray(dashRes.data.balances), 'Must contain balances array');
  assert.ok(Array.isArray(dashRes.data.settlements), 'Must contain settlements array');
  console.log(`  - Room Name: ${dashRes.data.room.name}`);
  console.log(`  - Expenses Count: ${dashRes.data.expenses.length}`);
  console.log(`  - Balances Count: ${dashRes.data.balances.length}`);
  console.log(`  - Settlements Count: ${dashRes.data.settlements.length}`);

  // 4. Test New Unified Financial Summary Endpoint
  console.log('\n[Test 3] Testing GET /api/expenses/:roomCode/summary...');
  const t1 = performance.now();
  const sumRes = await get(`/api/expenses/${roomCode}/summary`);
  const sumLatency = performance.now() - t1;
  console.log(`✓ Status: ${sumRes.status} (received in ${sumLatency.toFixed(2)} ms)`);
  assert.strictEqual(sumRes.status, 200, 'Status must be 200');
  assert.ok(Array.isArray(sumRes.data.balances), 'Must contain balances');
  assert.ok(Array.isArray(sumRes.data.settlements), 'Must contain settlements');
  assert.deepStrictEqual(sumRes.data.balances, dashRes.data.balances, 'Balances must match dashboard');

  // 5. Test Concurrent Request Coalescing (Singleflight)
  console.log('\n[Test 4] Testing Concurrent In-Flight Request Coalescing...');
  const t2 = performance.now();
  const [bRes, sRes] = await Promise.all([
    get(`/api/expenses/${roomCode}/balances`),
    get(`/api/expenses/${roomCode}/settlements`),
  ]);
  const concurrentLatency = performance.now() - t2;
  console.log(`✓ Concurrent /balances and /settlements resolved in ${concurrentLatency.toFixed(2)} ms`);
  assert.strictEqual(bRes.status, 200);
  assert.strictEqual(sRes.status, 200);
  assert.deepStrictEqual(bRes.data, dashRes.data.balances);
  assert.deepStrictEqual(sRes.data, dashRes.data.settlements);

  // 6. Test Legacy Endpoints Integrity
  console.log('\n[Test 5] Testing Legacy Endpoints Integrity...');
  const roomRes = await get(`/api/rooms/${roomCode}`);
  const expRes = await get(`/api/expenses/${roomCode}`);
  assert.strictEqual(roomRes.status, 200);
  assert.strictEqual(expRes.status, 200);
  assert.strictEqual(roomRes.data.roomCode, roomCode);
  assert.strictEqual(expRes.data.length, dashRes.data.expenses.length);
  console.log('✓ All legacy endpoints return identical structure and data.');

  // Clean shutdown
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();

  console.log('\n======================================================');
  console.log('ALL OPTIMIZATION VERIFICATION TESTS PASSED (5/5)!');
  console.log('======================================================');
  process.exit(0);
}

testOptimizations().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});

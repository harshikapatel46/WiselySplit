const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const serverDir = 'D:/wiselySplit/wiselySplit/server';

function waitForServer(port, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${port}/api/rooms/AUDIT_BENCHMARK_ROOM`, (res) => {
        resolve();
      });
      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Server not ready after ${maxAttempts} attempts: ${err.message}`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

const endpoints = [
  {
    name: "Room Metadata",
    url: "http://localhost:3000/api/rooms/AUDIT_BENCHMARK_ROOM",
  },
  {
    name: "Expenses List (Indexed)",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM",
  },
  {
    name: "Balances Computation",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/balances",
  },
  {
    name: "Settlements Simplification",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/settlements",
  },
  {
    name: "Settlement History",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/settlements/history",
  }
];

async function main() {
  console.log('Starting backend server for Post-Index Load Benchmark...');
  const serverProc = spawn('node', ['src/server.js'], {
    cwd: serverDir,
    stdio: 'pipe',
    env: process.env,
  });

  serverProc.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  try {
    console.log('Waiting for server on port 3000...');
    await waitForServer(3000);
    console.log('Server is responding! Beginning Autocannon load testing (50 conn, 20s each)...\n');

    const results = [];

    for (let i = 0; i < endpoints.length; i++) {
      const ep = endpoints[i];
      console.log(`[${i + 1}/${endpoints.length}] Testing ${ep.name}: ${ep.url}`);
      const cmd = `npx --yes autocannon -c 50 -d 20 -j ${ep.url}`;
      const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const data = JSON.parse(output);

      const totalRequests = data.requests.total;
      const rps = Number((data.requests.average || (totalRequests / 20)).toFixed(2));
      const avgLatency = Number((data.latency.average || data.latency.mean).toFixed(2));
      const p50 = data.latency.p50;
      const p95 = data.latency.p97_5 || data.latency.p90;
      const p99 = data.latency.p99;
      const totalFailed = (data.non2xx || 0) + (data.errors || 0) + (data.timeouts || 0);

      const item = {
        name: ep.name,
        url: ep.url,
        totalRequests,
        rps,
        avgLatency,
        p50,
        p95,
        p99,
        totalFailed,
      };
      results.push(item);
      console.log(`     => Avg: ${avgLatency}ms | p50: ${p50}ms | p95: ${p95}ms | p99: ${p99}ms | RPS: ${rps} | Total: ${totalRequests} | Errors: ${totalFailed}\n`);
      await new Promise(r => setTimeout(r, 1500));
    }

    fs.writeFileSync(
      path.join(__dirname, 'load_test_post_index.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults saved to load_test_post_index.json');
    console.table(results);
  } finally {
    console.log('Shutting down test server...');
    serverProc.kill();
  }
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});

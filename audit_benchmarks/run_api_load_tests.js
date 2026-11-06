const { execSync } = require('child_process');
const fs = require('fs');

const endpoints = [
  {
    name: "Room Metadata",
    url: "http://localhost:3000/api/rooms/AUDIT_BENCHMARK_ROOM",
    description: "Fetches room document and member list (Room.findOne)"
  },
  {
    name: "Expenses List",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM",
    description: "Fetches 50 expense records sorted by createdAt (Expense.find)"
  },
  {
    name: "Balances Computation",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/balances",
    description: "Room.findOne + Expense.find + Settlement.find + calculateBalances"
  },
  {
    name: "Settlements Simplification",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/settlements",
    description: "Room.findOne + Expense.find + Settlement.find + calculateBalances + calculateSettlements"
  },
  {
    name: "Settlement History",
    url: "http://localhost:3000/api/expenses/AUDIT_BENCHMARK_ROOM/settlements/history",
    description: "Room.findOne + Settlement.find({ status: 'PAID' })"
  }
];

async function runLoadTests() {
  console.log('================================================================');
  console.log('         WISELYSPLIT BACKEND API PERFORMANCE BENCHMARK          ');
  console.log('================================================================');
  console.log('Test Target: 50 concurrent connections for 20 seconds per endpoint');
  console.log('Tool: Autocannon v8.0.0 (Node.js load tester)');
  console.log('Environment: Local Node.js / Express / MongoDB on port 3000');
  console.log('Data volume: Room with 10 members, 50 expenses, 5 settlements.\n');

  const benchmarkResults = [];

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    console.log(`[${i + 1}/${endpoints.length}] Testing ${ep.name}...`);
    console.log(`     URL: ${ep.url}`);
    console.log(`     Profile: 50 connections, 20s duration`);

    const cmd = `npx --yes autocannon -c 50 -d 20 -j ${ep.url}`;
    try {
      const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const data = JSON.parse(output);

      const totalRequests = data.requests.total;
      const rps = Number((data.requests.average || (totalRequests / 20)).toFixed(2));
      const avgLatency = Number((data.latency.average || data.latency.mean).toFixed(2));
      const p50Latency = data.latency.p50;
      // Autocannon provides p90, p97_5, p99. Let's compute or take p97_5 as close proxy for p95
      const p95Latency = data.latency.p97_5 || data.latency.p90;
      const p99Latency = data.latency.p99;
      const minLatency = data.latency.min;
      const maxLatency = data.latency.max;

      const non2xx = data.non2xx || 0;
      const errors = data.errors || 0;
      const timeouts = data.timeouts || 0;
      const totalFailed = non2xx + errors + timeouts;
      const errorRate = Number(((totalFailed / (totalRequests + totalFailed || 1)) * 100).toFixed(2));

      const result = {
        name: ep.name,
        endpoint: ep.url.replace('http://localhost:3000', ''),
        description: ep.description,
        totalRequests,
        requestsPerSec: rps,
        avgLatencyMs: avgLatency,
        p50LatencyMs: p50Latency,
        p95LatencyMs: p95Latency,
        p99LatencyMs: p99Latency,
        minLatencyMs: minLatency,
        maxLatencyMs: maxLatency,
        failedRequests: totalFailed,
        errorRatePercent: errorRate,
        statusCodeStats: data.statusCodeStats,
      };

      benchmarkResults.push(result);
      console.log(`     => Avg: ${avgLatency}ms | p50: ${p50Latency}ms | p95: ${p95Latency}ms | p99: ${p99Latency}ms | RPS: ${rps} | Total: ${totalRequests} | Errors: ${totalFailed}\n`);
    } catch (err) {
      console.error(`     FAILED: ${err.message}`);
    }

    // Cool down for 2 seconds
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('----------------------------------------------------------------');
  console.log('SUMMARY TABLE:');
  console.log('----------------------------------------------------------------');
  console.table(benchmarkResults.map(r => ({
    Endpoint: r.name,
    'Req/sec': r.requestsPerSec,
    'Avg Lat (ms)': r.avgLatencyMs,
    'p50 (ms)': r.p50LatencyMs,
    'p95 (ms)': r.p95LatencyMs,
    'p99 (ms)': r.p99LatencyMs,
    'Total Reqs': r.totalRequests,
    'Errors': r.failedRequests,
    'Err %': `${r.errorRatePercent}%`
  })));
  console.log('================================================================\n');

  fs.writeFileSync('D:/wiselySplit/audit_benchmarks/api_load_test_results.json', JSON.stringify(benchmarkResults, null, 2));
}

runLoadTests();


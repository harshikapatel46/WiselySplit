const serverDir = 'D:/wiselySplit/wiselySplit/server';
require(`${serverDir}/node_modules/dotenv`).config({ path: `${serverDir}/.env` });
const { generateExpenseInsights } = require(`${serverDir}/src/services/aiInsightService`);

// 20 representative expense datasets simulating real-world group scenarios
const testScenarios = [
  {
    name: "Weekend Goa Trip",
    expenses: [
      { description: "Villa rental 2 nights", amount: 14500, currency: "INR", createdAt: "2026-10-01T10:00:00Z" },
      { description: "Beach shack seafood dinner", amount: 4800, currency: "INR", createdAt: "2026-10-01T20:30:00Z" },
      { description: "Scooter rental 4 bikes", amount: 2400, currency: "INR", createdAt: "2026-10-02T09:00:00Z" },
      { description: "Water sports at Baga", amount: 6000, currency: "INR", createdAt: "2026-10-02T15:00:00Z" },
      { description: "Late night drinks & snacks", amount: 3200, currency: "INR", createdAt: "2026-10-02T23:00:00Z" },
    ]
  },
  {
    name: "Apartment Monthly Utilities",
    expenses: [
      { description: "Broadband Wi-Fi bill", amount: 1199, currency: "INR", createdAt: "2026-10-05T11:00:00Z" },
      { description: "Electricity bill BESCOM", amount: 2850, currency: "INR", createdAt: "2026-10-05T12:00:00Z" },
      { description: "Drinking water cans 20L", amount: 600, currency: "INR", createdAt: "2026-10-10T14:00:00Z" },
      { description: "Maid and cleaning service", amount: 4500, currency: "INR", createdAt: "2026-10-15T09:00:00Z" },
    ]
  },
  {
    name: "Office Friday Party",
    expenses: [
      { description: "Gourmet Pizza platter", amount: 3450, currency: "INR", createdAt: "2026-10-03T18:00:00Z" },
      { description: "Craft Beer pitcher & cocktails", amount: 6200, currency: "INR", createdAt: "2026-10-03T20:00:00Z" },
      { description: "Uber XL ride home", amount: 920, currency: "INR", createdAt: "2026-10-03T23:30:00Z" },
    ]
  },
  {
    name: "Trek to Western Ghats",
    expenses: [
      { description: "Tempo Traveller fuel & toll", amount: 5600, currency: "INR", createdAt: "2026-10-08T06:00:00Z" },
      { description: "Forest permit & guide fees", amount: 1800, currency: "INR", createdAt: "2026-10-08T10:00:00Z" },
      { description: "Campfire dinner at homestay", amount: 3900, currency: "INR", createdAt: "2026-10-08T20:00:00Z" },
      { description: "Breakfast & tea stall", amount: 840, currency: "INR", createdAt: "2026-10-09T08:30:00Z" },
    ]
  },
  {
    name: "Grocery & Meal Prep",
    expenses: [
      { description: "Supermarket veggies & dairy", amount: 2150, currency: "INR", createdAt: "2026-10-04T16:00:00Z" },
      { description: "Meat & seafood mart", amount: 1850, currency: "INR", createdAt: "2026-10-04T17:00:00Z" },
      { description: "Spices & cooking oil", amount: 980, currency: "INR", createdAt: "2026-10-04T17:30:00Z" },
    ]
  },
  {
    name: "Movie & Arcade Night",
    expenses: [
      { description: "IMAX tickets 5 seats", amount: 2250, currency: "INR", createdAt: "2026-10-11T19:00:00Z" },
      { description: "Popcorn & nachos combo", amount: 1650, currency: "INR", createdAt: "2026-10-11T19:30:00Z" },
      { description: "Bowling alley games", amount: 2500, currency: "INR", createdAt: "2026-10-11T22:00:00Z" },
    ]
  },
  {
    name: "Road Trip to Pondicherry",
    expenses: [
      { description: "Highway tolls Fastag", amount: 680, currency: "INR", createdAt: "2026-10-12T07:00:00Z" },
      { description: "Petrol top-up", amount: 4200, currency: "INR", createdAt: "2026-10-12T11:00:00Z" },
      { description: "French bakery brunch", amount: 2100, currency: "INR", createdAt: "2026-10-12T13:00:00Z" },
      { description: "Heritage hotel stay", amount: 8500, currency: "INR", createdAt: "2026-10-12T18:00:00Z" },
    ]
  },
  {
    name: "Diwali Celebration Potluck",
    expenses: [
      { description: "Sweets & dry fruit gift boxes", amount: 4500, currency: "INR", createdAt: "2026-10-20T11:00:00Z" },
      { description: "Diyas and fairy lights", amount: 1200, currency: "INR", createdAt: "2026-10-20T14:00:00Z" },
      { description: "Biryani handi catering", amount: 5200, currency: "INR", createdAt: "2026-10-20T19:00:00Z" },
    ]
  },
  {
    name: "Gym & Sports Turf",
    expenses: [
      { description: "Football turf 2 hour slot", amount: 2800, currency: "INR", createdAt: "2026-10-14T06:00:00Z" },
      { description: "Energy drinks & coconut water", amount: 540, currency: "INR", createdAt: "2026-10-14T08:00:00Z" },
      { description: "Sports bibs & ball", amount: 1100, currency: "INR", createdAt: "2026-10-14T09:00:00Z" },
    ]
  },
  {
    name: "Sunday Brunch Buffet",
    expenses: [
      { description: "5-star hotel Sunday brunch 4 pax", amount: 9800, currency: "INR", createdAt: "2026-10-18T13:00:00Z" },
      { description: "Valet parking & tip", amount: 300, currency: "INR", createdAt: "2026-10-18T16:00:00Z" },
    ]
  },
  {
    name: "Gaming Console & Setup",
    expenses: [
      { description: "PS5 Multiplayer Game discs", amount: 4999, currency: "INR", createdAt: "2026-10-06T15:00:00Z" },
      { description: "Extra DualSense controller", amount: 5800, currency: "INR", createdAt: "2026-10-06T15:30:00Z" },
      { description: "HDMI 2.1 cable & extension", amount: 850, currency: "INR", createdAt: "2026-10-06T16:00:00Z" },
    ]
  },
  {
    name: "Festival Music Concert",
    expenses: [
      { description: "VIP Festival Passes x 3", amount: 13500, currency: "INR", createdAt: "2026-10-22T17:00:00Z" },
      { description: "Concert merchandise & t-shirts", amount: 3600, currency: "INR", createdAt: "2026-10-22T21:00:00Z" },
      { description: "Cab surge fare return", amount: 1450, currency: "INR", createdAt: "2026-10-23T01:00:00Z" },
    ]
  },
  {
    name: "Home Barbeque Party",
    expenses: [
      { description: "Portable grill & charcoal", amount: 2800, currency: "INR", createdAt: "2026-10-16T16:00:00Z" },
      { description: "Marinated skewers & dips", amount: 3100, currency: "INR", createdAt: "2026-10-16T18:00:00Z" },
      { description: "Beverages and ice bags", amount: 1400, currency: "INR", createdAt: "2026-10-16T19:00:00Z" },
    ]
  },
  {
    name: "Co-working Space Day Pass",
    expenses: [
      { description: "Team flexi desk passes", amount: 3600, currency: "INR", createdAt: "2026-10-07T09:00:00Z" },
      { description: "Artisanal coffee & snacks", amount: 950, currency: "INR", createdAt: "2026-10-07T11:00:00Z" },
      { description: "Conference room 1 hr", amount: 1500, currency: "INR", createdAt: "2026-10-07T15:00:00Z" },
    ]
  },
  {
    name: "Camping by the Lake",
    expenses: [
      { description: "Tents & sleeping bag rentals", amount: 4200, currency: "INR", createdAt: "2026-10-24T15:00:00Z" },
      { description: "Barbeque dinner & firewood", amount: 2600, currency: "INR", createdAt: "2026-10-24T20:00:00Z" },
      { description: "Kayaking activity per person", amount: 1800, currency: "INR", createdAt: "2026-10-25T07:30:00Z" },
    ]
  },
  {
    name: "Birthday Surprise Party",
    expenses: [
      { description: "Custom fondant birthday cake", amount: 2400, currency: "INR", createdAt: "2026-10-17T17:00:00Z" },
      { description: "Helium balloons & decor", amount: 1100, currency: "INR", createdAt: "2026-10-17T17:30:00Z" },
      { description: "Rooftop restobar dinner", amount: 7600, currency: "INR", createdAt: "2026-10-17T20:30:00Z" },
    ]
  },
  {
    name: "Coffee Shop Work Sessions",
    expenses: [
      { description: "Cold brew and croissants", amount: 740, currency: "INR", createdAt: "2026-10-13T10:30:00Z" },
      { description: "Avocado toast & matcha latte", amount: 920, currency: "INR", createdAt: "2026-10-15T15:00:00Z" },
      { description: "Filter coffee and sandwiches", amount: 610, currency: "INR", createdAt: "2026-10-19T11:00:00Z" },
    ]
  },
  {
    name: "Home Deep Cleaning",
    expenses: [
      { description: "Urban Company deep cleaning", amount: 4800, currency: "INR", createdAt: "2026-10-21T09:00:00Z" },
      { description: "Sofa shampooing service", amount: 1800, currency: "INR", createdAt: "2026-10-21T11:30:00Z" },
      { description: "Pest control kitchen treatment", amount: 1400, currency: "INR", createdAt: "2026-10-21T14:00:00Z" },
    ]
  },
  {
    name: "Amusement Park Day Out",
    expenses: [
      { description: "Wonderla fastrack entry tickets", amount: 7200, currency: "INR", createdAt: "2026-10-25T10:00:00Z" },
      { description: "Lockers and costume rental", amount: 800, currency: "INR", createdAt: "2026-10-25T11:00:00Z" },
      { description: "Food court lunch buffet", amount: 2900, currency: "INR", createdAt: "2026-10-25T14:00:00Z" },
    ]
  },
  {
    name: "Diwali Card Night & Snacks",
    expenses: [
      { description: "Playing card deck & casino chips", amount: 950, currency: "INR", createdAt: "2026-10-23T19:00:00Z" },
      { description: "Kathi rolls & momos platter", amount: 2150, currency: "INR", createdAt: "2026-10-23T21:00:00Z" },
      { description: "Artisan ice cream tubs", amount: 1400, currency: "INR", createdAt: "2026-10-23T23:00:00Z" },
    ]
  }
];

async function runGeminiBenchmark() {
  console.log('================================================================');
  console.log('         GEMINI AI LATENCY & RELIABILITY BENCHMARK             ');
  console.log('================================================================');
  console.log('Target: 20 sequential requests with representative expense datasets');
  console.log('Configured Model: gemini-3.6-flash');
  console.log('Using ACTUAL aiInsightService.generateExpenseInsights implementation.\n');

  const runs = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    const reqNum = i + 1;
    process.stdout.write(`[${reqNum}/20] Testing "${scenario.name}" ... `);

    const startTime = Date.now();
    try {
      const response = await generateExpenseInsights(scenario.expenses);
      const latencyMs = Date.now() - startTime;
      successCount++;

      runs.push({
        requestIndex: reqNum,
        scenario: scenario.name,
        success: true,
        latencyMs,
        summary: response.summary,
        topCategory: response.topCategory,
        observation: response.observation,
        suggestion: response.suggestion,
      });

      console.log(`OK in ${latencyMs}ms | Category: ${response.topCategory}`);
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      failureCount++;

      runs.push({
        requestIndex: reqNum,
        scenario: scenario.name,
        success: false,
        latencyMs,
        error: err.message || String(err),
        statusCode: err.status || 'N/A',
      });

      console.log(`FAILED after ${latencyMs}ms: ${err.message}`);
    }

    // Small delay between requests to avoid burst rate-limits
    await new Promise(r => setTimeout(r, 600));
  }

  // Calculate metrics
  const successfulLatencies = runs.filter(r => r.success).map(r => r.latencyMs).sort((a, b) => a - b);
  
  let avgLatency = 0;
  let medianLatency = 0;
  let minLatency = 0;
  let maxLatency = 0;
  let p90Latency = 0;

  if (successfulLatencies.length > 0) {
    const sum = successfulLatencies.reduce((a, b) => a + b, 0);
    avgLatency = sum / successfulLatencies.length;
    minLatency = successfulLatencies[0];
    maxLatency = successfulLatencies[successfulLatencies.length - 1];

    const mid = Math.floor(successfulLatencies.length / 2);
    medianLatency = successfulLatencies.length % 2 !== 0
      ? successfulLatencies[mid]
      : (successfulLatencies[mid - 1] + successfulLatencies[mid]) / 2;

    const p90Idx = Math.floor(successfulLatencies.length * 0.9);
    p90Latency = successfulLatencies[p90Idx];
  }

  console.log('\n----------------------------------------------------------------');
  console.log('GEMINI AI BENCHMARK SUMMARY:');
  console.log('----------------------------------------------------------------');
  console.log(`Model Configured          : gemini-3.6-flash`);
  console.log(`Total Requests            : ${testScenarios.length}`);
  console.log(`Successful Requests       : ${successCount}`);
  console.log(`Failed Requests           : ${failureCount}`);
  console.log(`Success Rate              : ${((successCount / testScenarios.length) * 100).toFixed(1)}%`);
  console.log('----------------------------------------------------------------');
  console.log(`Minimum Latency           : ${minLatency} ms`);
  console.log(`Average Latency           : ${avgLatency.toFixed(2)} ms`);
  console.log(`Median (p50) Latency      : ${medianLatency} ms`);
  console.log(`p90 Latency               : ${p90Latency} ms`);
  console.log(`Maximum Latency           : ${maxLatency} ms`);
  console.log('----------------------------------------------------------------');
  console.log('Detailed Request Log:');
  runs.forEach(r => {
    if (r.success) {
      console.log(`  Req #${r.requestIndex.toString().padStart(2, ' ')}: ${r.latencyMs.toString().padStart(5, ' ')} ms | ${r.scenario.padEnd(30, ' ')} | Category: ${r.topCategory}`);
    } else {
      console.log(`  Req #${r.requestIndex.toString().padStart(2, ' ')}: ${r.latencyMs.toString().padStart(5, ' ')} ms | ${r.scenario.padEnd(30, ' ')} | FAILED: ${r.error}`);
    }
  });
  console.log('================================================================\n');

  // Return data for audit report
  return {
    model: 'gemini-3.6-flash',
    totalRequests: testScenarios.length,
    successfulRequests: successCount,
    failedRequests: failureCount,
    avgLatency: Number(avgLatency.toFixed(2)),
    medianLatency,
    minLatency,
    maxLatency,
    p90Latency,
    runs
  };
}

if (require.main === module) {
  runGeminiBenchmark().then(data => {
    const fs = require('fs');
    fs.writeFileSync('D:/wiselySplit/audit_benchmarks/gemini_results.json', JSON.stringify(data, null, 2));
  }).catch(err => {
    console.error('Fatal benchmark error:', err);
  });
}

module.exports = { runGeminiBenchmark };


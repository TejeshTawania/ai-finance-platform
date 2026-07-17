/**
 * tests/load/page-load-test.js
 *
 * LOAD TEST — Next.js page response times (no auth, no DB writes)
 * ────────────────────────────────────────────────────────────────
 * Tests how fast your app responds under concurrent users hitting
 * public pages. No external tools needed — pure Node.js fetch.
 *
 * Prerequisites: npm run dev  (app must be running on localhost:3000)
 * Run:  node tests/load/page-load-test.js
 *
 * What it measures:
 *   - Min / Max / Avg / P95 response times per route
 *   - Error rate (non-200 or network failures)
 *   - Whether Next.js caching (revalidatePath) is helping
 */

const BASE_URL = "http://localhost:3000";

// ── Test config ───────────────────────────────
const SCENARIOS = [
  {
    name: "Landing Page (SSR)",
    url: `${BASE_URL}/`,
    method: "GET",
    // First render is SSR; repeated hits should be cached by Next.js
    requests: 30,
    concurrency: 5,
  },
  {
    name: "Sign-In Page (Clerk Auth UI)",
    url: `${BASE_URL}/sign-in`,
    method: "GET",
    requests: 20,
    concurrency: 5,
  },
];

// ── Core fetch helper ─────────────────────────
async function measureRequest(url, method = "GET", body = null) {
  const start = performance.now();
  try {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const ms = performance.now() - start;
    return { ok: res.ok, status: res.status, ms };
  } catch (err) {
    return { ok: false, status: "ERR", ms: performance.now() - start, err: err.message };
  }
}

// ── Run one scenario ──────────────────────────
async function runScenario({ name, url, method, requests, concurrency }) {
  console.log(`\n🚀 Scenario: ${name}`);
  console.log(`   URL: ${url}  |  ${requests} req  |  ${concurrency} concurrent`);

  const allTimes = [];
  let errors = 0;

  for (let i = 0; i < requests; i += concurrency) {
    const batchSize = Math.min(concurrency, requests - i);
    const batch = Array.from({ length: batchSize }, () => measureRequest(url, method));
    const results = await Promise.all(batch);
    for (const r of results) {
      allTimes.push(r.ms);
      if (!r.ok) errors++;
    }
  }

  // Stats
  allTimes.sort((a, b) => a - b);
  const min = allTimes[0].toFixed(1);
  const max = allTimes[allTimes.length - 1].toFixed(1);
  const avg = (allTimes.reduce((s, v) => s + v, 0) / allTimes.length).toFixed(1);
  const p95 = allTimes[Math.floor(allTimes.length * 0.95)].toFixed(1);
  const errorRate = ((errors / requests) * 100).toFixed(1);

  console.log(`\n   ┌─────────────────────────────────┐`);
  console.log(`   │  Min    : ${String(min).padEnd(8)} ms             │`);
  console.log(`   │  Avg    : ${String(avg).padEnd(8)} ms             │`);
  console.log(`   │  P95    : ${String(p95).padEnd(8)} ms             │`);
  console.log(`   │  Max    : ${String(max).padEnd(8)} ms             │`);
  console.log(`   │  Errors : ${String(errors).padEnd(3)} / ${requests}  (${errorRate}%)        │`);
  console.log(`   └─────────────────────────────────┘`);

  // Grade
  const avgNum = parseFloat(avg);
  if (avgNum < 200) console.log(`   🟢 FAST  — Next.js caching is working well`);
  else if (avgNum < 800) console.log(`   🟡 OK    — Acceptable for SSR (cold starts expected)`);
  else console.log(`   🔴 SLOW  — Check DB queries or missing caching`);
}

// ── Main ──────────────────────────────────────
async function main() {
  console.log("════════════════════════════════════════");
  console.log("  FinanceGuru — Page Load Test");
  console.log(`  Target: ${BASE_URL}`);
  console.log("════════════════════════════════════════");

  for (const scenario of SCENARIOS) {
    await runScenario(scenario);
  }

  console.log("\n✅ Load test complete.");
  console.log("\nNext steps:");
  console.log("  - P95 > 1000ms → investigate DB query time in Prisma");
  console.log("  - Errors > 0   → check if dev server is running (npm run dev)");
  console.log("  - Run again after a warm-up request to see cache benefit");
}

main();

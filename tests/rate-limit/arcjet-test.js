/**
 * tests/rate-limit/arcjet-test.js
 *
 * ARCJET RATE LIMIT STRESS TEST
 * ─────────────────────────────
 * Fires N rapid requests to a public Next.js page (no auth needed).
 * Verifies that ArcJet starts blocking after the token bucket empties.
 *
 * Prerequisites: npm run dev  (app must be running on localhost:3000)
 * Run:  node tests/rate-limit/arcjet-test.js
 */

const BASE_URL = "http://localhost:3000";

// ArcJet is configured: 10 tokens, refillRate 10/hr
// We fire 15 requests quickly — expect first ~10 to succeed, rest blocked
const TOTAL_REQUESTS = 15;
const CONCURRENCY = 5; // parallel at a time

async function fireRequest(index) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/`, {
      method: "GET",
      headers: { "Content-Type": "text/html" },
    });
    const ms = Date.now() - start;
    return { index, status: res.status, ms, ok: res.ok };
  } catch (err) {
    return { index, status: "ERR", ms: Date.now() - start, ok: false, err: err.message };
  }
}

async function runInBatches(total, concurrency) {
  const results = [];
  for (let i = 0; i < total; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, total - i) }, (_, j) =>
      fireRequest(i + j + 1)
    );
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    // tiny delay between batches so we can see ordering
    await new Promise((r) => setTimeout(r, 50));
  }
  return results;
}

async function main() {
  console.log(`\n🔥 ArcJet Rate Limit Test`);
  console.log(`   Target  : ${BASE_URL}`);
  console.log(`   Requests: ${TOTAL_REQUESTS}  |  Concurrency: ${CONCURRENCY}`);
  console.log(`   ArcJet  : 10 tokens / hour (token bucket)\n`);

  const results = await runInBatches(TOTAL_REQUESTS, CONCURRENCY);

  // Summary table
  console.log("Req#  Status  Time(ms)  Result");
  console.log("────  ──────  ────────  ──────");
  let blocked = 0;
  let passed = 0;

  for (const r of results) {
    const verdict = r.status === 429 ? "🚫 BLOCKED" : r.ok ? "✅ PASSED" : `⚠️  ${r.status}`;
    if (r.status === 429) blocked++;
    else if (r.ok) passed++;
    console.log(`  ${String(r.index).padStart(2)}   ${String(r.status).padEnd(6)}  ${String(r.ms).padEnd(8)}  ${verdict}`);
  }

  console.log(`\n📊 Summary`);
  console.log(`   Passed : ${passed}`);
  console.log(`   Blocked: ${blocked}`);
  console.log(`   Total  : ${results.length}`);

  if (blocked > 0) {
    console.log(`\n✅ ArcJet rate limiting is WORKING — ${blocked} request(s) were blocked.`);
  } else {
    console.log(`\n⚠️  No requests were blocked. This may mean:`);
    console.log(`   - App is not running (check: npm run dev)`);
    console.log(`   - ArcJet is in DRY_RUN mode (check lib/arcjet.js → mode: "LIVE")`);
    console.log(`   - Token bucket already refilled (wait an hour and retry)`);
  }
}

main();

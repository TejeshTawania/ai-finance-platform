/**
 * tests/unit/utils.test.js
 *
 * UNIT TESTS — pure utility functions (no DB, no Clerk, no network)
 * Run: npx jest tests/unit/utils.test.js
 */

// ─────────────────────────────────────────────
// Copied pure helpers from transaction.js & inngest/function.js
// (avoids importing "use server" file which breaks in Jest)
// ─────────────────────────────────────────────
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

function serializeAmount(obj) {
  return { ...obj, amount: obj.amount.toNumber() };
}

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return nextDue <= today;
}

// ─────────────────────────────────────────────
// TESTS: calculateNextRecurringDate
// ─────────────────────────────────────────────
describe("calculateNextRecurringDate", () => {
  const base = new Date("2025-01-15");

  test("DAILY adds exactly 1 day", () => {
    const result = calculateNextRecurringDate(base, "DAILY");
    expect(result.getDate()).toBe(16);
    expect(result.getMonth()).toBe(0);
  });

  test("WEEKLY adds exactly 7 days", () => {
    const result = calculateNextRecurringDate(base, "WEEKLY");
    expect(result.getDate()).toBe(22);
  });

  test("MONTHLY increments month by 1", () => {
    const result = calculateNextRecurringDate(base, "MONTHLY");
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(15);
  });

  test("YEARLY increments year by 1", () => {
    const result = calculateNextRecurringDate(base, "YEARLY");
    expect(result.getFullYear()).toBe(2026);
  });

  test("does not mutate the original date", () => {
    const original = new Date("2025-06-01");
    const snapshot = original.getTime();
    calculateNextRecurringDate(original, "MONTHLY");
    expect(original.getTime()).toBe(snapshot);
  });

  test("returns a Date object in all cases", () => {
    ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].forEach((interval) => {
      expect(calculateNextRecurringDate(base, interval)).toBeInstanceOf(Date);
    });
  });
});

// ─────────────────────────────────────────────
// TESTS: serializeAmount
// ─────────────────────────────────────────────
describe("serializeAmount", () => {
  test("converts Prisma Decimal .toNumber() to a plain JS number", () => {
    const mockDecimal = { toNumber: () => 99.99 };
    const result = serializeAmount({ id: "abc", amount: mockDecimal, type: "EXPENSE" });
    expect(result.amount).toBe(99.99);
    expect(typeof result.amount).toBe("number");
  });

  test("preserves all other fields without modification", () => {
    const mockDecimal = { toNumber: () => 50 };
    const result = serializeAmount({ id: "xyz", amount: mockDecimal, category: "food" });
    expect(result.id).toBe("xyz");
    expect(result.category).toBe("food");
  });

  test("handles zero amount correctly", () => {
    const mockDecimal = { toNumber: () => 0 };
    const result = serializeAmount({ id: "zero", amount: mockDecimal });
    expect(result.amount).toBe(0);
  });
});

// ─────────────────────────────────────────────
// TESTS: isTransactionDue
// ─────────────────────────────────────────────
describe("isTransactionDue", () => {
  test("returns true when lastProcessed is null (never ran)", () => {
    const tx = { lastProcessed: null, nextRecurringDate: new Date() };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("returns true when nextRecurringDate is in the past", () => {
    const tx = {
      lastProcessed: new Date("2025-01-01"),
      nextRecurringDate: new Date("2025-01-10"),
    };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("returns false when nextRecurringDate is far in the future", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);
    const tx = { lastProcessed: new Date(), nextRecurringDate: future };
    expect(isTransactionDue(tx)).toBe(false);
  });
});

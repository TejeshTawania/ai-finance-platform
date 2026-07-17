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
// TESTS: calculateNextRecurringDate (Date Math & Boundaries)
// ─────────────────────────────────────────────
describe("calculateNextRecurringDate - Standard Intervals", () => {
  const base = new Date("2025-01-15T12:00:00Z");

  test("DAILY adds exactly 1 day", () => {
    expect(calculateNextRecurringDate(base, "DAILY").toISOString()).toBe(new Date("2025-01-16T12:00:00Z").toISOString());
  });

  test("WEEKLY adds exactly 7 days", () => {
    expect(calculateNextRecurringDate(base, "WEEKLY").toISOString()).toBe(new Date("2025-01-22T12:00:00Z").toISOString());
  });

  test("MONTHLY increments month by 1", () => {
    expect(calculateNextRecurringDate(base, "MONTHLY").toISOString()).toBe(new Date("2025-02-15T12:00:00Z").toISOString());
  });

  test("YEARLY increments year by 1", () => {
    expect(calculateNextRecurringDate(base, "YEARLY").toISOString()).toBe(new Date("2026-01-15T12:00:00Z").toISOString());
  });
});

describe("calculateNextRecurringDate - Edge Cases & Boundaries", () => {
  test("MONTHLY rollover at end of January (Jan 31 -> Mar 3 due to Date math)", () => {
    const endOfJan = new Date("2025-01-31T12:00:00Z");
    const result = calculateNextRecurringDate(endOfJan, "MONTHLY");
    expect(result.getMonth()).toBe(2); // March (0-indexed)
  });

  test("MONTHLY rollover on leap year (Feb 29 -> Mar 29)", () => {
    const leapYear = new Date("2024-02-29T12:00:00Z");
    const result = calculateNextRecurringDate(leapYear, "MONTHLY");
    expect(result.toISOString()).toBe(new Date("2024-03-29T12:00:00Z").toISOString());
  });

  test("YEARLY rollover on leap year (Feb 29 -> Mar 1 next year)", () => {
    const leapYear = new Date("2024-02-29T12:00:00Z");
    const result = calculateNextRecurringDate(leapYear, "YEARLY");
    expect(result.toISOString()).toBe(new Date("2025-03-01T12:00:00Z").toISOString());
  });

  test("DAILY rollover at end of month (Jan 31 -> Feb 1)", () => {
    const endOfMonth = new Date("2025-01-31T12:00:00Z");
    expect(calculateNextRecurringDate(endOfMonth, "DAILY").toISOString()).toBe(new Date("2025-02-01T12:00:00Z").toISOString());
  });

  test("DAILY rollover at end of year (Dec 31 -> Jan 1)", () => {
    const endOfYear = new Date("2025-12-31T12:00:00Z");
    expect(calculateNextRecurringDate(endOfYear, "DAILY").toISOString()).toBe(new Date("2026-01-01T12:00:00Z").toISOString());
  });

  test("WEEKLY rollover across years (Dec 28 -> Jan 4)", () => {
    const endOfYear = new Date("2025-12-28T12:00:00Z");
    expect(calculateNextRecurringDate(endOfYear, "WEEKLY").toISOString()).toBe(new Date("2026-01-04T12:00:00Z").toISOString());
  });
});

describe("calculateNextRecurringDate - Immutability & Types", () => {
  test("does not mutate the original Date object reference", () => {
    const original = new Date("2025-06-01T00:00:00Z");
    const snapshot = original.getTime();
    calculateNextRecurringDate(original, "MONTHLY");
    expect(original.getTime()).toBe(snapshot);
  });

  test("accepts string ISO dates and returns valid Date object", () => {
    const result = calculateNextRecurringDate("2025-01-01T00:00:00Z", "DAILY");
    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(2);
  });

  test("accepts numeric timestamps and returns valid Date object", () => {
    const timestamp = new Date("2025-01-01T00:00:00Z").getTime();
    const result = calculateNextRecurringDate(timestamp, "DAILY");
    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(2);
  });

  test("returns unchanged date if interval is unrecognized", () => {
    const base = new Date("2025-01-01T00:00:00Z");
    const result = calculateNextRecurringDate(base, "INVALID_INTERVAL");
    expect(result.toISOString()).toBe(base.toISOString());
  });
});

// ─────────────────────────────────────────────
// TESTS: serializeAmount (Prisma Decimal hydration)
// ─────────────────────────────────────────────
describe("serializeAmount - Decimal Conversion", () => {
  test("converts standard Prisma Decimal .toNumber() to float", () => {
    const mockDecimal = { toNumber: () => 99.99 };
    const result = serializeAmount({ id: "abc", amount: mockDecimal, type: "EXPENSE" });
    expect(result.amount).toBe(99.99);
    expect(typeof result.amount).toBe("number");
  });

  test("handles zero amount properly", () => {
    const mockDecimal = { toNumber: () => 0 };
    const result = serializeAmount({ id: "zero", amount: mockDecimal });
    expect(result.amount).toBe(0);
    expect(typeof result.amount).toBe("number");
  });

  test("handles negative amounts", () => {
    const mockDecimal = { toNumber: () => -500.55 };
    const result = serializeAmount({ id: "neg", amount: mockDecimal });
    expect(result.amount).toBe(-500.55);
  });

  test("handles extremely large monetary values securely", () => {
    const mockDecimal = { toNumber: () => 999999999.99 };
    const result = serializeAmount({ id: "large", amount: mockDecimal });
    expect(result.amount).toBe(999999999.99);
  });
});

describe("serializeAmount - Object Integrity", () => {
  test("preserves all unrelated siblings in the object", () => {
    const mockDecimal = { toNumber: () => 50 };
    const input = { id: "xyz", amount: mockDecimal, category: "food", isRecurring: true, tags: ["urgent"] };
    const result = serializeAmount(input);
    expect(result.id).toBe("xyz");
    expect(result.category).toBe("food");
    expect(result.isRecurring).toBe(true);
    expect(result.tags).toEqual(["urgent"]);
  });

  test("does not mutate the original object", () => {
    const mockDecimal = { toNumber: () => 10 };
    const input = { amount: mockDecimal };
    const result = serializeAmount(input);
    expect(input.amount).toBe(mockDecimal); // Original remains untouched
    expect(result.amount).toBe(10); // Result is mutated
  });

  test("crashes gracefully or passes through if amount is missing", () => {
    // Current simple implementation throws on missing amount if it tries obj.amount.toNumber()
    // We expect it to throw a TypeError for undefined.toNumber()
    expect(() => serializeAmount({ id: "no-amount" })).toThrow(TypeError);
  });
});

// ─────────────────────────────────────────────
// TESTS: isTransactionDue (Inngest Worker Logic)
// ─────────────────────────────────────────────
describe("isTransactionDue - Time Comparisons", () => {
  beforeAll(() => {
    // Mock system time to ensure tests don't fail randomly at midnight
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("returns true if transaction has never been processed", () => {
    const tx = { lastProcessed: null, nextRecurringDate: new Date("2025-07-01T00:00:00Z") };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("returns true if nextRecurringDate is strictly in the past", () => {
    const tx = { lastProcessed: new Date("2025-05-01T00:00:00Z"), nextRecurringDate: new Date("2025-06-01T00:00:00Z") };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("returns true if nextRecurringDate is exactly right now", () => {
    const tx = { lastProcessed: new Date("2025-05-15T00:00:00Z"), nextRecurringDate: new Date("2025-06-15T12:00:00Z") };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("returns false if nextRecurringDate is in the future (1 second from now)", () => {
    const tx = { lastProcessed: new Date("2025-05-15T00:00:00Z"), nextRecurringDate: new Date("2025-06-15T12:00:01Z") };
    expect(isTransactionDue(tx)).toBe(false);
  });

  test("returns false if nextRecurringDate is far in the future", () => {
    const tx = { lastProcessed: new Date("2025-05-15T00:00:00Z"), nextRecurringDate: new Date("2026-06-15T12:00:00Z") };
    expect(isTransactionDue(tx)).toBe(false);
  });
});

describe("isTransactionDue - Edge Cases", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("handles string-based nextRecurringDate correctly", () => {
    const tx = { lastProcessed: new Date("2024-01-01T00:00:00Z"), nextRecurringDate: "2024-12-31T00:00:00Z" };
    expect(isTransactionDue(tx)).toBe(true);
  });

  test("handles numeric timestamp nextRecurringDate correctly", () => {
    const tx = { lastProcessed: new Date("2024-01-01T00:00:00Z"), nextRecurringDate: new Date("2025-01-02T00:00:00Z").getTime() };
    expect(isTransactionDue(tx)).toBe(false);
  });

  test("handles missing nextRecurringDate gracefully (evaluates Invalid Date to false)", () => {
    const tx = { lastProcessed: new Date() }; // nextRecurringDate is undefined
    expect(isTransactionDue(tx)).toBe(false); 
  });
});

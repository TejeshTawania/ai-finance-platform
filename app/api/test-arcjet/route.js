import arcjet, { tokenBucket } from "@arcjet/next";
import { NextResponse } from "next/server";

const testAj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track by IP instead of logged-in user
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 500, // Match production limit
      interval: 3600, // per hour
      capacity: 500, // match production capacity
    }),
  ],
});

export async function GET(req) {
  const decision = await testAj.protect(req, { requested: 1 });
  
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  
  return NextResponse.json({ success: true });
}

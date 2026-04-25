import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitByIP } from "@/lib/redis";

const FEATURE_ANSWERS = process.env.FEATURE_ANSWERS || "";

const featureAnswers: Record<string, string> = {};
FEATURE_ANSWERS.split(",").forEach((item) => {
  const [id, hash] = item.split(":");
  if (id && hash) {
    featureAnswers[id] = hash;
  }
});

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 guesses per IP per feature per day
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, remaining } = await rateLimitByIP(ip, "feature-guess", 5, "1 d");
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      );
    }

    const { featureId, guess } = await request.json();

    if (!featureId || !guess) {
      return NextResponse.json(
        { error: "Missing featureId or guess" },
        { status: 400 }
      );
    }

    const normalizedGuess = guess.toLowerCase().trim();
    const expectedHash = featureAnswers[featureId];

    if (!expectedHash) {
      return NextResponse.json(
        { error: "Invalid feature ID" },
        { status: 400 }
      );
    }

    const guessHash = simpleHash(normalizedGuess);
    const isCorrect = guessHash === expectedHash;

    if (isCorrect) {
      const giftCode = `PRO-${Date.now().toString(36).toUpperCase()}`;
      return NextResponse.json({
        correct: true,
        giftCode,
      });
    }

    return NextResponse.json({
      correct: false,
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error("Feature guess error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
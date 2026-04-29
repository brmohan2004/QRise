import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitByIP } from "@/lib/redis";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 guesses per IP per feature per day
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success, remaining } = await rateLimitByIP(ip, "feature-guess", 10, "1 d");
    
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

    const supabase = await createClient();
    const { data: feature, error: dbError } = await supabase
      .from('features_quiz')
      .select('*')
      .eq('id', featureId)
      .eq('is_visible', true)
      .single();

    if (dbError || !feature) {
      return NextResponse.json(
        { error: "Invalid feature ID or hidden feature" },
        { status: 400 }
      );
    }

    const normalizedGuess = guess.toLowerCase().trim();
    const guessHash = crypto.createHash('sha256').update(normalizedGuess).digest('hex');
    const isCorrect = guessHash === feature.answer_hash;

    if (isCorrect) {
      // Increment correct guesses count
      await supabase
        .from('features_quiz')
        .update({ correct_guesses: (feature.correct_guesses || 0) + 1 })
        .eq('id', featureId);

      return NextResponse.json({
        correct: true,
        giftCode: feature.gift_code || "SURPRISE-REWARD",
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
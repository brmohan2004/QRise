import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformConfig } from "@/lib/db/schema";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all configs
    const configs = await db.select().from(platformConfig);
    
    const pipe = redis.pipeline();
    for (const config of configs) {
      const redisKey = config.key === 'maintenance_mode' ? 'platform:maintenance' : 
                       config.key === 'read_only_mode' ? 'platform:read_only' : 
                       `config:${config.key}`;
      
      // If boolean-like, store as 'true' or remove
      if (config.value === 'true' || config.value === true) {
        pipe.set(redisKey, 'true');
      } else if (config.value === 'false' || config.value === false) {
        pipe.del(redisKey);
      } else {
        pipe.set(redisKey, String(config.value));
      }
    }
    
    await pipe.exec();

    return NextResponse.json({ 
      success: true, 
      warmedCount: configs.length,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron warm-cache failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

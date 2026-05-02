import { createClient } from "@/lib/supabase/server";
import { authenticateAPIKey } from "@/lib/api-key-middleware";
import { db } from "@/lib/db";
import { users, plans, type Plan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { AnyPgTable } from "drizzle-orm/pg-core";

export interface AuthenticatedUser {
  id: string;
  email: string;
  scopes?: string[];
  isApiKey?: boolean;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  // 1. Try API Key Auth
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.replace("Bearer ", "");
    const result = await authenticateAPIKey(key);
    if (result) {
      // Fetch user details to match session format
      const user = await db.select().from(users).where(eq(users.id, result.userId)).limit(1);
      if (user[0]) {
        return {
          id: user[0].id,
          email: user[0].email,
          scopes: result.scopes,
          isApiKey: true,
        };
      }
    }
    return null;
  }

  // 2. Try Session Auth (Supabase)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return {
      id: user.id,
      email: user.email!,
      isApiKey: false,
    };
  }

  return null;
}

export async function verifyOwnership(userId: string, resourceId: string, table: any): Promise<boolean> {
  const result = await db.select().from(table).where(eq(table.id, resourceId)).limit(1);
  return result[0]?.userId === userId;
}


export async function requirePlanFeature(userId: string, feature: keyof Plan): Promise<boolean> {
  const result = await db
    .select({
      userPlan: users.plan,
      planData: plans,
    })
    .from(users)
    .leftJoin(plans, eq(users.plan, plans.name))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result[0] || !result[0].planData) return false;
  
  return !!result[0].planData[feature];
}

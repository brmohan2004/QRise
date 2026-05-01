import { db } from '@/lib/db';
import { qrCodes, type QRCode, type NewQRCode, qrRedirectHistory, type NewQRRedirectHistory, routingRules, type NewRoutingRule, qrActions, type NewQRAction, bulkJobs, type NewBulkJob, type BulkJob } from '@/lib/db/schema';
import { type RoutingRule as TypeRoutingRule, type QRAction as TypeQRAction } from '@/types/qr.types';
import { eq, inArray, and } from 'drizzle-orm';
import { generateShortCode } from '@/lib/short-code';
import bcrypt from 'bcryptjs';

export async function createQR(
  userId: string,
  data: {
    name: string;
    type: 'url' | 'smart_routing' | 'password' | 'multi_action' | 'bulk';
    targetUrl?: string;
    isDynamic?: boolean;
    password?: string;
    rules?: Partial<TypeRoutingRule>[];
    actions?: Partial<TypeQRAction>[];
  }
): Promise<QRCode> {
  const shortCode = await generateUniqueShortCode();
  
  let passwordHash: string | undefined;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 12);
  }
  
  const result = await db.insert(qrCodes).values({
    userId,
    name: data.name,
    type: data.type,
    shortCode,
    targetUrl: data.targetUrl,
    isDynamic: data.isDynamic ?? true,
    passwordHash,
  } as NewQRCode).returning();
  
  const qr = result[0];

  // Handle routing rules if type is smart_routing
  if (data.type === 'smart_routing' && data.rules && data.rules.length > 0) {
    const rulesToInsert: NewRoutingRule[] = data.rules.map((rule, index) => ({
      qrId: qr.id,
      priority: rule.priority ?? index,
      conditions: rule.conditions!,
      targetUrl: rule.targetUrl!,
      label: rule.label,
    }));
    
    await db.insert(routingRules).values(rulesToInsert);
  }

  // Handle multi-action actions
  if (data.type === 'multi_action' && data.actions && data.actions.length > 0) {
    const actionsToInsert: NewQRAction[] = data.actions.map((action, index) => ({
      qrId: qr.id,
      label: action.label,
      actionType: action.actionType!,
      actionValue: action.actionValue,
      icon: action.icon,
      displayOrder: action.displayOrder ?? index,
    }));
    
    await db.insert(qrActions).values(actionsToInsert);
  }
  
  await invalidateKVCache(shortCode);
  
  return qr;
}

export async function createBulkQR(
  userId: string,
  data: {
    name: string;
    rows: Record<string, unknown>[];
    isDynamic?: boolean;
    designConfig?: Record<string, unknown>;
    bulkType?: 'url' | 'multi_action' | 'password' | 'smart_routing';
  }
): Promise<BulkJob> {
  // 1. Create the bulk job record
  const jobResult = await db.insert(bulkJobs).values({
    userId,
    status: 'completed',
    totalRows: data.rows.length,
    processedRows: data.rows.length,
  } as NewBulkJob).returning();
  
  const job = jobResult[0];

  // 2. Prepare all QR codes
  // We do this in chunks if there are many, but for now we'll do all at once
  const qrsToInsert = await Promise.all(data.rows.map(async (row) => {
    const shortCode = await generateUniqueShortCode();
    let passwordHash: string | undefined;
    if (data.bulkType === 'password' && row.password) {
      passwordHash = await bcrypt.hash(row.password as string, 12);
    }
    
    // Default to data.isDynamic if row.isDynamic is not explicitly defined
    const isDynamic = row.isDynamic !== undefined ? row.isDynamic : (data.isDynamic ?? true);
    
    return {
      userId,
      name: row.name || data.name || "Bulk QR",
      type: data.bulkType || "url",
      shortCode,
      targetUrl: (data.bulkType === "url" || data.bulkType === "password" || data.bulkType === "smart_routing") ? row.url : undefined,
      isDynamic,
      passwordHash,
      designConfig: data.designConfig || {},
      bulkJobId: job.id,
    } as NewQRCode;
  }));

  // 3. Bulk insert QR codes
  const insertedQRs = await db.insert(qrCodes).values(qrsToInsert).returning();
  
  // 3.5 If multi_action, insert actions
  if (data.bulkType === 'multi_action') {
    const allActions: NewQRAction[] = [];
    insertedQRs.forEach((qr, index) => {
      const row = data.rows[index];
      if (row.actions && Array.isArray(row.actions)) {
        row.actions.forEach((action: TypeQRAction, aIndex: number) => {
          allActions.push({
            qrId: qr.id,
            actionType: action.actionType,
            label: action.label,
            actionValue: action.actionValue,
            displayOrder: aIndex,
          });
        });
      }
    });
    if (allActions.length > 0) {
      await db.insert(qrActions).values(allActions);
    }
  }

  // 3.6 If smart_routing, insert rules
  if (data.bulkType === 'smart_routing') {
    const allRules: NewRoutingRule[] = [];
    insertedQRs.forEach((qr, index) => {
      const row = data.rows[index];
      if (row.rules && Array.isArray(row.rules)) {
        row.rules.forEach((rule: TypeRoutingRule, rIndex: number) => {
          allRules.push({
            qrId: qr.id,
            priority: rIndex,
            conditions: rule.conditions,
            targetUrl: rule.targetUrl,
          } as NewRoutingRule);
        });
      }
    });
    if (allRules.length > 0) {
      await db.insert(routingRules).values(allRules);
    }
  }
  
  // 4. Invalidate cache for all new shortcodes
  await Promise.all(insertedQRs.map(qr => invalidateKVCache(qr.shortCode)));
  
  return job;
}

export async function updateQR(
  id: string,
  userId: string,
  data: {
    name?: string;
    targetUrl?: string;
    isActive?: boolean;
    status?: 'active' | 'suspended' | 'deleted';
    isDynamic?: boolean;
    design?: Record<string, unknown>;
    rules?: Partial<TypeRoutingRule>[];
    actions?: Partial<TypeQRAction>[];
    password?: string;
  }
): Promise<QRCode> {
  const existing = await db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
  if (!existing[0] || existing[0].userId !== userId) {
    throw new Error('QR code not found');
  }
  
  if (data.targetUrl && data.targetUrl !== existing[0].targetUrl) {
    await db.insert(qrRedirectHistory).values({
      qrId: id,
      oldUrl: existing[0].targetUrl,
      newUrl: data.targetUrl,
      changedBy: userId,
    } as NewQRRedirectHistory);
  }
  
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.design) {
    updateData.designConfig = data.design;
    delete updateData.design;
  }
  
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updateData.password;
  }
  
  // Handle routing rules if provided
  if (data.rules) {
    // Delete old rules first
    await db.delete(routingRules).where(eq(routingRules.qrId, id));
    
    // Insert new rules
    if (data.rules.length > 0) {
      const rulesToInsert: NewRoutingRule[] = data.rules.map((rule, index) => ({
        qrId: id,
        priority: rule.priority ?? index,
        conditions: rule.conditions!,
        targetUrl: rule.targetUrl!,
        label: rule.label,
      }));
      await db.insert(routingRules).values(rulesToInsert);
    }
    delete updateData.rules;
  }

  // Handle actions if provided
  if (data.actions) {
    // Delete old actions first
    await db.delete(qrActions).where(eq(qrActions.qrId, id));
    
    // Insert new actions
    if (data.actions.length > 0) {
      const actionsToInsert: NewQRAction[] = data.actions.map((action, index) => ({
        qrId: id,
        label: action.label,
        actionType: action.actionType!,
        actionValue: action.actionValue,
        icon: action.icon,
        displayOrder: action.displayOrder ?? index,
      }));
      await db.insert(qrActions).values(actionsToInsert);
    }
    delete updateData.actions;
  }

  if (data.isActive !== undefined) {
    updateData.status = data.isActive ? 'active' : 'suspended';
  }
  
  const result = await db
    .update(qrCodes)
    .set(updateData)
    .where(eq(qrCodes.id, id))
    .returning();
  
  await invalidateKVCache(existing[0].shortCode);
  
  return result[0];
}

export async function deleteQR(id: string, userId: string, existingQR?: QRCode): Promise<void> {
  const qr = existingQR || (await db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1))[0];
  
  if (!qr || qr.userId !== userId) {
    throw new Error('QR code not found');
  }
  
  // Per requirement: Delete action marks as "suspended"
  await Promise.all([
    db.update(qrCodes).set({ 
      status: 'suspended', 
      isActive: false,
      isDeleted: true, // Marking as deleted so it doesn't show in active lists
      deletedAt: new Date(),
      updatedAt: new Date() 
    }).where(eq(qrCodes.id, id)),
    invalidateKVCache(qr.shortCode)
  ]);
}

export async function bulkDeleteQR(ids: string[], userId: string): Promise<void> {
  // 1. Get all shortCodes for cache invalidation
  const qrs = await db.select({ shortCode: qrCodes.shortCode })
    .from(qrCodes)
    .where(and(inArray(qrCodes.id, ids), eq(qrCodes.userId, userId)));
  
  if (qrs.length === 0) return;

  // 2. Perform bulk soft-delete (suspend) and cache invalidation
  await Promise.all([
    db.update(qrCodes)
      .set({ 
        status: 'suspended', 
        isActive: false,
        isDeleted: true, 
        deletedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(inArray(qrCodes.id, ids), eq(qrCodes.userId, userId))),
    ...qrs.map(qr => invalidateKVCache(qr.shortCode))
  ]);
}

async function generateUniqueShortCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateShortCode();
    const existing = await db.select().from(qrCodes).where(eq(qrCodes.shortCode, code)).limit(1);
    if (existing.length === 0) {
      return code;
    }
  }
  throw new Error('Failed to generate unique short code');
}

async function invalidateKVCache(shortCode: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[KV] Invalidating cache for: ${shortCode}`);
  }

  const token = process.env.CLOUDFLARE_KV_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

  if (!token || !accountId || !namespaceId) {
    console.warn("KV invalidation skipped: missing CLOUDFLARE_KV_API_TOKEN or CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_KV_NAMESPACE_ID");
    return;
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/QR_KV:qr:${shortCode}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("KV invalidation failed:", res.status, text);
    } else {
      console.log(`KV cache invalidated for ${shortCode}`);
    }
  } catch (error) {
    console.error("KV invalidation error:", error);
  }
}
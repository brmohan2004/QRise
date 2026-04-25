import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrCodes, routingRules, qrActions, qrRedirectHistory } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser, verifyOwnership } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { updateQR, deleteQR as serviceDeleteQR } from "@/lib/services/qr.service";
import { deleteCloudinaryFile } from "@/lib/cloudinary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const qr = await db.query.qrCodes.findFirst({
      where: and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)),
      with: {
        routingRules: {
          orderBy: [desc(routingRules.priority)],
        },
        qrActions: {
          orderBy: [desc(qrActions.displayOrder)],
        },
      }
    });

    if (!qr) return ApiResponse.notFound("QR code not found or access denied");

    // Fetch last 10 redirect history entries
    const history = await db.select().from(qrRedirectHistory)
      .where(eq(qrRedirectHistory.qrId, id))
      .orderBy(desc(qrRedirectHistory.changedAt))
      .limit(10);

    return ApiResponse.ok({ ...qr, history });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { name, targetUrl, isActive, isDynamic, design, rules, config } = body;
    
    const updated = await updateQR(id, user.id, {
      name: name || config?.name,
      targetUrl: targetUrl || config?.targetUrl || config?.defaultUrl,
      isActive: isActive,
      isDynamic: isDynamic ?? config?.isDynamic,
      design: design || config?.design,
      rules: rules || config?.rules,
      actions: config?.actions,
      password: config?.password,
    });

    return ApiResponse.ok(updated);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const existing = await db.select().from(qrCodes).where(and(eq(qrCodes.id, id), eq(qrCodes.isDeleted, false))).limit(1);
    if (!existing[0] || existing[0].userId !== user.id) {
      return ApiResponse.notFound("QR code not found");
    }

    const qr = existing[0];
    const logoPublicId = qr.designConfig?.logoPublicId;

    // Parallelize cleanup tasks (Cloudinary deletion and DB soft-delete + KV invalidation)
    // This significantly reduces the total response time by running external API calls in parallel.
    await Promise.all([
      logoPublicId ? deleteCloudinaryFile(logoPublicId) : Promise.resolve(),
      serviceDeleteQR(id, user.id, qr)
    ]);

    return ApiResponse.noContent();
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

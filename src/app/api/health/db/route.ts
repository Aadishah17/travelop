import { ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
    return ok({ connected: true, now: result[0]?.now?.toISOString?.() ?? null });
  } catch (error) {
    return serverError(error);
  }
}


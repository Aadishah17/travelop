import { ok } from "@/lib/api-response";
import { envSummary } from "@/lib/env";

export async function GET() {
  return ok(envSummary());
}

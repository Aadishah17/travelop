import { z } from "zod";
import { ok, serverError, validationError } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/email";
import { readJson } from "@/app/api/_utils";

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase())
});

export async function POST(request: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await readJson(request));
    const result = await sendPasswordResetEmail({ to: email });

    return ok({
      sent: result.sent,
      reason: result.reason ?? null
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationError(error);
    }

    return serverError(error);
  }
}

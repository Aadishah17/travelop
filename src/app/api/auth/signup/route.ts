import { created, fail, serverError, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validators";
import { readJson } from "@/app/api/_utils";

export async function POST(request: Request) {
  try {
    const data = signUpSchema.parse(await readJson(request));
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      return fail("An account with this email already exists.", { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hashPassword(data.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return created(user);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return validationError(error);
    }

    return serverError(error);
  }
}

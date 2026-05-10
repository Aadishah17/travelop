import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type ApiErrorOptions = {
  status?: number;
  details?: unknown;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(message: string, options: ApiErrorOptions = {}) {
  return NextResponse.json(
    { error: { message, details: options.details ?? null } },
    { status: options.status ?? 400 },
  );
}

export function validationError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Invalid request payload.", {
      status: 422,
      details: error.flatten(),
    });
  }

  return fail("Invalid request payload.", { status: 422 });
}

export function serverError(error: unknown) {
  logger.error("Unhandled API error", error);
  return fail("Something went wrong.", { status: 500 });
}

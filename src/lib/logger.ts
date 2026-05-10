type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return error;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(JSON.stringify({ level: "info", message, ...context }));
  },
  warn(message: string, context?: LogContext) {
    console.warn(JSON.stringify({ level: "warn", message, ...context }));
  },
  error(message: string, error?: unknown, context?: LogContext) {
    console.error(JSON.stringify({ level: "error", message, error: serializeError(error), ...context }));
  },
};

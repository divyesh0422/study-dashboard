// src/lib/utils/api.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse<T>(data: T, status = 200, meta?: object) {
  return NextResponse.json({ data, ...(meta && { meta }) }, { status });
}

export function errorResponse(code: string, message: string, status: number, details?: object) {
  return NextResponse.json({ error: { code, message, ...(details && { details }) } }, { status });
}

export function handleZodError(error: ZodError) {
  const details = error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
  return errorResponse("VALIDATION_ERROR", "Validation failed", 422, details);
}

export function unauthorizedResponse() {
  return errorResponse("UNAUTHORIZED", "Authentication required", 401);
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse("NOT_FOUND", `${resource} not found`, 404);
}

export function forbiddenResponse() {
  return errorResponse("FORBIDDEN", "You do not have permission to access this resource", 403);
}

export function internalErrorResponse() {
  return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
}

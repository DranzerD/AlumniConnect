import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wraps a route handler so thrown HttpErrors become JSON error responses and
// anything unexpected is logged and returned as a generic 500.
export function handler(fn) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json(
          { error: error.message, ...(error.details && { details: error.details }) },
          { status: error.status },
        );
      }
      console.error(`[api] ${request.method} ${request.nextUrl?.pathname}`, error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export const json = (data, init) => NextResponse.json(data, init);

export async function readJson(request) {
  try {
    const body = await request.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("not an object");
    }
    return body;
  } catch {
    throw new HttpError(400, "Request body must be a JSON object");
  }
}

// Parses a positive integer route/query parameter; 404s on anything else.
export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, "Not found");
  return id;
}

export function getPagination(searchParams, { defaultLimit = 20, maxLimit = 50 } = {}) {
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get("limit"), 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

import "server-only";
import { NextResponse } from "next/server";
import { ApiError } from "./auth";
import { ValidationError } from "../validation";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Wraps a route handler with consistent error handling. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, err.message);
      if (err instanceof ValidationError) return fail(400, err.message);
      console.error("[api]", err);
      return fail(500, "Something went wrong on our side. Please try again.");
    }
  };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
}

export const nowIso = () => new Date().toISOString();

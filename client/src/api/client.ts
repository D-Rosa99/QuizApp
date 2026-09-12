import type { ApiErrorBody } from "./types";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${apiBase}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error?.message) message = body.error.message;
      code = body.error?.code;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}

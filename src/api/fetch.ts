import type { ServerErrorResponse } from "./errors";

const fetchApi = (
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown,
  options?: RequestInit,
) => {
  return fetch(import.meta.env.VITE_API_URL + url, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
};

export const fetchJsonApi = async <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const response = await fetchApi(method, url, body, options);
  const bodyJson = await response.json();
  return Object.assign(response, { bodyJson });
};

export interface ApiResponse<T> extends Response {
  bodyJson: T | ServerErrorResponse;
}

export const fetchApi = (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  options?: RequestInit
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

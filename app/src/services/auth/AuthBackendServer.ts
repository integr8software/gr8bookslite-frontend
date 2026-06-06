import { GetAuthAccessTokenCookie } from "@/app/src/services/auth/AuthCookieServer";
import { BuildApiUrl } from "@/app/src/services/shared/api/ApiUrl";

const HopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function BuildBackendApiUrl(path: string) {
  return BuildApiUrl(path);
}

export async function CreateBackendHeaders(
  inputHeaders?: Headers,
  initHeaders?: HeadersInit,
) {
  const headers = new Headers();

  inputHeaders?.forEach((value, key) => {
    if (!HopByHopHeaders.has(key.toLowerCase()) && key.toLowerCase() !== "cookie") {
      headers.set(key, value);
    }
  });

  new Headers(initHeaders).forEach((value, key) => {
    if (!HopByHopHeaders.has(key.toLowerCase()) && key.toLowerCase() !== "cookie") {
      headers.set(key, value);
    }
  });

  const accessToken = await GetAuthAccessTokenCookie();

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export async function FetchBackend(
  path: string,
  init: RequestInit & { inputHeaders?: Headers } = {},
) {
  const headers = await CreateBackendHeaders(init.inputHeaders, init.headers);
  const body = init.body;

  return fetch(BuildBackendApiUrl(path), {
    ...init,
    headers,
    body,
    cache: "no-store",
  });
}

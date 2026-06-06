import { NextResponse, type NextRequest } from "next/server";
import { BuildBackendApiUrl, CreateBackendHeaders } from "@/app/src/services/auth/AuthBackendServer";

type BackendProxyContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const MethodsWithoutBody = new Set(["GET", "HEAD"]);

async function ProxyBackendRequest(
  request: NextRequest,
  context: BackendProxyContext,
) {
  const { path = [] } = await context.params;
  const targetPath = `/${path.join("/")}${request.nextUrl.search}`;
  const headers = await CreateBackendHeaders(request.headers);
  const response = await fetch(BuildBackendApiUrl(targetPath), {
    body: MethodsWithoutBody.has(request.method) ? undefined : request.body,
    cache: "no-store",
    duplex: "half",
    headers,
    method: request.method,
  } as RequestInit);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.set("Cache-Control", "no-store");

  return new NextResponse(response.body, {
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
  });
}

export const GET = ProxyBackendRequest;
export const POST = ProxyBackendRequest;
export const PUT = ProxyBackendRequest;
export const PATCH = ProxyBackendRequest;
export const DELETE = ProxyBackendRequest;

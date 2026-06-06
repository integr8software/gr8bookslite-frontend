import { NextResponse, type NextRequest } from "next/server";
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";

const ACCESS_TOKEN_COOKIE = "gr8booksneo.accessToken";
const INVITATION_ACTIVATION_PATH = "/activate-account";
const LOGIN_PATH = "/login";
const ONBOARDING_PATH = "/onboarding";
const CompanyManagementPath = "/workspace/company-management";
const ReservedCompanyRouteSegments = new Set(["add", "edit", "view"]);
const PublicPathPrefixes = [
  "/",
  INVITATION_ACTIVATION_PATH,
  "/auth",
  "/error",
  "/forgot-password",
  LOGIN_PATH,
  "/pricing",
  "/privacy-policy",
  "/signup",
  "/terms-of-service",
] as const;
const UnrestrictedPublicPathPrefixes = [
  "/privacy-policy",
  "/terms-of-service",
] as const;

export function ResolveAuthProxyResponse(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isPublicPath = isPublicRoute(pathname);
  const isInvitationActivationPath = isPathPrefix(
    pathname,
    INVITATION_ACTIVATION_PATH,
  );
  const isForcedLoginPath =
    isPathPrefix(pathname, LOGIN_PATH) &&
    request.nextUrl.searchParams.get("force") === "true";

  if (isUnrestrictedPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (isInvitationActivationPath || isForcedLoginPath) {
    return NextResponse.next();
  }

  if (!accessToken) {
    if (isPublicPath) {
      return NextResponse.next();
    }

    return redirectToLogin(request);
  }

  if (isPublicPath && pathname !== ONBOARDING_PATH) {
    return redirectToPostAuthHome(request, accessToken);
  }

  if (pathname === "/") {
    return redirectToPostAuthHome(request, accessToken);
  }

  if (pathname.startsWith(CompanyManagementPath)) {
    return handleCompanyManagementRoute(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL(LOGIN_PATH, request.url);

  if (shouldPreserveRedirect(request.nextUrl.pathname)) {
    loginUrl.searchParams.set(
      "redirect",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
  }

  return NextResponse.redirect(loginUrl);
}

function redirectToPostAuthHome(request: NextRequest, accessToken: string) {
  const pathname = request.nextUrl.pathname;
  const destination = GetFallbackPostAuthRedirectPath(accessToken);

  if (pathname === destination) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = "";
  return NextResponse.redirect(url);
}

function isPublicRoute(pathname: string) {
  return PublicPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix));
}

function isUnrestrictedPublicRoute(pathname: string) {
  return UnrestrictedPublicPathPrefixes.some((prefix) =>
    isPathPrefix(pathname, prefix),
  );
}

function shouldPreserveRedirect(pathname: string) {
  return !isPathPrefix(pathname, ONBOARDING_PATH);
}

function isPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function handleCompanyManagementRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname
    .slice(CompanyManagementPath.length)
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return NextResponse.next();
  }

  const [recordId, action] = segments;

  if (ReservedCompanyRouteSegments.has(recordId)) {
    return NextResponse.next();
  }

  if (segments.length === 1) {
    return redirectCompanyRoute(request, `/view/${recordId}`);
  }

  if (segments.length === 2 && action === "edit") {
    return redirectCompanyRoute(request, `/edit/${recordId}`);
  }

  return NextResponse.next();
}

function redirectCompanyRoute(request: NextRequest, destinationPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = `${CompanyManagementPath}${destinationPath}`;
  return NextResponse.redirect(url);
}

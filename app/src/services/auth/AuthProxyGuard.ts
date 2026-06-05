import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "gr8booksneo.accessToken";
const AUTH_PROFILE_TIMEOUT_MS = 60000;
const INVITATION_ACTIVATION_PATH = "/activate-account";
const LOGIN_PATH = "/login";
const ONBOARDING_PATH = "/onboarding";
const CompanyManagementPath = "/workspace/company-management";
const ReservedCompanyRouteSegments = new Set(["add", "edit", "view"]);
const MasterPathPrefixes = ["/master"] as const;
const WorkspacePathPrefixes = ["/workspace"] as const;
const AdminCompanyPathPrefixes = ["/system-administration"] as const;
const AuthenticatedAccountPathPrefixes = [
  "/account",
  "/profile",
  "/settings",
] as const;
const CompanyPathPrefixes = [
  "/accounts-payable",
  "/beginning-balance-uploader",
  "/cash-disbursement",
  "/cash-receipt",
  "/dashboard",
  "/general-journal",
  "/inventory",
  "/maintenance",
  "/others",
  "/purchasing",
  "/reports",
  "/sales",
  "/system-administration",
] as const;
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

type AuthProfileGuardResponse = {
  activeCompanyId: number | null;
  companyId?: number | null;
  role?: "ADMIN" | "USER" | null;
  user: {
    systemRole: "SUPER_ADMIN" | "STANDARD";
  };
  activeAccess: {
    accessScope: "BRANCH" | "COMPANY" | "SATELLITE" | null;
    membershipRole: "ADMIN" | "USER" | null;
    membershipStatus: "ACTIVE" | "INVITED" | "REMOVED" | "SUSPENDED" | null;
  } | null;
  onboarding: {
    hasActiveCompanyContext?: boolean;
    hasCompany?: boolean;
    nextStep?: "APP_READY" | "COMPANY_SETUP" | "SELECT_COMPANY";
    requiresCompanySetup: boolean;
  };
  companies?: {
    companyId: number;
    role: "ADMIN" | "USER";
    membershipStatus: string;
  }[];
};

export async function ResolveAuthProxyResponse(request: NextRequest) {
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
  const isOnboardingPath = isPathPrefix(pathname, ONBOARDING_PATH);

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

  if (isPublicPath || isOnboardingPath) {
    const profile = await getAuthProfile(accessToken);

    if (!profile) {
      return redirectToLogin(request, true);
    }

    if (isOnboardingPath) {
      if (profile.onboarding.requiresCompanySetup) {
        return NextResponse.next();
      }

      return redirectToPostAuthHome(request, profile);
    }

    return redirectToPostAuthHome(request, profile);
  }

  const profile = await getAuthProfile(accessToken);

  if (!profile) {
    return redirectToLogin(request, true);
  }

  if (profile.onboarding.requiresCompanySetup) {
    return redirectToOnboarding(request);
  }

  if (pathname === "/") {
    return redirectToPostAuthHome(request, profile);
  }

  if (!canAccessPath(pathname, profile)) {
    return redirectToPostAuthHome(request, profile);
  }

  if (pathname.startsWith(CompanyManagementPath)) {
    return handleCompanyManagementRoute(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, clearCookie = false) {
  const loginUrl = new URL(LOGIN_PATH, request.url);

  if (shouldPreserveRedirect(request.nextUrl.pathname)) {
    loginUrl.searchParams.set(
      "redirect",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
  }

  const response = NextResponse.redirect(loginUrl);

  if (clearCookie) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

function redirectToOnboarding(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = ONBOARDING_PATH;
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToPostAuthHome(
  request: NextRequest,
  profile: AuthProfileGuardResponse,
) {
  const pathname = request.nextUrl.pathname;
  const destination = getPostAuthHomePath(profile);

  if (!destination) {
    return redirectToLogin(request, true);
  }

  if (pathname === destination) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = "";
  return NextResponse.redirect(url);
}

function getPostAuthHomePath(profile: AuthProfileGuardResponse) {
  if (profile.onboarding.requiresCompanySetup) {
    return ONBOARDING_PATH;
  }

  if (profile.user.systemRole === "SUPER_ADMIN") {
    return "/master/dashboard";
  }

  if (hasWorkspaceAdminAccess(profile)) {
    return "/workspace/dashboard";
  }

  if (hasActiveBranchAccess(profile)) {
    return "/dashboard";
  }

  return null;
}

function canAccessPath(pathname: string, profile: AuthProfileGuardResponse) {
  if (
    AuthenticatedAccountPathPrefixes.some((prefix) =>
      isPathPrefix(pathname, prefix),
    )
  ) {
    return true;
  }

  if (MasterPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix))) {
    return profile.user.systemRole === "SUPER_ADMIN";
  }

  if (WorkspacePathPrefixes.some((prefix) => isPathPrefix(pathname, prefix))) {
    return hasWorkspaceAdminAccess(profile);
  }

  if (
    AdminCompanyPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix))
  ) {
    return hasActiveBranchAdminAccess(profile) || hasWorkspaceAdminAccess(profile);
  }

  if (CompanyPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix))) {
    return hasActiveBranchAccess(profile);
  }

  return false;
}

function hasWorkspaceAdminAccess(profile: AuthProfileGuardResponse) {
  if (profile.user.systemRole === "SUPER_ADMIN") {
    return false;
  }

  if (
    profile.activeAccess?.membershipStatus === "ACTIVE" &&
    profile.activeAccess.membershipRole === "ADMIN"
  ) {
    return true;
  }

  return (
    profile.companies?.some(
      (company) =>
        company.role === "ADMIN" && company.membershipStatus === "ACTIVE",
    ) ?? false
  );
}

function hasActiveBranchAdminAccess(profile: AuthProfileGuardResponse) {
  return (
    profile.activeAccess?.membershipStatus === "ACTIVE" &&
    profile.activeAccess.membershipRole === "ADMIN" &&
    Boolean(profile.activeCompanyId ?? profile.companyId)
  );
}

function hasActiveBranchAccess(profile: AuthProfileGuardResponse) {
  if (profile.user.systemRole === "SUPER_ADMIN") {
    return false;
  }

  if (hasActiveBranchAdminAccess(profile)) {
    return true;
  }

  return (
    profile.activeAccess?.membershipStatus === "ACTIVE" &&
    profile.activeAccess.membershipRole === "USER" &&
    profile.activeAccess.accessScope != null &&
    Boolean(profile.activeCompanyId ?? profile.companyId)
  );
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

async function getAuthProfile(accessToken: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(AUTH_PROFILE_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthProfileGuardResponse;
  } catch {
    return null;
  }
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

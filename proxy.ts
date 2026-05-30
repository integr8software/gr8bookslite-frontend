import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "gr8booksneo.accessToken";
const ONBOARDING_PATH = "/onboarding";
const CompanyManagementPath = "/workspace/company-management";
const ReservedCompanyRouteSegments = new Set(["add", "edit", "view"]);
const ProtectedPathPrefixes = [
  "/accounts-payable",
  "/beginning-balance-uploader",
  "/cash-disbursement",
  "/cash-receipt",
  "/dashboard",
  "/general-journal",
  "/inventory",
  "/maintenance",
  "/master",
  "/onboarding",
  "/others",
  "/profile",
  "/purchasing",
  "/reports",
  "/sales",
  "/settings",
  "/system-administration",
  "/workspace",
] as const;
const PublicPathPrefixes = [
  "/activate-account",
  "/auth",
  "/error",
  "/forgot-password",
  "/login",
  "/pricing",
  "/privacy-policy",
  "/signup",
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
    membershipRole: "ADMIN" | "USER" | null;
  } | null;
  onboarding: {
    requiresCompanySetup: boolean;
  };
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isPublicPath = isPublicRoute(pathname);
  const isProtectedPath = isProtectedRoute(pathname);
  const isOnboardingPath = isPathPrefix(pathname, ONBOARDING_PATH);

  if (!isPublicPath && !isProtectedPath && pathname !== "/") {
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
      return profile.onboarding.requiresCompanySetup
        ? NextResponse.next()
        : redirectToPostAuthHome(request, profile);
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

  if (pathname.startsWith(CompanyManagementPath)) {
    return handleCompanyManagementRoute(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, clearCookie = false) {
  const loginUrl = new URL("/login", request.url);

  if (request.nextUrl.pathname !== "/") {
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
  const url = request.nextUrl.clone();
  url.pathname = getPostAuthHomePath(profile);
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

  if (profile.activeAccess?.membershipRole === "ADMIN") {
    return "/workspace/dashboard";
  }

  if (profile.activeCompanyId ?? profile.companyId) {
    return "/dashboard";
  }

  return ONBOARDING_PATH;
}

function isPublicRoute(pathname: string) {
  return PublicPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix));
}

function isProtectedRoute(pathname: string) {
  return ProtectedPathPrefixes.some((prefix) => isPathPrefix(pathname, prefix));
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

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\..*).*)",
  ],
};

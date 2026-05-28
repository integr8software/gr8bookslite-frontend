import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "gr8booksneo.accessToken";
const CompanyManagementPath = "/workspace/company-management";
const ReservedCompanyRouteSegments = new Set(["add", "edit", "view"]);

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith(CompanyManagementPath)) {
		return handleCompanyManagementRoute(request);
	}

	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

	if (accessToken) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set(
		"redirect",
		`${request.nextUrl.pathname}${request.nextUrl.search}`,
	);

	return NextResponse.redirect(loginUrl);
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
	matcher: ["/onboarding/:path*", "/workspace/company-management/:path*"],
};

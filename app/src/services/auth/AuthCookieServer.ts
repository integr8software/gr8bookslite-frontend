"use server";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE_NAME = "gr8booksneo.accessToken";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function ShouldUseSecureCookie() {
  return (
    process.env.AUTH_COOKIE_SECURE?.toLowerCase() === "true" ||
    process.env.NODE_ENV === "production"
  );
}

function GetCookieDomain() {
  return process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
}

export async function SetAuthAccessTokenCookie(
  accessToken: string,
  rememberMe = false,
) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: ShouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    domain: GetCookieDomain(),
    ...(rememberMe ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {}),
  });
}

export async function ClearAuthAccessTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: ShouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    domain: GetCookieDomain(),
    maxAge: 0,
  });
}

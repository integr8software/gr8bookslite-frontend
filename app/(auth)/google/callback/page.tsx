import type { Metadata } from "next";
import { GoogleAuthCallback } from "@/app/src/ui/auth/GoogleAuthCallback";

export const metadata: Metadata = {
  title: "Google sign-in | GR8BooksLite",
};

type GoogleCallbackPageProps = {
  searchParams: Promise<{
    accessToken?: string | string[];
    error?: string | string[];
    redirectTo?: string | string[];
  }>;
};

function ReadSearchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function GoogleCallbackPage({
  searchParams,
}: GoogleCallbackPageProps) {
  const { accessToken, error, redirectTo } = await searchParams;

  return (
    <GoogleAuthCallback
      accessToken={ReadSearchValue(accessToken)}
      error={ReadSearchValue(error)}
      redirectTo={ReadSearchValue(redirectTo) || "/onboarding"}
    />
  );
}

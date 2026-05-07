"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";

type GoogleAuthCallbackProps = {
  accessToken?: string;
  error?: string;
  redirectTo?: string;
};

export function GoogleAuthCallback({
  accessToken = "",
  error = "",
  redirectTo = "/onboarding",
}: GoogleAuthCallbackProps) {
  const router = useRouter();

  useEffect(() => {
    if (!accessToken || error) {
      return;
    }

    SaveAccessToken(accessToken);
    router.replace(redirectTo);
  }, [accessToken, error, redirectTo, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-darknavy sm:px-6">
        <section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-darknavy">
            Google Sign-in Failed
          </h1>
          <p className="mt-3 text-sm leading-6 text-darknavy/80">{error}</p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90"
            >
              Back to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-darknavy sm:px-6">
      <section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-darknavy">
          Signing You In
        </h1>
        <p className="mt-3 text-sm leading-6 text-darknavy/80">
          We&apos;re finishing your Google sign-in and redirecting you now.
        </p>
      </section>
    </main>
  );
}

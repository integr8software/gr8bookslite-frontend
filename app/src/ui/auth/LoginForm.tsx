"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useLoginForm } from "@/app/src/hooks/auth/useLoginForm";
import { BuildGoogleAuthUrl } from "@/app/src/services/auth/AuthApi";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";
import { AuthField } from "./AuthField";

export function LoginForm() {
  const {
    state,
    formAction,
    pending,
    isSystemRedirecting,
    isOnboardingRedirecting,
    values,
    handleEmailChange,
    handleSubmit,
  } = useLoginForm();
  const googleAuthUrl = BuildGoogleAuthUrl("login");

  if (isOnboardingRedirecting) {
    return <OnboardingDraftLoadingScreen isFullScreen />;
  }

  if (isSystemRedirecting) {
    return <MainLoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-white text-darknavy">
      <section className="flex min-h-screen flex-col bg-white lg:flex-row">
        <div className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:w-1/2 lg:px-14">
          <div className="flex flex-col w-full max-w-107.5">
            <Link
              href="/"
              className="inline-flex text-xl font-semibold sm:text-2xl lg:self-start"
            >
              <LogoText brandSuffixClassName="text-sm" />
            </Link>

            <div className="mt-10 text-center sm:mt-14 lg:mt-20">
              <h1 className="text-3xl font-semibold tracking-tight text-darknavy sm:text-5xl">
                Sign in
              </h1>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-darknavy/60">
                Please login to continue to your account.
              </p>
            </div>

            <form
              action={formAction}
              onSubmit={handleSubmit}
              className="mt-10 w-full space-y-4"
              noValidate
            >
              <AuthField
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email..."
                value={values.email}
                onChange={handleEmailChange}
                errors={state.errors?.email}
              />
              <AuthField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password..."
                errors={state.errors?.password}
              />

              <div className="flex flex-col gap-3 text-xs text-darknavy/70 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="h-3.5 w-3.5 rounded border border-darknavy/30 text-darknavy focus:ring-2 focus:ring-skyblue/30"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-coralpink transition hover:text-coralpink/80 sm:text-right"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="flex justify-center pt-3">
                <button
                  type="submit"
                  disabled={pending}
                  aria-label={pending ? "Signing in" : "Sign in"}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/50"
                >
                  {pending ? (
                    <LoaderCircle
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2 text-sm text-darknavy/70">
                <div className="h-px flex-1 bg-darknavy/30" />
                <span>or</span>
                <div className="h-px flex-1 bg-darknavy/30" />
              </div>

              <a
                href={googleAuthUrl}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-darknavy/30 bg-white px-4 text-sm font-medium text-darknavy transition hover:border-darknavy/50 hover:bg-offwhite"
              >
                <span>Continue with Google</span>
                <Image
                  src="/img/google-icon.png"
                  alt="Google icon"
                  width={18}
                  height={18}
                />
              </a>
            </form>

            <p className="mt-5 text-center text-darknavy/70">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                transitionTypes={["auth-forward"]}
                className="font-medium text-coralpink"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        <div className="sticky top-0 hidden h-screen lg:block lg:w-1/2 lg:flex-none">
          <Image
            src="/img/login-bg.png"
            alt="Office illustration with accounting desks and reporting monitors."
            fill
            preload
            sizes="(max-width: 1024px) 0vw, 50vw"
            className="object-cover object-center z-20"
          />
        </div>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useLoginForm } from "@/app/src/hooks/auth/useLoginForm";
import { useGoogleAuthSessionRedirect } from "@/app/src/hooks/auth/useGoogleAuthSessionRedirect";
import { BuildGoogleAuthUrl } from "@/app/src/services/auth/AuthApi";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";
import { AuthField } from "@/app/src/ui/auth/AuthField";

export function LoginForm() {
	const {
		state,
		pending,
		isSystemRedirecting,
		isOnboardingRedirecting,
		values,
		handleEmailChange,
		handleSubmit,
	} = useLoginForm();
	const { redirectState: googleRedirectState } =
		useGoogleAuthSessionRedirect();
	const googleAuthUrl = BuildGoogleAuthUrl("login");

	if (isOnboardingRedirecting || googleRedirectState === "onboarding") {
		return <OnboardingDraftLoadingScreen isFullScreen />;
	}

	if (isSystemRedirecting || googleRedirectState === "system") {
		return <MainLoadingScreen />;
	}

	return (
		<main className="min-h-[calc(100vh-5rem)] bg-[#f6f9fc] text-slate-950">
			<section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-8 sm:px-8">
				<div className="w-full max-w-md rounded-lg bg-white p-6 ring-1 ring-slate-200 sm:p-8">
					<Link
						href="/"
						className="inline-flex text-xl font-semibold sm:text-2xl"
					>
						<LogoText brandSuffixClassName="text-sm" />
					</Link>

					<div className="mt-8 lg:mt-0">
						<h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
							Sign in
						</h1>
					</div>

					<form
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

						<div className="flex flex-col gap-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									name="rememberMe"
									className="h-3.5 w-3.5 rounded border border-slate-300 text-sky-700 focus:ring-2 focus:ring-sky-300"
								/>
								<span>Remember me</span>
							</label>

							<Link
								href="/forgot-password"
								className="font-semibold text-sky-700 transition hover:text-sky-900 sm:text-right"
							>
								Forgot Password?
							</Link>
						</div>

						<div className="flex justify-center pt-3">
							<button
								type="submit"
								disabled={pending}
								aria-label={pending ? "Signing in" : "Sign in"}
								className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_14px_34px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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

						<div className="flex items-center gap-4 pt-2 text-sm text-slate-500">
							<div className="h-px flex-1 bg-slate-200" />
							<span>or</span>
							<div className="h-px flex-1 bg-slate-200" />
						</div>

						<a
							href={googleAuthUrl}
							className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white/82 px-4 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-white"
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

					<p className="mt-5 text-center text-slate-600">
						Don&apos;t have an account yet?{" "}
						<Link
							href="/signup"
							transitionTypes={["auth-forward"]}
							className="font-semibold text-sky-700 hover:text-sky-900"
						>
							Register
						</Link>
					</p>
				</div>
			</section>
		</main>
	);
}

"use client";

import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { useGoogleAuthSessionRedirect } from "@/app/src/hooks/auth/useGoogleAuthSessionRedirect";
import { useLoginForm } from "@/app/src/hooks/auth/useLoginForm";
import { BuildGoogleAuthUrl } from "@/app/src/services/auth/AuthApi";
import { AuthDivider } from "@/app/src/ui/auth/AuthDivider";
import { AuthField } from "@/app/src/ui/auth/AuthField";
import { AuthFormCard } from "@/app/src/ui/auth/AuthFormCard";
import { AuthSwitchLink } from "@/app/src/ui/auth/AuthFormTransition";
import { AuthGoogleButton } from "@/app/src/ui/auth/AuthGoogleButton";
import { AuthPageShell } from "@/app/src/ui/auth/AuthPageShell";
import { AuthSubmitButton } from "@/app/src/ui/auth/AuthSubmitButton";
import { OnboardingDraftLoadingScreen } from "@/app/src/ui/onboarding/OnboardingDraftLoadingScreen";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";

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
		<AuthPageShell>
			<AuthFormCard
				title="Sign in to your account"
				description="Access your accounting workspace, inventory, and team settings."
			>
				<div className="mt-8">
					<AuthGoogleButton
						href={googleAuthUrl}
						label="Continue with Google"
					/>
				</div>

				<div className="my-7">
					<AuthDivider />
				</div>

				<form onSubmit={handleSubmit} className="space-y-5" noValidate>
					<AuthField
						label="Email address"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="you@company.com"
						value={values.email}
						onChange={handleEmailChange}
						errors={state.errors?.email}
						leadingIcon={<Mail className="h-4 w-4" />}
					/>
					<AuthField
						label="Password"
						name="password"
						type="password"
						autoComplete="current-password"
						placeholder="Enter your password"
						errors={state.errors?.password}
						leadingIcon={<LockKeyhole className="h-4 w-4" />}
					/>

					<div className="flex items-center justify-between gap-4 text-sm">
						<label className="flex cursor-pointer items-center gap-2.5 text-darknavy/60">
							<input
								type="checkbox"
								name="rememberMe"
								className="h-4 w-4 rounded border-darknavy/20 accent-skyblue focus:ring-2 focus:ring-skyblue/30"
							/>
							<span>Remember me</span>
						</label>
						<Link
							href="/forgot-password"
							className="font-semibold text-darknavy transition hover:text-sky-700"
						>
							Forgot password?
						</Link>
					</div>

					<AuthSubmitButton
						idleLabel="Sign in"
						pendingLabel="Signing in..."
						pending={pending}
					/>
				</form>

				<div className="mt-8 border-t border-darknavy/10 pt-7 text-center">
					<p className="text-sm text-darknavy/60">
						Don&apos;t have an account?{" "}
						<AuthSwitchLink
							href="/signup"
							direction="forward"
							className="font-semibold text-darknavy transition hover:text-sky-700"
						>
							Create one free
						</AuthSwitchLink>
					</p>
					<p className="mt-5 text-xs leading-5 text-darknavy/45">
						By signing in, you agree to our{" "}
						<Link href="/terms-of-service" className="hover:text-sky-700">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link href="/privacy-policy" className="hover:text-sky-700">
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</AuthFormCard>
		</AuthPageShell>
	);
}

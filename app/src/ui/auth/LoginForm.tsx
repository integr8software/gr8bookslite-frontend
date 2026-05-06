"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLoginForm } from "@/app/src/hooks/auth/useLoginForm";
import { AuthField } from "./AuthField";
import { AuthStatusMessage } from "./AuthStatusMessage";

export function LoginForm() {
	const { state, formAction, pending } = useLoginForm();

	return (
		<main className="min-h-screen bg-white text-darknavy">
			<section className="flex min-h-screen flex-col bg-white lg:flex-row">
				<div className="flex w-full items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:min-h-screen lg:basis-1/2 lg:px-14">
					<div className="flex flex-col w-full max-w-107.5">
						<Link
							href="/"
							className="inline-flex items-baseline text-xl font-semibold tracking-tight text-darknavy sm:text-2xl lg:self-start"
						>
							<span>Gr8books</span>
							<span className="ml-1 text-sm font-medium italic text-skyblue">
								Lite
							</span>
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
							className="mt-10 w-full space-y-4"
						>
							<AuthStatusMessage state={state} />
							<AuthField
								label="Email Address"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="johndoe@example.com"
								errors={state.errors?.email}
								required
							/>
							<AuthField
								label="Password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="...................."
								errors={state.errors?.password}
								required
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
									aria-label={
										pending ? "Signing in" : "Sign in"
									}
									className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/50"
								>
									<ArrowRight />
								</button>
							</div>

							<div className="flex items-center gap-4 pt-2 text-sm text-darknavy/70">
								<div className="h-px flex-1 bg-darknavy/30" />
								<span>or</span>
								<div className="h-px flex-1 bg-darknavy/30" />
							</div>

							<button
								type="button"
								className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-darknavy/30 bg-white px-4 text-sm font-medium text-darknavy transition hover:border-darknavy/50 hover:bg-offwhite"
							>
								<span>Continue with Google</span>
								<Image
									src="/img/google-icon.png"
									alt="Google icon"
									width={18}
									height={18}
								/>
							</button>
						</form>

						<p className="mt-5 text-center text-sm text-darknavy/70">
							Don&apos;t have an account yet?{" "}
							<Link
								href="/signup"
								className="font-medium text-coralpink"
							>
								Register
							</Link>
						</p>
					</div>
				</div>

				<div className="relative hidden min-h-screen lg:block lg:basis-1/2">
					<Image
						src="/img/login-bg.png"
						alt="Office illustration with accounting desks and reporting monitors."
						fill
						preload
						sizes="(max-width: 1024px) 0vw, 50vw"
						className="object-cover object-center"
					/>
				</div>
			</section>
		</main>
	);
}

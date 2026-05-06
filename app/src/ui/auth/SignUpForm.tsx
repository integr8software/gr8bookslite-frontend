"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignUpForm } from "@/app/src/hooks/auth/useSignUpForm";
import { AuthField } from "./AuthField";
import { AuthPasswordRequirements } from "./AuthPasswordRequirements";
import { ArrowRight } from "lucide-react";

export function SignUpForm() {
	const { state, formAction, pending } = useSignUpForm();
	const [password, setPassword] = useState("");

	return (
		<main className="min-h-screen bg-white text-darknavy">
			<section className="flex min-h-screen flex-col bg-white lg:flex-row">
				<div className="relative hidden min-h-screen lg:block lg:basis-1/2">
					<Image
						src="/img/signup-bg.png"
						alt="Office illustration with people collaborating at workstations."
						fill
						preload
						sizes="(max-width: 1024px) 0vw, 75vw"
						className="object-cover object-left"
					/>
				</div>

				<div className="flex w-full items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:min-h-screen lg:basis-1/2 lg:px-10 xl:px-14">
					<div className="w-full max-w-107.5">
						<Link
							href="/"
							className="inline-flex items-baseline text-xl font-semibold tracking-tight text-darknavy sm:text-2xl"
						>
							<span>Gr8books</span>
							<span className="ml-1 text-sm font-medium italic text-skyblue">
								Lite
							</span>
						</Link>

						<div className="mt-10 text-center sm:mt-12">
							<h1 className="text-3xl font-semibold tracking-tight text-darknavy sm:text-5xl">
								Sign Up
							</h1>
							<p className="mx-auto mt-3 max-w-xs text-base leading-6 text-darknavy/60">
								Create an account, quick, easy, and secure.
							</p>
						</div>

						<form action={formAction} className="mt-10 space-y-4">
							<AuthField
								label="Full Name"
								name="name"
								type="text"
								autoComplete="name"
								placeholder="johndoe@example.com"
								errors={state.errors?.name}
								required
							/>
							<AuthField
								label="Email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="johndoe@example.com"
								errors={state.errors?.email}
								required
							/>

							<div>
								<label
									htmlFor="contactNumber"
									className="mb-2 block text-sm font-medium text-darknavy"
								>
									Contact Number
								</label>
								<input
									id="contactNumber"
									name="contactNumber"
									type="tel"
									autoComplete="tel"
									placeholder="+1 (555) 012-3456"
									className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
								/>
							</div>

							<AuthField
								label="Password"
								name="password"
								type="password"
								autoComplete="new-password"
								placeholder="Enter your password..."
								value={password}
								onChange={(event) =>
									setPassword(event.target.value)
								}
								errors={state.errors?.password}
								required
							/>
							<AuthPasswordRequirements password={password} />
							<AuthField
								label="Confirm Password"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								placeholder="Please re-enter your password for confirmation..."
								errors={state.errors?.confirmPassword}
								required
							/>

							<label className="flex items-start gap-3 pt-2 text-xs leading-4 text-darknavy/75">
								<input
									type="checkbox"
									name="termsAccepted"
									className="mt-0.5 h-4 w-4 rounded border border-darknavy/30 text-darknavy focus:ring-2 focus:ring-skyblue/30"
								/>
								<span>
									By signing in, I agree to the{" "}
									<Link
										href="/terms-of-service"
										target="blank"
										className="font-medium text-skyblue underline underline-offset-2 hover:text-skyblue/80 transition"
									>
										Terms of Service
									</Link>{" "}
									and acknowledge I have read the{" "}
									<Link
										href="/privacy-policy"
										target="blank"
										className="font-medium text-skyblue underline underline-offset-2 hover:text-skyblue/80 transition"
									>
										Privacy Policy
									</Link>
									, including how my personal data is collected and used.
								</span>
							</label>

							<div className="flex justify-center pt-4">
								<button
									type="submit"
									disabled={pending}
									aria-label={pending ? "Creating account" : "Create account"}
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

						<p className="mt-5 text-center text-darknavy/70">
							Already have an account?{" "}
							<Link
								href="/login"
								transitionTypes={["auth-back"]}
								className="font-medium text-coralpink"
							>
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}

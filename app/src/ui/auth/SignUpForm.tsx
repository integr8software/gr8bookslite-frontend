"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	FormatPhilippineContactNumber,
	PHILIPPINE_PREFIX,
} from "@/app/src/data/shared/ContactData";
import type { AuthFormValues } from "@/app/src/data/auth/AuthTypes";
import { useSignUpForm } from "@/app/src/hooks/auth/useSignUpForm";
import { AuthField } from "./AuthField";
import { AuthPasswordRequirements } from "./AuthPasswordRequirements";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";

type SignUpFormValues = Required<AuthFormValues>;

const InitialSignUpFormValues: SignUpFormValues = {
	name: "",
	email: "",
	contactNumber: `${PHILIPPINE_PREFIX} `,
	password: "",
	confirmPassword: "",
	termsAccepted: false,
};

function GetSubmittedValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

export function SignUpForm() {
	const { state, formAction, pending } = useSignUpForm();
	const [formValues, setFormValues] = useState<Partial<SignUpFormValues>>({});
	const values: SignUpFormValues = {
		...InitialSignUpFormValues,
		...state.formValues,
		...formValues,
	};

	function updateValues(nextValues: Partial<SignUpFormValues>) {
		setFormValues((currentValues) => ({
			...currentValues,
			...nextValues,
		}));
	}

	function handleContactNumberChange(event: ChangeEvent<HTMLInputElement>) {
		updateValues({
			contactNumber: FormatPhilippineContactNumber(event.target.value),
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		const submittedFormData = new FormData(event.currentTarget);

		updateValues({
			name: GetSubmittedValue(submittedFormData, "name"),
			email: GetSubmittedValue(submittedFormData, "email"),
			contactNumber: GetSubmittedValue(submittedFormData, "contactNumber"),
			password: GetSubmittedValue(submittedFormData, "password"),
			confirmPassword: GetSubmittedValue(submittedFormData, "confirmPassword"),
			termsAccepted: values.termsAccepted,
		});
	}

	return (
		<main className="min-h-screen bg-white text-darknavy">
			<section className="flex min-h-screen flex-col bg-white lg:flex-row">
				<div className="sticky top-0 hidden h-screen lg:block lg:basis-1/2 lg:flex-none">
					<Image
						src="/img/signup-bg.png"
						alt="Office illustration with people collaborating at workstations."
						fill
						preload
						sizes="(max-width: 1024px) 0vw, 75vw"
						className="object-cover object-left"
					/>
				</div>

				<div className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:basis-1/2 lg:px-10 xl:px-14">
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

						<form
							action={formAction}
							onSubmit={handleSubmit}
							noValidate
							className="mt-10 space-y-4"
						>
							<AuthField
								label="Full Name"
								name="name"
								type="text"
								autoComplete="name"
								placeholder="John Doe"
								value={values.name}
								onChange={(event) =>
									updateValues({ name: event.target.value })
								}
								errors={state.errors?.name}
							/>
							<AuthField
								label="Email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="johndoe@example.com"
								value={values.email}
								onChange={(event) =>
									updateValues({ email: event.target.value })
								}
								errors={state.errors?.email}
							/>

							<AuthField
								label="Contact Number"
								name="contactNumber"
								type="tel"
								autoComplete="tel"
								placeholder="+63 934 305 9435"
								value={values.contactNumber}
								onChange={handleContactNumberChange}
								errors={state.errors?.contactNumber}
							/>

							<AuthField
								label="Password"
								name="password"
								type="password"
								autoComplete="new-password"
								placeholder="Enter your password..."
								value={values.password}
								onChange={(event) =>
									updateValues({ password: event.target.value })
								}
								errors={state.errors?.password}
							/>
							<AuthPasswordRequirements password={values.password} />
							<AuthField
								label="Confirm Password"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								placeholder="Please re-enter your password for confirmation..."
								value={values.confirmPassword}
								onChange={(event) =>
									updateValues({
										confirmPassword: event.target.value,
									})
								}
								errors={state.errors?.confirmPassword}
							/>

							<label className="flex items-start gap-3 pt-2 text-xs leading-4 text-darknavy/75">
								<input
									type="hidden"
									name="termsAccepted"
									value={values.termsAccepted ? "true" : "false"}
								/>
								<input
									type="checkbox"
									checked={values.termsAccepted}
									onChange={(event) =>
										updateValues({
											termsAccepted: event.target.checked,
										})
									}
									aria-invalid={
										state.errors?.termsAccepted?.length
											? true
											: undefined
									}
									className="peer sr-only"
								/>
								<span
									aria-hidden="true"
									className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-skyblue/30 ${values.termsAccepted
										? "border-darknavy bg-darknavy text-offwhite"
										: state.errors?.termsAccepted?.length
											? "border-coralpink bg-white"
											: "border-darknavy/30 bg-white"
										}`}
								>
									{values.termsAccepted ? (
										<Check className="h-3 w-3" strokeWidth={3} />
									) : null}
								</span>
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
									, including how my personal data is
									collected and used.
								</span>
							</label>
							{state.errors?.termsAccepted?.length ? (
								<p className="text-sm text-coralpink">
									{state.errors.termsAccepted[0]}
								</p>
							) : null}

							<div className="flex justify-center pt-4">
								<button
									type="submit"
									disabled={pending}
									aria-label={
										pending
											? "Creating account"
											: "Create account"
									}
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

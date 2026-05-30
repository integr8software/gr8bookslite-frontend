"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	DefaultPhilippineContactNumber,
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import type { AuthFormValues } from "@/app/src/data/auth/AuthTypes";
import { useSignUpForm } from "@/app/src/hooks/auth/useSignUpForm";
import { BuildGoogleAuthUrl } from "@/app/src/services/auth/AuthApi";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";
import { AuthField } from "@/app/src/ui/auth/AuthField";
import { AuthPasswordRequirements } from "@/app/src/ui/auth/AuthPasswordRequirements";
import {
	ArrowRight,
	Check,
	LoaderCircle,
} from "lucide-react";

type SignUpFormValues = Required<
	Pick<
		AuthFormValues,
		| "name"
		| "email"
		| "contactNumber"
		| "password"
		| "confirmPassword"
		| "termsAccepted"
	>
>;

const InitialSignUpFormValues: SignUpFormValues = {
	name: "",
	email: "",
	contactNumber: DefaultPhilippineContactNumber,
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
	const googleAuthUrl = BuildGoogleAuthUrl("signup");
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
		<main className="min-h-screen bg-[#f6f9fc] text-slate-950">
			<section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
				<div className="w-full max-w-2xl rounded-lg bg-white p-6 ring-1 ring-slate-200 sm:p-8">
						<Link
							href="/"
							className="inline-flex text-xl font-semibold sm:text-2xl"
						>
							<LogoText brandSuffixClassName="text-sm" />
						</Link>

						<div className="mt-8 lg:mt-0">
							<p className="text-sm font-bold uppercase text-sky-700">
								Create workspace
							</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
								Sign up
							</h1>
							<p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
								Start your accounting and inventory workspace with a secure account.
							</p>
						</div>

						<form
							action={formAction}
							onSubmit={handleSubmit}
							noValidate
							className="mt-8 grid gap-4 sm:grid-cols-2"
						>
							<div>
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
							</div>
							<div>
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
							</div>

							<div className="sm:col-span-2">
								<AuthField
									label="Contact Number"
									name="contactNumber"
									type="tel"
									autoComplete="tel"
									placeholder={PhilippineContactNumberPlaceholder}
									value={values.contactNumber}
									onChange={handleContactNumberChange}
									errors={state.errors?.contactNumber}
								/>
							</div>

							<div>
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
							</div>
							<div>
								<AuthField
									label="Confirm Password"
									name="confirmPassword"
									type="password"
									autoComplete="new-password"
									placeholder="Confirm your password..."
									value={values.confirmPassword}
									onChange={(event) =>
										updateValues({
											confirmPassword: event.target.value,
										})
									}
									errors={state.errors?.confirmPassword}
								/>
							</div>

							<label className="flex items-start gap-3 pt-1 text-xs leading-5 text-slate-600 sm:col-span-2">
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
										? "border-slate-950 bg-slate-950 text-white"
										: state.errors?.termsAccepted?.length
											? "border-coralpink bg-white"
											: "border-slate-300 bg-white"
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
										className="font-semibold text-sky-700 underline underline-offset-2 transition hover:text-sky-900"
									>
										Terms of Service
									</Link>{" "}
									and acknowledge I have read the{" "}
									<Link
										href="/privacy-policy"
										target="blank"
										className="font-semibold text-sky-700 underline underline-offset-2 transition hover:text-sky-900"
									>
										Privacy Policy
									</Link>
									, including how my personal data is
									collected and used.
								</span>
							</label>
							{state.errors?.termsAccepted?.length ? (
								<p className="text-sm font-medium text-coralpink sm:col-span-2">
									{state.errors.termsAccepted[0]}
								</p>
							) : null}

							<div className="flex justify-center pt-2 sm:col-span-2">
								<button
									type="submit"
									disabled={pending}
									aria-label={
										pending
											? "Creating account"
											: "Create account"
									}
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

							<div className="flex items-center gap-4 pt-1 text-sm text-slate-500 sm:col-span-2">
								<div className="h-px flex-1 bg-slate-200" />
								<span>or</span>
								<div className="h-px flex-1 bg-slate-200" />
							</div>

							<a
								href={googleAuthUrl}
								className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-white sm:col-span-2"
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
							Already have an account?{" "}
							<Link
								href="/login"
								transitionTypes={["auth-back"]}
								className="font-semibold text-sky-700 hover:text-sky-900"
							>
								Sign In
							</Link>
						</p>
					</div>
			</section>
		</main>
	);
}

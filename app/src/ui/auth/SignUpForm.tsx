"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
	Check,
	LockKeyhole,
	Mail,
	Phone,
	UserRound,
} from "lucide-react";
import type { AuthFormValues } from "@/app/src/data/auth/AuthTypes";
import {
	DefaultPhilippineContactNumber,
	FormatPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { useSignUpForm } from "@/app/src/hooks/auth/useSignUpForm";
import { BuildGoogleAuthUrl } from "@/app/src/services/auth/AuthApi";
import { AuthDivider } from "@/app/src/ui/auth/AuthDivider";
import { AuthField } from "@/app/src/ui/auth/AuthField";
import { AuthFormCard } from "@/app/src/ui/auth/AuthFormCard";
import { AuthSwitchLink } from "@/app/src/ui/auth/AuthFormTransition";
import { AuthGoogleButton } from "@/app/src/ui/auth/AuthGoogleButton";
import { AuthPageShell } from "@/app/src/ui/auth/AuthPageShell";
import { AuthPasswordRequirements } from "@/app/src/ui/auth/AuthPasswordRequirements";
import { AuthSubmitButton } from "@/app/src/ui/auth/AuthSubmitButton";

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
			contactNumber: GetSubmittedValue(
				submittedFormData,
				"contactNumber",
			),
			password: GetSubmittedValue(submittedFormData, "password"),
			confirmPassword: GetSubmittedValue(
				submittedFormData,
				"confirmPassword",
			),
			termsAccepted: values.termsAccepted,
		});
	}

	return (
		<AuthPageShell>
			<AuthFormCard
				wide
				title="Create your account"
				description="Start your secure accounting and inventory workspace."
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

				<form
					action={formAction}
					onSubmit={handleSubmit}
					noValidate
					className="grid gap-5 sm:grid-cols-2"
				>
					<AuthField
						label="Full name"
						name="name"
						type="text"
						autoComplete="name"
						placeholder="John Doe"
						value={values.name}
						onChange={(event) =>
							updateValues({ name: event.target.value })
						}
						errors={state.errors?.name}
						leadingIcon={<UserRound className="h-4 w-4" />}
					/>
					<AuthField
						label="Email address"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="you@company.com"
						value={values.email}
						onChange={(event) =>
							updateValues({ email: event.target.value })
						}
						errors={state.errors?.email}
						leadingIcon={<Mail className="h-4 w-4" />}
					/>

					<div className="sm:col-span-2">
						<AuthField
							label="Contact number"
							name="contactNumber"
							type="tel"
							inputMode="numeric"
							maxLength={16}
							autoComplete="tel"
							placeholder={PhilippineContactNumberPlaceholder}
							value={values.contactNumber}
							onChange={handleContactNumberChange}
							errors={state.errors?.contactNumber}
							leadingIcon={<Phone className="h-4 w-4" />}
						/>
					</div>

					<div>
						<AuthField
							label="Password"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Create a password"
							value={values.password}
							onChange={(event) =>
								updateValues({ password: event.target.value })
							}
							errors={state.errors?.password}
							leadingIcon={<LockKeyhole className="h-4 w-4" />}
						/>
						<AuthPasswordRequirements password={values.password} />
					</div>
					<AuthField
						label="Confirm password"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						placeholder="Repeat your password"
						value={values.confirmPassword}
						onChange={(event) =>
							updateValues({ confirmPassword: event.target.value })
						}
						errors={state.errors?.confirmPassword}
						leadingIcon={<LockKeyhole className="h-4 w-4" />}
					/>

					<label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-darknavy/60 sm:col-span-2">
						<input
							type="hidden"
							name="termsAccepted"
							value={values.termsAccepted ? "true" : "false"}
						/>
						<input
							type="checkbox"
							checked={values.termsAccepted}
							onChange={(event) =>
								updateValues({ termsAccepted: event.target.checked })
							}
							className="peer sr-only"
						/>
						<span
							aria-hidden="true"
							className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-skyblue/30 ${
								values.termsAccepted
									? "border-darknavy bg-darknavy text-white"
									: state.errors?.termsAccepted?.length
										? "border-coralpink bg-white"
										: "border-darknavy/20 bg-white"
							}`}
						>
							{values.termsAccepted ? (
								<Check className="h-3 w-3" strokeWidth={3} />
							) : null}
						</span>
						<span>
							I agree to the{" "}
							<Link
								href="/terms-of-service"
								target="_blank"
								className="font-semibold text-darknavy hover:text-sky-700"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy-policy"
								target="_blank"
								className="font-semibold text-darknavy hover:text-sky-700"
							>
								Privacy Policy
							</Link>
							.
						</span>
					</label>

					{state.errors?.termsAccepted?.length ? (
						<p className="text-sm font-medium text-coralpink sm:col-span-2">
							{state.errors.termsAccepted[0]}
						</p>
					) : null}

					<div className="sm:col-span-2">
						<AuthSubmitButton
							idleLabel="Create account"
							pendingLabel="Creating account..."
							pending={pending}
						/>
					</div>
				</form>

				<p className="mt-7 border-t border-darknavy/10 pt-7 text-center text-sm text-darknavy/60">
					Already have an account?{" "}
					<AuthSwitchLink
						href="/login"
						direction="back"
						className="font-semibold text-darknavy transition hover:text-sky-700"
					>
						Sign in
					</AuthSwitchLink>
				</p>
			</AuthFormCard>
		</AuthPageShell>
	);
}

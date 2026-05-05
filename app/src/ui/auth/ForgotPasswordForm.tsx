"use client";

import { useForgotPasswordForm } from "@/app/src/hooks/auth/useForgotPasswordForm";
import { AuthField } from "./AuthField";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function ForgotPasswordForm() {
	const { state, formAction, pending } = useForgotPasswordForm();

	return (
		<form action={formAction} className="space-y-5">
			<AuthStatusMessage state={state} />
			<AuthField
				label="Email"
				name="email"
				type="email"
				autoComplete="email"
				errors={state.errors?.email}
			/>
			<AuthSubmitButton pending={pending}>
				Send reset link
			</AuthSubmitButton>
		</form>
	);
}

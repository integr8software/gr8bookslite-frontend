"use client";

import { useLoginForm } from "@/app/src/hooks/auth/useLoginForm";
import { AuthField } from "./AuthField";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function LoginForm() {
	const { state, formAction, pending } = useLoginForm();

	return (
		<form action={formAction} className="space-y-5">
			<AuthField
				label="Email"
				name="email"
				type="email"
				autoComplete="email"
				errors={state.errors?.email}
			/>
			<AuthField
				label="Password"
				name="password"
				type="password"
				autoComplete="current-password"
				errors={state.errors?.password}
			/>
			<AuthStatusMessage state={state} />
			<AuthSubmitButton pending={pending}>Log in</AuthSubmitButton>
		</form>
	);
}

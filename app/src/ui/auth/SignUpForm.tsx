"use client";

import { useSignUpForm } from "@/app/src/hooks/auth/useSignUpForm";
import { AuthField } from "./AuthField";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function SignUpForm() {
  const { state, formAction, pending } = useSignUpForm();

  return (
    <form action={formAction} className="space-y-5">
      <AuthStatusMessage state={state} />
      <AuthField
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        errors={state.errors?.name}
        required
      />
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        errors={state.errors?.email}
        required
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state.errors?.password}
        required
      />
      <AuthField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        errors={state.errors?.confirmPassword}
        required
      />
      <AuthSubmitButton pending={pending}>Create account</AuthSubmitButton>
    </form>
  );
}

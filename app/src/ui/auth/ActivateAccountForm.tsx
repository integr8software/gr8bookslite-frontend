"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { ActivateWorkspaceInvitationAction } from "@/app/src/services/auth/AuthActions";
import { AuthActionStatuses, InitialAuthActionState, type AuthActionState } from "@/app/src/types/auth/AuthTypes";
import { AuthField } from "@/app/src/ui/auth/AuthField";
import { AuthPasswordRequirements } from "@/app/src/ui/auth/AuthPasswordRequirements";

type ActivateAccountFormProps = {
  email: string;
  token: string;
};

export function ActivateAccountForm({ email, token }: ActivateAccountFormProps) {
  const [state, formAction, pending] = useActionState(ActivateWorkspaceInvitationAction, InitialAuthActionState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const wasPendingRef = useRef(false);
  const hasValidInvitationLink = Boolean(email && token);
  const isComplete = state.status === AuthActionStatuses.Success;

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (justFinishedSubmitting && state.status === AuthActionStatuses.Error) {
      setConfirmPassword("");
    }
  }, [pending, state.status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-4 py-8 text-darknavy sm:px-6">
      <section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-darknavy text-offwhite">
            {isComplete ? (
              <CheckCircle2 size={27} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <KeyRound size={27} strokeWidth={2.5} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-darknavy">
            {isComplete ? "Password Created" : "Create Password"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-darknavy/80">
            {isComplete
              ? "You can now log in. Your account activates after your first successful sign in."
              : "Create a password for your workspace invitation."}
          </p>
        </div>

        {hasValidInvitationLink ? (
          <ActivatePasswordContent
            state={state}
            formAction={formAction}
            pending={pending}
            email={email}
            token={token}
            password={password}
            confirmPassword={confirmPassword}
            isComplete={isComplete}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />
        ) : (
          <InvalidInvitationMessage />
        )}

        <div className="pt-6 text-center">
          <Link href="/login?force=true" className="text-sm font-semibold text-darknavy/65 transition hover:text-darknavy">
            Back to log in
          </Link>
        </div>
      </section>
    </main>
  );
}

type ActivatePasswordContentProps = {
  state: AuthActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
  isComplete: boolean;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
};

function ActivatePasswordContent({
  state,
  formAction,
  pending,
  email,
  token,
  password,
  confirmPassword,
  isComplete,
  onPasswordChange,
  onConfirmPasswordChange,
}: ActivatePasswordContentProps) {
  if (isComplete) {
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-skyblue/25 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy">
          <p className="font-medium">Invitation password saved.</p>
          <p className="mt-1 text-darknavy/75">{state.message}</p>
        </div>

        <Link
          href="/login?force=true"
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8]"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />

      {state.status === AuthActionStatuses.Error && state.message ? (
        <div className="rounded-md border border-coralpink/25 bg-coralpink/10 px-4 py-3 text-sm leading-6 text-coralpink">
          {state.message}
        </div>
      ) : null}

      <AuthField
        label="New Password"
        id="activation-password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your new password..."
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        errors={state.errors?.password}
        required
      />

      <AuthPasswordRequirements password={password} />

      <AuthField
        label="Confirm Password"
        id="activation-confirm-password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Please re-enter your new password..."
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.target.value)}
        errors={state.errors?.confirmPassword}
        required
      />

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving..." : "Create Password"}
      </button>
    </form>
  );
}

function InvalidInvitationMessage() {
  return (
    <div className="rounded-md border border-coralpink/25 bg-coralpink/10 px-4 py-3 text-sm leading-6 text-coralpink">
      This invitation link is missing required details. Ask your administrator for a new invitation.
    </div>
  );
}

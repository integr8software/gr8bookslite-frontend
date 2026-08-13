"use client";

import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthActionStatuses, InitialAuthActionState, type AuthFieldErrors } from "@/app/src/types/auth/AuthTypes";
import { SavePendingVerificationEmail } from "@/app/src/data/auth/AuthVerificationStorage";
import { SignUpAction } from "@/app/src/services/auth/AuthActions";

function HasFieldErrors(errors?: AuthFieldErrors) {
  return Object.values(errors ?? {}).some((messages) => messages?.length);
}

export function useSignUpForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(SignUpAction, InitialAuthActionState);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === AuthActionStatuses.Success) {
      toast.success(state.message);
      if (state.pendingVerificationEmail) {
        SavePendingVerificationEmail(state.pendingVerificationEmail);
      }
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
      return;
    }

    if (state.status === AuthActionStatuses.Error && !HasFieldErrors(state.errors)) {
      toast.error(state.message);
    }
  }, [pending, router, state.message, state.pendingVerificationEmail, state.redirectTo, state.errors, state.status]);

  return {
    state,
    formAction,
    pending,
  };
}

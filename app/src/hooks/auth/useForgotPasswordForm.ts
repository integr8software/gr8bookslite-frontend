"use client";

import { useActionState } from "react";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import { ForgotPasswordAction } from "@/app/src/services/auth/AuthActions";

export function useForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    ForgotPasswordAction,
    InitialAuthActionState,
  );

  return {
    state,
    formAction,
    pending,
  };
}

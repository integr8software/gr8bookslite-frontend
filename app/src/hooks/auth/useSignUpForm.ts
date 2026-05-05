"use client";

import { useActionState } from "react";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import { SignUpAction } from "@/app/src/services/auth/AuthActions";

export function useSignUpForm() {
  const [state, formAction, pending] = useActionState(
    SignUpAction,
    InitialAuthActionState,
  );

  return {
    state,
    formAction,
    pending,
  };
}

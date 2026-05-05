"use client";

import { useActionState } from "react";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import { LoginAction } from "@/app/src/services/auth/AuthActions";

export function useLoginForm() {
  const [state, formAction, pending] = useActionState(
    LoginAction,
    InitialAuthActionState,
  );

  return {
    state,
    formAction,
    pending,
  };
}

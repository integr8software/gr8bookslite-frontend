"use client";

import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import { LoginAction } from "@/app/src/services/auth/AuthActions";

export function useLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    LoginAction,
    InitialAuthActionState,
  );
  const wasPendingRef = useRef(false);

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      router.push("/onboarding");
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [pending, router, state.message, state.status]);

  return {
    state,
    formAction,
    pending,
  };
}

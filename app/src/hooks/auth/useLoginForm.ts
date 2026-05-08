"use client";

import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  ClearPendingVerificationEmail,
  SavePendingVerificationEmail,
} from "@/app/src/data/auth/AuthVerificationStorage";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { LoginAction } from "@/app/src/services/auth/AuthActions";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

type LoginFormValues = {
  email: string;
};

const InitialLoginFormValues: LoginFormValues = {
  email: "",
};

function GetSubmittedValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function useLoginForm() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const [state, formAction, pending] = useActionState(
    LoginAction,
    InitialAuthActionState,
  );
  const [formValues, setFormValues] = useState<Partial<LoginFormValues>>({});
  const values: LoginFormValues = {
    ...InitialLoginFormValues,
    ...state.formValues,
    ...formValues,
  };
  const wasPendingRef = useRef(false);

  function updateValues(nextValues: Partial<LoginFormValues>) {
    setFormValues((currentValues) => ({
      ...currentValues,
      ...nextValues,
    }));
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    updateValues({ email: event.target.value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submittedFormData = new FormData(event.currentTarget);
    updateValues({
      email: GetSubmittedValue(submittedFormData, "email"),
    });
  }

  useEffect(() => {
    if (accessToken) {
      router.replace("/onboarding");
    }
  }, [accessToken, router]);

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === "success") {
      ClearPendingVerificationEmail();
      if (state.accessToken) {
        SaveAccessToken(state.accessToken, state.rememberMe ?? false);
        setAccessToken(state.accessToken);
      }
      toast.success(state.message);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
      if (state.pendingVerificationEmail) {
        SavePendingVerificationEmail(state.pendingVerificationEmail);
      }
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [
    pending,
    router,
    state.accessToken,
    state.message,
    state.rememberMe,
    state.pendingVerificationEmail,
    state.redirectTo,
    state.status,
    setAccessToken,
  ]);

  return {
    state,
    formAction,
    pending,
    values,
    handleEmailChange,
    handleSubmit,
  };
}

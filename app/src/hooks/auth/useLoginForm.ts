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
import { LoginAction } from "@/app/src/services/auth/AuthActions";

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
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === "success") {
      ClearPendingVerificationEmail();
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
    state.message,
    state.pendingVerificationEmail,
    state.redirectTo,
    state.status,
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

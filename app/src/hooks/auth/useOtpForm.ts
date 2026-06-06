"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  InitialAuthActionState,
  type AuthActionState,
} from "@/app/src/data/auth/AuthTypes";
import {
  ClearPendingVerificationEmail,
  GetPendingVerificationEmail,
  GetVerificationResendSecondsRemaining,
  SavePendingVerificationEmail,
  SaveVerificationResendCooldown,
} from "@/app/src/data/auth/AuthVerificationStorage";
import {
  AuthenticatedSessionMarker,
  SaveAccessToken,
} from "@/app/src/data/auth/AuthSessionStorage";
import {
  MaskEmailAddress,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from "@/app/src/data/auth/OtpData";
import {
  ChangeVerificationEmailAction,
  OtpAction,
  ResendVerificationAction,
} from "@/app/src/services/auth/AuthActions";
import { GetFallbackPostAuthRedirectPath } from "@/app/src/services/auth/AuthRedirects";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

type UseOtpFormOptions = {
  initialEmail?: string;
};

function NormalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function ResolveInitialEmail(initialEmail: string) {
  return NormalizeEmail(initialEmail) || GetPendingVerificationEmail();
}

function ResolveInitialResendSeconds(email: string) {
  return email ? GetVerificationResendSecondsRemaining(email) : 0;
}

function ResolveHasResendCooldown(email: string) {
  return ResolveInitialResendSeconds(email) > 0;
}

export function useOtpForm({
  initialEmail = "",
}: UseOtpFormOptions = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setAccessToken = useAppStore((state) => state.setAccessToken);
  const initialVerificationEmail = ResolveInitialEmail(initialEmail);
  const [hasEditedOtpAfterError, setHasEditedOtpAfterError] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previousState: AuthActionState, formData: FormData) => {
      const nextState = await OtpAction(previousState, formData);

      if (nextState.status === "error" || nextState.status === "success") {
        setHasEditedOtpAfterError(false);
      }

      return nextState;
    },
    InitialAuthActionState,
  );
  const [step, setStep] = useState<"email" | "verify">(
    initialVerificationEmail ? "verify" : "email",
  );
  const [email, setEmail] = useState(initialVerificationEmail);
  const [emailInput, setEmailInput] = useState(initialVerificationEmail);
  const [otp, setOtp] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    ResolveInitialResendSeconds(initialVerificationEmail),
  );
  const [hasActivatedResendCooldown, setHasActivatedResendCooldown] = useState(
    () => ResolveHasResendCooldown(initialVerificationEmail),
  );
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isSubmittingEmailStep, setIsSubmittingEmailStep] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (!initialVerificationEmail) {
      toast.error("Start email verification from sign up or log in.");
      router.replace("/login");
    }
  }, [initialVerificationEmail, router]);

  useEffect(() => {
    if (step !== "verify" || secondsRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsRemaining, step]);

  useEffect(() => {
    if (step !== "verify") {
      return;
    }

    window.requestAnimationFrame(() => {
      otpInputRef.current?.focus();
    });
  }, [step]);

  useEffect(() => {
    const justFinishedSubmitting = wasPendingRef.current && !pending;
    wasPendingRef.current = pending;

    if (!justFinishedSubmitting || !state.message || step !== "verify") {
      return;
    }

    if (state.status === "success") {
      ClearPendingVerificationEmail();
      queryClient.removeQueries({ queryKey: AuthQueryKeys.all });
      SaveAccessToken(AuthenticatedSessionMarker, false);
      setAccessToken(AuthenticatedSessionMarker);
      toast.success(state.message);
      if (state.redirectTo) {
        router.push(state.redirectTo);
        return;
      }
      router.push(GetFallbackPostAuthRedirectPath(null));
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [
    pending,
    queryClient,
    router,
    setAccessToken,
    state.message,
    state.redirectTo,
    state.status,
    step,
  ]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  const maskedEmail = useMemo(() => MaskEmailAddress(email), [email]);
  const canResend = secondsRemaining === 0;

  useEffect(() => {
    if (!email) {
      return;
    }

    SavePendingVerificationEmail(email);
  }, [email]);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (!isChangingEmail) {
      const nextSecondsRemaining =
        GetVerificationResendSecondsRemaining(trimmedEmail);

      setEmail(trimmedEmail);
      setEmailInput(trimmedEmail);
      setOtp("");
      setHasEditedOtpAfterError(false);
      setSecondsRemaining(nextSecondsRemaining);
      setHasActivatedResendCooldown(nextSecondsRemaining > 0);
      setStep("verify");
      return;
    }

    setIsSubmittingEmailStep(true);

    try {
      const formData = new FormData();
      formData.set("currentEmail", email);
      formData.set("newEmail", trimmedEmail);

      const nextState = await ChangeVerificationEmailAction(state, formData);

      if (nextState.status === "success") {
        const nextSecondsRemaining =
          GetVerificationResendSecondsRemaining(trimmedEmail);

        setEmail(trimmedEmail);
        setEmailInput(trimmedEmail);
        setOtp("");
        setHasEditedOtpAfterError(false);
        setSecondsRemaining(nextSecondsRemaining);
        setHasActivatedResendCooldown(nextSecondsRemaining > 0);
        setIsChangingEmail(false);
        setStep("verify");
        SavePendingVerificationEmail(trimmedEmail);
        toast.success(nextState.message);
        return;
      }

      toast.error(nextState.message);
    } finally {
      setIsSubmittingEmailStep(false);
    }
  }

  function handleOtpChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (state.status === "error") {
      setHasEditedOtpAfterError(true);
    }
    setOtp(nextValue);
  }

  function handleOtpFocus() {
    setIsOtpFocused(true);
  }

  function handleOtpBlur() {
    setIsOtpFocused(false);
  }

  async function handleResend() {
    if (!canResend) {
      toast(`Please wait ${formattedTime} before requesting a new code.`);
      return;
    }

    setIsResending(true);

    try {
      const formData = new FormData();
      formData.set("email", email);

      const nextState = await ResendVerificationAction(state, formData);

      if (nextState.status === "success") {
        setOtp("");
        setHasEditedOtpAfterError(false);
        setSecondsRemaining(OTP_RESEND_SECONDS);
        setHasActivatedResendCooldown(true);
        SaveVerificationResendCooldown(email, OTP_RESEND_SECONDS);
        toast.success(nextState.message);
        otpInputRef.current?.focus();
        return;
      }

      toast.error(nextState.message);
    } finally {
      setIsResending(false);
    }
  }

  function handleChangeEmail() {
    setOtp("");
    setHasEditedOtpAfterError(false);
    setIsChangingEmail(true);
    setEmailInput(email);
    setSecondsRemaining(0);
    setStep("email");
  }

  return {
    state,
    formAction,
    pending,
    hasRouteAccess: Boolean(initialVerificationEmail),
    isOtpErrorActive: state.status === "error" && !hasEditedOtpAfterError,
    step,
    email,
    setEmail,
    emailInput,
    setEmailInput,
    otp,
    otpInputRef,
    formattedTime,
    maskedEmail,
    canResend,
    hasActivatedResendCooldown,
    isChangingEmail,
    isSubmittingEmailStep,
    isResending,
    isOtpFocused,
    otpLength: OTP_LENGTH,
    handleEmailSubmit,
    handleOtpChange,
    handleOtpFocus,
    handleOtpBlur,
    handleResend,
    handleChangeEmail,
  };
}

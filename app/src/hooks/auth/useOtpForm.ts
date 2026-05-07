"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  ClearPendingVerificationEmail,
  GetPendingVerificationEmail,
  SavePendingVerificationEmail,
} from "@/app/src/data/auth/AuthVerificationStorage";
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

type UseOtpFormOptions = {
  initialEmail?: string;
};

function ResolveInitialVerificationEmail(initialEmail: string) {
  return initialEmail || GetPendingVerificationEmail();
}

export function useOtpForm({ initialEmail = "" }: UseOtpFormOptions = {}) {
  const router = useRouter();
  const initialVerificationEmail = ResolveInitialVerificationEmail(initialEmail);
  const [state, formAction, pending] = useActionState(
    OtpAction,
    InitialAuthActionState,
  );
  const [step, setStep] = useState<"email" | "verify">(
    initialVerificationEmail ? "verify" : "email",
  );
  const [email, setEmail] = useState(initialVerificationEmail);
  const [emailInput, setEmailInput] = useState(initialVerificationEmail);
  const [otp, setOtp] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(OTP_RESEND_SECONDS);
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isSubmittingEmailStep, setIsSubmittingEmailStep] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const wasPendingRef = useRef(false);

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
      toast.success(state.message);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [pending, router, state.message, state.redirectTo, state.status, step]);

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
      setEmail(trimmedEmail);
      setEmailInput(trimmedEmail);
      setOtp("");
      setSecondsRemaining(OTP_RESEND_SECONDS);
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
        setEmail(trimmedEmail);
        setEmailInput(trimmedEmail);
        setOtp("");
        setSecondsRemaining(OTP_RESEND_SECONDS);
        setIsChangingEmail(false);
        setStep("verify");
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
    setOtp(nextValue);
  }

  function handleOtpFocus() {
    if (state.status === "error" && otp.length === OTP_LENGTH) {
      setOtp("");
    }

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
        setSecondsRemaining(OTP_RESEND_SECONDS);
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
    setIsChangingEmail(true);
    setEmailInput(email);
    setSecondsRemaining(OTP_RESEND_SECONDS);
    setStep("email");
  }

  return {
    state,
    formAction,
    pending,
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

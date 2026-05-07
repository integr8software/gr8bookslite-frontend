"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { InitialAuthActionState } from "@/app/src/data/auth/AuthTypes";
import {
  MaskEmailAddress,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from "@/app/src/data/auth/OtpData";
import { OtpAction } from "@/app/src/services/auth/AuthActions";

type UseOtpFormOptions = {
  initialEmail?: string;
};

export function useOtpForm({ initialEmail = "" }: UseOtpFormOptions = {}) {
  const [state, formAction, pending] = useActionState(
    OtpAction,
    InitialAuthActionState,
  );
  const [step, setStep] = useState<"email" | "verify">(
    initialEmail ? "verify" : "email",
  );
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(OTP_RESEND_SECONDS);
  const [isOtpFocused, setIsOtpFocused] = useState(false);
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
      toast.success(state.message);
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [pending, state.message, state.status, step]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  const maskedEmail = useMemo(() => MaskEmailAddress(email), [email]);
  const canResend = secondsRemaining === 0;

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    setEmail(trimmedEmail);
    setOtp("");
    setSecondsRemaining(OTP_RESEND_SECONDS);
    setStep("verify");
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

  function handleResend() {
    if (!canResend) {
      toast(`Please wait ${formattedTime} before requesting a new code.`);
      return;
    }

    setOtp("");
    setSecondsRemaining(OTP_RESEND_SECONDS);
    toast.success("A new verification code has been sent.");
    otpInputRef.current?.focus();
  }

  function handleChangeEmail() {
    setOtp("");
    setEmail("");
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
    otp,
    otpInputRef,
    formattedTime,
    maskedEmail,
    canResend,
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

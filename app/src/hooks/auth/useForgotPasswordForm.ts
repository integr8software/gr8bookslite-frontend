"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  InitialAuthActionState,
  type AuthActionState,
} from "@/app/src/data/auth/AuthTypes";
import {
  MaskEmailAddress,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from "@/app/src/data/auth/OtpData";
import {
  ForgotPasswordAction,
  ForgotPasswordOtpAction,
  ResendForgotPasswordAction,
  ResetPasswordAction,
} from "@/app/src/services/auth/AuthActions";

type ForgotPasswordStep = "email" | "verify" | "reset";

export function useForgotPasswordForm() {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [hasEditedOtpAfterError, setHasEditedOtpAfterError] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const wasPendingRef = useRef(false);

  const [state, formAction, pending] = useActionState(
    async (previousState: AuthActionState, formData: FormData) => {
      const intent = formData.get("intent");

      if (intent === "verify-otp") {
        const nextState = await ForgotPasswordOtpAction(previousState, formData);

        if (nextState.status === "error" && nextState.errors?.otp) {
          setHasEditedOtpAfterError(false);
        }

        if (nextState.status === "success" && nextState.resetToken) {
          setHasEditedOtpAfterError(false);
          setResetToken(nextState.resetToken);
          setStep("reset");
        }

        return nextState;
      }

      if (intent === "reset-password") {
        const nextState = await ResetPasswordAction(previousState, formData);

        if (nextState.status === "success") {
          setIsResetComplete(true);
        }

        return nextState;
      }

      const nextState = await ForgotPasswordAction(previousState, formData);

      if (nextState.status === "success") {
        const submittedEmail = formData.get("email");

        if (typeof submittedEmail === "string") {
          setEmail(submittedEmail.trim());
        }

        setOtp("");
        setHasEditedOtpAfterError(false);
        setResetToken("");
        setIsResetComplete(false);
        setSecondsRemaining(0);
        setStep("verify");
      }

      return nextState;
    },
    InitialAuthActionState,
  );

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

    if (!justFinishedSubmitting || !state.message) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [pending, state.message, state.status]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsRemaining]);

  const maskedEmail = useMemo(() => MaskEmailAddress(email), [email]);
  const canResend = secondsRemaining === 0;

  const handleEmailSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const submittedEmail = formData.get("email");

    if (typeof submittedEmail === "string") {
      setEmail(submittedEmail.trim());
    }
  }, []);

  const handleOtpChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (state.status === "error" && state.errors?.otp) {
      setHasEditedOtpAfterError(true);
    }
    setOtp(nextValue);
  }, [state.errors?.otp, state.status]);

  const handleOtpFocus = useCallback(() => {
    setIsOtpFocused(true);
  }, []);

  const handleOtpBlur = useCallback(() => {
    setIsOtpFocused(false);
  }, []);

  const handleResend = useCallback(async () => {
    if (!canResend) {
      toast(`Please wait ${formattedTime} before requesting a new code.`);
      return;
    }

    if (!email) {
      setStep("email");
      toast.error("Enter your email address to request a reset OTP.");
      return;
    }

    setIsResending(true);

    try {
      const formData = new FormData();
      formData.set("email", email);

      const nextState = await ResendForgotPasswordAction(state, formData);

      if (nextState.status === "success") {
        setOtp("");
        setHasEditedOtpAfterError(false);
        setResetToken("");
        setSecondsRemaining(OTP_RESEND_SECONDS);
        toast.success(nextState.message);
        window.requestAnimationFrame(() => {
          otpInputRef.current?.focus();
        });
        return;
      }

      if (nextState.message) {
        toast.error(nextState.message);
      }
    } finally {
      setIsResending(false);
    }
  }, [canResend, email, formattedTime, state]);

  const handleChangeEmail = useCallback(() => {
    setOtp("");
    setHasEditedOtpAfterError(false);
    setResetToken("");
    setIsResetComplete(false);
    setSecondsRemaining(0);
    setStep("email");
  }, []);

  return {
    state,
    formAction,
    pending,
    isOtpErrorActive:
      state.status === "error" && Boolean(state.errors?.otp) && !hasEditedOtpAfterError,
    step,
    email,
    otp,
    resetToken,
    otpInputRef,
    formattedTime,
    maskedEmail,
    canResend,
    isResending,
    isOtpFocused,
    isResetComplete,
    otpLength: OTP_LENGTH,
    handleEmailSubmit,
    handleOtpChange,
    handleOtpFocus,
    handleOtpBlur,
    handleResend,
    handleChangeEmail,
  };
}

"use client";

import { ChangeEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import {
  BellRing,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MailCheck,
  Palette,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  AccountAccentColorOptions,
  AccountNotificationPreferenceOptions,
  AccountThemeOptions,
} from "@/app/src/constants/shared/AccountConstants";
import { OTP_LENGTH } from "@/app/src/data/auth/OtpData";
import { ResetPasswordSchema, OtpSchema } from "@/app/src/data/auth/AuthSchemas";
import { useAccountSettings } from "@/app/src/hooks/shared/useAccountSettings";
import { usePasswordVisibility } from "@/app/src/hooks/shared/usePasswordVisibility";
import {
  ChangeAuthenticatedPassword,
  RequestPasswordChangeOtp,
  VerifyPasswordChangeOtp,
} from "@/app/src/services/auth/AuthApi";
import type {
  AccountAccentColor,
  AccountNotificationPreference,
  AccountTheme,
} from "@/app/src/types/shared/AccountTypes";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";

type AccountSettingsPageProps = {
  scope: "account" | "workspace";
};

const SettingsInputClassName =
  "h-12 w-full rounded-2xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-2 focus:ring-skyblue/20";

const PrimarySettingsButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-darknavy px-4 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-darknavy/92 disabled:cursor-not-allowed disabled:bg-darknavy/35 disabled:text-offwhite/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const SecondarySettingsButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-offwhite disabled:cursor-not-allowed disabled:border-darknavy/8 disabled:text-darknavy/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

export function AccountSettingsPage({ scope }: AccountSettingsPageProps) {
  const {
    accessToken,
    accentColor,
    email,
    hasHydrated,
    notificationPreference,
    role,
    theme,
    visibleItemKeys,
    setAccentColor,
    setNotificationPreference,
    setTheme,
  } = useAccountSettings();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-darknavy/10 bg-white px-4 py-5 shadow-[0_22px_70px_rgba(33,39,56,0.08)] sm:px-6 sm:py-6 lg:px-8">
      <GradientBlurBackground fixed={false} height="h-full" className="opacity-55" />
      <div className="relative grid gap-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {scope === "workspace" ? "Workspace Settings" : "Account Settings"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-darknavy sm:text-3xl">
              Global configuration
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-darknavy/62">
              Preferences update immediately on this device. The visibility rules already understand future role-based behavior
              for {role === "SUPER_ADMIN" ? "super admins" : role === "ADMIN" ? "admins" : "users"}.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-skyblue/18 px-3 py-1 text-xs font-semibold text-darknavy">
            Simple V1
          </span>
        </header>

        <div className="grid gap-5">
          {visibleItemKeys.includes("changePassword") ? (
            <SettingsCard
              description="Verify your account with an OTP before setting a new password."
              icon={KeyRound}
              title="Change Password"
              compactHeader
            >
              <ChangePasswordPanel accessToken={accessToken} email={email} />
            </SettingsCard>
          ) : null}

          {visibleItemKeys.includes("theme") ? (
            <SettingsCard
              description="Theme selection is shared globally through Zustand, then applied through the root app theme effect so future pages can use the same preference."
              icon={Palette}
              title="Theme"
              compactHeader
            >
              <div className="space-y-4">
                <ThemePreviewGrid
                  disabled={!hasHydrated}
                  options={AccountThemeOptions}
                  selectedValue={theme}
                  onSelect={(nextTheme) => {
                    setTheme(nextTheme);
                    toast.success("Theme updated for this device.");
                  }}
                />
                <div className="rounded-2xl border border-skyblue/18 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy/68">
                  {hasHydrated
                    ? "Your selected theme is saved in this browser and applied immediately across the app."
                    : "Loading your saved theme preference..."}
                </div>
              </div>
            </SettingsCard>
          ) : null}

          {visibleItemKeys.includes("accentColor") ? (
            <SettingsCard
              description="Pick an accent color like Windows personalization. This changes the app highlight color and is saved for this browser."
              icon={Palette}
              title="Accent Color"
            >
              <div className="space-y-4">
                <AccentColorGrid
                  disabled={!hasHydrated}
                  options={AccountAccentColorOptions}
                  selectedValue={accentColor}
                  onSelect={(nextAccentColor) => {
                    setAccentColor(nextAccentColor);
                    toast.success("Accent color updated for this device.");
                  }}
                />
                <div className="flex items-center gap-3 rounded-2xl border border-skyblue/18 bg-skyblue/10 px-4 py-3 text-sm text-darknavy/70">
                  <span
                    className="h-6 w-6 rounded-full border border-darknavy/10 shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span>Current accent: {accentColor}</span>
                </div>
              </div>
            </SettingsCard>
          ) : null}

          {visibleItemKeys.includes("notificationPreference") ? (
            <SettingsCard
              description="Notification preference stays intentionally lean for now, but the store is already structured so more channels or per-role defaults can be layered in later."
              icon={BellRing}
              title="Notification Preference"
            >
              <OptionGrid<AccountNotificationPreference>
                options={AccountNotificationPreferenceOptions}
                selectedValue={notificationPreference}
                onSelect={setNotificationPreference}
              />
            </SettingsCard>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AccentColorGrid({
  disabled,
  onSelect,
  options,
  selectedValue,
}: {
  disabled: boolean;
  onSelect: (value: AccountAccentColor) => void;
  options: typeof AccountAccentColorOptions;
  selectedValue: AccountAccentColor;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            className={`rounded-[1.35rem] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-wait disabled:opacity-70 ${
              isSelected
                ? "border-darknavy bg-white shadow-[0_16px_36px_rgba(33,39,56,0.14)]"
                : "border-darknavy/10 bg-offwhite/72 hover:border-skyblue/35 hover:bg-white"
            }`}
          >
            <span
              className="block h-12 rounded-xl border border-white/30 shadow-sm"
              style={{ backgroundColor: option.value }}
            />
            <span className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-xs font-semibold text-darknavy">
                {option.label}
              </span>
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-darknavy bg-darknavy text-offwhite"
                    : "border-darknavy/12 bg-white text-transparent"
                }`}
              >
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

type ChangePasswordStep = "request-otp" | "verify-otp" | "set-password";

type PasswordErrors = {
  confirmPassword?: string;
  otp?: string;
  password?: string;
};

function ChangePasswordPanel({
  accessToken,
  email,
}: {
  accessToken: string | null;
  email: string;
}) {
  const [step, setStep] = useState<ChangePasswordStep>("request-otp");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const passwordVisibility = usePasswordVisibility("password");
  const confirmPasswordVisibility = usePasswordVisibility("password");
  const maskedEmail = useMemo(() => MaskEmail(email), [email]);

  async function sendOtp() {
    if (!accessToken) {
      toast.error("Please sign in before changing your password.");
      return;
    }

    setIsSendingOtp(true);

    try {
      const response = await RequestPasswordChangeOtp(accessToken);

      setStep("verify-otp");
      setErrors({});
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not send the OTP right now.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function verifyOtp() {
    if (!accessToken) {
      toast.error("Please sign in before changing your password.");
      return;
    }

    const parsedOtp = OtpSchema.safeParse({ otp });

    if (!parsedOtp.success) {
      setErrors({
        otp: parsedOtp.error.flatten().fieldErrors.otp?.[0],
      });
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await VerifyPasswordChangeOtp(accessToken, {
        code: parsedOtp.data.otp,
      });

      setResetToken(response.resetToken);
      setStep("set-password");
      setErrors({});
      toast.success(response.message);
    } catch (error) {
      setErrors({
        otp:
          error instanceof Error
            ? error.message
            : "We could not verify the OTP right now.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function savePassword() {
    if (!accessToken) {
      toast.error("Please sign in before changing your password.");
      return;
    }

    if (!resetToken) {
      toast.error("Verify your OTP before changing your password.");
      setStep("verify-otp");
      return;
    }

    const parsedPassword = ResetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!parsedPassword.success) {
      const fieldErrors = parsedPassword.error.flatten().fieldErrors;

      setErrors({
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await ChangeAuthenticatedPassword(accessToken, {
        resetToken,
        newPassword: parsedPassword.data.password,
        confirmNewPassword: parsedPassword.data.confirmPassword,
      });

      resetFlow();
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not change your password right now.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  function updateOtp(event: ChangeEvent<HTMLInputElement>) {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
    setErrors((current) => ({ ...current, otp: undefined }));
  }

  function resetFlow() {
    setStep("request-otp");
    setOtp("");
    setResetToken("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <PasswordStepPill
          icon={MailCheck}
          isActive={step === "request-otp"}
          isComplete={step !== "request-otp"}
          label="Send OTP"
        />
        <PasswordStepPill
          icon={ShieldCheck}
          isActive={step === "verify-otp"}
          isComplete={step === "set-password"}
          label="Verify"
        />
        <PasswordStepPill
          icon={LockKeyhole}
          isActive={step === "set-password"}
          isComplete={false}
          label="New Password"
        />
      </div>

      <div className="rounded-[1.5rem] border border-darknavy/10 bg-offwhite/65 p-4">
        {step === "request-otp" ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-darknavy">
                Send OTP to {maskedEmail || "your account email"}
              </p>
              <p className="mt-1 text-sm leading-6 text-darknavy/58">
                You will use this code before entering a new password.
              </p>
            </div>
            <button
              type="button"
              onClick={sendOtp}
              disabled={isSendingOtp}
              className={PrimarySettingsButtonClassName}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>{isSendingOtp ? "Sending..." : "Send OTP"}</span>
            </button>
          </div>
        ) : null}

        {step === "verify-otp" ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <SettingsInputField
              error={errors.otp}
              label="OTP Code"
            >
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={updateOtp}
                maxLength={OTP_LENGTH}
                placeholder="Enter OTP"
                className={SettingsInputClassName}
              />
            </SettingsInputField>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetFlow}
                className={SecondarySettingsButtonClassName}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={isVerifyingOtp || otp.length !== OTP_LENGTH}
                className={PrimarySettingsButtonClassName}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>{isVerifyingOtp ? "Verifying..." : "Verify OTP"}</span>
              </button>
            </div>
          </div>
        ) : null}

        {step === "set-password" ? (
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SettingsInputField
                error={errors.password}
                label="New Password"
              >
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={password}
                  visibility={passwordVisibility}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                />
              </SettingsInputField>
              <SettingsInputField
                error={errors.confirmPassword}
                label="Confirm Password"
              >
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  visibility={confirmPasswordVisibility}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: undefined,
                    }));
                  }}
                />
              </SettingsInputField>
            </div>
            <PasswordRequirementList password={password} />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetFlow}
                className={SecondarySettingsButtonClassName}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={savePassword}
                disabled={isSavingPassword}
                className={PrimarySettingsButtonClassName}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>{isSavingPassword ? "Saving..." : "Change Password"}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PasswordStepPill({
  icon: Icon,
  isActive,
  isComplete,
  label,
}: {
  icon: typeof KeyRound;
  isActive: boolean;
  isComplete: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
        isActive
          ? "border-skyblue/40 bg-skyblue/12 text-darknavy"
          : isComplete
            ? "border-citron/35 bg-citron/18 text-darknavy"
            : "border-darknavy/10 bg-white text-darknavy/55"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}

function SettingsInputField({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 self-start">
      <span className="text-sm font-semibold text-darknavy">{label}</span>
      {children}
      <span className="min-h-4 text-xs font-medium text-coralpink">
        {error ?? ""}
      </span>
    </label>
  );
}

function PasswordInput({
  autoComplete,
  onChange,
  placeholder,
  value,
  visibility,
}: {
  autoComplete: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  value: string;
  visibility: ReturnType<typeof usePasswordVisibility>;
}) {
  const ToggleIcon = visibility.isPasswordVisible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        type={visibility.inputType}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${SettingsInputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={visibility.togglePasswordVisibility}
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-darknavy/55 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        aria-label={visibility.isPasswordVisible ? "Hide password" : "Show password"}
      >
        <ToggleIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function PasswordRequirementList({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 number", met: /\d/.test(password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
    {
      label: "At least 1 special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <ul className="grid gap-2 rounded-2xl border border-darknavy/10 bg-white/70 p-4 sm:grid-cols-2 lg:grid-cols-5">
      {requirements.map((requirement) => (
        <li
          key={requirement.label}
          className={`flex items-center gap-2 text-xs font-medium ${
            requirement.met ? "text-green-600" : "text-darknavy/55"
          }`}
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
              requirement.met
                ? "border-green-500 bg-green-500 text-white"
                : "border-darknavy/12 bg-white text-transparent"
            }`}
          >
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          {requirement.label}
        </li>
      ))}
    </ul>
  );
}

function MaskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "";
  }

  if (name.length <= 2) {
    return `${name[0] ?? "*"}***@${domain}`;
  }

  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

function ThemePreviewGrid({
  disabled,
  onSelect,
  options,
  selectedValue,
}: {
  disabled: boolean;
  onSelect: (value: AccountTheme) => void;
  options: typeof AccountThemeOptions;
  selectedValue: AccountTheme;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            className={`group overflow-hidden rounded-[1.6rem] border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-wait disabled:opacity-70 ${
              isSelected
                ? "border-darknavy bg-white shadow-[0_22px_48px_rgba(33,39,56,0.14)]"
                : "border-darknavy/10 bg-white hover:border-skyblue/38 hover:shadow-[0_18px_40px_rgba(87,196,229,0.14)]"
            }`}
          >
            <div
              className="p-4"
              style={{ backgroundColor: option.preview.surface }}
            >
              <div
                className="rounded-[1.2rem] border p-3 shadow-sm"
                style={{
                  backgroundColor: option.preview.panel,
                  borderColor: `${option.preview.accent}18`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="h-3 w-16 rounded-full"
                    style={{ backgroundColor: `${option.preview.text}20` }}
                  />
                  <div
                    className="h-8 w-8 rounded-xl"
                    style={{ backgroundColor: option.preview.accent }}
                  />
                </div>
                <div className="mt-4 grid gap-2">
                  <div
                    className="h-3 w-24 rounded-full"
                    style={{ backgroundColor: `${option.preview.text}22` }}
                  />
                  <div
                    className="h-3 w-18 rounded-full"
                    style={{ backgroundColor: `${option.preview.text}12` }}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <div
                    className="h-9 flex-1 rounded-xl"
                    style={{ backgroundColor: option.preview.accent }}
                  />
                  <div
                    className="h-9 w-12 rounded-xl"
                    style={{ backgroundColor: option.preview.highlight }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-darknavy">{option.label}</p>
                <p className="mt-1 text-xs leading-5 text-darknavy/58">
                  {option.description}
                </p>
              </div>
              <span
                className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border transition ${
                  isSelected
                    ? "border-darknavy bg-darknavy text-offwhite"
                    : "border-darknavy/12 bg-white text-transparent group-hover:border-skyblue/38"
                }`}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SettingsCard({
  children,
  compactHeader = false,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  compactHeader?: boolean;
  description: string;
  icon: typeof Palette;
  title: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-darknavy/10 bg-white/92 p-5 shadow-sm backdrop-blur">
      <div
        className={
          compactHeader
            ? "grid gap-5"
            : "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        }
      >
        <div className={compactHeader ? "max-w-3xl" : "max-w-2xl"}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-offwhite text-darknavy shadow-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-darknavy">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-darknavy/62">{description}</p>
        </div>
        <div className={compactHeader ? "w-full" : "w-full max-w-3xl"}>
          {children}
        </div>
      </div>
    </article>
  );
}

function OptionGrid<TValue extends string>({
  onSelect,
  options,
  selectedValue,
}: {
  onSelect: (value: TValue) => void;
  options: Array<{
    value: TValue;
    label: string;
    description: string;
  }>;
  selectedValue: TValue;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 ${
              isSelected
                ? "border-darknavy bg-darknavy text-offwhite shadow-[0_18px_42px_rgba(33,39,56,0.18)]"
                : "border-darknavy/10 bg-offwhite/72 text-darknavy hover:border-skyblue/40 hover:bg-skyblue/10"
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className={`mt-2 block text-xs leading-5 ${isSelected ? "text-offwhite/80" : "text-darknavy/58"}`}>
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

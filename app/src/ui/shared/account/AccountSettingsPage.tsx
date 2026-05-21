"use client";

import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { BellRing, Check, KeyRound, Palette } from "lucide-react";
import {
  AccountAccentColorOptions,
  AccountNotificationPreferenceOptions,
  AccountThemeOptions,
} from "@/app/src/constants/shared/AccountConstants";
import { useAccountSettings } from "@/app/src/hooks/shared/useAccountSettings";
import type {
  AccountAccentColor,
  AccountNotificationPreference,
  AccountTheme,
} from "@/app/src/types/shared/AccountTypes";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";

type AccountSettingsPageProps = {
  scope: "account" | "workspace";
};

export function AccountSettingsPage({ scope }: AccountSettingsPageProps) {
  const {
    accentColor,
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
              description="The password flow is intentionally parked here so profile stays focused on identity data. You can wire the real security action later without moving the layout."
              icon={KeyRound}
              title="Change Password"
            >
              <button
                type="button"
                onClick={() => {
                  toast("Change password can be connected here once the security flow is ready.");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
              >
                Open Password Settings
              </button>
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

"use client";

import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { BellRing, KeyRound, Palette } from "lucide-react";
import {
  AccountNotificationPreferenceOptions,
  AccountThemeOptions,
} from "@/app/src/constants/shared/AccountConstants";
import { useAccountSettings } from "@/app/src/hooks/shared/useAccountSettings";
import type { AccountNotificationPreference, AccountTheme } from "@/app/src/types/shared/AccountTypes";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

type AccountSettingsPageProps = {
  scope: "account" | "workspace";
};

export function AccountSettingsPage({ scope }: AccountSettingsPageProps) {
  const {
    notificationPreference,
    role,
    theme,
    visibleItemKeys,
    setNotificationPreference,
    setTheme,
  } = useAccountSettings();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-darknavy/10 bg-white px-4 py-5 shadow-[0_22px_70px_rgba(33,39,56,0.08)] sm:px-6 sm:py-6 lg:px-8">
      <GradientBlurBackground fixed={false} height="h-full" className="opacity-55" />
      <div className="relative grid gap-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coralpink">
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
            >
              <OptionGrid<AccountTheme>
                options={AccountThemeOptions}
                selectedValue={theme}
                onSelect={setTheme}
              />
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

function SettingsCard({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Palette;
  title: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-darknavy/10 bg-white/92 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-offwhite text-darknavy shadow-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-darknavy">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-darknavy/62">{description}</p>
        </div>
        <div className="w-full max-w-3xl">{children}</div>
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

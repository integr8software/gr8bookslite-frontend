"use client";

import type { ReactNode } from "react";
import { Camera, Mail, Phone, Save, ShieldCheck, X } from "lucide-react";
import { PhilippineContactNumberPlaceholder } from "@/app/src/data/shared/ContactData";
import { useAccountProfile } from "@/app/src/hooks/shared/useAccountProfile";
import { ImageCropDialog } from "@/app/src/ui/shared/ImageCropDialog";
import { AppSkeleton } from "@/app/src/ui/shared/AppSkeleton";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

export function AccountProfilePage() {
  const {
    isLoading,
    isUpdatingAvatar,
    isSavingProfile,
    hasPendingProfileChanges,
    pendingAvatarCrop,
    profile,
    visibleFieldKeys,
    applyCroppedAvatar,
    dismissAvatarCropper,
    updateAvatar,
    updateContactNumber,
    focusContactNumber,
    updateFullName,
    removeAvatar,
    cancelProfileChanges,
    saveProfileChanges,
  } = useAccountProfile();

  if (isLoading) {
    return <AccountProfileSkeleton />;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-darknavy/10 bg-white px-4 py-5 shadow-[0_22px_70px_rgba(33,39,56,0.08)] sm:px-6 sm:py-6 lg:px-8">
      <GradientBlurBackground fixed={false} height="h-full" className="opacity-60" />
      <div className="relative grid gap-6">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-skyblue">
              Account Profile
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-darknavy sm:text-3xl">
              Your profile details
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-darknavy/62">
              This first version keeps profile management simple. Field visibility is already prepared for future
              `SUPER_ADMIN`, `ADMIN`, and `USER` differences without changing the page structure later.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto xl:justify-end">
            <span className="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-citron/40 px-3 py-1 text-xs font-semibold text-darknavy sm:w-auto">
              {profile.roleLabel}
            </span>
            <button
              type="button"
              onClick={cancelProfileChanges}
              disabled={!hasPendingProfileChanges || isSavingProfile}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-offwhite disabled:cursor-not-allowed disabled:border-darknavy/8 disabled:text-darknavy/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 sm:flex-none"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={saveProfileChanges}
              disabled={!hasPendingProfileChanges || isSavingProfile}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-darknavy px-4 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-darknavy/92 disabled:cursor-not-allowed disabled:bg-darknavy/35 disabled:text-offwhite/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 sm:flex-none"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <section className="rounded-[1.75rem] border border-darknavy/10 bg-white/92 p-5 shadow-sm backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/55">
              Avatar
            </h2>
            <div className="mt-5 flex flex-col items-center gap-4 text-center">
              {visibleFieldKeys.includes("avatar") ? (
                <AvatarSwatch
                  avatarDataUrl={profile.avatarDataUrl}
                  initials={profile.initials}
                />
              ) : null}
              <div>
                <p className="text-lg font-semibold text-darknavy">{profile.fullName}</p>
                <p className="mt-1 text-sm text-darknavy/55">{profile.email}</p>
              </div>
              {visibleFieldKeys.includes("avatar") ? (
                <>
                  <label className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/92 focus-within:ring-2 focus-within:ring-skyblue/35">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    <span>Change Avatar</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={updateAvatar}
                    />
                  </label>
                  {profile.avatarDataUrl ? (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      disabled={isUpdatingAvatar}
                      className="text-sm font-semibold text-coralpink transition hover:text-coralpink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
                    >
                      {isUpdatingAvatar ? "Updating avatar..." : "Remove avatar"}
                    </button>
                  ) : null}
                </>
              ) : null}
              <p className="max-w-xs text-xs leading-5 text-darknavy/50">
                Avatar images are cropped before upload and stored in your Supabase user avatar folder.
              </p>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-darknavy/10 bg-white/92 p-5 shadow-sm backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-darknavy/55">
              Profile Info
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleFieldKeys.includes("fullName") ? (
                <FieldCard
                  icon={ShieldCheck}
                  label="Full Name"
                  description="Editable"
                >
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={updateFullName}
                    className={InputClassName}
                  />
                </FieldCard>
              ) : null}

              {visibleFieldKeys.includes("email") ? (
                <FieldCard
                  icon={Mail}
                  label="Email"
                  description="Readonly"
                >
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className={`${InputClassName} bg-darknavy/[0.03] text-darknavy/65`}
                  />
                </FieldCard>
              ) : null}

              {visibleFieldKeys.includes("contactNumber") ? (
                <FieldCard
                  icon={Phone}
                  label="Contact Number"
                  description="Editable"
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={profile.contactNumber}
                    onChange={updateContactNumber}
                    onFocus={focusContactNumber}
                    maxLength={16}
                    placeholder={PhilippineContactNumberPlaceholder}
                    className={InputClassName}
                  />
                </FieldCard>
              ) : null}
            </div>
            <div className="mt-5 rounded-2xl border border-skyblue/20 bg-skyblue/8 px-4 py-3 text-sm leading-6 text-darknavy/70">
              Role-based visibility is already centralized in the shared account data layer, so future fields can be exposed by
              role without rewriting this page.
            </div>
          </section>
        </div>
      </div>
      <ImageCropDialog
        isOpen={Boolean(pendingAvatarCrop)}
        title="Crop Avatar"
        aspect={1}
        cropShape="round"
        fileName={pendingAvatarCrop?.fileName ?? "avatar.png"}
        mimeType={pendingAvatarCrop?.mimeType ?? "image/png"}
        sourceImageUrl={pendingAvatarCrop?.sourceImageUrl ?? ""}
        onCancel={dismissAvatarCropper}
        onConfirm={applyCroppedAvatar}
      />
    </section>
  );
}

const InputClassName =
  "h-12 w-full rounded-2xl border border-darknavy/12 bg-white px-4 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-2 focus:ring-skyblue/20";

function FieldCard({
  children,
  description,
  icon: Icon,
  label,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Mail;
  label: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-darknavy/10 bg-offwhite/65 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-darknavy shadow-sm">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-darknavy">{label}</p>
            <span className="text-xs font-medium text-darknavy/45">{description}</span>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </article>
  );
}

function AvatarSwatch({
  avatarDataUrl,
  initials,
}: {
  avatarDataUrl: string | null;
  initials: string;
}) {
  if (avatarDataUrl) {
    return (
      <span
        aria-hidden="true"
        className="block h-28 w-28 rounded-[2rem] border border-white/80 bg-cover bg-center shadow-[0_18px_42px_rgba(33,39,56,0.18)]"
        style={{ backgroundImage: `url("${avatarDataUrl}")` }}
      />
    );
  }

  return (
    <span className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-linear-to-br from-skyblue/75 to-citron/70 text-3xl font-semibold tracking-tight text-darknavy shadow-[0_18px_42px_rgba(33,39,56,0.18)]">
      {initials}
    </span>
  );
}

function AccountProfileSkeleton() {
  return (
    <section className="rounded-[2rem] border border-darknavy/10 bg-white p-6 shadow-[0_22px_70px_rgba(33,39,56,0.08)]">
      <div className="grid gap-6">
        <div className="space-y-3">
          <AppSkeleton className="h-3 w-28 rounded-full" />
          <AppSkeleton className="h-8 w-56 rounded-2xl" />
          <AppSkeleton className="h-5 w-full max-w-2xl rounded-2xl" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="rounded-[1.75rem] border border-darknavy/10 p-5">
            <div className="flex flex-col items-center gap-4">
              <AppSkeleton className="h-28 w-28 rounded-[2rem]" />
              <AppSkeleton className="h-5 w-32 rounded-full" />
              <AppSkeleton className="h-4 w-40 rounded-full" />
              <AppSkeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-darknavy/10 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {["one", "two", "three"].map((key) => (
                <div key={key} className="rounded-[1.5rem] border border-darknavy/10 p-4">
                  <AppSkeleton className="h-4 w-24 rounded-full" />
                  <AppSkeleton className="mt-4 h-12 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

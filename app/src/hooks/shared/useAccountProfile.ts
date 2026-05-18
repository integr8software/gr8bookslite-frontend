"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BuildAccountProfileViewModel, GetVisibleProfileFields } from "@/app/src/data/shared/AccountData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import { useAccountPreferences } from "@/app/src/hooks/shared/useAccountPreferences";
import { ReadFileAsDataUrl } from "@/app/src/services/shared/ImageCropper";

const AllowedAvatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const MaxAvatarSizeInBytes = 2 * 1024 * 1024;

type PendingAvatarCrop = {
  fileName: string;
  mimeType: string;
  sourceImageUrl: string;
};

export function useAccountProfile() {
  const accessToken = useAppStore((state) => state.accessToken);
  const profileDrafts = useAccountPreferences((state) => state.profileDrafts);
  const updateProfileDraft = useAccountPreferences(
    (state) => state.updateProfileDraft,
  );
  const { data: authProfile, isLoading } = useAuthProfileQuery({ accessToken });
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(
    null,
  );
  const draft = profileDrafts[String(authProfile?.user.id ?? "local-account-user")];
  const profile = useMemo(
    () => BuildAccountProfileViewModel(authProfile, draft),
    [authProfile, draft],
  );
  const visibleFieldKeys = useMemo(
    () => GetVisibleProfileFields(profile.role),
    [profile.role],
  );

  useEffect(() => {
    return () => {
      if (pendingAvatarCrop?.sourceImageUrl) {
        URL.revokeObjectURL(pendingAvatarCrop.sourceImageUrl);
      }
    };
  }, [pendingAvatarCrop]);

  function updateFullName(event: ChangeEvent<HTMLInputElement>) {
    updateProfileDraft(profile.userId, { fullName: event.target.value });
  }

  function updateContactNumber(event: ChangeEvent<HTMLInputElement>) {
    updateProfileDraft(profile.userId, { contactNumber: event.target.value });
  }

  async function updateAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!AllowedAvatarMimeTypes.has(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MaxAvatarSizeInBytes) {
      toast.error("Avatar image must be 2MB or smaller.");
      return;
    }

    setPendingAvatarCrop({
      fileName: file.name,
      mimeType: file.type || "image/png",
      sourceImageUrl: URL.createObjectURL(file),
    });
  }

  function removeAvatar() {
    updateProfileDraft(profile.userId, { avatarDataUrl: null });
    toast.success("Avatar removed for this device.");
  }

  async function applyCroppedAvatar(file: File) {
    const avatarDataUrl = await ReadFileAsDataUrl(file);
    updateProfileDraft(profile.userId, { avatarDataUrl });
    dismissAvatarCropper();
    toast.success("Avatar updated for this device.");
  }

  function dismissAvatarCropper() {
    if (pendingAvatarCrop?.sourceImageUrl) {
      URL.revokeObjectURL(pendingAvatarCrop.sourceImageUrl);
    }

    setPendingAvatarCrop(null);
  }

  return {
    isLoading: Boolean(accessToken) && isLoading,
    pendingAvatarCrop,
    profile,
    visibleFieldKeys,
    applyCroppedAvatar,
    dismissAvatarCropper,
    updateAvatar,
    updateContactNumber,
    updateFullName,
    removeAvatar,
  };
}

"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BuildAccountProfileViewModel, GetVisibleProfileFields } from "@/app/src/data/shared/account/AccountData";
import {
  DefaultPhilippineContactNumber,
  FormatPhilippineContactNumber,
} from "@/app/src/data/shared/contact/ContactData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useAccountPreferences } from "@/app/src/hooks/shared/account/useAccountPreferences";
import {
  DeleteUserAccountAvatar,
  UpdateUserAccountProfile,
  UploadUserAccountAvatar,
} from "@/app/src/services/users/UserAccountApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { ReadFileAsDataUrl } from "@/app/src/services/shared/media/ImageCropper";

const AllowedAvatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const MaxAvatarSizeInBytes = 2 * 1024 * 1024;

type PendingAvatarCrop = {
  fileName: string;
  mimeType: string;
  sourceImageUrl: string;
};

export function useAccountProfile() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const profileDrafts = useAccountPreferences((state) => state.profileDrafts);
  const clearProfileDraft = useAccountPreferences((state) => state.clearProfileDraft);
  const updateProfileDraft = useAccountPreferences(
    (state) => state.updateProfileDraft,
  );
  const { data: authProfile, isLoading } = useAuthProfileQuery({ accessToken });
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<PendingAvatarCrop | null>(
    null,
  );
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarAction, setPendingAvatarAction] = useState<
    "replace" | "remove" | null
  >(null);
  const profileUserId = String(authProfile?.user.id ?? "local-account-user");
  const draft = profileDrafts[profileUserId];
  const profile = useMemo(
    () => BuildAccountProfileViewModel(authProfile, draft),
    [authProfile, draft],
  );
  const visibleFieldKeys = useMemo(
    () => GetVisibleProfileFields(profile.role),
    [profile.role],
  );
  const hasPendingProfileChanges = useMemo(() => {
    if (!authProfile) {
      return false;
    }

    const savedContactNumber = authProfile.user.contactNumber
      ? FormatPhilippineContactNumber(authProfile.user.contactNumber)
      : "";

    return (
      profile.fullName.trim() !== authProfile.user.name ||
      GetSubmittedContactNumber(profile.contactNumber) !==
        GetSubmittedContactNumber(savedContactNumber) ||
      pendingAvatarAction !== null
    );
  }, [
    authProfile,
    pendingAvatarAction,
    profile.contactNumber,
    profile.fullName,
  ]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile.fullName.trim()) {
        throw new Error("Full name is required.");
      }

      await UpdateUserAccountProfile({
        fullName: profile.fullName,
        contactNumber: GetSubmittedContactNumber(profile.contactNumber),
      });

      if (pendingAvatarAction === "replace") {
        if (!pendingAvatarFile) {
          throw new Error("Please choose an avatar image again.");
        }

        await UploadUserAccountAvatar(pendingAvatarFile);
      }

      if (pendingAvatarAction === "remove") {
        await DeleteUserAccountAvatar();
      }
    },
    onSuccess: async () => {
      await invalidateAuthProfile();
      resetPendingChanges();
      toast.success("Profile changes saved.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not save your profile changes.",
      );
    },
  });
  async function invalidateAuthProfile() {
    await queryClient.invalidateQueries({
      queryKey: AuthQueryKeys.profiles(),
    });
  }

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
    updateProfileDraft(profile.userId, {
      contactNumber: FormatPhilippineContactNumber(event.target.value),
    });
  }

  function focusContactNumber() {
    if (!profile.contactNumber) {
      updateProfileDraft(profile.userId, {
        contactNumber: DefaultPhilippineContactNumber,
      });
    }
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

    dismissAvatarCropper();
    setPendingAvatarCrop({
      fileName: file.name,
      mimeType: file.type || "image/png",
      sourceImageUrl: URL.createObjectURL(file),
    });
  }

  function removeAvatar() {
    setPendingAvatarFile(null);
    setPendingAvatarAction("remove");
    updateProfileDraft(profile.userId, { avatarDataUrl: null });
  }

  async function applyCroppedAvatar(file: File) {
    if (file.size > MaxAvatarSizeInBytes) {
      toast.error("Cropped avatar image must be 2MB or smaller.");
      return;
    }

    const avatarDataUrl = await ReadFileAsDataUrl(file);
    setPendingAvatarFile(file);
    setPendingAvatarAction("replace");
    updateProfileDraft(profile.userId, { avatarDataUrl });
    dismissAvatarCropper();
  }

  function dismissAvatarCropper() {
    if (pendingAvatarCrop?.sourceImageUrl) {
      URL.revokeObjectURL(pendingAvatarCrop.sourceImageUrl);
    }

    setPendingAvatarCrop(null);
  }

  function saveProfileChanges() {
    if (!hasPendingProfileChanges || saveProfileMutation.isPending) {
      return;
    }

    saveProfileMutation.mutate();
  }

  function cancelProfileChanges() {
    if (saveProfileMutation.isPending) {
      return;
    }

    resetPendingChanges();
  }

  function resetPendingChanges() {
    clearProfileDraft(profile.userId);
    setPendingAvatarFile(null);
    setPendingAvatarAction(null);
    dismissAvatarCropper();
  }

  return {
    hasPendingProfileChanges,
    isLoading,
    isSavingProfile: saveProfileMutation.isPending,
    isUpdatingAvatar: saveProfileMutation.isPending,
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
  };
}

function GetSubmittedContactNumber(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue === DefaultPhilippineContactNumber.trim()
    ? ""
    : trimmedValue;
}

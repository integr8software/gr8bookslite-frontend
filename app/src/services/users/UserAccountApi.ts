import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

export type UpdateUserAccountProfileRequest = {
  fullName: string;
  contactNumber: string;
};

export async function UpdateUserAccountProfile(
  body: UpdateUserAccountProfileRequest,
) {
  const response = await ApiClient.patch("/users/me", body);

  return response.data;
}

export async function UploadUserAccountAvatar(avatarFile: File) {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await ApiClient.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
}

export async function DeleteUserAccountAvatar() {
  const response = await ApiClient.delete("/users/me/avatar");

  return response.data;
}

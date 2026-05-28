import { ApiClient } from "@/app/src/services/shared/api/ApiClient";

export type UpdateUserAccountProfileRequest = {
  fullName: string;
  contactNumber: string;
};

function GetAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function UpdateUserAccountProfile(
  accessToken: string | null,
  body: UpdateUserAccountProfileRequest,
) {
  const response = await ApiClient.patch("/users/me", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });

  return response.data;
}

export async function UploadUserAccountAvatar(
  accessToken: string | null,
  avatarFile: File,
) {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await ApiClient.post("/users/me/avatar", formData, {
    headers: {
      ...GetAuthorizationHeaders(accessToken),
      "Content-Type": undefined,
    },
  });

  return response.data;
}

export async function DeleteUserAccountAvatar(accessToken: string | null) {
  const response = await ApiClient.delete("/users/me/avatar", {
    headers: GetAuthorizationHeaders(accessToken),
  });

  return response.data;
}

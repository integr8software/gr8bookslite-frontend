import type {
  AuthActionState,
  AuthFieldErrors,
} from "@/app/src/data/auth/AuthTypes";

export function GetFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function InvalidState(errors: AuthFieldErrors): AuthActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    errors,
  };
}

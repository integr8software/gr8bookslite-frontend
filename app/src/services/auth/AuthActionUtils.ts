import { AuthActionStatuses, type AuthActionState, type AuthFieldErrors, type AuthFormValues } from "@/app/src/types/auth/AuthTypes";

export function GetFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function InvalidState(errors: AuthFieldErrors, formValues?: AuthFormValues): AuthActionState {
  return {
    status: AuthActionStatuses.Error,
    message: "Please fix the highlighted fields.",
    errors,
    formValues,
  };
}

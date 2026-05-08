import type {
  AuthActionState,
  AuthFieldErrors,
  AuthFormValues,
} from "@/app/src/data/auth/AuthTypes";

export function GetFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function InvalidState(
  errors: AuthFieldErrors,
  formValues?: AuthFormValues,
): AuthActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    errors,
    formValues,
  };
}

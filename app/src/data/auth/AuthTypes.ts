export type AuthFieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword" | "name" | "contactNumber" | "termsAccepted" | "otp" | "newEmail", string[] | undefined>
>;

export type AuthFormValues = {
  name?: string;
  email?: string;
  contactNumber?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: boolean;
  rememberMe?: boolean;
};

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  code?: string;
  errors?: AuthFieldErrors;
  formValues?: AuthFormValues;
  redirectTo?: string;
  pendingVerificationEmail?: string;
  resetToken?: string;
  accessToken?: string;
  rememberMe?: boolean;
};

export const AuthActionStatuses = {
  Idle: "idle",
  Error: "error",
  Success: "success",
} as const;

export const InitialAuthActionState: AuthActionState = {
  status: AuthActionStatuses.Idle,
  message: "",
};

export type AuthFieldErrors = Partial<
  Record<
    | "email"
    | "password"
    | "confirmPassword"
    | "name"
    | "contactNumber"
    | "termsAccepted"
    | "otp"
    | "newEmail",
    string[] | undefined
  >
>;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: AuthFieldErrors;
  redirectTo?: string;
  pendingVerificationEmail?: string;
  accessToken?: string;
};

export const InitialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

export type AuthFieldErrors = Partial<
  Record<
    "email" | "password" | "confirmPassword" | "name" | "contactNumber" | "otp",
    string[] | undefined
  >
>;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: AuthFieldErrors;
  redirectTo?: string;
};

export const InitialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

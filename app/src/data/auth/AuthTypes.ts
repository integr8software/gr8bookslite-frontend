export type AuthFieldErrors = Partial<
  Record<
    "email" | "password" | "confirmPassword" | "name" | "otp",
    string[] | undefined
  >
>;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: AuthFieldErrors;
};

export const InitialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};

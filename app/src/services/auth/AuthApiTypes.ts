export type RegisterRequest = {
  fullName: string;
  email: string;
  contactNumber?: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  message: string;
  verificationRequired: boolean;
  nextStep: string;
  email: string;
  maskedEmail: string;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  accessToken?: string;
};

export type VerifyEmailResponse = {
  message?: string;
  accessToken: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  message: string;
  maskedEmail: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  maskedEmail?: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type ChangeVerificationEmailRequest = {
  currentEmail: string;
  newEmail: string;
};

export type ChangeVerificationEmailResponse = {
  message: string;
  maskedEmail: string;
};

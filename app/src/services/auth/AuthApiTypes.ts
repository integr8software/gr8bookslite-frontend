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

export type AuthProfileResponse = {
  user: {
    id: number;
    email: string;
    name: string;
    contactNumber: string | null;
    avatarFileName: string | null;
    avatarMimeType: string | null;
    avatarStoragePath: string | null;
    avatarPublicUrl: string | null;
    systemRole: "SUPER_ADMIN" | "STANDARD";
    status: string;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  activeCompanyId: number | null;
  activeAccess: {
    membershipRole: "ADMIN" | "USER" | null;
    companyRoleId?: number | null;
    companyRoleCode?: string | null;
  } | null;
  onboarding: {
    requiresCompanySetup: boolean;
  };
  companies?: {
    companyId: number;
    companyName: string;
    role: "ADMIN" | "USER";
    membershipStatus: string;
    companyRoleId?: number | null;
    companyRoleCode?: string | null;
  }[];
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

export type VerifyForgotPasswordCodeRequest = {
  email: string;
  code: string;
};

export type VerifyForgotPasswordCodeResponse = {
  message: string;
  resetToken: string;
};

export type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type RequestPasswordChangeOtpResponse = {
  message: string;
  maskedEmail: string;
};

export type VerifyPasswordChangeOtpRequest = {
  code: string;
};

export type VerifyPasswordChangeOtpResponse = {
  message: string;
  resetToken: string;
};

export type ChangeAuthenticatedPasswordRequest = {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ChangeAuthenticatedPasswordResponse = {
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

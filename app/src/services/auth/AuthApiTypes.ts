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
  rememberMe?: boolean;
};

export type LoginResponse = {
  message?: string;
  accessToken?: string;
};

export type VerifyEmailResponse = {
  message?: string;
  accessToken: string;
};

export type AuthSystemRole = "SUPER_ADMIN" | "STANDARD";

export type AuthMembershipRole = "ADMIN" | "USER" | null;

export type AuthProfileAccess = {
  id?: number;
  companyId?: number | null;
  role?: "ADMIN" | "USER" | null;
  systemRole?: AuthSystemRole;
  membershipRole: AuthMembershipRole;
  membershipStatus?: string;
  companyRoleId?: number | null;
  companyRoleCode?: string | null;
  accessScope?: string;
  enabledModules?: string[];
  permissions?: unknown[];
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
    systemRole: AuthSystemRole;
    status: string;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  companyId?: number | null;
  role?: "ADMIN" | "USER" | null;
  activeCompanyId: number | null;
  activeAccess: AuthProfileAccess | null;
  access?: AuthProfileAccess | null;
  onboarding: {
    emailVerified?: boolean;
    hasCompany?: boolean;
    hasActiveCompany?: boolean;
    hasActiveCompanyContext?: boolean;
    requiresCompanySetup: boolean;
    canManageCompany?: boolean;
    nextStep?: string;
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

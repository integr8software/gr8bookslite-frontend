export type RegistrationInput = {
  fullName: string;
  email: string;
  contactNumber?: string;
  password: string;
  confirmPassword: string;
};

export type RegistrationResult = {
  message: string;
  verificationRequired: boolean;
  nextStep: string;
  email: string;
  maskedEmail: string;
};

export type EmailVerificationInput = {
  email: string;
  code: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResult = {
  message?: string;
  accessToken?: string;
  user?: AuthProfile["user"];
  companyId?: number | null;
  role?: AuthEffectiveRole;
  access?: AuthProfileAccess | null;
  onboarding?: AuthProfile["onboarding"];
  companies?: AuthProfile["companies"];
};

export type EmailVerificationResult = {
  message?: string;
  accessToken: string;
};

export const AuthSystemRoleCodes = {
  SuperAdmin: "SUPER_ADMIN",
  Standard: "STANDARD",
} as const;

export const AuthMembershipRoleCodes = {
  Admin: "ADMIN",
  User: "USER",
} as const;

export const AuthEffectiveRoleCodes = {
  SuperAdmin: AuthSystemRoleCodes.SuperAdmin,
  Admin: AuthMembershipRoleCodes.Admin,
  User: AuthMembershipRoleCodes.User,
} as const;

export type AuthSystemRole = (typeof AuthSystemRoleCodes)[keyof typeof AuthSystemRoleCodes];

export type AuthMembershipRole = (typeof AuthMembershipRoleCodes)[keyof typeof AuthMembershipRoleCodes] | null;

export type AuthCompanyMembershipRole = NonNullable<AuthMembershipRole>;

export type AuthEffectiveRole = (typeof AuthEffectiveRoleCodes)[keyof typeof AuthEffectiveRoleCodes];

export type AuthUserModuleItem = {
  id: number;
  key: string;
  label: string;
  itemType: "SECTION" | "CONTAINER" | "LINK";
  iconName?: string | null;
  sortOrder?: number;
  moduleId?: number | null;
  moduleCode?: string | null;
  legacyRoute?: string | null;
  href?: string | null;
  route?: string | null;
  permissionCode?: string | null;
  requiredActions?: string[];
  category?: unknown;
  children: AuthUserModuleItem[];
};

export type AuthProfileAccess = {
  id?: number;
  companyId?: number | null;
  role?: AuthMembershipRole;
  systemRole?: AuthSystemRole;
  membershipRole: AuthMembershipRole;
  membershipStatus?: string;
  companyRoleId?: number | null;
  companyRoleCode?: string | null;
  companyRoleName?: string | null;
  accessScope?: string;
  enabledModules?: string[];
  permissions?: unknown[];
  userModules?: {
    items: AuthUserModuleItem[];
    byBranch?: Array<{
      branchUnitId: number;
      companyRoleId?: number | null;
      companyRoleCode?: string | null;
      companyRoleName?: string | null;
      items: AuthUserModuleItem[];
    }>;
  };
};

export type AuthProfile = {
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
    updatedAt: string | null;
  };
  companyId?: number | null;
  role?: AuthMembershipRole;
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
    companyStatus?: string;
    isCompanyActive?: boolean;
    countryCode?: string;
    baseCurrencyCode?: string;
    logoPublicUrl: string | null;
    role: AuthCompanyMembershipRole;
    membershipStatus: string;
    accessScope?: string | null;
    companyRoleId?: number | null;
    companyRoleCode?: string | null;
    accessibleUnitIds?: number[];
    units?: {
      id: number;
      code: string;
      name: string;
      type: string;
      isActive: boolean;
      isMain: boolean;
    }[];
  }[];
};

export type CompanyContextSelection = {
  companyId: number;
};

export type CompanyContextSwitchResult = {
  accessToken: string;
  user: AuthProfile["user"];
  companyId: number | null;
  role: AuthEffectiveRole;
  access: AuthProfileAccess | null;
  onboarding: AuthProfile["onboarding"];
  companies: NonNullable<AuthProfile["companies"]>;
};

export type VerificationResendInput = {
  email: string;
};

export type VerificationResendResult = {
  message: string;
  maskedEmail: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ForgotPasswordResult = {
  code?: string;
  message: string;
  maskedEmail?: string;
};

export type ForgotPasswordCodeVerificationInput = {
  email: string;
  code: string;
};

export type ForgotPasswordCodeVerificationResult = {
  message: string;
  resetToken: string;
};

export type PasswordResetInput = {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type PasswordResetResult = {
  message: string;
};

export type WorkspaceInvitationActivationInput = {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type WorkspaceInvitationActivationResult = {
  message: string;
};

export type PasswordChangeOtpResult = {
  message: string;
  maskedEmail: string;
};

export type PasswordChangeOtpVerificationInput = {
  code: string;
};

export type PasswordChangeOtpVerificationResult = {
  message: string;
  resetToken: string;
};

export type AuthenticatedPasswordChangeInput = {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type AuthenticatedPasswordChangeResult = {
  message: string;
};

export type VerificationEmailChangeInput = {
  currentEmail: string;
  newEmail: string;
};

export type VerificationEmailChangeResult = {
  message: string;
  maskedEmail: string;
};

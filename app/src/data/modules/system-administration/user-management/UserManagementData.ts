export type UserStatus = "Active" | "Inactive" | "Pending";

export type UserManagementRecord = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  userTypeId: string;
  userGroupId: string;
  status: UserStatus;
  lastLogin?: string;
  profileImageUrl?: string;
};

export type UserTypeRecord = {
  id: string;
  name: string;
  description: string;
  accessRoles: string[];
  status: UserStatus;
};

export type UserGroupRecord = {
  id: string;
  name: string;
  description: string;
  status: UserStatus;
};

export type UserFormValues = Omit<UserManagementRecord, "id">;

export type UserTypeFormValues = Omit<UserTypeRecord, "id">;

export type UserGroupFormValues = Omit<UserGroupRecord, "id">;

export const UserPermissionActions = [
  { value: "read", label: "Read" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
] as const;

export const UserAccessRoleOptions = [
  {
    value: "dashboard",
    label: "Dashboard",
    children: [{ value: "dashboard-overview", label: "Dashboard Overview" }],
  },
  {
    value: "sales-management",
    label: "Sales Management",
    children: [
      { value: "sales-management-debit-memo", label: "Debit Memo" },
      { value: "sales-management-credit-memo", label: "Credit Memo" },
      { value: "sales-management-sales-quotation", label: "Sales Quotation" },
      { value: "sales-management-sales-order", label: "Sales Order" },
      { value: "sales-management-sales-invoice", label: "Sales Invoice" },
      { value: "sales-management-billing", label: "Billing" },
      { value: "sales-management-billing-statement", label: "Billing Statement" },
      { value: "sales-management-billing-invoice", label: "Billing Invoice" },
      { value: "sales-management-service-invoice", label: "Service Invoice" },
      { value: "sales-management-cash-sales-invoice", label: "Cash Sales Invoice" },
      { value: "sales-management-sales-journal", label: "Sales Journal" },
      { value: "sales-management-statement-of-account", label: "Statement of Account" },
    ],
  },
  {
    value: "cash-receipt",
    label: "Cash Receipt",
    children: [
      { value: "cash-receipt-official-receipt", label: "Official Receipt" },
      { value: "cash-receipt-collection-receipt", label: "Collection Receipt" },
      { value: "cash-receipt-acknowledgement-receipt", label: "Acknowledgement Receipt" },
      { value: "cash-receipt-provisional-receipt", label: "Provisional Receipt" },
      { value: "cash-receipt-bank-reconciliation", label: "Bank Reconciliation" },
      {
        value: "cash-receipt-product-distribution-center-warehouse",
        label: "Product Distribution Center Warehouse",
      },
    ],
  },
  {
    value: "cash-disbursement",
    label: "Cash Disbursement",
    children: [
      { value: "cash-disbursement-disbursement-voucher", label: "Disbursement Voucher" },
      { value: "cash-disbursement-cash-advance", label: "Cash Advance" },
      {
        value: "cash-disbursement-cash-advance-multiple-entry",
        label: "Cash Advance Multiple Entry",
      },
      { value: "cash-disbursement-petty-cash-disbursement", label: "Petty Cash Disbursement" },
      { value: "cash-disbursement-petty-cash-fund", label: "Petty Cash Fund" },
      { value: "cash-disbursement-petty-cash-replenishment", label: "Petty Cash Replenishment" },
      { value: "cash-disbursement-petty-cash-advance", label: "Petty Cash Advance" },
      { value: "cash-disbursement-request-for-payment", label: "Request For Payment" },
      { value: "cash-disbursement-advances-to-supplier", label: "Advances To Supplier" },
    ],
  },
  {
    value: "accounts-payable",
    label: "Accounts Payable",
    children: [
      {
        value: "accounts-payable-accounts-payable-voucher",
        label: "Accounts Payable Voucher",
      },
    ],
  },
  {
    value: "inventory-management",
    label: "Inventory Management",
    children: [
      { value: "inventory-management-receiving-report", label: "Receiving Report" },
      { value: "inventory-management-goods-receipt", label: "Goods Receipt" },
      { value: "inventory-management-inventory-account", label: "Inventory Account" },
      { value: "inventory-management-material-request", label: "Material Request" },
      { value: "inventory-management-pick-list", label: "Pick List" },
      { value: "inventory-management-goods-issue", label: "Goods Issue" },
      { value: "inventory-management-delivery-receipt", label: "Delivery Receipt" },
    ],
  },
  {
    value: "financial-management",
    label: "Financial Management",
    children: [
      { value: "financial-management-charts-of-accounts", label: "Charts of Accounts" },
      { value: "financial-management-multi-currency-setup", label: "Multi Currency Setup" },
      { value: "financial-management-discount-management", label: "Discount Management" },
      { value: "financial-management-term-management", label: "Term Management" },
      { value: "financial-management-transaction-type", label: "Transaction Type" },
    ],
  },
  {
    value: "system-administration",
    label: "System Administration",
    children: [
      { value: "system-administration-user-list", label: "User List" },
      { value: "system-administration-user-type", label: "User Types" },
      { value: "system-administration-user-group", label: "User Groups" },
      { value: "system-administration-branch-management", label: "Branch Management" },
      { value: "system-administration-approval-management", label: "Approval Management" },
      { value: "system-administration-audit-trail", label: "Audit Trail" },
      { value: "system-administration-mail-maintenance", label: "Mail Maintenance" },
      {
        value: "system-administration-transaction-number-setup",
        label: "Transaction Number Setup",
      },
    ],
  },
  {
    value: "reports",
    label: "Reports",
    children: [
      { value: "reports-financial", label: "Financial Reports" },
      { value: "reports-inventory", label: "Inventory Reports" },
      { value: "reports-bir", label: "BIR Reports" },
      { value: "reports-maintenance", label: "Maintenance Reports" },
    ],
  },
] as const;

export const InitialUserFormValues: UserFormValues = {
  name: "",
  email: "",
  contactNumber: "",
  userTypeId: "user-type-admin",
  userGroupId: "user-group-operations",
  status: "Active",
};

export const InitialUserTypeFormValues: UserTypeFormValues = {
  name: "",
  description: "",
  accessRoles: ["dashboard-overview.read"],
  status: "Active",
};

export const InitialUserGroupFormValues: UserGroupFormValues = {
  name: "",
  description: "",
  status: "Active",
};

export const InitialUsers: UserManagementRecord[] = [
  {
    id: "user-list-001",
    name: "John Dela Cruz",
    email: "john.delacruz@gr8books.test",
    contactNumber: "+63 916 460 4120",
    userTypeId: "user-type-admin",
    userGroupId: "user-group-operations",
    status: "Active",
    lastLogin: "May 15, 2026 08:45 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-002",
    name: "Jane Santos",
    email: "jane.santos@gr8books.test",
    contactNumber: "+63 917 120 3301",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-finance",
    status: "Active",
    lastLogin: "May 14, 2026 10:20 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-003",
    name: "Michael Reyes",
    email: "michael.reyes@gr8books.test",
    contactNumber: "+63 919 443 7902",
    userTypeId: "user-type-admin",
    userGroupId: "user-group-it",
    status: "Active",
    lastLogin: "May 15, 2026 10:15 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-004",
    name: "Emily Lim",
    email: "emily.lim@gr8books.test",
    contactNumber: "+63 920 115 8364",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-hr",
    status: "Inactive",
    lastLogin: "May 12, 2026 02:30 PM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-005",
    name: "Daniel Wilson",
    email: "daniel.wilson@gr8books.test",
    contactNumber: "+63 917 884 1209",
    userTypeId: "user-type-manager",
    userGroupId: "user-group-operations",
    status: "Pending",
    lastLogin: "May 15, 2026 09:00 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-006",
    name: "Sarah Davis",
    email: "sarah.davis@gr8books.test",
    contactNumber: "+63 921 771 3004",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-marketing",
    status: "Pending",
    lastLogin: "May 13, 2026 11:00 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-007",
    name: "David Martinez",
    email: "david.martinez@gr8books.test",
    contactNumber: "+63 922 556 4421",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-finance",
    status: "Inactive",
    lastLogin: "May 8, 2026 09:15 AM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-008",
    name: "Laura Taylor",
    email: "laura.taylor@gr8books.test",
    contactNumber: "+63 923 661 2105",
    userTypeId: "user-type-manager",
    userGroupId: "user-group-it",
    status: "Active",
    lastLogin: "May 14, 2026 03:40 PM",
    profileImageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80",
  },
  {
    id: "user-list-009",
    name: "Carlo Mendoza",
    email: "carlo.mendoza@gr8books.test",
    contactNumber: "+63 924 716 8830",
    userTypeId: "user-type-auditor",
    userGroupId: "user-group-compliance",
    status: "Active",
    lastLogin: "May 15, 2026 06:50 AM",
  },
  {
    id: "user-list-010",
    name: "Alyssa Tan",
    email: "alyssa.tan@gr8books.test",
    contactNumber: "+63 925 613 4208",
    userTypeId: "user-type-encoder",
    userGroupId: "user-group-purchasing",
    status: "Pending",
    lastLogin: "May 15, 2026 07:10 AM",
  },
];

export const InitialUserTypes: UserTypeRecord[] = [
  {
    id: "user-type-admin",
    name: "Admin",
    description: "Can maintain core operations and administration records.",
    accessRoles: [
      "dashboard-overview.read",
      "dashboard-overview.create",
      "dashboard-overview.update",
      "sales-management-sales-order.read",
      "sales-management-sales-order.create",
      "sales-management-sales-order.update",
      "sales-management-sales-order.delete",
      "sales-management-sales-invoice.read",
      "sales-management-sales-invoice.create",
      "sales-management-sales-invoice.update",
      "sales-management-sales-invoice.delete",
      "system-administration-user-list.read",
      "system-administration-user-list.create",
      "system-administration-user-list.update",
      "system-administration-user-list.delete",
      "system-administration-user-type.read",
      "system-administration-user-type.create",
      "system-administration-user-type.update",
      "system-administration-user-type.delete",
      "system-administration-user-group.read",
      "system-administration-user-group.create",
      "system-administration-user-group.update",
      "system-administration-user-group.delete",
    ],
    status: "Active",
  },
  {
    id: "user-type-encoder",
    name: "Staff",
    description: "Can encode daily transactions and review assigned reports.",
    accessRoles: [
      "dashboard-overview.read",
      "sales-management-sales-order.read",
      "sales-management-sales-invoice.read",
      "reports-financial.read",
    ],
    status: "Active",
  },
  {
    id: "user-type-manager",
    name: "Manager",
    description: "Can approve and maintain team transactions.",
    accessRoles: [
      "dashboard-overview.read",
      "sales-management-sales-order.read",
      "sales-management-sales-order.create",
      "sales-management-sales-order.update",
      "sales-management-sales-invoice.read",
      "sales-management-sales-invoice.create",
      "sales-management-sales-invoice.update",
      "financial-management-charts-of-accounts.read",
      "financial-management-charts-of-accounts.update",
    ],
    status: "Active",
  },
  {
    id: "user-type-auditor",
    name: "Auditor",
    description: "Can review system records and reports.",
    accessRoles: [
      "dashboard-overview.read",
      "reports-financial.read",
      "reports-inventory.read",
      "system-administration-audit-trail.read",
    ],
    status: "Active",
  },
];

export const InitialUserGroups: UserGroupRecord[] = [
  {
    id: "user-group-operations",
    name: "Operations",
    description: "Operations team for company management workflows.",
    status: "Active",
  },
  {
    id: "user-group-finance",
    name: "Finance",
    description: "Finance team for accounting and reporting workflows.",
    status: "Active",
  },
  {
    id: "user-group-it",
    name: "IT",
    description: "Information technology administration workflows.",
    status: "Active",
  },
  {
    id: "user-group-hr",
    name: "HR",
    description: "Human resources user administration workflows.",
    status: "Active",
  },
  {
    id: "user-group-marketing",
    name: "Marketing",
    description: "Marketing and customer activity workflows.",
    status: "Active",
  },
  {
    id: "user-group-compliance",
    name: "Compliance",
    description: "Audit and compliance review workflows.",
    status: "Active",
  },
  {
    id: "user-group-purchasing",
    name: "Purchasing",
    description: "Purchasing and payable transaction workflows.",
    status: "Active",
  },
];

export function createUserRecord(values: UserFormValues): UserManagementRecord {
  return {
    id: `user-list-${Date.now()}`,
    ...trimUserValues(values),
  };
}

export function updateUserRecord(
  user: UserManagementRecord,
  values: UserFormValues,
): UserManagementRecord {
  return {
    ...user,
    ...trimUserValues(values),
  };
}

export function createUserTypeRecord(
  values: UserTypeFormValues,
): UserTypeRecord {
  return {
    id: `user-type-${Date.now()}`,
    ...trimAccessRecordValues(values),
  };
}

export function updateUserTypeRecord(
  userType: UserTypeRecord,
  values: UserTypeFormValues,
): UserTypeRecord {
  return {
    ...userType,
    ...trimAccessRecordValues(values),
  };
}

export function createUserGroupRecord(
  values: UserGroupFormValues,
): UserGroupRecord {
  return {
    id: `user-group-${Date.now()}`,
    ...trimAccessRecordValues(values),
  };
}

export function updateUserGroupRecord(
  userGroup: UserGroupRecord,
  values: UserGroupFormValues,
): UserGroupRecord {
  return {
    ...userGroup,
    ...trimAccessRecordValues(values),
  };
}

function trimUserValues(values: UserFormValues): UserFormValues {
  return {
    ...values,
    name: values.name.trim(),
    email: values.email.trim(),
    contactNumber: values.contactNumber.trim(),
  };
}

function trimAccessRecordValues<
  TValues extends UserTypeFormValues | UserGroupFormValues,
>(values: TValues): TValues {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description.trim(),
  };
}

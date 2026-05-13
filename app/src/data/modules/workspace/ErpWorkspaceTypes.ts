export type ErpNavItem = {
  key: string;
  label: string;
  href: string;
  children?: ErpNavItem[];
};

export type ErpNavSection = {
  key: string;
  label: string;
  href?: string;
  children?: ErpNavItem[];
  bottom?: boolean;
};

export type ErpCompany = {
  id: string;
  slug: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  branchCount: number;
  userCount: number;
  activeModules: number;
  satelliteOffices: number;
  revenueThisMonth: string;
  expensesThisMonth: string;
  netProfit: string;
  trend: number[];
};

export type ErpBranch = {
  id: string;
  code: string;
  name: string;
  descriptor: string;
  address: string;
  phone: string;
  isCurrent?: boolean;
};

export type ErpNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "red" | "blue" | "amber";
};

export type ErpReceiptStatus = "Deposited" | "Pending Deposit" | "Voided";

export type ErpAppliedInvoice = {
  invoiceNo: string;
  invoiceDate: string;
  amountApplied: string;
};

export type ErpAttachment = {
  name: string;
  size: string;
};

export type ErpReceipt = {
  id: string;
  receiptNo: string;
  customer: string;
  branchId: string;
  receiptDate: string;
  paymentMethod: string;
  amount: string;
  status: ErpReceiptStatus;
  referenceNo: string;
  depositSlipNo: string;
  depositDate: string;
  bankAccount: string;
  appliedInvoices: ErpAppliedInvoice[];
  attachments: ErpAttachment[];
  activity: string[];
};

export type ErpUserRecord = {
  id: string;
  initials: string;
  name: string;
  email: string;
  company: string;
  branch: string;
  role: string;
  status: "Active" | "Inactive";
  lastActive: string;
};

export type ErpPermissionRow = {
  label: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
};

export type ErpPermissionGroup = {
  title: string;
  rows: ErpPermissionRow[];
};

export type ErpAuditLog = {
  id: string;
  actor: string;
  action: string;
  module: string;
  company: string;
  branch: string;
  timestamp: string;
  detail: string;
};

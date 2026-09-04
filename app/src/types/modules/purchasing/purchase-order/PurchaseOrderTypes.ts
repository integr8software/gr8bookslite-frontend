import type { PurchasingAccountingEntry } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export type PurchaseOrderFieldUpdater<TValues> = <Key extends keyof TValues>(key: Key, value: TValues[Key]) => void;

export type PurchaseOrderStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type PurchaseOrderCopySource = "Purchase Request" | "Canvass" | "";

export type PurchaseOrderItem = {
  id: string;
  purchaseRequestEntryId?: string;
  responsibilityCenterId?: string;
  serviceMaintenanceId?: string;
  itemId?: string;
  itemCode: string;
  barcode: string;
  itemName: string;
  lotNo: string;
  itemCategory: string;
  color: string;
  brand: string;
  size: string;
  model: string;
  quantity: number;
  uom: string;
  expiryDate: string;
  freightCost: number;
  rateDelivery: number;
  cost: number;
  vatAmount: number;
  ewt: string;
  discountAmount: number;
  discountRate: number;
  vatable: string;
  vatInclusive: string;
  vatType: string;
  responsibilityCenter: string;
  budgetCode: string;
  prQuantity: number;
  linePrNo: string;
  canvassNo: string;
};

export type PurchaseOrderRecord = {
  id: string;
  vceCode: string;
  vceName: string;
  purchaseType: string;
  transNo: string;
  documentDate: string;
  prNo: string;
  purchaseRequestId?: string;
  copyFromSource?: PurchaseOrderCopySource;
  status: PurchaseOrderStatus;
  currency: string;
  exchangeRate: number;
  address: string;
  contactNo: string;
  emailAddress: string;
  deliveryDate: string;
  termsOfPayment: string;
  remarks: string;
  discountAmount: number;
  vatAmount: number;
  projectCode: string;
  projectName: string;
  importationNo: string;
  partialPayment: boolean;
  accountingEntries: PurchaseOrderAccountingEntry[];
  items: PurchaseOrderItem[];
};

export type PurchaseOrderFormValues = Omit<PurchaseOrderRecord, "id">;
export type PurchaseOrderAccountingEntry = PurchasingAccountingEntry;

export type PurchaseOrderFormMode = "add" | "edit" | "view";

export type PurchaseOrderFormErrors = Partial<Record<keyof Omit<PurchaseOrderFormValues, "items"> | "items", string>>;

export type PurchaseOrderFormHeaderProps = {
  copyFromRecords: AppCopyFromRecord[];
  isSubmitting?: boolean;
  mode: PurchaseOrderFormMode;
  recordId?: string;
  values: PurchaseOrderFormValues;
  onCopyFromSource: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
};

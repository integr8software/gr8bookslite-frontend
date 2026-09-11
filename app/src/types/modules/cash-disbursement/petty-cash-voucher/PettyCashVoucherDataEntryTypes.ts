import type { ReactNode } from "react";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  PettyCashVoucherActionPageState,
  PettyCashVoucherFormErrors,
  PettyCashVoucherItem,
  PettyCashVoucherAccountingEntry,
  PettyCashVoucherItemUpdater,
  PettyCashVoucherOpenDisbursementTypeDrawerHandler,
  PettyCashVoucherOpenResponsibilityCenterDrawerHandler,
  PettyCashVoucherOpenSupplierDrawerHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

export type PettyCashVoucherEntryView = "items" | "accounting";

export type FundDetailsEntryColumnId =
  | "disbursementType"
  | "particulars"
  | "amount"
  | "supplierName"
  | "supplierCode"
  | "vatType"
  | "vatPercent"
  | "netAmount"
  | "vatAmount"
  | "date"
  | "ewtCode"
  | "ewtPercent"
  | "ewtAmount"
  | "disburseAmount"
  | "responsibilityCenterCode"
  | "responsibilityCenterName"
  | "orNo"
  | "tinNo"
  | "grossAmount";

export type PettyCashVoucherAccountingColumnId =
  | "accountCode"
  | "accountTitle"
  | "debit"
  | "credit"
  | "partyCode"
  | "partyName"
  | "particulars";

export type PettyCashVoucherDetailEntryTableProps = {
  disbursementTypeOptions: AppAdvancedDropdownOption[];
  ewtOptions: AppAdvancedDropdownOption[];
  errors: PettyCashVoucherFormErrors;
  isReadonly: boolean;
  items: PettyCashVoucherItem[];
  onAddItems: (count: number) => void;
  onClearItems: () => void;
  onDuplicateItem: (rowId: string) => void;
  onInsertItem: (rowId: string, position: "above" | "below") => void;
  onMoveItem: (fromRowId: string, toRowId: string) => void;
  onRemoveItem: (rowId: string) => void;
  onUpdateItems: (items: PettyCashVoucherItem[]) => void;
  onUpdateItem: PettyCashVoucherItemUpdater;
  onOpenDisbursementTypeDrawer?: PettyCashVoucherOpenDisbursementTypeDrawerHandler;
  onOpenResponsibilityCenterDrawer?: PettyCashVoucherOpenResponsibilityCenterDrawerHandler;
  onOpenSupplierDrawer?: PettyCashVoucherOpenSupplierDrawerHandler;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  supplierOptions: AppAdvancedDropdownOption[];
  totals: PettyCashVoucherActionPageState["totals"];
  taxCodes: AlphanumericTaxCode[];
  title: ReactNode;
  vatOptions: AppAdvancedDropdownOption[];
};

export type PettyCashVoucherAccountingEntryTableProps = {
  rows: PettyCashVoucherAccountingEntry[];
  title: ReactNode;
  totalCredit: number;
  totalDebit: number;
  variance: number;
};

"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useModuleFieldManagement } from "@/app/src/hooks/shared/field-management/useModuleFieldManagement";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";

type ModuleFieldRequiredMarkProps = {
  className?: string;
  fallbackRequired?: boolean;
  label: string;
  leadingSpace?: boolean;
};

export function ModuleFieldRequiredMark({
  className = "ml-1 text-coralpink",
  fallbackRequired = false,
  label,
  leadingSpace = false,
}: ModuleFieldRequiredMarkProps) {
  const pathname = usePathname();
  const moduleCode = useMemo(() => getModuleCodeFromPathname(pathname), [pathname]);
  const { isFieldRequired } = useModuleFieldManagement(moduleCode);
  const isRequired = moduleCode ? isFieldRequired(label, fallbackRequired) : fallbackRequired;

  if (!isRequired) return null;

  return <span className={joinClasses(className)}>{leadingSpace ? " " : null}*</span>;
}

export function getModuleCodeFromPathname(pathname: string | null) {
  const normalizedPathname = `/${(pathname ?? "").replace(/^\/+|\/+$/g, "")}`;
  const matchedRoute = ModuleFieldRouteCodes.find(
    ({ route }) => normalizedPathname === route || normalizedPathname.startsWith(`${route}/`),
  );

  return matchedRoute?.moduleCode ?? "";
}

const ModuleFieldRouteCodes = [
  { route: "/accounts-payable/accounts-payable-voucher", moduleCode: "APV" },
  { route: "/cash-disbursement/advances-to-suppliers", moduleCode: "ATS" },
  { route: "/cash-disbursement/cash-advance-multiple-entry", moduleCode: "CAME" },
  { route: "/cash-disbursement/cash-advance", moduleCode: "CA" },
  { route: "/cash-disbursement/cash-voucher", moduleCode: "CV" },
  { route: "/cash-disbursement/disbursement-voucher", moduleCode: "DV" },
  { route: "/cash-disbursement/petty-cash-replenishment", moduleCode: "PCR" },
  { route: "/cash-disbursement/petty-cash-fund", moduleCode: "PCF" },
  { route: "/cash-disbursement/petty-cash-voucher", moduleCode: "PCV" },
  { route: "/cash-disbursement/recurring-transactions", moduleCode: "RT" },
  { route: "/cash-disbursement/revolving-fund-replenishment", moduleCode: "RFR" },
  { route: "/cash-disbursement/revolving-fund", moduleCode: "RF" },
  { route: "/cash-receipt/acknowledgement-receipt", moduleCode: "AR" },
  { route: "/cash-receipt/bank-reconciliation", moduleCode: "BR" },
  { route: "/cash-receipt/collection-receipt", moduleCode: "CR" },
  { route: "/cash-receipt/official-receipt", moduleCode: "OR" },
  { route: "/cash-receipt/provisional-receipt", moduleCode: "PVR" },
  { route: "/delivery-vehicle-management/delivery-vehicles", moduleCode: "DVE" },
  { route: "/delivery-vehicle-management/vehicle-repair-maintenance", moduleCode: "DVMR" },
  { route: "/delivery-vehicle-management/vehicle-types", moduleCode: "DVT" },
  { route: "/financial-maintenance/bank-masterfile", moduleCode: "BM" },
  { route: "/financial-maintenance/charts-of-accounts", moduleCode: "COA" },
  { route: "/financial-maintenance/default-account", moduleCode: "DA" },
  { route: "/financial-maintenance/discount-maintenance", moduleCode: "DSM" },
  { route: "/financial-maintenance/payment-type", moduleCode: "PT" },
  { route: "/financial-maintenance/responsibility-center", moduleCode: "RC" },
  { route: "/financial-maintenance/services-maintenance", moduleCode: "SM" },
  { route: "/financial-maintenance/terms-maintenance", moduleCode: "TM" },
  { route: "/general-journal/journal-voucher", moduleCode: "JV" },
  { route: "/inventory/delivery-receipt", moduleCode: "DR" },
  { route: "/inventory/goods-issue", moduleCode: "GI" },
  { route: "/inventory/goods-receipt", moduleCode: "GR" },
  { route: "/inventory/inventory-count", moduleCode: "INC" },
  { route: "/inventory/material-request", moduleCode: "MR" },
  { route: "/inventory/pick-list", moduleCode: "PL" },
  { route: "/inventory/receiving-report", moduleCode: "RR" },
  { route: "/item-management/inventory-transaction-type", moduleCode: "TT" },
  { route: "/item-management/item-bundles", moduleCode: "IB" },
  { route: "/item-management/item-category", moduleCode: "IC" },
  { route: "/item-management/item-price-lists", moduleCode: "PLS" },
  { route: "/item-management/item-promotions", moduleCode: "IPR" },
  { route: "/item-management/item-variations", moduleCode: "IV" },
  { route: "/item-management/items", moduleCode: "I" },
  { route: "/item-management/unit-of-measurement", moduleCode: "UOM" },
  { route: "/others/beginning-balance-uploader", moduleCode: "BBU" },
  { route: "/others/fixed-asset", moduleCode: "FA" },
  { route: "/party-management", moduleCode: "PM" },
  { route: "/purchasing/canvass-form", moduleCode: "CF" },
  { route: "/purchasing/purchase-journal", moduleCode: "PJ" },
  { route: "/purchasing/purchase-order", moduleCode: "PO" },
  { route: "/purchasing/purchase-request", moduleCode: "PR" },
  { route: "/sales/billing-invoice", moduleCode: "BI" },
  { route: "/sales/billing-statement", moduleCode: "BS" },
  { route: "/sales/billing", moduleCode: "B" },
  { route: "/sales/cash-sales-invoice", moduleCode: "CSI" },
  { route: "/sales/sales-invoice", moduleCode: "SI" },
  { route: "/sales/sales-journal", moduleCode: "SJ" },
  { route: "/sales/sales-quotation", moduleCode: "SQ" },
  { route: "/sales/service-invoice", moduleCode: "SVI" },
  { route: "/system-administration/approval-management", moduleCode: "AM" },
  { route: "/system-administration/audit-trail", moduleCode: "AT" },
  { route: "/system-administration/customized-reports", moduleCode: "CRPT" },
  { route: "/system-administration/form-signatory", moduleCode: "FS" },
  { route: "/system-administration/mail-maintenance", moduleCode: "MM" },
  { route: "/system-administration/multi-currency-setup", moduleCode: "MCS" },
  { route: "/system-administration/transaction-number-setup", moduleCode: "TNS" },
  { route: "/system-administration/user-management/user-role", moduleCode: "UR" },
  { route: "/system-administration/user-management/users", moduleCode: "U" },
  { route: "/warehouse-management/warehouse-access", moduleCode: "WA" },
  { route: "/warehouse-management/warehouse-inventory-stock", moduleCode: "WSI" },
  { route: "/warehouse-management/warehouse-storage", moduleCode: "WS" },
  { route: "/warehouse-management/warehouse-transfers", moduleCode: "WT" },
  { route: "/warehouse-management/warehouses", moduleCode: "WM" },
];

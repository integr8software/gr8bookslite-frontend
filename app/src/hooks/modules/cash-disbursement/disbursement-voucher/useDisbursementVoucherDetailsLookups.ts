"use client";

import { useMemo } from "react";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { createDisbursementVoucherPaymentTypeRecords } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type DisbursementVoucherLookupValues = {
  costCenter?: string;
  partyCode?: string;
  partyName?: string;
  projectCode?: string;
  projectName?: string;
};

export function useDisbursementVoucherDetailsLookups(values: DisbursementVoucherLookupValues = {}) {
  const partyQuery = usePartyLookup({ detail: "complete" });
  const responsibilityCenterQuery = useResponsibilityCenterLookup();
  const paymentTypeStore = usePaymentTypeStore();

  const partyOptions = useMemo<DisbursementVoucherPartyDropdownOption[]>(() => {
    const options: DisbursementVoucherPartyDropdownOption[] = (partyQuery.data ?? []).map((party) => ({
      defaultPurchaseInputVatTaxSourceKey: party.defaultPurchaseInputVatTaxSourceKey,
      defaultPurchaseEwtTaxSourceKey: party.defaultPurchaseEwtTaxSourceKey,
      defaultSalesOutputVatTaxSourceKey: party.defaultSalesOutputVatTaxSourceKey,
      defaultSalesCwtTaxSourceKey: party.defaultSalesCwtTaxSourceKey,
      description: party.description || (party.partyTypes ? party.partyTypes.join(", ") : ""),
      label: party.partyCode || party.label,
      name: party.partyName || party.name,
      selectedDetails: party.partyCode || party.label,
      value: party.partyCode || party.value,
    }));

    if (
      values.partyCode &&
      !options.some((opt) => opt.value === values.partyCode || opt.label === values.partyCode)
    ) {
      options.unshift({
        label: values.partyCode,
        name: values.partyName || values.partyCode,
        selectedDetails: values.partyCode,
        value: values.partyCode,
        description: values.partyName,
      });
    }

    return options;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const centers = responsibilityCenterQuery.data ?? [];
    const isProject = (rc: { typeName?: string; name?: string }) =>
      rc.typeName?.toLowerCase().includes("project") || rc.name?.toLowerCase().includes("project");

    const filtered = centers.filter((rc) => isProject(rc));
    const base = filtered.length > 0 ? filtered : centers;

    const options: AppAdvancedDropdownOption[] = base.map((rc) => ({
      label: rc.code,
      name: rc.name,
      value: rc.name,
      description: rc.code,
    }));

    const currentProject = values.projectName || values.projectCode || values.costCenter;
    if (
      currentProject &&
      !options.some((opt) => opt.value === currentProject || opt.name === currentProject || opt.label === currentProject)
    ) {
      options.unshift({
        label: values.projectCode || values.costCenter || currentProject,
        name: values.projectName || currentProject,
        value: values.projectName || currentProject,
        description: values.projectCode || values.costCenter,
      });
    }

    return options;
  }, [responsibilityCenterQuery.data, values.costCenter, values.projectCode, values.projectName]);

  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const centers = responsibilityCenterQuery.data ?? [];
    const isProject = (rc: { typeName?: string; name?: string }) =>
      rc.typeName?.toLowerCase().includes("project") || rc.name?.toLowerCase().includes("project");

    const options: AppAdvancedDropdownOption[] = centers
      .filter((rc) => !isProject(rc))
      .map((rc) => ({
        description: rc.code,
        label: rc.code,
        name: rc.name,
        value: rc.name,
      }));

    return options;
  }, [responsibilityCenterQuery.data]);

  const paymentTypeRecords = useMemo(
    () => createDisbursementVoucherPaymentTypeRecords(paymentTypeStore.paymentTypes),
    [paymentTypeStore.paymentTypes],
  );

  return {
    isPartyLookupLoading: partyQuery.isLoading,
    isResponsibilityCenterLookupLoading: responsibilityCenterQuery.isLoading,
    partyOptions,
    paymentTypeRecords,
    projectOptions,
    responsibilityCenterOptions,
  };
}

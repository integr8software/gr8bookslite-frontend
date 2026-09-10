"use client";

import { useMemo } from "react";
import { createProjectNameLookupOptions } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceLookupData";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import { useProjectMaintenanceLookup } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { createDisbursementVoucherPaymentTypeRecords } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPartyDropdownOption } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type DisbursementVoucherLookupValues = {
  costCenter?: string;
  partyCode?: string;
  partyName?: string;
  projectCode?: string;
  projectName?: string;
};

export function useDisbursementVoucherDetailsLookups(values: DisbursementVoucherLookupValues = {}) {
  const partyQuery = usePartyLookup();
  const rcQuery = useResponsibilityCenterLookup();
  const projectQuery = useProjectMaintenanceLookup();
  const paymentTypeStore = usePaymentTypeStore();

  const partyOptions = useMemo<DisbursementVoucherPartyDropdownOption[]>(() => {
    const list: DisbursementVoucherPartyDropdownOption[] = (partyQuery.data ?? []).map((party) => ({
      label: party.partyCode || party.label,
      name: party.partyName || party.name,
      value: party.partyCode || party.value,
      description: party.description,
      defaultPurchaseInputVatTaxSourceKey: party.defaultPurchaseInputVatTaxSourceKey,
      defaultPurchaseEwtTaxSourceKey: party.defaultPurchaseEwtTaxSourceKey,
      defaultSalesOutputVatTaxSourceKey: party.defaultSalesOutputVatTaxSourceKey,
      defaultSalesCwtTaxSourceKey: party.defaultSalesCwtTaxSourceKey,
    }));

    if (values.partyCode && !list.some((opt) => opt.value === values.partyCode)) {
      list.unshift({
        label: values.partyCode,
        name: values.partyName || values.partyCode,
        value: values.partyCode,
      });
    }

    return list;
  }, [partyQuery.data, values.partyCode, values.partyName]);

  const projectOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return createProjectNameLookupOptions({
      currentProjectCode: values.projectCode || values.costCenter,
      currentProjectName: values.projectName,
      options: projectQuery.data ?? [],
    });
  }, [projectQuery.data, values.costCenter, values.projectCode, values.projectName]);

  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return (rcQuery.data ?? [])
      .filter((rc) => !rc.typeName?.toLowerCase().includes("project") && !rc.name?.toLowerCase().includes("project"))
      .map((rc) => ({
        label: rc.code,
        name: rc.name,
        value: rc.name,
        description: rc.typeName || rc.classificationName || "",
        selectedDetails: rc.code,
      }));
  }, [rcQuery.data]);

  const paymentTypeRecords = useMemo(
    () => createDisbursementVoucherPaymentTypeRecords(paymentTypeStore.paymentTypes),
    [paymentTypeStore.paymentTypes],
  );

  return {
    isPartyLookupLoading: partyQuery.isLoading,
    isProjectLookupLoading: projectQuery.isLoading,
    isResponsibilityCenterLookupLoading: rcQuery.isLoading,
    partyOptions,
    paymentTypeRecords,
    projectOptions,
    responsibilityCenterOptions,
  };
}

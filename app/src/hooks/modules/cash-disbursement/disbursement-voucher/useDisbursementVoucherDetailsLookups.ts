"use client";

import { useMemo } from "react";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
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
    const centers = rcQuery.data ?? [];
    const projects = centers.filter(
      (rc) => rc.typeName?.toLowerCase().includes("project") || rc.name?.toLowerCase().includes("project"),
    );
    const source = projects.length > 0 ? projects : centers;

    const list: AppAdvancedDropdownOption[] = source.map((rc) => ({
      label: rc.code,
      name: rc.name,
      value: rc.name,
    }));

    const currentProject = values.projectName || values.projectCode || values.costCenter;
    if (currentProject && !list.some((opt) => opt.value === currentProject)) {
      list.unshift({
        label: values.projectCode || values.costCenter,
        name: values.projectName || currentProject,
        value: currentProject,
      });
    }

    return list;
  }, [rcQuery.data, values.costCenter, values.projectCode, values.projectName]);

  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return (rcQuery.data ?? [])
      .filter((rc) => !rc.typeName?.toLowerCase().includes("project") && !rc.name?.toLowerCase().includes("project"))
      .map((rc) => ({
        label: rc.code,
        name: rc.name,
        value: rc.name,
        description: rc.code,
      }));
  }, [rcQuery.data]);

  const paymentTypeRecords = useMemo(
    () => createDisbursementVoucherPaymentTypeRecords(paymentTypeStore.paymentTypes),
    [paymentTypeStore.paymentTypes],
  );

  return {
    isPartyLookupLoading: partyQuery.isLoading,
    isResponsibilityCenterLookupLoading: rcQuery.isLoading,
    partyOptions,
    paymentTypeRecords,
    projectOptions,
    responsibilityCenterOptions,
  };
}

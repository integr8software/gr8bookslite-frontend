import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { getPartyDefaultEwtCode, getPartyDefaultVatCode } from "@/app/src/data/shared/tax/PartyTaxDefaultsData";
import {
  createEwtOptions,
  createEwtOptionsFromDefaultAccounts,
  createVatOptions,
  createVatOptionsFromDefaultAccounts,
} from "@/app/src/data/shared/tax/TaxData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useVendorLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefaultAccountOptionGroups } from "@/app/src/hooks/shared/tax/useTaxOptions";
import { fetchDisbursementTypeOptions } from "@/app/src/services/modules/financial-maintenance/disbursement-type/DisbursementTypeApi";
import type { PettyCashVoucherItem } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { PartyLookupOption } from "@/app/src/types/modules/party-management/PartyLookupTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";

type UsePettyCashVoucherEntryLookupsOptions = {
  items: PettyCashVoucherItem[];
};

export function usePettyCashVoucherEntryLookups({ items }: UsePettyCashVoucherEntryLookupsOptions) {
  const partyRecords = usePartyManagementStore((state) => state.records);
  const vendorLookupQuery = useVendorLookup();
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxDefaultAccountOptionsQuery = useTaxDefaultAccountOptionGroups();
  const responsibilityCentersQuery = useResponsibilityCenterLookup();

  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const vatDefaultAccountOptions = useMemo(
    () =>
      createVatOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "input-purchases")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );

  const ewtDefaultAccountOptions = useMemo(
    () =>
      createEwtOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "purchase-ewt")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );

  const disbursementTypeQuery = useQuery({
    queryKey: ["disbursement-type", "disbursement", "options"],
    queryFn: () => fetchDisbursementTypeOptions("disbursement"),
    staleTime: 5 * 60 * 1000,
  });

  const disbursementTypeOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options: AppAdvancedDropdownOption[] = (disbursementTypeQuery.data ?? []).map((option) => {
      const description =
        option.description?.trim() && option.description.trim().toLowerCase() !== option.defaultAccountName.trim().toLowerCase()
          ? option.description.trim()
          : option.accountTitle?.trim() && option.accountTitle.trim().toLowerCase() !== option.defaultAccountName.trim().toLowerCase()
            ? option.accountTitle.trim()
            : "";

      return {
        label: option.accountCode || "",
        name: option.defaultAccountName,
        value: option.defaultAccountName,
        description,
      };
    });

    const existingValues = new Set(options.map((option) => option.value.toLowerCase()));
    const extraOptions: AppAdvancedDropdownOption[] = [];

    items.forEach((item) => {
      const value = item.disbursementType || item.expenseType || item.type;
      if (value && !existingValues.has(value.toLowerCase())) {
        existingValues.add(value.toLowerCase());
        extraOptions.push({ name: value, value });
      }
    });

    return [...options, ...extraOptions];
  }, [disbursementTypeQuery.data, items]);

  const supplierOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const options = new Map<string, AppAdvancedDropdownOption>();

    (vendorLookupQuery.data ?? []).forEach((option) => {
      const code = option.value || option.label;
      if (code) {
        options.set(code, createSupplierOptionFromLookup(option, code, taxCodes));
      }
    });

    partyRecords
      .filter((record) => record.partyTypes.includes("Vendor"))
      .forEach((record) => {
        if (!options.has(record.partyCodeNo)) {
          options.set(record.partyCodeNo, {
            defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
            defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
            ewtCode: getPartyDefaultEwtCode(record, taxCodes),
            label: record.partyCodeNo,
            name: getPartyDisplayName(record),
            vatCode: getPartyDefaultVatCode(record, taxCodes),
            value: record.partyCodeNo,
          });
        }
      });

    const existingCodes = new Set(options.keys());
    const existingNames = new Set(Array.from(options.values()).map((option) => option.name.toLowerCase()));
    const extraOptions: AppAdvancedDropdownOption[] = [];

    items.forEach((item) => {
      if (item.supplierName && !existingNames.has(item.supplierName.toLowerCase())) {
        const code = item.supplierCode || item.supplierName;
        if (!existingCodes.has(code)) {
          existingCodes.add(code);
          existingNames.add(item.supplierName.toLowerCase());
          extraOptions.push({
            label: item.supplierCode || code,
            name: item.supplierName,
            value: code,
          });
        }
      }
    });

    return [...Array.from(options.values()), ...extraOptions];
  }, [items, partyRecords, taxCodes, vendorLookupQuery.data]);

  return {
    disbursementTypeOptions,
    ewtDefaultAccountOptions,
    ewtOptions,
    responsibilityCenterOptions: responsibilityCentersQuery.data ?? [],
    supplierOptions,
    taxCodes,
    vatDefaultAccountOptions,
    vatOptions,
  };
}

function createSupplierOptionFromLookup(option: PartyLookupOption, code: string, taxCodes: AlphanumericTaxCode[]) {
  return {
    defaultPurchaseEwtTaxSourceKey: option.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseInputVatTaxSourceKey: option.defaultPurchaseInputVatTaxSourceKey,
    ewtCode: option.ewtCode || getPartyDefaultEwtCode(option, taxCodes),
    label: option.label || code,
    name: option.name || code,
    vatCode: option.vatCode || getPartyDefaultVatCode(option, taxCodes),
    value: code,
  };
}

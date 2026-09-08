import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";

import type {
  AccountsPayableVoucherLookupAccount,
  AccountsPayableVoucherLookupParty,
  AccountsPayableVoucherLookupResponsibilityCenter,
  AccountsPayableVoucherLookupTerm,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { TermsMaintenance } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { Tax } from "@/app/src/types/shared/tax/TaxTypes";
import { type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/data/shared/tax/TaxData";
import { isActiveStatus } from "@/app/src/utils/status.util";

export function findPayableAccount(value: string, accounts: AccountsPayableVoucherLookupAccount[]) {
  return accounts.find((account) => account.id === value || account.accountNumber === value || account.accountName === value);
}

export function getPartyPurchaseTaxDefaults(record: AccountsPayableVoucherLookupParty, taxCodes: Tax[]) {
  const inputVatCode = getTaxCodeBySourceKey(taxCodes, record.defaultPurchaseInputVatTaxSourceKey, "INPUT VAT");
  const ewtCode = getTaxCodeBySourceKey(taxCodes, record.defaultPurchaseEwtTaxSourceKey, "EWT");
  const inputVatRate = getVatRateFromCode(inputVatCode, taxCodes);

  return {
    ewtCode,
    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
    inputVatCode,
    inputVatPercent: getVatPercentFromRate(inputVatRate),
  };
}

export function getTaxCodeBySourceKey(taxCodes: Tax[], sourceKey: string, taxType: "EWT" | "INPUT VAT") {
  if (!sourceKey) {
    return "";
  }

  return (
    taxCodes.find((taxCode) => taxCode.sourceKey === sourceKey && taxCode.transactionType === "Purchases" && taxCode.taxType === taxType)
      ?.taxCode ?? ""
  );
}

export function shouldApplyPartyDefaultsToLineParty(linePartyCode: string, previousPartyCode: string, nextPartyCode: string) {
  return linePartyCode.trim() === "" || linePartyCode === previousPartyCode || linePartyCode === nextPartyCode;
}

export function formatPartyAddress(record: AccountsPayableVoucherLookupParty) {
  const address = getPrimaryPartyAddress(record);

  return [address.addressLine1, address.addressLine2, address.barangay, address.cityMunicipality, address.province, address.region]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function getPrimaryPartyAddress(record: AccountsPayableVoucherLookupParty) {
  return record.addresses.find((address) => address.isDefault) ?? record.addresses[0] ?? record.address;
}

export function mapPartyRecordToLookupParty(record: PartyInformationRecord): AccountsPayableVoucherLookupParty {
  return {
    id: record.id,
    address: record.address,
    addresses: record.addresses,
    classification: record.classification,
    contactNo: record.contactNo,
    contactPerson: record.contactPerson,
    defaultPayableAccount: record.defaultPayableAccount || record.employeePayableAccount,
    defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
    defaultPurchaseFwtTaxSourceKey: record.defaultPurchaseFwtTaxSourceKey,
    defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
    defaultPurchaseWvatTaxSourceKey: record.defaultPurchaseWvatTaxSourceKey,
    email: record.email,
    name: getPartyDisplayName(record),
    partyCodeNo: record.partyCodeNo,
    partyTypes: record.partyTypes,
    status: "Active",
    termId: record.termId,
    termName: record.termName,
  };
}

export function createPartyOptions(
  partyRecords: AccountsPayableVoucherLookupParty[],
  currentPartyCode: string,
  currentPartyName: string,
): AppAdvancedDropdownOption[] {
  const options = partyRecords
    .filter((party) => isActiveStatus(party.status))
    .map((party) => ({
      description: party.partyTypes.join(", "),
      label: party.partyCodeNo,
      name: party.name || party.partyCodeNo,
      value: party.partyCodeNo,
    }));

  if (currentPartyCode.trim() && !options.some((option) => option.value === currentPartyCode)) {
    options.push({
      description: "Current voucher value",
      label: currentPartyCode,
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode,
    });
  }

  return options;
}

export function createProjectOptions(
  projectRecords: AccountsPayableVoucherLookupResponsibilityCenter[],
  currentProjectCode: string,
  currentProjectName: string,
): AppAdvancedDropdownOption[] {
  const options = projectRecords
    .filter((project) => isActiveStatus(project.status) && isProjectResponsibilityCenter(project))
    .map((project) => ({
      description: project.typeName,
      label: project.code,
      name: project.name,
      value: project.name,
    }));

  if (currentProjectName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current voucher value",
      label: currentProjectCode || "Current project",
      name: currentProjectName,
      value: currentProjectName,
    });
  }

  return options;
}

export function createTermOptions(
  options: AppAdvancedDropdownOption[],
  currentTermId: string,
  currentTerms: string,
): AppAdvancedDropdownOption[] {
  const nextOptions = [...options];

  if (currentTermId.trim() && !nextOptions.some((option) => option.value === currentTermId)) {
    nextOptions.push({
      description: "Current voucher value",
      name: currentTerms || currentTermId,
      value: currentTermId,
    });
  }

  return nextOptions;
}

export function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}

export function createLookupTermOptions(terms: AccountsPayableVoucherLookupTerm[]): AppAdvancedDropdownOption[] {
  return terms.map((term) => ({
    description: formatLookupTermDuration(term),
    name: term.name,
    value: term.id,
  }));
}

export function mapLookupTermToMaintenanceTerm(
  term?: AccountsPayableVoucherLookupTerm,
): Pick<TermsMaintenance, "datemode" | "period"> | null {
  if (!term) {
    return null;
  }

  return {
    datemode: mapLookupTermDateMode(term.dateMode),
    period: String(term.period),
  };
}

export function mapLookupTermDateMode(dateMode: AccountsPayableVoucherLookupTerm["dateMode"]) {
  if (dateMode === "DAY") return "Day";
  if (dateMode === "MONTH") return "Month";
  return "Year";
}

export function formatLookupTermDuration(term: AccountsPayableVoucherLookupTerm) {
  const unit = mapLookupTermDateMode(term.dateMode).toLowerCase();
  const suffix = Number(term.period) === 1 ? unit : `${unit}s`;

  return `${term.period} ${suffix}`;
}

export function mergePayableAccountOptions(...groups: AccountsPayableVoucherLookupAccount[][]) {
  const accountsById = new Map<string, AccountsPayableVoucherLookupAccount>();

  groups.flat().forEach((account) => {
    accountsById.set(account.id, account);
  });

  return [...accountsById.values()];
}

export function getPartyDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading parties...";
  }

  if (query.isError) {
    return "Could not load parties.";
  }

  return "No active vendors or employees found.";
}

export function getTermDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading terms...";
  }

  if (query.isError) {
    return "Could not load terms.";
  }

  return "No active terms found.";
}

export function getProjectDropdownEmptyMessage(query: { isError: boolean; isFetching: boolean; isLoading: boolean }) {
  if (query.isLoading || query.isFetching) {
    return "Loading projects...";
  }

  if (query.isError) {
    return "Could not load projects.";
  }

  return "No active projects found.";
}

export function isProjectResponsibilityCenter(project: AccountsPayableVoucherLookupResponsibilityCenter) {
  return project.typeName.trim().toLowerCase() === "project";
}

export function isIndividualParty(record: AccountsPayableVoucherLookupParty | null) {
  return record?.classification.trim().toUpperCase() === "INDIVIDUAL";
}

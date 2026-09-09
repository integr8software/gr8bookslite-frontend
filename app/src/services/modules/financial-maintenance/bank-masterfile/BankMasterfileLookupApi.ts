import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  BankAccountLookupOption,
  BankAccountLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileLookupTypes";

type BankBackendResponse = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
  maskedAccountNumber?: string;
  currencyCode?: string;
  status?: string;
  [key: string]: unknown;
};

export async function fetchBankAccountLookupOptions(
  query: BankAccountLookupQuery = {},
): Promise<BankAccountLookupOption[]> {
  const response = await ApiClient.get<{ banks: BankBackendResponse[] }>(
    "/maintenance/financial-management/bank-masterfile/options",
    { params: query },
  );

  return (response.data.banks ?? []).map(mapBankToLookupOption);
}

function mapBankToLookupOption(bank: BankBackendResponse): BankAccountLookupOption {
  const label = `${bank.bankName} - ${bank.accountName} (${bank.maskedAccountNumber || bank.accountNumber || ""})`;

  return {
    ...bank,
    name: label,
    label: label,
    value: bank.id,
    description: `${bank.bankName} - ${bank.accountName}`,
    bankId: bank.id,
    bankName: bank.bankName,
    accountName: bank.accountName,
  };
}

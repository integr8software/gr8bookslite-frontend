import { BankMasterfileAccountTypeOptions } from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import type {
  BankAccountResponseDtoAccountType,
  CreateBankAccountDtoAccountType,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

type BankAccountTypeLabel = (typeof BankMasterfileAccountTypeOptions)[number];

const BankAccountTypeApiValueByLabel = {
  Checking: "CHECKING",
  Savings: "SAVINGS",
  Current: "CURRENT",
  "Time Deposit": "TIME_DEPOSIT",
  "Credit Card": "CREDIT_CARD",
} as const satisfies Record<BankAccountTypeLabel, CreateBankAccountDtoAccountType>;

export function mapBankAccountTypeFromApi(
  value: Exclude<BankAccountResponseDtoAccountType, null>,
): BankAccountTypeLabel {
  const match = Object.entries(BankAccountTypeApiValueByLabel).find(
    ([, apiValue]) => apiValue === value,
  );

  if (!match) {
    throw new Error(`Unsupported API bank account type: ${value}`);
  }

  return match[0] as BankAccountTypeLabel;
}

export function mapBankAccountTypeToApi(
  value: string,
): CreateBankAccountDtoAccountType | undefined {
  return isBankAccountTypeLabel(value)
    ? BankAccountTypeApiValueByLabel[value]
    : undefined;
}

export function requireBankAccountTypeToApi(
  value: string,
): CreateBankAccountDtoAccountType {
  const accountType = mapBankAccountTypeToApi(value);

  if (!accountType) {
    throw new Error(`Unsupported bank account type: ${value}`);
  }

  return accountType;
}

function isBankAccountTypeLabel(value: string): value is BankAccountTypeLabel {
  return Object.hasOwn(BankAccountTypeApiValueByLabel, value);
}

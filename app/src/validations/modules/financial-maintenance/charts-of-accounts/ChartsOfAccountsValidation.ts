import { z } from "zod";
import type {
  AccountLevel,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsFormProps,
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

const RequiredStringSchema = z.string().trim().min(1);

const ChartsOfAccountsBankDetailsSchema = z.object({
  bankName: RequiredStringSchema,
  bankAccountNumber: RequiredStringSchema,
  accountType: RequiredStringSchema,
  currency: RequiredStringSchema,
});

const ChartsOfAccountsAccountInformationSchema = z.object({
  accountType: RequiredStringSchema,
  statementSection: RequiredStringSchema,
  parentId: z.string().nullable(),
  accountNumber: RequiredStringSchema,
  accountName: RequiredStringSchema,
  accountLevel: RequiredStringSchema,
  normalBalance: RequiredStringSchema,
  status: RequiredStringSchema,
});

export function getDuplicateAccountNameError(
  accounts: ChartAccount[],
  values: ChartAccountFormValues,
  account: ChartAccount | null,
) {
  const accountName = normalizeAccountTitle(values.accountName);

  if (!accountName || !values.parentId) {
    return undefined;
  }

  const duplicateAccount = flattenAccountTree(accounts).find(
    (item) =>
      item.id !== account?.id &&
      item.parentId === values.parentId &&
      normalizeAccountTitle(item.accountName) === accountName,
  );

  return duplicateAccount
    ? "An account with this title already exists under the selected parent."
    : undefined;
}

export function isAccountInformationIncomplete(
  props: ChartsOfAccountsFormProps,
) {
  return !validateChartAccountInformation(props).success;
}

export function isBankDetailsIncomplete(
  values: ChartsOfAccountsFormProps["values"],
) {
  return !ChartsOfAccountsBankDetailsSchema.safeParse(values.bankDetails).success;
}

function validateChartAccountInformation(props: ChartsOfAccountsFormProps) {
  const schema = ChartsOfAccountsAccountInformationSchema.superRefine(
    (values, ctx) => {
      if (values.accountLevel !== "MAJOR" && !values.parentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Parent account is required.",
          path: ["parentId"],
        });
      }

      if (
        !props.availableAccountLevels.includes(
          values.accountLevel as AccountLevel,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an available account level.",
          path: ["accountLevel"],
        });
      }

      if (props.accountCodeError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: props.accountCodeError,
          path: ["accountNumber"],
        });
      }

      if (props.accountNameError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: props.accountNameError,
          path: ["accountName"],
        });
      }
    },
  );

  return schema.safeParse(props.values);
}

function flattenAccountTree(accounts: ChartAccount[]): ChartAccount[] {
  return accounts.flatMap((account) => [
    account,
    ...flattenAccountTree(account.children ?? []),
  ]);
}

function normalizeAccountTitle(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

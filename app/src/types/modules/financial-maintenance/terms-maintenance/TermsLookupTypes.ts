import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type TermLookupOption = AppAdvancedDropdownOption & {
  termId: string;
  name: string;
  dateMode?: string;
  period?: number;
  status?: string;
  [key: string]: unknown;
};

export type TermLookupQuery = {
  dateMode?: "DAY" | "MONTH" | "YEAR";
  search?: string;
};

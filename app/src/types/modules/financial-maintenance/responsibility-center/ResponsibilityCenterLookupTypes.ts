import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

export type ResponsibilityCenterLookupOption = AppAdvancedDropdownOption & {
  centerId: string;
  code: string;
  name: string;
  typeName?: string;
  classificationName?: string;
  [key: string]: unknown;
};

export type ResponsibilityCenterLookupQuery = {
  classificationId?: string;
  search?: string;
  typeId?: string;
  status?: string;
};

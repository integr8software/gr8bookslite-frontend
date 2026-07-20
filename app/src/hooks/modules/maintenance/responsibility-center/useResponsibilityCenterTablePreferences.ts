"use client";

import {
	ResponsibilityCenterDefaultColumnOrder,
	ResponsibilityCenterDefaultColumnVisibility,
	ResponsibilityCenterDefaultSorting,
	ResponsibilityCenterTablePreferencesModuleKey,
	ResponsibilityCenterTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/responsibility-center/ResponsibilityCenterConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type { ResponsibilityCenterTablePreferencesState } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export function useResponsibilityCenterTablePreferences(): ResponsibilityCenterTablePreferencesState {
	return useTablePreferences({
		defaultColumnOrder: ResponsibilityCenterDefaultColumnOrder,
		defaultColumnVisibility: ResponsibilityCenterDefaultColumnVisibility,
		defaultSorting: ResponsibilityCenterDefaultSorting,
		moduleKey: ResponsibilityCenterTablePreferencesModuleKey,
		storageKey: ResponsibilityCenterTablePreferencesStorageKey,
	});
}


import type { Row } from "@tanstack/react-table";
import type { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import type {
	MasterModuleSystem,
	MasterModuleSystemSidebarItem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import type { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";

export type MasterModuleSystemDetailsPageProps = {
	recordId: string;
};

export type MasterModuleSystemFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export type MasterModuleSystemSidebarPageProps = {
	recordId: string;
};

export type MasterModuleSystemTableRowProps = {
	row: Row<MasterModuleSystem>;
	onToggleStatus: (record: MasterModuleSystem) => void;
};

export type MasterModuleSystemTableProps = Pick<
	ReturnType<typeof useMasterModuleSystemListPage>,
	| "isLoading"
	| "isRefreshing"
	| "lastSyncedAt"
	| "query"
	| "records"
	| "refreshSystems"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
	| "toggleRecordStatus"
>;

export type SidebarGap = {
	depth: number;
	index: number;
	parentKey: string | null;
};

export type SidebarDropPreview =
	| {
			mode: "gap";
			targetKey: string;
			gap: SidebarGap;
	  }
	| {
			mode: "inside";
			targetKey: string;
	  };

export type SidebarIconPickerProps = {
	defaultIconKind: "dot" | "folder";
	icon: (typeof SidebarAllowedIcons)[string] | undefined;
	label: string;
	onChange: (value: string | null) => void;
	value: string;
};

export type SidebarTemplatePanelProps = {
	fallbackSidebar: MasterModuleSystemSidebarItem[];
	isLoading: boolean;
	isSaving: boolean;
	items: MasterModuleSystemSidebarItem[];
	modules: MasterModuleSystem["modules"];
	onSave: () => void;
	onUpdate: (items: MasterModuleSystemSidebarItem[]) => void;
};

export type SidebarTreeProps = {
	canAddSection: boolean;
	depth?: number;
	dropPreview: SidebarDropPreview | null;
	items: MasterModuleSystemSidebarItem[];
	onAddSection: (index?: number, parentKey?: string | null) => void;
	onPatchItem: (
		key: string,
		patch: Partial<MasterModuleSystemSidebarItem>,
	) => void;
	onRemove: (key: string) => void;
	parentKey?: string | null;
};

export type SidebarTreeRowProps = {
	depth: number;
	dropPreview: SidebarDropPreview | null;
	item: MasterModuleSystemSidebarItem;
	onAddSection: (index?: number, parentKey?: string | null) => void;
	onPatchItem: (
		key: string,
		patch: Partial<MasterModuleSystemSidebarItem>,
	) => void;
	onRemove: (key: string) => void;
};

export type SidebarDropGapProps = {
	canAddSection: boolean;
	depth: number;
	dropPreview: SidebarDropPreview | null;
	index: number;
	onAddSection: () => void;
	parentKey: string | null;
};

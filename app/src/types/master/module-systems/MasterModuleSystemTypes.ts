import type { Row } from "@tanstack/react-table";
import type { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import type { MasterModuleSystem } from "@/app/src/services/master/module-systems/MasterModuleSystemApi";

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

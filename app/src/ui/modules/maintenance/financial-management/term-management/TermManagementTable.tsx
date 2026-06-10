"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { TermManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementTable } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementTable";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TermManagementTableRow } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTableRow";

type TermManagementTableProps = {
	isLoading: boolean;
	terms: TermManagement[];
	toolbar?: ReactNode;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
};

export function TermManagementTable({
	isLoading,
	terms,
	toolbar,
	onEditTerm,
	onToggleStatus,
}: TermManagementTableProps) {
	const table = useTermManagementTable(terms);

	return (
		<ModuleTable
			emptyDescription="Add a term definition to start managing reporting and payment cycles."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No term records found"
			isLoading={isLoading}
			minWidthClassName="min-w-[48rem]"
			paginationStorageKey={TermManagementTablePaginationStorageKey}
			table={table}
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<TermManagementTableRow
					key={id}
					term={original}
					onEditTerm={onEditTerm}
					onToggleStatus={onToggleStatus}
				/>
			)}
		/>
	);
}

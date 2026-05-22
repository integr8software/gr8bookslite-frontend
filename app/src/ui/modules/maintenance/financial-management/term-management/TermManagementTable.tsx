"use client";

import { Search } from "lucide-react";
import { TermManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementTable } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementTable";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TermManagementTableRow } from "./TermManagementTableRow";

type TermManagementTableProps = {
	isLoading: boolean;
	terms: TermManagement[];
	onDeleteTerm: (term: TermManagement) => void;
};

export function TermManagementTable({
	isLoading,
	terms,
	onDeleteTerm,
}: TermManagementTableProps) {
	const table = useTermManagementTable(terms);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				emptyDescription="Add a term definition to start managing reporting and payment cycles."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No term records found"
				isLoading={isLoading}
				minWidthClassName="min-w-[48rem]"
				paginationStorageKey={TermManagementTablePaginationStorageKey}
				table={table}
				renderRow={({ id, original }) => (
					<TermManagementTableRow
						key={id}
						term={original}
						onDeleteTerm={onDeleteTerm}
					/>
				)}
			/>
		</div>
	);
}

"use client";

import {
	CalendarClock,
	Plus,
	ShieldCheck,
	UserRoundCheck,
	UsersRound,
} from "lucide-react";
import {
	ApproverAssignmentTypeOptions,
	ApproverCoverageStatusOptions,
	ApproverSetupAllStatusesFilter,
	ApproverSetupAllTypesFilter,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import { useApproverSetupPage } from "@/app/src/hooks/modules/system-administration/user-management/approver-setup/useApproverSetupPage";
import type {
	ApproverAssignmentType,
	ApproverCoverageStatus,
	ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ApproverSetupDrawer } from "./ApproverSetupDrawer";
import { ApproverSetupSummaryTile } from "./ApproverSetupSummaryTile";
import { ApproverSetupTableRow } from "./ApproverSetupTableRow";

export function ApproverSetupPage() {
	const page = useApproverSetupPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Approver Setup"
				description="Assign users as level-based, no-condition, or temporary approvers before they are used in approval workflows."
				eyebrow={
					<>
						<UserRoundCheck
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						User management
					</>
				}
			/>

			<div className="grid gap-3 md:grid-cols-3">
				<ApproverSetupSummaryTile
					icon={ShieldCheck}
					label="Active approvers"
					value={page.activeCount}
					helper={`${page.records.length} total assignments`}
				/>
				<ApproverSetupSummaryTile
					icon={CalendarClock}
					label="Temporary coverage"
					value={page.temporaryCount}
					helper={`${page.expiringCount} ending soon`}
				/>
				<ApproverSetupSummaryTile
					icon={UsersRound}
					label="Approval levels"
					value={page.levelCount}
					helper="Configured level names"
				/>
			</div>

			<ModuleTable<ApproverSetupRecord>
				emptyDescription="Adjust the search or filters to see more approver assignments."
				emptyIcon={
					<UserRoundCheck className="h-5 w-5" aria-hidden="true" />
				}
				emptyTitle="No approver assignments found"
				lastSyncedAt="2026-07-08T08:45:31"
				maxHeightClassName="max-h-[34rem]"
				minWidthClassName="min-w-[70rem]"
				pageSizeOptions={[5, 10, 15]}
				paginationLabel="assignments"
				paginationStorageKey="approver-setup-assignments"
				table={page.table}
				tableTitle="Approver assignments"
				toolbar={
					<ApproverSetupToolbar
						query={page.query}
						statusFilter={page.statusFilter}
						typeFilter={page.typeFilter}
						onAdd={page.openAddDrawer}
						onQueryChange={page.setQuery}
						onStatusFilterChange={page.setStatusFilter}
						onTypeFilterChange={page.setTypeFilter}
					/>
				}
				renderRow={(row) => (
					<ApproverSetupTableRow
						key={row.id}
						record={row.original}
						onDelete={page.setPendingDelete}
						onEdit={page.openEditDrawer}
						onToggleStatus={page.toggleAssignmentStatus}
					/>
				)}
			/>

			<ApproverSetupDrawer
				formValues={page.formValues}
				isOpen={Boolean(page.drawerState)}
				moduleOptions={page.moduleOptions}
				mode={page.drawerState?.mode ?? "add"}
				onChange={page.setFormValues}
				onClose={page.closeDrawer}
				onSave={page.saveAssignment}
				selectedModuleScopes={page.selectedModuleScopes}
				onSelectedModuleScopesChange={page.setSelectedModuleScopes}
				users={page.approverUsers}
				validationMessage={page.drawerError}
			/>

			<AppDialog
				isOpen={Boolean(page.pendingDelete)}
				title="Delete approver assignment?"
				description={`This will remove ${page.pendingDelete?.levelName ?? "the selected level"} from approver setup.`}
				confirmLabel="Delete Assignment"
				tone="danger"
				onCancel={() => page.setPendingDelete(null)}
				onConfirm={page.deleteAssignment}
			/>
		</section>
	);
}

function ApproverSetupToolbar({
	onAdd,
	onQueryChange,
	onStatusFilterChange,
	onTypeFilterChange,
	query,
	statusFilter,
	typeFilter,
}: {
	onAdd: () => void;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (
		value:
			| ApproverCoverageStatus
			| typeof ApproverSetupAllStatusesFilter,
	) => void;
	onTypeFilterChange: (
		value: ApproverAssignmentType | typeof ApproverSetupAllTypesFilter,
	) => void;
	query: string;
	statusFilter:
		| ApproverCoverageStatus
		| typeof ApproverSetupAllStatusesFilter;
	typeFilter: ApproverAssignmentType | typeof ApproverSetupAllTypesFilter;
}) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(11rem,0.8fr)_minmax(11rem,0.8fr)_minmax(10rem,0.8fr)]">
			<ModuleTableSearch
				label="Search approver assignments"
				placeholder="Search by approver, scope, or condition"
				value={query}
				onChange={onQueryChange}
			/>
			<ModuleTableFilterSelect
				label="Type"
				value={typeFilter}
				options={[
					{
						label: ApproverSetupAllTypesFilter,
						value: ApproverSetupAllTypesFilter,
					},
					...ApproverAssignmentTypeOptions.map((type) => ({
						label: type,
						value: type,
					})),
				]}
				onChange={(value) =>
					onTypeFilterChange(
						value as
							| ApproverAssignmentType
							| typeof ApproverSetupAllTypesFilter,
					)
				}
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={[
					{
						label: ApproverSetupAllStatusesFilter,
						value: ApproverSetupAllStatusesFilter,
					},
					...ApproverCoverageStatusOptions.map((status) => ({
						label: status,
						value: status,
					})),
				]}
				onChange={(value) =>
					onStatusFilterChange(
						value as
							| ApproverCoverageStatus
							| typeof ApproverSetupAllStatusesFilter,
					)
				}
			/>
			<button
				type="button"
				onClick={onAdd}
				className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-skyblue px-3 text-sm font-semibold text-white shadow-sm shadow-skyblue/20 transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Assign Approver
			</button>
		</ModuleTableToolbar>
	);
}

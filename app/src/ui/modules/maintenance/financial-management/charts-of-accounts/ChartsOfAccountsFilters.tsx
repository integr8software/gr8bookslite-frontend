"use client";

import type { ReactNode } from "react";
import { ListTree, Network } from "lucide-react";
import {
	AccountStatuses,
	AccountTypes,
	ChartsOfAccountsNavs,
	type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	AccountStatus,
	AccountType,
	ChartAccountStructureFilter,
	FilterValue,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Tabs,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

export type ChartsOfAccountsFiltersProps = {
	accountTypeFilter: FilterValue<AccountType>;
	activeTab: ChartsOfAccountsNav;
	searchQuery: string;
	statusFilter: FilterValue<AccountStatus>;
	structureFilter: ChartAccountStructureFilter;
	onAccountTypeChange: (value: FilterValue<AccountType>) => void;
	onSearchChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusChange: (value: FilterValue<AccountStatus>) => void;
	onStructureChange: (value: ChartAccountStructureFilter) => void;
	onTabChange: (value: ChartsOfAccountsNav) => void;
};

export function ChartsOfAccountsFilters({
	accountTypeFilter,
	activeTab,
	searchQuery,
	statusFilter,
	structureFilter,
	onAccountTypeChange,
	onSearchChange,
	onResetFilters,
	onStatusChange,
	onStructureChange,
	onTabChange,
}: ChartsOfAccountsFiltersProps) {
	return (
		<div>
			<div
				className="flex flex-col gap-3 border-b border-darknavy/10 px-3 pt-2 sm:flex-row sm:items-end sm:justify-between"
				data-spotlight-id="charts-of-accounts-tabs"
			>
				<Tabs
					value={activeTab}
					options={[...ChartsOfAccountsNavs]}
					onChange={onTabChange}
				/>

				<div className="flex gap-2 overflow-x-auto pb-2">
					<StructureButton
						active={structureFilter === "With Submodules"}
						icon={<Network className="h-4 w-4" aria-hidden="true" />}
						label="With Submodules"
						onClick={() =>
							onStructureChange(
								structureFilter === "With Submodules"
									? "All"
									: "With Submodules",
							)
						}
					/>
					<StructureButton
						active={structureFilter === "Without Submodules"}
						icon={<ListTree className="h-4 w-4" aria-hidden="true" />}
						label="Without Submodules"
						onClick={() =>
							onStructureChange(
								structureFilter === "Without Submodules"
									? "All"
									: "Without Submodules",
							)
						}
					/>
				</div>
			</div>

			<ModuleTableToolbar
				className="rounded-none border-x-0 border-t-0 shadow-none xl:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]"
				data-spotlight-id="charts-of-accounts-filters"
			>
				<ModuleTableSearch
					label="Search accounts"
					value={searchQuery}
					onChange={onSearchChange}
					placeholder="Search account number or name..."
				/>
				<ModuleTableFilterSelect
					label="Account Type"
					value={accountTypeFilter}
					options={[
						{ label: "All", value: "All" },
						...AccountTypes.map((type) => ({
							label: type,
							value: type,
						})),
					]}
					onChange={(value) =>
						onAccountTypeChange(value as FilterValue<AccountType>)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "All" },
						...AccountStatuses.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusChange(value as FilterValue<AccountStatus>)
					}
				/>
				<ModuleTableResetButton onClick={onResetFilters} />
			</ModuleTableToolbar>
		</div>
	);
}

function StructureButton({
	active,
	icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: ReactNode;
	label: ChartAccountStructureFilter;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
				active
					? "border-skyblue bg-skyblue/10 text-skyblue"
					: "border-darknavy/10 bg-white text-darknavy/75 hover:border-skyblue/40 hover:bg-skyblue/10",
			].join(" ")}
		>
			{icon}
			{label}
		</button>
	);
}


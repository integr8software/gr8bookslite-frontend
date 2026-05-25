"use client";

import type { ReactNode } from "react";
import { Filter, ListTree, Network, Search } from "lucide-react";
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
	Button,
	Input,
	Select,
	Tabs,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";

export type ChartsOfAccountsFiltersProps = {
	accountTypeFilter: FilterValue<AccountType>;
	activeTab: ChartsOfAccountsNav;
	searchQuery: string;
	statusFilter: FilterValue<AccountStatus>;
	structureFilter: ChartAccountStructureFilter;
	onAccountTypeChange: (value: FilterValue<AccountType>) => void;
	onSearchChange: (value: string) => void;
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

			<div
				className="grid gap-3 border-b border-darknavy/10 bg-white p-4 xl:grid-cols-[minmax(18rem,1fr)_15rem_15rem_11rem]"
				data-spotlight-id="charts-of-accounts-filters"
			>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40" />
					<Input
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Search account number or name..."
						className="pl-9"
					/>
				</div>

				<div className="relative">
					<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-medium text-darknavy/70">
						Account Type
					</span>
					<Select
						value={accountTypeFilter}
						onChange={(event) =>
							onAccountTypeChange(
								event.target.value as FilterValue<AccountType>,
							)
						}
					>
						<option value="All">All Types</option>
						{AccountTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</Select>
				</div>

				<div className="relative">
					<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-medium text-darknavy/70">
						Status
					</span>
					<Select
						value={statusFilter}
						onChange={(event) =>
							onStatusChange(
								event.target.value as FilterValue<AccountStatus>,
							)
						}
					>
						<option value="All">All Status</option>
						{AccountStatuses.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</Select>
				</div>

				<Button variant="secondary">
					<Filter className="h-4 w-4" aria-hidden="true" />
					Filter
				</Button>
			</div>
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
					? "border-blue-600 bg-blue-50 text-blue-700"
					: "border-darknavy/10 bg-white text-darknavy/75 hover:border-skyblue/40 hover:bg-skyblue/10",
			].join(" ")}
		>
			{icon}
			{label}
		</button>
	);
}

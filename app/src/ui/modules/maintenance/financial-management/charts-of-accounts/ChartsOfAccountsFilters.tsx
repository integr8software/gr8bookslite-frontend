"use client";

import { Filter, Search } from "lucide-react";
import {
	AccountStatuses,
	AccountTypes,
	ChartsOfAccountsNavs,
	type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	AccountStatus,
	AccountType,
	FilterValue,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Button,
	Input,
	Select,
	Tabs,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";

type ChartsOfAccountsFiltersProps = {
	accountTypeFilter: FilterValue<AccountType>;
	activeTab: ChartsOfAccountsNav;
	searchQuery: string;
	statusFilter: FilterValue<AccountStatus>;
	onAccountTypeChange: (value: FilterValue<AccountType>) => void;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: FilterValue<AccountStatus>) => void;
	onTabChange: (value: ChartsOfAccountsNav) => void;
};

export function ChartsOfAccountsFilters({
	accountTypeFilter,
	activeTab,
	searchQuery,
	statusFilter,
	onAccountTypeChange,
	onSearchChange,
	onStatusChange,
	onTabChange,
}: ChartsOfAccountsFiltersProps) {
	return (
		<div className="border-b border-darknavy/10 p-4 sm:p-5">
			<div data-spotlight-id="charts-of-accounts-tabs">
				<Tabs
					value={activeTab}
					options={[...ChartsOfAccountsNavs]}
					onChange={onTabChange}
				/>
			</div>

			<div
				className="mt-5 grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_13rem_13rem_11rem_auto]"
				data-spotlight-id="charts-of-accounts-filters"
			>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40" />
					<Input
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Search account number or name"
						className="pl-9"
					/>
				</div>

				<Select
					value={accountTypeFilter}
					onChange={(event) =>
						onAccountTypeChange(
							event.target.value as FilterValue<AccountType>,
						)
					}
				>
					<option value="All">Account Type</option>
					{AccountTypes.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</Select>

				<Select
					value={statusFilter}
					onChange={(event) =>
						onStatusChange(
							event.target.value as FilterValue<AccountStatus>,
						)
					}
				>
					<option value="All">Status</option>
					{AccountStatuses.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</Select>

				<Button variant="secondary">
					<Filter className="h-4 w-4" aria-hidden="true" />
					Filter
				</Button>
			</div>
		</div>
	);
}

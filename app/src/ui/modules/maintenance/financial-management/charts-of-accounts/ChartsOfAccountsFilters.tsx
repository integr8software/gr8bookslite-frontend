"use client";

import { Filter, Search } from "lucide-react";
import {
	AccountStatuses,
	AccountTypes,
	ChartsOfAccountsNavs,
	StatementGroups,
	type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	AccountStatus,
	AccountType,
	FilterValue,
	StatementGroup,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
	Button,
	Input,
	Select,
	Tabs,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

type ChartsOfAccountsFiltersProps = {
	accountTypeFilter: FilterValue<AccountType>;
	activeTab: ChartsOfAccountsNav;
	searchQuery: string;
	statementGroupFilter: FilterValue<StatementGroup>;
	statusFilter: FilterValue<AccountStatus>;
	onAccountTypeChange: (value: FilterValue<AccountType>) => void;
	onSearchChange: (value: string) => void;
	onStatementGroupChange: (value: FilterValue<StatementGroup>) => void;
	onStatusChange: (value: FilterValue<AccountStatus>) => void;
	onTabChange: (value: ChartsOfAccountsNav) => void;
};

export function ChartsOfAccountsFilters({
	accountTypeFilter,
	activeTab,
	searchQuery,
	statementGroupFilter,
	statusFilter,
	onAccountTypeChange,
	onSearchChange,
	onStatementGroupChange,
	onStatusChange,
	onTabChange,
}: ChartsOfAccountsFiltersProps) {
	return (
		<div className="border-b border-slate-200 p-4 sm:p-5">
			<Tabs
				value={activeTab}
				options={[...ChartsOfAccountsNavs]}
				onChange={onTabChange}
			/>

			<div className="mt-5 grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_13rem_13rem_11rem_auto]">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
					value={statementGroupFilter}
					onChange={(event) =>
						onStatementGroupChange(
							event.target.value as FilterValue<StatementGroup>,
						)
					}
				>
					<option value="All">Statement Group</option>
					{StatementGroups.map((group) => (
						<option key={group} value={group}>
							{group}
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

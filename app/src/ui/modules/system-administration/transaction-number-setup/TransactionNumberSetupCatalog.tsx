import { Search } from "lucide-react";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { transactionNumberFieldClassName } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupUi";

type TransactionNumberSetupCatalogProps = {
	isLoading: boolean;
	query: string;
	scopeFilter: "all" | "any" | "branch";
	selectedSetupId: string | null;
	setups: TransactionNumberSetupRecord[];
	onQueryChange: (value: string) => void;
	onScopeFilterChange: (value: "all" | "any" | "branch") => void;
	onSelectSetup: (setupId: string) => void;
};

export function TransactionNumberSetupCatalog({
	isLoading,
	query,
	scopeFilter,
	selectedSetupId,
	setups,
	onQueryChange,
	onScopeFilterChange,
	onSelectSetup,
}: TransactionNumberSetupCatalogProps) {
	const dropdownOptions = setups.map<AppAdvancedDropdownOption>((setup) => ({
		description: setup.moduleCode,
		name: setup.moduleName,
		value: setup.id,
	}));

	function handleDropdownChange(value: string | string[]) {
		if (typeof value === "string" && value) {
			onSelectSetup(value);
		}
	}

	return (
		<aside className="flex min-h-0 flex-col overflow-hidden border-b border-darknavy/10 bg-white xl:m-4 xl:self-stretch xl:rounded-lg xl:border xl:border-darknavy/10 xl:shadow-sm xl:shadow-darknavy/5 xl:[contain:size]">
			<div className="grid gap-3 border-b border-darknavy/10 p-4 xl:hidden">
				<div>
					<h2 className="text-sm font-semibold text-darknavy">
						Transaction Modules
					</h2>
					<p className="mt-1 text-xs font-medium text-darknavy/55">
						Choose a module to configure.
					</p>
				</div>
				<AppAdvancedDropdown
					disabled={isLoading}
					emptyMessage="No modules match the current search."
					options={dropdownOptions}
					placeholder="Select module"
					searchPlaceholder="Search module"
					value={selectedSetupId ?? ""}
					onChange={handleDropdownChange}
				/>
			</div>

			<div className="hidden gap-3 border-b border-darknavy/10 p-4 xl:grid">
				<div>
					<h2 className="text-sm font-semibold text-darknavy">
						Transaction Modules
					</h2>
					<p className="mt-1 text-xs font-medium text-darknavy/55">
						Choose a module, then update how its numbers are
						created.
					</p>
				</div>
				<div className="grid gap-2 2xl:grid-cols-[minmax(0,1fr)_10rem]">
					<label className="relative block">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
							aria-hidden="true"
						/>
						<input
							value={query}
							onChange={(event) =>
								onQueryChange(event.target.value)
							}
							disabled={isLoading}
							className={joinClasses(
								transactionNumberFieldClassName,
								"pl-9",
							)}
							placeholder="Search module"
						/>
					</label>
					<select
						value={scopeFilter}
						onChange={(event) =>
							onScopeFilterChange(
								event.target.value as "all" | "any" | "branch",
							)
						}
						disabled={isLoading}
						className={transactionNumberFieldClassName}
						aria-label="Filter by numbering scope"
					>
						<option value="any">All Scopes</option>
						<option value="all">All Branches</option>
						<option value="branch">Separate per Branch</option>
					</select>
				</div>
			</div>

			<div className="hidden grid-cols-[minmax(0,1fr)_7rem] border-b border-darknavy/10 bg-skyblue/12 px-4 py-2 text-xs font-semibold text-darknavy xl:grid">
				<span>Module</span>
				<span>Code</span>
			</div>
			<div className="hidden min-h-0 flex-1 overflow-auto xl:block">
				{isLoading ? (
					<TransactionNumberSetupCatalogSkeleton />
				) : setups.length > 0 ? (
					setups.map((setup) => {
						const isSelected = setup.id === selectedSetupId;

						return (
							<button
								key={setup.id}
								type="button"
								onClick={() => onSelectSetup(setup.id)}
								className={joinClasses(
									"grid w-full grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 border-b border-darknavy/8 px-4 py-2.5 text-left text-sm transition hover:bg-offwhite/80",
									isSelected ? "bg-citron/20" : "bg-white",
								)}
							>
								<span
									className={joinClasses(
										"truncate text-darknavy",
										isSelected
											? "font-semibold"
											: "font-medium",
									)}
								>
									{setup.moduleName}
								</span>
								<span className="text-xs font-bold text-darknavy/72">
									{setup.moduleCode}
								</span>
							</button>
						);
					})
				) : (
					<div className="p-6 text-sm font-medium text-darknavy/55">
						No modules match the current search.
					</div>
				)}
			</div>
		</aside>
	);
}

function TransactionNumberSetupCatalogSkeleton() {
	return (
		<div aria-label="Loading transaction modules" aria-busy="true">
			{Array.from({ length: 12 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-[2.9rem] grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 border-b border-darknavy/8 px-4 py-2.5"
				>
					<AppSkeleton className="h-4 w-3/4 rounded-md" />
					<AppSkeleton className="h-3.5 w-12 rounded-md" />
				</div>
			))}
		</div>
	);
}

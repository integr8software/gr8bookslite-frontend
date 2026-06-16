import { Search } from "lucide-react";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
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
	return (
		<aside className="border-b border-darknavy/10 xl:border-b-0 xl:border-r">
			<div className="grid gap-3 border-b border-darknavy/10 p-4">
				<div>
					<h2 className="text-sm font-semibold text-darknavy">
						Transaction types
					</h2>
					<p className="mt-1 text-xs font-medium text-darknavy/55">
						Choose one setup to edit. This prevents duplicate
						sequences.
					</p>
				</div>
				<div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem] xl:grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_10rem]">
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
							placeholder="Search transaction or type"
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
						aria-label="Filter by numbering mode"
					>
						<option value="any">All modes</option>
						<option value="all">All branches</option>
						<option value="branch">Per branch</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-[minmax(0,1fr)_7rem] border-b border-darknavy/10 bg-skyblue/12 px-4 py-2 text-xs font-semibold text-darknavy">
				<span>Transaction</span>
				<span>Transaction Type</span>
			</div>
			<div className="max-h-[34rem] overflow-auto">
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
								<span className="font-mono text-xs font-semibold text-darknavy/72">
									{setup.prefix}
								</span>
							</button>
						);
					})
				) : (
					<div className="p-6 text-sm font-medium text-darknavy/55">
						No transaction types match the current search.
					</div>
				)}
			</div>
		</aside>
	);
}

function TransactionNumberSetupCatalogSkeleton() {
	return (
		<div aria-label="Loading transaction types" aria-busy="true">
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

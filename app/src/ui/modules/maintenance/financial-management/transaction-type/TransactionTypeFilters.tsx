import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";

type TransactionTypeFiltersProps = {
	searchTerm: string;
	statusFilter: "" | (typeof TransactionTypeStatusOptions)[number];
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (
		value: "" | (typeof TransactionTypeStatusOptions)[number],
	) => void;
};

export function TransactionTypeFilters({
	searchTerm,
	statusFilter,
	onSearchTermChange,
	onStatusFilterChange,
}: TransactionTypeFiltersProps) {
	return (
		<div className="flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
			<div className="flex-1">
				<label className="block text-sm font-semibold text-darknavy">
					Search
					<input
						value={searchTerm}
						onChange={(event) => onSearchTermChange(event.target.value)}
						placeholder="Search by type, description, or account"
						className="mt-2 min-w-0 w-full rounded-md border border-darknavy/15 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
					/>
				</label>
			</div>
			<div className="min-w-42.5">
				<label className="block text-sm font-semibold text-darknavy">
					Status
					<select
						value={statusFilter}
						onChange={(event) =>
							onStatusFilterChange(
								event.target.value as
									| ""
									| (typeof TransactionTypeStatusOptions)[number],
							)
						}
						className="mt-2 min-w-full rounded-md border border-darknavy/15 bg-white px-3 py-2 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
					>
						<option value="">All statuses</option>
						{TransactionTypeStatusOptions.map((statusOption) => (
							<option key={statusOption} value={statusOption}>
								{statusOption}
							</option>
						))}
					</select>
				</label>
			</div>
		</div>
	);
}

import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
	getColumnClassName,
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleTableHeader<TData>({ table }: { table: Table<TData> }) {
	return (
		<thead className="module-table-header sticky top-0 z-10 bg-slate-50 text-xs font-bold text-darknavy/80">
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id} className="border-b border-darknavy/10">
					{headerGroup.headers.map((header) => (
						<th
							key={header.id}
							className={joinClasses(
								"whitespace-nowrap px-5 py-3 first:pl-6 last:pr-6",
								getColumnClassName(header),
							)}
						>
							{header.isPlaceholder ? null : header.column.getCanSort() ? (
								<ModuleTableSortButton header={header} />
							) : (
								flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)
							)}
						</th>
					))}
				</tr>
			))}
		</thead>
	);
}

function ModuleTableSortButton<TData>({
	header,
}: {
	header: Header<TData, unknown>;
}) {
	const sortDirection = header.column.getIsSorted();
	const SortIcon =
		sortDirection === "asc"
			? ArrowUp
			: sortDirection === "desc"
				? ArrowDown
				: ArrowUpDown;
	const sortLabel =
		sortDirection === "asc"
			? "Sorted ascending"
			: sortDirection === "desc"
				? "Sorted descending"
				: "Sort column";

	return (
		<button
			type="button"
			onClick={header.column.getToggleSortingHandler()}
			aria-label={sortLabel}
			className={joinClasses(
				"inline-flex max-w-full items-center gap-2 rounded-md text-left transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
				moduleAccentClassNames.focusRing,
			)}
		>
			<span className="truncate">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>
			<SortIcon
				className={joinClasses(
					"h-3.5 w-3.5 shrink-0",
					sortDirection
						? moduleAccentClassNames.iconText
						: "text-darknavy/45",
				)}
				aria-hidden="true"
			/>
		</button>
	);
}

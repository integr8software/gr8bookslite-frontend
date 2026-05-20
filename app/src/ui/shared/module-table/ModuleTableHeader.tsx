import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import {
	getColumnClassName,
	joinClasses,
} from "@/app/src/ui/shared/module-table/utils";

export function ModuleTableHeader<TData>({ table }: { table: Table<TData> }) {
	return (
		<thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id} className="border-b border-slate-200">
					{headerGroup.headers.map((header) => (
						<th
							key={header.id}
							className={joinClasses(
								"px-4 py-3",
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

	return (
		<button
			type="button"
			onClick={header.column.getToggleSortingHandler()}
			className="flex items-center gap-1 rounded text-left transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
		>
			{flexRender(header.column.columnDef.header, header.getContext())}
			<ChevronsUpDown
				className={joinClasses(
					"h-3.5 w-3.5",
					sortDirection && "text-blue-600",
					sortDirection === "desc" && "rotate-180",
				)}
				aria-hidden="true"
			/>
		</button>
	);
}

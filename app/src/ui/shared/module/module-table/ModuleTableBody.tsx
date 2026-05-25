import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { ModuleTableBodyProps } from "@/app/src/types/shared/module/module-table/ModuleTable.types";

export function ModuleTableBody<TData>({
	emptyDescription,
	emptyIcon,
	emptyTitle,
	isLoading,
	renderRow,
	rows,
	skeletonRowCount,
	visibleColumnCount,
}: ModuleTableBodyProps<TData>) {
	if (isLoading) {
		return (
			<tbody className="divide-y divide-darknavy/10 bg-white">
				<ModuleTableSkeletonRows
					columnCount={visibleColumnCount}
					rowCount={skeletonRowCount}
				/>
			</tbody>
		);
	}

	if (rows.length === 0) {
		return (
			<tbody className="divide-y divide-darknavy/10 bg-white">
				<ModuleTableEmptyRow
					colSpan={visibleColumnCount}
					description={emptyDescription}
					icon={emptyIcon}
					title={emptyTitle}
				/>
			</tbody>
		);
	}

	return (
		<tbody className="divide-y divide-darknavy/10 bg-white">
			{rows.map((row) => renderRow(row))}
		</tbody>
	);
}

function ModuleTableSkeletonRows({
	columnCount,
	rowCount,
}: {
	columnCount: number;
	rowCount: number;
}) {
	return Array.from({ length: rowCount }).map((_, index) => (
		<tr key={index} className="animate-pulse">
			{Array.from({ length: columnCount }).map((__, cellIndex) => (
				<td key={cellIndex} className="px-4 py-4">
					<div className="h-4 rounded bg-darknavy/10" />
				</td>
			))}
		</tr>
	));
}

function ModuleTableEmptyRow({
	colSpan,
	description,
	icon,
	title,
}: {
	colSpan: number;
	description: string;
	icon?: ReactNode;
	title: string;
}) {
	return (
		<tr>
			<td colSpan={colSpan} className="px-4 py-16 text-center">
				<div className="mx-auto flex max-w-sm flex-col items-center">
					<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-darknavy/8 text-darknavy/55">
						{icon ?? (
							<Search className="h-5 w-5" aria-hidden="true" />
						)}
					</span>
					<p className="mt-4 text-sm font-semibold text-darknavy">
						{title}
					</p>
					<p className="mt-1 text-sm text-darknavy/55">{description}</p>
				</div>
			</td>
		</tr>
	);
}

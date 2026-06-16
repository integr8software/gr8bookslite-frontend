import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { ModuleTableBodyProps } from "@/app/src/types/shared/module/module-table/ModuleTable.types";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

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
			<tbody className="divide-y divide-darknavy/10 bg-white text-sm text-darknavy/75">
				<ModuleTableSkeletonRows
					columnCount={visibleColumnCount}
					rowCount={skeletonRowCount}
				/>
			</tbody>
		);
	}

	if (rows.length === 0) {
		return (
			<tbody className="divide-y divide-darknavy/10 bg-white text-sm text-darknavy/75">
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
		<tbody
			className={joinClasses(
				"divide-y divide-darknavy/10 bg-white text-sm text-darknavy/75 [&_tr]:transition-colors [&_td]:px-5 [&_td]:py-6 [&_td:first-child]:pl-6 [&_td:last-child]:pr-6",
				moduleAccentClassNames.rowHover,
			)}
		>
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
				<td key={cellIndex} className="px-5 py-6 first:pl-6 last:pr-6">
					<div className="h-4 rounded-full bg-darknavy/10" />
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
			<td colSpan={colSpan} className="px-6 py-0 text-center">
				<div className="flex min-h-72 w-full items-center justify-center">
					<div className="mx-auto flex w-full max-w-sm flex-col items-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-darknavy/8 text-darknavy/55">
							{icon ?? (
								<Search className="h-5 w-5" aria-hidden="true" />
							)}
						</span>
						<p className="mt-4 text-sm font-semibold text-darknavy">
							{title}
						</p>
						<p className="mt-1 text-sm text-darknavy/55">{description}</p>
					</div>
				</div>
			</td>
		</tr>
	);
}

"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleTableSyncStatusProps = {
	isSyncing?: boolean;
	lastSyncedAt?: number | string | Date | null;
	tableTitle?: ReactNode;
};

export function ModuleTableSyncStatus({
	isSyncing = false,
	lastSyncedAt,
	tableTitle,
}: ModuleTableSyncStatusProps) {
	const syncedDate = lastSyncedAt ? new Date(lastSyncedAt) : null;
	const hasValidSyncDate =
		Boolean(syncedDate) && !Number.isNaN(syncedDate?.getTime());

	if (!tableTitle && !isSyncing && !hasValidSyncDate) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
			{tableTitle ? (
				<p className="text-sm font-semibold text-darknavy">{tableTitle}</p>
			) : (
				<span aria-hidden="true" />
			)}
			<div className="flex items-center gap-2 text-xs font-semibold text-darknavy/58">
				<RefreshCw
					className={joinClasses(
						"h-3.5 w-3.5",
						isSyncing ? "animate-spin text-skyblue" : "text-citron",
					)}
					aria-hidden="true"
				/>
				<span>{isSyncing ? "Syncing" : "Live"}</span>
				{syncedDate && !Number.isNaN(syncedDate.getTime()) ? (
					<span className="font-medium text-darknavy/42">
						Updated {formatModuleTableSyncTime(syncedDate)}
					</span>
				) : null}
			</div>
		</div>
	);
}

function formatModuleTableSyncTime(value: Date) {
	return new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	}).format(value);
}

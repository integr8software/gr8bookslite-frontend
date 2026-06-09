"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { RecordWorkspaceActivity } from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogApi";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import type { MainBreadcrumb } from "@/app/src/types/shared/main-layout/MainLayoutTypes";

type MainActivityLoggerProps = {
	breadcrumbs: MainBreadcrumb[];
	currentBranch?: MainBranch | null;
};

const ActivityLogThrottleMs = 5 * 60 * 1000;
const ActivityLogStoragePrefix = "gr8booksneo.activity-log";

export function MainActivityLogger({
	breadcrumbs,
	currentBranch,
}: MainActivityLoggerProps) {
	const pathname = usePathname();
	const moduleName = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Module";

	useEffect(() => {
		if (!pathname || !moduleName || moduleName === "Module") {
			return;
		}

		const storageKey = `${ActivityLogStoragePrefix}:${pathname}`;
		const lastLoggedAt = Number(window.sessionStorage.getItem(storageKey) ?? 0);

		if (Date.now() - lastLoggedAt < ActivityLogThrottleMs) {
			return;
		}

		window.sessionStorage.setItem(storageKey, String(Date.now()));

		void RecordWorkspaceActivity({
			branchId: currentBranch?.id,
			branchName: currentBranch?.name,
			module: moduleName,
			path: pathname,
		}).catch(() => {
			window.sessionStorage.removeItem(storageKey);
		});
	}, [currentBranch?.id, currentBranch?.name, moduleName, pathname]);

	return null;
}

"use client";

import { usePathname } from "next/navigation";

const WorkspaceCompanyManagementRoutePrefix = "/workspace/company-management";

export type WorkspaceCompanyRouteParams = {
	companyId?: string;
	segments: string[];
};

export function useWorkspaceCompanyRouteParams() {
	return getWorkspaceCompanyRouteParams(usePathname());
}

function getWorkspaceCompanyRouteParams(
	pathname: string,
): WorkspaceCompanyRouteParams {
	const routePath = pathname.startsWith(WorkspaceCompanyManagementRoutePrefix)
		? pathname.slice(WorkspaceCompanyManagementRoutePrefix.length)
		: pathname;
	const segments = routePath
		.split("/")
		.filter(Boolean)
		.map((segment) => decodeURIComponent(segment));
	const companyId =
		segments[0] === "edit" || segments[0] === "view"
			? segments[1]
			: undefined;

	return {
		companyId,
		segments,
	};
}

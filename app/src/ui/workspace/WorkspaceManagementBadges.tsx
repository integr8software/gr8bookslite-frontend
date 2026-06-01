import { Building2, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import type {
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function WorkspaceManagementCompanyAvatar({
	initials,
	logoUrl,
	name,
}: {
	initials: string;
	logoUrl?: string;
	name: string;
}) {
	if (logoUrl) {
		return (
			<span
				aria-label={`${name} logo`}
				className="block h-11 w-11 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-darknavy/10"
				style={{ backgroundImage: `url("${logoUrl}")` }}
			/>
		);
	}

	return (
		<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-skyblue/18 text-sm font-bold text-darknavy ring-1 ring-darknavy/10">
			{initials || <Building2 className="h-5 w-5" aria-hidden="true" />}
		</span>
	);
}

export function WorkspaceManagementUserAvatar({
	imageUrl,
	name,
}: {
	imageUrl?: string;
	name: string;
}) {
	if (imageUrl) {
		return (
			<span
				aria-label={`${name} profile`}
				className="block h-10 w-10 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
				style={{ backgroundImage: `url("${imageUrl}")` }}
			/>
		);
	}

	return (
		<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
			<UserCircle className="h-5 w-5" aria-hidden="true" />
		</span>
	);
}

export function WorkspaceManagementStatusBadge({
	status,
}: {
	status: WorkspaceCompanyStatus;
}) {
	const classes = {
		Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
		Inactive: "bg-orange-50 text-orange-700 ring-orange-100",
		Pending: "bg-citron/25 text-darknavy ring-citron/40",
	} satisfies Record<WorkspaceCompanyStatus, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex min-h-7 items-center rounded-md px-3 text-sm font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}

export function WorkspaceManagementPlanBadge({
	plan,
}: {
	plan: WorkspaceCompanyPlan;
}) {
	const classes: Record<string, string> = {
		Accounting:
			"border-l-skyblue bg-white text-darknavy ring-darknavy/10",
		Inventory:
			"border-l-citron bg-white text-darknavy ring-darknavy/10",
		"Accounting + Inventory":
			"border-l-skyblue bg-white text-darknavy ring-darknavy/10",
		"Accounting & Inventory":
			"border-l-skyblue bg-white text-darknavy ring-darknavy/10",
	};

	return (
		<span
			className={joinClasses(
				"inline-flex min-h-8 items-center rounded-md border-l-4 px-3 text-sm font-semibold shadow-sm ring-1",
				classes[plan] ??
					"border-l-darknavy/30 bg-white text-darknavy ring-darknavy/10",
			)}
		>
			{plan}
		</span>
	);
}

export function WorkspaceManagementSummaryBadge({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<span className="inline-flex min-h-7 items-center rounded-md bg-darknavy/5 px-3 text-sm font-semibold text-darknavy/70 ring-1 ring-darknavy/8">
			{children}
		</span>
	);
}

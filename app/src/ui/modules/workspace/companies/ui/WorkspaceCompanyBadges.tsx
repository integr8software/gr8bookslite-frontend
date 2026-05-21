import { Building2, UserCircle } from "lucide-react";
import type {
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function WorkspaceCompanyAvatar({
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
				className="block h-9 w-9 shrink-0 rounded-md bg-cover bg-center ring-1 ring-darknavy/10"
				style={{ backgroundImage: `url("${logoUrl}")` }}
			/>
		);
	}

	return (
		<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-skyblue/18 text-xs font-bold text-darknavy ring-1 ring-darknavy/10">
			{initials || <Building2 className="h-4 w-4" aria-hidden="true" />}
		</span>
	);
}

export function WorkspaceUserAvatar({
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
				className="block h-8 w-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
				style={{ backgroundImage: `url("${imageUrl}")` }}
			/>
		);
	}

	return (
		<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
			<UserCircle className="h-4 w-4" aria-hidden="true" />
		</span>
	);
}

export function WorkspaceStatusBadge({
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
				"inline-flex min-h-6 items-center rounded px-2 text-xs font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}

export function WorkspacePlanBadge({ plan }: { plan: WorkspaceCompanyPlan }) {
	const classes = {
		Accounting: "bg-skyblue/15 text-darknavy ring-skyblue/25",
		Inventory: "bg-citron/25 text-darknavy ring-citron/35",
		"Accounting + Inventory":
			"bg-darknavy text-offwhite ring-darknavy/20",
	} satisfies Record<WorkspaceCompanyPlan, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex min-h-6 items-center rounded px-2 text-xs font-semibold ring-1",
				classes[plan],
			)}
		>
			{plan}
		</span>
	);
}

export function WorkspaceTextBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex min-h-6 items-center rounded bg-darknavy/5 px-2 text-xs font-semibold text-darknavy/70 ring-1 ring-darknavy/8">
			{children}
		</span>
	);
}

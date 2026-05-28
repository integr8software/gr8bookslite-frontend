import { Building2, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import type {
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
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
				"inline-flex min-h-7 items-center rounded-md px-3 text-sm font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}

export function WorkspacePlanBadge({ plan }: { plan: WorkspaceCompanyPlan }) {
	const classes: Record<string, string> = {
		Accounting: "bg-skyblue/15 text-darknavy ring-skyblue/25",
		Inventory: "bg-citron/25 text-darknavy ring-citron/35",
		"Accounting + Inventory":
			"bg-darknavy text-offwhite ring-darknavy/20",
		"Accounting & Inventory":
			"bg-darknavy text-offwhite ring-darknavy/20",
	};

	return (
		<span
			className={joinClasses(
				"inline-flex min-h-7 items-center rounded-md px-3 text-sm font-semibold ring-1",
				classes[plan] ?? "bg-offwhite text-darknavy ring-darknavy/10",
			)}
		>
			{plan}
		</span>
	);
}

export function WorkspaceTextBadge({ children }: { children: ReactNode }) {
	return (
		<span className="inline-flex min-h-7 items-center rounded-md bg-darknavy/5 px-3 text-sm font-semibold text-darknavy/70 ring-1 ring-darknavy/8">
			{children}
		</span>
	);
}

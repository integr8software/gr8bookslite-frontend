import { Building2 } from "lucide-react";
import type {
	MasterSubscriberManagementBranchType,
	MasterSubscriberManagementCompanyStatus,
	MasterSubscriberManagementStatus,
	MasterSubscriberManagementUserStatus,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterSubscriberStatusBadge({
	status,
}: {
	status: MasterSubscriberManagementStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold",
				getStatusClassName(status),
			)}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
			{status}
		</span>
	);
}

export function MasterCompanyStatusBadge({
	status,
}: {
	status: MasterSubscriberManagementCompanyStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-semibold",
				status === "Active"
					? "bg-emerald-500/14 text-emerald-700"
					: "bg-coralpink/12 text-coralpink",
			)}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
			{status}
		</span>
	);
}

export function MasterUserStatusBadge({
	status,
}: {
	status: MasterSubscriberManagementUserStatus;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold",
				status === "Active" && "bg-emerald-500/14 text-emerald-700",
				status === "Inactive" && "bg-coralpink/12 text-coralpink",
				status === "Invited" && "bg-skyblue/14 text-blue-700",
			)}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
			{status}
		</span>
	);
}

export function MasterBranchTypeBadge({
	type,
}: {
	type: MasterSubscriberManagementBranchType;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold",
				type === "Head Office"
					? "bg-skyblue/16 text-blue-700"
					: "bg-emerald-500/14 text-emerald-700",
			)}
		>
			{type}
		</span>
	);
}

export function MasterSubscriberIcon({
	className,
	tone,
}: {
	className?: string;
	tone: "blue" | "cyan" | "orange" | "purple" | "rose" | "slate";
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex shrink-0 items-center justify-center rounded-lg",
				getIconToneClassName(tone),
				className,
			)}
		>
			<Building2 className="h-5 w-5" aria-hidden="true" />
		</span>
	);
}

export function MasterSubscriberInitialsAvatar({
	initials,
	tone,
}: {
	initials: string;
	tone: "blue" | "orange" | "purple" | "rose" | "slate";
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
				getAvatarToneClassName(tone),
			)}
		>
			{initials}
		</span>
	);
}

function getStatusClassName(status: MasterSubscriberManagementStatus) {
	switch (status) {
		case "Active":
			return "bg-emerald-500/14 text-emerald-700";
		case "Suspended":
			return "bg-orange-500/14 text-orange-600";
		case "Inactive":
			return "bg-coralpink/14 text-coralpink";
	}
}

function getIconToneClassName(
	tone: "blue" | "cyan" | "orange" | "purple" | "rose" | "slate",
) {
	switch (tone) {
		case "blue":
			return "bg-skyblue/14 text-blue-700";
		case "cyan":
			return "bg-cyan-500/12 text-cyan-700";
		case "orange":
			return "bg-orange-500/12 text-orange-600";
		case "purple":
			return "bg-purple-500/12 text-purple-700";
		case "rose":
			return "bg-coralpink/12 text-coralpink";
		case "slate":
			return "bg-slate-500/12 text-slate-600";
	}
}

function getAvatarToneClassName(
	tone: "blue" | "orange" | "purple" | "rose" | "slate",
) {
	switch (tone) {
		case "blue":
			return "bg-skyblue/16 text-blue-700";
		case "orange":
			return "bg-orange-500/14 text-orange-700";
		case "purple":
			return "bg-purple-500/14 text-purple-700";
		case "rose":
			return "bg-coralpink/14 text-coralpink";
		case "slate":
			return "bg-slate-500/14 text-slate-700";
	}
}

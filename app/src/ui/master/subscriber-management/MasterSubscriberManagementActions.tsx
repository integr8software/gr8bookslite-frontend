import Link from "next/link";
import {
	CheckCircle2,
	KeyRound,
	type LucideIcon,
	MoreVertical,
	PauseCircle,
	Pencil,
	Trash2,
} from "lucide-react";
import { getMasterSubscriberManagementEditHref } from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterSubscriberManagementMoreActions({
	recordId,
}: {
	recordId: string;
}) {
	return (
		<details className="group relative w-full sm:w-auto">
			<summary
				className={joinClasses(
					"inline-flex h-11 w-full list-none items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)] sm:w-auto",
					"[&::-webkit-details-marker]:hidden",
				)}
			>
				<MoreVertical className="h-4 w-4" aria-hidden="true" />
				More Actions
			</summary>
			<div className="absolute left-0 z-30 mt-2 w-64 max-w-full rounded-lg border border-darknavy/10 bg-white p-2 shadow-[0_24px_70px_rgba(33,39,56,0.16)] sm:left-auto sm:right-0">
				<ActionLink
					href={`${getMasterSubscriberManagementEditHref(recordId)}?from=view`}
					icon={Pencil}
					label="Edit Subscriber"
				/>
				<ActionButton icon={KeyRound} label="Reset Password" />
				<div className="my-2 h-px bg-darknavy/10" />
				<ActionButton
					icon={PauseCircle}
					iconClassName="text-orange-500"
					label="Suspend Subscriber"
				/>
				<ActionButton
					icon={CheckCircle2}
					iconClassName="text-emerald-600"
					label="Activate Subscriber"
				/>
				<div className="my-2 h-px bg-darknavy/10" />
				<ActionButton
					icon={Trash2}
					iconClassName="text-coralpink"
					label="Delete Subscriber"
				/>
			</div>
		</details>
	);
}

function ActionLink({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: LucideIcon;
	label: string;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-darknavy/78 transition hover:bg-skyblue/10 hover:text-darknavy"
		>
			<Icon className="h-4 w-4 text-darknavy/65" aria-hidden="true" />
			{label}
		</Link>
	);
}

function ActionButton({
	icon: Icon,
	iconClassName,
	label,
}: {
	icon: LucideIcon;
	iconClassName?: string;
	label: string;
}) {
	return (
		<button
			type="button"
			className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-darknavy/78 transition hover:bg-skyblue/10 hover:text-darknavy"
		>
			<Icon
				className={joinClasses("h-4 w-4 text-darknavy/65", iconClassName)}
				aria-hidden="true"
			/>
			{label}
		</button>
	);
}

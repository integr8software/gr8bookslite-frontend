import type { LucideIcon } from "lucide-react";
import type { MainCompany } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import { ImageSwatch } from "./ImageSwatch";
import { joinClasses } from "./utils";

type SwitcherButtonProps = {
	description?: string;
	disabled?: boolean;
	icon: LucideIcon;
	imageUrl?: string;
	isActive: boolean;
	label: string;
	status?: MainCompany["status"] | string;
	onClick: () => void;
};

export function SwitcherButton({
	description,
	disabled = false,
	icon: Icon,
	imageUrl,
	isActive,
	label,
	status,
	onClick,
}: SwitcherButtonProps) {
	const isDisabled = disabled && !isActive;

	return (
		<button
			type="button"
			disabled={isDisabled}
			aria-disabled={isDisabled}
			onClick={isDisabled ? undefined : onClick}
			className={joinClasses(
				"flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
				isActive
					? "bg-skyblue/12 text-darknavy ring-1 ring-skyblue/28"
					: isDisabled
						? "cursor-not-allowed opacity-60 hover:bg-transparent"
						: "text-darknavy hover:bg-darknavy/5",
			)}
		>
			<span
				className={joinClasses(
					"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm",
					isActive
						? "bg-skyblue/18 text-darknavy"
						: isDisabled
							? "bg-offwhite/80 text-darknavy/40"
							: "bg-white text-darknavy",
				)}
			>
				{imageUrl ? (
					<ImageSwatch
						imageUrl={imageUrl}
						className="h-5 w-5 rounded"
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
					</ImageSwatch>
				) : (
					<Icon className="h-4 w-4" aria-hidden="true" />
				)}
			</span>
			<span className="min-w-0 flex-1">
				<span
					className={joinClasses(
						"block truncate text-sm font-semibold",
						isDisabled ? "text-darknavy/60" : "text-darknavy",
					)}
				>
					{label}
				</span>
				{description ? (
					<span className="mt-1 block truncate text-xs text-darknavy/50">
						{description}
					</span>
				) : null}
			</span>
			{isActive ? (
				<span className="theme-accent-contrast-text mt-1 inline-flex min-h-6 items-center rounded-full bg-skyblue px-3 text-xs font-semibold">
					Current
				</span>
			) : status ? (
				<span
					className={joinClasses(
						"mt-1 inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold",
						getSwitcherStatusBadgeClass(status),
					)}
				>
					{status}
				</span>
			) : null}
		</button>
	);
}

function getSwitcherStatusBadgeClass(status: string) {
	const normalized = status.toLowerCase();

	if (normalized === "active") {
		return "bg-citron/35 text-darknavy";
	}
	if (normalized === "trialing" || normalized === "trial") {
		return "bg-skyblue/15 text-darknavy";
	}
	if (normalized === "past due" || normalized === "unpaid") {
		return "bg-coralpink/15 text-coralpink";
	}
	if (normalized === "incomplete") {
		return "bg-amber-100 text-amber-800";
	}
	return "bg-darknavy/10 text-darknavy/60";
}


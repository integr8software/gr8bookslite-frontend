"use client";

import {
	createElement,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from "react";
import Link from "next/link";
import {
	CheckCircle2,
	CircleOff,
	Edit3,
	Eye,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTableActionVariant =
	| "active"
	| "delete"
	| "edit"
	| "inactive"
	| "neutral"
	| "view";

type SharedActionProps = {
	icon?: LucideIcon;
	label: string;
	variant?: ModuleTableActionVariant;
};

type ModuleTableActionLinkProps = SharedActionProps &
	Omit<ComponentPropsWithoutRef<typeof Link>, "aria-label" | "children">;

type ModuleTableActionButtonProps = SharedActionProps &
	Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "children">;

export function ModuleTableActions({
	children,
	className,
	...props
}: ComponentPropsWithoutRef<"div"> & {
	children: ReactNode;
}) {
	return (
		<div
			{...props}
			className={joinClasses(
				"flex items-center justify-end gap-1.5",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function ModuleTableActionLink({
	className,
	icon,
	label,
	variant = "neutral",
	...props
}: ModuleTableActionLinkProps) {
	return (
		<Link
			{...props}
			aria-label={label}
			className={joinClasses(getActionClassName(variant), className)}
		>
			{renderActionIcon(variant, icon)}
		</Link>
	);
}

export function ModuleTableActionButton({
	className,
	icon,
	label,
	type = "button",
	variant = "neutral",
	...props
}: ModuleTableActionButtonProps) {
	return (
		<button
			{...props}
			type={type}
			aria-label={label}
			className={joinClasses(getActionClassName(variant), className)}
		>
			{renderActionIcon(variant, icon)}
		</button>
	);
}

function renderActionIcon(
	variant: ModuleTableActionVariant,
	icon?: LucideIcon,
) {
	if (icon) {
		return createElement(icon, {
			"aria-hidden": true,
			className: "h-4 w-4",
		});
	}

	switch (variant) {
		case "active":
			return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
		case "delete":
			return <Trash2 className="h-4 w-4" aria-hidden="true" />;
		case "edit":
			return <Edit3 className="h-4 w-4" aria-hidden="true" />;
		case "inactive":
			return <CircleOff className="h-4 w-4" aria-hidden="true" />;
		case "view":
			return <Eye className="h-4 w-4" aria-hidden="true" />;
		default:
			return <Eye className="h-4 w-4" aria-hidden="true" />;
	}
}

function getActionClassName(variant: ModuleTableActionVariant) {
	const baseClassName =
		"inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white";

	switch (variant) {
		case "active":
			return `${baseClassName} border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/25`;
		case "delete":
		case "inactive":
			return `${baseClassName} border-coralpink/30 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/30`;
		case "edit":
		case "neutral":
		case "view":
		default:
			return `${baseClassName} border-darknavy/10 text-darknavy/70 hover:bg-skyblue/10 hover:text-skyblue focus-visible:ring-skyblue/35`;
	}
}

"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
	AccountTypeBadgeVariants,
	BadgeVariantClasses,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

export function Card({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={joinClasses(
				"rounded-xl border border-darknavy/10 bg-white shadow-sm shadow-darknavy/8",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function Button({
	children,
	className,
	size = "default",
	variant = "primary",
	...props
}: ComponentProps<"button"> & {
	size?: "default" | "icon";
	variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
	return (
		<button
			type="button"
			className={joinClasses(
				"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-45",
				size === "icon" ? "h-9 w-9" : "h-10 px-4",
				variant === "primary" &&
					"bg-skyblue text-white shadow-sm shadow-skyblue/20 hover:opacity-90 focus-visible:ring-skyblue/20",
				variant === "secondary" &&
					"border border-darknavy/10 bg-white text-darknavy/70 hover:bg-skyblue/10 hover:text-darknavy focus-visible:ring-skyblue/15",
				variant === "ghost" &&
					"text-darknavy/60 hover:bg-skyblue/10 hover:text-darknavy focus-visible:ring-skyblue/15",
				variant === "danger" &&
					"text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export function Input({ className, ...props }: ComponentProps<"input">) {
	return (
		<input
			className={joinClasses(
				"h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
				className,
			)}
			{...props}
		/>
	);
}

export function Select({
	children,
	className,
	...props
}: ComponentProps<"select">) {
	return (
		<div className="relative">
			<select
				className={joinClasses(
					"h-10 w-full appearance-none rounded-lg border border-darknavy/10 bg-white px-3 pr-9 text-sm font-medium text-darknavy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDown
				className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
				aria-hidden="true"
			/>
		</div>
	);
}

export function Field({
	children,
	className,
	error,
	label,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
}) {
	return (
		<label className={joinClasses("grid gap-1.5", className)}>
			<span className="flex items-center justify-between text-sm font-semibold text-darknavy/70">
				{label}
				{error ? <span className="text-xs text-red-500">{error}</span> : null}
			</span>
			{children}
		</label>
	);
}

export function TypeBadge({ type }: { type: ChartAccount["accountType"] }) {
	return <Badge variant={AccountTypeBadgeVariants[type]}>{type}</Badge>;
}

export function Badge({
	children,
	variant = "gray",
}: {
	children: ReactNode;
	variant?: "blue" | "green" | "gray" | "amber" | "violet" | "rose";
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
				BadgeVariantClasses[variant],
			)}
		>
			{children}
		</span>
	);
}

export function Tabs<TValue extends string>({
	onChange,
	options,
	value,
}: {
	onChange: (value: TValue) => void;
	options: TValue[];
	value: TValue;
}) {
	return (
		<div className="flex gap-1 overflow-x-auto rounded-lg bg-darknavy/5 p-1">
			{options.map((option) => (
				<button
					key={option}
					type="button"
					onClick={() => onChange(option)}
					className={joinClasses(
						"relative whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition",
						value === option
							? "text-skyblue"
							: "text-darknavy/55 hover:text-darknavy",
					)}
				>
					{value === option ? (
						<motion.span
							layoutId={`tab-indicator-${options.join("-")}`}
							className="absolute inset-0 rounded-md bg-white shadow-sm"
							transition={{ type: "spring", damping: 28, stiffness: 320 }}
						/>
					) : null}
					<span className="relative">{option}</span>
				</button>
			))}
		</div>
	);
}

export function joinClasses(...classes: Array<string | undefined | false>) {
	return classes.filter(Boolean).join(" ");
}

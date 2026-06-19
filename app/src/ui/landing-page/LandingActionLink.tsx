"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const MotionLink = motion.create(Link);

const PrimaryActionStyles = {
	light:
		"bg-darknavy text-white shadow-[0_10px_28px_rgba(33,39,56,0.18)] hover:bg-sky-700",
	dark:
		"bg-white text-darknavy shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:bg-sky-700 hover:text-white",
} as const;

const ActionLinkStyles = {
	secondary:
		"border border-darknavy/10 bg-white text-darknavy shadow-[0_10px_28px_rgba(33,39,56,0.10)] hover:border-skyblue hover:bg-[#f2f8fc]",
	navigation:
		"relative text-darknavy/65 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-skyblue after:transition-transform hover:text-darknavy hover:after:scale-x-100",
} as const;

export type LandingActionLinkProps = Readonly<{
	children: ReactNode;
	href: string;
	variant?: "primary" | keyof typeof ActionLinkStyles;
	surface?: keyof typeof PrimaryActionStyles;
	fullWidth?: boolean;
	showArrow?: boolean;
	transitionType?: "auth-forward" | "auth-back";
}>;

export function LandingActionLink({
	children,
	href,
	variant = "primary",
	surface = "light",
	fullWidth = false,
	showArrow = false,
	transitionType,
}: LandingActionLinkProps) {
	const variantClassName =
		variant === "primary"
			? PrimaryActionStyles[surface]
			: ActionLinkStyles[variant];
	const layoutClassName =
		variant === "navigation"
			? "inline-flex items-center px-2 py-2 text-xs font-semibold"
			: "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold focus-visible:ring-4 focus-visible:ring-skyblue/30";

	return (
		<MotionLink
			href={href}
			transitionTypes={transitionType ? [transitionType] : undefined}
			whileTap={{ scale: 0.96, y: 1 }}
			transition={{ type: "spring", stiffness: 500, damping: 30 }}
			className={`${layoutClassName} transition focus-visible:outline-none ${variantClassName} ${
				fullWidth ? "w-full" : ""
			}`}
		>
			{children}
			{showArrow ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
		</MotionLink>
	);
}

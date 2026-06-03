"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleDrawerPosition = "bottom" | "left" | "right" | "top";

type ModuleDrawerProps = {
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	description?: ReactNode;
	eyebrow?: ReactNode;
	footer?: ReactNode;
	isOpen: boolean;
	maxWidthClassName?: string;
	onClose: () => void;
	position?: ModuleDrawerPosition;
	showCloseButton?: boolean;
	spotlightId?: string;
	title: ReactNode;
};

const drawerPositionStyles: Record<
	ModuleDrawerPosition,
	{
		className: string;
		initial: { x?: string; y?: string };
		shadowClassName: string;
	}
> = {
	bottom: {
		className: "bottom-0 left-0 right-0 max-h-[85dvh] w-full rounded-t-2xl",
		initial: { y: "100%" },
		shadowClassName: "shadow-[0_-30px_70px_rgba(15,23,42,0.22)]",
	},
	left: {
		className: "bottom-0 left-0 top-0 w-full",
		initial: { x: "-100%" },
		shadowClassName: "shadow-[30px_0_70px_rgba(15,23,42,0.22)]",
	},
	right: {
		className: "bottom-0 right-0 top-0 w-full",
		initial: { x: "100%" },
		shadowClassName: "shadow-[-30px_0_70px_rgba(15,23,42,0.22)]",
	},
	top: {
		className: "left-0 right-0 top-0 max-h-[85dvh] w-full rounded-b-2xl",
		initial: { y: "-100%" },
		shadowClassName: "shadow-[0_30px_70px_rgba(15,23,42,0.22)]",
	},
};

export function ModuleDrawer({
	actions,
	children,
	className,
	description,
	eyebrow,
	footer,
	isOpen,
	maxWidthClassName = "max-w-2xl",
	onClose,
	position = "right",
	showCloseButton = true,
	spotlightId,
	title,
}: ModuleDrawerProps) {
	const positionStyles = drawerPositionStyles[position];
	const sizeClassName =
		position === "left" || position === "right" ? maxWidthClassName : "";

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<motion.button
						type="button"
						aria-label="Close drawer overlay"
						className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>
					<motion.aside
						role="dialog"
						aria-modal="true"
						data-spotlight-id={spotlightId}
						aria-label={
							typeof title === "string" ? title : "Module drawer"
						}
						className={joinClasses(
							"fixed z-60 flex flex-col bg-white",
							positionStyles.className,
							positionStyles.shadowClassName,
							sizeClassName,
							className,
						)}
						initial={positionStyles.initial}
						animate={{ x: 0, y: 0 }}
						exit={positionStyles.initial}
						transition={{
							type: "spring",
							damping: 32,
							stiffness: 260,
						}}
					>
						<ModuleDrawerHeader
							description={description}
							eyebrow={eyebrow}
							actions={actions}
							onClose={onClose}
							showCloseButton={showCloseButton}
							title={title}
						/>
						<div className="min-h-0 flex-1 overflow-y-auto">
							{children}
						</div>
						{footer ? (
							<div className="sticky bottom-0 border-t border-darknavy/10 bg-white px-6 py-4">
								{footer}
							</div>
						) : null}
					</motion.aside>
				</>
			) : null}
		</AnimatePresence>
	);
}

function ModuleDrawerHeader({
	actions,
	description,
	eyebrow,
	onClose,
	showCloseButton,
	title,
}: Pick<
	ModuleDrawerProps,
	| "actions"
	| "description"
	| "eyebrow"
	| "onClose"
	| "showCloseButton"
	| "title"
>) {
	return (
		<div className="flex flex-col gap-4 border-b border-darknavy/10 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
			<div>
				{eyebrow ? (
					<p
						className={joinClasses(
							"text-xs font-semibold uppercase tracking-wide",
							moduleAccentClassNames.iconText,
						)}
					>
						{eyebrow}
					</p>
				) : null}
				<h2 className="mt-1 text-xl font-semibold text-darknavy">
					{title}
				</h2>
				{description ? (
					<p className="mt-1 text-sm text-darknavy/55">
						{description}
					</p>
				) : null}
			</div>
			<div className="flex items-center gap-2 sm:justify-end">
				{actions}
				{showCloseButton ? (
					<button
						type="button"
						aria-label="Close drawer"
						onClick={onClose}
						className={joinClasses(
							"inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4",
							moduleAccentClassNames.hoverSoftBackground,
							moduleAccentClassNames.focusRing,
						)}
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				) : null}
			</div>
		</div>
	);
}

"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleDrawerProps = {
	actions?: ReactNode;
	children: ReactNode;
	description?: ReactNode;
	eyebrow?: ReactNode;
	footer?: ReactNode;
	isOpen: boolean;
	maxWidthClassName?: string;
	onClose: () => void;
	title: ReactNode;
};

export function ModuleDrawer({
	actions,
	children,
	description,
	eyebrow,
	footer,
	isOpen,
	maxWidthClassName = "max-w-2xl",
	onClose,
	title,
}: ModuleDrawerProps) {
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
						aria-label={typeof title === "string" ? title : "Module drawer"}
						className={joinClasses(
							"fixed bottom-0 right-0 top-0 z-[60] flex w-full flex-col bg-white shadow-[-30px_0_70px_rgba(15,23,42,0.22)]",
							maxWidthClassName,
						)}
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 32, stiffness: 260 }}
					>
						<ModuleDrawerHeader
							description={description}
							eyebrow={eyebrow}
							actions={actions}
							onClose={onClose}
							title={title}
						/>
						<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
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
	title,
}: Pick<
	ModuleDrawerProps,
	"actions" | "description" | "eyebrow" | "onClose" | "title"
>) {
	return (
		<div className="flex flex-col gap-4 border-b border-darknavy/10 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
			<div>
				{eyebrow ? (
					<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
						{eyebrow}
					</p>
				) : null}
				<h2 className="mt-1 text-xl font-semibold text-darknavy">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm text-darknavy/55">{description}</p>
				) : null}
			</div>
			<div className="flex items-center gap-2 sm:justify-end">
				{actions}
				<button
					type="button"
					aria-label="Close drawer"
					onClick={onClose}
					className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<X className="h-5 w-5" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

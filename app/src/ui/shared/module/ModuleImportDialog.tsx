"use client";

import { useState, type ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleImportDialogProps = {
	actions?: ReactNode;
	children: ReactNode;
	description: ReactNode;
	footer: ReactNode;
	isBusy?: boolean;
	isOpen: boolean;
	progress?: ReactNode;
	title: string;
	titleId: string;
	onClose: () => void;
};

export function ModuleImportDialog({
	actions,
	children,
	description,
	footer,
	isBusy = false,
	isOpen,
	progress,
	title,
	titleId,
	onClose,
}: ModuleImportDialogProps) {
	const [isMaximized, setIsMaximized] = useState(false);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-140 flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !isBusy) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={joinClasses(
					"flex w-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)] [@media(max-height:640px)]:overflow-y-auto",
					isMaximized
						? "h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)]"
						: "h-[calc(100dvh-2rem)] max-h-[52rem] max-w-6xl",
				)}
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-darknavy/10 px-3 py-3 sm:px-5 sm:py-4">
					<div className="min-w-0">
						<h2 id={titleId} className="text-lg font-semibold text-darknavy">
							{title}
						</h2>
						<p className="mt-1 text-sm text-darknavy/55">{description}</p>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<button
							type="button"
							onClick={() => setIsMaximized((current) => !current)}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
							aria-label={isMaximized ? "Minimize import modal" : "Maximize import modal"}
						>
							{isMaximized ? (
								<Minimize2 className="h-5 w-5" aria-hidden="true" />
							) : (
								<Maximize2 className="h-5 w-5" aria-hidden="true" />
							)}
						</button>
						<button
							type="button"
							onClick={onClose}
							disabled={isBusy}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
							aria-label={`Close ${title.toLowerCase()}`}
						>
							<X className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
				</div>
				{actions ? (
					<div className="shrink-0 border-b border-darknavy/10 bg-darknavy/[0.015] px-3 py-3 sm:px-5 sm:py-4">
						{actions}
					</div>
				) : null}
				{progress ? <div className="shrink-0 px-5 pt-4">{progress}</div> : null}
				<div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-5 sm:py-4 [@media(max-height:640px)]:min-h-64 [@media(max-height:640px)]:flex-none [@media(max-height:640px)]:overflow-visible">{children}</div>
				<div className="shrink-0 border-t border-darknavy/10 px-3 py-3 sm:px-5 sm:py-4">{footer}</div>
			</section>
		</div>
	);
}

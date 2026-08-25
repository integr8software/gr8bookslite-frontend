"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Save, X } from "lucide-react";
import {
	AnimatedPendingLabel,
	AppDialog,
} from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleDrawerPosition = "bottom" | "left" | "right" | "top";

export const ModuleSavingLabel = "Saving...";
export const ModuleUpdatingLabel = "Updating...";

export function getModuleSavePendingLabel(mode?: string | null) {
	return mode === "edit" ? ModuleUpdatingLabel : ModuleSavingLabel;
}

type ModuleDrawerProps = {
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	contentClassName?: string;
	description?: ReactNode;
	eyebrow?: ReactNode;
	formId?: string;
	footer?: ReactNode;
	isOpen: boolean;
	isReadonly?: boolean;
	isSaving?: boolean;
	maxWidthClassName?: string;
	onBeforeSaveConfirm?: () => boolean;
	onCancel?: () => void;
	onClose: () => void;
	position?: ModuleDrawerPosition;
	savingLabel?: string;
	showCloseButton?: boolean;
	spotlightId?: string;
	spotlightFieldsId?: string;
	spotlightSaveId?: string;
	submitLabel?: string;
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
	contentClassName,
	description,
	eyebrow,
	formId,
	footer,
	isOpen,
	isReadonly = false,
	isSaving = false,
	maxWidthClassName = "max-w-2xl",
	onBeforeSaveConfirm,
	onCancel,
	onClose,
	position = "right",
	savingLabel = ModuleSavingLabel,
	showCloseButton = true,
	spotlightId,
	spotlightFieldsId,
	spotlightSaveId,
	submitLabel = "Save",
	title,
}: ModuleDrawerProps) {
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: formId ?? "",
		isContainerOpen: isOpen,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: isSaving,
		onDialogOpenChange: setIsSaveDialogOpen,
	});
	const positionStyles = drawerPositionStyles[position];
	const sizeClassName =
		position === "left" || position === "right" ? maxWidthClassName : "";
	const hasManagedFormFooter = Boolean(formId);
	const handleClose = useCallback(() => {
		if (!isSaving) {
			onClose();
		}
	}, [isSaving, onClose]);
	const handleCancel = useCallback(() => {
		if (!isSaving) {
			(onCancel ?? onClose)();
		}
	}, [isSaving, onCancel, onClose]);
	const handleSaveRequest = useCallback(() => {
		if (isSaving || !formId) {
			return;
		}

		if (onBeforeSaveConfirm && !onBeforeSaveConfirm()) {
			return;
		}

		setIsSaveDialogOpen(true);
	}, [formId, isSaving, onBeforeSaveConfirm]);
	const resolvedFooter = footer ?? (hasManagedFormFooter ? (
		<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button
				type="button"
				onClick={isReadonly ? handleClose : handleCancel}
				disabled={isSaving}
				className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
			>
				{isReadonly ? "Close" : "Cancel"}
			</button>
			{isReadonly ? null : (
				<button
					type="button"
					onClick={handleSaveRequest}
					data-spotlight-id={spotlightSaveId}
					disabled={isSaving}
					className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
				>
					{isSaving ? (
						<LoaderCircle
							className="h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
					) : (
						<Save className="h-4 w-4" aria-hidden="true" />
					)}
					{isSaving ? (
						<AnimatedPendingLabel label={savingLabel} />
					) : (
						submitLabel
					)}
				</button>
			)}
		</div>
	) : undefined);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape" && !isModalDialogOpen()) {
				handleClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleClose, isOpen]);

	return (
		<>
			<AnimatePresence>
				{isOpen ? (
					<>
					<motion.button
						type="button"
						aria-label="Close drawer overlay"
						className="fixed inset-0 z-60 bg-slate-950/35 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
					/>
					<motion.aside
						role="dialog"
						aria-modal="true"
						data-module-drawer="true"
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
							onClose={handleClose}
							showCloseButton={showCloseButton}
							title={title}
						/>
						<div
							className={joinClasses(
								"min-h-0 flex-1 overflow-y-auto",
								contentClassName,
							)}
						>
							{spotlightFieldsId ? (
								<div data-spotlight-id={spotlightFieldsId}>
									{children}
								</div>
							) : (
								children
							)}
						</div>
						{resolvedFooter ? (
							<div className="sticky bottom-0 border-t border-darknavy/10 bg-white px-6 py-4">
								{resolvedFooter}
							</div>
						) : null}
					</motion.aside>
				</>
				) : null}
			</AnimatePresence>
			{formId ? (
				<AppDialog
					confirmLabel="Confirm"
					description="This will save the details entered in this module form."
					iconTone="question"
					isOpen={isSaveDialogOpen}
					isPending={isConfirmSubmitPending}
					pendingLabel={savingLabel}
					title={`${submitLabel}?`}
					tone="success"
					onCancel={closeSaveDialog}
					onConfirm={submitFromDialog}
				/>
			) : null}
		</>
	);
}

function isModalDialogOpen() {
	return Boolean(
		document.querySelector(
			'[role="dialog"][aria-modal="true"]:not([data-module-drawer="true"]), [role="alertdialog"][aria-modal="true"]',
		),
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

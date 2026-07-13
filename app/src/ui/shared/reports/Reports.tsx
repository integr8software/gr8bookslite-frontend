"use client";

import type { ReactNode } from "react";
import { ChevronDown, FileText, Printer } from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ReportPreviewActionProps = {
	label?: string;
	onPreview: () => void;
};

export function ReportPreviewAction({
	label = "Preview",
	onPreview,
}: ReportPreviewActionProps) {
	return (
		<button
			type="button"
			onClick={onPreview}
			className={moduleHeaderActionClassNames.secondary}
		>
			<FileText className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

type ReportPrintActionProps = {
	label?: string;
	onPrint: () => void;
};

export function ReportPrintAction({
	label = "Print",
	onPrint,
}: ReportPrintActionProps) {
	return (
		<button
			type="button"
			onClick={onPrint}
			className={moduleHeaderActionClassNames.secondary}
		>
			<Printer className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

type ReportPreviewDrawerProps = {
	children: ReactNode;
	className?: string;
	description?: ReactNode;
	eyebrow?: ReactNode;
	isOpen: boolean;
	maxWidthClassName?: string;
	onClose: () => void;
	onPrint?: () => void;
	printLabel?: string;
	title?: ReactNode;
};

export function ReportPreviewDrawer({
	children,
	className,
	description = "Review the printable report layout.",
	eyebrow = "Report",
	isOpen,
	maxWidthClassName = "max-w-6xl",
	onClose,
	onPrint,
	printLabel,
	title = "Print Preview",
}: ReportPreviewDrawerProps) {
	return (
		<ModuleDrawer
			className={className}
			isOpen={isOpen}
			eyebrow={eyebrow}
			title={title}
			description={description}
			maxWidthClassName={maxWidthClassName}
			onClose={onClose}
			position="bottom"
			showCloseButton={false}
			actions={
				onPrint ? (
					<ReportPrintAction label={printLabel} onPrint={onPrint} />
				) : null
			}
		>
			<button
				type="button"
				onClick={onClose}
				aria-label="Close print preview"
				className="absolute left-1/2 top-0 z-10 inline-flex h-10 w-28 -translate-x-1/2 items-center justify-center rounded-b-lg border border-t-0 border-darknavy/10 bg-white text-darknavy shadow-[0_-8px_28px_rgba(33,39,56,0.08)] transition hover:border-skyblue/35 hover:bg-skyblue/30"
			>
				<ChevronDown className="h-5 w-5" aria-hidden="true" />
			</button>
			<div className="p-6">{children}</div>
		</ModuleDrawer>
	);
}

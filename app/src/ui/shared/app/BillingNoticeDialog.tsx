"use client";

import type { ReactNode } from "react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export type BillingNoticeTargetType =
	| "company"
	| "user"
	| "branch"
	| "satellite"
	| "company_access"
	| "custom";

export type BillingNoticeDialogProps = {
	cancelLabel?: string;
	confirmLabel?: string;
	confirmationPhrase?: string;
	content?: ReactNode;
	description?: string;
	isOpen: boolean;
	isPending?: boolean;
	pendingLabel?: string;
	targetName?: string;
	targetType?: BillingNoticeTargetType;
	title?: string;
	onCancel: () => void;
	onConfirm: () => void | Promise<void>;
};

export function BillingNoticeDialog({
	cancelLabel = "Cancel",
	confirmLabel,
	confirmationPhrase,
	content,
	description,
	isOpen,
	isPending = false,
	pendingLabel = "Saving...",
	targetName,
	targetType = "custom",
	title,
	onCancel,
	onConfirm,
}: BillingNoticeDialogProps) {
	const resolvedTitle = title ?? getBillingNoticeTitle(targetType);
	const resolvedDescription =
		description ?? getBillingNoticeDescription(targetType, targetName);
	const resolvedConfirmationPhrase =
		confirmationPhrase !== undefined
			? confirmationPhrase
			: getBillingNoticeConfirmationPhrase(targetType);
	const resolvedConfirmLabel =
		confirmLabel ?? getBillingNoticeConfirmLabel(targetType);

	return (
		<AppDialog
			isOpen={isOpen}
			isPending={isPending}
			title={resolvedTitle}
			description={resolvedDescription}
			confirmationPhrase={resolvedConfirmationPhrase}
			confirmLabel={resolvedConfirmLabel}
			pendingLabel={pendingLabel}
			cancelLabel={cancelLabel}
			content={content}
			tone="default"
			onCancel={onCancel}
			onConfirm={onConfirm}
		/>
	);
}

function getBillingNoticeTitle(targetType: BillingNoticeTargetType): string {
	switch (targetType) {
		case "company":
			return "Create company?";
		case "user":
			return "Create user?";
		case "branch":
			return "Create branch?";
		case "satellite":
			return "Create satellite?";
		case "company_access":
			return "Add company access?";
		default:
			return "Confirm action?";
	}
}

function getBillingNoticeDescription(
	targetType: BillingNoticeTargetType,
	targetName?: string,
): string {
	const subject = targetName?.trim()
		? targetName.trim()
		: `this ${targetType.replace("_", " ")}`;

	switch (targetType) {
		case "company":
			return `Creating ${subject} may affect workspace billing, payments, or deductions. Type confirm add company before saving.`;
		case "user":
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add user before saving.`;
		case "branch":
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add branch before saving.`;
		case "satellite":
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add satellite before saving.`;
		case "company_access":
			return "Adding this user to another company may affect billing, including user access costs, payments, or deductions. Confirm before adding the company assignment.";
		default:
			return `This action for ${subject} may affect workspace billing, payments, or deductions.`;
	}
}

function getBillingNoticeConfirmationPhrase(
	targetType: BillingNoticeTargetType,
): string | undefined {
	switch (targetType) {
		case "company":
			return "confirm add company";
		case "user":
			return "confirm add user";
		case "branch":
			return "confirm add branch";
		case "satellite":
			return "confirm add satellite";
		case "company_access":
			return undefined;
		default:
			return undefined;
	}
}

function getBillingNoticeConfirmLabel(
	targetType: BillingNoticeTargetType,
): string {
	switch (targetType) {
		case "company":
			return "Save Company";
		case "user":
			return "Save User";
		case "branch":
			return "Save Branch";
		case "satellite":
			return "Save Satellite";
		case "company_access":
			return "Confirm Add";
		default:
			return "Confirm";
	}
}

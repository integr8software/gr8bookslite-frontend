"use client";

import type { ReactNode } from "react";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

const BillingNoticeTargetTypes = {
	Branch: "branch",
	Company: "company",
	CompanyAccess: "company_access",
	Custom: "custom",
	Satellite: "satellite",
	User: "user",
} as const;

export type BillingNoticeTargetType =
	(typeof BillingNoticeTargetTypes)[keyof typeof BillingNoticeTargetTypes];

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
	targetType = BillingNoticeTargetTypes.Custom,
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
		case BillingNoticeTargetTypes.Company:
			return "Create company?";
		case BillingNoticeTargetTypes.User:
			return "Create user?";
		case BillingNoticeTargetTypes.Branch:
			return "Create branch?";
		case BillingNoticeTargetTypes.Satellite:
			return "Create satellite?";
		case BillingNoticeTargetTypes.CompanyAccess:
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
		case BillingNoticeTargetTypes.Company:
			return `Creating ${subject} may affect workspace billing, payments, or deductions. Type confirm add company before saving.`;
		case BillingNoticeTargetTypes.User:
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add user before saving.`;
		case BillingNoticeTargetTypes.Branch:
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add branch before saving.`;
		case BillingNoticeTargetTypes.Satellite:
			return `Adding ${subject} may affect workspace billing, payments, or deductions. Type confirm add satellite before saving.`;
		case BillingNoticeTargetTypes.CompanyAccess:
			return "Adding this user to another company may affect billing, including user access costs, payments, or deductions. Confirm before adding the company assignment.";
		default:
			return `This action for ${subject} may affect workspace billing, payments, or deductions.`;
	}
}

function getBillingNoticeConfirmationPhrase(
	targetType: BillingNoticeTargetType,
): string | undefined {
	switch (targetType) {
		case BillingNoticeTargetTypes.Company:
			return "confirm add company";
		case BillingNoticeTargetTypes.User:
			return "confirm add user";
		case BillingNoticeTargetTypes.Branch:
			return "confirm add branch";
		case BillingNoticeTargetTypes.Satellite:
			return "confirm add satellite";
		case BillingNoticeTargetTypes.CompanyAccess:
			return undefined;
		default:
			return undefined;
	}
}

function getBillingNoticeConfirmLabel(
	targetType: BillingNoticeTargetType,
): string {
	switch (targetType) {
		case BillingNoticeTargetTypes.Company:
			return "Save Company";
		case BillingNoticeTargetTypes.User:
			return "Save User";
		case BillingNoticeTargetTypes.Branch:
			return "Save Branch";
		case BillingNoticeTargetTypes.Satellite:
			return "Save Satellite";
		case BillingNoticeTargetTypes.CompanyAccess:
			return "Confirm Add";
		default:
			return "Confirm";
	}
}

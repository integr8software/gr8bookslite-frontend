"use client";

import Link from "next/link";
import { useState } from "react";
import {
	ArrowLeft,
	Ban,
	CreditCard,
	ThumbsDown,
	ThumbsUp,
	Undo2,
} from "lucide-react";
import {
	PettyCashVoucherActionButtonClassNames,
	PettyCashVoucherHref,
	canApprovePettyCashVoucherStatus,
	canCancelPettyCashVoucherStatus,
	canDisapprovePettyCashVoucherStatus,
	getPettyCashVoucherStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type { PettyCashVoucherStatus } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { PettyCashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHistory";

type PettyCashVoucherConfirmation =
	| { action: "submit" | "draft" }
	| { action: "status"; status: PettyCashVoucherStatus };

export function PettyCashVoucherActionHeader({
	page,
}: {
	page: PettyCashVoucherActionPageState;
}) {
	const [confirmation, setConfirmation] = useState<PettyCashVoucherConfirmation | null>(null);
	const recordLabel = page.values.transactionNo || "this petty cash voucher";
	const dialogCopy = confirmation
		? confirmation.action === "status"
			? getPettyCashVoucherStatusDialogCopy(confirmation.status, recordLabel)
			: getSaveDialogCopy(confirmation.action, page.mode, recordLabel)
		: null;

	return (
		<>
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={getActionTitle(page)}
				description={getActionDescription(page.mode)}
				actionsClassName="items-center justify-end gap-2"
				eyebrow={<PettyCashVoucherHeaderEyebrow />}
				actions={
					<PettyCashVoucherHeaderActions
						page={page}
						onRequestConfirmation={setConfirmation}
					/>
				}
			/>
			{dialogCopy && confirmation ? (
				<AppDialog
					isOpen
					cancelLabel={confirmation.action === "status" ? "Keep Current Status" : "Continue Editing"}
					confirmLabel={dialogCopy.confirmLabel}
					description={dialogCopy.description}
					iconTone={dialogCopy.iconTone}
					pendingLabel={dialogCopy.pendingLabel}
					title={dialogCopy.title}
					tone={dialogCopy.tone}
					onCancel={() => setConfirmation(null)}
					onConfirm={() => {
						const succeeded = runConfirmedAction(page, confirmation);

						if (succeeded !== false) {
							setConfirmation(null);
						}
					}}
				/>
			) : null}
		</>
	);
}

function PettyCashVoucherHeaderEyebrow() {
	return (
		<span className="contents">
			<CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
			Cash disbursement
		</span>
	);
}

function PettyCashVoucherHeaderActions({
	onRequestConfirmation,
	page,
}: {
	onRequestConfirmation: (confirmation: PettyCashVoucherConfirmation) => void;
	page: PettyCashVoucherActionPageState;
}) {
	return (
		<span className="contents">
			<Link
				href={PettyCashVoucherHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			<ReportPreviewAction onPreview={() => undefined} />
			{page.mode === "view" ? (
				<PettyCashVoucherActionHistory page={page} />
			) : null}
			{page.mode !== "add" ? (
				<PettyCashVoucherStatusActions
					status={page.values.status}
					onRequestStatus={(status) => onRequestConfirmation({ action: "status", status })}
				/>
			) : null}
			{page.isReadonly ? null : (
				<ModuleSaveButton
					onSave={() => onRequestConfirmation({ action: "submit" })}
					menuItems={
						page.mode === "add"
							? [
									{
										label: "Save As Draft",
										onSelect: () => onRequestConfirmation({ action: "draft" }),
									},
								]
							: []
					}
				/>
			)}
		</span>
	);
}

function PettyCashVoucherStatusActions({
	status,
	onRequestStatus,
}: {
	status: PettyCashVoucherActionPageState["values"]["status"];
	onRequestStatus: (status: PettyCashVoucherStatus) => void;
}) {
	const isPosted = status === "Posted";
	const isDisapproved = status === "Disapproved";
	const isCancelled = status === "Cancelled";

	return (
		<span className="contents">
			<button
				type="button"
				disabled={!canApprovePettyCashVoucherStatus(status)}
				onClick={() => onRequestStatus(isPosted ? "For Approval" : "Posted")}
				className={PettyCashVoucherActionButtonClassNames.approve}
			>
				{isPosted ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <ThumbsUp className="h-4 w-4" aria-hidden="true" />}
				{isPosted ? "Undo Approved" : "Approve"}
			</button>
			<button
				type="button"
				disabled={!canDisapprovePettyCashVoucherStatus(status)}
				onClick={() => onRequestStatus(isDisapproved ? "For Approval" : "Disapproved")}
				className={PettyCashVoucherActionButtonClassNames.disapprove}
			>
				{isDisapproved ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <ThumbsDown className="h-4 w-4" aria-hidden="true" />}
				{isDisapproved ? "Undo Disapproved" : "Disapprove"}
			</button>
			<button
				type="button"
				disabled={!canCancelPettyCashVoucherStatus(status)}
				onClick={() => onRequestStatus(isCancelled ? "For Approval" : "Cancelled")}
				className={PettyCashVoucherActionButtonClassNames.cancel}
			>
				{isCancelled ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
				{isCancelled ? "Undo Cancelled" : "Cancel"}
			</button>
		</span>
	);
}

function runConfirmedAction(
	page: PettyCashVoucherActionPageState,
	confirmation: PettyCashVoucherConfirmation,
) {
	if (confirmation.action === "status") {
		return page.handleUpdateStatus(confirmation.status);
	}

	if (confirmation.action === "submit") {
		return page.handleSubmit();
	}

	return page.handleSaveAsDraft();
}

function getSaveDialogCopy(
	action: "submit" | "draft",
	mode: PettyCashVoucherActionPageState["mode"],
	recordLabel: string,
) {
	if (action === "draft") {
		return {
			confirmLabel: "Save as Draft",
			description: `This will save the current information for ${recordLabel} without submitting it for approval.`,
			iconTone: false as const,
			pendingLabel: "Saving...",
			title: "Save petty cash voucher as draft?",
			tone: "default" as const,
		};
	}

	return {
		confirmLabel: mode === "edit" ? "Update and Submit" : "Submit Voucher",
		description: `This will save ${recordLabel} and submit it for approval.`,
		iconTone: "approve" as const,
		pendingLabel: mode === "edit" ? "Updating..." : "Submitting...",
		title: mode === "edit" ? "Update petty cash voucher?" : "Submit petty cash voucher?",
		tone: "success" as const,
	};
}

function getActionTitle(page: PettyCashVoucherActionPageState) {
	const voucherNo = page.existingVoucher?.voucherNo;

	if (page.mode === "view") {
		return voucherNo
			? `View Petty Cash Voucher | ${voucherNo}`
			: "View Petty Cash Voucher";
	}

	if (page.mode === "edit") {
		return voucherNo
			? `Edit Petty Cash Voucher | ${voucherNo}`
			: "Edit Petty Cash Voucher";
	}

	return "Add Petty Cash Voucher";
}

function getActionDescription(mode: "add" | "edit" | "view") {
	if (mode === "view") {
		return "Review the voucher details and supporting attachments.";
	}

	return "Complete the voucher header on one page before saving.";
}

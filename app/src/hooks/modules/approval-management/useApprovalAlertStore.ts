"use client";

import { create } from "zustand";
import type { ApprovalTransactionApiRecord } from "@/app/src/services/modules/approval-management/ApprovalManagementApi";

export type ApprovalManagementTab = "approver-setup" | "approval-rules";

type ApprovalAlertState = {
	activeTab: ApprovalManagementTab;
	pendingApprovalCount: number;
	setActiveTab: (activeTab: ApprovalManagementTab) => void;
	setApprovalTransactions: (
		transactions: ApprovalTransactionApiRecord[],
	) => void;
};

export const useApprovalAlertStore = create<ApprovalAlertState>((set) => ({
	activeTab: "approver-setup",
	pendingApprovalCount: 0,
	setActiveTab: (activeTab) => set({ activeTab }),
	setApprovalTransactions: (transactions) =>
		set({
			pendingApprovalCount: transactions.filter(isPendingApproval).length,
		}),
}));

function isPendingApproval(transaction: ApprovalTransactionApiRecord) {
	const status = transaction.status.trim().toUpperCase();

	return status !== "APPROVED" && status !== "DISAPPROVED";
}

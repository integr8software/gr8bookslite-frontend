import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	ApproveApprovalTransaction,
	DisapproveApprovalTransaction,
	GetApprovalManagementModules,
	GetApprovalTransactions,
	type ApprovalTransactionApiRecord,
} from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
import {
	AllApproversFilter,
	AllModulesFilter,
	AllRulesFilter,
} from "@/app/src/constants/modules/approval-management/ApprovalTransactionConstants";
import {
	ApprovalTransactionColumns,
	createApproverOptions,
	createModuleOptions,
	createRuleOptions,
	mapApprovalTransactionRow,
	matchesTransactionFilters,
} from "@/app/src/data/modules/approval-management/ApprovalTransactionData";
import type { ApprovalTransactionRow } from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";

export function useApprovalTransactions() {
	const queryClient = useQueryClient();
	const [query, setQuery] = useState("");
	const [selectedModuleCode, setSelectedModuleCode] = useState(AllModulesFilter);
	const [selectedRuleId, setSelectedRuleId] = useState(AllRulesFilter);
	const [selectedApproverId, setSelectedApproverId] = useState(AllApproversFilter);
	const [previewTransaction, setPreviewTransaction] = useState<ApprovalTransactionRow | null>(null);
	const modulesQuery = useQuery({
		queryKey: ApprovalManagementQueryKeys.modules(),
		queryFn: GetApprovalManagementModules,
		placeholderData: [],
	});
	const transactionsQuery = useQuery({
		queryKey: ApprovalManagementQueryKeys.transactions(),
		queryFn: GetApprovalTransactions,
		placeholderData: [],
	});
	const rows = useMemo(
		() => (transactionsQuery.data ?? []).map(mapApprovalTransactionRow),
		[transactionsQuery.data],
	);
	const moduleOptions = useMemo(
		() => createModuleOptions(rows, modulesQuery.data ?? []),
		[modulesQuery.data, rows],
	);
	const ruleOptions = useMemo(
		() => createRuleOptions(rows, selectedModuleCode),
		[rows, selectedModuleCode],
	);
	const approverOptions = useMemo(
		() => createApproverOptions(rows, selectedModuleCode, selectedRuleId),
		[rows, selectedModuleCode, selectedRuleId],
	);
	const filteredRows = useMemo(
		() => rows.filter((row) => matchesTransactionFilters(row, {
			approverId: selectedApproverId,
			moduleCode: selectedModuleCode,
			query,
			ruleId: selectedRuleId,
		})),
		[query, rows, selectedApproverId, selectedModuleCode, selectedRuleId],
	);
	const approveMutation = useTransactionStatusMutation(
		"approve",
		ApproveApprovalTransaction,
		() => setPreviewTransaction(null),
	);
	const disapproveMutation = useTransactionStatusMutation(
		"disapprove",
		DisapproveApprovalTransaction,
		() => setPreviewTransaction(null),
	);
	const table = useReactTable({
		columns: ApprovalTransactionColumns,
		data: filteredRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
	});

	useEffect(() => {
		if (selectedRuleId !== AllRulesFilter && !ruleOptions.some(({ value }) => value === selectedRuleId)) {
			setSelectedRuleId(AllRulesFilter);
		}
	}, [ruleOptions, selectedRuleId]);

	useEffect(() => {
		if (selectedApproverId !== AllApproversFilter && !approverOptions.some(({ value }) => value === selectedApproverId)) {
			setSelectedApproverId(AllApproversFilter);
		}
	}, [approverOptions, selectedApproverId]);

	return {
		approveMutation,
		approverOptions,
		disapproveMutation,
		moduleOptions,
		previewTransaction,
		query,
		ruleOptions,
		selectedApproverId,
		selectedModuleCode,
		selectedRuleId,
		setPreviewTransaction,
		setQuery,
		setSelectedApproverId,
		setSelectedModuleCode,
		setSelectedRuleId,
		table,
		transactionsQuery,
	};

	function useTransactionStatusMutation(
		action: "approve" | "disapprove",
		mutationFn: (transactionId: string) => Promise<ApprovalTransactionApiRecord>,
		onDone: () => void,
	) {
		return useMutation({
			mutationFn,
			onSuccess: (updatedTransaction) => {
				queryClient.setQueryData<ApprovalTransactionApiRecord[]>(
					ApprovalManagementQueryKeys.transactions(),
					(transactions = []) => transactions.map((transaction) =>
						transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
					),
				);
				toast.success(`Transaction ${action === "approve" ? "approved" : "disapproved"}.`);
				onDone();
			},
			onError: () => toast.error(`Could not ${action} this transaction.`),
		});
	}
}

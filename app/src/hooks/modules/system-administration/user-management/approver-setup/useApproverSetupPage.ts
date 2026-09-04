"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	ApproverSetupAllStatusesFilter,
	ApproverSetupAllTypesFilter,
	ApproverSetupCurrentDate,
	ApproverSetupTemporaryType,
} from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import {
	CreateApproverSetup,
	DeleteApproverSetup,
	FetchApproverSetupModules,
	FetchApproverSetups,
	FetchApproverSetupUsers,
	UpdateApproverSetup,
	UpdateApproverSetupStatus,
} from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupApi";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
import { ApproverSetupQueryKeys } from "@/app/src/services/modules/system-administration/user-management/approver-setup/ApproverSetupQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type {
	ApproverAssignmentType,
	ApproverCondition,
	ApproverCoverageStatus,
	ApproverSetupDrawerState,
	ApproverSetupFormValues,
	ApproverSetupModuleOption,
	ApproverSetupRecord,
	ApproverSetupUser,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
	getApproverSelectionError,
	normalizeSelectedApproverIds,
} from "@/app/src/validations/modules/system-administration/user-management/approver-setup/ApproverSetupValidation";

export function useApproverSetupPage() {
	const queryClient = useQueryClient();
	const activeCompanyId = useAppStore((state) => state.activeCompanyId);
	const [records, setRecords] = useState<ApproverSetupRecord[]>([]);
	const approverUsersQuery = useQuery({
		queryKey: ApproverSetupQueryKeys.users(),
		queryFn: () => FetchApproverSetupUsers(),
	});
	const approverModulesQuery = useQuery({
		queryKey: ApproverSetupQueryKeys.modules(),
		queryFn: FetchApproverSetupModules,
		placeholderData: [],
	});
	const approverSetupsQuery = useQuery({
		queryKey: ApproverSetupQueryKeys.records(),
		queryFn: FetchApproverSetups,
	});
	const createApproverSetupMutation = useMutation({
		mutationFn: (payloads: Parameters<typeof CreateApproverSetup>[0][]) =>
			Promise.all(payloads.map(CreateApproverSetup)),
		onSuccess: (createdRecords) => {
			queryClient.setQueryData<ApproverSetupRecord[]>(
				ApproverSetupQueryKeys.records(),
				(current = []) => [...createdRecords, ...current],
			);
			setRecords((current) => [...createdRecords, ...current]);
			invalidateConnectedApprovalData();
			toast.success(
				`${createdRecords.length} approver ${createdRecords.length === 1 ? "setup" : "setups"} created.`,
			);
		},
		onError: () => {
			toast.error("Could not create approver setup.");
		},
	});
	const updateApproverSetupMutation = useMutation({
		mutationFn: UpdateApproverSetup,
		onSuccess: (record) => {
			queryClient.setQueryData<ApproverSetupRecord[]>(
				ApproverSetupQueryKeys.records(),
				(current = []) =>
					current.map((item) => (item.id === record.id ? record : item)),
			);
			setRecords((current) =>
				current.map((item) => (item.id === record.id ? record : item)),
			);
			invalidateConnectedApprovalData();
			toast.success("Approver setup updated.");
		},
		onError: () => {
			toast.error("Could not update approver setup.");
		},
	});
	const updateApproverSetupStatusMutation = useMutation({
		mutationFn: UpdateApproverSetupStatus,
		onSuccess: (record) => {
			queryClient.setQueryData<ApproverSetupRecord[]>(
				ApproverSetupQueryKeys.records(),
				(current = []) =>
					current.map((item) => (item.id === record.id ? record : item)),
			);
			setRecords((current) =>
				current.map((item) => (item.id === record.id ? record : item)),
			);
			invalidateConnectedApprovalData();
			toast.success("Approver setup status updated.");
		},
		onError: () => {
			toast.error("Could not update approver setup status.");
		},
	});
	const deleteApproverSetupMutation = useMutation({
		mutationFn: DeleteApproverSetup,
		onSuccess: (setupId) => {
			queryClient.setQueryData<ApproverSetupRecord[]>(
				ApproverSetupQueryKeys.records(),
				(current = []) => current.filter((record) => record.id !== setupId),
			);
			setRecords((current) =>
				current.filter((record) => record.id !== setupId),
			);
			invalidateConnectedApprovalData();
			toast.success("Approver setup deleted.");
		},
		onError: () => {
			toast.error("Could not delete approver setup.");
		},
		onSettled: () => {
			setPendingDelete(null);
		},
	});
	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<
		ApproverAssignmentType | typeof ApproverSetupAllTypesFilter
	>(ApproverSetupAllTypesFilter);
	const [statusFilter, setStatusFilter] = useState<
		ApproverCoverageStatus | typeof ApproverSetupAllStatusesFilter
	>(ApproverSetupAllStatusesFilter);
	const [drawerState, setDrawerState] =
		useState<ApproverSetupDrawerState | null>(null);
	const [formValues, setFormValues] = useState<ApproverSetupFormValues>(
		createApproverSetupFormValues(),
	);
	const [selectedModuleScopes, setSelectedModuleScopes] = useState<string[]>([]);
	const [pendingDelete, setPendingDelete] =
		useState<ApproverSetupRecord | null>(null);
	const [drawerError, setDrawerError] = useState("");
	const approverUsers = approverUsersQuery.data ?? [];
	const moduleOptions = useMemo(
		() => approverModulesQuery.data ?? [],
		[approverModulesQuery.data],
	);

	useEffect(() => {
		if (approverSetupsQuery.data) {
			setRecords(approverSetupsQuery.data);
		}
	}, [approverSetupsQuery.data]);

	useEffect(() => {
		if (
			drawerState?.mode === "add" &&
			!formValues.moduleScope &&
			moduleOptions[0]
		) {
			setFormValues((current) => ({
				...current,
				moduleScope: moduleOptions[0].code,
			}));
		}
	}, [drawerState?.mode, formValues.moduleScope, moduleOptions]);

	const activeCount = records.filter(
		(record) => record.status === "Active",
	).length;
	const temporaryCount = records.filter(
		(record) => record.assignmentType === ApproverSetupTemporaryType,
	).length;
	const levelCount = new Set(records.map((record) => record.levelName)).size;
	const expiringCount = records.filter(
		(record) => getApproverCoverageSignal(record).tone === "warning",
	).length;
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter((record) => {
			const users = record.approverUsers ?? [];
			const searchableText = [
				...users.flatMap((user) => [user?.name, user?.email]),
				record.assignmentType,
				record.levelName,
				record.moduleScope,
				record.condition,
				record.status,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return (
				(!normalizedQuery ||
					searchableText.includes(normalizedQuery)) &&
				(typeFilter === ApproverSetupAllTypesFilter ||
					record.assignmentType === typeFilter) &&
				(statusFilter === ApproverSetupAllStatusesFilter ||
					record.status === statusFilter)
			);
		});
	}, [query, records, statusFilter, typeFilter]);
	const columns = useMemo<ColumnDef<ApproverSetupRecord>[]>(
		() => [
			createApproverSetupColumn("approver", "Approver"),
			createApproverSetupColumn("type", "Type"),
			createApproverSetupColumn("levelScope", "Level / Scope"),
			createApproverSetupColumn("condition", "Condition"),
			createApproverSetupColumn("coverage", "Coverage"),
			createApproverSetupColumn("status", "Status"),
			createApproverSetupColumn("actions", "Actions"),
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 5,
			},
		},
	});

	function openAddDrawer() {
		const initialValues = createApproverSetupFormValues(
			null,
			approverUsers,
			moduleOptions,
		);
		setFormValues(initialValues);
		setSelectedModuleScopes(
			initialValues.moduleScope ? [initialValues.moduleScope] : [],
		);
		setDrawerError("");
		setDrawerState({ mode: "add", record: null });
	}

	function openEditDrawer(record: ApproverSetupRecord) {
		setFormValues(createApproverSetupFormValues(record));
		setSelectedModuleScopes([record.moduleScope]);
		setDrawerError("");
		setDrawerState({ mode: "edit", record });
	}

	function closeDrawer() {
		setDrawerState(null);
		setSelectedModuleScopes([]);
		setFormValues(
			createApproverSetupFormValues(null, approverUsers, moduleOptions),
		);
		setDrawerError("");
	}

	function saveAssignment() {
		const validationMessage = getApproverSelectionError(
			formValues,
			approverUsers,
		);

		if (validationMessage) {
			setDrawerError(validationMessage);
			return;
		}

		const moduleScopes =
			drawerState?.mode === "edit"
				? [formValues.moduleScope]
				: selectedModuleScopes;

		if (moduleScopes.length === 0) {
			setDrawerError("Select a module scope.");
			return;
		}

		if (!formValues.levelName.trim()) {
			setDrawerError("Enter a level name.");
			return;
		}

		if (formValues.assignmentType === ApproverSetupTemporaryType && !formValues.effectiveTo) {
			setDrawerError("Enter a valid until date.");
			return;
		}

		const approverUserIds = formValues.userIds
			.map((userId) => Number(userId))
			.filter(Number.isInteger);

		if (approverUserIds.length !== formValues.userIds.length) {
			setDrawerError("Approver users are still loading. Please try again.");
			return;
		}

		const payload = {
			approverCondition: formValues.condition,
			approverUserIds,
			level: Number.parseInt(formValues.sequence, 10) || undefined,
			levelName: formValues.levelName.trim(),
			moduleScope: formValues.moduleScope.trim(),
			status: formValues.status,
			type: formValues.assignmentType,
			validUntil:
				formValues.assignmentType === ApproverSetupTemporaryType
					? formValues.effectiveTo
					: undefined,
		};

		if (drawerState?.mode === "edit" && drawerState.record) {
			updateApproverSetupMutation.mutate({
				id: drawerState.record.id,
				payload,
			});
			closeDrawer();
			return;
		}

		createApproverSetupMutation.mutate(
			moduleScopes.map((moduleScope) => ({
				...payload,
				moduleScope,
			})),
		);
		closeDrawer();
	}

	function deleteAssignment() {
		if (!pendingDelete) {
			return;
		}

		deleteApproverSetupMutation.mutate(pendingDelete.id);
	}

	function toggleAssignmentStatus(record: ApproverSetupRecord) {
		updateApproverSetupStatusMutation.mutate({
			id: record.id,
			status: record.status === "Expired" ? "Active" : "Expired",
		});
	}

	function invalidateConnectedApprovalData() {
		void queryClient.invalidateQueries({
			queryKey: ApproverSetupQueryKeys.records(),
		});
		void queryClient.invalidateQueries({
			queryKey: ApprovalManagementQueryKeys.workflows(activeCompanyId),
		});
	}

	return {
		activeCount,
		approverUsers,
		closeDrawer,
		deleteAssignment,
		drawerError,
		drawerState,
		expiringCount,
		formValues,
		levelCount,
		moduleOptions,
		openAddDrawer,
		openEditDrawer,
		pendingDelete,
		query,
		records,
		saveAssignment,
		selectedModuleScopes,
		setFormValues,
		setSelectedModuleScopes,
		setPendingDelete,
		setQuery,
		setStatusFilter,
		setTypeFilter,
		statusFilter,
		table,
		temporaryCount,
		toggleAssignmentStatus,
		typeFilter,
	};
}

export function createApproverSetupFormValues(
	record?: ApproverSetupRecord | null,
	users: ApproverSetupUser[] = [],
	modules: ApproverSetupModuleOption[] = [],
): ApproverSetupFormValues {
	const condition = record?.condition ?? "Any one approver";

	return {
		assignmentType: record?.assignmentType ?? "Level-based",
		condition,
		effectiveFrom: record?.effectiveFrom ?? "2026-07-08",
		effectiveTo: record?.effectiveTo ?? "",
		levelName: record?.levelName ?? "Department Review",
		moduleScope: record?.moduleScope ?? modules[0]?.code ?? "",
		sequence: String(record?.sequence ?? 1),
		status: record?.status ?? "Active",
		userIds: normalizeSelectedApproverIds(
			condition,
			record?.userIds ?? [users[0]?.id].filter(Boolean),
			users,
		),
	};
}

export function createRecordFromFormValues(
	values: ApproverSetupFormValues,
	currentRecord?: ApproverSetupRecord | null,
): ApproverSetupRecord {
	return {
		id: currentRecord?.id ?? `approver-${Date.now().toString(36)}`,
		assignmentType: values.assignmentType,
		condition: values.condition.trim() as ApproverCondition,
		effectiveFrom:
			values.assignmentType === ApproverSetupTemporaryType
				? values.effectiveFrom || "2026-07-08"
				: undefined,
		effectiveTo:
			values.assignmentType === ApproverSetupTemporaryType
				? values.effectiveTo || undefined
				: undefined,
		lastUpdatedAt: "2026-07-08",
		lastUpdatedBy: "Sin Bad",
		levelName: values.levelName.trim() || "Approval Review",
		moduleScope: values.moduleScope.trim() || "All modules",
		sequence: Number.parseInt(values.sequence, 10) || 1,
		status: values.status,
		userIds: normalizeSelectedApproverIds(values.condition, values.userIds),
	};
}

export function getApproverCoverageSignal(record: ApproverSetupRecord) {
	if (!record.effectiveTo) {
		return {
			label: "Open ended",
			tone: "neutral",
			className: "bg-darknavy/5 text-darknavy/55",
		};
	}

	const endDate = new Date(`${record.effectiveTo}T00:00:00`);
	const daysLeft = Math.ceil(
		(endDate.getTime() - ApproverSetupCurrentDate.getTime()) / 86_400_000,
	);

	if (daysLeft < 0) {
		return {
			label: "Expired",
			tone: "muted",
			className: "bg-darknavy/5 text-darknavy/45",
		};
	}

	if (daysLeft <= 14) {
		return {
			label: `${daysLeft} days left`,
			tone: "warning",
			className: "bg-citron/25 text-darknavy",
		};
	}

	return {
		label: "Covered",
		tone: "stable",
		className: "bg-emerald-50 text-emerald-700",
	};
}

function createApproverSetupColumn(
	id: string,
	header: string,
): ColumnDef<ApproverSetupRecord> {
	return {
		id,
		accessorFn: (record) => record.id,
		enableSorting: false,
		header,
	};
}

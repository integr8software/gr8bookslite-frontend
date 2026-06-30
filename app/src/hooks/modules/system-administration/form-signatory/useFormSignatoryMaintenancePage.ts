"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	AppMaxFileUploadSizeBytes,
	AppMaxFileUploadSizeLabel,
} from "@/app/src/constants/shared/app/AppConstants";
import {
	FormSignatoryMaxRows,
	getFormSignatoryTableColumns,
} from "@/app/src/constants/modules/system-administration/form-signatory/FormSignatoryConstants";
import { createEmptyFormSignatoryRow } from "@/app/src/data/modules/system-administration/form-signatory/FormSignatoryData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useTransactionNumberSetupStore } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetup";
import {
	GetFormSignatoryBootstrap,
	SaveFormSignatorySetup,
} from "@/app/src/services/modules/system-administration/form-signatory/FormSignatoryApi";
import { FormSignatoryQueryKeys } from "@/app/src/services/modules/system-administration/form-signatory/FormSignatoryQueryKeys";
import { CreateSessionQueryOptions } from "@/app/src/services/shared/query/QueryProfiles";
import type {
	FormSignatoryActionMode,
	FormSignatoryBootstrap,
	FormSignatoryModuleOption,
	FormSignatoryRow,
	FormSignatorySetupRecord,
} from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";
import { FormSignatorySchema } from "@/app/src/validations/modules/system-administration/form-signatory/FormSignatoryValidation";

export function useFormSignatoryMaintenancePage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
	const {
		isLoading: isApprovalModuleLoading,
		setups: approvalModuleSetups,
	} = useTransactionNumberSetupStore();
	const actionMode = getActionMode(pathname);
	const scopedEditRowId =
		actionMode === "edit" ? searchParams.get("rowId") ?? "" : "";
	const [branch, setBranchState] = useState("");
	const [module, setModuleState] = useState("");
	const [signatoryFilterLabel, setSignatoryFilterLabelState] = useState("");
	const [mode, setMode] = useState<"create" | "edit" | "view">(
		actionMode === "add" ? "create" : actionMode === "edit" ? "edit" : "view",
	);
	const [signatureMakerRow, setSignatureMakerRow] =
		useState<FormSignatoryRow | null>(null);
	const [pendingClearSignatureRow, setPendingClearSignatureRow] =
		useState<FormSignatoryRow | null>(null);
	const [pendingDeleteRow, setPendingDeleteRow] =
		useState<FormSignatoryRow | null>(null);
	const [deletingRowId, setDeletingRowId] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [rows, setRows] = useState<FormSignatoryRow[]>(() =>
		actionMode === "add" ? [createEmptyFormSignatoryRow(0)] : [],
	);
	const [cancelableRowIds, setCancelableRowIds] = useState<string[]>(() =>
		actionMode === "add" ? [] : [],
	);
	const closeSnapshotRef = useRef({
		branch: "",
		module: "",
		rows: [] as FormSignatoryRow[],
	});
	const hasHydratedInitialStateRef = useRef(false);
	const isEditing = mode !== "view";
	const queriesEnabled = isAuthSessionReady && Boolean(accessToken);
	const bootstrapQuery = useQuery({
		...CreateSessionQueryOptions(FormSignatoryQueryKeys.bootstrap(), () =>
			GetFormSignatoryBootstrap(accessToken),
		),
		enabled: queriesEnabled,
	});
	const setups = useMemo(
		() => bootstrapQuery.data?.setups ?? [],
		[bootstrapQuery.data?.setups],
	);
	const branchOptions = useMemo(() => {
		const options = bootstrapQuery.data?.branches ?? [
			{ label: "Select Branch", value: "" },
		];

		return actionMode === "list" ? withAllOption(options) : options;
	}, [actionMode, bootstrapQuery.data?.branches]);
	const moduleOptions = useMemo<FormSignatoryModuleOption[]>(() => {
		const approvalModuleOptions = approvalModuleSetups
			.map<FormSignatoryModuleOption>((setup) => ({
				id: String(setup.moduleId),
				label: setup.moduleName,
				value: setup.moduleCode,
			}))
			.filter(
				(option, index, options) =>
					options.findIndex((current) => current.value === option.value) ===
					index,
			)
			.sort((left, right) => left.label.localeCompare(right.label));

		if (approvalModuleOptions.length > 0) {
			return actionMode === "list"
				? withAllOption(approvalModuleOptions)
				: [{ label: "Select Module", value: "" }, ...approvalModuleOptions];
		}

		if (!bootstrapQuery.data) {
			return actionMode === "list"
				? [{ label: "All", value: "" }]
				: [{ label: "Loading modules...", value: "" }];
		}

		const options = bootstrapQuery.data.modules.filter(
			(option) => option.value,
		);

		return actionMode === "list"
			? withAllOption(options)
			: [{ label: "Select Module", value: "" }, ...options];
	}, [actionMode, approvalModuleSetups, bootstrapQuery.data]);
	const recordSetup =
		actionMode === "edit" && params.recordId
			? setups.find((setup) => setup.id === params.recordId)
			: undefined;
	const selectedSetup = findSetup(setups, branch, module);
	const currentSetupId = selectedSetup?.id ?? recordSetup?.id ?? "";
	const visibleRows = useMemo(() => {
		const scopedRows = scopedEditRowId
			? rows.filter((row) => row.id === scopedEditRowId)
			: rows;

		return filterRowsBySignatoryLabel(scopedRows, signatoryFilterLabel);
	}, [rows, scopedEditRowId, signatoryFilterLabel]);
	const showSignatureValidityColumn = visibleRows.some(
		(row) => row.isThisTemporary === true,
	);
	const tableColumns = useMemo(
		() => getFormSignatoryTableColumns(showSignatureValidityColumn),
		[showSignatureValidityColumn],
	);

	function updateSetupsCache(
		updater: (
			setups: FormSignatorySetupRecord[],
		) => FormSignatorySetupRecord[],
	) {
		queryClient.setQueryData<FormSignatoryBootstrap>(
			FormSignatoryQueryKeys.bootstrap(),
			(current) =>
				current
					? {
							...current,
							setups: updater(current.setups),
						}
					: current,
		);
		queryClient.setQueryData<FormSignatorySetupRecord[]>(
			FormSignatoryQueryKeys.setups(),
			(current = []) => updater(current),
		);
	}

	const saveMutation = useMutation({
		mutationFn: () =>
			SaveFormSignatorySetup(
				accessToken,
				{
					moduleCode: module,
					moduleName: getSelectedModuleName(module, moduleOptions),
					rows: mapRowsForSave(rows),
					unitId: Number(branch),
				},
				actionMode === "edit" ? params.recordId : undefined,
			),
		onSuccess: (setup) => {
			const previousSetupId =
				actionMode === "edit" ? params.recordId : selectedSetup?.id;

			updateSetupsCache((current) => [
					setup,
					...current.filter(
						(record) =>
							record.id !== setup.id && record.id !== previousSetupId,
					),
				]);
			closeSnapshotRef.current = {
				branch: setup.branch,
				module: setup.module,
				rows: cloneRows(setup.rows),
			};
			setBranchState(setup.branch);
			setModuleState(setup.module);
			setRows(cloneRows(setup.rows));
			setCancelableRowIds([]);
			setMode("view");
			toast.success("Form signatory setup saved.");
			router.push("/system-administration/form-signatory");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not save form signatory setup.",
			);
		},
	});
	const deleteRowMutation = useMutation({
		mutationFn: (rowToDelete: FormSignatoryRow) => {
			const setup = setups.find(
				(record) => record.id === rowToDelete.setupId,
			);

			if (!setup) {
				throw new Error("Could not find the signatory setup for this row.");
			}

			const nextRows = setup.rows.filter((row) => row.id !== rowToDelete.id);

			if (nextRows.length === 0) {
				throw new Error("At least one signatory is required.");
			}

			return SaveFormSignatorySetup(
				accessToken,
				{
					moduleCode: setup.module,
					moduleName: setup.moduleName,
					rows: mapRowsForSave(nextRows),
					unitId: Number(setup.branch),
				},
				setup.id,
			);
		},
		onSuccess: (setup, deletedRow) => {
			updateSetupsCache((current) =>
				current.map((record) => (record.id === setup.id ? setup : record)),
			);
			setRows((currentRows) =>
				currentRows.filter((row) => row.id !== deletedRow.id),
			);
			closeSnapshotRef.current = {
				branch: closeSnapshotRef.current.branch,
				module: closeSnapshotRef.current.module,
				rows: closeSnapshotRef.current.rows.filter(
					(row) => row.id !== deletedRow.id,
				),
			};
			setPendingDeleteRow(null);
			toast.success("Signatory row deleted.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not delete signatory row.",
			);
		},
		onSettled: () => {
			setDeletingRowId("");
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: visibleRows,
		columns: tableColumns,
		state: { pagination },
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	useEffect(() => {
		if (hasHydratedInitialStateRef.current || bootstrapQuery.isLoading) {
			return;
		}

		if (actionMode === "add") {
			hasHydratedInitialStateRef.current = true;
			return;
		}

		if (actionMode === "list") {
			const nextRows = getRowsForFilters(setups, "", "");

			closeSnapshotRef.current = {
				branch: "",
				module: "",
				rows: cloneRows(nextRows),
			};
			setRows(nextRows);
			hasHydratedInitialStateRef.current = true;
			return;
		}

		const initialSetup =
			actionMode === "edit" ? recordSetup : setups[0];

		if (!initialSetup) {
			hasHydratedInitialStateRef.current = true;
			setRows([]);
			return;
		}

		hydrateFromSetup(initialSetup);
		hasHydratedInitialStateRef.current = true;
	}, [
		actionMode,
		bootstrapQuery.isLoading,
		queriesEnabled,
		recordSetup,
		setups,
	]);

	useEffect(() => {
		if (isEditing || !hasHydratedInitialStateRef.current || actionMode !== "list") {
			return;
		}

		const nextRows = getRowsForFilters(setups, branch, module);

		setRows(nextRows);
		setCancelableRowIds([]);
		closeSnapshotRef.current = {
			branch,
			module,
			rows: cloneRows(nextRows),
		};
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}, [actionMode, branch, isEditing, module, setups]);

	function hydrateFromSetup(setup: FormSignatorySetupRecord) {
		const nextRows = cloneRows(setup.rows);

		setBranchState(setup.branch);
		setModuleState(setup.module);
		setRows(nextRows);
		closeSnapshotRef.current = {
			branch: setup.branch,
			module: setup.module,
			rows: cloneRows(nextRows),
		};
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function handleNew() {
		router.push("/system-administration/form-signatory/add");
	}

	function handleSave() {
		const result = FormSignatorySchema.safeParse({ branch, module, rows });

		if (!result.success) {
			toast.error(result.error.issues[0]?.message ?? "Please fix the form.");
			return;
		}

		saveMutation.mutate();
	}

	function handleClose() {
		if (actionMode !== "list") {
			router.push("/system-administration/form-signatory");
			return;
		}

		const snapshot = closeSnapshotRef.current;

		setBranchState(snapshot.branch);
		setModuleState(snapshot.module);
		setRows(cloneRows(snapshot.rows));
		setCancelableRowIds([]);
		setMode("view");
		setPendingClearSignatureRow(null);
		setPendingDeleteRow(null);
		setSignatureMakerRow(null);
		setDeletingRowId("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setBranch(value: string) {
		setBranchState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setModule(value: string) {
		setModuleState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setSignatoryFilterLabel(value: string) {
		setSignatoryFilterLabelState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function handleAddRow() {
		if (rows.length >= FormSignatoryMaxRows) {
			toast.error(`A setup can only have up to ${FormSignatoryMaxRows} signatories.`);
			return;
		}

		const nextRow = createEmptyFormSignatoryRow(rows.length);

		setCancelableRowIds((currentIds) => [...currentIds, nextRow.id]);
		setRows((currentRows) => [...currentRows, nextRow]);
	}

	function handleReset() {
		const snapshot = closeSnapshotRef.current;

		setBranchState(snapshot.branch);
		setModuleState(snapshot.module);
		setRows(
			snapshot.rows.length > 0
				? cloneRows(snapshot.rows)
				: actionMode === "add"
					? [createEmptyFormSignatoryRow(0)]
					: [],
		);
		setCancelableRowIds([]);
		setPendingClearSignatureRow(null);
		setPendingDeleteRow(null);
		setSignatureMakerRow(null);
		setDeletingRowId("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function handleRemoveRow(rowId: string) {
		setRows((currentRows) => {
			if (currentRows.length === 1) {
				toast.error("At least one signatory is required.");
				return currentRows;
			}

			setCancelableRowIds((currentIds) =>
				currentIds.filter((id) => id !== rowId),
			);

			return currentRows.filter((row) => row.id !== rowId);
		});
	}

	function handleDeleteRow(row: FormSignatoryRow) {
		setPendingDeleteRow(row);
	}

	function confirmDeleteRow() {
		if (!pendingDeleteRow) {
			toast.error("Could not find the signatory row to delete.");
			return;
		}

		if (isEditing) {
			handleRemoveRow(pendingDeleteRow.id);
			setPendingDeleteRow(null);
			return;
		}

		setDeletingRowId(pendingDeleteRow.id);
		deleteRowMutation.mutate(pendingDeleteRow);
	}

	function updateRow(rowId: string, updates: Partial<FormSignatoryRow>) {
		setRows((currentRows) =>
			currentRows.map((row) =>
				row.id === rowId ? { ...row, ...updates } : row,
			),
		);
	}

	function handleSignatureFile(rowId: string, file: File | undefined) {
		if (!file) {
			clearSignature(rowId);
			return;
		}

		if (!file.type.startsWith("image/")) {
			toast.error("Please upload an image file.");
			return;
		}

		if (file.size > AppMaxFileUploadSizeBytes) {
			toast.error(
				`Signature image must be ${AppMaxFileUploadSizeLabel} or smaller.`,
			);
			return;
		}

		const reader = new FileReader();

		reader.onerror = () => {
			toast.error("Could not read the signature image.");
		};
		reader.onload = () => {
			updateRow(rowId, {
				signatureName: file.name,
				signaturePreview:
					typeof reader.result === "string" ? reader.result : "",
				signatureValidUntil: "",
			});
			toast.success("Signature image uploaded.");
		};
		reader.readAsDataURL(file);
	}

	function handleSignatureMade(rowId: string, signatureImageUrl: string) {
		const rowIndex = rows.findIndex((row) => row.id === rowId);
		const row = rows[rowIndex];

		updateRow(rowId, {
			signatureName: createESignatureFileName(row, rowIndex),
			signaturePreview: signatureImageUrl,
			signatureValidUntil: "",
		});
		setSignatureMakerRow(null);
		toast.success("Signature created.");
	}

	function clearSignature(rowId: string) {
		updateRow(rowId, {
			signatureName: "",
			signaturePreview: "",
			signatureValidUntil: "",
		});
	}

	function confirmClearSignature() {
		if (!pendingClearSignatureRow) {
			toast.error("Could not find the signature to clear.");
			return;
		}

		setRows((currentRows) =>
			currentRows.map((row) =>
				row.id === pendingClearSignatureRow.id
					? {
							...row,
							signatureName: "",
							signaturePreview: "",
							signatureValidUntil: "",
						}
					: row,
			),
		);
		setPendingClearSignatureRow(null);
		toast.success("Signature image cleared.");
	}

	return {
		branch,
		branchOptions,
		cancelableRowIds,
		currentSetupId,
		handleClose,
		handleAddRow,
		handleNew,
		handleRemoveRow,
		handleDeleteRow,
		deletingRowId,
		handleReset,
		handleSave,
		handleSignatureFile,
		isEditing,
		isLoading:
			!isAuthSessionReady ||
			bootstrapQuery.isLoading ||
			isApprovalModuleLoading,
		lastSyncedAt: bootstrapQuery.dataUpdatedAt,
		isRecordMissing:
			actionMode === "edit" &&
			!bootstrapQuery.isLoading &&
			Boolean(params.recordId) &&
			(!recordSetup ||
				(Boolean(scopedEditRowId) &&
					rows.length > 0 &&
					!rows.some((row) => row.id === scopedEditRowId))),
		isSaving: saveMutation.isPending,
		isScopedRowEdit: Boolean(scopedEditRowId),
		maxRows: FormSignatoryMaxRows,
		mode,
		module,
		moduleOptions,
		pendingClearSignatureRow,
		pendingDeleteRow,
		rows,
		setBranch,
		setModule,
		setSignatoryFilterLabel,
		setPendingClearSignatureRow,
		setPendingDeleteRow,
		setSignatureMakerRow,
		showSignatureValidityColumn,
		signatoryFilterLabel,
		eSignatureCount: rows.filter((row) => isSignatureMakerOutput(row))
			.length,
		visibleESignatureCount: visibleRows.filter((row) =>
			isSignatureMakerOutput(row),
		).length,
		signatureImageCount: rows.filter((row) => row.signaturePreview).length,
		visibleSignatureImageCount: visibleRows.filter((row) => row.signaturePreview)
			.length,
		visibleSignatoryCount: visibleRows.length,
		signatureMakerRow,
		table,
		updateRow,
		confirmClearSignature,
		confirmDeleteRow,
		handleSignatureMade,
	};
}

function filterRowsBySignatoryLabel(
	rows: FormSignatoryRow[],
	signatoryFilterLabel: string,
) {
	if (!signatoryFilterLabel) {
		return rows;
	}

	return rows.filter((row) => row.label === signatoryFilterLabel);
}

function getRowsForFilters(
	setups: FormSignatorySetupRecord[],
	branch: string,
	module: string,
) {
	return setups
		.filter(
			(setup) =>
				(!branch || setup.branch === branch) &&
				(!module || setup.module === module),
		)
		.flatMap((setup) =>
			setup.rows.map((row) => ({
				...row,
				setupId: setup.id,
			})),
		);
}

function withAllOption<TOption extends { label: string; value: string }>(
	options: TOption[],
) {
	const concreteOptions = options.filter((option) => option.value);

	return [{ label: "All", value: "" }, ...concreteOptions] as TOption[];
}

function isSignatureMakerOutput(row: FormSignatoryRow) {
	return (
		Boolean(row.signaturePreview) &&
		row.signaturePreview.startsWith("data:image/png") &&
		row.signatureName.startsWith("e-signature-")
	);
}

function createESignatureFileName(
	row: FormSignatoryRow | undefined,
	rowIndex: number,
) {
	const signerName = row?.name.trim();
	const fallbackName =
		rowIndex >= 0 ? `signatory-${rowIndex + 1}` : "signatory";
	const slug = slugifyFileName(signerName || fallbackName);

	return `e-signature-${slug}.png`;
}

function slugifyFileName(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function getActionMode(pathname: string): FormSignatoryActionMode {
	if (pathname.includes("/edit/")) {
		return "edit";
	}

	if (pathname.endsWith("/add")) {
		return "add";
	}

	return "list";
}

function findSetup(
	setups: FormSignatorySetupRecord[],
	branch: string,
	module: string,
) {
	return setups.find((setup) => setup.branch === branch && setup.module === module);
}

function cloneRows(rows: FormSignatoryRow[]) {
	return rows.map((row) => ({ ...row }));
}

function mapRowsForSave(rows: FormSignatoryRow[]) {
	return rows.map((row) => ({
		label: row.label,
		isThisTemporary: row.isThisTemporary ?? null,
		name: row.name,
		position: row.position || undefined,
		signatureImage: row.signaturePreview || undefined,
		signatureName: row.signatureName || undefined,
		signatureValidUntil: row.signatureValidUntil || undefined,
	}));
}

function getSelectedModuleName(
	moduleCode: string,
	moduleOptions: FormSignatoryModuleOption[],
) {
	return moduleOptions.find((option) => option.value === moduleCode)?.label ?? moduleCode;
}

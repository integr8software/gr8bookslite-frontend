"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	FormSignatoryMaxRows,
	FormSignatoryTableColumns,
} from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import {
	createEmptyFormSignatoryRow,
	createDefaultFormSignatoryRows,
	findFormSignatorySetupById,
	loadFormSignatorySetups,
	saveFormSignatorySetups,
} from "@/app/src/data/modules/maintenance/form-signatory/FormSignatoryData";
import type {
	FormSignatoryActionMode,
	FormSignatoryRow,
} from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";
import { FormSignatorySchema } from "@/app/src/validations/modules/maintenance/form-signatory/FormSignatoryValidation";

export function useFormSignatoryMaintenancePage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const actionMode = getActionMode(pathname);
	const recordSetup =
		actionMode === "edit" && params.recordId
			? findFormSignatorySetupById(params.recordId)
			: undefined;
	const initialSetupRef = useRef(
		actionMode === "add" ? undefined : (recordSetup ?? loadFormSignatorySetups()[0]),
	);
	const initialSetup = initialSetupRef.current;
	const [branch, setBranchState] = useState(
		actionMode === "add" ? "" : (initialSetup?.branch ?? "head-office"),
	);
	const [module, setModuleState] = useState(
		actionMode === "add" ? "" : (initialSetup?.module ?? "purchase-request"),
	);
	const [mode, setMode] = useState<"create" | "edit" | "view">(
		actionMode === "add" ? "create" : actionMode === "edit" ? "edit" : "view",
	);
	const [signatureMakerRow, setSignatureMakerRow] =
		useState<FormSignatoryRow | null>(null);
	const [pendingClearSignatureRow, setPendingClearSignatureRow] =
		useState<FormSignatoryRow | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [rows, setRows] = useState<FormSignatoryRow[]>(() =>
		getInitialRows(actionMode, initialSetup?.rows),
	);
	const closeSnapshotRef = useRef({
		branch: actionMode === "add" ? "" : (initialSetup?.branch ?? "head-office"),
		module: actionMode === "add" ? "" : (initialSetup?.module ?? "purchase-request"),
		rows: getInitialRows(actionMode, initialSetup?.rows),
	});
	const isEditing = mode !== "view";
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: rows,
		columns: FormSignatoryTableColumns,
		state: { pagination },
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	useEffect(() => {
		if (isEditing) {
			return;
		}

		if (!module) {
			setRows(createDefaultFormSignatoryRows());
			setPagination((current) => ({ ...current, pageIndex: 0 }));
			return;
		}

		setRows(getSetupRows(branch, module));
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}, [branch, isEditing, module]);

	function handleNew() {
		router.push("/maintenance/form-signatory/add");
	}

	function handleSave() {
		const result = FormSignatorySchema.safeParse({ branch, module, rows });

		if (!result.success) {
			toast.error(result.error.issues[0]?.message ?? "Please fix the form.");
			return;
		}

		saveCurrentSetup(rows);
		closeSnapshotRef.current = {
			branch,
			module,
			rows: rows.map((row) => ({ ...row })),
		};
		setMode("view");
		toast.success("Form signatory setup saved.");
		router.push("/maintenance/form-signatory");
	}

	function handleClose() {
		if (actionMode !== "list") {
			router.push("/maintenance/form-signatory");
			return;
		}

		const snapshot = closeSnapshotRef.current;

		setBranchState(snapshot.branch);
		setModuleState(snapshot.module);
		setRows(snapshot.rows.map((row) => ({ ...row })));
		setMode("view");
		setPendingClearSignatureRow(null);
		setSignatureMakerRow(null);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
		toast.success("Form signatory setup closed.");
	}

	function setBranch(value: string) {
		setBranchState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setModule(value: string) {
		setModuleState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function handleAddRow() {
		if (rows.length >= FormSignatoryMaxRows) {
			toast.error(`A setup can only have up to ${FormSignatoryMaxRows} signatories.`);
			return;
		}

		setRows((currentRows) => [
			...currentRows,
			createEmptyFormSignatoryRow(currentRows.length),
		]);
	}

	function handleReset() {
		const snapshot = closeSnapshotRef.current;

		setBranchState(snapshot.branch);
		setModuleState(snapshot.module);
		setRows(snapshot.rows.map((row) => ({ ...row })));
		setPendingClearSignatureRow(null);
		setSignatureMakerRow(null);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function handleRemoveRow(rowId: string) {
		setRows((currentRows) => {
			if (currentRows.length === 1) {
				toast.error("At least one signatory is required.");
				return currentRows;
			}

			return currentRows.filter((row) => row.id !== rowId);
		});
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

		const reader = new FileReader();

		reader.onerror = () => {
			toast.error("Could not read the signature image.");
		};
		reader.onload = () => {
			updateRow(rowId, {
				signatureName: file.name,
				signaturePreview:
					typeof reader.result === "string" ? reader.result : "",
			});
			toast.success("Signature image uploaded.");
		};
		reader.readAsDataURL(file);
	}

	function handleSignatureMade(rowId: string, signatureImageUrl: string) {
		updateRow(rowId, {
			signatureName: `${rows.find((row) => row.id === rowId)?.label ?? "Signature"}.png`,
			signaturePreview: signatureImageUrl,
		});
		setSignatureMakerRow(null);
		toast.success("Signature created.");
	}

	function clearSignature(rowId: string) {
		updateRow(rowId, {
			signatureName: "",
			signaturePreview: "",
		});
	}

	function confirmClearSignature() {
		if (!pendingClearSignatureRow) {
			toast.error("Could not find the signature to clear.");
			return;
		}

		const nextRows = rows.map((row) =>
			row.id === pendingClearSignatureRow.id
				? {
						...row,
						signatureName: "",
						signaturePreview: "",
					}
				: row,
		);

		setRows(nextRows);
		setPendingClearSignatureRow(null);
		toast.success("Signature image cleared.");
	}

	function saveCurrentSetup(nextRows: FormSignatoryRow[]) {
		const currentSetups = loadFormSignatorySetups();
		const nextSetup = {
			id: getFormSignatorySetupId(branch, module),
			branch,
			module,
			rows: nextRows,
		};
		const nextSetups = [
			nextSetup,
			...currentSetups.filter(
				(setup) => !(setup.branch === branch && setup.module === module),
			),
		];

		saveFormSignatorySetups(nextSetups);
	}

	return {
		branch,
		currentSetupId: getFormSignatorySetupId(branch, module),
		handleClose,
		handleAddRow,
		handleNew,
		handleRemoveRow,
		handleReset,
		handleSave,
		handleSignatureFile,
		isEditing,
		isRecordMissing: actionMode === "edit" && !recordSetup,
		maxRows: FormSignatoryMaxRows,
		mode,
		module,
		pendingClearSignatureRow,
		rows,
		setBranch,
		setModule,
		setPendingClearSignatureRow,
		setSignatureMakerRow,
		signatureImageCount: rows.filter((row) => row.signaturePreview).length,
		signatureMakerRow,
		table,
		updateRow,
		confirmClearSignature,
		handleSignatureMade,
	};
}

function getFormSignatorySetupId(branch: string, module: string) {
	return `form-signatory-${module}-${branch}`;
}

function getInitialRows(
	actionMode: FormSignatoryActionMode,
	rows: FormSignatoryRow[] | undefined,
) {
	if (rows) {
		return rows.map((row) => ({ ...row }));
	}

	if (actionMode === "add") {
		return [createEmptyFormSignatoryRow(0)];
	}

	return createDefaultFormSignatoryRows();
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

function getSetupRows(branch: string, module: string) {
	const setup = loadFormSignatorySetups().find(
		(record) => record.branch === branch && record.module === module,
	);

	return (
		setup?.rows.map((row) => ({ ...row })) ?? createDefaultFormSignatoryRows()
	);
}

"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TransactionNumberSetupTableColumns } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import {
	TransactionNumberSetupInitialFormValues,
	createTransactionNumberSetupFormValues,
	getTransactionNumberSetupBranchOptions,
	updateTransactionNumberSetupRecord,
} from "@/app/src/data/modules/system-administration/transaction-number-setup/TransactionNumberSetupData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagementStore";
import { formatTransactionNumber } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";
import { formatBranchScopeLabel } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupFormatters";
import type {
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
	TransactionNumberSetupTableColumnKey,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import { validateTransactionNumberSetupForm } from "@/app/src/validations/modules/system-administration/transaction-number-setup/TransactionNumberSetupValidation";
import { useTransactionNumberSetupStore } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetup";

const NumberFields = new Set<keyof TransactionNumberSetupFormValues>([
	"padding",
	"startingNumber",
	"currentNumber",
]);

export function useTransactionNumberSetupListPage() {
	const {
		isLoading,
		isMutating,
		setups,
		updateSetup,
	} = useTransactionNumberSetupStore();
	const companies = useWorkspaceCompanyManagementStore(
		(state) => state.companies,
		{ includeUsers: false },
	);
	const [query, setQuery] = useState("");
	const [selectedSetupId, setSelectedSetupId] = useState<string | null>(
		() => setups[0]?.id ?? null,
	);
	const [values, setValues] = useState<TransactionNumberSetupFormValues>(() =>
		setups[0]
			? createTransactionNumberSetupFormValues(setups[0])
			: TransactionNumberSetupInitialFormValues,
	);
	const [errors, setErrors] = useState<TransactionNumberSetupFormErrors>({});
	const [scopeFilter, setScopeFilter] = useState<
		"all" | "any" | "branch"
	>(
		"any",
	);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "moduleName", desc: false },
	]);
	const branchNameById = useMemo(
		() =>
			new Map(
				getTransactionNumberSetupBranchOptions(companies).map((branch) => [
					branch.id,
					branch.name,
				]),
			),
		[companies],
	);
	const branchOptions = useMemo(
		() => getTransactionNumberSetupBranchOptions(companies),
		[companies],
	);
	const filteredSetups = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return setups.filter((setup) => {
			if (scopeFilter !== "any" && setup.scope !== scopeFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				setup.moduleName,
				setup.moduleCode,
				setup.inputMode,
				setup.prefix,
				setup.status,
				formatBranchScopeLabel(setup, branchNameById),
				formatTransactionNumber(setup),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [branchNameById, query, scopeFilter, setups]);
	const selectedSetup =
		setups.find((setup) => setup.id === selectedSetupId) ?? setups[0];
	const nextNumberPreview =
		values.prefix && values.padding > 0
			? formatTransactionNumber({
					currentNumber: values.currentNumber,
					padding: values.padding,
					prefix: values.prefix,
				})
			: "Set prefix and digits";
	const columns = useMemo<ColumnDef<TransactionNumberSetupRecord>[]>(
		() =>
			TransactionNumberSetupTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createTransactionNumberSetupColumn({
					branchNameById,
					className: column.className,
					header: column.label,
					key: column.key,
				});
			}),
		[branchNameById],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredSetups,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	useEffect(() => {
		if (!selectedSetup && setups[0]) {
			setSelectedSetupId(setups[0].id);
			return;
		}

		if (!selectedSetup) {
			return;
		}

		setValues(createTransactionNumberSetupFormValues(selectedSetup));
		setErrors({});
	}, [selectedSetup, setups]);

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleScopeFilterChange(value: "all" | "any" | "branch") {
		setScopeFilter(value);
		table.setPageIndex(0);
	}

	function handleSelectSetup(setupId: string) {
		setSelectedSetupId(setupId);
	}

	function updateField<TKey extends keyof TransactionNumberSetupFormValues>(
		field: TKey,
		value: TransactionNumberSetupFormValues[TKey],
	) {
		setValues((current) => {
			const nextValues = {
				...current,
				[field]: value,
			};

			if (
				field === "startingNumber" &&
				typeof value === "number" &&
				current.currentNumber < value
			) {
				nextValues.currentNumber = value;
			}

			if (field === "scope" && value === "all") {
				nextValues.branchIds = [];
			}

			if (field === "scope" && value === "branch") {
				nextValues.branchIds = current.branchIds.slice(0, 1);
			}

			return nextValues;
		});
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, value } = event.target;

		if (NumberFields.has(name as keyof TransactionNumberSetupFormValues)) {
			updateField(
				name as keyof TransactionNumberSetupFormValues,
				Number(value) as never,
			);
			return;
		}

		updateField(name as keyof TransactionNumberSetupFormValues, value as never);
	}

	function toggleBranch(branchId: string) {
		setValues((current) => {
			if (current.scope === "all") {
				return { ...current, scope: "branch", branchIds: [branchId] };
			}

			if (current.scope === "branch") {
				return { ...current, branchIds: [branchId] };
			}

			const branchIds = current.branchIds.includes(branchId)
				? current.branchIds.filter((currentBranchId) => currentBranchId !== branchId)
				: [...current.branchIds, branchId];

			return { ...current, branchIds };
		});
		setErrors((current) => ({ ...current, branchIds: undefined }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedSetup) {
			return;
		}

		const nextErrors = validateTransactionNumberSetupForm({
			allBranchIds: branchOptions.map((branch) => branch.id),
			currentRecordId: selectedSetup.id,
			existingRecords: setups,
			values,
		});

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		updateSetup(updateTransactionNumberSetupRecord(selectedSetup, values));
	}

	return {
		activeSetupCount: setups.filter((setup) => setup.status === "Active").length,
		branchOptions,
		branchNameById,
		errors,
		handleQueryChange,
		handleInputChange,
		handleSelectSetup,
		handleScopeFilterChange,
		handleSubmit,
		isLoading,
		isMutating,
		nextNumberPreview,
		query,
		scopeFilter,
		selectedSetup,
		selectedSetupId: selectedSetup?.id ?? null,
		sharedSetupCount: setups.filter((setup) => setup.scope !== "branch").length,
		setupCount: setups.length,
		setups: filteredSetups,
		table,
		toggleBranch,
		updateField,
		values,
	};
}

function createTransactionNumberSetupColumn({
	branchNameById,
	className,
	header,
	key,
}: {
	branchNameById: Map<string, string>;
	className: string;
	header: string;
	key: TransactionNumberSetupTableColumnKey;
}): ColumnDef<TransactionNumberSetupRecord> {
	if (key === "branchScope") {
		return {
			id: key,
			header,
			accessorFn: (setup) => formatBranchScopeLabel(setup, branchNameById),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "nextNumber") {
		return {
			id: key,
			header,
			accessorFn: (setup) => formatTransactionNumber(setup),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "scope") {
		return {
			id: key,
			header,
			accessorFn: (setup) => {
				if (setup.scope === "all") {
					return "All branches";
				}

				return setup.scope === "branch" ? "Separate per branch" : "Shared";
			},
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

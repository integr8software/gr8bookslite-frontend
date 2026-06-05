"use client";

import { Plus, RotateCcw } from "lucide-react";
import type { FormSignatoryToolbarProps } from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";
import { FormSignatoryFilterOptions } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import {
	ModuleTableFilterSelect,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function FormSignatoryToolbar({
	branch,
	branchOptions,
	isEditing,
	isLoading,
	isScopedRowEdit,
	maxRows,
	module,
	moduleOptions,
	signatoryFilterLabel,
	signatoryCount,
	onAddRow,
	onBranchChange,
	onModuleChange,
	onReset,
	onSignatoryFilterChange,
}: FormSignatoryToolbarProps) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(9rem,0.45fr)_minmax(9rem,0.45fr)]">
			<ModuleTableFilterSelect
				label="Branch"
				value={branch}
				options={branchOptions}
				disabled={isLoading}
				onChange={onBranchChange}
			/>
			<ModuleTableFilterSelect
				label="Module"
				value={module}
				options={moduleOptions}
				disabled={isLoading}
				onChange={onModuleChange}
			/>
			{isEditing ? (
				<>
					{isScopedRowEdit ? null : (
						<button
							type="button"
							onClick={onAddRow}
							aria-disabled={isLoading || signatoryCount >= maxRows}
							disabled={isLoading || signatoryCount >= maxRows}
							className={`${moduleHeaderActionClassNames.primary} h-12 self-end ${
								isLoading || signatoryCount >= maxRows ? "opacity-70" : ""
							}`}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Row
						</button>
					)}
					<button
						type="button"
						onClick={onReset}
						disabled={isLoading}
						className={`${moduleHeaderActionClassNames.secondary} h-12 self-end`}
					>
						<RotateCcw className="h-4 w-4" aria-hidden="true" />
						Reset
					</button>
				</>
			) : (
				<ModuleTableFilterSelect
					label="Show"
					value={signatoryFilterLabel}
					options={FormSignatoryFilterOptions}
					disabled={isLoading}
					onChange={onSignatoryFilterChange}
				/>
			)}
		</ModuleTableToolbar>
	);
}

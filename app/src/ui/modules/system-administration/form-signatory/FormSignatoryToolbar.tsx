"use client";

import { Plus, RotateCcw } from "lucide-react";
import type { FormSignatoryToolbarProps } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";
import { FormSignatoryFilterOptions } from "@/app/src/constants/modules/system-administration/form-signatory/FormSignatoryConstants";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleTableFilterSelect,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

const EmptyModuleDropdownValue = "__empty_module__";

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
	const moduleDropdownOptions = moduleOptions.map<AppAdvancedDropdownOption>(
		(option) => ({
			description: option.value || undefined,
			name: String(option.label),
			value: option.value || EmptyModuleDropdownValue,
		}),
	);

	function handleModuleDropdownChange(value: string | string[]) {
		if (typeof value === "string") {
			onModuleChange(value === EmptyModuleDropdownValue ? "" : value);
		}
	}

	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(9rem,0.45fr)_minmax(9rem,0.45fr)]">
			<ModuleTableFilterSelect
				label="Branch"
				value={branch}
				options={branchOptions}
				disabled={isLoading}
				onChange={onBranchChange}
			/>
			<label className="relative block min-w-0">
				<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
					Module
				</span>
				<AppAdvancedDropdown
					disabled={isLoading}
					emptyMessage="No modules found."
					options={moduleDropdownOptions}
					placeholder="Select Module"
					searchPlaceholder="Search module"
					value={module || EmptyModuleDropdownValue}
					onChange={handleModuleDropdownChange}
				/>
			</label>
			{isEditing ? (
				<>
					{isScopedRowEdit ? null : (
						<button
							type="button"
							onClick={onAddRow}
							aria-disabled={isLoading || signatoryCount >= maxRows}
							disabled={isLoading || signatoryCount >= maxRows}
							className={`${moduleHeaderActionClassNames.primary} h-12 self-end ${isLoading || signatoryCount >= maxRows ? "opacity-70" : ""
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

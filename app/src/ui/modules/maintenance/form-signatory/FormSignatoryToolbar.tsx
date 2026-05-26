"use client";

import { Plus, RotateCcw } from "lucide-react";
import {
	FormSignatoryBranchOptions,
	FormSignatoryModuleOptions,
} from "@/app/src/data/modules/maintenance/form-signatory/FormSignatoryData";
import {
	ModuleTableFilterSelect,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type FormSignatoryToolbarProps = {
	branch: string;
	isEditing: boolean;
	maxRows: number;
	mode: "create" | "edit" | "view";
	module: string;
	signatoryCount: number;
	onAddRow: () => void;
	onBranchChange: (value: string) => void;
	onModuleChange: (value: string) => void;
	onReset: () => void;
};

export function FormSignatoryToolbar({
	branch,
	isEditing,
	maxRows,
	mode,
	module,
	signatoryCount,
	onAddRow,
	onBranchChange,
	onModuleChange,
	onReset,
}: FormSignatoryToolbarProps) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(9rem,0.45fr)_minmax(9rem,0.45fr)]">
			<ModuleTableFilterSelect
				label="Branch"
				value={branch}
				options={FormSignatoryBranchOptions}
				disabled={mode === "edit"}
				onChange={onBranchChange}
			/>
			<ModuleTableFilterSelect
				label="Module"
				value={module}
				options={FormSignatoryModuleOptions}
				disabled={mode === "edit"}
				onChange={onModuleChange}
			/>
			{isEditing ? (
				<>
					<button
						type="button"
						onClick={onAddRow}
						aria-disabled={signatoryCount >= maxRows}
						className={`${moduleHeaderActionClassNames.primary} h-12 self-end ${
							signatoryCount >= maxRows ? "opacity-70" : ""
						}`}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Row
					</button>
					<button
						type="button"
						onClick={onReset}
						className={`${moduleHeaderActionClassNames.secondary} h-12 self-end`}
					>
						<RotateCcw className="h-4 w-4" aria-hidden="true" />
						Reset
					</button>
				</>
			) : (
				<div className="relative flex h-12 items-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5">
					<span className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-darknavy/70">
						No. of Signatories
					</span>
					{signatoryCount}{" "}
					{signatoryCount === 1 ? "Signatory" : "Signatories"}
				</div>
			)}
		</ModuleTableToolbar>
	);
}

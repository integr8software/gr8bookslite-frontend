"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Edit3, Save, Trash2, X } from "lucide-react";
import {
	TermManagementActionCopy,
	TermManagementDatemodeOptions,
	TermManagementHref,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementActionPage";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import type {
	TermManagement,
	TermManagementActionMode,
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function TermManagementActionPage() {
	const page = useTermManagementActionPage();
	const copy = TermManagementActionCopy[page.mode];

	if (page.needsRecord && !page.existingTerm) {
		return <TermManagementNotFound />;
	}

	return (
		<>
			<form onSubmit={page.handleSubmit} className="grid gap-5">
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={copy.title}
					description={copy.description}
					eyebrow={
						<>
							<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
							Accounting master data
						</>
					}
					actions={
						<TermManagementActionButtons
							isReadonly={page.isReadonly}
							mode={page.mode}
							term={page.existingTerm}
							onDeleteTerm={() => page.setIsDeleteDialogOpen(true)}
						/>
					}
				/>
				<TermManagementDetailsFields
					errors={page.errors}
					isReadonly={page.isReadonly}
					values={page.values}
					onInputChange={page.handleInputChange}
				/>
			</form>
			<AppConfirmDialog
				isOpen={page.isDeleteDialogOpen}
				isPending={page.isMutating}
				title="Delete term definition?"
				description={`This will remove ${page.existingTerm?.description ?? "the selected term"}.`}
				confirmLabel="Delete Term"
				tone="danger"
				onCancel={() => page.setIsDeleteDialogOpen(false)}
				onConfirm={page.handleConfirmDelete}
			/>
		</>
	);
}

function TermManagementActionButtons({
	term,
	isReadonly,
	mode,
	onDeleteTerm,
}: {
	term?: TermManagement;
	isReadonly: boolean;
	mode: TermManagementActionMode;
	onDeleteTerm: () => void;
}) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={TermManagementHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && term ? (
				<Link
					href={`${TermManagementHref}/edit/${term.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{term ? (
				<button
					type="button"
					onClick={onDeleteTerm}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && term ? (
				<Link
					href={`${TermManagementHref}/view/${term.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button
					type="submit"
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Term
				</button>
			) : null}
		</>
	);
}

function TermManagementDetailsFields({
	errors,
	isReadonly,
	values,
	onInputChange,
}: {
	errors: TermManagementFormErrors;
	isReadonly: boolean;
	values: TermManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="grid gap-4 lg:grid-cols-3">
				<Field label="Description" error={errors.description} required>
					<input
						name="description"
						value={values.description}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter description"
					/>
				</Field>

				<Field label="Datemode" error={errors.datemode} required>
					<select
						name="datemode"
						value={values.datemode}
						onChange={onInputChange}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{TermManagementDatemodeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</Field>

				<Field label="Period" error={errors.period} required>
					<input
						name="period"
						type="number"
						min={1}
						value={values.period}
						onChange={onInputChange}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="Enter period"
					/>
				</Field>
			</div>
		</div>
	);
}

function TermManagementNotFound() {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">Term not found</h2>
			<p className="mt-2 text-sm text-darknavy/65">
				The requested term record does not exist or has already been removed.
			</p>
		</div>
	);
}

function Field({
	children,
	className,
	error,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

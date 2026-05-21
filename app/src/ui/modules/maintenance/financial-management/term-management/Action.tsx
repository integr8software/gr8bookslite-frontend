"use client";

import {
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import {
	TermManagementActionCopy,
	TermManagementDatemodeOptions,
	TermManagementHref,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import {
	TermManagementInitialFormValues,
	createTermManagementFormValues,
	createTermManagementFromForm,
	updateTermManagementFromForm,
	validateTermManagementForm,
} from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementData";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type {
	TermManagement,
	TermManagementActionMode,
	TermManagementFormErrors,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function FinancialManagementTermManagementAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const terms = useTermManagementStore((state) => state.terms);
	const addTerm = useTermManagementStore((state) => state.addTerm);
	const updateTerm = useTermManagementStore((state) => state.updateTerm);
	const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const mode = getActionMode(pathname);
	const existingTerm = terms.find((term) => term.id === params.recordId);
	const isReadonly = mode === "view";
	const [values, setValues] = useState<TermManagementFormValues>(() =>
		existingTerm
			? createTermManagementFormValues(existingTerm)
			: TermManagementInitialFormValues,
	);
	const [errors, setErrors] = useState<TermManagementFormErrors>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function updateField(
		field: keyof TermManagementFormValues,
		value: TermManagementFormValues[keyof TermManagementFormValues],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		updateField(
			event.target.name as keyof TermManagementFormValues,
			event.target.value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateTermManagementForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingTerm) {
			updateTerm(updateTermManagementFromForm(existingTerm, values));
		} else {
			addTerm(createTermManagementFromForm(values));
		}

		router.push(TermManagementHref);
	}

	function handleConfirmDelete() {
		if (!existingTerm) {
			return;
		}

		deleteTerm(existingTerm.id);
		setIsDeleteDialogOpen(false);
		router.push(TermManagementHref);
	}

	if ((mode === "edit" || mode === "view") && !existingTerm) {
		return <TermManagementNotFound />;
	}

	return (
		<>
			<form onSubmit={handleSubmit} className="grid gap-5">
				<TermManagementActionHeader
					term={existingTerm}
					isReadonly={isReadonly}
					mode={mode}
					onDeleteTerm={() => setIsDeleteDialogOpen(true)}
				/>
				<TermManagementDetailsFields
					errors={errors}
					isReadonly={isReadonly}
					values={values}
					onInputChange={handleInputChange}
				/>
			</form>
			<AppConfirmDialog
				isOpen={isDeleteDialogOpen}
				isPending={isMutating}
				title="Delete term definition?"
				description={`This will remove ${existingTerm?.description ?? "the selected term"}.`}
				confirmLabel="Delete Term"
				tone="danger"
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}

function TermManagementActionHeader({
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
	const copy = TermManagementActionCopy[mode];

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h2 className="text-xl font-semibold text-darknavy">{copy.title}</h2>
				<p className="mt-1 text-sm text-darknavy/55">{copy.description}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{mode === "view" ? (
					<Link href={TermManagementHref} className={secondaryButtonClassName}>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
				) : null}
				{mode === "view" && term ? (
					<Link
						href={`${TermManagementHref}/edit/${term.id}`}
						className={secondaryButtonClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
						Edit
					</Link>
				) : null}
				{term ? (
					<button
						type="button"
						onClick={onDeleteTerm}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink shadow-sm transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
						Delete
					</button>
				) : null}
				{mode === "edit" && term ? (
					<Link href={`${TermManagementHref}/view/${term.id}`} className={secondaryButtonClassName}>
						<X className="h-4 w-4" aria-hidden="true" />
						Cancel
					</Link>
				) : null}
				{!isReadonly ? (
					<button
						type="submit"
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						Save Term
					</button>
				) : null}
			</div>
		</div>
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
	onInputChange: (
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void;
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
	children: React.ReactNode;
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

const secondaryButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

function getActionMode(pathname: string): TermManagementActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

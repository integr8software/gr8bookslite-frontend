"use client";

import {
	useCallback,
	useEffect,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { TermManagementDatemodeOptions } from "@/app/src/constants/modules/maintenance/term-management/TermManagementConstants";
import { createTerm } from "@/app/src/services/modules/maintenance/term-management/TermManagementApi";
import type {
	TermManagement,
	TermManagementDatemode,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { validateTermManagementForm } from "@/app/src/validations/modules/maintenance/term-management/TermManagementValidation";

export function TermDialog({
	isOpen,
	onClose,
	onSaved,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSaved: (term: TermManagement) => void;
}) {
	const [values, setValues] = useState<TermManagementFormValues>({
		name: "",
		description: "",
		datemode: "Day",
		period: "0",
		status: "Active",
	});
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setValues({
				name: "",
				description: "",
				datemode: "Day",
				period: "0",
				status: "Active",
			});
			setError("");
		});

		return () => window.clearTimeout(timeoutId);
	}, [isOpen]);

	const handleSave = useCallback(async () => {
		const normalizedValues = {
			...values,
			name: values.name.trim(),
			period: normalizeWholeNumberText(values.period),
		};
		const nextErrors = validateTermManagementForm(normalizedValues);
		const nextError =
			nextErrors.name ??
			nextErrors.datemode ??
			nextErrors.period ??
			nextErrors.status ??
			nextErrors.description;

		if (nextError) {
			setValues(normalizedValues);
			setError(nextError);
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			const savedTerm = await createTerm(normalizedValues);

			onSaved(savedTerm);
			toast.success("Terms saved.");
		} catch (error) {
			setError(getErrorMessage(error, "Could not save terms."));
		} finally {
			setIsSaving(false);
		}
	}, [onSaved, values]);

	useDialogKeyboard({
		canSubmit: true,
		isOpen,
		isPending: isSaving,
		onClose,
		onSubmit: handleSave,
	});

	if (!isOpen) {
		return null;
	}

	return (
		<QuickAddDialogShell
			error={error}
			isPending={isSaving}
			title="Add Terms"
			onClose={onClose}
			onSave={handleSave}
		>
			<label className="grid gap-2">
				<span className="text-sm font-semibold text-darknavy">
					Term Name <span className="text-coralpink">*</span>
				</span>
				<input
					value={values.name}
					disabled={isSaving}
					onChange={(event) => {
						setValues((current) => ({ ...current, name: event.target.value }));
						setError("");
					}}
					className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
				/>
			</label>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Date Mode</span>
					<select
						value={values.datemode}
						disabled={isSaving}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								datemode: event.target.value as TermManagementDatemode,
							}))
						}
						className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					>
						{TermManagementDatemodeOptions.map((dateMode) => (
							<option key={dateMode} value={dateMode}>
								{dateMode}
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Period</span>
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={values.period}
						disabled={isSaving}
						onChange={(event) => {
							const period = normalizeWholeNumberText(event.target.value);

							setValues((current) => ({
								...current,
								period,
							}));
							setError("");
						}}
						onKeyDown={preventNonWholeNumberInput}
						onPaste={(event) => {
							const pastedText = event.clipboardData.getData("text");

							if (!isWholeNumberText(pastedText.trim())) {
								event.preventDefault();
							}
						}}
						className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
					/>
				</label>
			</div>
		</QuickAddDialogShell>
	);
}

function QuickAddDialogShell({
	children,
	error,
	isPending,
	saveDisabled,
	title,
	onClose,
	onSave,
}: {
	children: ReactNode;
	error?: string;
	isPending: boolean;
	saveDisabled?: boolean;
	title: string;
	onClose: () => void;
	onSave: () => void | Promise<void>;
}) {
	return (
		<div
			role="presentation"
			className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !isPending) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="party-quick-add-dialog-title"
				className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
			>
				<h2
					id="party-quick-add-dialog-title"
					className="text-base font-semibold text-darknavy"
				>
					{title}
				</h2>
				<div className="mt-5 grid gap-4">{children}</div>
				{error ? (
					<p className="mt-4 rounded-md border border-coralpink/20 bg-coralpink/5 px-3 py-2 text-sm font-semibold text-coralpink">
						{error}
					</p>
				) : null}
				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						disabled={isPending}
						onClick={onClose}
						className="inline-flex h-10 min-w-28 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={isPending || saveDisabled}
						onClick={() => void onSave()}
						className="app-dialog-primary-button inline-flex h-10 min-w-32 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						Save
					</button>
				</div>
			</section>
		</div>
	);
}

function useDialogKeyboard({
	canSubmit,
	isOpen,
	isPending,
	onClose,
	onSubmit,
}: {
	canSubmit: boolean;
	isOpen: boolean;
	isPending: boolean;
	onClose: () => void;
	onSubmit: () => void | Promise<void>;
}) {
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape" && !isPending) {
				onClose();
				return;
			}

			if (event.key === "Enter" && !isPending && canSubmit) {
				event.preventDefault();
				void onSubmit();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [canSubmit, isOpen, isPending, onClose, onSubmit]);
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

const blockedWholeNumberKeys = new Set(["e", "E", "+", "-", "."]);

function preventNonWholeNumberInput(event: ReactKeyboardEvent<HTMLInputElement>) {
	if (blockedWholeNumberKeys.has(event.key)) {
		event.preventDefault();
	}
}

function normalizeWholeNumberText(value: string) {
	return value.replace(/\D/g, "");
}

function isWholeNumberText(value: string) {
	return /^\d+$/.test(value);
}

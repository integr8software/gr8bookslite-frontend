"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyTaxFormValues } from "@/app/src/constants/modules/maintenance/tax-maintenance/TaxMaintenanceConstants";
import { createTaxMaintenance } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceApi";
import type {
	TaxMaintenance,
	TaxMaintenanceDefaultAccountIds,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export function TaxRegistrationTypeDialog({
	defaultAccountIds,
	isOpen,
	onClose,
	onSaved,
}: {
	defaultAccountIds?: TaxMaintenanceDefaultAccountIds;
	isOpen: boolean;
	onClose: () => void;
	onSaved: (tax: TaxMaintenance) => void;
}) {
	const [name, setName] = useState("");
	const [percentage, setPercentage] = useState("0");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setName("");
			setPercentage("0");
			setError("");
		});

		return () => window.clearTimeout(timeoutId);
	}, [isOpen]);

	const handleSave = useCallback(async () => {
		const trimmedName = name.trim();

		if (!trimmedName) {
			setError("Tax registration type is required.");
			return;
		}

		if (!defaultAccountIds) {
			setError("Tax accounts are still loading.");
			return;
		}

		setIsSaving(true);
		setError("");

		try {
			const savedTax = await createTaxMaintenance({
				...EmptyTaxFormValues,
				...defaultAccountIds,
				name: trimmedName,
				percentage,
				status: "Active",
			});

			onSaved(savedTax);
			toast.success("Tax registration type saved.");
		} catch (error) {
			setError(getErrorMessage(error, "Could not save tax registration type."));
		} finally {
			setIsSaving(false);
		}
	}, [defaultAccountIds, name, onSaved, percentage]);

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
		<div
			role="presentation"
			className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !isSaving) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="party-tax-registration-type-dialog-title"
				className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
			>
				<h2
					id="party-tax-registration-type-dialog-title"
					className="text-base font-semibold text-darknavy"
				>
					Add Tax Registration Type
				</h2>
				<div className="mt-5 grid gap-4">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Tax Registration Type <span className="text-coralpink">*</span>
						</span>
						<input
							value={name}
							disabled={isSaving}
							onChange={(event) => setName(event.target.value)}
							className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
						/>
					</label>
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Percentage
						</span>
						<input
							type="number"
							min="0"
							max="100"
							step="0.0001"
							value={percentage}
							disabled={isSaving}
							onChange={(event) => setPercentage(event.target.value)}
							className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
						/>
					</label>
				</div>
				{error ? (
					<p className="mt-4 rounded-md border border-coralpink/20 bg-coralpink/5 px-3 py-2 text-sm font-semibold text-coralpink">
						{error}
					</p>
				) : null}
				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						disabled={isSaving}
						onClick={onClose}
						className="inline-flex h-10 min-w-28 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={isSaving}
						onClick={() => void handleSave()}
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

"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import {
	PriceListsDrawerFormId,
	PriceListsFieldClassName,
} from "@/app/src/constants/modules/maintenance/price-lists/PriceListsConstants";
import { createPriceListFormValues } from "@/app/src/data/modules/maintenance/price-lists/PriceListsData";
import type {
	PriceListDrawerState,
	PriceListFormValues,
	PriceListStatus,
} from "@/app/src/types/modules/maintenance/price-lists/PriceListsTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type PriceListsDrawerProps = {
	drawer: PriceListDrawerState;
	onClose: () => void;
	onSave: (values: PriceListFormValues) => void;
};

export function PriceListsDrawer({
	drawer,
	onClose,
	onSave,
}: PriceListsDrawerProps) {
	const [values, setValues] = useState(() =>
		createPriceListFormValues(drawer?.record),
	);

	if (!drawer) {
		return null;
	}

	const isReadonly = drawer.mode === "view";
	const title =
		drawer.mode === "add"
			? "Add Price List"
			: drawer.mode === "edit"
				? `Edit ${drawer.record?.name ?? "Price List"}`
				: drawer.record?.name ?? "Price List";

	return (
		<ModuleDrawer
			isOpen
			title={title}
			description="Maintain price list setup details."
			position="right"
			maxWidthClassName="max-w-xl"
			onClose={onClose}
			footer={
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className={moduleHeaderActionClassNames.secondary}
					>
						{isReadonly ? "Close" : "Cancel"}
					</button>
					{!isReadonly ? (
						<button
							type="submit"
							form={PriceListsDrawerFormId}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					) : null}
				</div>
			}
		>
			<form
				id={PriceListsDrawerFormId}
				className="grid gap-4 px-6 py-5"
				onSubmit={(event) => {
					event.preventDefault();
					onSave(values);
				}}
			>
				<Field label="Price List Code" required>
					<input
						value={values.code}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								code: event.target.value,
							}))
						}
						className={PriceListsFieldClassName}
					/>
				</Field>
				<Field label="Price List" required>
					<input
						value={values.name}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								name: event.target.value,
							}))
						}
						className={PriceListsFieldClassName}
					/>
				</Field>
				<Field label="Customer Group">
					<input
						value={values.customerGroup}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								customerGroup: event.target.value,
							}))
						}
						className={PriceListsFieldClassName}
					/>
				</Field>
				<Field label="Currency" required>
					<input
						value={values.currencyCode}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								currencyCode: event.target.value.toUpperCase(),
							}))
						}
						className={PriceListsFieldClassName}
					/>
				</Field>
				<Field label="Status" required>
					<select
						value={values.status}
						disabled={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								status: event.target.value as PriceListStatus,
							}))
						}
						className={PriceListsFieldClassName}
					>
						<option>Active</option>
						<option>Inactive</option>
					</select>
				</Field>
			</form>
		</ModuleDrawer>
	);
}

function Field({
	children,
	label,
	required,
}: {
	children: React.ReactNode;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
		</label>
	);
}

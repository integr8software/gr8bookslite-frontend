"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
	ItemAttributesDrawerFormId,
	ItemAttributesFieldClassName,
} from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import { createItemAttributeFormValues } from "@/app/src/data/modules/maintenance/item-attributes/ItemAttributesData";
import type {
	ItemAttributeFormValues,
	ItemAttributeStatus,
	ItemAttributesListPageState,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ItemAttributesDrawerProps = {
	drawer: ItemAttributesListPageState["drawer"];
	onClose: () => void;
	onSave: (values: ItemAttributeFormValues) => void;
};

export function ItemAttributesDrawer({
	drawer,
	onClose,
	onSave,
}: ItemAttributesDrawerProps) {
	const [values, setValues] = useState(() =>
		createItemAttributeFormValues(drawer?.record),
	);

	if (!drawer) {
		return null;
	}

	const isReadonly = drawer.mode === "view";
	const title =
		drawer.mode === "add"
			? "Add Item Attribute"
			: drawer.mode === "edit"
				? `Edit ${drawer.record?.name ?? "Item Attribute"}`
				: drawer.record?.name ?? "Item Attribute";

	function updateValue(index: number, value: string) {
		setValues((current) => ({
			...current,
			values: current.values.map((entry, currentIndex) =>
				currentIndex === index ? value : entry,
			),
		}));
	}

	return (
		<ModuleDrawer
			isOpen
			title={title}
			description="Maintain the attribute name and reusable values."
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
							form={ItemAttributesDrawerFormId}
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
				id={ItemAttributesDrawerFormId}
				className="grid gap-4 px-6 py-5"
				onSubmit={(event) => {
					event.preventDefault();
					onSave(values);
				}}
			>
				<label>
					<span className="mb-2 block text-sm font-semibold text-darknavy">
						Attribute Name <span className="text-coralpink">*</span>
					</span>
					<input
						value={values.name}
						readOnly={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								name: event.target.value,
							}))
						}
						className={ItemAttributesFieldClassName}
					/>
				</label>
				<div>
					<div className="mb-2 flex items-center justify-between gap-3">
						<span className="text-sm font-semibold text-darknavy">Values</span>
						{!isReadonly ? (
							<button
								type="button"
								className={moduleHeaderActionClassNames.secondary}
								onClick={() =>
									setValues((current) => ({
										...current,
										values: [...current.values, ""],
									}))
								}
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add Value
							</button>
						) : null}
					</div>
					<div className="grid gap-2">
						{values.values.map((value, index) => (
							<div key={index} className="flex gap-2">
								<input
									value={value}
									readOnly={isReadonly}
									onChange={(event) => updateValue(index, event.target.value)}
									className={ItemAttributesFieldClassName}
								/>
								{!isReadonly ? (
									<button
										type="button"
										className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-coralpink/25 bg-white text-coralpink transition hover:bg-coralpink/10"
										aria-label="Remove value"
										onClick={() =>
											setValues((current) => ({
												...current,
												values:
													current.values.length > 1
														? current.values.filter(
																(_, currentIndex) =>
																	currentIndex !== index,
															)
														: [""],
											}))
										}
									>
										<Trash2 className="h-4 w-4" aria-hidden="true" />
									</button>
								) : null}
							</div>
						))}
					</div>
				</div>
				<label>
					<span className="mb-2 block text-sm font-semibold text-darknavy">
						Status <span className="text-coralpink">*</span>
					</span>
					<select
						value={values.status}
						disabled={isReadonly}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								status: event.target.value as ItemAttributeStatus,
							}))
						}
						className={ItemAttributesFieldClassName}
					>
						<option>Active</option>
						<option>Inactive</option>
					</select>
				</label>
			</form>
		</ModuleDrawer>
	);
}

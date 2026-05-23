import { Plus, Trash2 } from "lucide-react";
import { ItemUomOptions } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { ItemBundleComponent } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type ItemBundleComponentsTableProps = {
	components: ItemBundleComponent[];
	error?: string;
	isReadonly: boolean;
	onAddComponent: () => void;
	onRemoveComponent: (componentId: string) => void;
	onUpdateComponent: (
		componentId: string,
		field: keyof ItemBundleComponent,
		value: string,
	) => void;
};

export function ItemBundleComponentsTable({
	components,
	error,
	isReadonly,
	onAddComponent,
	onRemoveComponent,
	onUpdateComponent,
}: ItemBundleComponentsTableProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Bundle Components
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Add the component items included when this item is used as a bundle.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddComponent}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Component
					</button>
				) : null}
			</div>
			{error ? (
				<p className="mt-3 text-sm font-medium text-coralpink">{error}</p>
			) : null}
			<div className="mt-4 overflow-auto">
				<table className="w-full min-w-[48rem] text-left text-sm">
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-3 py-3">Code</th>
							<th className="px-3 py-3">Item</th>
							<th className="px-3 py-3 text-right">Quantity</th>
							<th className="px-3 py-3">UOM</th>
							<th className="px-3 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{components.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-3 py-6 text-center text-sm text-darknavy/55"
								>
									No bundle components added.
								</td>
							</tr>
						) : null}
						{components.map((component) => (
							<tr key={component.id}>
								<td className="px-3 py-3">
									<input
										value={component.itemCode}
										onChange={(event) =>
											onUpdateComponent(
												component.id,
												"itemCode",
												event.target.value,
											)
										}
										readOnly={isReadonly}
										className={fieldClassName}
										placeholder="ITM-0001"
									/>
								</td>
								<td className="px-3 py-3">
									<input
										value={component.itemName}
										onChange={(event) =>
											onUpdateComponent(
												component.id,
												"itemName",
												event.target.value,
											)
										}
										readOnly={isReadonly}
										className={fieldClassName}
										placeholder="Component item"
									/>
								</td>
								<td className="px-3 py-3">
									<input
										type="number"
										min={0}
										value={component.quantity}
										onChange={(event) =>
											onUpdateComponent(
												component.id,
												"quantity",
												event.target.value,
											)
										}
										readOnly={isReadonly}
										className={`${fieldClassName} text-right`}
									/>
								</td>
								<td className="px-3 py-3">
									<select
										value={component.uom}
										onChange={(event) =>
											onUpdateComponent(component.id, "uom", event.target.value)
										}
										disabled={isReadonly}
										className={fieldClassName}
									>
										{ItemUomOptions.map((uom) => (
											<option key={uom} value={uom}>
												{uom}
											</option>
										))}
									</select>
								</td>
								<td className="px-3 py-3 text-right">
									{!isReadonly ? (
										<button
											type="button"
											onClick={() => onRemoveComponent(component.id)}
											aria-label={`Remove ${component.itemName || "component"}`}
											className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
										>
											<Trash2 className="h-4 w-4" aria-hidden="true" />
										</button>
									) : null}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";


import { Plus } from "lucide-react";
import { ItemUomOptions } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { ItemUomConversion } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/ModuleTableActions";

type ItemUomConversionsTableProps = {
	conversions: ItemUomConversion[];
	isReadonly: boolean;
	onAddConversion: () => void;
	onRemoveConversion: (conversionId: string) => void;
	onUpdateConversion: (
		conversionId: string,
		field: keyof ItemUomConversion,
		value: string,
	) => void;
};

export function ItemUomConversionsTable({
	conversions,
	isReadonly,
	onAddConversion,
	onRemoveConversion,
	onUpdateConversion,
}: ItemUomConversionsTableProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						UOM Conversions
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Define item-specific conversions such as 1 BOX = 12 PCS.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddConversion}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Conversion
					</button>
				) : null}
			</div>
			<div className="mt-4 overflow-auto">
				<table className="w-full min-w-152 text-left text-sm">
					<thead className="bg-darknavy/30 text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-3 py-3">From</th>
							<th className="px-3 py-3 text-right">Quantity</th>
							<th className="px-3 py-3">To</th>
							<th className="px-3 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{conversions.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-3 py-6 text-center text-sm text-darknavy/55"
								>
									No UOM conversions added.
								</td>
							</tr>
						) : null}
						{conversions.map((conversion) => (
							<tr key={conversion.id}>
								<td className="px-3 py-3">
									<UomSelect
										isReadonly={isReadonly}
										value={conversion.fromUom}
										onChange={(value) =>
											onUpdateConversion(conversion.id, "fromUom", value)
										}
									/>
								</td>
								<td className="px-3 py-3">
									<input
										type="number"
										min={0}
										step="0.0001"
										value={conversion.quantity}
										onChange={(event) =>
											onUpdateConversion(
												conversion.id,
												"quantity",
												event.target.value,
											)
										}
										readOnly={isReadonly}
										className={`${fieldClassName} text-right`}
									/>
								</td>
								<td className="px-3 py-3">
									<UomSelect
										isReadonly={isReadonly}
										value={conversion.toUom}
										onChange={(value) =>
											onUpdateConversion(conversion.id, "toUom", value)
										}
									/>
								</td>
								<td className="px-3 py-3 text-right">
									{!isReadonly ? (
										<ModuleTableActionButton
											variant="delete"
											onClick={() => onRemoveConversion(conversion.id)}
											label="Remove conversion"
										/>
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

function UomSelect({
	isReadonly,
	onChange,
	value,
}: {
	isReadonly: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<select
			value={value}
			onChange={(event) => onChange(event.target.value)}
			disabled={isReadonly}
			className={fieldClassName}
		>
			{ItemUomOptions.map((uom) => (
				<option key={uom} value={uom}>
					{uom}
				</option>
			))}
		</select>
	);
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

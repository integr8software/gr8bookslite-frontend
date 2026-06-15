import { Plus } from "lucide-react";
import type {
	ItemAttributeAssignment,
	ItemAttributeRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type ItemAttributesTableProps = {
	assignments: ItemAttributeAssignment[];
	attributes: ItemAttributeRecord[];
	isReadonly: boolean;
	onAddAssignment: () => void;
	onRemoveAssignment: (assignmentId: string) => void;
	onUpdateAssignment: (
		assignmentId: string,
		field: keyof ItemAttributeAssignment,
		value: string,
	) => void;
};

export function ItemAttributesTable({
	assignments,
	attributes,
	isReadonly,
	onAddAssignment,
	onRemoveAssignment,
	onUpdateAssignment,
}: ItemAttributesTableProps) {
	const activeAttributes = attributes.filter(
		(attribute) => attribute.status === "Active",
	);

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Item Attributes
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Attach searchable attributes used by variants, stock classification, and item filtering.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddAssignment}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Attribute
					</button>
				) : null}
			</div>
			<div className="mt-4 overflow-auto">
				<table className="w-full min-w-[48rem] text-left text-sm">
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-3 py-3">Attribute</th>
							<th className="px-3 py-3">Value</th>
							<th className="px-3 py-3">Usage</th>
							<th className="px-3 py-3 text-center">Stock</th>
							<th className="px-3 py-3 text-center">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{assignments.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-3 py-6 text-center text-sm text-darknavy/55">
									No item attributes added.
								</td>
							</tr>
						) : null}
						{assignments.map((assignment) => {
							const attribute = attributes.find(
								(currentAttribute) =>
									currentAttribute.id === assignment.attributeId,
							);

							return (
								<tr key={assignment.id}>
									<td className="px-3 py-3">
										<select
											value={assignment.attributeId}
											disabled={isReadonly}
											onChange={(event) =>
												onUpdateAssignment(
													assignment.id,
													"attributeId",
													event.target.value,
												)
											}
											className={fieldClassName}
										>
											<option value="">Select attribute</option>
											{activeAttributes.map((option) => (
												<option key={option.id} value={option.id}>
													{option.name}
												</option>
											))}
										</select>
									</td>
									<td className="px-3 py-3">
										<select
											value={assignment.value}
											disabled={isReadonly || !attribute}
											onChange={(event) =>
												onUpdateAssignment(
													assignment.id,
													"value",
													event.target.value,
												)
											}
											className={fieldClassName}
										>
											<option value="">Select value</option>
											{(attribute?.values ?? []).map((value) => (
												<option key={value} value={value}>
													{value}
												</option>
											))}
										</select>
									</td>
									<td className="px-3 py-3 text-darknavy/70">
										{attribute?.usage ?? "Unassigned"}
									</td>
									<td className="px-3 py-3 text-center">
										{attribute?.affectsStock ? "Yes" : "No"}
									</td>
									<td className="px-3 py-3 text-center">
										{!isReadonly ? (
											<ModuleTableActionButton
												variant="delete"
												label="Remove attribute"
												onClick={() => onRemoveAssignment(assignment.id)}
											/>
										) : null}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";

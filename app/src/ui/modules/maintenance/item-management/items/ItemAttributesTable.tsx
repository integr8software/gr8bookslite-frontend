import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import type {
	ItemAttributeAssignment,
	ItemAttributeRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

const MaxItemAttributeAssignments = 5;

type ItemAttributesTableProps = {
	assignments: ItemAttributeAssignment[];
	attributes: ItemAttributeRecord[];
	isReadonly: boolean;
	onAddAssignment: () => void;
	onRemoveAssignment: (assignmentId: string) => void;
	onReorderAssignment: (assignmentId: string, overAssignmentId: string) => void;
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
	onReorderAssignment,
	onUpdateAssignment,
}: ItemAttributesTableProps) {
	const activeAttributes = attributes.filter(
		(attribute) => attribute.status === "Active",
	);
	const isAtLimit = assignments.length >= MaxItemAttributeAssignments;
	const hasPendingAttribute = assignments.some(
		(assignment) => !assignment.attributeId,
	);
	const [draggedAssignmentId, setDraggedAssignmentId] = useState<string | null>(
		null,
	);
	const hasAvailableAttribute = activeAttributes.some(
		(attribute) =>
			!assignments.some(
				(assignment) => assignment.attributeId === attribute.id,
			),
	);

	function handleDrop(overAssignmentId: string) {
		if (!draggedAssignmentId || draggedAssignmentId === overAssignmentId) {
			return;
		}

		onReorderAssignment(draggedAssignmentId, overAssignmentId);
		setDraggedAssignmentId(null);
	}

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Item Attributes
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Attach up to {MaxItemAttributeAssignments} searchable attributes used
						by variants, stock classification, and item filtering.
					</p>
				</div>
				{!isReadonly ? (
					<button
						type="button"
						onClick={onAddAssignment}
						disabled={isAtLimit || hasPendingAttribute || !hasAvailableAttribute}
						className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-darknavy/75`}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Attribute ({assignments.length}/{MaxItemAttributeAssignments})
					</button>
				) : null}
			</div>
			<div className="mt-4 overflow-x-auto overflow-y-hidden pb-1">
				<table className="w-full min-w-[46rem] table-fixed border-collapse text-left text-sm">
					<colgroup>
						<col className="w-8" />
						<col className="w-8" />
						<col className="w-[22rem]" />
						<col className="w-[16rem]" />
						<col className="w-[7rem]" />
					</colgroup>
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-1 py-3">
								<span className="sr-only">Order</span>
							</th>
							<th className="px-1 py-3">No.</th>
							<th className="px-3 py-3">Attribute</th>
							<th className="px-3 py-3">Value</th>
							<th className="px-3 py-3 text-center">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{assignments.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-3 py-6 text-center text-sm text-darknavy/55"
								>
									No item attributes added.
								</td>
							</tr>
						) : null}
						{assignments.map((assignment, index) => (
							<ItemAttributeRow
								key={assignment.id}
								activeAttributes={activeAttributes}
								assignment={assignment}
								assignmentNumber={index + 1}
								assignments={assignments}
								attributes={attributes}
								draggedAssignmentId={draggedAssignmentId}
								isReadonly={isReadonly}
								onDragEnd={() => setDraggedAssignmentId(null)}
								onDragStart={() => setDraggedAssignmentId(assignment.id)}
								onDrop={() => handleDrop(assignment.id)}
								onRemoveAssignment={onRemoveAssignment}
								onUpdateAssignment={onUpdateAssignment}
							/>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function ItemAttributeRow({
	activeAttributes,
	assignment,
	assignmentNumber,
	assignments,
	attributes,
	draggedAssignmentId,
	isReadonly,
	onDragEnd,
	onDragStart,
	onDrop,
	onRemoveAssignment,
	onUpdateAssignment,
}: {
	activeAttributes: ItemAttributeRecord[];
	assignment: ItemAttributeAssignment;
	assignmentNumber: number;
	assignments: ItemAttributeAssignment[];
	attributes: ItemAttributeRecord[];
	draggedAssignmentId: string | null;
	isReadonly: boolean;
	onDragEnd: () => void;
	onDragStart: () => void;
	onDrop: () => void;
	onRemoveAssignment: (assignmentId: string) => void;
	onUpdateAssignment: (
		assignmentId: string,
		field: keyof ItemAttributeAssignment,
		value: string,
	) => void;
}) {
	const attribute = attributes.find(
		(currentAttribute) => currentAttribute.id === assignment.attributeId,
	);
	const selectableAttributes = getSelectableAttributes(
		activeAttributes,
		assignments,
		assignment.id,
	);
	const attributeOptions = createAttributeDropdownOptions(selectableAttributes);
	const isDragging = draggedAssignmentId === assignment.id;

	return (
		<tr
			onDragOver={(event) => {
				if (!isReadonly) {
					event.preventDefault();
				}
			}}
			onDrop={onDrop}
			className={isDragging ? "relative z-10 bg-skyblue/5 shadow-sm" : undefined}
		>
			<td className="px-1 py-3 text-center">
				<button
					type="button"
					draggable={!isReadonly}
					disabled={isReadonly}
					aria-label={`Drag attribute ${assignmentNumber} to reorder`}
					onDragEnd={onDragEnd}
					onDragStart={onDragStart}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30 disabled:cursor-default disabled:opacity-30"
				>
					<GripVertical className="h-4 w-4" aria-hidden="true" />
				</button>
			</td>
			<td className="px-1 py-3 font-semibold text-darknavy/70">
				{assignmentNumber}
			</td>
			<td className="px-3 py-3">
				<AppAdvancedDropdown
					isClearable
					menuPortal
					options={attributeOptions}
					placeholder="--Select Attribute--"
					readOnly={isReadonly}
					showSelectedDetails
					value={assignment.attributeId}
					onChange={(value) =>
						onUpdateAssignment(
							assignment.id,
							"attributeId",
							String(value),
						)
					}
				/>
			</td>
			<td className="px-3 py-3">
				<select
					value={assignment.value}
					disabled={isReadonly || !attribute}
					onChange={(event) =>
						onUpdateAssignment(assignment.id, "value", event.target.value)
					}
					className={fieldClassName}
				>
					<option value="">--Select Value--</option>
					{(attribute?.values ?? []).map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
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
}

function getSelectableAttributes(
	activeAttributes: ItemAttributeRecord[],
	assignments: ItemAttributeAssignment[],
	assignmentId: string,
) {
	const selectedAttributeIds = new Set(
		assignments
			.filter((assignment) => assignment.id !== assignmentId)
			.map((assignment) => assignment.attributeId)
			.filter(Boolean),
	);

	return activeAttributes.filter(
		(attribute) => !selectedAttributeIds.has(attribute.id),
	);
}

function createAttributeDropdownOptions(
	attributes: ItemAttributeRecord[],
): AppAdvancedDropdownOption[] {
	return attributes.map((attribute) => ({
		description: attribute.usage,
		name: attribute.name,
		value: attribute.id,
	}));
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy";

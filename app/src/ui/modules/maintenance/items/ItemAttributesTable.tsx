import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import type {
	ItemAttributeAssignment,
	ItemAttributeRecord,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

const MaxItemAttributeAssignments = 5;
type DropIndicator = {
	assignmentId: string;
	position: "after" | "before";
};

type ItemAttributesTableProps = {
	assignments: ItemAttributeAssignment[];
	attributes: ItemAttributeRecord[];
	isReadonly: boolean;
	onAddAssignment: () => void;
	onRemoveAssignment: (assignmentId: string) => void;
	onReorderAssignment: (
		assignmentId: string,
		overAssignmentId: string,
		position: DropIndicator["position"],
	) => void;
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
	const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(
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
			setDropIndicator(null);
			return;
		}

		onReorderAssignment(
			draggedAssignmentId,
			overAssignmentId,
			dropIndicator?.assignmentId === overAssignmentId
				? dropIndicator.position
				: "before",
		);
		setDraggedAssignmentId(null);
		setDropIndicator(null);
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
			<div className="mt-4 overflow-x-auto overflow-y-hidden rounded-lg border border-skyblue/15 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
				<table className="w-full min-w-[46rem] table-fixed border-collapse text-left text-sm">
					<colgroup>
						<col className="w-8" />
						<col className="w-8" />
						<col className="w-[22rem]" />
						<col className="w-[16rem]" />
						<col className="w-[7rem]" />
					</colgroup>
					<thead className="border-b border-skyblue/15 bg-skyblue/[0.08] text-xs font-semibold uppercase tracking-wide text-darknavy/70">
						<tr>
							<th className="px-1 py-3.5">
								<span className="sr-only">Order</span>
							</th>
							<th className="px-1 py-3.5">No.</th>
							<th className="px-3 py-3.5">Attribute</th>
							<th className="px-3 py-3.5">Value</th>
							<th className="px-3 py-3.5 text-center">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-skyblue/10">
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
								dropIndicator={dropIndicator}
								isReadonly={isReadonly}
								onDragEnd={() => {
									setDraggedAssignmentId(null);
									setDropIndicator(null);
								}}
								onDragOver={(position) =>
									setDropIndicator({ assignmentId: assignment.id, position })
								}
								onDragStart={() => {
									setDraggedAssignmentId(assignment.id);
									setDropIndicator(null);
								}}
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
	dropIndicator,
	isReadonly,
	onDragEnd,
	onDragOver,
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
	dropIndicator: DropIndicator | null;
	isReadonly: boolean;
	onDragEnd: () => void;
	onDragOver: (position: DropIndicator["position"]) => void;
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
	const indicatorPosition =
		!isDragging && dropIndicator?.assignmentId === assignment.id
			? dropIndicator.position
			: null;

	return (
		<tr
			onDragOver={(event) => {
				if (isReadonly || !draggedAssignmentId || isDragging) {
					return;
				}

				event.preventDefault();

				const rect = event.currentTarget.getBoundingClientRect();
				const position =
					event.clientY - rect.top < rect.height / 2 ? "before" : "after";

				onDragOver(position);
			}}
			onDrop={onDrop}
			className={[
				"relative transition-colors hover:bg-skyblue/[0.035]",
				indicatorPosition
					? "before:pointer-events-none before:absolute before:left-2 before:right-2 before:z-20 before:h-0.5 before:rounded-full before:bg-skyblue before:shadow-[0_0_0_1px_rgba(55,167,226,0.18),0_0_10px_rgba(55,167,226,0.35)] before:content-['']"
					: "",
				indicatorPosition === "before" ? "before:top-0" : "",
				indicatorPosition === "after" ? "before:bottom-0" : "",
				isDragging ? "relative z-10 bg-skyblue/8 shadow-sm" : "",
			]
				.filter(Boolean)
				.join(" ")}
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
				<AppAdvancedDropdown
					isClearable
					menuPortal
					options={createAttributeValueDropdownOptions(attribute)}
					placeholder="--Select Value--"
					readOnly={isReadonly || !attribute}
					value={assignment.value}
					onChange={(value) =>
						onUpdateAssignment(assignment.id, "value", String(value))
					}
				/>
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

function createAttributeValueDropdownOptions(
	attribute?: ItemAttributeRecord,
): AppAdvancedDropdownOption[] {
	return (attribute?.values ?? []).map((value) => ({
		name: value,
		value,
	}));
}

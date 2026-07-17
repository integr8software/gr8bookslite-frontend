"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	calculateItemBundleTotals,
	createItemBundleFormValues,
	createItemBundleLine,
	createItemBundlePayload,
	ItemBundleInitialFormValues,
} from "@/app/src/data/modules/maintenance/item-bundles/ItemBundlesData";
import { MockItems } from "@/app/src/data/modules/maintenance/items/ItemManagementData";
import { useItemBundles } from "@/app/src/hooks/modules/maintenance/item-bundles/useItemBundles";
import { ItemBundlesHref } from "@/app/src/constants/modules/maintenance/item-bundles/ItemBundlesConstants";
import type {
	ItemBundleFormErrors,
	ItemBundleFormValues,
	ItemBundleLine,
	ItemBundleMode,
} from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";
import {
	hasItemBundleErrors,
	validateItemBundleForm,
} from "@/app/src/validations/modules/maintenance/item-bundles/ItemBundlesValidation";
import { fetchUnitsOfMeasurement } from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementApi";
import { UnitOfMeasurementQueryKeys } from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementQueryKeys";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function useItemBundlesFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { addBundle, bundles, updateBundle } = useItemBundles();
	const unitsOfMeasurementQuery = useQuery({
		queryKey: UnitOfMeasurementQueryKeys.list(),
		queryFn: fetchUnitsOfMeasurement,
	});
	const mode = getItemBundleMode(pathname);
	const isReadonly = mode === "view";
	const existingBundle = bundles.find((bundle) => bundle.id === params.recordId);
	const itemOptions = useMemo(
		() =>
			MockItems.filter((item) => item.status === "Active").map<AppAdvancedDropdownOption>(
				(item) => ({
					label: `${item.code} | ${item.uom}`,
					name: item.name,
					value: item.id,
				}),
			),
		[],
	);
	const [values, setValues] = useState<ItemBundleFormValues>(() =>
		existingBundle
			? createItemBundleFormValues(existingBundle)
			: ItemBundleInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemBundleFormErrors>({});
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);
	const totals = calculateItemBundleTotals(
		values.lines,
		MockItems,
		values.bundlePrice,
	);

	function updateField<TKey extends keyof ItemBundleFormValues>(
		field: TKey,
		value: ItemBundleFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateLine(lineId: string, update: Partial<ItemBundleLine>) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: current.lines.map((line) =>
				line.id === lineId ? { ...line, ...update } : line,
			),
		}));
		setErrors((current) => {
			const nextLineErrors = { ...current.lineErrors };
			const currentLineErrors = { ...nextLineErrors[lineId] };

			Object.keys(update).forEach((field) => {
				delete currentLineErrors[field as keyof typeof currentLineErrors];
			});
			nextLineErrors[lineId] = currentLineErrors;

			return {
				...current,
				lines: undefined,
				lineErrors: nextLineErrors,
			};
		});
	}

	function addLine() {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines: [...current.lines, createItemBundleLine()],
		}));
	}

	function removeLine(lineId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			lines:
				current.lines.length > 1
					? current.lines.filter((line) => line.id !== lineId)
					: current.lines,
		}));
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (!over || active.id === over.id || isReadonly) {
			return;
		}

		setValues((current) => {
			const oldIndex = current.lines.findIndex((line) => line.id === active.id);
			const newIndex = current.lines.findIndex((line) => line.id === over.id);

			if (oldIndex === -1 || newIndex === -1) {
				return current;
			}

			return {
				...current,
				lines: arrayMove(current.lines, oldIndex, newIndex),
			};
		});
	}

	function validateBeforeSubmit() {
		const nextErrors = validateItemBundleForm(
			values,
			MockItems,
			unitsOfMeasurementQuery.data?.records ?? [],
		);

		if (hasItemBundleErrors(nextErrors)) {
			setErrors(nextErrors);
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly) {
			return;
		}

		if (!validateBeforeSubmit()) {
			return;
		}

		const payload = createItemBundlePayload(values, existingBundle?.id);

		if (existingBundle) {
			updateBundle(payload);
		} else {
			addBundle(payload);
		}
		router.push(ItemBundlesHref);
	}

	return {
		DndContext,
		closestCenter,
		errors,
		existingBundle,
		handleDragEnd,
		handleSubmit,
		isReadonly,
		itemOptions,
		items: MockItems,
		mode,
		sensors,
		totals,
		unitsOfMeasurement: unitsOfMeasurementQuery.data?.records ?? [],
		values,
		addLine,
		removeLine,
		updateField,
		updateLine,
		validateBeforeSubmit,
	};
}

function getItemBundleMode(pathname: string): ItemBundleMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

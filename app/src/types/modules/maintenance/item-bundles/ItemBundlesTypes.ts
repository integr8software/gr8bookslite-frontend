import type {
	ItemRecord,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import type { UnitOfMeasurementRecord } from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";

export type ItemBundleLine = {
	id: string;
	itemId: string;
	quantity: number;
};

export type ItemBundleRecord = {
	id: string;
	bundlePrice: number;
	code: string;
	lines: ItemBundleLine[];
	name: string;
	status: ItemStatus;
};

export type ItemBundleComponentSummary = {
	cost: number;
	item: string;
	quantity: number;
	sellingPrice: number;
};

export type ItemBundleListRecord = ItemBundleRecord & {
	bundleItem: string;
	components: ItemBundleComponentSummary[];
	originalSelling: number;
	savings: number;
	totalCost: number;
};

export type ItemBundleFormValues = {
	bundlePrice: number;
	code: string;
	name: string;
	status: ItemStatus;
	lines: ItemBundleLine[];
};

export type ItemBundleFormErrors = Partial<
	Record<"bundlePrice" | "code" | "lines" | "name", string>
> & {
	lineErrors?: Record<string, Partial<Record<"itemId" | "quantity", string>>>;
};

export type ItemBundleMode = "add" | "edit" | "view";

export type ItemBundleTableColumnKey =
	| "code"
	| "bundleItem"
	| "components"
	| "totalCost"
	| "originalSelling"
	| "bundlePrice"
	| "savings"
	| "status";

export type ItemBundleFormPageState = {
	errors: ItemBundleFormErrors;
	existingBundle?: ItemBundleRecord;
	handleDragEnd: (event: import("@dnd-kit/core").DragEndEvent) => void;
	handleSubmit: (event: import("react").FormEvent<HTMLFormElement>) => void;
	isReadonly: boolean;
	itemOptions: import("@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown").AppAdvancedDropdownOption[];
	items: ItemRecord[];
	mode: ItemBundleMode;
	sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
	totals: {
		bundleTotal: number;
		originalCost: number;
		originalSelling: number;
	};
	unitsOfMeasurement: UnitOfMeasurementRecord[];
	values: ItemBundleFormValues;
	addLine: () => void;
	removeLine: (lineId: string) => void;
	updateField: <TKey extends keyof ItemBundleFormValues>(
		field: TKey,
		value: ItemBundleFormValues[TKey],
	) => void;
	updateLine: (lineId: string, update: Partial<ItemBundleLine>) => void;
	validateBeforeSubmit: () => boolean;
};

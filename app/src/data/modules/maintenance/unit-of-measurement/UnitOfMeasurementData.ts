import type {
	UnitOfMeasurementFormValues,
	UnitOfMeasurementRecord,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";

export const UnitOfMeasurementMockData: UnitOfMeasurementRecord[] = [
	{
		id: "uom-piece",
		name: "Piece",
		symbol: "PCS",
		quantityMode: "Integer",
		status: "Active",
	},
	{
		id: "uom-box",
		name: "Box",
		symbol: "BOX",
		quantityMode: "Integer",
		status: "Active",
	},
	{
		id: "uom-pack",
		name: "Pack",
		symbol: "PACK",
		quantityMode: "Integer",
		status: "Active",
	},
	{
		id: "uom-kilogram",
		name: "Kilogram",
		symbol: "KG",
		quantityMode: "Float",
		status: "Active",
	},
	{
		id: "uom-liter",
		name: "Liter",
		symbol: "L",
		quantityMode: "Float",
		status: "Active",
	},
];

export function createUnitOfMeasurementFormValues(
	record?: UnitOfMeasurementRecord,
): UnitOfMeasurementFormValues {
	return {
		name: record?.name ?? "",
		symbol: record?.symbol ?? "",
		quantityMode: record?.quantityMode ?? "Integer",
		status: record?.status ?? "Active",
	};
}

export type SystemUomQuantityKind = "Integer" | "Float";

export type SystemUom = {
	id: string;
	code: string;
	description: string;
	quantityKind: SystemUomQuantityKind;
};

type SystemUomTuple = readonly [
	code: string,
	description: string,
	quantityKind: SystemUomQuantityKind,
];

const SystemUomSourceRows = [
	["PCS", "Piece", "Integer"],
	["BOX", "Box", "Integer"],
	["CASE", "Case", "Integer"],
	["PACK", "Pack", "Integer"],
	["SET", "Set", "Integer"],
	["PAIR", "Pair", "Integer"],
	["DOZEN", "Dozen", "Integer"],
	["REAM", "Ream", "Integer"],
	["ROLL", "Roll", "Integer"],
	["BUNDLE", "Bundle", "Integer"],
	["PALLET", "Pallet", "Integer"],
	["KG", "Kilogram", "Float"],
	["G", "Gram", "Float"],
	["LB", "Pound", "Float"],
	["L", "Liter", "Float"],
	["ML", "Milliliter", "Float"],
	["GAL", "Gallon", "Float"],
	["M", "Meter", "Float"],
	["CM", "Centimeter", "Float"],
	["MM", "Millimeter", "Float"],
	["SQM", "Square Meter", "Float"],
] as const satisfies readonly SystemUomTuple[];

export const SystemUomRows: SystemUom[] = SystemUomSourceRows.map(
	([code, description, quantityKind]) => ({
		id: `uom-${code.toLowerCase()}`,
		code,
		description,
		quantityKind,
	}),
);

export const SystemUomOptions = SystemUomRows.map((uom) => uom.code);

export function getSystemUomByCode(code: string) {
	return SystemUomRows.find((uom) => uom.code === code);
}

import { MaterialRequestStorageKey } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type {
	MaterialRequestFormValues,
	MaterialRequestItem,
	MaterialRequestRecord,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";

export const materialRequestSeedRecords: MaterialRequestRecord[] = [
	{
		id: "mr-2024-128",
		requestNo: "MR-2024-128",
		documentDate: "2024-05-29",
		requiredDate: "2024-06-03",
		fromWarehouse: "Main Warehouse",
		toWarehouse: "Site Warehouse 1",
		requestedBy: "John Doe",
		department: "Warehouse Operations",
		vceCode: "REQ-001",
		vceName: "John Doe",
		projectRef: "PRJ-WH-001",
		projectName: "Site Warehouse Replenishment",
		referenceNo: "JOB-2405-018",
		purpose: "Warehouse to warehouse replenishment",
		remarks: "Priority release for active site materials.",
		status: "Pending",
		items: [
			createSeedItem("cement", "MAT-001", "Cement", "Bag", 80),
			createSeedItem("sand", "MAT-002", "Sand", "Kg", 120),
			createSeedItem("bricks", "MAT-003", "Bricks", "Pc", 500),
			createSeedItem("rebar", "MAT-004", "Steel Bar", "Pc", 30),
			createSeedItem("pipe", "MAT-005", "PVC Pipe", "Pc", 20),
		],
	},
	{
		id: "mr-2024-127",
		requestNo: "MR-2024-127",
		documentDate: "2024-05-28",
		requiredDate: "2024-06-02",
		fromWarehouse: "Main Warehouse",
		toWarehouse: "Site Warehouse 2",
		requestedBy: "Jane Smith",
		department: "Finishing",
		vceCode: "REQ-002",
		vceName: "Jane Smith",
		projectRef: "PRJ-FIN-002",
		projectName: "Finishing Works",
		referenceNo: "JOB-2405-017",
		purpose: "Painting materials for site works",
		remarks: "Release after warehouse supervisor approval.",
		status: "Approved",
		items: [
			createSeedItem("paint", "MAT-011", "Paint", "Can", 15),
			createSeedItem("thinner", "MAT-012", "Thinner", "Can", 6),
			createSeedItem("brush", "MAT-013", "Brush", "Pc", 12),
		],
	},
	{
		id: "mr-2024-126",
		requestNo: "MR-2024-126",
		documentDate: "2024-05-27",
		requiredDate: "2024-06-01",
		fromWarehouse: "Central Warehouse",
		toWarehouse: "Site Warehouse 1",
		requestedBy: "Mike Johnson",
		department: "Structural",
		vceCode: "REQ-003",
		vceName: "Mike Johnson",
		projectRef: "PRJ-STR-001",
		projectName: "Structural Reinforcement",
		referenceNo: "JOB-2405-016",
		purpose: "Structural reinforcement release",
		remarks: "Completed by warehouse issue team.",
		status: "Completed",
		items: [
			createSeedItem("steel-rod", "MAT-021", "Steel Rod", "Pc", 40),
			createSeedItem("wire-mesh", "MAT-022", "Wire Mesh", "Roll", 10),
		],
	},
	{
		id: "mr-2024-125",
		requestNo: "MR-2024-125",
		documentDate: "2024-05-26",
		requiredDate: "2024-05-31",
		fromWarehouse: "Main Warehouse",
		toWarehouse: "Site Warehouse 3",
		requestedBy: "Robert Brown",
		department: "Electrical",
		vceCode: "REQ-004",
		vceName: "Robert Brown",
		projectRef: "PRJ-ELE-003",
		projectName: "Electrical Roughing",
		referenceNo: "JOB-2405-015",
		purpose: "Electrical roughing materials",
		remarks: "Coordinate release with site electrician.",
		status: "Pending",
		items: [
			createSeedItem("cable", "MAT-031", "Cable", "Roll", 8),
			createSeedItem("switch", "MAT-032", "Switch", "Pc", 25),
			createSeedItem("mcb", "MAT-033", "MCB", "Pc", 10),
			createSeedItem("conduit", "MAT-034", "Conduit", "Pc", 30),
		],
	},
	{
		id: "mr-2024-124",
		requestNo: "MR-2024-124",
		documentDate: "2024-05-25",
		requiredDate: "2024-05-30",
		fromWarehouse: "Central Warehouse",
		toWarehouse: "Site Warehouse 2",
		requestedBy: "Emily Davis",
		department: "Plumbing",
		vceCode: "REQ-005",
		vceName: "Emily Davis",
		projectRef: "PRJ-PLB-002",
		projectName: "Plumbing Installation",
		referenceNo: "JOB-2405-014",
		purpose: "Plumbing installation materials",
		remarks: "Approved for afternoon delivery.",
		status: "Approved",
		items: [
			createSeedItem("pvc-pipe", "MAT-041", "PVC Pipe", "Pc", 50),
			createSeedItem("elbow", "MAT-042", "Elbow", "Pc", 40),
			createSeedItem("teflon", "MAT-043", "Teflon Tape", "Roll", 15),
		],
	},
	{
		id: "mr-2024-123",
		requestNo: "MR-2024-123",
		documentDate: "2024-05-24",
		requiredDate: "2024-05-29",
		fromWarehouse: "Main Warehouse",
		toWarehouse: "Site Warehouse 4",
		requestedBy: "David Wilson",
		department: "Carpentry",
		vceCode: "REQ-006",
		vceName: "David Wilson",
		projectRef: "PRJ-CAR-004",
		projectName: "Carpentry Works",
		referenceNo: "JOB-2405-013",
		purpose: "Carpentry materials",
		remarks: "Rejected due to incomplete stock validation.",
		status: "Rejected",
		items: [
			createSeedItem("plywood", "MAT-051", "Plywood", "Pc", 20),
			createSeedItem("nails", "MAT-052", "Nails", "Box", 4),
			createSeedItem("screw", "MAT-053", "Screw", "Box", 5),
			createSeedItem("hinge", "MAT-054", "Hinge", "Pc", 24),
		],
	},
	{
		id: "mr-2024-122",
		requestNo: "MR-2024-122",
		documentDate: "2024-05-23",
		requiredDate: "2024-05-28",
		fromWarehouse: "Central Warehouse",
		toWarehouse: "Site Warehouse 1",
		requestedBy: "Chris Martin",
		department: "Civil",
		vceCode: "REQ-007",
		vceName: "Chris Martin",
		projectRef: "PRJ-CIV-001",
		projectName: "Civil Works",
		referenceNo: "JOB-2405-012",
		purpose: "Civil works replenishment",
		remarks: "Completed request.",
		status: "Completed",
		items: [
			createSeedItem("sand", "MAT-002", "Sand", "Kg", 200),
			createSeedItem("aggregate", "MAT-061", "Aggregate", "Kg", 300),
			createSeedItem("cement", "MAT-001", "Cement", "Bag", 100),
		],
	},
];

export const emptyMaterialRequestItem: MaterialRequestItem = {
	id: "draft-item",
	barcode: "",
	category: "",
	itemCode: "",
	itemName: "",
	lotNo: "",
	requestQuantity: 1,
	stockQuantity: 0,
	uom: "Pc",
	remarks: "",
};

export function createMaterialRequestFormValues(
	record?: MaterialRequestRecord,
): MaterialRequestFormValues {
	if (record) {
		return {
			...record,
			items: record.items.map((item) => ({ ...item })),
		};
	}

	return {
		requestNo: createNextMaterialRequestNo(materialRequestSeedRecords),
		documentDate: new Date().toISOString().slice(0, 10),
		requiredDate: new Date().toISOString().slice(0, 10),
		fromWarehouse: "Main Warehouse",
		toWarehouse: "Site Warehouse 1",
		requestedBy: "John Doe",
		department: "Warehouse Operations",
		vceCode: "",
		vceName: "",
		projectRef: "",
		projectName: "",
		referenceNo: "",
		purpose: "",
		remarks: "",
		status: "Pending",
		items: [
			{
				...emptyMaterialRequestItem,
				id: createMaterialRequestId("item"),
			},
		],
	};
}

export function createMaterialRequestRecord(
	values: MaterialRequestFormValues,
	id = createMaterialRequestId("mr"),
): MaterialRequestRecord {
	return {
		id,
		...values,
		items: values.items.map((item) => ({
			...item,
			id: item.id || createMaterialRequestId("item"),
			requestQuantity: Number(item.requestQuantity) || 0,
			stockQuantity: Number(item.stockQuantity) || 0,
		})),
	};
}

export function loadMaterialRequests() {
	if (typeof window === "undefined") {
		return materialRequestSeedRecords;
	}

	try {
		const stored = window.localStorage.getItem(MaterialRequestStorageKey);

		if (!stored) {
			return materialRequestSeedRecords;
		}

		const parsed = JSON.parse(stored) as MaterialRequestRecord[];

		return Array.isArray(parsed) && parsed.length > 0
			? parsed.map(normalizeMaterialRequestRecord)
			: materialRequestSeedRecords;
	} catch {
		return materialRequestSeedRecords;
	}
}

export function saveMaterialRequests(records: MaterialRequestRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(MaterialRequestStorageKey, JSON.stringify(records));
}

export function formatMaterialRequestDate(value: string) {
	if (!value) {
		return "";
	}

	const date = new Date(`${value}T00:00:00`);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function getMaterialRequestItemSummary(
	record: Pick<MaterialRequestRecord, "items">,
) {
	const descriptions = record.items
		.map((item) => item.itemName.trim())
		.filter(Boolean);
	const visibleItems = descriptions.slice(0, 3).join(", ");
	const remainingCount = Math.max(0, descriptions.length - 3);

	return remainingCount > 0
		? `${visibleItems} +${remainingCount} more`
		: visibleItems;
}

export function createNextMaterialRequestNo(records: MaterialRequestRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const numeric = Number.parseInt(record.requestNo.replace(/\D/g, ""), 10);

			return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
		}, 2024121) + 1;
	const sequence = nextNumber.toString().slice(-3);

	return `MR-2024-${sequence}`;
}

export function createMaterialRequestId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

function createSeedItem(
	id: string,
	itemCode: string,
	itemName: string,
	uom: string,
	requestQuantity: number,
): MaterialRequestItem {
	return {
		id,
		barcode: `BC-${itemCode.replace(/\D/g, "").padStart(5, "0")}`,
		category: inferMaterialCategory(itemName),
		itemCode,
		itemName,
		lotNo: "LOT-2024",
		requestQuantity,
		stockQuantity: requestQuantity * 3,
		uom,
		remarks: "",
	};
}

function normalizeMaterialRequestRecord(
	record: MaterialRequestRecord,
): MaterialRequestRecord {
	return {
		...record,
		vceCode: record.vceCode ?? "",
		vceName: record.vceName ?? record.requestedBy ?? "",
		projectRef: record.projectRef ?? record.referenceNo ?? "",
		projectName: record.projectName ?? "",
		remarks: record.remarks ?? "",
		items: record.items.map((item) => ({
			...emptyMaterialRequestItem,
			...item,
			barcode: item.barcode ?? "",
			category: item.category ?? "",
			itemName: item.itemName ?? "",
			lotNo: item.lotNo ?? "",
			requestQuantity: Number(item.requestQuantity) || 0,
			stockQuantity: Number(item.stockQuantity) || 0,
		})),
	};
}

function inferMaterialCategory(itemName: string) {
	const normalized = itemName.toLowerCase();

	if (/cable|switch|mcb|conduit/.test(normalized)) {
		return "Electrical";
	}

	if (/pipe|elbow|teflon/.test(normalized)) {
		return "Plumbing";
	}

	if (/paint|thinner|brush/.test(normalized)) {
		return "Finishing";
	}

	if (/plywood|nails|screw|hinge/.test(normalized)) {
		return "Carpentry";
	}

	return "Construction";
}

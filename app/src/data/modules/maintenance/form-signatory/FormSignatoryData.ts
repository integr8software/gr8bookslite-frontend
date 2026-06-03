import { FormSignatoryStorageKey } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import type {
	FormSignatoryRow,
	FormSignatorySelectOption,
	FormSignatorySetupRecord,
} from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";

export const FormSignatoryBranchOptions: FormSignatorySelectOption[] = [
	{ label: "Select Branch", value: "" },
	{ label: "Head Office", value: "head-office" },
	{ label: "Main Branch", value: "main-branch" },
	{ label: "Warehouse Branch", value: "warehouse-branch" },
];

export const FormSignatoryModuleOptions: FormSignatorySelectOption[] = [
	{ label: "Select Module", value: "" },
	{ label: "Cash Receipt", value: "cash-receipt" },
	{ label: "Cash Disbursement", value: "cash-disbursement" },
	{ label: "Accounts Payable", value: "accounts-payable" },
	{ label: "Purchase Request", value: "purchase-request" },
	{ label: "Sales", value: "sales" },
	{ label: "Purchasing", value: "purchasing" },
];

export const FormSignatoryDefaultLabels = [
	"Prepared By",
	"Approved By",
];

export const FormSignatorySeedRecords: FormSignatorySetupRecord[] = [
	{
		id: "form-signatory-purchase-request-head-office",
		branch: "head-office",
		module: "purchase-request",
		rows: [
			createSignatoryRow(
				"prepared-by",
				"Prepared By",
				"Maria Santos",
				"Purchasing Staff",
				"maria-santos-signature.svg",
				createMockSignatureDataUrl("Maria Santos"),
			),
			createSignatoryRow(
				"approved-by",
				"Approved By",
				"Daniel Reyes",
				"Purchasing Manager",
				"daniel-reyes-signature.svg",
				createMockSignatureDataUrl("Daniel Reyes"),
			),
		],
	},
	{
		id: "form-signatory-purchase-request-main-branch",
		branch: "main-branch",
		module: "purchase-request",
		rows: [
			createSignatoryRow(
				"prepared-by",
				"Prepared By",
				"Ana Cruz",
				"Branch Buyer",
				"ana-cruz-signature.svg",
				createMockSignatureDataUrl("Ana Cruz"),
			),
			createSignatoryRow(
				"approved-by",
				"Approved By",
				"Ramon Dela Cruz",
				"Branch Manager",
				"ramon-dela-cruz-signature.svg",
				createMockSignatureDataUrl("Ramon Dela Cruz"),
			),
		],
	},
];

export function createDefaultFormSignatoryRows(): FormSignatoryRow[] {
	return FormSignatoryDefaultLabels.map((label, index) =>
		createSignatoryRow(`signatory-${index + 1}`, label),
	);
}

export function createEmptyFormSignatoryRow(index: number): FormSignatoryRow {
	return createSignatoryRow(
		`signatory-${Date.now().toString(36)}-${index + 1}`,
		FormSignatoryDefaultLabels[index] ?? `Signatory ${index + 1}`,
	);
}

export function loadFormSignatorySetups() {
	if (typeof window === "undefined") {
		return FormSignatorySeedRecords;
	}

	try {
		const stored = window.localStorage.getItem(FormSignatoryStorageKey);

		if (!stored) {
			return FormSignatorySeedRecords;
		}

		const parsed = JSON.parse(stored) as FormSignatorySetupRecord[];

		return Array.isArray(parsed) && parsed.length > 0
			? mergeFormSignatorySetups(parsed)
			: FormSignatorySeedRecords;
	} catch {
		return FormSignatorySeedRecords;
	}
}

export function loadSavedFormSignatorySetups() {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const stored = window.localStorage.getItem(FormSignatoryStorageKey);

		if (!stored) {
			return [];
		}

		const parsed = JSON.parse(stored) as FormSignatorySetupRecord[];

		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function mergeFormSignatorySetups(records: FormSignatorySetupRecord[]) {
	return [
		...records,
		...FormSignatorySeedRecords.filter(
			(seedRecord) =>
				!records.some(
					(record) =>
						record.branch === seedRecord.branch &&
						record.module === seedRecord.module,
				),
		),
	];
}

export function saveFormSignatorySetups(records: FormSignatorySetupRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(FormSignatoryStorageKey, JSON.stringify(records));
}

export function createFormSignatorySetupId(branch: string, module: string) {
	return `form-signatory-${module}-${branch}`;
}

export function findFormSignatorySetupById(recordId: string) {
	return loadFormSignatorySetups().find((record) => record.id === recordId);
}

export function findFormSignatorySetup({
	branch,
	module,
}: {
	branch?: string;
	module: string;
}) {
	const records = loadFormSignatorySetups();

	return (
		records.find((record) => record.module === module && record.branch === branch) ??
		records.find((record) => record.module === module)
	);
}

export function getFormSignatoryRowsByLabel({
	branch,
	label,
	module,
}: {
	branch?: string;
	label: string;
	module: string;
}) {
	const seenRows = new Set<string>();

	return loadFormSignatorySetups()
		.filter(
			(record) =>
				record.module === module && (!branch || record.branch === branch),
		)
		.flatMap((record) =>
			record.rows
				.filter((row) => row.label === label && row.name.trim())
				.map((row) => ({
					...row,
					branch: record.branch,
					setupId: record.id,
				})),
		)
		.filter((row) => {
			const key = `${row.name}:${row.signatureName}:${row.signaturePreview}`;

			if (seenRows.has(key)) {
				return false;
			}

			seenRows.add(key);
			return true;
		});
}

function createSignatoryRow(
	id: string,
	label: string,
	name = "",
	position = "",
	signatureName = "",
	signaturePreview = "",
): FormSignatoryRow {
	return {
		id,
		label,
		name,
		position,
		signatureName,
		signaturePreview,
	};
}

function createMockSignatureDataUrl(name: string) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="120" viewBox="0 0 360 120"><rect width="360" height="120" fill="white"/><path d="M24 72 C78 18, 103 112, 148 62 C186 22, 208 98, 252 58 C285 29, 315 59, 338 42" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round"/><text x="178" y="92" text-anchor="middle" font-family="cursive" font-size="20" fill="#111827">${name}</text></svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

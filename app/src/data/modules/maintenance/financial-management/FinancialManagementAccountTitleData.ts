import {
	FinancialManagementAccountTitleSeparators,
} from "@/app/src/constants/modules/maintenance/financial-management/FinancialManagementAccountTitleConstants";

export function normalizeFinancialManagementAccountTitle(value: string): string {
	return value
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.map((word) => {
			for (const separator of FinancialManagementAccountTitleSeparators) {
				if (word.includes(separator)) {
					return word
						.split(separator)
						.map(normalizeFinancialManagementAccountTitle)
						.join(separator);
				}
			}

			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(" ");
}

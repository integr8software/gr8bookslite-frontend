import type { ModuleTableExportRows } from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";

export function createCsv(rows: ModuleTableExportRows) {
	return rows
		.map((row) =>
			row
				.map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
				.join(","),
		)
		.join("\r\n");
}

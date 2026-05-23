import { getWarehouseAvailableBranchLabel } from "@/app/src/data/modules/maintenance/warehouse-management/WarehouseManagementData";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

type WarehouseDetailsPanelProps = {
	warehouse: WarehouseRecord;
};

export function WarehouseDetailsPanel({ warehouse }: WarehouseDetailsPanelProps) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<Detail label="Warehouse Name" value={warehouse.name} />
				<Detail label="Home Branch" value={warehouse.branchName} />
				<Detail label="Availability" value={warehouse.availability} />
				<Detail
					label="Available Branches"
					value={getWarehouseAvailableBranchLabel(warehouse)}
				/>
				<Detail label="Manager" value={warehouse.managerName} />
				<Detail label="Contact No." value={warehouse.contactNo} />
				<Detail label="Status" value={warehouse.status} />
				<Detail label="Address" value={warehouse.address} wide />
				<Detail label="Description" value={warehouse.description || "-"} wide />
			</div>
		</div>
	);
}

function Detail({
	label,
	value,
	wide,
}: {
	label: string;
	value: string;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "md:col-span-2 xl:col-span-3" : undefined}>
			<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</div>
			<div className="mt-1 text-sm font-medium text-darknavy">{value}</div>
		</div>
	);
}

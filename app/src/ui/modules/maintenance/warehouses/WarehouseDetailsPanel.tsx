import { getWarehouseAvailableBranchLabel } from "@/app/src/data/modules/maintenance/warehouses/WarehouseData";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import type { ReactNode } from "react";

type WarehouseDetailsPanelProps = {
	warehouse: WarehouseRecord;
};

export function WarehouseDetailsPanel({ warehouse }: WarehouseDetailsPanelProps) {
	const totalQuantity = warehouse.items.reduce(
		(total, item) => total + item.onHand,
		0,
	);
	const inventoryValue = warehouse.items.reduce(
		(total, item) => total + item.onHand * item.unitCost,
		0,
	);
	const lastActivity = warehouse.movements[0]?.date ?? "-";
	const activeUsers = warehouse.access.filter(
		(access) => access.status === "Active",
	).length;

	return (
		<div className="grid gap-5">
			<Section title="Overview">
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
					<Metric label="Total SKUs" value={warehouse.items.length} />
					<Metric label="Total Quantity" value={totalQuantity} />
					<Metric label="Inventory Value" value={formatCurrency(inventoryValue)} />
					<Metric label="Last Activity" value={lastActivity} />
					<Metric label="Active Users" value={activeUsers} />
					<Metric label="Storage Locations" value={warehouse.locations.length} />
				</div>
				<div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<Detail label="Warehouse Code" value={warehouse.code} />
					<Detail label="Warehouse Name" value={warehouse.name} />
					<Detail label="Status" value={warehouse.status} />
					<Detail
						label="Available Branches"
						value={getWarehouseAvailableBranchLabel(warehouse)}
					/>
					<Detail label="Manager" value={warehouse.managerName} />
					<Detail label="Contact No." value={warehouse.contactNo} />
					<Detail label="Address" value={warehouse.address} wide />
					<Detail label="Description" value={warehouse.description || "-"} wide />
				</div>
			</Section>
			<Section title="Items">
				<SimpleTable
					headers={[
						"Item Code",
						"Item Name",
						"Category",
						"UOM",
						"On Hand",
						"Reserved",
						"Available",
						"Lot No.",
						"Serial No.",
						"Storage Location",
					]}
					rows={warehouse.items.map((item) => [
						item.itemCode,
						item.itemName,
						item.category,
						item.uom,
						String(item.onHand),
						String(item.reserved),
						String(item.onHand - item.reserved),
						item.lotNumber || "-",
						item.serialNumber || "-",
						item.storageLocation || "-",
					])}
				/>
			</Section>
			<Section title="Stock Movement">
				<SimpleTable
					headers={[
						"Date",
						"Reference Number",
						"Transaction Type",
						"Item",
						"Quantity In",
						"Quantity Out",
						"Balance",
						"User",
					]}
					rows={warehouse.movements.map((movement) => [
						movement.date,
						movement.referenceNumber,
						movement.transactionType,
						movement.item,
						String(movement.quantityIn),
						String(movement.quantityOut),
						String(movement.balance),
						movement.user,
					])}
				/>
			</Section>
			<Section title="Transfers">
				<SimpleTable
					headers={[
						"Date",
						"Reference Number",
						"Source Warehouse",
						"Destination Warehouse",
						"Status",
						"Requested By",
						"Approved By",
					]}
					rows={warehouse.transfers.map((transfer) => [
						transfer.date,
						transfer.referenceNumber,
						transfer.sourceWarehouse,
						transfer.destinationWarehouse,
						transfer.status,
						transfer.requestedBy,
						transfer.approvedBy,
					])}
				/>
			</Section>
			<Section title="Locations">
				<SimpleTable
					headers={[
						"Location Code",
						"Zone",
						"Aisle",
						"Rack",
						"Shelf",
						"Bin",
						"Status",
					]}
					rows={warehouse.locations.map((location) => [
						location.locationCode,
						location.zone || "-",
						location.aisle || "-",
						location.rackNo || "-",
						location.shelfNo || "-",
						location.binNo || "-",
						location.status,
					])}
				/>
			</Section>
			<Section title="Users">
				<SimpleTable
					headers={["User", "Permissions", "Status"]}
					rows={warehouse.access.map((access) => [
						access.userName,
						access.permissions.join(", "),
						access.status,
					])}
				/>
			</Section>
			<Section title="Settings">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<Detail label="Location Tracking" value="Enabled" />
					<Detail label="Lot Tracking" value="Item controlled" />
					<Detail label="Serial Tracking" value="Item controlled" />
				</div>
			</Section>
		</div>
	);
}

function Section({ children, title }: { children: ReactNode; title: string }) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function Metric({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-md border border-darknavy/10 bg-offwhite/60 p-3">
			<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</div>
			<div className="mt-1 text-lg font-semibold text-darknavy">{value}</div>
		</div>
	);
}

function SimpleTable({
	headers,
	rows,
}: {
	headers: string[];
	rows: string[][];
}) {
	return (
		<div className="overflow-auto">
			<table className="w-full min-w-[54rem] text-left text-sm">
				<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
					<tr>
						{headers.map((header) => (
							<th key={header} className="px-3 py-3">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-darknavy/8">
					{rows.length === 0 ? (
						<tr>
							<td
								colSpan={headers.length}
								className="px-3 py-6 text-center text-darknavy/55"
							>
								No records found.
							</td>
						</tr>
					) : null}
					{rows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, cellIndex) => (
								<td key={`${rowIndex}-${cellIndex}`} className="px-3 py-3">
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
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

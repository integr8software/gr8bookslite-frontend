import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export function WarehouseAccessTable({
	warehouse,
}: {
	warehouse: WarehouseRecord;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<table className="w-full min-w-[46rem] text-left text-sm">
				<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
					<tr>
						<th className="px-4 py-3">User</th>
						<th className="px-4 py-3">Role</th>
						<th className="px-4 py-3">Access</th>
						<th className="px-4 py-3">Status</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-darknavy/8">
					{warehouse.access.map((access) => (
						<tr key={access.id}>
							<td className="px-4 py-4 font-medium text-darknavy">
								{access.userName}
							</td>
							<td className="px-4 py-4 text-darknavy/70">{access.role}</td>
							<td className="px-4 py-4 text-darknavy/70">
								{access.accessLevel}
							</td>
							<td className="px-4 py-4">
								<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
									{access.status}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


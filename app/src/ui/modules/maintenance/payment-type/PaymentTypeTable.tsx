"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import type { PaymentTypeRecord } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleTableSyncStatus } from "@/app/src/ui/shared/module/ModuleTableSyncStatus";

type PaymentTypeTableProps = {
	isLoading: boolean;
	lastSyncedAt?: number | string | Date | null;
	paymentTypes: PaymentTypeRecord[];
	toolbar?: ReactNode;
	onEdit: (paymentType: PaymentTypeRecord) => void;
	onToggleStatus: (paymentType: PaymentTypeRecord) => void;
	onView: (paymentType: PaymentTypeRecord) => void;
};

export function PaymentTypeTable({
	isLoading,
	lastSyncedAt,
	paymentTypes,
	toolbar,
	onEdit,
	onToggleStatus,
	onView,
}: PaymentTypeTableProps) {
	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<ModuleTableSyncStatus
				lastSyncedAt={lastSyncedAt}
				tableTitle="Payment types"
			/>
			{toolbar}
			<div className="overflow-x-auto">
				<table className="w-full min-w-[54rem] border-collapse text-left text-sm">
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-[0.14em] text-darknavy/45">
						<tr>
							<th className="w-[45%] px-4 py-3">Name</th>
							<th className="w-[22%] px-4 py-3">Category</th>
							<th className="w-[15%] px-4 py-3">Status</th>
							<th className="w-[18%] px-4 py-3 text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={4} className="px-4 py-12 text-center text-darknavy/55">
									Loading payment types...
								</td>
							</tr>
						) : paymentTypes.length > 0 ? (
							paymentTypes.map((paymentType) => (
								<tr
									key={paymentType.id}
									className="module-table-row h-16 border-t border-darknavy/8"
								>
									<td className="px-4 py-4 align-middle font-semibold text-darknavy">
										{paymentType.paymentType}
									</td>
									<td className="px-4 py-4 align-middle text-darknavy">
										<span className="inline-flex rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
											{paymentType.type}
										</span>
									</td>
									<td className="px-4 py-4 align-middle text-darknavy">
										<span
											className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
												paymentType.status === "Active"
													? "bg-citron/30 text-darknavy"
													: "bg-coralpink/12 text-coralpink"
											}`}
										>
											{paymentType.status}
										</span>
									</td>
									<td className="px-4 py-4 align-middle text-center">
										<ModuleTableActions className="!justify-center">
											<ModuleTableActionButton
												variant="view"
												onClick={() => onView(paymentType)}
												label={`View ${paymentType.paymentType}`}
											/>
											<ModuleTableActionButton
												variant="edit"
												onClick={() => onEdit(paymentType)}
												label={`Edit ${paymentType.paymentType}`}
											/>
											<ModuleTableActionButton
												variant={
													paymentType.status === "Active"
														? "inactive"
														: "active"
												}
												onClick={() => onToggleStatus(paymentType)}
												label={`${paymentType.status === "Active" ? "Deactivate" : "Activate"} ${paymentType.paymentType}`}
											/>
										</ModuleTableActions>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4} className="px-4 py-12 text-center">
									<div className="inline-grid justify-items-center gap-2 text-darknavy/55">
										<Search className="h-5 w-5" aria-hidden="true" />
										<span>No payment types found</span>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}

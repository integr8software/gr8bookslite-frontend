import { Plus } from "lucide-react";
import {
	WarehouseAccessLevelOptions,
	WarehouseAccessPermissionOptions,
	WarehouseStatusOptions,
} from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseAccessFormErrors,
	WarehouseAccessLevel,
	WarehouseAccessPermission,
	WarehouseAccessRecord,
	WarehouseStatus,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { ModuleTableActionButton } from "@/app/src/ui/shared/module/ModuleTableActions";

type WarehouseAccessTableProps = {
	accessRecords: WarehouseAccessRecord[];
	errors: WarehouseAccessFormErrors;
	isPending: boolean;
	onAddAccess: () => void;
	onRemoveAccess: (accessId: string) => void;
	onTogglePermission: (
		accessId: string,
		permission: WarehouseAccessPermission,
	) => void;
	onUpdateAccess: <TKey extends keyof WarehouseAccessRecord>(
		accessId: string,
		field: TKey,
		value: WarehouseAccessRecord[TKey],
	) => void;
};

export function WarehouseAccessTable({
	accessRecords,
	errors,
	isPending,
	onAddAccess,
	onRemoveAccess,
	onTogglePermission,
	onUpdateAccess,
}: WarehouseAccessTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						Warehouse Access
					</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Edit who can use this warehouse and what actions they can perform.
					</p>
				</div>
				<button
					type="button"
					disabled={isPending}
					onClick={onAddAccess}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold text-white shadow-sm shadow-skyblue/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Person
				</button>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[72rem] text-left text-sm">
					<thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
						<tr>
							<th className="px-4 py-3">Person</th>
							<th className="px-4 py-3">Role</th>
							<th className="px-4 py-3">Access</th>
							<th className="px-4 py-3">Permissions</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/8">
						{accessRecords.length > 0 ? (
							accessRecords.map((access) => (
								<tr key={access.id}>
									<td className="px-4 py-4 align-top">
										<input
											value={access.userName}
											onChange={(event) =>
												onUpdateAccess(
													access.id,
													"userName",
													event.target.value,
												)
											}
											className={fieldClassName}
											placeholder="Person name"
										/>
										<FieldError message={errors[access.id]?.userName} />
									</td>
									<td className="px-4 py-4 align-top">
										<input
											value={access.role}
											onChange={(event) =>
												onUpdateAccess(access.id, "role", event.target.value)
											}
											className={fieldClassName}
											placeholder="Warehouse role"
										/>
										<FieldError message={errors[access.id]?.role} />
									</td>
									<td className="px-4 py-4 align-top">
										<select
											value={access.accessLevel}
											onChange={(event) =>
												onUpdateAccess(
													access.id,
													"accessLevel",
													event.target.value as WarehouseAccessLevel,
												)
											}
											className={fieldClassName}
										>
											{WarehouseAccessLevelOptions.map((level) => (
												<option key={level} value={level}>
													{level}
												</option>
											))}
										</select>
									</td>
									<td className="px-4 py-4 align-top">
										<div className="grid gap-2 sm:grid-cols-2">
											{WarehouseAccessPermissionOptions.map((permission) => (
												<label
													key={permission}
													className="flex min-h-9 items-center gap-2 rounded-md border border-darknavy/10 bg-offwhite/55 px-2.5 text-xs font-semibold text-darknavy"
												>
													<input
														type="checkbox"
														checked={access.permissions.includes(permission)}
														onChange={() =>
															onTogglePermission(access.id, permission)
														}
														className="h-4 w-4 accent-skyblue"
													/>
													{permission}
												</label>
											))}
										</div>
										<FieldError message={errors[access.id]?.permissions} />
									</td>
									<td className="px-4 py-4 align-top">
										<select
											value={access.status}
											onChange={(event) =>
												onUpdateAccess(
													access.id,
													"status",
													event.target.value as WarehouseStatus,
												)
											}
											className={fieldClassName}
										>
											{WarehouseStatusOptions.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</select>
									</td>
									<td className="px-4 py-4 text-right align-top">
										<ModuleTableActionButton
											variant="delete"
											onClick={() => onRemoveAccess(access.id)}
											label={`Remove ${access.userName || "access row"}`}
										/>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="px-4 py-10 text-center text-sm text-darknavy/55"
								>
									No warehouse access has been assigned.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	return message ? (
		<span className="mt-1 block text-xs font-medium text-coralpink">
			{message}
		</span>
	) : null;
}

const fieldClassName =
	"min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20";

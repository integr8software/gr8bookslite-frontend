import {
	getMasterTenantAccessEditHref,
	getMasterTenantAccessViewHref,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import type { ReactNode } from "react";
import type {
	MasterBranchRecord,
	MasterCompanyRecord,
	MasterSubscriberRecord,
	MasterTenantAccessListRecord,
	MasterUserRecord,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import {
	MasterTenantAccessBillingBadge,
	MasterTenantAccessBranchTypeBadge,
	MasterTenantAccessRoleBadge,
	MasterTenantAccessStatusBadge,
} from "@/app/src/ui/master/tenant-access/MasterTenantAccessBadges";
import {
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

type MasterTenantAccessTableRowProps = {
	record: MasterTenantAccessListRecord;
};

export function MasterTenantAccessTableRow({
	record,
}: MasterTenantAccessTableRowProps) {
	switch (record.entity) {
		case "subscriber":
			return <SubscriberRow record={record} />;
		case "company":
			return <CompanyRow record={record} />;
		case "branch":
			return <BranchRow record={record} />;
		case "user":
			return <UserRow record={record} />;
	}
}

function SubscriberRow({ record }: MasterTenantAccessTableRowProps) {
	const subscriber = record.record as MasterSubscriberRecord;

	return (
		<tr className="module-table-row">
			<PrimaryCell title={subscriber.name} supporting={subscriber.ownerEmail} />
			<TextCell title={record.relationName} supporting={record.relationText} />
			<BadgeCell>
				<MasterTenantAccessStatusBadge status={subscriber.status} />
			</BadgeCell>
			<NumberCell value={record.countA} />
			<NumberCell value={record.countB} />
			<BadgeCell>
				<MasterTenantAccessBillingBadge status={subscriber.billingStatus} />
			</BadgeCell>
			<TextCell title={record.dateText} />
			<ActionCell record={record} />
		</tr>
	);
}

function CompanyRow({ record }: MasterTenantAccessTableRowProps) {
	const company = record.record as MasterCompanyRecord;

	return (
		<tr className="module-table-row">
			<PrimaryCell title={company.legalName} supporting={company.email} />
			<TextCell title={record.relationName} supporting={company.tradeName} />
			<BadgeCell>
				<MasterTenantAccessStatusBadge status={company.status} />
			</BadgeCell>
			<NumberCell value={record.countA} />
			<NumberCell value={record.countB} />
			<TextCell title={company.planName} supporting={company.taxId} />
			<ActionCell record={record} />
		</tr>
	);
}

function BranchRow({ record }: MasterTenantAccessTableRowProps) {
	const branch = record.record as MasterBranchRecord;

	return (
		<tr className="module-table-row">
			<PrimaryCell title={branch.name} supporting={branch.email} />
			<TextCell title={record.relationName} supporting={branch.code} />
			<TextCell title={record.relationText} />
			<BadgeCell>
				<MasterTenantAccessStatusBadge status={branch.status} />
			</BadgeCell>
			<BadgeCell>
				<div className="flex flex-wrap items-center gap-2">
					<MasterTenantAccessBranchTypeBadge branchType={branch.branchType} />
					<span className="text-xs font-semibold text-darknavy/45">
						{branch.tin}
					</span>
				</div>
			</BadgeCell>
			<ActionCell record={record} />
		</tr>
	);
}

function UserRow({ record }: MasterTenantAccessTableRowProps) {
	const user = record.record as MasterUserRecord;
	const primaryRole = user.assignments[0]?.role ?? "Viewer";

	return (
		<tr className="module-table-row">
			<PrimaryCell title={user.name} supporting={user.email} />
			<TextCell title={record.relationName} supporting={user.contactNumber} />
			<BadgeCell>
				<MasterTenantAccessStatusBadge status={user.status} />
			</BadgeCell>
			<NumberCell value={record.countA} />
			<NumberCell value={record.countB} />
			<BadgeCell>
				<MasterTenantAccessRoleBadge role={primaryRole} />
			</BadgeCell>
			<TextCell title={record.dateText} />
			<ActionCell record={record} />
		</tr>
	);
}

function PrimaryCell({
	supporting,
	title,
}: {
	supporting?: string;
	title: string;
}) {
	return (
		<td className="px-4 py-4">
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-darknavy">{title}</p>
				{supporting ? (
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{supporting}
					</p>
				) : null}
			</div>
		</td>
	);
}

function TextCell({
	supporting,
	title,
}: {
	supporting?: string;
	title: string;
}) {
	return (
		<td className="px-4 py-4">
			<p className="truncate text-sm font-semibold text-darknavy">{title}</p>
			{supporting ? (
				<p className="mt-1 truncate text-sm text-darknavy/48">{supporting}</p>
			) : null}
		</td>
	);
}

function NumberCell({ value }: { value: number | string }) {
	return (
		<td className="px-4 py-4 text-sm font-semibold text-darknavy">
			{value}
		</td>
	);
}

function BadgeCell({ children }: { children: ReactNode }) {
	return <td className="px-4 py-4">{children}</td>;
}

function ActionCell({ record }: MasterTenantAccessTableRowProps) {
	return (
		<td className="px-4 py-4">
			<ModuleTableActions className="justify-center">
				<ModuleTableActionLink
					href={getMasterTenantAccessViewHref(record.entity, record.id)}
					label={`View ${record.primaryText}`}
					variant="view"
				/>
				<ModuleTableActionLink
					href={getMasterTenantAccessEditHref(record.entity, record.id)}
					label={`Edit ${record.primaryText}`}
					variant="edit"
				/>
			</ModuleTableActions>
		</td>
	);
}

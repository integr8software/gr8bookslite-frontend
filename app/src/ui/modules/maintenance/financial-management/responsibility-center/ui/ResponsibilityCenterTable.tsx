import Link from "next/link";
import {
	Building2,
	Edit3,
	Eye,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterTableProps = {
	centers: ResponsibilityCenter[];
	onDeleteCenter: (center: ResponsibilityCenter) => void;
};

export function ResponsibilityCenterTable({
	centers,
	onDeleteCenter,
}: ResponsibilityCenterTableProps) {
	const centerById = new Map(centers.map((center) => [center.id, center]));

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid grid-cols-[0.65fr_1.15fr_0.8fr_0.85fr_0.7fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50 max-lg:hidden">
				<span>Code</span>
				<span>Name</span>
				<span>Type</span>
				<span>Manager</span>
				<span>Status</span>
				<span className="text-right">Actions</span>
			</div>
			<div className="divide-y divide-darknavy/10">
				{centers.length > 0 ? (
					centers.map((center) => (
						<ResponsibilityCenterRow
							key={center.id}
							center={center}
							parentName={
								center.parentId ? centerById.get(center.parentId)?.name : undefined
							}
							onDeleteCenter={onDeleteCenter}
						/>
					))
				) : (
					<div className="px-4 py-10 text-center">
						<p className="text-sm font-semibold text-darknavy">
							No responsibility centers yet
						</p>
						<p className="mt-1 text-sm text-darknavy/55">
							Add a center to start grouping financial accountability.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function ResponsibilityCenterRow({
	center,
	parentName,
	onDeleteCenter,
}: {
	center: ResponsibilityCenter;
	parentName?: string;
	onDeleteCenter: (center: ResponsibilityCenter) => void;
}) {
	return (
		<article className="grid gap-3 px-4 py-4 lg:grid-cols-[0.65fr_1.15fr_0.8fr_0.85fr_0.7fr_8rem] lg:items-center lg:gap-4">
			<Detail label="Code" value={center.code} />
			<CenterIdentity center={center} parentName={parentName} />
			<Detail label="Type" value={center.type} />
			<Detail label="Manager" value={center.manager} />
			<StatusBadge status={center.status} />
			<RowActions center={center} onDeleteCenter={onDeleteCenter} />
		</article>
	);
}

function CenterIdentity({
	center,
	parentName,
}: {
	center: ResponsibilityCenter;
	parentName?: string;
}) {
	return (
		<div className="flex min-w-0 items-start gap-3">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
				<Building2 className="h-5 w-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<h3 className="truncate text-sm font-semibold text-darknavy">
					{center.name}
				</h3>
				<p className="mt-1 truncate text-xs text-darknavy/50">
					{parentName ? `Reports to ${parentName}` : "Top-level center"}
				</p>
			</div>
		</div>
	);
}

function RowActions({
	center,
	onDeleteCenter,
}: {
	center: ResponsibilityCenter;
	onDeleteCenter: (center: ResponsibilityCenter) => void;
}) {
	return (
		<div className="flex items-center gap-1 lg:justify-end">
			<IconLink
				href={`${ResponsibilityCenterHref}/view/${center.id}`}
				label={`View ${center.name}`}
				icon={Eye}
			/>
			<IconLink
				href={`${ResponsibilityCenterHref}/edit/${center.id}`}
				label={`Edit ${center.name}`}
				icon={Edit3}
			/>
			<button
				type="button"
				onClick={() => onDeleteCenter(center)}
				aria-label={`Delete ${center.name}`}
				className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
			>
				<Trash2 className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

function Detail({ label, value }: { label: string; value?: string }) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/40 lg:hidden">
				{label}
			</p>
			<p className="mt-1 truncate text-sm font-medium text-darknavy lg:mt-0">
				{value || "-"}
			</p>
		</div>
	);
}

function StatusBadge({
	status,
}: {
	status: ResponsibilityCenter["status"];
}) {
	const isActive = status === "Active";

	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/40 lg:hidden">
				Status
			</p>
			<span
				className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold lg:mt-0 ${
					isActive
						? "bg-citron/25 text-darknavy"
						: "bg-darknavy/8 text-darknavy/55"
				}`}
			>
				{status}
			</span>
		</div>
	);
}

function IconLink({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: LucideIcon;
	label: string;
}) {
	return (
		<Link
			href={href}
			aria-label={label}
			className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
		</Link>
	);
}

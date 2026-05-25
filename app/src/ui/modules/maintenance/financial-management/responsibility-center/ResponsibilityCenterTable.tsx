import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import { ResponsibilityCenterTableRow } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTableRow";

type ResponsibilityCenterTableProps = {
	centers: ResponsibilityCenter[];
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
};

export function ResponsibilityCenterTable({
	centers,
	onStatusChangeCenter,
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
						<ResponsibilityCenterTableRow
							key={center.id}
							center={center}
							parentName={
								center.parentId ? centerById.get(center.parentId)?.name : undefined
							}
							onStatusChangeCenter={onStatusChangeCenter}
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

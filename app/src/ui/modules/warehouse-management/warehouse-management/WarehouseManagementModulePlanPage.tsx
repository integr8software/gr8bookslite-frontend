import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";

type WarehouseManagementModulePlanPageProps = {
	description: string;
	group: "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";
	records: string[];
	title: string;
};

export function WarehouseManagementModulePlanPage({
	description,
	group,
	records,
	title,
}: WarehouseManagementModulePlanPageProps) {
	return (
		<main className="space-y-6">
			<ModuleHeader
				eyebrow={group}
				title={title}
				description={description}
			/>

			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
				<div className="text-sm font-semibold text-darknavy">{group}</div>
				<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{records.map((record) => (
						<div
							key={record}
							className="rounded-md border border-darknavy/10 bg-offwhite px-4 py-3 text-sm font-medium text-darknavy/75"
						>
							{record}
						</div>
					))}
				</div>
			</section>
		</main>
	);
}

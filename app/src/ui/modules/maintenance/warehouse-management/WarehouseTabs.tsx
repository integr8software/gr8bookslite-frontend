import Link from "next/link";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import type {
	WarehouseDetailsTab,
	WarehouseRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type WarehouseTabsProps = {
	activeTab: WarehouseDetailsTab;
	warehouse: WarehouseRecord;
};

const WarehouseTabItems: Array<{
	key: WarehouseDetailsTab;
	label: string;
	count?: (warehouse: WarehouseRecord) => number;
}> = [
	{ key: "information", label: "Information" },
	{
		key: "access",
		label: "Warehouse Access",
		count: (warehouse) => warehouse.access.length,
	},
	{
		key: "items",
		label: "Items",
		count: (warehouse) => warehouse.items.length,
	},
];

export function WarehouseTabs({ activeTab, warehouse }: WarehouseTabsProps) {
	return (
		<nav className="flex flex-wrap gap-2 rounded-lg border border-darknavy/10 bg-white p-2 shadow-sm">
			{WarehouseTabItems.map((tab) => {
				const isActive = tab.key === activeTab;

				return (
					<Link
						key={tab.key}
						href={`${WarehouseManagementHref}/view/${warehouse.id}?tab=${tab.key}`}
						className={joinClasses(
							"inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
							isActive
								? "bg-skyblue text-white shadow-sm shadow-skyblue/20"
								: "text-darknavy/65 hover:bg-skyblue/10 hover:text-darknavy",
						)}
					>
						{tab.label}
						{tab.count ? (
							<span
								className={joinClasses(
									"rounded-full px-2 py-0.5 text-xs",
									isActive ? "bg-white/20" : "bg-darknavy/8",
								)}
							>
								{tab.count(warehouse)}
							</span>
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}


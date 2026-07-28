"use client";

import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import type { DeliveryVehicleModulePageState } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { DeliveryVehicleModuleStatisticCards } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleStatisticCards";
import { DeliveryVehicleModuleTable } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleTable";

type DeliveryVehicleModuleListPageProps = {
	href: string;
	page: DeliveryVehicleModulePageState;
	paginationStorageKey: string;
};

export function DeliveryVehicleModuleListPage({
	href,
	page,
	paginationStorageKey,
}: DeliveryVehicleModuleListPageProps) {
	const hasActiveFilters =
		page.query.trim().length > 0 ||
		page.statusFilter !== "All" ||
		page.categoryFilter !== "All";

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
				eyebrow={
					<>
						<Truck className="h-3.5 w-3.5" aria-hidden="true" />
						{page.config.code} - Delivery Vehicle Management
					</>
				}
				title={page.config.title}
				description={page.config.description}
				actions={
					<Link href={`${href}/add`} className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{page.config.primaryAction}
					</Link>
				}
			/>
			<DeliveryVehicleModuleStatisticCards page={page} />
			<DeliveryVehicleModuleTable
				hasActiveFilters={hasActiveFilters}
				href={href}
				page={page}
				paginationStorageKey={paginationStorageKey}
			/>
		</section>
	);
}

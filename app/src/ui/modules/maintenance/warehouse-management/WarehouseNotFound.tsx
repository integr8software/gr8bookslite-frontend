import Link from "next/link";
import { Warehouse } from "lucide-react";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function WarehouseNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-skyblue/12 text-skyblue">
				<Warehouse className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">
				Warehouse not found
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm text-darknavy/60">
				The warehouse may have been removed or the record identifier is invalid.
			</p>
			<Link
				href={WarehouseManagementHref}
				className={`${moduleHeaderActionClassNames.primary} mt-5`}
			>
				Back to Warehouses
			</Link>
		</section>
	);
}


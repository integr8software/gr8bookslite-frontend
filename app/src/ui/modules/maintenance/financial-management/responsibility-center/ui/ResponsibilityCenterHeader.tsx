import Link from "next/link";
import { Plus } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";

export function ResponsibilityCenterHeader() {
	return (
		<div className="flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 className="text-xl font-semibold text-darknavy">
					Responsibility Center
				</h2>
				<p className="mt-1 text-sm text-darknavy/55">
					Maintain accountability centers for cost, revenue, profit, and
					investment reporting.
				</p>
			</div>
			<Link
				href={`${ResponsibilityCenterHref}/add`}
				className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Center
			</Link>
		</div>
	);
}

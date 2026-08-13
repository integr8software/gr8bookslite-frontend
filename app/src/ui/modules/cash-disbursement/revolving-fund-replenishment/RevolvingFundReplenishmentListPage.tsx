import Link from "next/link";
import { Home, Plus, Search } from "lucide-react";
import { RevolvingFundReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function RevolvingFundReplenishmentListPage() {
	return (
		<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
			<main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
				<ModuleHeader
					variant="panel"
					title="Revolving Fund Replenishment"
					titleAs="h1"
					description="Track replenishments that restore issued revolving funds."
					eyebrow={
						<>
							<Home className="h-3.5 w-3.5" aria-hidden="true" />
							Cash disbursement
						</>
					}
					actions={
						<Link
							href={`${RevolvingFundReplenishmentHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							New Replenishment
						</Link>
					}
				/>

				<section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
					<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
						<Search className="h-5 w-5" aria-hidden="true" />
					</div>
					<h2 className="mt-4 text-base font-semibold text-darknavy">
						No revolving fund replenishments found
					</h2>
					<p className="mx-auto mt-2 max-w-xl text-sm text-darknavy/55">
						Created replenishment records will appear here for review and posting.
					</p>
				</section>
			</main>
		</section>
	);
}

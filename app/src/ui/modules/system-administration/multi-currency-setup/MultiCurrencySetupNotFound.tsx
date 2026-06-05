import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { MultiCurrencySetupHref } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function MultiCurrencySetupNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm shadow-darknavy/5">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-coralpink/10 text-coralpink">
				<AlertCircle className="h-5 w-5" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-darknavy">
				Currency setup not found
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm leading-6 text-darknavy/60">
				The selected currency setup may have been deleted or is no longer
				available.
			</p>
			<div className="mt-5 flex justify-center">
				<Link
					href={MultiCurrencySetupHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			</div>
		</section>
	);
}

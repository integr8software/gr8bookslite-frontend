import { ArrowLeft } from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { ResponsibilityCenterSecondaryLink } from "./ResponsibilityCenterButtons";

export function ResponsibilityCenterNotFound() {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">
				Responsibility center not found
			</h2>
			<p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-darknavy/55">
				The selected responsibility center may have been deleted or the link is
				no longer valid.
			</p>
			<div className="mt-5">
				<ResponsibilityCenterSecondaryLink
					href={ResponsibilityCenterHref}
					icon={ArrowLeft}
					label="Back to Responsibility Center"
				/>
			</div>
		</section>
	);
}

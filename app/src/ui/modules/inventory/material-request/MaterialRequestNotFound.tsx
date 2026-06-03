import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MaterialRequestHref } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function MaterialRequestNotFound() {
	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Material Request Not Found"
				description="The selected material request could not be found."
				actions={
					<Link
						href={MaterialRequestHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back to List
					</Link>
				}
			/>
		</section>
	);
}

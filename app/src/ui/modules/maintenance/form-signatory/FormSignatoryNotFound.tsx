import { FileSignature } from "lucide-react";
import { FormSignatoryHref } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function FormSignatoryNotFound() {
	return (
		<ModuleNotFound
			title="Form Signatory Not Found"
			description="The requested form signatory setup could not be found."
			actionHref={FormSignatoryHref}
			actionLabel="Back to Form Signatory"
			icon={<FileSignature className="h-5 w-5" aria-hidden="true" />}
		/>
	);
}

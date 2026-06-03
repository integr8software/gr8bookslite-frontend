import { FileSignature, Save } from "lucide-react";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";

type FormSignatoryMetricsProps = {
	signatureImageCount: number;
	signatoryCount: number;
};

export function FormSignatoryMetrics({
	signatureImageCount,
	signatoryCount,
}: FormSignatoryMetricsProps) {
	return (
		<ModuleMetrics
			metrics={[
				{
					icon: FileSignature,
					label: "Signatories",
					value: signatoryCount,
					helper: "Configured for selected form",
					tone: "blue",
				},
				{
					icon: Save,
					label: "Signature Images",
					value: signatureImageCount,
					helper: "Uploaded previews",
					tone: "emerald",
				},
			]}
		/>
	);
}

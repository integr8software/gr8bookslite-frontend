import { FileSignature, Save, Signature } from "lucide-react";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";

type FormSignatoryMetricsProps = {
	eSignatureCount: number;
	signatoryCount: number;
	signatureImageCount: number;
};

export function FormSignatoryMetrics({
	eSignatureCount,
	signatoryCount,
	signatureImageCount,
}: FormSignatoryMetricsProps) {
	return (
		<ModuleMetrics
			metrics={[
				{
					icon: FileSignature,
					label: "No. of Signatories",
					value: signatoryCount,
					helper: "Configured for selected form",
					tone: "blue",
				},
				{
					icon: Save,
					label: "Signatures Image Upload",
					value: signatureImageCount,
					helper: "Uploaded previews",
					tone: "emerald",
				},
				{
					icon: Signature,
					label: "E-Signature",
					value: eSignatureCount,
					helper: "Made in signature pad",
					tone: "amber",
				},
			]}
		/>
	);
}

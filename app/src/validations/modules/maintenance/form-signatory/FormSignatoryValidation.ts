import { z } from "zod";
import { FormSignatoryTemporarySignatureLabel } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";

export const FormSignatorySchema = z.object({
	branch: z.string().min(1, "Select a branch."),
	module: z.string().min(1, "Select a module."),
	rows: z
		.array(
			z.object({
				label: z.string().trim().min(1, "Enter a signatory label."),
				name: z.string(),
				position: z.string(),
				signatureName: z.string(),
				signaturePreview: z.string(),
				signatureValidUntil: z.string(),
			}),
		)
		.min(1, "Add at least one signatory.")
		.superRefine((rows, context) => {
			for (const [index, row] of rows.entries()) {
				if (
					row.label === FormSignatoryTemporarySignatureLabel &&
					row.signaturePreview &&
					!row.signatureValidUntil
				) {
					context.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Set a valid until date for temporary signatures.",
						path: [index, "signatureValidUntil"],
					});
				}
			}
		}),
});

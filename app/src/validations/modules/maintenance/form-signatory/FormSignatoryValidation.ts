import { z } from "zod";

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
			}),
		)
		.min(1, "Add at least one signatory."),
});

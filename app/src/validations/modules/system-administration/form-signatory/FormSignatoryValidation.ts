import { z } from "zod";
export const FormSignatorySchema = z.object({
	branch: z.string().min(1, "Select a branch."),
	module: z.string().min(1, "Select a module."),
	rows: z
		.array(
			z.object({
				label: z.string().trim().min(1, "Enter a signatory label."),
				isThisTemporary: z.boolean().nullable().optional(),
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
					row.isThisTemporary === true &&
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

import { FileSignature, LoaderCircle, Plus, Save, X } from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type FormSignatoryHeaderProps = {
	isEditing: boolean;
	isSaving: boolean;
	onClose: () => void;
	onNew: () => void;
	onSave: () => void;
};

export function FormSignatoryHeader({
	isEditing,
	isSaving,
	onClose,
	onNew,
	onSave,
}: FormSignatoryHeaderProps) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title="Form Signatory"
			description="Maintain signatory labels, names, positions, and signature images per branch and module."
			eyebrow={
				<>
					<FileSignature className="h-3.5 w-3.5" aria-hidden="true" />
					Maintenance
				</>
			}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					{isEditing ? (
						<>
							<button
								type="button"
								disabled={isSaving}
								onClick={onSave}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-70`}
							>
								{isSaving ? (
									<LoaderCircle
										className="h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
								) : (
									<Save className="h-4 w-4" aria-hidden="true" />
								)}
								{isSaving ? "Saving..." : "Save"}
							</button>
							<button
								type="button"
								disabled={isSaving}
								onClick={onClose}
								className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								<X className="h-4 w-4" aria-hidden="true" />
								Close
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={onNew}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Signature
						</button>
					)}
				</div>
			}
		/>
	);
}

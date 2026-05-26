import { FileSignature, Plus, Save, X } from "lucide-react";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type FormSignatoryHeaderProps = {
	isEditing: boolean;
	onClose: () => void;
	onNew: () => void;
	onSave: () => void;
};

export function FormSignatoryHeader({
	isEditing,
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
								onClick={onSave}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save
							</button>
							<button
								type="button"
								onClick={onClose}
								className={moduleHeaderActionClassNames.secondary}
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

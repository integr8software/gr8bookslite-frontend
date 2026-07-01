import { Download, Plus, Upload } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function TransactionTypeHeaderActions({ onAdd }: { onAdd: () => void }) {
	return (
		<>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Upload className="h-4 w-4" aria-hidden="true" />
				Import
			</button>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</button>
			<button
				type="button"
				onClick={onAdd}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Transaction Type
			</button>
		</>
	);
}

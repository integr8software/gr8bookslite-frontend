import { Plus } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function TransactionTypeHeaderActions({ onAdd }: { onAdd: () => void }) {
	return (
		<button
			type="button"
			onClick={onAdd}
			data-spotlight-id="maintenance-create-record"
			className={moduleHeaderActionClassNames.primary}
		>
			<Plus className="h-4 w-4" aria-hidden="true" />
			Add Inventory Transaction Type
		</button>
	);
}

import { AlertCircle } from "lucide-react";

export function ModuleDataEntryError({ error }: { error: string }) {
	return (
		<div className="border-t border-coralpink/20 bg-coralpink/8 px-5 py-3 text-sm font-semibold text-coralpink">
			<div className="flex items-start gap-2">
				<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
				<span>{error}</span>
			</div>
		</div>
	);
}

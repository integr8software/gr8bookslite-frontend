import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type SalesInvoiceEntriesTab = "accounts" | "items";

type SalesInvoiceEntryTabsProps = {
	activeTab: SalesInvoiceEntriesTab;
	onTabChange: (tab: SalesInvoiceEntriesTab) => void;
};

export function SalesInvoiceEntryTabs({
	activeTab,
	onTabChange,
}: SalesInvoiceEntryTabsProps) {
	return (
		<div
			role="tablist"
			aria-label="Sales invoice row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{SalesInvoiceEntryTabsList.map((tab) => {
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						className={joinClasses(
							"h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
							isActive
								? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
								: "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
						)}
						onClick={() => onTabChange(tab.id)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

const SalesInvoiceEntryTabsList = [
	{ id: "items", label: "Item Entry" },
	{ id: "accounts", label: "Account Entry" },
] satisfies Array<{
	id: SalesInvoiceEntriesTab;
	label: string;
}>;

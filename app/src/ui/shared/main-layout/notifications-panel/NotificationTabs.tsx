import type { MainNotificationTab } from "@/app/src/types/shared/main-layout/MainLayoutTypes";
import { joinClasses } from "./utils";

type NotificationTabsProps = {
	activeTab: MainNotificationTab;
	onTabChange: (tab: MainNotificationTab) => void;
};

export function NotificationTabs({
	activeTab,
	onTabChange,
}: NotificationTabsProps) {
	return (
		<div className="grid grid-cols-3 gap-1 border-b border-darknavy/10 bg-darknavy/5 p-2">
			<TabButton
				isActive={activeTab === "all"}
				label="All"
				onClick={() => onTabChange("all")}
			/>
			<TabButton
				isActive={activeTab === "unread"}
				label="Unread"
				onClick={() => onTabChange("unread")}
			/>
			<TabButton
				isActive={activeTab === "read"}
				label="Read"
				onClick={() => onTabChange("read")}
			/>
		</div>
	);
}

type TabButtonProps = {
	isActive: boolean;
	label: string;
	onClick: () => void;
};

function TabButton({ isActive, label, onClick }: TabButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={isActive}
			className={joinClasses(
				"min-h-9 rounded px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
				isActive
					? "bg-white text-darknavy shadow-sm"
					: "text-darknavy/55 hover:bg-white/75 hover:text-darknavy",
			)}
		>
			{label}
		</button>
	);
}

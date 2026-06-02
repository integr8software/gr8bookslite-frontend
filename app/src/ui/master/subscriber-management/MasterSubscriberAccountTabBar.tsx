"use client";

import Link from "next/link";
import {
	MasterSubscriberAccountTabs,
	getMasterSubscriberManagementSectionHref,
	getMasterSubscriberManagementViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriberAccountTabKey =
	(typeof MasterSubscriberAccountTabs)[number]["key"];

type MasterSubscriberAccountTabBarProps = {
	activeTab: MasterSubscriberAccountTabKey;
	className?: string;
	companyId?: string;
	recordId: string;
	showBottomBorder?: boolean;
};

export function MasterSubscriberAccountTabBar({
	activeTab,
	className,
	companyId,
	recordId,
	showBottomBorder = true,
}: MasterSubscriberAccountTabBarProps) {
	return (
		<nav
			className={joinClasses(
				"flex overflow-x-auto px-4 pt-3 xl:px-5",
				showBottomBorder && "border-b border-darknavy/10",
				className,
			)}
		>
			{MasterSubscriberAccountTabs.map((tab) => {
				const Icon = tab.icon;
				const href = getAccountTabHref(recordId, tab.key, companyId);
				const isActive = tab.key === activeTab;

				return (
					<Link
						key={tab.key}
						href={href}
						className={joinClasses(
							"relative inline-flex h-14 min-w-max items-center gap-2 px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
							isActive
								? "text-[var(--skyblue)]"
								: "text-darknavy/68 hover:text-darknavy",
						)}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
						{tab.label}
						{isActive ? (
							<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--skyblue)]" />
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}

function getAccountTabHref(
	recordId: string,
	tabKey: MasterSubscriberAccountTabKey,
	companyId?: string,
) {
	if (tabKey === "account-information") {
		return getMasterSubscriberManagementViewHref(recordId);
	}

	if (tabKey === "company-information") {
		return getMasterSubscriberManagementSectionHref(
			recordId,
			"company-information",
			companyId,
		);
	}

	return getMasterSubscriberManagementSectionHref(recordId, "users", companyId);
}

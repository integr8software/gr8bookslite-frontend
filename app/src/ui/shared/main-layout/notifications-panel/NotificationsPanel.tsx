"use client";

import { Bell, CheckCheck, X } from "lucide-react";
import type { MainNotification } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import type { MainNotificationTab } from "@/app/src/types/shared/MainLayoutTypes";
import { NotificationList } from "./NotificationList";
import { NotificationTabs } from "./NotificationTabs";
import { joinClasses, useIncrementalVisibleCount } from "./utils";

const NotificationInitialCount = 8;
const NotificationBatchSize = 8;

type MainNotificationsPanelProps = {
	notifications: MainNotification[];
	tab: MainNotificationTab;
	unreadCount: number;
	className?: string;
	onClose?: () => void;
	onMarkAllAsRead: () => void;
	onMarkAsRead: (notificationId: string) => void;
	onTabChange: (tab: MainNotificationTab) => void;
};

export function MainNotificationsPanel({
	notifications,
	tab,
	unreadCount,
	className,
	onClose,
	onMarkAllAsRead,
	onMarkAsRead,
	onTabChange,
}: MainNotificationsPanelProps) {
	const [
		notificationVisibleCount,
		hasMoreNotifications,
		setNotificationSentinel,
	] = useIncrementalVisibleCount(
		notifications.length,
		NotificationInitialCount,
		NotificationBatchSize,
	);
	const visibleNotifications = notifications.slice(
		0,
		notificationVisibleCount,
	);

	return (
		<section
			className={joinClasses(
				"flex h-full min-h-0 flex-col overflow-hidden border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.16)] xl:border-y-0 xl:border-r xl:border-l-darknavy/10 xl:shadow-none",
				className,
			)}
			aria-label="Notifications"
		>
			<div className="flex items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-4">
				<div className="flex min-w-0 items-center gap-2">
					<Bell
						className="h-4 w-4 shrink-0 text-darknavy/60"
						aria-hidden="true"
					/>
					<h2 className="truncate text-sm font-semibold text-darknavy">
						Notifications
					</h2>
					{unreadCount > 0 ? (
						<span className="rounded bg-coralpink/10 px-2 py-0.5 text-xs font-semibold text-coralpink">
							{unreadCount}
						</span>
					) : null}
				</div>

				{onClose ? (
					<button
						type="button"
						onClick={onClose}
						aria-label="Close notifications"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				) : null}
			</div>

			<NotificationTabs activeTab={tab} onTabChange={onTabChange} />

			<div className="border-b border-darknavy/10 px-3 py-2">
				<button
					type="button"
					onClick={onMarkAllAsRead}
					disabled={unreadCount === 0}
					className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-darknavy transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:text-darknavy/35 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
				>
					<CheckCheck className="h-4 w-4" aria-hidden="true" />
					<span>Mark all as read</span>
				</button>
			</div>

			<NotificationList
				hasMoreNotifications={hasMoreNotifications}
				notifications={visibleNotifications}
				tab={tab}
				setNotificationSentinel={setNotificationSentinel}
				onClose={onClose}
				onMarkAsRead={onMarkAsRead}
			/>
		</section>
	);
}

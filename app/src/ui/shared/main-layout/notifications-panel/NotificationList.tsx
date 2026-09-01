import Link from "next/link";
import { CheckCheck } from "lucide-react";
import type { MainNotification } from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import type { MainNotificationTab } from "@/app/src/types/shared/main-layout/MainLayoutTypes";
import { getEmptyNotificationText, joinClasses } from "./utils";

type NotificationListProps = {
	hasMoreNotifications: boolean;
	notifications: MainNotification[];
	tab: MainNotificationTab;
	setNotificationSentinel: (node: HTMLDivElement | null) => void;
	onClose?: () => void;
	onMarkAsRead: (notificationId: string) => void;
};

export function NotificationList({
	hasMoreNotifications,
	notifications,
	tab,
	setNotificationSentinel,
	onClose,
	onMarkAsRead,
}: NotificationListProps) {
	return (
		<div className="min-h-0 flex-1 overflow-y-auto p-2.5">
			{notifications.length ? (
				<div className="grid gap-1.5">
					{notifications.map((notification) => (
						<Link
							key={notification.id}
							href={notification.href}
							onClick={() => {
								onMarkAsRead(notification.id);
								onClose?.();
							}}
							className={joinClasses(
								"block rounded-md border border-transparent px-2.5 py-2.5 transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
								!notification.isRead &&
									"border-skyblue/10 bg-skyblue/10",
							)}
						>
							<div className="flex items-start gap-2.5">
								<span
									className={joinClasses(
										"mt-1 h-2 w-2 shrink-0 rounded-full",
										notification.isRead
											? "bg-darknavy/20"
											: "bg-skyblue shadow-[0_0_10px_rgb(var(--skyblue-rgb)/0.28)]",
									)}
								/>
								<span className="min-w-0 flex-1">
									<span className="block text-[13px] font-semibold leading-[1.2rem] text-darknavy">
										{notification.title}
									</span>
									<span className="mt-0.5 block text-xs leading-[1.15rem] text-darknavy/62">
										{notification.body}
									</span>
									<span className="mt-1.5 block text-[11px] font-medium text-darknavy/45">
										{notification.time}
									</span>
								</span>
							</div>
						</Link>
					))}
					{hasMoreNotifications ? (
						<div
							ref={setNotificationSentinel}
							className="h-4"
							aria-hidden="true"
						/>
					) : null}
				</div>
			) : (
				<div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
					<CheckCheck
						className="h-8 w-8 text-skyblue"
						aria-hidden="true"
					/>
					<p className="mt-3 text-sm font-semibold text-darknavy">
						Nothing here
					</p>
					<p className="mt-1 text-sm text-darknavy/55">
						{getEmptyNotificationText(tab)}
					</p>
				</div>
			)}
		</div>
	);
}

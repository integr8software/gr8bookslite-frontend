import Link from "next/link";
import { CheckCheck } from "lucide-react";
import type { MainNotification } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import type { MainNotificationTab } from "@/app/src/types/shared/MainLayoutTypes";
import {
  getEmptyNotificationText,
  joinClasses,
} from "./NotificationsPanelUtils";

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
    <div className="min-h-0 flex-1 overflow-y-auto p-2">
      {notifications.length ? (
        <>
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              onClick={() => {
                onMarkAsRead(notification.id);
                onClose?.();
              }}
              className="block rounded-md px-3 py-3 transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <div className="flex items-start gap-3">
                <span
                  className={joinClasses(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    notification.isRead ? "bg-darknavy/20" : "bg-coralpink",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-5 text-darknavy">
                    {notification.title}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-darknavy/62">
                    {notification.body}
                  </span>
                  <span className="mt-2 block text-xs font-medium text-darknavy/45">
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
        </>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
          <CheckCheck className="h-8 w-8 text-skyblue" aria-hidden="true" />
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

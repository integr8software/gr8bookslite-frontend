"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";
import type { MainNotification } from "@/app/src/data/modules/shared/MainLayoutData";
import type { MainNotificationTab } from "@/app/src/hooks/modules/shared/useMainLayout";

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
          <Bell className="h-4 w-4 shrink-0 text-darknavy/60" aria-hidden="true" />
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

      <div className="grid grid-cols-3 gap-1 border-b border-darknavy/10 bg-darknavy/5 p-2">
        <TabButton
          isActive={tab === "all"}
          label="All"
          onClick={() => onTabChange("all")}
        />
        <TabButton
          isActive={tab === "unread"}
          label="Unread"
          onClick={() => onTabChange("unread")}
        />
        <TabButton
          isActive={tab === "read"}
          label="Read"
          onClick={() => onTabChange("read")}
        />
      </div>

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

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {notifications.length ? (
          <>
            {visibleNotifications.map((notification) => (
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
    </section>
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

function useIncrementalVisibleCount(
  totalItems: number,
  initialCount: number,
  batchSize: number,
) {
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(totalItems, initialCount),
  );
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelNode(node);
  }, []);
  const clampedVisibleCount = Math.min(visibleCount, totalItems);

  useEffect(() => {
    if (clampedVisibleCount >= totalItems || !sentinelNode) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(totalItems, current + batchSize),
        );
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(sentinelNode);

    return () => {
      observer.disconnect();
    };
  }, [batchSize, clampedVisibleCount, sentinelNode, totalItems]);

  return [
    clampedVisibleCount,
    clampedVisibleCount < totalItems,
    sentinelRef,
  ] as const;
}

function getEmptyNotificationText(tab: MainNotificationTab) {
  if (tab === "all") {
    return "Notifications will appear here.";
  }

  return tab === "unread"
    ? "Unread notifications will appear here."
    : "Read notifications will appear here.";
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

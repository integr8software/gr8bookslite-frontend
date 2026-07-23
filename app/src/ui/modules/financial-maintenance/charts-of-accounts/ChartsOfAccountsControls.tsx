"use client";

import { forwardRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  AccountTypeBadgeVariants,
  AccountTypeLabels,
  BadgeVariantClasses,
} from "@/app/src/constants/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";

export function Card({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={joinClasses(
        "rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  size = "default",
  variant = "primary",
  ...props
}: ComponentProps<"button"> & {
  size?: "default" | "icon";
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      type="button"
      className={joinClasses(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-45",
        size === "icon" ? "h-9 w-9" : "h-10 px-4",
        variant === "primary" &&
        "theme-accent-contrast-text bg-skyblue shadow-sm shadow-skyblue/20 hover:bg-skyblue/85 focus-visible:ring-skyblue/20",
        variant === "secondary" &&
        "border border-darknavy/10 bg-white text-darknavy/75 shadow-sm shadow-darknavy/5 hover:border-skyblue/40 hover:bg-skyblue/10 hover:text-darknavy focus-visible:ring-skyblue/15",
        variant === "ghost" &&
        "text-darknavy/60 hover:bg-skyblue/10 hover:text-darknavy focus-visible:ring-skyblue/15",
        variant === "danger" &&
        "text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={joinClasses(
        "app-disabled-control app-data-entry-field h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 read-only:cursor-default disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32",
        className,
      )}
      {...props}
    />
  );
  },
);

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(
  function Select({ children, className, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={joinClasses(
          "app-select-control app-disabled-control h-11 w-full appearance-none rounded-lg border border-darknavy/10 bg-white px-3 pr-9 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35",
          props.disabled &&
            "border-darknavy/15 opacity-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
  },
);

export function Field({
  children,
  className,
  error,
  helper,
  htmlFor,
  label,
  reserveMessageSpace = false,
  required = false,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  helper?: string;
  htmlFor?: string;
  label: string;
  reserveMessageSpace?: boolean;
  required?: boolean;
}) {
  const message = error ?? helper;

  return (
    <div className={joinClasses("grid content-start gap-1.5 self-start", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-darknavy/70"
      >
        <span>
          {label}
          {required ? <span className="text-coralpink"> *</span> : null}
        </span>
      </label>
      {children}
      {message || reserveMessageSpace ? (
        <p
          className={joinClasses(
            "overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium leading-4",
            message ? "min-h-4" : "h-0",
            error ? "text-coralpink" : "text-amber-600",
            !message && "invisible",
          )}
          title={message || undefined}
        >
          {message || "No validation message"}
        </p>
      ) : null}
    </div>
  );
}

export function TypeBadge({ type }: { type: ChartAccount["accountType"] }) {
  return <Badge variant={AccountTypeBadgeVariants[type]}>{AccountTypeLabels[type]}</Badge>;
}

export function Badge({
  children,
  variant = "gray",
}: {
  children: ReactNode;
  variant?: "blue" | "green" | "gray" | "amber" | "violet" | "rose";
}) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        BadgeVariantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}

export function Tabs<TValue extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: TValue) => void;
  options: TValue[];
  value: TValue;
}) {
  return (
    <div className="flex gap-0 overflow-x-auto">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={joinClasses(
            "relative h-12 whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition",
            value === option
              ? "border-skyblue text-skyblue"
              : "border-transparent text-darknavy/65 hover:text-darknavy",
          )}
        >
          <span className="relative">{option}</span>
        </button>
      ))}
    </div>
  );
}

export function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}


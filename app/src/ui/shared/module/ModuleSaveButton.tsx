"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { ChevronDown, Save, type LucideIcon } from "lucide-react";
import {
  joinClasses,
  moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleSaveButtonMenuItem = {
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
  onSelect?: () => void;
};

type ModuleSaveButtonProps = {
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  label?: string;
  menuItems?: ModuleSaveButtonMenuItem[];
  menuLabel?: string;
  onSave?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export function ModuleSaveButton({
  className,
  disabled = false,
  icon: SaveIcon = Save,
  label = "Save",
  menuItems = [],
  menuLabel = "Open save options",
  onSave,
  type = "button",
}: ModuleSaveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const hasMenuItems = menuItems.length > 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!hasMenuItems) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onSave}
        className={joinClasses(
          "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
          moduleAccentClassNames.button,
          className,
        )}
      >
        <SaveIcon className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={joinClasses("relative inline-flex h-10 shrink-0", className)}
    >
      <button
        type={type}
        disabled={disabled}
        onClick={onSave}
        className={joinClasses(
          "inline-flex h-10 items-center justify-center gap-2 rounded-l-md rounded-r-none border border-r-white/20 px-4 text-sm font-semibold shadow-sm transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
          moduleAccentClassNames.button,
        )}
      >
        <SaveIcon className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={joinClasses(
          "inline-flex h-10 w-10 items-center justify-center rounded-l-none rounded-r-md border border-l-white/20 shadow-sm transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
          moduleAccentClassNames.button,
        )}
      >
        <ChevronDown
          className={joinClasses(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-30 grid w-44 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
        >
          {menuItems.map((item) => (
            <ModuleSaveButtonMenuItemView
              key={item.label}
              item={item}
              onClose={() => setIsOpen(false)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModuleSaveButtonMenuItemView({
  item,
  onClose,
}: {
  item: ModuleSaveButtonMenuItem;
  onClose: () => void;
}) {
  const ItemIcon = item.icon;

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => {
        onClose();
        item.onSelect?.();
      }}
      className={joinClasses(
        "flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-darknavy/72 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
        moduleAccentClassNames.hoverSoftBackground,
        moduleAccentClassNames.focusRing,
      )}
    >
      {ItemIcon ? (
        <ItemIcon
          className="h-4 w-4 shrink-0 text-darknavy/50"
          aria-hidden="true"
        />
      ) : null}
      {item.label}
    </button>
  );
}

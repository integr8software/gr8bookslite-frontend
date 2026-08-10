"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { CashAdvanceHref } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { CashAdvanceRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CashAdvanceRecordActions({
  onStartNew,
  record,
}: {
  onStartNew: () => void;
  record: CashAdvanceRecord;
}) {
  const items: ModuleActionMenuItem[] = [
    {
      href: `${CashAdvanceHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    {
      href: `${CashAdvanceHref}/edit/${record.id}`,
      icon: Pencil,
      label: "Edit",
      type: "link",
    },
    ...(record.status === "Pending Review"
      ? [
          {
            icon: Plus,
            label: "New",
            onSelect: onStartNew,
            type: "button",
          } satisfies ModuleActionMenuItem,
        ]
      : [
          {
            icon: Trash2,
            label: "Delete",
            onSelect: () => undefined,
            tone: "danger",
            type: "button",
          } satisfies ModuleActionMenuItem,
        ]),
  ];

  return (
    <ModuleTableActions className="!justify-center">
      <ModuleActionMenu
        items={items}
        label={`Actions for cash advance ${record.transNo}`}
      />
    </ModuleTableActions>
  );
}

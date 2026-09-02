"use client";

import { useState } from "react";
import { useSalesOrderActionPage } from "@/app/src/hooks/modules/sales/sales-order/useSalesOrderActionPage";
import { SalesOrderEntrySection } from "@/app/src/ui/modules/sales/sales-order/entries/SalesOrderEntrySection";
import { SalesOrderReportPreview } from "@/app/src/ui/modules/sales/sales-order/reports/SalesOrderReportPreview";
import { SalesOrderDetailsFields } from "@/app/src/ui/modules/sales/sales-order/action/SalesOrderDetailsFields";
import { SalesOrderActionHeader } from "@/app/src/ui/modules/sales/sales-order/action/SalesOrderActionHeader";
import { SalesOrderNotFound } from "@/app/src/ui/modules/sales/sales-order/action/SalesOrderNotFound";

export function SalesOrderActionPage() {
  const page = useSalesOrderActionPage();
  const [showPreview, setShowPreview] = useState(false);

  if (page.needsRecord && !page.existingOrder) {
    return <SalesOrderNotFound />;
  }

  return (
    <section className="grid gap-5">
      <SalesOrderActionHeader page={page} isPreviewOpen={showPreview} onTogglePreview={() => setShowPreview((current) => !current)} />
      <SalesOrderDetailsFields isReadonly={page.isReadonly} values={page.values} onUpdateField={page.updateField} />
      <SalesOrderEntrySection
        error={page.errors.items}
        isReadonly={page.isReadonly}
        rows={page.values.items}
        onRowsChange={(items) => page.updateField("items", items)}
      />
      <SalesOrderReportPreview isOpen={showPreview} onClose={() => setShowPreview(false)} record={page.previewRecord} />
    </section>
  );
}

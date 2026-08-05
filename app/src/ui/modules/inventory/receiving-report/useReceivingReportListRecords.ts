"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  getInitialReceivingReports,
  writeStoredReceivingReports,
  type ReceivingReportRecord,
  type ReceivingReportStatus,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";

export function useReceivingReportListRecords() {
  const [records, setRecords] = useState(getInitialReceivingReports);

  function updateReceivingReportStatus(
    record: ReceivingReportRecord,
    status: ReceivingReportStatus,
  ) {
    try {
      setRecords((currentRecords) => {
        const nextRecords = currentRecords.map((currentRecord) => {
          if (currentRecord.id !== record.id) {
            return currentRecord;
          }

          return {
            ...currentRecord,
            formValues: currentRecord.formValues
              ? {
                  ...currentRecord.formValues,
                  status,
                }
              : currentRecord.formValues,
            status,
          };
        });

        writeStoredReceivingReports(nextRecords);
        return nextRecords;
      });
      toast.success("Receiving report status updated.");
    } catch {
      toast.error("Unable to update receiving report status.");
    }
  }

  return {
    records,
    updateReceivingReportStatus,
  };
}

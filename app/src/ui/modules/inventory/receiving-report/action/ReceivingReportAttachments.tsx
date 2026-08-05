import type { ChangeEvent } from "react";
import { Paperclip, Upload, X } from "lucide-react";
import type { ReceivingReportAttachment } from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { formatReceivingReportAttachmentSize } from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportUtils";

export function ReceivingReportAttachments({
  attachments,
  isReadonly,
  onAddAttachments,
  onRemoveAttachment,
}: {
  attachments: ReceivingReportAttachment[];
  isReadonly: boolean;
  onAddAttachments: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}) {
  return (
    <section className="grid gap-3 rounded-sm border border-darknavy/10 bg-white p-3 shadow-sm shadow-darknavy/5">
      {!isReadonly ? (
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-darknavy/20 bg-offwhite/50 px-4 py-6 text-center transition hover:border-skyblue/45 hover:bg-skyblue/5">
          <Upload className="h-5 w-5 text-skyblue" aria-hidden="true" />
          <span className="text-sm font-semibold text-darknavy">Upload attachment</span>
          <span className="text-xs font-medium text-darknavy/55">
            Select files related to this receiving report.
          </span>
          <input className="sr-only" type="file" multiple onChange={onAddAttachments} />
        </label>
      ) : null}
      <div className="grid gap-5">
        {attachments.length > 0 ? (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-darknavy/55" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-darknavy">{attachment.name}</p>
                  <p className="text-xs font-medium text-darknavy/50">
                    {formatReceivingReportAttachmentSize(attachment.size)}
                  </p>
                </div>
              </div>
              {!isReadonly ? (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-coralpink/10 hover:text-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25"
                  onClick={() => onRemoveAttachment(attachment.id)}
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-darknavy/10 bg-offwhite/45 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-darknavy">No attachments yet</p>
          </div>
        )}
      </div>
    </section>
  );
}

import type { ChangeEvent } from "react";
import { Download, FileText, Paperclip, Upload, X } from "lucide-react";
import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type DisbursementVoucherFileAttachmentFieldsProps = {
  attachments: DisbursementAttachment[];
  isReadonly: boolean;
  inputName?: string;
  uploadTitle?: string;
  onAttachmentsChange: (attachments: DisbursementAttachment[]) => void;
};

export function DisbursementVoucherFileAttachmentFields({
  attachments,
  inputName = "disbursementVoucherAttachments",
  isReadonly,
  uploadTitle = "Attach Disbursement Voucher Files",
  onAttachmentsChange,
}: DisbursementVoucherFileAttachmentFieldsProps) {
  const inputId = "disbursement-voucher-file-attachments";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) {
      return;
    }

    const nextAttachments = await Promise.all(
      files.map(async (file) => ({
        dataUrl: await readFileAsDataUrl(file),
        id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        lastModified: file.lastModified,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    );

    onAttachmentsChange([...attachments, ...nextAttachments]);
    input.value = "";
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter((attachment) => attachment.id !== attachmentId));
  };

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="space-y-4">
        <label
          htmlFor={inputId}
          className={[
            "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-darknavy/20 bg-offwhite/35 p-5 text-center transition",
            isReadonly ? "cursor-not-allowed opacity-60" : "hover:border-skyblue/55 hover:bg-skyblue/5",
          ].join(" ")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-skyblue/10 text-skyblue">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-darknavy">{uploadTitle}</span>
          <span className="text-xs text-darknavy/55">Choose one or more supporting documents.</span>
          <input
            id={inputId}
            name={inputName}
            type="file"
            multiple
            disabled={isReadonly}
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        <div className="rounded-lg border border-darknavy/10">
          <div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3 text-sm font-semibold text-darknavy">
            <Paperclip className="h-4 w-4 text-skyblue" aria-hidden="true" />
            Attachments
            <span className="rounded-full border border-darknavy/10 px-2 py-0.5 text-xs font-medium text-darknavy/60">
              {attachments.length}
            </span>
          </div>

          {attachments.length > 0 ? (
            <ul className="divide-y divide-darknavy/10">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-offwhite text-darknavy/70">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-darknavy">{attachment.name}</p>
                      <p className="text-xs text-darknavy/55">
                        {formatAttachmentSizeLabel(attachment)}
                        {attachment.type ? ` - ${attachment.type}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {attachment.dataUrl ? (
                      <a
                        href={attachment.dataUrl}
                        download={attachment.name}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 text-darknavy/70 transition hover:bg-offwhite"
                        aria-label={`Download ${attachment.name}`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null}

                    {!isReadonly ? (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        aria-label={`Remove ${attachment.name}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-sm text-darknavy/55">No files attached yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function formatAttachmentSizeLabel(attachment: DisbursementAttachment) {
  if (attachment.sizeLabel) {
    return attachment.sizeLabel;
  }

  const size = attachment.size ?? 0;

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

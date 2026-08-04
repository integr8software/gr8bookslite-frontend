"use client";

import { useMemo, useState } from "react";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";

type DeliveryVehicleModuleImportDialogProps = {
  config: DeliveryVehicleModuleConfig;
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (rows: Array<Record<string, string>>) => void;
};

export function DeliveryVehicleModuleImportDialog({
  config,
  isOpen,
  onClose,
  onImportRecords,
}: DeliveryVehicleModuleImportDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const templateHeaders = useMemo(() => config.fields.map((field) => field.label), [config.fields]);
  const parsedRows = useMemo(() => parseImportRows(text, config), [config, text]);

  function handleImport() {
    if (parsedRows.length === 0) {
      setError("Paste at least one row with headers before importing.");
      return;
    }

    onImportRecords(parsedRows);
    setText("");
    setError(null);
    onClose();
  }

  return (
    <ModuleImportDialog
      isOpen={isOpen}
      title={`Import ${config.title}`}
      titleId={`delivery-vehicle-${config.key}-import-title`}
      description="Paste copied spreadsheet rows using the configured field headers."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-darknavy/50">
            {parsedRows.length} row{parsedRows.length === 1 ? "" : "s"} ready
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
            >
              Import
            </button>
          </div>
        </div>
      }
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 p-2">
        <div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-3 text-xs text-darknavy/60">
          <span className="font-bold text-darknavy">Template headers:</span>{" "}
          {templateHeaders.join(", ")}
        </div>
        <label className="grid min-h-0 gap-2">
          <span className="text-sm font-semibold text-darknavy">Paste rows</span>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            placeholder={`${templateHeaders.join("\t")}\n${config.fields.map((field) => field.defaultValue || field.label).join("\t")}`}
            className="min-h-0 flex-1 resize-none rounded-lg border border-darknavy/12 bg-white px-3 py-3 font-mono text-xs text-darknavy outline-none transition placeholder:text-darknavy/30 focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
          />
        </label>
        {error ? <p className="text-xs font-semibold text-coralpink">{error}</p> : null}
      </div>
    </ModuleImportDialog>
  );
}

function parseImportRows(text: string, config: DeliveryVehicleModuleConfig) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitImportLine(lines[0], delimiter).map(normalizeHeader);
  const fieldByHeader = new Map(
    config.fields.flatMap((field) => [
      [normalizeHeader(field.label), field.key],
      [normalizeHeader(field.key), field.key],
    ]),
  );

  return lines.slice(1).flatMap((line) => {
    const cells = splitImportLine(line, delimiter);
    const values: Record<string, string> = {};

    headers.forEach((header, index) => {
      const fieldKey = fieldByHeader.get(header);

      if (fieldKey) {
        values[fieldKey] = cells[index]?.trim() ?? "";
      }
    });

    return Object.values(values).some(Boolean) ? [values] : [];
  });
}

function splitImportLine(line: string, delimiter: string) {
  return line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, ""));
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

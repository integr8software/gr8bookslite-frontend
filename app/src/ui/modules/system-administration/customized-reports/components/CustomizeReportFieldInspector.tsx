import { AlignButton, FieldNumberControl, TextControl } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFormControls";
import { CustomizeReportElementActionPanel as ElementActionPanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportElementActionPanel";
import {
  DefaultFieldColor,
  DefaultFontFamily,
  FontFamilyOptions,
  InspectorNumberInputClassName,
  MinFieldHeight,
  ToolbarButtonClassName,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  CustomizeReportField,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import {
  clamp,
  getFieldPreviewValue,
} from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";
export function CustomizeReportFieldInspector({
  field,
  onDelete,
  onDuplicate,
  onLayer,
  onToggleLock,
  onUpdate,
  pageSetup,
  reportData,
}: {
  field: CustomizeReportField;
  onDelete: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
  onUpdate: (updater: (field: CustomizeReportField) => CustomizeReportField) => void;
  pageSetup: CustomizeReportPageSetup;
  reportData: Record<string, unknown>;
}) {
  const editableTextValue = field.value ?? getFieldPreviewValue(field, reportData);

  return (
    <>
      <ElementActionPanel
        isLocked={Boolean(field.locked)}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onLayer={onLayer}
        onToggleLock={onToggleLock}
      />

      <div className="grid grid-cols-2 gap-3">
        <FieldNumberControl
          label="X"
          value={field.x}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              x: clamp(value, 0, pageSetup.width - currentField.width),
            }))
          }
        />
        <FieldNumberControl
          label="Y"
          value={field.y}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              y: clamp(value, 0, pageSetup.height - currentField.height),
            }))
          }
        />
        <FieldNumberControl
          label="Width"
          value={field.width}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              width: clamp(value, 40, pageSetup.width - currentField.x),
            }))
          }
        />
        <FieldNumberControl
          label="Height"
          value={field.height}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              height: clamp(value, MinFieldHeight, pageSetup.height - currentField.y),
            }))
          }
        />
        {field.type !== "image" ? (
          <FieldNumberControl
            label="Font"
            value={field.fontSize}
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                fontSize: clamp(value, 8, 36),
              }))
            }
          />
        ) : null}
      </div>

      {field.type !== "image" ? (
        <div className="mt-4 space-y-3">
          <TextControl
            label="Label"
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                label: value || currentField.label,
              }))
            }
            value={field.label}
          />
          <TextControl
            multiline
            label="Text"
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                value,
              }))
            }
            value={editableTextValue}
          />
        </div>
      ) : null}

      {field.type !== "image" ? (
        <div className="mt-4 space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Font Family</span>
            <select
              className={InspectorNumberInputClassName}
              onChange={(event) =>
                onUpdate((currentField) => ({
                  ...currentField,
                  fontFamily: event.target.value,
                }))
              }
              value={field.fontFamily || DefaultFontFamily}
            >
              {FontFamilyOptions.map((fontFamily) => (
                <option key={fontFamily} value={fontFamily}>
                  {fontFamily.split(",")[0]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Text Color</span>
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              onChange={(event) =>
                onUpdate((currentField) => ({
                  ...currentField,
                  color: event.target.value,
                }))
              }
              type="color"
              value={field.color || DefaultFieldColor}
            />
          </label>
        </div>
      ) : null}

      {field.type !== "image" ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Alignment</p>
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
            <AlignButton
              align="left"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "left",
                }))
              }
            />
            <AlignButton
              align="center"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "center",
                }))
              }
            />
            <AlignButton
              align="right"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "right",
                }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {field.type !== "image" ? (
          <>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.bold ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  bold: !currentField.bold,
                }))
              }
            >
              Bold
            </button>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.italic ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  italic: !currentField.italic,
                }))
              }
            >
              Italic
            </button>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.underline ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  underline: !currentField.underline,
                }))
              }
            >
              Underline
            </button>
          </>
        ) : null}
        <button
          className={`${ToolbarButtonClassName} justify-center`}
          onClick={() =>
            onUpdate((currentField) => ({
              ...currentField,
              visible: !currentField.visible,
            }))
          }
        >
          {field.visible ? "Hide" : "Show"}
        </button>
      </div>
    </>
  );
}


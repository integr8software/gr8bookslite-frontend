import type {
  CustomizeReportField,
  CustomizeReportLine,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

type ValidateCustomizeReportLayoutParams = {
  fields: CustomizeReportField[];
  lines: CustomizeReportLine[];
  pageSetup: CustomizeReportPageSetup;
};

export function validateCustomizeReportLayout({
  fields,
  lines,
  pageSetup,
}: ValidateCustomizeReportLayoutParams) {
  if (fields.length === 0) {
    return "Add at least one report field.";
  }

  const hasOutOfBoundsField = fields.some(
    (field) =>
      field.x < 0 ||
      field.y < 0 ||
      field.x + field.width > pageSetup.width ||
      field.y + field.height > pageSetup.height,
  );

  if (hasOutOfBoundsField) {
    return "Keep all fields inside the report page.";
  }

  const hasOutOfBoundsLine = lines.some((line) => {
    const width = line.orientation === "horizontal" ? line.length : line.thickness;
    const height = line.orientation === "horizontal" ? line.thickness : line.length;

    return (
      line.x < 0 ||
      line.y < 0 ||
      line.x + width > pageSetup.width ||
      line.y + height > pageSetup.height
    );
  });

  if (hasOutOfBoundsLine) {
    return "Keep all lines inside the report page.";
  }

  return null;
}

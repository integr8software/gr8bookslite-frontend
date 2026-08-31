"use client";

export function hasModuleDraftChanges<TValues extends object>(
  values: TValues,
  initialValues: TValues,
  ignoredFields: readonly (keyof TValues)[],
) {
  return (
    JSON.stringify(omitModuleDraftFields(values, ignoredFields)) !== JSON.stringify(omitModuleDraftFields(initialValues, ignoredFields))
  );
}

function omitModuleDraftFields<TValues extends object>(values: TValues, fields: readonly (keyof TValues)[]) {
  const nextValues = { ...values } as Partial<TValues>;

  fields.forEach((field) => {
    delete nextValues[field];
  });

  return nextValues;
}

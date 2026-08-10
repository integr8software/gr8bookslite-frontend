import type { ReactNode } from "react";

export function FieldShell({
  children,
  compact = false,
  controlId,
  error,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  compact?: boolean;
  controlId?: string;
  error?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  if (compact) {
    return (
      <div className="grid min-w-0 gap-2">
        {controlId ? (
          <label htmlFor={controlId} className="text-sm font-semibold text-darknavy">
            {labelContent}
          </label>
        ) : (
          <span className="text-sm font-semibold text-darknavy">{labelContent}</span>
        )}
        {children}
        {error ? <span className="text-xs font-medium text-coralpink">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">
        {children}
        {error ? <span className="mt-1.5 block text-xs font-semibold text-coralpink">{error}</span> : null}
      </div>
    </div>
  );
}

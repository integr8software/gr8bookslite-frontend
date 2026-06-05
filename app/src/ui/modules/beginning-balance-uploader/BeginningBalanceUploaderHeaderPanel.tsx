import { BeginningBalanceUploaderPageCopy } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";

type BeginningBalanceUploaderHeaderPanelProps = {
  date: string;
  remarks: string;
  onDateChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
};

export function BeginningBalanceUploaderHeaderPanel({
  date,
  remarks,
  onDateChange,
  onRemarksChange,
}: BeginningBalanceUploaderHeaderPanelProps) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-darknavy">
        {BeginningBalanceUploaderPageCopy.headerTitle}
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-[1.5fr_0.75fr]">
        <label className="block">
          <span className="text-sm font-medium text-darknavy/55">Remarks</span>
          <textarea
            value={remarks}
            onChange={(event) => onRemarksChange(event.target.value)}
            className="mt-1 block h-24 w-full resize-none rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/30 focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
            placeholder="Enter remarks"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-darknavy/55">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 block h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
          />
        </label>
      </div>
    </section>
  );
}

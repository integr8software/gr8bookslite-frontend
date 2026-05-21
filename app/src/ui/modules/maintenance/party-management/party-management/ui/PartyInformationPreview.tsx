import {
	PartyInformationSampleState,
	createPartySubmitPayload,
} from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import type { PartyInformationFormValues } from "@/app/src/types/modules/party-management/PartyManagementTypes";

export function PartyInformationPreview({
	submitPayload,
	values,
}: {
	submitPayload: ReturnType<typeof createPartySubmitPayload>;
	values: PartyInformationFormValues;
}) {
	return (
		<section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm lg:grid-cols-2">
			<PreviewBlock title="Sample State Structure">
				{JSON.stringify(
					values.classification ? values : PartyInformationSampleState,
					null,
					2,
				)}
			</PreviewBlock>
			<PreviewBlock title="Example Submit Payload">
				{JSON.stringify(submitPayload, null, 2)}
			</PreviewBlock>
		</section>
	);
}

function PreviewBlock({
	children,
	title,
}: {
	children: string;
	title: string;
}) {
	return (
		<div className="min-w-0 rounded-md bg-darknavy p-4 text-white">
			<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
				{title}
			</p>
			<pre className="mt-3 max-h-72 overflow-auto text-xs leading-5 text-white/82">
				{children}
			</pre>
		</div>
	);
}

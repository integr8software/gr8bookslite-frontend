import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import { formatCanvassFormDate } from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type CanvassFormRecordActionsProps = {
	form: CanvassFormRecord;
	onDeleteForm: (form: CanvassFormRecord) => void;
};

export function CanvassFormRecordActions({
	form,
	onDeleteForm,
}: CanvassFormRecordActionsProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4 font-semibold">{form.transNo}</td>
			<td className="px-4 py-4">{formatCanvassFormDate(form.documentDate)}</td>
			<td className="px-4 py-4">{form.requestedBy}</td>
			<td className="px-4 py-4">{form.purchaseType}</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{form.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<ModuleTableActions>
					<ModuleTableActionLink
						variant="view"
						href={`${CanvassFormHref}/view/${form.id}`}
						label={`View canvass form ${form.transNo}`}
					/>
					<ModuleTableActionLink
						variant="edit"
						href={`${CanvassFormHref}/edit/${form.id}`}
						label={`Edit canvass form ${form.transNo}`}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteForm(form)}
						label={`Delete canvass form ${form.transNo}`}
					/>
				</ModuleTableActions>
			</td>
		</tr>
	);
}

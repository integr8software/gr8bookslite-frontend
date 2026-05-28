import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	WorkspaceCompanyRecord,
	WorkspaceCompanyFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	MapWorkspaceCompanyApiRecord,
	MapWorkspaceCompanyFormToCreateRequest,
} from "./WorkspaceCompanyApiMappers";
import type {
	CreateWorkspaceCompanyApiRequest,
	WorkspaceCompanyApiRecord,
} from "./WorkspaceCompanyApiTypes";

function GetAuthorizationHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function GetWorkspaceCompanies(accessToken: string) {
  const response = await ApiClient.get<WorkspaceCompanyApiRecord[]>(
    "/workspace/companies",
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

	return response.data.map(MapWorkspaceCompanyApiRecord);
}

export async function CreateWorkspaceCompany(
	accessToken: string,
	values: WorkspaceCompanyFormValues,
): Promise<WorkspaceCompanyRecord> {
	const company = await CreateWorkspaceCompanyFromRequest(
		accessToken,
		MapWorkspaceCompanyFormToCreateRequest(values),
	);

	if (!values.logoFile) {
		return company;
	}

	return UploadWorkspaceCompanyLogo(accessToken, company.id, values.logoFile);
}

export async function CreateWorkspaceCompanyFromRequest(
	accessToken: string,
	payload: CreateWorkspaceCompanyApiRequest,
): Promise<WorkspaceCompanyRecord> {
	const response = await ApiClient.post<WorkspaceCompanyApiRecord>(
		"/workspace/companies",
		payload,
		{
			headers: GetAuthorizationHeaders(accessToken),
		},
	);

	return MapWorkspaceCompanyApiRecord(response.data);
}

export async function UploadWorkspaceCompanyLogo(
	accessToken: string,
	companyId: string,
	file: File,
): Promise<WorkspaceCompanyRecord> {
	const formData = new FormData();
	formData.append("logo", file);

	const response = await ApiClient.post<{
		message: string;
		company: WorkspaceCompanyApiRecord;
	}>(`/workspace/companies/${companyId}/logo`, formData, {
		headers: {
			...GetAuthorizationHeaders(accessToken),
			"Content-Type": "multipart/form-data",
		},
	});

	return MapWorkspaceCompanyApiRecord(response.data.company);
}

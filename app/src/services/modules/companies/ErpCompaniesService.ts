import {
  erpCompanyActivity,
  getCompanyBySlug,
} from "@/app/src/data/modules/companies/ErpCompaniesData";

export function getCompanyProfileData(companySlug: string) {
  return {
    company: getCompanyBySlug(companySlug),
    activity: erpCompanyActivity,
  };
}

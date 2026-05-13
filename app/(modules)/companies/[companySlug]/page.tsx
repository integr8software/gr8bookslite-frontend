import { CompanyProfilePage } from "@/app/src/ui/modules/companies/CompanyProfilePage";

export default async function CompanyProfileRoutePage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;

  return <CompanyProfilePage companySlug={companySlug} />;
}

import { redirect } from "next/navigation";
import { ProfileHref } from "@/app/src/constants/shared/account/AccountConstants";

export default function Page() {
  redirect(ProfileHref);
}

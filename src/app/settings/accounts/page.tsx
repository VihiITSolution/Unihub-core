import { redirect } from "next/navigation";

export default function AccountSettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=accounts");
}

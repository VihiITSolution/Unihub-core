import { redirect } from "next/navigation";

export default function SecuritySettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=password");
}

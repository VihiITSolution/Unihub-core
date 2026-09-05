import { redirect } from "next/navigation";

export default function PrivacySettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=privacy");
}

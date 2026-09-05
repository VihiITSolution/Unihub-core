import { redirect } from "next/navigation";

export default function ProfileSettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=profile");
}

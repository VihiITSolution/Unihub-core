import { redirect } from "next/navigation";

export default function SettingsIndex() {
  redirect("/student/dashboard?section=settings&setting=profile");
}

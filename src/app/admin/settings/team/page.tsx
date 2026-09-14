import { redirect } from "next/navigation";

export default function AdminTeamPageRemoved() {
  redirect("/admin/settings");
}

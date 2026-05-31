import { redirect } from "next/navigation";

export default function AdminAuthPage() {
  redirect("/login?role=officer");
}
import { redirect } from "next/navigation";

export default function VendorAuthPage() {
  redirect("/login?role=vendor");
}
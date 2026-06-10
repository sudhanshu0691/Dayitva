import { redirect } from "next/navigation";

export default function VendorAuthPage() {
  redirect("/login/vendor");
}
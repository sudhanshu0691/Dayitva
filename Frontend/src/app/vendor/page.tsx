"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";

export default function VendorPage() {
  const router = useRouter();
  const { currentUser, hydrated } = useApp();

  useEffect(() => {
    if (hydrated) {
      if (currentUser?.role === "vendor") {
        router.replace("/vendor/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [hydrated, currentUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
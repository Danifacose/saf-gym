"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
    } else if (user.ruolo === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent-lime)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

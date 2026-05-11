"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
      <p>Redirecionando...</p>
    </main>
  );
}
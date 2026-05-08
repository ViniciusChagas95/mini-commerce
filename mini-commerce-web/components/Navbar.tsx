"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-700 ring-1 ring-blue-400/20">
            M
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-600/80">MiniCommerce</p>
            <h1 className="text-lg font-semibold text-black">Painel</h1>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-200"
          >
            Produtos
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-200"
          >
            Pedidos
          </Link>
          <Link
            href="/categories"
            className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-200"
          >
            Categorias
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

type Product = {
  id: number;
};

type Order = {
  id: number;
  status: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, ordersResponse] = await Promise.all([
          api.get<Product[]>("/Products"),
          api.get<Order[]>("/Orders"),
        ]);

        const orders = ordersResponse.data;

        setTotalProducts(productsResponse.data.length);
        setTotalOrders(orders.length);
        setPendingOrders(orders.filter((order) => order.status === 1).length);
      } catch (error: unknown) {
        console.error(error);

        let message = "Erro ao carregar dashboard.";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            message = "Sessão expirada. Faça login novamente.";
            localStorage.removeItem("token");
            router.push("/login");
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchDashboardData();
  }, [router]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Painel</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Visão geral do comércio</h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Acompanhe seus produtos, pedidos e categorias em tempo real com controles rápidos para acessar cada área.
            </p>
          </section>

          {loading && <p className="text-slate-300">Carregando dados...</p>}

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Produtos</p>
                  <p className="mt-6 text-5xl font-semibold text-white">{totalProducts}</p>
                  <p className="mt-3 text-sm text-slate-400">Total de produtos cadastrados no catálogo.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Pedidos</p>
                  <p className="mt-6 text-5xl font-semibold text-white">{totalOrders}</p>
                  <p className="mt-3 text-sm text-slate-400">Pedidos realizados até o momento.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Pendentes</p>
                  <p className="mt-6 text-5xl font-semibold text-white">{pendingOrders}</p>
                  <p className="mt-3 text-sm text-slate-400">Pedidos aguardando processamento.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Link href="/products" className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-lg transition hover:bg-slate-800">
                  <p className="font-semibold text-white">Produtos</p>
                  <p className="mt-3 text-sm text-slate-400">Gerencie o catálogo e os detalhes de cada item.</p>
                </Link>
                <Link href="/orders" className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-lg transition hover:bg-slate-800">
                  <p className="font-semibold text-white">Pedidos</p>
                  <p className="mt-3 text-sm text-slate-400">Veja e atualize o status dos pedidos feitos.</p>
                </Link>
                <Link href="/products/new" className="rounded-3xl border border-white/10 bg-cyan-500/10 p-8 shadow-lg transition hover:bg-cyan-500/15">
                  <p className="font-semibold text-cyan-200">Criar produto</p>
                  <p className="mt-3 text-sm text-slate-400">Adicione novos produtos ao seu catálogo.</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

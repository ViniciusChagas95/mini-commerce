"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: number;
  items: OrderItem[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function CanceledOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCanceledOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Order[]>("/Orders/canceled");
      setOrders(response.data);
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao carregar pedidos cancelados.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Sessão expirada. Faça login novamente.";
          localStorage.removeItem("token");
          router.push("/login");
        }

        if (error.response?.status === 403) {
          message = "Você não tem permissão para acessar este recurso.";
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    void Promise.resolve().then(loadCanceledOrders);
  }, [loadCanceledOrders, router]);

  const totalCanceled = useMemo(
    () =>
      orders.reduce((total, order) => {
        return total + order.totalAmount;
      }, 0),
    [orders]
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-300/75">
                  Pedidos cancelados
                </p>
                <h1 className="mt-2 text-4xl font-semibold text-white">
                  Histórico de cancelamentos
                </h1>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Consulte os pedidos removidos do fluxo ativo e acompanhe o
                  valor total impactado pelos cancelamentos.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Pedidos ativos
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Dashboard
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">
                  Pedidos cancelados
                </p>
                <p className="mt-2 text-3xl font-semibold text-red-100">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Total cancelado</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {currencyFormatter.format(totalCanceled)}
                </p>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-lg">
              <p className="text-slate-300">
                Carregando pedidos cancelados...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Nenhum pedido cancelado encontrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-red-500/15 bg-slate-900/90 p-6 shadow-lg transition hover:border-red-400/30 hover:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        Pedido #{order.id}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 ring-1 ring-red-500/20">
                      Cancelado
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.productId}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      >
                        <p className="text-sm font-semibold text-white">
                          {item.productName}
                        </p>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                          <span>Quantidade: {item.quantity}</span>
                          <span>
                            Unitário: {currencyFormatter.format(item.unitPrice)}
                          </span>
                          <span>
                            Subtotal: {currencyFormatter.format(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-lg font-semibold text-white">
                    Total: {currencyFormatter.format(order.totalAmount)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

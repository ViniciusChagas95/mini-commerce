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

function getStatusLabel(status: number) {
  switch (status) {
    case 1:
      return "Pendente";
    case 2:
      return "Pago";
    case 3:
      return "Cancelado";
    default:
      return "Desconhecido";
  }
}

function getStatusClass(status: number) {
  switch (status) {
    case 1:
      return "bg-yellow-500/10 text-yellow-100 ring-yellow-500/20";
    case 2:
      return "bg-cyan-500/10 text-cyan-200 ring-cyan-400/20";
    case 3:
      return "bg-red-500/10 text-red-100 ring-red-500/20";
    default:
      return "bg-white/10 text-slate-200 ring-white/10";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Order[]>("/Orders/active");
      setOrders(response.data);
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao carregar pedidos.";

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

    void Promise.resolve().then(loadOrders);
  }, [loadOrders, router]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === 1).length,
      paid: orders.filter((order) => order.status === 2).length,
    }),
    [orders]
  );

  async function handleCancel(orderId: number) {
    const confirmed = confirm("Tem certeza que deseja cancelar este pedido?");

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(`/Orders/${orderId}/cancel`);
      alert("Pedido cancelado com sucesso!");
      await loadOrders();
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao cancelar pedido.";

      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          message = error.response.data;
        }
      }

      alert(message);
    }
  }
  async function handlePay(orderId: number) {
  const confirmed = confirm("Confirmar pagamento deste pedido?");

  if (!confirmed) {
    return;
  }

  try {
    await api.patch(`/Orders/${orderId}/pay`);

    alert("Pedido marcado como pago!");
    await loadOrders();
  } catch (error: unknown) {
    console.error(error);

    let message = "Erro ao marcar pedido como pago.";

    if (axios.isAxiosError(error)) {
      if (typeof error.response?.data === "string") {
        message = error.response.data;
      }

      if (error.response?.status === 401) {
        message = "Sessão expirada. Faça login novamente.";
        localStorage.removeItem("token");
        router.push("/login");
      }

      if (error.response?.status === 403) {
        message = "Você não tem permissão para executar esta ação.";
      }
    }

    alert(message);
  }
}
  

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">
                  Pedidos
                </p>
                <h1 className="mt-2 text-4xl font-semibold text-white">
                  Lista de pedidos
                </h1>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Acompanhe pedidos ativos, revise itens vendidos e cancele
                  vendas quando necessário.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Produtos
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/orders/canceled")}
                  className="rounded-full bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 ring-1 ring-red-500/20 transition hover:bg-red-500/15"
                >
                  Cancelados
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Pedidos ativos</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {summary.total}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Pendentes</p>
                <p className="mt-2 text-3xl font-semibold text-yellow-100">
                  {summary.pending}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Pagos</p>
                <p className="mt-2 text-3xl font-semibold text-cyan-200">
                  {summary.paid}
                </p>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-lg">
              <p className="text-slate-300">Carregando pedidos...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Nenhum pedido ativo encontrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg transition hover:border-cyan-500/30 hover:bg-slate-900"
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

                    <span
                      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
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

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-semibold text-white">
                      Total: {currencyFormatter.format(order.totalAmount)}
                    </p>
                  {order.status === 1 && (
                    <button
                      onClick={() => handlePay(order.id)}
                      className="mt-3 mr-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                    >
                      Marcar como pago
                    </button>
                  )}
                  {order.status === 1 && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      Cancelar pedido
                    </button>
                  )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

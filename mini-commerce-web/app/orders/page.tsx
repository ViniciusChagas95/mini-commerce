"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

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

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Order[]>("/Orders");
      setOrders(response.data);
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao carregar pedidos.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Sessão expirada. Faça login novamente.";
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadInitialOrders() {
      await loadOrders();
    }

    void loadInitialOrders();
  }, [router]);

  async function handleCancel(orderId: number) {
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

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Pedidos</p>
                <h1 className="mt-2 text-4xl font-semibold text-white">Lista de pedidos</h1>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Gerencie os pedidos recebidos, cancele vendas e veja o histórico de compras.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Produtos
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Sair
                </button>
              </div>
            </div>
          </section>

          {loading ? (
            <p className="text-slate-300">Carregando pedidos...</p>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg transition hover:border-cyan-500/30 hover:bg-slate-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Pedido #{order.id}</h2>
                      <p className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <p className="text-sm font-semibold text-white">{item.productName}</p>
                        <div className="mt-2 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                          <span>Quantidade: {item.quantity}</span>
                          <span>Unitário: R$ {item.unitPrice.toFixed(2)}</span>
                          <span>Subtotal: R$ {item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-semibold text-white">Total: R$ {order.totalAmount.toFixed(2)}</p>
                    {order.status !== 3 && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                      >
                        Cancelar pedido
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

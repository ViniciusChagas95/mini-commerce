"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
  isActive: boolean;
};

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Product[]>("/Products");
      setProducts(response.data);
    } catch (error: unknown) {
      console.error(error);
      setError("Erro ao carregar produtos. Faça login novamente.");
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

    async function loadInitialProducts() {
      await loadProducts();
    }

    void loadInitialProducts();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function handleBuy(productId: number) {
    try {
      await api.post("/Orders", {
        items: [
          {
            productId,
            quantity: 1,
          },
        ],
      });

      alert("Pedido criado com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao criar pedido.";

      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          message = error.response.data;
        } else if (error.response?.data?.title) {
          message = error.response.data.title;
        }
      }

      alert(message);
    }
  }

  async function handleDelete(productId: number) {
    const confirmed = confirm("Tem certeza que deseja excluir este produto?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/Products/${productId}`);
      alert("Produto excluído com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao excluir produto.";

      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          message = error.response.data;
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Produtos</p>
                <h1 className="mt-2 text-4xl font-semibold text-white">Catálogo</h1>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Encontre produtos disponíveis, edite detalhes e gere pedidos com facilidade.
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
                  onClick={() => router.push("/products/new")}
                  className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Novo produto
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

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-lg">
              <p className="text-slate-300">Carregando produtos...</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Nenhum produto encontrado.
            </div>
          )}

          <div className="grid gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-lg transition hover:border-cyan-500/30 hover:bg-slate-900"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-white">{product.name}</h2>
                    <p className="text-slate-400">{product.description}</p>
                    <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                      <span>Categoria: {product.categoryName}</span>
                      <span>Estoque: {product.stockQuantity}</span>
                      <span>Status: {product.isActive ? "Ativo" : "Inativo"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 text-right">
                    <p className="text-2xl font-semibold text-white">R$ {product.price.toFixed(2)}</p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive
                          ? "bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20"
                          : "bg-yellow-500/10 text-yellow-100 ring-1 ring-yellow-500/20"
                      }`}
                    >
                      {product.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => handleBuy(product.id)}
                    disabled={product.stockQuantity <= 0 || !product.isActive}
                    className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    {product.stockQuantity <= 0 || !product.isActive ? "Indisponível" : "Comprar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

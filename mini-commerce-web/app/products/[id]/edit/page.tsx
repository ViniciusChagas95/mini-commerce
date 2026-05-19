"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { useAdmin } from "@/lib/useAdmin";

type Category = {
  id: number;
  name: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const admin = useAdmin();

  const productId = Number(params.id);

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [categoryId, setCategoryId] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!admin) {
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        const [productResponse, categoriesResponse] = await Promise.all([
          api.get(`/Products/${productId}`),
          api.get<Category[]>("/Categories"),
        ]);

        const product = productResponse.data;

        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStockQuantity(product.stockQuantity);
        setCategoryId(product.categoryId);

        setCategories(categoriesResponse.data);
      } catch (error: unknown) {
        console.error(error);

        let message = "Erro ao carregar produto.";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            message = "Sessão expirada.";
            localStorage.removeItem("token");
            router.push("/login");
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [admin, productId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await api.put(`/Products/${productId}`, {
        id: productId,
        name,
        description,
        price,
        stockQuantity,
        categoryId,
      });

      alert("Produto atualizado com sucesso!");
      router.push("/products");
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao atualizar produto.";

      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          message = error.response.data;
        }
      }

      setError(message);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            {!admin ? (
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-300/80">
                  Acesso restrito
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Você não pode editar produtos
                </h1>
                <p className="mt-2 text-slate-400">
                  Apenas administradores podem alterar produtos. Entre com uma conta de administrador para acessar esta função.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  Voltar para produtos
                </button>
              </div>
            ) : (
              <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Produtos</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Editar produto</h1>
              </div>
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
              >
                ← Voltar
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-300">
                Carregando dados do produto...
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Nome do produto</label>
                    <input
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Descrição</label>
                    <textarea
                      className="w-full resize-none rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Descrição"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Preço</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Preço"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Estoque</label>
                      <input
                        type="number"
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Estoque"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Categoria</label>
                    <select
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="w-full rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                    Salvar alterações
                  </button>
                </form>
              </>
            )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

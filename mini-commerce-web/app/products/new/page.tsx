"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

type Category = {
  id: number;
  name: string;
};

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadCategories() {
      try {
        const response = await api.get<Category[]>("/Categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setError("Erro ao carregar categorias. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("O nome do produto é obrigatório.");
      return;
    }

    if (!description.trim()) {
      setError("A descrição do produto é obrigatória.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("O preço deve ser um valor positivo.");
      return;
    }

    const stockNum = parseInt(stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("A quantidade em estoque deve ser um número válido.");
      return;
    }

    if (!categoryId) {
      setError("Selecione uma categoria para o produto.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/Products", {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        stockQuantity: stockNum,
        categoryId: parseInt(categoryId, 10),
      });

      alert("Produto criado com sucesso!");
      router.push("/products");
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao criar produto.";
      if (axios.isAxiosError(error)) {
        if (typeof error.response?.data === "string") {
          message = error.response.data;
        }
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Produtos</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Novo produto</h1>
              </div>
              <button
                onClick={() => router.push("/products")}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
              >
                Voltar
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Nome do produto *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Ex: Smartphone Samsung Galaxy"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Descrição *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Descreva as características principais do produto..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Quantidade em estoque *</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Categoria *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                >
                  <option value="" disabled>
                    {loading ? "Carregando categorias..." : "Selecione uma categoria"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {submitting ? "Criando..." : "Criar produto"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

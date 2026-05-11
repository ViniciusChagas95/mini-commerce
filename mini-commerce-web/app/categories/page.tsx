"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

export default function CategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Category[]>("/Categories");
      setCategories(response.data);
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao carregar categorias.";

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
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchInitialCategories() {
      await loadCategories();
    }

    void fetchInitialCategories();
  }, [loadCategories, router]);

  async function handleDelete(categoryId: number) {
  const confirmed = confirm("Tem certeza que deseja excluir esta categoria?");

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/Categories/${categoryId}`);

    alert("Categoria excluída com sucesso!");
    await loadCategories();
  } catch (error: unknown) {
    console.error(error);

    let message = "Erro ao excluir categoria.";

    if (axios.isAxiosError(error)) {
      if (typeof error.response?.data === "string") {
        message = error.response.data;
      }

      if (error.response?.status === 401) {
        message = "Sessão expirada. Faça login novamente.";
        localStorage.removeItem("token");
        router.push("/login");
      }
    }

    alert(message);
  }
}

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-500/20">
                  <span>Gestão de Categorias</span>
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight text-white">
                    Organize seu catálogo com estilo
                  </h1>
                  <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                    Crie, visualize e gerencie todas as categorias do seu e-commerce de forma rápida e elegante.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => router.push("/categories/new")}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  + Nova Categoria
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-lg shadow-slate-950/20">
                <p className="text-sm text-slate-400">Total de categorias</p>
                <p className="text-3xl font-semibold text-white">{categories.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-lg shadow-slate-950/20">
                <p className="text-sm text-slate-400">Última atualização</p>
                <p className="text-3xl font-semibold text-white">
                  {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-lg shadow-slate-950/20">
                <p className="text-sm text-slate-400">Estado</p>
                <p className="text-3xl font-semibold text-white">{loading ? "Carregando" : categories.length > 0 ? "Ativo" : "Vazio"}</p>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-slate-800/60"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
              <h2 className="text-xl font-semibold">Erro</h2>
              <p className="mt-2 text-sm text-red-200">{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-yellow-100">
              <h2 className="text-xl font-semibold">Nenhuma categoria encontrada</h2>
              <p className="mt-2 text-sm text-yellow-200">Adicione sua primeira categoria para começar a organizar o catálogo.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Categoria</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">{category.name}</h2>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20">
                      #{category.id}
                    </span>
                  </div>
                  <p className="mt-6 text-sm leading-6 text-slate-400">
                    Essa categoria aparecerá no catálogo de produtos e ajuda a organizar sua loja.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push(`/categories/${category.id}/edit`)}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Excluir
                    </button>
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

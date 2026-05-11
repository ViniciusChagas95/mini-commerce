"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();

  const categoryId = Number(params.id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchCategory() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<Category>(`/Categories/${categoryId}`);
        setName(response.data.name);
      } catch (error: unknown) {
        console.error(error);

        let message = "Erro ao carregar categoria.";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            message = "Sessão expirada. Faça login novamente.";
            localStorage.removeItem("token");
            router.push("/login");
          }

          if (error.response?.status === 404) {
            message = "Categoria não encontrada.";
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchCategory();
  }, [categoryId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("O nome da categoria é obrigatório.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/Categories/${categoryId}`, {
        id: categoryId,
        name: name.trim(),
      });

      alert("Categoria atualizada com sucesso!");
      router.push("/categories");
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao atualizar categoria.";

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

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">
                Categorias
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Editar categoria
              </h1>
              <p className="mt-2 text-slate-400">
                Atualize o nome da categoria usada para organizar seus produtos.
              </p>
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-300">
                Carregando categoria...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            {!loading && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nome da categoria
                  </label>
                  <input
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Nome da categoria"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/categories")}
                    className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

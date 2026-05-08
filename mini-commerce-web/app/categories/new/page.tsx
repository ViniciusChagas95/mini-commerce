"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/Categories", {
        name,
      });

      alert("Categoria criada com sucesso!");
      router.push("/categories");
    } catch (error: unknown) {
      console.error(error);

      let message = "Erro ao criar categoria.";

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
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-xl space-y-8">
          <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/75">Categorias</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Nova categoria</h1>
              <p className="mt-2 text-slate-400">
                Crie uma nova categoria para organizar seus produtos.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Nome da categoria</label>
                <input
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Nome da categoria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Criar Categoria
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
          </section>
        </div>
      </main>
    </>
  );
}

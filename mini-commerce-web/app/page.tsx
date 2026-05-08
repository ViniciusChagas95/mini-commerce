import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300 ring-1 ring-cyan-500/20">
              MiniCommerce
            </span>
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Um painel moderno para gerenciar seu e-commerce com confiança.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Monitore pedidos, organize produtos e categorias, e mantenha sua loja sempre atualizada em um painel rápido e elegante.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Ir para o painel
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

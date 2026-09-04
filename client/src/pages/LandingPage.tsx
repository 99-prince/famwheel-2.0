import { Link } from 'react-router-dom';

const features = [
  ['🌾', 'Sell directly', 'Farmers reach verified buyers without unnecessary middlemen.'],
  ['🤝', 'Trade with confidence', 'Clear pricing, profiles, offers, and order history in one place.'],
  ['🚚', 'Move produce reliably', 'Connect orders with transport providers for dependable delivery.'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <header className="border-b border-white/10 bg-dark-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" className="text-2xl font-black tracking-tight">
            🚜 FAM<span className="text-green-400">WHEEL</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white">
              Sign in
            </Link>
            <Link to="/register" className="rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-dark-950 hover:bg-green-400">
              Join the marketplace
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
          <div className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-10 lg:py-32">
            <div>
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-green-400">From farm to market</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] sm:text-6xl">
                A fairer way to move India&apos;s harvest.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                FAM WHEEL connects farmers, buyers, and transport providers in one trusted agricultural marketplace.
                Discover produce, negotiate clearly, and manage every order from one dashboard.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/register" className="rounded-2xl bg-green-500 px-6 py-3.5 font-bold text-dark-950 hover:bg-green-400">
                  Create your account
                </Link>
                <Link to="/login" className="rounded-2xl border border-white/15 px-6 py-3.5 font-bold text-white hover:border-green-400/60">
                  Sign in to continue
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-bold text-white/70">A connected supply chain</span>
                <span className="rounded-full bg-green-400/15 px-3 py-1 text-xs font-bold text-green-300">Built for real trade</span>
              </div>
              <div className="space-y-3">
                {['Farmer lists fresh produce', 'Buyer makes an informed offer', 'Transport provider delivers the order'].map((step, index) => (
                  <div key={step} className="flex items-center gap-4 rounded-2xl bg-black/20 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-400/15 font-black text-green-300">{index + 1}</span>
                    <span className="text-sm font-semibold text-white/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-black/10">
          <div className="mx-auto grid max-w-7xl gap-5 px-6 py-16 lg:grid-cols-3 lg:px-10">
            {features.map(([icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-4 text-3xl">{icon}</div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="mt-2 leading-7 text-white/55">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        FAM WHEEL — transparent agricultural trade for a stronger supply chain.
      </footer>
    </div>
  );
}

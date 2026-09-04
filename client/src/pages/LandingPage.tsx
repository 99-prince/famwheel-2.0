import { Link } from 'react-router-dom';

const roles = [
  { icon: '🌾', title: 'For farmers', text: 'Create a listing, set your price and quantity, receive offers, and manage every sale from one place.' },
  { icon: '🛒', title: 'For buyers', text: 'Find produce by category and location, compare sellers, place orders, and follow delivery progress.' },
  { icon: '🚚', title: 'For transporters', text: 'Discover delivery requests, submit competitive bids, and keep customers updated on every trip.' },
];

const steps = [
  ['01', 'Create your account', 'Choose your role and complete a trusted profile.'],
  ['02', 'Discover or publish', 'Browse available produce or publish what you grow.'],
  ['03', 'Agree and order', 'Discuss offers, confirm quantities, and create an order.'],
  ['04', 'Deliver with confidence', 'Coordinate transport and track the order lifecycle.'],
];

const faqs = [
  ['Who can use FAM WHEEL?', 'Farmers, produce buyers, and transport providers can create accounts and use the tools designed for their role.'],
  ['How do I sell my produce?', 'Register as a farmer, open My Listings, add your produce details, price, quantity, and availability, then publish the listing.'],
  ['Can I talk to a seller before ordering?', 'Yes. Use marketplace profiles and messaging to clarify quality, quantities, delivery, and offers before placing an order.'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07130d] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07130d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-xl">🚜</span>
            FAM<span className="text-green-400">WHEEL</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <a href="#how-it-works" className="hidden text-sm font-semibold text-white/65 hover:text-white md:block">How it works</a>
            <a href="#about" className="hidden text-sm font-semibold text-white/65 hover:text-white md:block">About us</a>
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-white/75 hover:text-white">Sign in</Link>
            <Link to="/register" className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-extrabold text-[#07130d] shadow-glow hover:bg-green-400">Get started</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(34,197,94,.16),transparent_32%),linear-gradient(135deg,#07130d,#10261a_55%,#07130d)]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8">
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-green-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> India&apos;s connected farm marketplace
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Grow better. <span className="text-green-400">Trade fairer.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                FAM WHEEL brings farmers, buyers, and transport providers together so fresh produce can move from the field to the right market with clarity and confidence.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/register" className="rounded-2xl bg-green-500 px-6 py-4 font-extrabold text-[#07130d] shadow-glow-lg transition hover:-translate-y-1 hover:bg-green-400">Join FAM WHEEL →</Link>
                <Link to="/marketplace" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:border-green-400/60 hover:bg-white/10">Explore marketplace</Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
                <span>✓ Transparent listings</span><span>✓ Direct conversations</span><span>✓ Role-based tools</span>
              </div>
            </div>
            <div className="animate-float">
              <div className="rounded-[2rem] border border-white/15 bg-[#102319] p-5 shadow-2xl shadow-black/40 sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-green-300">Marketplace flow</p><h2 className="mt-1 text-2xl font-black">From harvest to home</h2></div>
                  <span className="rounded-full bg-green-400/15 px-3 py-1 text-xs font-bold text-green-300">Live workspace</span>
                </div>
                <div className="space-y-3">
                  {['Farmer publishes fresh produce', 'Buyer compares and sends an offer', 'Order is confirmed and prepared', 'Transport partner delivers safely'].map((item, index) => (
                    <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#07130d] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 font-black text-[#07130d]">{index + 1}</span>
                      <span className="text-sm font-bold text-white/85">{item}</span>
                      {index === 3 && <span className="ml-auto text-green-400">✓</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-green-500/10 p-4 text-sm leading-6 text-green-100/80">One shared space for listings, offers, orders, messages, notifications, and market prices.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f8f3] py-20 text-[#14251a]" id="roles">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[.2em] text-green-700">One platform, three paths</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Built around the people who move food.</h2><p className="mt-5 text-lg leading-8 text-[#516056]">Every role gets a focused workspace, while the whole supply chain stays connected.</p></div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {roles.map((role) => <article key={role.title} className="rounded-3xl border border-[#dfe8dd] bg-white p-7 shadow-card transition hover:-translate-y-2 hover:shadow-card-lg"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">{role.icon}</div><h3 className="mt-6 text-2xl font-black">{role.title}</h3><p className="mt-3 leading-7 text-[#617064]">{role.text}</p><Link to="/register" className="mt-6 inline-block font-extrabold text-green-700 hover:text-green-900">Start here →</Link></article>)}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d1f15] py-20" id="how-it-works">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-green-400">Simple by design</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">How FAM WHEEL works</h2></div>
            <div className="mt-14 grid gap-4 md:grid-cols-4">
              {steps.map(([number, title, text]) => <div key={number} className="relative rounded-2xl border border-white/10 bg-white/[.04] p-6"><span className="text-sm font-black text-green-400">{number}</span><h3 className="mt-8 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p></div>)}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 text-[#14251a]" id="about">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div><p className="text-sm font-black uppercase tracking-[.2em] text-green-700">About FAM WHEEL</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Technology with a farmer-first purpose.</h2><p className="mt-6 text-lg leading-8 text-[#58685c]">FAM WHEEL was established to make agricultural trade more direct, visible, and dependable. Our platform gives each participant the tools to make better decisions while keeping relationships at the centre of every transaction.</p><p className="mt-4 leading-7 text-[#58685c]">We are building a digital bridge between farms, businesses, and logistics partners across India—one transparent order at a time.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl bg-[#eef7ed] p-7"><div className="text-3xl">🎯</div><h3 className="mt-5 text-xl font-black">Our mission</h3><p className="mt-2 leading-7 text-[#5d6e60]">Help produce reach the right buyer with fair information and fewer unnecessary barriers.</p></div><div className="rounded-3xl bg-[#fff7e8] p-7"><div className="text-3xl">🌱</div><h3 className="mt-5 text-xl font-black">Our values</h3><p className="mt-2 leading-7 text-[#5d6e60]">Trust, clarity, reliability, and sustainable growth for every participant.</p></div><div className="rounded-3xl bg-[#edf4fb] p-7 sm:col-span-2"><div className="flex items-center gap-4"><span className="text-3xl">📍</span><div><h3 className="text-xl font-black">Serving India&apos;s agricultural community</h3><p className="mt-1 text-[#5d6e60]">A digital-first marketplace designed for local produce, regional trade, and dependable delivery.</p></div></div></div></div>
          </div>
        </section>

        <section className="bg-[#f6f8f3] py-20 text-[#14251a]" id="faq">
          <div className="mx-auto max-w-4xl px-5 lg:px-8"><div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-green-700">Questions, answered</p><h2 className="mt-3 text-4xl font-black">Start with confidence</h2></div><div className="mt-10 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-[#dfe8dd] bg-white p-5"><summary className="cursor-pointer list-none font-extrabold">{question}<span className="float-right text-green-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 max-w-3xl leading-7 text-[#617064]">{answer}</p></details>)}</div></div>
        </section>

        <section className="bg-green-500 px-5 py-16 text-center text-[#07130d]"><h2 className="text-4xl font-black sm:text-5xl">Ready to move your harvest forward?</h2><p className="mx-auto mt-4 max-w-2xl text-lg text-[#17371f]">Create your account and bring your next opportunity into the FAM WHEEL network.</p><Link to="/register" className="mt-8 inline-block rounded-2xl bg-[#07130d] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#102319]">Create your free account →</Link></section>
      </main>

      <footer className="bg-[#07130d] px-5 py-12 text-white/60" id="contact">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
          <div><Link to="/" className="text-2xl font-black text-white">🚜 FAM<span className="text-green-400">WHEEL</span></Link><p className="mt-4 max-w-sm leading-7">A transparent digital marketplace connecting India&apos;s farmers, buyers, and transport providers.</p></div>
          <div><h3 className="font-black text-white">Explore</h3><div className="mt-4 flex flex-col gap-3 text-sm"><a href="#roles" className="hover:text-green-300">Who it&apos;s for</a><a href="#how-it-works" className="hover:text-green-300">How it works</a><a href="#about" className="hover:text-green-300">About FAM WHEEL</a><a href="#faq" className="hover:text-green-300">FAQ</a></div></div>
          <div><h3 className="font-black text-white">Get started</h3><div className="mt-4 flex flex-col gap-3 text-sm"><Link to="/register" className="hover:text-green-300">Create an account</Link><Link to="/login" className="hover:text-green-300">Sign in</Link><span>Support and partnerships: contact your FAM WHEEL administrator</span></div></div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs lg:px-8">© {new Date().getFullYear()} FAM WHEEL. Built for transparent agricultural trade.</div>
      </footer>
    </div>
  );
}

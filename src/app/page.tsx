import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <span className="font-bold text-gray-900 text-sm leading-tight">
            It&apos;s Called<br />Adulting
          </span>
        </div>
        <Link
          href="/home"
          className="bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors"
        >
          Open App →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-12 pb-16 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
          Free to start · No download required
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
          Is your kid ready<br />
          <span className="text-orange-500">to adult?</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
          Every parent wants their kid to call. You just also want to know
          they can handle themselves when you&apos;re not there.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Start learning free →
          </Link>
          <Link
            href="/share"
            className="bg-gray-100 text-gray-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-gray-200 transition-colors"
          >
            Send to your kid
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Works on any phone or computer. No app store needed.</p>
      </section>

      {/* Social proof bar */}
      <section className="bg-gray-50 border-y border-gray-100 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          {[
            { stat: "100+", label: "Life skills covered" },
            { stat: "Free", label: "Free to get started" },
            { stat: "12", label: "Real tools to earn" },
            { stat: "5 min", label: "Lessons per week" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-2xl font-black text-orange-500">{stat}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For parents section */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-[#0f1f3d] rounded-3xl p-8 sm:p-10 text-white">
          <div className="text-3xl mb-4">👨‍👧</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">
            You can&apos;t be there<br />for every moment.
          </h2>
          <p className="text-blue-200 leading-relaxed mb-6 text-base">
            The next time your kid&apos;s car won&apos;t start, they get a weird landlord
            letter, or they don&apos;t know if that noise is serious — they&apos;ll have
            answers before they even call you.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Step-by-step guides for every adulting emergency",
              "A toolkit they build over their first year on their own",
              "Parent mode — see their progress from your phone",
              "Weekly micro-lessons, 5 minutes or less",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/90">
                <span className="text-orange-400 font-bold mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/share"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm hover:bg-orange-600 transition-colors"
          >
            Send to your kid →
          </Link>
        </div>
      </section>

      {/* Categories preview */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black text-gray-900 mb-2">What they&apos;ll learn</h2>
        <p className="text-gray-400 text-sm mb-8">Real skills. Real situations. No fluff.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { emoji: "🚗", name: "Car Basics", desc: "Tires, oil, warnings" },
            { emoji: "🏠", name: "Home & Renting", desc: "Leases, repairs, utilities" },
            { emoji: "💰", name: "Money", desc: "Budgeting, credit, taxes" },
            { emoji: "🩺", name: "Health", desc: "Insurance, appointments" },
            { emoji: "⚡", name: "Emergencies", desc: "What to do right now" },
            { emoji: "📦", name: "Moving", desc: "Packing, deposits, mail" },
          ].map(({ emoji, name, desc }) => (
            <div key={name} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-2xl mb-2">{emoji}</div>
              <div className="font-bold text-gray-900 text-sm">{name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/home" className="text-sm text-orange-600 font-semibold hover:underline">
            See all categories →
          </Link>
        </div>
      </section>

      {/* How earning works */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Do adulting tasks. Get paid for it.</h2>
        <p className="text-gray-400 text-sm mb-10 text-center">Every task earns Adulting Bucks. Adulting Bucks become Amazon gift cards.</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "✅", label: "Complete a task", pts: "+10 pts", eg: "Check tire pressure, change air filter…" },
            { icon: "📚", label: "Finish a lesson", pts: "+25 pts", eg: "One 5-minute lesson, once a week" },
            { icon: "⭐", label: "Subscribe today", pts: "+100 pts", eg: "Instant bonus — 20% of your first gift card" },
          ].map(({ icon, label, pts, eg }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="font-bold text-gray-900 text-sm mb-1">{label}</div>
              <div className="text-orange-500 font-black text-lg mb-2">{pts}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{eg}</div>
            </div>
          ))}
        </div>
        {/* Progress bar showing 100pts toward $10 gift card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-md mx-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-900">$10 Amazon Gift Card</span>
            <span className="text-sm font-bold text-orange-500">500 pts needed</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
            <div className="bg-orange-500 h-3 rounded-full" style={{ width: "20%" }} />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Subscribe today → instant 100 bonus points → already <strong className="text-orange-500">20% of the way</strong> to your first gift card before you even start.
          </p>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/auth?redirect=/subscribe"
            className="inline-block bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Create a free account →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Free to sign up. Subscribe after to start earning.</p>
        </div>
      </section>

      {/* Toolkit teaser */}
      <section className="bg-orange-50 border-y border-orange-100 py-14">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">🔧</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Earn a real toolkit</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Complete milestones and unlock 12 essential tools over your first year —
            from a tire pressure gauge to a cordless drill. Real rewards, shipped to your door.
          </p>
          <Link
            href="/toolkit"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm hover:bg-orange-600 transition-colors"
          >
            See the toolkit →
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Simple pricing</h2>
        <p className="text-gray-400 text-sm mb-10 text-center">Start free. Upgrade when you want to earn real stuff.</p>
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Free tier */}
          <div className="bg-gray-50 rounded-3xl p-7 border border-gray-100">
            <div className="text-2xl font-black text-gray-900 mb-1">Free</div>
            <div className="text-gray-400 text-sm mb-6">Forever. No credit card.</div>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                "100+ life skill guides",
                "Step-by-step DIY walkthroughs",
                "Find a pro near you",
                "Seasonal task reminders",
                "Car, home, money, health & more",
                "Works on any phone or computer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/home"
              className="mt-8 block text-center bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-colors text-sm"
            >
              Start free →
            </Link>
          </div>

          {/* Pro tier */}
          <div className="bg-orange-500 rounded-3xl p-7 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most popular
            </div>
            <div className="text-2xl font-black mb-1">$4.99<span className="text-base font-normal text-orange-200">/mo</span></div>
            <div className="text-orange-200 text-sm mb-6">Cancel anytime.</div>
            <ul className="space-y-3 text-sm text-white/90">
              {[
                "Everything in Free",
                "Earn Adulting Bucks for every task",
                "100 bonus points just for subscribing",
                "Redeem points for real gift cards",
                "Unlock a 12-tool starter toolkit",
                "Priority access to new features",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-white font-bold mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/subscribe"
              className="mt-8 block text-center bg-white text-orange-600 font-bold px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors text-sm"
            >
              Get Adulting Pro →
            </Link>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-lg mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">
          Start adulting today.
        </h2>
        <p className="text-gray-400 mb-8 text-base">
          Free to start. No app store. Works on any device.
        </p>
        <Link
          href="/home"
          className="inline-block bg-orange-500 text-white font-bold px-10 py-4 rounded-2xl text-base hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
        >
          Open the app free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>It&apos;s Called Adulting</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-gray-600">About</Link>
            <Link href="/home" className="hover:text-gray-600">App</Link>
            <Link href="/share" className="hover:text-gray-600">Share</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

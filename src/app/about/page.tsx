import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium">← Home</Link>
      </div>

      <div className="pt-4 pb-8">
        <div className="text-5xl mb-4">💡</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          How was I supposed to know that?
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          That question. The one you ask after the mechanic shows you the bill. After the landlord keeps your deposit. After the pipes freeze. After the tire blows out and you realize you've never changed one.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Why this exists</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            There's a whole category of knowledge that doesn't get taught — not in school, not online, not unless you happen to have a parent who knew and took the time to show you. It's the stuff that seems obvious in hindsight but nobody ever explains.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Change the air filter. Document your apartment at move-in. The dryer vent is a fire hazard. You need renters insurance. Your tax refund isn't a bonus — you overpaid. None of it is complicated. All of it has real consequences if you don't know it.
          </p>
        </section>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <p className="text-orange-900 text-sm leading-relaxed font-medium italic">
            &ldquo;This app is for anyone who ever had to Google something embarrassingly basic — and felt frustrated that nobody had just told them.&rdquo;
          </p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">What&apos;s here</h2>
          <div className="space-y-3">
            {[
              { icon: "🚗", title: "Car care", desc: "Oil checks, tire pressure, what to do in an accident, jump starts — the stuff you need before the problem happens." },
              { icon: "🏠", title: "Home & apartment", desc: "Renter rights, move-in documentation, unclogging drains, preventing mold, winterizing pipes." },
              { icon: "💰", title: "Finances", desc: "Building credit, understanding your pay stub, renters insurance, taxes, budgeting, emergency funds." },
              { icon: "❤️", title: "Health", desc: "Finding a doctor, ER vs. urgent care, dental basics, understanding health insurance terms." },
              { icon: "🍳", title: "Cooking", desc: "Food safety, storage, meal prep basics, what to do if a grease fire starts." },
              { icon: "📖", title: "Interactive guides", desc: "Used car inspector, apartment move-in checklist, lease red-flag checker — tools for specific moments." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{item.title}: </span>
                  <span className="text-gray-600 text-sm">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">This is a living app</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Every submission to &ldquo;What else didn&apos;t you know?&rdquo; is read. Good ones become guides. The goal is to eventually cover everything nobody taught you — from cooking a chicken safely to understanding what a 401k match actually does for you.
          </p>
          <Link
            href="/suggest"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <span>💡</span>
            <span>Tell us what we&apos;re missing</span>
          </Link>
        </section>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-gray-400 text-xs leading-relaxed">
            Built by a dad who got tired of watching his daughter figure things out the hard way. Started in the Midwest — growing everywhere.
          </p>
        </div>
      </div>
    </main>
  );
}

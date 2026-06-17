"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref"); // referral code from share link
  const redirect = searchParams.get("redirect") || "/home";

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const supabase = getSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name, referral_code: ref ?? null },
          },
        });
        if (signUpError) throw signUpError;
        setCheckEmail(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(redirect);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <main className="max-w-sm mx-auto px-6 pt-20 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start adulting.
        </p>
        <button
          onClick={() => setCheckEmail(false)}
          className="mt-6 text-sm text-orange-600 font-medium"
        >
          ← Back to sign in
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto px-6 pt-16 pb-24">
      {/* Logo / brand */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💡</div>
        <h1 className="text-2xl font-bold text-gray-900">It&apos;s Called Adulting</h1>
        <p className="text-gray-400 text-sm mt-1">&ldquo;How was I supposed to know that?&rdquo;</p>
      </div>

      {/* Referral banner */}
      {ref && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-6 text-center">
          <p className="text-sm font-semibold text-orange-700">🎉 You were invited by a friend</p>
          <p className="text-xs text-orange-500 mt-0.5">Sign up to start earning rewards together</p>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "signup" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
          }`}
        >
          Create account
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
          }`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name is fine"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create my account →" : "Sign in →"}
        </button>
      </form>

      {mode === "signup" && (
        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          By signing up you agree to our terms. We never sell your data — ever.
        </p>
      )}

      {mode === "login" && (
        <button className="w-full text-center text-sm text-orange-600 font-medium mt-4">
          Forgot your password?
        </button>
      )}
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Field } from "@/components/ui";
import Logo from "@/components/Logo";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "emily.davis@northwood.edu" },
  { label: "Alumni / mentor", email: "sarah.johnson@northwood.edu" },
  { label: "College admin", email: "admin@northwood.edu" },
  { label: "Platform admin", email: "platform@alumniconnect.dev" },
];
const DEMO_PASSWORD = "Password123!";

// Only allow redirects to paths on this site.
function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(credentials) {
    setError("");
    setLoading(true);
    try {
      const { redirect } = await api("/api/auth/login", { method: "POST", body: credentials });
      router.replace(redirect === "/dashboard" ? next : redirect);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <Link href="/" className="auth-brand">
        <Logo />
      </Link>
      <h1>Sign in</h1>
      <p className="muted small" style={{ marginBottom: "var(--s6)" }}>
        Use your college email address.
      </p>

      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          signIn({ email, password });
        }}
      >
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="small muted" style={{ marginTop: "var(--s4)" }}>
        New here? <Link href="/register">Create an account</Link>
      </p>

      <div className="demo-accounts">
        <p>
          <strong>Demo accounts</strong>
          <span className="muted"> · password <span className="mono">{DEMO_PASSWORD}</span></span>
        </p>
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={loading}
            onClick={() => signIn({ email: account.email, password: DEMO_PASSWORD })}
          >
            <span>{account.label}</span>
            <span className="muted truncate">{account.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

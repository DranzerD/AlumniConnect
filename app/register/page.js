"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Field } from "@/components/ui";
import Logo from "@/components/Logo";

const currentYear = new Date().getFullYear();

export default function RegisterPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
    college_id: "",
    graduation_year: String(currentYear + 1),
    department: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/colleges")
      .then(({ colleges }) => setColleges(colleges))
      .catch(() => setError("Couldn't load colleges. Refresh to try again."));
  }, []);

  const college = colleges.find((c) => String(c.id) === form.college_id);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: form });
      router.replace("/dashboard/profile?welcome=1");
      router.refresh();
    } catch (err) {
      setErrors(err.details);
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <Link href="/" className="auth-brand">
          <Logo />
        </Link>
        <h1>Create your account</h1>
        <p className="muted small" style={{ marginBottom: "var(--s6)" }}>
          Join your college&apos;s alumni network. Faculty accounts are created by your college admin.
        </p>

        <form className="stack" onSubmit={onSubmit} noValidate>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-grid">
            <Field label="I am a…" htmlFor="role" error={errors.role}>
              <select id="role" className="select" value={form.role} onChange={set("role")}>
                <option value="student">Current student</option>
                <option value="alumni">Alumnus / alumna</option>
              </select>
            </Field>
            <Field label="College" htmlFor="college" error={errors.college_id}>
              <select
                id="college"
                className="select"
                value={form.college_id}
                onChange={set("college_id")}
                aria-invalid={Boolean(errors.college_id)}
                required
              >
                <option value="">Select…</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
            <input
              id="full_name"
              className="input"
              autoComplete="name"
              value={form.full_name}
              onChange={set("full_name")}
              aria-invalid={Boolean(errors.full_name)}
              required
            />
          </Field>

          <Field
            label="College email"
            htmlFor="email"
            error={errors.email}
            hint={college ? `Must be an @${college.domain} address` : "Use your institutional email"}
          >
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder={college ? `you@${college.domain}` : "you@college.edu"}
              value={form.email}
              onChange={set("email")}
              aria-invalid={Boolean(errors.email)}
              required
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password}
            hint="At least 8 characters, with a letter and a number"
          >
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              aria-invalid={Boolean(errors.password)}
              required
            />
          </Field>

          <div className="form-grid">
            <Field
              label={form.role === "student" ? "Expected graduation" : "Graduation year"}
              htmlFor="graduation_year"
              error={errors.graduation_year}
            >
              <input
                id="graduation_year"
                className="input"
                type="number"
                min="1950"
                max={currentYear + 6}
                value={form.graduation_year}
                onChange={set("graduation_year")}
                aria-invalid={Boolean(errors.graduation_year)}
                required
              />
            </Field>
            <Field label="Department (optional)" htmlFor="department" error={errors.department}>
              <input
                id="department"
                className="input"
                placeholder="Computer Science"
                value={form.department}
                onChange={set("department")}
              />
            </Field>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="small muted" style={{ marginTop: "var(--s4)" }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

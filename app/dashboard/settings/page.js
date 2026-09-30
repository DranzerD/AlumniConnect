"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { Field } from "@/components/ui";

const EMPTY = { current_password: "", new_password: "", confirm: "" };

export default function SettingsPage() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setErrors({ confirm: "Passwords don't match" });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await api("/api/auth/password", {
        method: "PUT",
        body: { current_password: form.current_password, new_password: form.new_password },
      });
      setForm(EMPTY);
      toast("Password updated", "success");
    } catch (err) {
      setErrors(err.details);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account security. Profile details are edited on your profile page.</p>
        </div>
      </div>

      <form className="card stack" style={{ maxWidth: 480 }} onSubmit={submit} noValidate>
        <h2>Change password</h2>
        <Field label="Current password" htmlFor="current_password" error={errors.current_password}>
          <input id="current_password" className="input" type="password" autoComplete="current-password"
            value={form.current_password} onChange={set("current_password")} aria-invalid={Boolean(errors.current_password)} />
        </Field>
        <Field label="New password" htmlFor="new_password" error={errors.new_password} hint="At least 8 characters, with a letter and a number">
          <input id="new_password" className="input" type="password" autoComplete="new-password"
            value={form.new_password} onChange={set("new_password")} aria-invalid={Boolean(errors.new_password)} />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm" error={errors.confirm}>
          <input id="confirm" className="input" type="password" autoComplete="new-password"
            value={form.confirm} onChange={set("confirm")} aria-invalid={Boolean(errors.confirm)} />
        </Field>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
        </div>
      </form>
    </>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { Field, SkeletonList } from "@/components/ui";

const TEXT_FIELDS = [
  ["full_name", "Full name", { required: true }],
  ["headline", "Headline", { placeholder: "e.g. Backend Engineer at Stripe", full: true }],
  ["current_role", "Current role"],
  ["current_company", "Company"],
  ["degree", "Degree", { placeholder: "B.Tech Computer Science" }],
  ["department", "Department"],
  ["graduation_year", "Graduation year", { type: "number" }],
  ["location", "Location"],
  ["linkedin_url", "LinkedIn URL", { type: "url" }],
  ["github_url", "GitHub URL", { type: "url" }],
  ["skills", "Skills", { placeholder: "Comma-separated, e.g. Java, SQL, React", full: true }],
];

function EditProfileForm() {
  const toast = useToast();
  const router = useRouter();
  const welcome = useSearchParams().get("welcome");
  const [form, setForm] = useState(null);
  const [meta, setMeta] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/profiles/me").then(({ profile }) => {
      setMeta(profile);
      setForm(Object.fromEntries(
        [...TEXT_FIELDS.map(([f]) => f), "bio"].map((f) => [f, profile[f] ?? ""])
          .concat([["is_public", Boolean(profile.is_public)], ["open_to_mentor", Boolean(profile.open_to_mentor)]]),
      ));
    });
  }, []);

  if (!form) return <SkeletonList rows={6} />;

  const canMentor = ["alumni", "faculty"].includes(meta.role);
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = { ...form };
      if (!canMentor) delete body.open_to_mentor;
      await api("/api/profiles/me", { method: "PUT", body });
      toast("Profile saved", "success");
      router.refresh();
    } catch (err) {
      setErrors(err.details);
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Edit profile</h1>
          <p>{meta.email} · {meta.college_name}</p>
        </div>
        <Link href={`/dashboard/people/${meta.id}`} className="btn">View as others see it</Link>
      </div>

      {welcome && (
        <div className="alert alert-info" style={{ marginBottom: "var(--s4)" }}>
          Your account is ready. Add a headline and a few details so people in your college can find you.
        </div>
      )}

      <form className="card stack" style={{ maxWidth: 720 }} onSubmit={save} noValidate>
        <div className="form-grid">
          {TEXT_FIELDS.map(([field, label, opts = {}]) => (
            <Field key={field} label={label} htmlFor={field} error={errors[field]} className={opts.full ? "full" : ""}>
              <input id={field} className="input" type={opts.type ?? "text"} placeholder={opts.placeholder}
                value={form[field]} onChange={set(field)} aria-invalid={Boolean(errors[field])} required={opts.required} />
            </Field>
          ))}
          <Field label="Bio" htmlFor="bio" error={errors.bio} className="full" hint={`${form.bio.length}/1000`}>
            <textarea id="bio" className="textarea" maxLength={1000} value={form.bio} onChange={set("bio")} />
          </Field>
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={form.is_public} onChange={set("is_public")} />
          <span>Show my profile in the directory<br /><span className="small muted">Your connections can always see your profile.</span></span>
        </label>
        {canMentor && (
          <label className="checkbox">
            <input type="checkbox" checked={form.open_to_mentor} onChange={set("open_to_mentor")} />
            <span>I&apos;m open to mentoring students<br /><span className="small muted">You&apos;ll appear on the Mentorship page.</span></span>
          </label>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense>
      <EditProfileForm />
    </Suspense>
  );
}

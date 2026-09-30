"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { Field } from "./ui";

export default function MentorshipRequestModal({ mentor, onClose, onSent }) {
  const toast = useToast();
  const [form, setForm] = useState({ topic: "", message: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/mentorship", { method: "POST", body: { mentor_id: mentor.id, ...form } });
      toast(`Request sent to ${mentor.full_name}`, "success");
      onSent?.();
      onClose();
    } catch (err) {
      setErrors(err.details);
      toast(err.message, "error");
      setBusy(false);
    }
  }

  return (
    <Modal title={`Ask ${mentor.full_name} for mentorship`} onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <Field label="Topic" htmlFor="topic" error={errors.topic}>
          <input id="topic" className="input" value={form.topic} maxLength={100}
            placeholder="e.g. Preparing for backend interviews"
            onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
        </Field>
        <Field label="Message" htmlFor="message" error={errors.message} hint="What would you like help with?">
          <textarea id="message" className="textarea" value={form.message} maxLength={1000}
            onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
        </div>
      </form>
    </Modal>
  );
}

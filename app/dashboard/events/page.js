"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import { useApi } from "@/lib/hooks";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { EmptyState, ErrorState, Field, SkeletonList } from "@/components/ui";
import { EVENT_TYPE_LABELS, parseDate } from "@/lib/format";

const formatDay = (v) => parseDate(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const formatTime = (v) => parseDate(v).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const EMPTY = {
  upcoming: ["No upcoming events", "When someone schedules an event for your college it will show up here."],
  going: ["You haven't RSVP'd to anything", "RSVP to an upcoming event and it will be listed here."],
  past: ["No past events", "Events move here after they start."],
};

const TABS = [
  ["upcoming", "Upcoming"],
  ["going", "Going"],
  ["past", "Past"],
];

export default function EventsPage() {
  const toast = useToast();
  const [tab, setTab] = useState("upcoming");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { data, error, loading, reload } = useApi(`/api/events?when=${tab}`);

  async function act(id, path, method, message) {
    setBusyId(id);
    try {
      await api(path, { method });
      toast(message, "success");
      await reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p>Meetups, workshops and webinars in your college network.</p>
        </div>
        {data?.canCreate && <button className="btn btn-primary" onClick={() => setCreating(true)}>Create event</button>}
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" className="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={4} />
      ) : data.events.length === 0 ? (
        <EmptyState title={EMPTY[tab][0]}>{EMPTY[tab][1]}</EmptyState>
      ) : (
        <ul className="card card-flush list">
          {data.events.map((e) => {
            const full = e.capacity !== null && e.rsvp_count >= e.capacity;
            const past = tab === "past";
            return (
              <li key={e.id} style={{ alignItems: "flex-start" }}>
                <div className="mono" style={{ width: 96, flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ display: "block", color: "var(--n-900)" }}>{formatDay(e.starts_at)}</span>
                  <span className="muted">{formatTime(e.starts_at)}</span>
                </div>
                <div className="list-item-main stack" style={{ gap: "var(--s1)" }}>
                  <div className="row">
                    <h3>{e.title}</h3>
                    <span className="badge">{EVENT_TYPE_LABELS[e.event_type]}</span>
                    {e.is_going ? <span className="badge badge-success">Going</span> : null}
                    {full && !past ? <span className="badge badge-warning">Full</span> : null}
                  </div>
                  <span className="small secondary">{e.is_virtual && !/online/i.test(e.location) ? "Online · " : ""}{e.location}</span>
                  <p className="small muted clamp-2" style={{ maxWidth: "72ch" }}>{e.description}</p>
                  <span className="small muted num">
                    {e.rsvp_count}{e.capacity ? ` of ${e.capacity}` : ""} attending · organized by {e.organizer_name}
                  </span>
                </div>
                {!past && (
                  <div className="row" style={{ flexWrap: "nowrap" }}>
                    {e.can_manage ? (
                      <button className="btn btn-sm btn-danger" disabled={busyId === e.id}
                        onClick={() => confirm("Cancel this event? Everyone who RSVP'd will be notified.") &&
                          act(e.id, `/api/events/${e.id}`, "DELETE", "Event cancelled")}>
                        Cancel event
                      </button>
                    ) : null}
                    {e.is_going ? (
                      <button className="btn btn-sm" disabled={busyId === e.id}
                        onClick={() => act(e.id, `/api/events/${e.id}/rsvp`, "DELETE", "RSVP removed")}>Leave</button>
                    ) : (
                      <button className="btn btn-sm btn-primary" disabled={full || busyId === e.id}
                        onClick={() => act(e.id, `/api/events/${e.id}/rsvp`, "POST", "You're on the list")}>
                        {full ? "Full" : "RSVP"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {creating && <CreateEventModal onClose={() => setCreating(false)} onCreated={() => { reload(); toast("Event created", "success"); }} />}
    </>
  );
}

function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", event_type: "networking", starts_at: "", location: "", is_virtual: false, capacity: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      // datetime-local values are in the user's local time zone; send an absolute timestamp.
      const starts_at = form.starts_at ? new Date(form.starts_at).toISOString() : "";
      await api("/api/events", { method: "POST", body: { ...form, starts_at } });
      onCreated();
      onClose();
    } catch (err) {
      setErrors({ ...err.details, _form: err.message });
      setBusy(false);
    }
  }

  return (
    <Modal title="Create event" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        {errors._form && <div className="alert alert-error">{errors._form}</div>}
        <div className="form-grid">
          <Field label="Title" htmlFor="title" error={errors.title} className="full">
            <input id="title" className="input" value={form.title} onChange={set("title")} aria-invalid={Boolean(errors.title)} />
          </Field>
          <Field label="Type" htmlFor="event_type">
            <select id="event_type" className="select" value={form.event_type} onChange={set("event_type")}>
              {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Starts at" htmlFor="starts_at" error={errors.starts_at}>
            <input id="starts_at" className="input" type="datetime-local" value={form.starts_at} onChange={set("starts_at")} aria-invalid={Boolean(errors.starts_at)} />
          </Field>
          <Field label="Location or link" htmlFor="location" error={errors.location}>
            <input id="location" className="input" value={form.location} onChange={set("location")} aria-invalid={Boolean(errors.location)} />
          </Field>
          <Field label="Capacity" htmlFor="capacity" error={errors.capacity} hint="Leave empty for unlimited">
            <input id="capacity" className="input" type="number" min="1" value={form.capacity} onChange={set("capacity")} />
          </Field>
          <label className="checkbox full">
            <input type="checkbox" checked={form.is_virtual} onChange={set("is_virtual")} /> This is an online event
          </label>
          <Field label="Description" htmlFor="description" error={errors.description} className="full">
            <textarea id="description" className="textarea" value={form.description} onChange={set("description")} aria-invalid={Boolean(errors.description)} />
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create event"}</button>
        </div>
      </form>
    </Modal>
  );
}

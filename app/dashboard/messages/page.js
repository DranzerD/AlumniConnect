"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { ArrowLeft } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { EmptyState } from "@/components/ui";
import { timeAgo, formatDateTime } from "@/lib/format";
import styles from "./messages.module.css";

const THREAD_POLL_MS = 4000;
const LIST_POLL_MS = 15000;

function Messages() {
  const router = useRouter();
  const activeId = Number(useSearchParams().get("with")) || null;
  const [conversations, setConversations] = useState(null);

  const loadConversations = useCallback(
    () => api("/api/messages").then((d) => setConversations(d.conversations)).catch(() => {}),
    [],
  );

  useEffect(() => {
    loadConversations();
    const timer = setInterval(loadConversations, LIST_POLL_MS);
    return () => clearInterval(timer);
  }, [loadConversations]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p>Private conversations with your connections.</p>
        </div>
      </div>

      <div className={`card ${styles.layout} ${activeId ? styles.threadOpen : ""}`}>
        <aside className={styles.list} aria-label="Conversations">
          {conversations === null ? (
            <p className="muted small" style={{ padding: "var(--s4)" }}>Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="muted small" style={{ padding: "var(--s4)" }}>
              No conversations yet. Open a <Link href="/dashboard/connections">connection</Link> to start one.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                className={`${styles.item} ${c.user_id === activeId ? styles.active : ""}`}
                onClick={() => router.replace(`/dashboard/messages?with=${c.user_id}`)}
              >
                <Avatar name={c.full_name} size="sm" />
                <span className={styles.itemText}>
                  <span className="spread">
                    <strong className="truncate">{c.full_name}</strong>
                    <span className="mono muted">{timeAgo(c.last_at)}</span>
                  </span>
                  <span className={`small ${c.unread ? "" : "muted"} ${styles.preview}`}>
                    {c.last_from_me ? "You: " : ""}{c.last_message}
                  </span>
                </span>
                {c.unread > 0 && <span className={styles.unread}>{c.unread}</span>}
              </button>
            ))
          )}
        </aside>

        <section className={styles.thread}>
          {activeId ? (
            <Thread key={activeId} userId={activeId} onActivity={loadConversations} onBack={() => router.replace("/dashboard/messages")} />
          ) : (
            <div className={styles.placeholder}>
              <EmptyState title="Select a conversation">Choose someone on the left to read or send messages.</EmptyState>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Thread({ userId, onActivity, onBack }) {
  const toast = useToast();
  const [thread, setThread] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastIdRef = useRef(0);

  const appendMessages = useCallback((messages) => {
    if (messages.length === 0) return;
    lastIdRef.current = messages[messages.length - 1].id;
    setThread((t) => {
      const seen = new Set(t.messages.map((m) => m.id));
      return { ...t, messages: [...t.messages, ...messages.filter((m) => !seen.has(m.id))] };
    });
  }, []);

  useEffect(() => {
    api(`/api/messages/${userId}`)
      .then((data) => {
        lastIdRef.current = data.messages.at(-1)?.id ?? 0;
        setThread(data);
        onActivity();
      })
      .catch((err) => setError(err.message));
  }, [userId, onActivity]);

  // Poll for new messages while the thread is open.
  useEffect(() => {
    if (!thread) return;
    const timer = setInterval(() => {
      api(`/api/messages/${userId}?after=${lastIdRef.current}`)
        .then((data) => {
          if (data.messages.length) {
            appendMessages(data.messages);
            onActivity();
          }
        })
        .catch(() => {});
    }, THREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [thread, userId, appendMessages, onActivity]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length]);

  async function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      const { message } = await api(`/api/messages/${userId}`, { method: "POST", body: { body: draft } });
      appendMessages([message]);
      setDraft("");
      onActivity();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSending(false);
    }
  }

  if (error) return <div className={styles.placeholder}><EmptyState title="Conversation unavailable">{error}</EmptyState></div>;
  if (!thread) return <div className={styles.placeholder}><p className="muted">Loading…</p></div>;

  return (
    <>
      <header className={styles.header}>
        <button className={`btn btn-sm btn-ghost ${styles.back}`} onClick={onBack} aria-label="Back to conversations"><ArrowLeft size={16} /></button>
        <Avatar name={thread.user.full_name} size="sm" />
        <div>
          <Link href={`/dashboard/people/${thread.user.id}`}><strong>{thread.user.full_name}</strong></Link>
          <div className="small muted">{thread.user.headline}</div>
        </div>
      </header>

      <div className={styles.messages}>
        {thread.messages.length === 0 && <p className="muted small">No messages yet.</p>}
        {thread.messages.map((m) => {
          const mine = m.sender_id !== userId;
          return (
            <div key={m.id} className={`${styles.bubble} ${mine ? styles.mine : ""}`} title={formatDateTime(m.created_at)}>
              {m.body}
              <span className={styles.time}>{timeAgo(m.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {thread.canMessage ? (
        <form className={styles.composer} onSubmit={send}>
          <textarea
            className="textarea"
            rows={1}
            placeholder="Write a message…"
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            aria-label="Message"
          />
          <button className="btn btn-primary" disabled={sending || !draft.trim()}>Send</button>
        </form>
      ) : (
        <p className={`small muted ${styles.composer}`}>
          You can only message your connections. <Link href={`/dashboard/people/${thread.user.id}`}>Connect first →</Link>
        </p>
      )}
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}

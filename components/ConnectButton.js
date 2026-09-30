"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useToast } from "./Toast";

// Connect / accept / message button for another user, driven by the
// connection_status returned by the profiles API.
export default function ConnectButton({ userId, status: initialStatus, connectionId, size = "sm" }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const cls = `btn ${size === "sm" ? "btn-sm" : ""}`;

  async function connect() {
    setBusy(true);
    try {
      const { connection } = await api("/api/connections", { method: "POST", body: { user_id: userId } });
      setStatus(connection.status === "accepted" ? "connected" : "pending_sent");
      toast(connection.status === "accepted" ? "You're now connected" : "Connection request sent", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (status === "connected") {
    return (
      <Link href={`/dashboard/messages?with=${userId}`} className={`${cls} btn-primary`}>
        Message
      </Link>
    );
  }
  if (status === "pending_sent") {
    return (
      <button className={cls} disabled>
        Request sent
      </button>
    );
  }
  if (status === "pending_received") {
    return (
      <button className={`${cls} btn-primary`} onClick={connect} disabled={busy}>
        Accept request
      </button>
    );
  }
  return (
    <button className={`${cls} btn-primary`} onClick={connect} disabled={busy}>
      Connect
    </button>
  );
}

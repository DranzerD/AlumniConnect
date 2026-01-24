"use client";

import { useState, useEffect } from "react";
import styles from "./connections.module.css";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connectionsRes, pendingRes, sentRes, suggestionsRes] =
        await Promise.all([
          fetch("/api/connections?status=accepted"),
          fetch("/api/connections?status=pending"),
          fetch("/api/connections?status=sent"),
          fetch("/api/profiles?limit=10&exclude=connected"),
        ]);

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.connections || []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRequests(data.connections || []);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.connections || []);
      }
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.profiles || []);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      const response = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "accept" }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to accept connection:", error);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const response = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action: "reject" }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to reject connection:", error);
    }
  };

  const handleConnect = async (userId) => {
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  const handleRemove = async (connectionId) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;

    try {
      const response = await fetch(`/api/connections?id=${connectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to remove connection:", error);
    }
  };

  const filteredConnections = connections.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tabs = [
    { id: "connections", label: "Connections", count: connections.length },
    { id: "pending", label: "Pending", count: pendingRequests.length },
    { id: "sent", label: "Sent", count: sentRequests.length },
    { id: "suggestions", label: "Suggestions", count: null },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Network</h1>
          <p className={styles.subtitle}>
            Manage your connections and grow your professional network
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={styles.badge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "connections" && (
        <>
          <div className={styles.searchBar}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔗</div>
              <h3>No connections yet</h3>
              <p>Start building your network by connecting with alumni</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  user={connection.user}
                  onMessage={() => {}}
                  onRemove={() => handleRemove(connection.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "pending" && (
        <div className={styles.requestsList}>
          {pendingRequests.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📬</div>
              <h3>No pending requests</h3>
              <p>You&apos;re all caught up!</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                user={request.user}
                type="received"
                onAccept={() => handleAccept(request.id)}
                onReject={() => handleReject(request.id)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "sent" && (
        <div className={styles.requestsList}>
          {sentRequests.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📤</div>
              <h3>No sent requests</h3>
              <p>Your connection requests will appear here</p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <RequestCard
                key={request.id}
                user={request.user}
                type="sent"
                createdAt={request.createdAt}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "suggestions" && (
        <div className={styles.grid}>
          {suggestions.map((user) => (
            <SuggestionCard
              key={user.id}
              user={user}
              onConnect={() => handleConnect(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionCard({ user, onMessage, onRemove }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className={styles.avatar}
        />
        <button className={styles.menuButton} aria-label="Options">
          ⋮
        </button>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardName}>{user.name}</h3>
        <p className={styles.cardRole}>
          {user.position} {user.company && `at ${user.company}`}
        </p>
        {user.location && (
          <p className={styles.cardLocation}>📍 {user.location}</p>
        )}
        <p className={styles.cardYear}>Class of {user.graduationYear}</p>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.primaryButton} onClick={onMessage}>
          Message
        </button>
        <button className={styles.secondaryButton} onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

function RequestCard({ user, type, onAccept, onReject, createdAt }) {
  return (
    <div className={styles.requestCard}>
      <img
        src={user.avatar || "/default-avatar.png"}
        alt={user.name}
        className={styles.requestAvatar}
      />
      <div className={styles.requestInfo}>
        <h4 className={styles.requestName}>{user.name}</h4>
        <p className={styles.requestRole}>
          {user.position} {user.company && `at ${user.company}`}
        </p>
        {createdAt && (
          <p className={styles.requestDate}>
            Sent {new Date(createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {type === "received" ? (
        <div className={styles.requestActions}>
          <button className={styles.acceptButton} onClick={onAccept}>
            Accept
          </button>
          <button className={styles.rejectButton} onClick={onReject}>
            Ignore
          </button>
        </div>
      ) : (
        <span className={styles.pendingBadge}>Pending</span>
      )}
    </div>
  );
}

function SuggestionCard({ user, onConnect }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className={styles.avatar}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardName}>{user.name}</h3>
        <p className={styles.cardRole}>
          {user.position} {user.company && `at ${user.company}`}
        </p>
        <p className={styles.cardYear}>Class of {user.graduationYear}</p>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.primaryButton} onClick={onConnect}>
          Connect
        </button>
      </div>
    </div>
  );
}

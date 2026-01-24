"use client";

import { useState, useEffect } from "react";
import styles from "./users.module.css";
import { useToast } from "../../../hooks/useToast";
import Toast from "../../../components/Toast";
import ConfirmDialog from "../../../components/ConfirmDialog";

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    setConfirmDialog({
      message: `Are you sure you want to ${action} this user?`,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${userId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentStatus }),
        });

        if (res.ok) {
          showToast(`User ${action}d successfully`, "success");
          fetchUsers();
        } else {
          showToast(`Failed to ${action} user`, "error");
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}

      <h1 className={styles.title}>User Management</h1>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{users.length}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {users.filter((u) => u.is_active).length}
          </div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {users.filter((u) => u.role === "alumni").length}
          </div>
          <div className={styles.statLabel}>Alumni</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {users.filter((u) => u.role === "student").length}
          </div>
          <div className={styles.statLabel}>Students</div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={!user.is_active ? styles.inactiveRow : ""}
              >
                <td>{user.email}</td>
                <td>{user.full_name || "-"}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      user.is_active ? styles.active : styles.inactive
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.role !== "admin" && (
                    <button
                      onClick={() =>
                        handleToggleStatus(user.id, user.is_active)
                      }
                      className={
                        user.is_active
                          ? styles.deactivateBtn
                          : styles.activateBtn
                      }
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

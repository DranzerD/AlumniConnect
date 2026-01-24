"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./settings.module.css";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";

export default function SettingsPage() {
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@demo.edu",
    phone: "+1 234 567 8900",
    location: "New York, USA",
    bio: "Software Engineer passionate about building great products",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    twitter: "https://twitter.com/johndoe",
    website: "https://johndoe.dev",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    mentorshipRequests: true,
    eventReminders: true,
    weeklyDigest: false,
    marketingEmails: false,
    smsNotifications: false,
    desktopNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: true,
    showPhone: false,
    showLocation: true,
    allowMessaging: true,
    showOnDirectory: true,
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, USA",
      current: true,
      lastActive: "Now",
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Boston, USA",
      current: false,
      lastActive: "2 hours ago",
    },
    {
      id: 3,
      device: "Firefox on Mac",
      location: "San Francisco, USA",
      current: false,
      lastActive: "3 days ago",
    },
  ]);

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "security", label: "Security", icon: "🛡️" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "account", label: "Account", icon: "⚙️" },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    });
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings({ ...privacySettings, [key]: value });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData({ ...securityData, [name]: value });
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Settings saved successfully!", "success");
    }, 1000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSecurityData({
        ...securityData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Password changed successfully!", "success");
    }, 1000);
  };

  const handleRevokeSession = (sessionId) => {
    showToast("Session revoked successfully", "success");
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account preferences</p>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.main}>
            {activeTab === "profile" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Profile Information</h2>
                  <p>Update your personal information and social links</p>
                </div>

                <div className={styles.avatarSection}>
                  <div className={styles.avatar}>JD</div>
                  <div className={styles.avatarActions}>
                    <button className={styles.uploadBtn}>Upload Photo</button>
                    <button className={styles.removeBtn}>Remove</button>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className={styles.socialSection}>
                  <h3>Social Links</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleProfileChange}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>GitHub</label>
                      <input
                        type="url"
                        name="github"
                        value={profileData.github}
                        onChange={handleProfileChange}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Twitter</label>
                      <input
                        type="url"
                        name="twitter"
                        value={profileData.twitter}
                        onChange={handleProfileChange}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Website</label>
                      <input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Notification Preferences</h2>
                  <p>Choose how you want to be notified</p>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Email Notifications</h3>
                  <div className={styles.toggleList}>
                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          All Email Notifications
                        </span>
                        <span className={styles.toggleDesc}>
                          Receive email updates about your activity
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={() =>
                            handleNotificationToggle("emailNotifications")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Job Alerts</span>
                        <span className={styles.toggleDesc}>
                          Get notified about new job postings
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.jobAlerts}
                          onChange={() => handleNotificationToggle("jobAlerts")}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Mentorship Requests
                        </span>
                        <span className={styles.toggleDesc}>
                          Receive notifications for mentorship requests
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.mentorshipRequests}
                          onChange={() =>
                            handleNotificationToggle("mentorshipRequests")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Event Reminders
                        </span>
                        <span className={styles.toggleDesc}>
                          Get reminded about upcoming events
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.eventReminders}
                          onChange={() =>
                            handleNotificationToggle("eventReminders")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Weekly Digest
                        </span>
                        <span className={styles.toggleDesc}>
                          Weekly summary of platform activity
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.weeklyDigest}
                          onChange={() =>
                            handleNotificationToggle("weeklyDigest")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Other Notifications</h3>
                  <div className={styles.toggleList}>
                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Desktop Notifications
                        </span>
                        <span className={styles.toggleDesc}>
                          Browser push notifications
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.desktopNotifications}
                          onChange={() =>
                            handleNotificationToggle("desktopNotifications")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          SMS Notifications
                        </span>
                        <span className={styles.toggleDesc}>
                          Receive text message alerts
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={() =>
                            handleNotificationToggle("smsNotifications")
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Privacy Settings</h2>
                  <p>Control who can see your information</p>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Profile Visibility</h3>
                  <div className={styles.radioGroup}>
                    {["public", "alumni", "private"].map((option) => (
                      <label key={option} className={styles.radioOption}>
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option}
                          checked={privacySettings.profileVisibility === option}
                          onChange={() =>
                            handlePrivacyChange("profileVisibility", option)
                          }
                        />
                        <span className={styles.radioLabel}>
                          {option === "public" && "🌍 Public"}
                          {option === "alumni" && "🎓 Alumni Only"}
                          {option === "private" && "🔒 Private"}
                        </span>
                        <span className={styles.radioDesc}>
                          {option === "public" &&
                            "Anyone can view your profile"}
                          {option === "alumni" &&
                            "Only verified alumni can view"}
                          {option === "private" &&
                            "Only you can view your profile"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Information Visibility</h3>
                  <div className={styles.toggleList}>
                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Show Email Address
                        </span>
                        <span className={styles.toggleDesc}>
                          Display your email on your profile
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={() =>
                            handlePrivacyChange(
                              "showEmail",
                              !privacySettings.showEmail,
                            )
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Show Phone Number
                        </span>
                        <span className={styles.toggleDesc}>
                          Display your phone number on your profile
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={() =>
                            handlePrivacyChange(
                              "showPhone",
                              !privacySettings.showPhone,
                            )
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Show Location
                        </span>
                        <span className={styles.toggleDesc}>
                          Display your location on your profile
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={privacySettings.showLocation}
                          onChange={() =>
                            handlePrivacyChange(
                              "showLocation",
                              !privacySettings.showLocation,
                            )
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Show in Alumni Directory
                        </span>
                        <span className={styles.toggleDesc}>
                          Appear in the alumni directory search
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={privacySettings.showOnDirectory}
                          onChange={() =>
                            handlePrivacyChange(
                              "showOnDirectory",
                              !privacySettings.showOnDirectory,
                            )
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                          Allow Direct Messages
                        </span>
                        <span className={styles.toggleDesc}>
                          Let other members message you directly
                        </span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={privacySettings.allowMessaging}
                          onChange={() =>
                            handlePrivacyChange(
                              "allowMessaging",
                              !privacySettings.allowMessaging,
                            )
                          }
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Privacy Settings"}
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Security Settings</h2>
                  <p>Protect your account with these security features</p>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Change Password</h3>
                  <form
                    onSubmit={handlePasswordChange}
                    className={styles.passwordForm}
                  >
                    <div className={styles.formGroup}>
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={handleSecurityChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={securityData.newPassword}
                        onChange={handleSecurityChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={securityData.confirmPassword}
                        onChange={handleSecurityChange}
                      />
                    </div>
                    <button
                      type="submit"
                      className={styles.saveBtn}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Two-Factor Authentication</h3>
                  <div className={styles.twoFactorCard}>
                    <div className={styles.twoFactorInfo}>
                      <span className={styles.twoFactorIcon}>🔐</span>
                      <div>
                        <span className={styles.toggleLabel}>
                          Two-Factor Authentication
                        </span>
                        <span className={styles.toggleDesc}>
                          Add an extra layer of security to your account
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        securityData.twoFactorEnabled ? "success" : "outline"
                      }
                    >
                      {securityData.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <button className={styles.configBtn}>
                      {securityData.twoFactorEnabled ? "Configure" : "Enable"}
                    </button>
                  </div>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Active Sessions</h3>
                  <div className={styles.sessionList}>
                    {sessions.map((session) => (
                      <div key={session.id} className={styles.sessionItem}>
                        <div className={styles.sessionInfo}>
                          <span className={styles.sessionDevice}>
                            {session.device}
                          </span>
                          <span className={styles.sessionMeta}>
                            {session.location} • {session.lastActive}
                          </span>
                        </div>
                        {session.current ? (
                          <Badge variant="success">Current</Badge>
                        ) : (
                          <button
                            className={styles.revokeBtn}
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Appearance</h2>
                  <p>Customize how the platform looks</p>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Theme</h3>
                  <div className={styles.themeOptions}>
                    <button
                      className={`${styles.themeOption} ${styles.themeActive}`}
                    >
                      <div className={styles.themePreview} data-theme="light">
                        <div className={styles.themeHeader}></div>
                        <div className={styles.themeBody}></div>
                      </div>
                      <span>Light</span>
                    </button>
                    <button className={styles.themeOption}>
                      <div className={styles.themePreview} data-theme="dark">
                        <div className={styles.themeHeader}></div>
                        <div className={styles.themeBody}></div>
                      </div>
                      <span>Dark</span>
                    </button>
                    <button className={styles.themeOption}>
                      <div className={styles.themePreview} data-theme="system">
                        <div className={styles.themeHeader}></div>
                        <div className={styles.themeBody}></div>
                      </div>
                      <span>System</span>
                    </button>
                  </div>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Accent Color</h3>
                  <div className={styles.colorOptions}>
                    {[
                      "#667eea",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#ec4899",
                    ].map((color) => (
                      <button
                        key={color}
                        className={`${styles.colorOption} ${
                          color === "#667eea" ? styles.colorActive : ""
                        }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}

            {activeTab === "account" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Account Settings</h2>
                  <p>Manage your account and data</p>
                </div>

                <div className={styles.settingsGroup}>
                  <h3>Export Data</h3>
                  <p className={styles.groupDesc}>
                    Download a copy of your data including profile information,
                    posts, and connections.
                  </p>
                  <button className={styles.exportBtn}>
                    <span>📦</span> Export My Data
                  </button>
                </div>

                <div className={`${styles.settingsGroup} ${styles.dangerZone}`}>
                  <h3>Danger Zone</h3>
                  <div className={styles.dangerItem}>
                    <div className={styles.dangerInfo}>
                      <span className={styles.dangerLabel}>
                        Deactivate Account
                      </span>
                      <span className={styles.dangerDesc}>
                        Temporarily disable your account. You can reactivate
                        anytime.
                      </span>
                    </div>
                    <button className={styles.deactivateBtn}>Deactivate</button>
                  </div>
                  <div className={styles.dangerItem}>
                    <div className={styles.dangerInfo}>
                      <span className={styles.dangerLabel}>Delete Account</span>
                      <span className={styles.dangerDesc}>
                        Permanently delete your account and all associated data.
                      </span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="small"
      >
        <div className={styles.deleteModal}>
          <p>
            Are you sure you want to delete your account? This action cannot be
            undone. All your data will be permanently removed.
          </p>
          <div className={styles.deleteModalActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button className={styles.confirmDeleteBtn}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

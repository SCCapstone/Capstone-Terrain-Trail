import React, { useEffect } from "react";
import "./SettingsView.css";

function Modal({ title, children, onCancel, onSave, saving, disableSave }) {
  return (
    <div className="modalOverlay" onMouseDown={onCancel}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">{title}</div>
        <div className="modalBody">{children}</div>
        <div className="modalActions">
          <button type="button" className="btn btn-neutral" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving || disableSave}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsView({
  status,
  loading,
  saving,
  original,

  tab,
  setTab,

  // Modal state
  modal,
  modalForm,
  onModalChange,
  openModal,
  closeModal,
  saveModal,

  // actions
  onLogout,
  onDeleteAccount,

  // appearance
  darkMode,
  toggleDarkMode,
}) {
  // keep body class in sync (works even if you later move this logic)
  useEffect(() => {
    document.body.classList.toggle("dark", !!darkMode);
  }, [darkMode]);

  return (
    <div className="settings-page">
      <div className="settings-wrap">
        <h1 className="settings-title">SETTINGS</h1>

        <div className="settings-card">
          <div className="settings-cardHeader">Settings</div>

          <div className="settings-tabs">
            <button
              type="button"
              className={`tabBtn ${tab === "account" ? "tabBtn-active" : ""}`}
              onClick={() => setTab("account")}
            >
              Account
            </button>
            <button
              type="button"
              className={`tabBtn ${tab === "appearance" ? "tabBtn-active" : ""}`}
              onClick={() => setTab("appearance")}
            >
              Appearance
            </button>
          </div>

          <div className="settings-body">
            {status?.message && (
              <div className={`status status-${status.type || "info"}`}>
                {status.message}
              </div>
            )}

            {loading ? (
              <p>Loading account data…</p>
            ) : tab === "account" ? (
              <>
                <div>
                  <h3 className="settings-sectionTitle">Profile</h3>
                  <p className="settings-sectionHint">
                    Use the buttons to update your account info.
                  </p>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rowTitle">Full Name</div>
                    <div className="rowValue">{original?.name || "—"}</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => openModal("name")}>
                    Change
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rowTitle">Username</div>
                    <div className="rowValue">{original?.username || "—"}</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => openModal("username")}>
                    Change
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rowTitle">Email</div>
                    <div className="rowValue">{original?.email || "—"}</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => openModal("email")}>
                    Change
                  </button>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rowTitle">Password</div>
                    <div className="rowValue">••••••••</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => openModal("password")}>
                    Change
                  </button>
                </div>

                <hr className="divider" />

                <div>
                  <h3 className="settings-sectionTitle">Danger Zone</h3>
                  <p className="settings-sectionHint">
                    Deleting your account permanently removes your data and frees your email/username for reuse.
                  </p>
                </div>

                <div className="actions">
                  <button type="button" className="btn btn-dangerOutline" onClick={onLogout} disabled={saving}>
                    Log Out
                  </button>

                  <button
                    type="button"
                    className="btn btn-dangerOutline"
                    onClick={onDeleteAccount}
                    disabled={saving}
                  >
                    Delete Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="settings-sectionTitle">Appearance</h3>
                  <p className="settings-sectionHint">
                    Dark mode now — more appearance features later.
                  </p>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rowTitle">Dark Mode</div>
                    <div className="rowValue">{darkMode ? "On" : "Off"}</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={toggleDarkMode}>
                    Toggle
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {modal?.type === "name" && (
          <Modal
            title="Change Full Name"
            onCancel={closeModal}
            onSave={saveModal}
            saving={saving}
            disableSave={!modalForm.newName?.trim()}
          >
            <label className="field-label" htmlFor="newName">New Full Name</label>
            <input
              id="newName"
              name="newName"
              className="field-input"
              value={modalForm.newName}
              onChange={onModalChange}
              placeholder="Enter a new name"
            />
          </Modal>
        )}

        {modal?.type === "username" && (
          <Modal
            title="Change Username"
            onCancel={closeModal}
            onSave={saveModal}
            saving={saving}
            disableSave={!modalForm.newUsername?.trim()}
          >
            <label className="field-label" htmlFor="newUsername">New Username</label>
            <input
              id="newUsername"
              name="newUsername"
              className="field-input"
              value={modalForm.newUsername}
              onChange={onModalChange}
              placeholder="Enter a new username"
            />
            <p className="settings-sectionHint">
              Username must be 3–20 chars; letters, numbers, underscores.
            </p>
          </Modal>
        )}

        {modal?.type === "email" && (
          <Modal
            title="Change Email"
            onCancel={closeModal}
            onSave={saveModal}
            saving={saving}
            disableSave={!modalForm.newEmail?.trim() || !modalForm.currentPassword}
          >
            <label className="field-label" htmlFor="newEmail">New Email</label>
            <input
              id="newEmail"
              name="newEmail"
              type="email"
              className="field-input"
              value={modalForm.newEmail}
              onChange={onModalChange}
              placeholder="Enter a new email"
            />
            <label className="field-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="field-input"
              value={modalForm.currentPassword}
              onChange={onModalChange}
              placeholder="Required to change email"
            />
          </Modal>
        )}

        {modal?.type === "password" && (
          <Modal
            title="Change Password"
            onCancel={closeModal}
            onSave={saveModal}
            saving={saving}
            disableSave={!modalForm.currentPassword || !modalForm.newPassword || !modalForm.confirmPassword}
          >
            <label className="field-label" htmlFor="currentPassword2">Current Password</label>
            <input
              id="currentPassword2"
              name="currentPassword"
              type="password"
              className="field-input"
              value={modalForm.currentPassword}
              onChange={onModalChange}
            />

            <label className="field-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="field-input"
              value={modalForm.newPassword}
              onChange={onModalChange}
            />

            <label className="field-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="field-input"
              value={modalForm.confirmPassword}
              onChange={onModalChange}
            />

            <p className="settings-sectionHint">
              You’ll need your current password to apply a new one.
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
}
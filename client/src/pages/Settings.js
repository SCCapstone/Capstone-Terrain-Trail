import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const garnet = "#73000a";

  const [form, setForm] = useState({
    newName: "",
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // keeping a copy of org. data so Cancel can restore it
  const [original, setOriginal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: ""});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  // fetching current user data
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus({
          type: "error",
          message: "You must be logged in to view Settings.",
        });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/account`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load account data.");
        }

        // backend returns: { user, source }
        const user = data.user || {};
        const baseOriginal = {
          name: user.name || "",
          email: user.email || "",
          username: user.username || "",
        };

        setOriginal(baseOriginal);

         // reset edit fields
        setForm({
          newName: "",
          newEmail: "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setStatus({ type: "", message: "" });
      } 
      catch (err) {
        setStatus({ type: "error", message: err.message || "Server error." });
      }
      finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [API_BASE]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({...f, [name]: value}));
    // clear messages when user starts editing
    if (status.message) setStatus({ type: "", message: ""});
  }

  // save updated account info
  async function handleSave(e) {
    e.preventDefault();
    if (!original || saving) return;

    setStatus({ type: "", message: ""});

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({ type: "error", message: "You are not logged in."});
      return;
    }

    const trimmedNewName = form.newName.trim();
    const trimmedNewEmail = form.newEmail.trim().toLowerCase();

    const originalEmailLower = (original.email || "").toLowerCase();

    const isNameChanging = trimmedNewName.length > 0 && trimmedNewName !== original.name;
    const isEmailChanging = trimmedNewEmail.length > 0 && trimmedNewEmail !== originalEmailLower;

    const wantsPasswordChange =
      (form.currentPassword || "").length > 0 ||
      (form.newPassword || "").length > 0 ||
      (form.confirmPassword || "").length > 0;
    
    // If changing email or password, require current password
    if ((isEmailChanging || wantsPasswordChange) && !form.currentPassword) {
      setStatus({
        type: "error",
        message: "Please enter your current password to change email or password.",
      });
      return;
    }

    // If password change, require new+confirm match + new length
    if (wantsPasswordChange) {
      if (!form.newPassword || !form.confirmPassword) {
        setStatus({
          type: "error",
          message: "Please enter and confirm your new password.",
        });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setStatus({
          type: "error",
          message: "New password and confirmation do not match.",
        });
        return;
      }
      if (form.newPassword.length < 6) {
        setStatus({
          type: "error",
          message: "New password must be at least 6 characters.",
        });
        return;
      }
    }

    // If nothing is changing, avoid calling API
    if (!isNameChanging && !isEmailChanging && !wantsPasswordChange) {
      setStatus({ type: "info", message: "No changes to save." });
      return;
    }

    // Only send what is needed
    const payload = {};
    if (isEmailChanging) payload.name = trimmedNewName;
    if (isEmailChanging) payload.email = trimmedNewEmail;

    if (isEmailChanging || wantsPasswordChange) {
      payload.currentPassword = form.currentPassword;
    }

    if (wantsPasswordChange) {
      payload.newPassword = form.newPassword;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to save changes.");
      }

      // backend returns updated user in response 
      const updated = data.user || {};
      const updatedBase = {
        name: updated.name ?? (isNameChanging ? trimmedNewName : original.name),
        email: updated.email ?? (isEmailChanging ? trimmedNewEmail : original.email),
        username: updated.username ?? original.username,
      };

      setOriginal(updatedBase);

      // clear form fields after save
      setForm({
        newName: "",
        newEmail: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setStatus({ type: "success", message: data.message || "Changes saved." });
    }
    catch (err) {
      setStatus({ type: "error", message: err.message || "Server error." });
    }
    finally {
      setSaving(false);
    }
  }
  // cancel + revert
  function handleCancel() {
    if (!original) return;
    setForm({
      newName: "",
      newEmail: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setStatus({
      type: "info",
      message: "Changes discarded.",
    });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const hasPasswordChange =
    form.currentPassword || form.newPassword || form.confirmPassword;
  
  // UI 
    return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f9fafc",
      }}
    >
      <header
        style={{
          background: "#fff",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: garnet,
            letterSpacing: "2px",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          SETTINGS
        </h1>

        <div
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `4px solid ${garnet}`,
            position: "relative",
            marginRight: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `3px solid ${garnet}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            width: "100%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: garnet,
              color: "#fff",
              padding: "20px 28px",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            Account Settings
          </div>

          <div
            style={{
              display: "flex",
              padding: "24px 28px 28px 28px",
              gap: 32,
            }}
          >
            <aside
              style={{
                minWidth: 220,
                borderRight: "1px solid #eee",
                paddingRight: 24,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: 18,
                  color: "#333",
                }}
              >
                User Settings
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 15,
                }}
              >
                <li style={{ fontWeight: 600 }}>Account</li>
                <li style={{ color: "#666" }}>Notifications</li>
                <li style={{ color: "#666" }}>Privacy</li>
              </ul>
            </aside>

            <section style={{ flex: 1 }}>
              {loading ? (
                <p style={{ marginTop: 8 }}>Loading account data…</p>
              ) : (
                <form
                  onSubmit={handleSave}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {status.message && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 4,
                        fontSize: 14,
                        background:
                          status.type === "success"
                            ? "#e6f4ea"
                            : status.type === "error"
                            ? "#fdecea"
                            : "#e8eaf6",
                        color:
                          status.type === "success"
                            ? "#1b5e20"
                            : status.type === "error"
                            ? "#b00020"
                            : "#283593",
                        border:
                          status.type === "success"
                            ? "1px solid #c8e6c9"
                            : status.type === "error"
                            ? "1px solid #f2c7c3"
                            : "1px solid #c5cae9",
                      }}
                    >
                      {status.message}
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{ display: "block", fontSize: 14, color: "#555" }}
                      >
                        Current Full Name
                      </label>
                      <div
                        style={{
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          background: "#f9fafb",
                          fontSize: 15,
                        }}
                      >
                        {original?.name || "—"}
                      </div>

                      <label
                        htmlFor="newName"
                        style={{
                          display: "block",
                          fontSize: 13,
                          color: "#777",
                          marginTop: 10,
                        }}
                      >
                        New Full Name (optional)
                      </label>
                      <input
                        id="newName"
                        name="newName"
                        type="text"
                        value={form.newName}
                        onChange={handleChange}
                        placeholder="Enter a new name"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #bbb",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{ display: "block", fontSize: 14, color: "#555" }}
                      >
                        Current Email
                      </label>
                      <div
                        style={{
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          background: "#f9fafb",
                          fontSize: 15,
                        }}
                      >
                        {original?.email || "—"}
                      </div>

                      <label
                        htmlFor="newEmail"
                        style={{
                          display: "block",
                          fontSize: 13,
                          color: "#777",
                          marginTop: 10,
                        }}
                      >
                        New Email (optional)
                      </label>
                      <input
                        id="newEmail"
                        name="newEmail"
                        type="email"
                        value={form.newEmail}
                        onChange={handleChange}
                        placeholder="Enter a new email"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #bbb",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                      <p
                        style={{
                          fontSize: 11,
                          color: "#999",
                          marginTop: 6,
                        }}
                      >
                        Changing your email will require your current password.
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    Change Password
                  </h3>
                  <p style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
                    Leave these blank if you do not want to change your password.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                    }}
                  >
                    {/* Current password with toggle */}
                    <div>
                      <label
                        htmlFor="currentPassword"
                        style={{
                          display: "block",
                          fontSize: 14,
                          color: "#555",
                        }}
                      >
                        Current Password
                      </label>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={form.currentPassword}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            fontSize: 15,
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((s) => !s)
                          }
                          style={{
                            padding: "0 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            background: "#f5f5f5",
                            fontSize: 12,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {showCurrentPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* New password with toggle */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        style={{
                          display: "block",
                          fontSize: 14,
                          color: "#555",
                        }}
                      >
                        New Password
                      </label>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={form.newPassword}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            fontSize: 15,
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((s) => !s)}
                          style={{
                            padding: "0 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            background: "#f5f5f5",
                            fontSize: 12,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {showNewPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password with toggle */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        style={{
                          display: "block",
                          fontSize: 14,
                          color: "#555",
                        }}
                      >
                        Confirm New Password
                      </label>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            fontSize: 15,
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((s) => !s)
                          }
                          style={{
                            padding: "0 12px",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            background: "#f5f5f5",
                            fontSize: 12,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 4,
                        border: "1px solid #c62828",
                        background: "#fff",
                        color: "#c62828",
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                    >
                      Log Out
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading || saving}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 15,
                        cursor: loading || saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || saving}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 4,
                        border: "none",
                        background: garnet,
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading || saving ? "not-allowed" : "pointer",
                        opacity: loading || saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>

                  {hasPasswordChange && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "#777",
                        textAlign: "right",
                      }}
                    >
                      You’ll need your current password to apply a new one.
                    </p>
                  )}
                </form>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer
        style={{
          background: garnet,
          color: "#fff",
          textAlign: "center",
          padding: "14px 0",
          fontWeight: 600,
        }}
      >
        Cola Trails
      </footer>
    </div>
  );
}

export default Settings;


import React, { useEffect, useState } from "react";

function Settings() {

  const garnet = "#73000a";

  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // keeping a copy of org. data so Cancel can restore it
  const [original, setOriginal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: ""});

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
        const res = await fetch("http://localhost:4000/api/account", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load account data.");
        }

        // chnage these if the backend is different 
        const user = data.user || data;
        const name = user.name || "";
        const email = user.email || "";

        const base = {
          name,
          email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        setForm(base);
        setOriginal(base);
        setStatus({ type: "", message: "" });
      } 
      catch (err) {
        setStatus({ type: "error", message: err.message });
      }
      finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({...f, [name]: value}));
    // clear messages when user starts editing
    if (status.message) setStatus({ type: "", message: ""});
  }

  // save updated account info
  async function handleSave(e) {
    e.preventDefault();
    setStatus( { type: "", message: ""});

    if (!original) return;

    // simple password validation 
    if (form.newPassword || form.confirmPassword || form.currentPassword) {
      if (!form.currentPassword) {
        setStatus({
          type: "error",
          message: "Please enter your current password to change it.",
        });
        return;
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus({
        type: "error",
        message: "You are not logged in.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("http://localhost:4000/api/account", {
        method: "PUT", // or "PATCH" if needed
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend should send messages like "Incorrect current password"
        throw new Error(data.message || "Unable to save changes.");
      }

      // on success, reset password fields and update original snapshot
      const updatedBase = {
        name: form.name,
        email: form.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      setForm(updatedBase);
      setOriginal(updatedBase);

      setStatus({
        type: "success",
        message: "Changes saved.",
      });
    }
    catch (err) {
      setStatus({ type: "error", message: err.message});
    }
    finally {
      setSaving(false);
    }
  }

  // cancel + revert
  function handleCancel() {
    if (!original) return;
    setForm({
      ...original,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setStatus({
      type: "info",
      message: "Changes discarded.",
    });
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
      {/* Top bar / page title (Point 2) */}
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

        {/* simple “gear” circle to echo the mock – purely visual */}
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

      {/* Main content */}
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
          {/* Big maroon strip (Point 3 area header) */}
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

          {/* Settings content area (Point 3) */}
          <div
            style={{
              display: "flex",
              padding: "24px 28px 28px 28px",
              gap: 32,
            }}
          >
            {/* Left: categories list (purely visual for now) */}
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

            {/* Right: editable form */}
            <section style={{ flex: 1 }}>
              {loading ? (
                <p style={{ marginTop: 8 }}>Loading account data…</p>
              ) : (
                <form
                  onSubmit={handleSave}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Issue #80: success / error messages */}
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
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        style={{ display: "block", fontSize: 14, color: "#555" }}
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        style={{ display: "block", fontSize: 14, color: "#555" }}
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

                  {/* Password section */}
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
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>

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
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>

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
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "10px 12px",
                          borderRadius: 4,
                          border: "1px solid #ddd",
                          fontSize: 15,
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions row (Point 4: Save / Cancel) */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
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

      {/* Footer (Point 1 / logo text) */}
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

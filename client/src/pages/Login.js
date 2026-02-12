// testingggg
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import horseshoe from "./horseshoe_now.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
  const garnet = "#73000a";

  // avoid setState on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("API_BASE:", API_BASE);
  }, [API_BASE]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // prevent double sumbit

    setMsg("");
    setLoading(true);
    setSlow(false);

    // hide browser vaildation tooltip focus
    document.activeElement?.blur?.();

    // trim email (prevents invisible trailing spaces causing invailed email)
    const cleanEmail = email.trim().toLocaleLowerCase();
    const cleanPassword = password; // not triming the password

    if (!cleanEmail || !cleanEmail) {
      setMsg("Email and password are required.")
      setLoading(false);
      return;
    }

    // show "waking up server" message if request takes > 1.2s
    const slowTimer =  setTimeout(() => {
      if (mountedRef.current) setSlow(true);
    }, 1200);

    try {
      const t0 = performance.now();

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const t1 = performance.now();
      const data = await res.json().catch(() => ({}));
      const t2 = performance.now();

      console.log(
        `login fetch=${Math.round(t1 - t0)}ms json=${Math.round(t2 - t1)}ms status=${res.status}`
      );

      if (!mountedRef.current) return;

      if (res.ok) {
        localStorage.setItem("token", data.token || "");
        navigate("/app/explore");
      } 
      else {
        setMsg(data.message || "Invalid email or password");
      }
    } 
    catch (err) {
      if (!mountedRef.current) return;
      setMsg(
        "Network error. If this is the first request, the server may be waking up (Render free tier). Try again in a few seconds."
      );
    } 
    finally {
      clearTimeout(slowTimer);
      if (mountedRef.current) {
        setLoading(false);
        setSlow(false); // hide slow message after completion
      }
    }
  }

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
          justifyContent: "flex-start",
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
          LOG IN
        </h1>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ maxWidth: 760, width: "60%", marginTop: "10px" }}>
          <img
            src={horseshoe}
            alt="USC Horseshoe"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        </div>

        <div
          style={{
            width: "32%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: 24,
            marginTop: "30px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: "#111",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Login
          </h2>
          
          {/* noValidate prevents browser “Please enter an email address.” tooltips */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 16,
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8}}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  fontSize: 16,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
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
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: "12px 14px",
                background: loading ? "#999" : garnet,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {slow && !msg && (
              <div style={{ color: "#444", fontSize: 14}}>
                Waking up server… (Render free tier can take ~10–20s on the first request)
              </div>
            )}

            {msg && (
              <div style={{ color: "#b00020", fontSize: 14 }}>{msg}</div>
            )}
          </form>
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
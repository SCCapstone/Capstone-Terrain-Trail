import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import horseshoe from "./horseshoe_now.jpg";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("http://localhost:4000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) navigate("/login");
    else setMsg(data.message || "Error");
  }

  const garnet = "#73000a";

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
          SIGN UP
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
            Sign Up
          </h2>

          <form
            onSubmit={handleSubmit}
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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 16,
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: garnet,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: "#fff",
                  color: garnet,
                  border: `2px solid ${garnet}`,
                  borderRadius: 4,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Log In
              </button>
            </div>

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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/AuthProvider";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { status, update } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // Show a loading state while checking auth
  if (status === "loading" || status === "authenticated") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const endpoint = isLogin ? `${apiUrl}/auth/login` : `${apiUrl}/auth/register`;
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=86400`;
      document.cookie = `user=${JSON.stringify(data.data.user)}; path=/; max-age=86400`;

      await update();

      // Show success state briefly then redirect
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setError("");
    setSuccess(false);
  };

  return (
    <>
      {/* Hero header */}
      <section style={{
        position: "relative",
        background: "linear-gradient(135deg, #2c1a0e 0%, #4a2915 50%, #3d6b4f 100%)",
        color: "var(--cream)",
        padding: "5rem 2rem 4rem",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div className="pattern-blockprint" style={{ opacity: 0.04 }} />
        <h1 className="animate-fade-in-down" style={{
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          fontFamily: "var(--font-heading), 'Cormorant Garamond', Georgia, serif",
          fontWeight: 600,
          marginBottom: "0.75rem",
          position: "relative",
          zIndex: 2,
        }}>
          {isLogin ? "Welcome Back" : "Join Our Journey"}
        </h1>
        <p className="animate-fade-in-up delay-1" style={{
          maxWidth: "520px",
          margin: "0 auto",
          color: "rgba(232, 221, 208, 0.8)",
          fontSize: "1rem",
          lineHeight: 1.7,
          position: "relative",
          zIndex: 2,
        }}>
          {isLogin
            ? "Sign in to access your wishlist, track orders, and experience handcrafted traditions."
            : "Create an account to save your favourite treasures and unlock exclusive collections."}
        </p>
      </section>

      {/* Form body */}
      <section style={{
        flex: 1,
        padding: "3rem 1.5rem 5rem",
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--linen) 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}>
        <div className="animate-scale-in" style={{ width: "100%", maxWidth: "440px" }}>

          {/* Glassmorphism card */}
          <div className="glass-card" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>

            {/* Loading bar at top */}
            {loading && <div className="progress-bar" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: 0 }} />}

            {/* Success overlay */}
            {success && (
              <div className="animate-bounce-in" style={{
                position: "absolute",
                inset: 0,
                background: "rgba(253, 248, 242, 0.96)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderRadius: "var(--radius-lg)",
              }}>
                <CheckCircle2 size={48} color="var(--forest)" strokeWidth={1.5} />
                <p style={{ marginTop: "1rem", fontWeight: 600, color: "var(--forest)", fontSize: "1.1rem" }}>
                  {isLogin ? "Signed in!" : "Account created!"}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                  Redirecting you…
                </p>
              </div>
            )}

            {/* Tab switcher */}
            <div style={{
              display: "flex",
              borderRadius: "var(--radius-md)",
              background: "var(--linen)",
              padding: "4px",
              marginBottom: "1.75rem",
            }}>
              <button
                type="button"
                onClick={() => switchMode(true)}
                style={{
                  flex: 1,
                  padding: "0.7rem",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  background: isLogin ? "var(--surface)" : "transparent",
                  color: isLogin ? "var(--terracotta)" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.3s var(--ease-craft)",
                  boxShadow: isLogin ? "var(--shadow-sm)" : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                style={{
                  flex: 1,
                  padding: "0.7rem",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  background: !isLogin ? "var(--surface)" : "transparent",
                  color: !isLogin ? "var(--terracotta)" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.3s var(--ease-craft)",
                  boxShadow: !isLogin ? "var(--shadow-sm)" : "none",
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="shake" style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(196, 84, 26, 0.08)",
                border: "1px solid rgba(196, 84, 26, 0.2)",
                color: "var(--rust-accent)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ fontSize: "1rem" }}>⚠</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="animate-fade-in-up" style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} />
                    <input type="text" name="name" className="input-modern" style={{ paddingLeft: "2.5rem" }} placeholder="Enter your full name" disabled={loading} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} />
                  <input type="email" name="email" className="input-modern" style={{ paddingLeft: "2.5rem" }} placeholder="you@example.com" required disabled={loading} />
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem" }}>Password</label>
                  {isLogin && (
                    <Link href="#" style={{ fontSize: "0.8rem", color: "var(--terracotta)", fontWeight: 500 }}>Forgot?</Link>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} />
                  <input type={showPassword ? "text" : "password"} name="password" className="input-modern" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} placeholder="••••••••" required disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="animate-fade-in-up" style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="input-modern" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} placeholder="••••••••" required disabled={loading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  fontSize: "0.95rem",
                  marginTop: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm spinner-white" />
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle link */}
            <div style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              {isLogin ? (
                <>Don&apos;t have an account?{" "}
                  <span onClick={() => switchMode(false)} style={{ color: "var(--terracotta)", fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    Sign up
                  </span>
                </>
              ) : (
                <>Already have an account?{" "}
                  <span onClick={() => switchMode(true)} style={{ color: "var(--terracotta)", fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    Sign in
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

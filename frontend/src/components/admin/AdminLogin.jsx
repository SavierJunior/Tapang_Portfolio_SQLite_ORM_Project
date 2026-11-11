import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

export default function AdminLogin({ onNavigate }) {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!identifier.trim() || !password) {
      setError("Enter your username or email and your password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(identifier.trim(), password);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin admin--center">
      <form className="admin-login" onSubmit={handleSubmit} noValidate>
        <span className="brand-logo admin-login__logo">AT</span>
        <h1>Admin login</h1>
        <p>Sign in to manage your portfolio.</p>

        <div className="field">
          <label htmlFor="admin-identifier">Username or email</label>
          <input
            id="admin-identifier"
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            disabled={loading}
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <p className="form-status form-status--error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
        <button type="button" className="admin-login__back" onClick={() => onNavigate("home")}>
          ← Back to portfolio
        </button>
      </form>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSession, login, logout } from "../services/adminService";

// Admin session state. The login itself is an HttpOnly cookie set by the server, so there is
// nothing sensitive here: only the admin's public details (name, username, email).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("checking"); // "checking" | "in" | "out"

  useEffect(() => {
    let active = true;
    getSession()
      .then((data) => {
        if (!active) return;
        setAdmin(data.admin);
        setStatus(data.admin ? "in" : "out");
      })
      .catch(() => active && setStatus("out"));
    return () => {
      active = false;
    };
  }, []);

  // Any admin request answered with 401 (expired session) sends the user back to the login form.
  useEffect(() => {
    const onUnauthorized = () => {
      setAdmin(null);
      setStatus("out");
    };
    window.addEventListener("admin-unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin-unauthorized", onUnauthorized);
  }, []);

  const signIn = useCallback(async (identifier, password) => {
    const data = await login(identifier, password);
    setAdmin(data.admin);
    setStatus("in");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Even if the request fails, leave the dashboard; the cookie expires on its own.
    }
    setAdmin(null);
    setStatus("out");
  }, []);

  const value = useMemo(() => ({ admin, status, signIn, signOut }), [admin, status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

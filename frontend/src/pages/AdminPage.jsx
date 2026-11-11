import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLogin from "../components/admin/AdminLogin";
import Loader from "../components/common/Loader";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../styles/Admin.css";

function AdminGate({ onNavigate }) {
  const { status } = useAuth();
  if (status === "checking") {
    return (
      <div className="admin admin--center">
        <Loader label="Checking your session..." />
      </div>
    );
  }
  return status === "in" ? <AdminDashboard onNavigate={onNavigate} /> : <AdminLogin onNavigate={onNavigate} />;
}

export default function AdminPage({ onNavigate }) {
  return (
    <AuthProvider>
      <AdminGate onNavigate={onNavigate} />
    </AuthProvider>
  );
}

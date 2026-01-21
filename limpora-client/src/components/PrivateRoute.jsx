import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export default function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children ? children : <Outlet />;
}

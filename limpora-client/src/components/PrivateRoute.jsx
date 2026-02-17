import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export default function PrivateRoute({ children }) {
    if (import.meta.env.DEV) return <Outlet />; 
    
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children ? children : <Outlet />;
}

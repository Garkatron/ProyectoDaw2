import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

interface RoleRouteProps {
  roles: string[];
  redirectTo?: string;
}

export default function RoleRoute({
  roles,
  redirectTo = "/",
}: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

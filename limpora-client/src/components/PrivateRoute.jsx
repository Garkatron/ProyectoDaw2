

import { Outlet, Navigate } from "react-router-dom";

export function PrivateRoute({ children }) {
  const isLoggedIn = true;
  if (!isLoggedIn) return <Navigate to="/login" />;

  return children ? children : <Outlet />;
}

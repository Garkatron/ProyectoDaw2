import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

interface PrivateRouteProps {
    children?: React.ReactNode
}

// if (import.meta.env.DEV) return <Outlet />
export default function PrivateRoute({ children }: PrivateRouteProps) {

    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated)
    if (!isAuthenticated) return <Navigate to="/login" />

    return children ? <>{children}</> : <Outlet />
}
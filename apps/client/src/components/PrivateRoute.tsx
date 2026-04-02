import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

interface PrivateRouteProps {
    children?: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children ? <>{children}</> : <Outlet />
}
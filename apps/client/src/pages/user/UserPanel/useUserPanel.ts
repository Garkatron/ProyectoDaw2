import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/auth.store'
import { API } from '../../../lib/api'
import { UserRole } from '@limpora/common'

interface TargetUser {
    id:           number
    name:         string
    role:         string
    total_points: number
    member_since: string
}


export function useUserPanel() {
    const { username } = useParams()
    const navigate = useNavigate()
    const currentUser = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)

    const [targetUser, setTargetUser] = useState<TargetUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isSelf = username === 'me'

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!username || username === 'undefined') {
                setError('Invalid username.')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            if (isSelf) {
                if (!currentUser) {
                    setError('No current user found.')
                    setLoading(false)
                    return
                }
    
                const { data, error } = await API.user.me.get()
                if (error || !data) {
                    setError('Failed to load user profile.')
                } else {
                    setTargetUser(data)
                }
            } else {
                const { data, error } = await API.user.name({ name: username }).get()
                if (error || !data) {
                    setError('Failed to load user profile.')
                } else if (data.role === 'admin') {
                    setError('Admin profiles are not visible.')
                } else {
                    setTargetUser(data)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [username, currentUser])

    return { targetUser, isSelf, loading, error, handleLogout }
}
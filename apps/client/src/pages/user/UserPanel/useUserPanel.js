import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { getUserByName, getUserByUid } from '../../../services/user.service';

export function useUserPanel() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isSelf = username === 'me';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!username || username === 'undefined') {
                setError('Invalid username.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                let effectiveUser = currentUser;
                if (isSelf) {
                    if (!effectiveUser) { setError('No current user found.'); return; }
                    if (effectiveUser.role === 'admin') { setError('Admins cannot access the panel.'); return; }
                }

                const fetchedUser = isSelf
                    ? await getUserByUid(effectiveUser.uid)
                    : await getUserByName(username);

                if (fetchedUser.role === 'admin') {
                    setError('Admin profiles are not visible.');
                    return;
                }
                setTargetUser(fetchedUser);
            } catch {
                setError('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username, currentUser]);

    return { targetUser, isSelf, loading, error, handleLogout };
}
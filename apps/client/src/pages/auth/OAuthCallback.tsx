import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

export default function OAuthCallback() {
    const { fetchUser } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            navigate("/login");
            return;
        }

        localStorage.setItem("firebase_token", token);

        fetchUser().then(() => {
            const { isAuthenticated } = useAuthStore.getState();
            if (isAuthenticated) {
                navigate("/panel/me");
            } else {
                navigate("/login");
            }
        });
    }, []);
    return <div>Starting Session...</div>;
}
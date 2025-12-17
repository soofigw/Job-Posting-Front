import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
    const actor = useSelector((s) => s.auth.actor);
    const location = useLocation();

    if (!actor) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

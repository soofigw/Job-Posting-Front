import api from "../../services/api";
import { AUTH_STORAGE } from "./authTypes";

export function loadSession() {
    const token = localStorage.getItem(AUTH_STORAGE.TOKEN);
    const actorRaw = localStorage.getItem(AUTH_STORAGE.ACTOR);

    let actor = null;
    try {
        actor = actorRaw ? JSON.parse(actorRaw) : null;
    } catch {
        actor = null;
    }

    return { token, actor };
}

export function saveSession({ token, actor }) {
    localStorage.setItem(AUTH_STORAGE.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE.ACTOR, JSON.stringify(actor));
}

export function clearSession() {
    localStorage.removeItem(AUTH_STORAGE.TOKEN);
    localStorage.removeItem(AUTH_STORAGE.ACTOR);
}

export async function loginService({ email, password }) {
    const res = await api.post("/auth/login", { email, password });
    const { token, actor } = res.data; // EXACTO a tu backend
    saveSession({ token, actor });
    return { token, actor };
}

export async function registerService(payload) {
    const res = await api.post("/auth/register", payload);
    const { token, actor } = res.data; // EXACTO a tu backend
    saveSession({ token, actor });
    return { token, actor };
}

export function logoutService() {
    clearSession();
}

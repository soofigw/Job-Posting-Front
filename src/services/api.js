import axios from "axios";

const TOKEN_KEY = "token";
const ACTOR_KEY = "actor";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Sin respuesta (server caído / CORS / DNS)
        if (!error.response) {
            const e = new Error("No se pudo conectar con el servidor");
            e.code = "NETWORK_ERROR";
            throw e;
        }

        const { status, data } = error.response;

        // Normaliza a Error real (para que SIEMPRE exista err.message)
        const e = new Error(data?.message || "Error inesperado");
        e.status = status;
        e.code = data?.error || "HTTP_ERROR";

        // Si backend dice 401, limpia sesión
        if (status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ACTOR_KEY);
        }

        throw e;
    }
);

export default api;

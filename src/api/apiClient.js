import axios from "axios";

// Lógica "Inteligente":
// 1. En Producción (Vercel): Usará la variable de entorno completa (que incluye el dominio de Render).
// 2. En Local (Tu PC): Al no existir la variable, usará "/api" y seguirá aprovechando tu proxy de vite.config.js.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Lógica de logout si es necesario
        }
        return Promise.reject(error);
    }
);
export default apiClient;
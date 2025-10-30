import axios from "axios";

// Lista de rutas que no deben ser interceptadas
const EXCLUDED_ROUTES = ["/login", "/register"];

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Cambia la URL base según tu API
    headers: { "Content-Type": "application/json" },
});

// Interceptor de solicitud
api.interceptors.request.use(
    (request) => {
        console.log("Interceptando solicitud a:", JSON.stringify(request));
        // Verificar si la URL está en la lista de excluidas
        if (EXCLUDED_ROUTES.some((route) => request.url?.includes(route))) {
            return request;
        }
        
        const token = localStorage.getItem("token");
        // Agregar token si la ruta no está excluida
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.log("No autorizado, redirigiendo a login...");
            window.location.href = "/login"; // Redirigir si la sesión expira
        }
        return Promise.reject(error);
    }
);

export default api;

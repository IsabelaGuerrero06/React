import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { logout } from "../store/userSlice";
import toast from 'react-hot-toast';

// Lista de rutas que no deben ser interceptadas
const EXCLUDED_ROUTES = ["/login", "/register"];

const baseURL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

// Interceptor de solicitud: añade token si existe
api.interceptors.request.use(
    (request) => {
        // Evitar interceptar rutas explícitamente excluidas
        if (request.url && EXCLUDED_ROUTES.some((route) => request.url!.includes(route))) {
            return request;
        }

        const token = localStorage.getItem("token");
        if (token) {
            if (!request.headers) (request as any).headers = {};
            (request as any).headers["Authorization"] = `Bearer ${token}`;
        }

        return request;
    },
    (error) => Promise.reject(error)
);

// Helper axios instance without interceptors for refresh calls
const plain = axios.create({ baseURL });

// Interceptor de respuesta: manejar 401 con intento de refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                // No hay refresh token: forzar logout
                store.dispatch(logout());
                window.location.href = "/auth/signin";
                return Promise.reject(error);
            }

            try {
                // Intentar refresh
                const resp = await plain.post('/auth/refresh', { refreshToken });
                const data: any = resp.data;

                if (data?.token) {
                    localStorage.setItem('token', data.token);
                    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

                    // Reintentar la petición original con el nuevo token
                    if (originalRequest.headers) {
                        (originalRequest.headers as any)['Authorization'] = `Bearer ${data.token}`;
                    } else {
                        (originalRequest as any).headers = { Authorization: `Bearer ${data.token}` };
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh falló — limpiar estado y redirigir
                store.dispatch(logout());
                toast.error('La sesión expiró. Inicia sesión de nuevo.');
                window.location.href = "/auth/signin";
                return Promise.reject(refreshError);
            }
        }

        // Otros errores — mostrar toast y propagar
        const message = (error.response && (error.response.data as any)?.message) || error.message;
        if (message) toast.error(message.toString());
        return Promise.reject(error);
    }
);

export default api;

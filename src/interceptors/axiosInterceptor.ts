// src/interceptors/axiosInterceptor.ts
// =====================================================
// 🔧 Interceptor de Axios con manejo de autenticación
// ✅ CORREGIDO: Ahora obtiene el token correctamente
// =====================================================

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { logout } from "../store/userSlice";
import Swal from 'sweetalert2';

// ==================== CONFIGURACIÓN ====================
const EXCLUDED_ROUTES = ["/login", "/register", "/auth/signin", "/auth/signup"];
const baseURL = import.meta.env.VITE_API_URL as string;

// ==================== INSTANCIA PRINCIPAL ====================
const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
});

// ==================== INSTANCIA SIN INTERCEPTORES ====================
const plain = axios.create({ baseURL });

// ==================== 🔑 FUNCIÓN PARA OBTENER TOKEN ====================
/**
 * Función centralizada para obtener el token
 * Prioriza 'token' pero también verifica claves alternativas
 */
function getAuthToken(): string | null {
    // 1️⃣ Intentar obtener token con la clave principal
    let token = localStorage.getItem("token");
    
    // 2️⃣ Si no existe, intentar con claves alternativas
    if (!token) {
        token = localStorage.getItem("auth_token");
    }
    if (!token) {
        token = localStorage.getItem("firebase_token");
    }
    
    // 3️⃣ Limpiar el token si está envuelto en comillas o JSON
    if (token) {
        // Si el token fue guardado como JSON string, parsearlo
        if (token.startsWith('"') && token.endsWith('"')) {
            token = JSON.parse(token);
        }
        // Remover comillas dobles si las tiene
       // token = token.replace(/^"(.*)"$/, '$1');
    }
    
    return token;
}

// ==================== 📤 INTERCEPTOR DE PETICIONES ====================
api.interceptors.request.use(
    (config) => {
        // Verificar si la ruta está excluida
        if (config.url && EXCLUDED_ROUTES.some((route) => config.url!.includes(route))) {
            console.log('🚫 Ruta excluida del interceptor:', config.url);
            return config;
        }

        // 🔑 Obtener token usando la función centralizada
        const token = getAuthToken();
        
        // 📊 Logs para debugging
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📤 INTERCEPTOR REQUEST MEJORADO');
        console.log('🎯 URL destino:', config.method?.toUpperCase(), config.url);
        console.log('🔍 Buscando token en localStorage...');
        console.log('   - localStorage.token:', localStorage.getItem("token") ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   - localStorage.auth_token:', localStorage.getItem("auth_token") ? '✅ EXISTE' : '❌ NO EXISTE');
        console.log('   - localStorage.firebase_token:', localStorage.getItem("firebase_token") ? '✅ EXISTE' : '❌ NO EXISTE');
        // ✅ CORREGIDO: Verificar que token no sea null antes de usar substring
        console.log('🔑 Token encontrado:', token ? `${token.substring(0, 30)}...` : '❌ NO TOKEN');
        
        if (token) {
            // Inicializar headers si no existen
            if (!config.headers) {
                config.headers = {} as any;
            }
            
            // Agregar Authorization header
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Header Authorization agregado correctamente');
            // ✅ CORREGIDO: Verificar que token no sea null antes de usar substring
            console.log('📋 Headers finales:', {
                Authorization: config.headers.Authorization ? 
                    `Bearer ${token.substring(0, 20)}...` : 'NO SET',
                'Content-Type': config.headers['Content-Type']
            });
        } else {
            console.warn('⚠️ No se encontró token en localStorage');
            console.warn('💡 Verifica que SecurityService.login() esté guardando el token correctamente');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return config;
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// ==================== 📥 INTERCEPTOR DE RESPUESTAS ====================
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response exitoso:', {
            url: response.config.url,
            status: response.status,
            method: response.config.method?.toUpperCase()
        });
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ INTERCEPTOR RESPONSE ERROR');
        console.log('🔴 Status:', status);
        console.log('🎯 URL:', originalRequest?.url);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // ==================== 🔄 MANEJO DE 401: REFRESH TOKEN ====================
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                console.warn('⚠️ No hay refreshToken - Forzando logout');
                store.dispatch(logout());
                
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
                    confirmButtonText: 'Ir al login',
                    confirmButtonColor: '#3b82f6',
                    allowOutsideClick: false,
                });
                
                window.location.href = "/auth/signin";
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Intentando refresh del token...');
                const resp = await plain.post('/auth/refresh', { refreshToken });
                const data: any = resp.data;

                if (data?.token) {
                    localStorage.setItem('token', data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }
                    
                    console.log('✅ Token refrescado exitosamente');

                    // Reintentar petición original con nuevo token
                    if (originalRequest.headers) {
                        (originalRequest.headers as any)['Authorization'] = `Bearer ${data.token}`;
                    } else {
                        (originalRequest as any).headers = { 
                            Authorization: `Bearer ${data.token}` 
                        };
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('❌ Refresh falló - Forzando logout');
                store.dispatch(logout());
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Sesión expirada',
                    text: 'No se pudo renovar tu sesión. Inicia sesión de nuevo.',
                    confirmButtonText: 'Ir al login',
                    confirmButtonColor: '#ef4444',
                    allowOutsideClick: false,
                });
                
                window.location.href = "/auth/signin";
                return Promise.reject(refreshError);
            }
        }

        // ==================== 🎯 MANEJO DE OTROS ERRORES ====================
        if (error.response) {
            const message = (error.response.data as any)?.message || error.message;

            switch (status) {
                case 403:
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Acceso denegado',
                        text: 'No tienes permisos para realizar esta acción.',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#f59e0b',
                    });
                    break;

                case 404:
                    Swal.fire({
                        icon: 'error',
                        title: 'No encontrado',
                        text: 'El recurso solicitado no existe.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    break;

                case 500:
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error del servidor',
                        text: 'Ocurrió un error interno. Intenta más tarde.',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#ef4444',
                    });
                    break;

                default:
                    if (status && status >= 400 && message) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: message,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
            }
        } else if (error.request) {
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#10b981',
            });
        } else {
            console.error('❌ Error desconocido:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: error.message || 'Algo salió mal.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }

        return Promise.reject(error);
    }
);

// ==================== 🔧 HELPERS DE DEBUGGING ====================
/**
 * Verifica el estado actual del token en localStorage
 */
export const debugToken = () => {
    const token = getAuthToken();
    const refreshToken = localStorage.getItem("refreshToken");
    
    console.log('🔍 DEBUG TOKEN MEJORADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 localStorage completo:', {
        token: localStorage.getItem("token") ? '✅' : '❌',
        auth_token: localStorage.getItem("auth_token") ? '✅' : '❌',
        firebase_token: localStorage.getItem("firebase_token") ? '✅' : '❌',
        refreshToken: localStorage.getItem("refreshToken") ? '✅' : '❌',
        user: localStorage.getItem("user") ? '✅' : '❌',
        currentUserId: localStorage.getItem("currentUserId") ? '✅' : '❌',
    });
    // ✅ CORREGIDO: Verificar que token no sea null antes de usar substring
    console.log('🔑 Token actual:', token ? `${token.substring(0, 50)}...` : '❌ NO TOKEN');
    console.log('🔄 Refresh:', refreshToken ? '✅ PRESENTE' : '❌ AUSENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { 
        hasToken: !!token, 
        hasRefresh: !!refreshToken,
        // ✅ CORREGIDO: Verificar que token no sea null antes de usar substring
        tokenPreview: token ? token.substring(0, 50) : null 
    };
};

// Exponer en window para debugging desde consola
if (typeof window !== 'undefined') {
    (window as any).debugToken = debugToken;
    (window as any).getAuthToken = getAuthToken;
}

export default api;
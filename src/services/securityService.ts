import axios from "axios";
import { User } from "../models/User";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

class SecurityService extends EventTarget {
    keySession: string;
    API_URL: string;
    user: User;
    theAuthProvider: any;
    
    constructor() {
        super();

        // Guardaremos el token bajo la clave 'token' para que coincida con el interceptor
        this.keySession = 'token';
        this.API_URL = import.meta.env.VITE_API_URL || ""; // Reemplaza con la URL real
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            this.user = JSON.parse(storedUser);
        } else {
            this.user = {};
        }
    }

    async login(user: User) {
        console.log("llamando api " + `${this.API_URL}/login`);
        try {
            const response = await axios.post(`${this.API_URL}/login`, user, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;
            console.log('Respuesta login:', data);

            // El backend puede devolver { user: {...}, token: '...' } o directamente el user con token
            const token = data?.token || data?.accessToken || data?.session || null;
            const userObj = data?.user ? data.user : (data?.user === undefined && data?.name ? data : null);

            // Si vino token, guardarlo bajo la clave definida (token)
            if (token) {
                localStorage.setItem(this.keySession, typeof token === 'string' ? token : JSON.stringify(token));
            }

            // Si vino el usuario, guardarlo correctamente y despacharlo al store
            if (userObj) {
                this.user = userObj;
                localStorage.setItem('user', JSON.stringify(userObj));
                store.dispatch(setUser(userObj));
                this.dispatchEvent(new CustomEvent('userChange', { detail: userObj }));
                return { user: userObj, token };
            }

            // Fallback: si la respuesta es un objeto plano
            this.user = data as any;
            localStorage.setItem('user', JSON.stringify(data));
            store.dispatch(setUser(data as any));
            return data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }
    
    getUser() {
        return this.user;
    }
    
    logout() {
        this.user = {};
        localStorage.removeItem('user');
        localStorage.removeItem(this.keySession);
        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        store.dispatch(setUser(null));
    }

    isAuthenticated() {
        return localStorage.getItem(this.keySession) !== null;
    }

    getToken() {
        return localStorage.getItem(this.keySession);
    }
}

export default new SecurityService();

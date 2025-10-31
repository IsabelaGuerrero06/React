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
        this.keySession = 'token';
        this.API_URL = import.meta.env.VITE_API_URL || "";
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

            const token = data?.token || data?.accessToken || data?.session || null;
            const userObj = data?.user ? data.user : (data?.user === undefined && data?.name ? data : null);

            if (token) {
                localStorage.setItem(this.keySession, typeof token === 'string' ? token : JSON.stringify(token));
            }

            if (userObj) {
                this.user = userObj;
                localStorage.setItem('user', JSON.stringify(userObj));
                store.dispatch(setUser(userObj));
                this.dispatchEvent(new CustomEvent('userChange', { detail: userObj }));
                return { user: userObj, token };
            }

            this.user = data as any;
            localStorage.setItem('user', JSON.stringify(data));
            store.dispatch(setUser(data as any));
            return data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }

    /**
     * Método para establecer sesión después de OAuth
     * @param user - Objeto de usuario
     * @param token - Token de autenticación
     */
    setSession(user: User, token: string) {
        console.log('Setting session:', { user, token });
        
        // Guardar token
        if (token) {
            localStorage.setItem(this.keySession, token);
        }

        // Guardar usuario
        if (user) {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            store.dispatch(setUser(user));
            this.dispatchEvent(new CustomEvent('userChange', { detail: user }));
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
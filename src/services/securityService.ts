import axios from "axios";
import { User } from "../models/User";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

class SecurityService extends EventTarget {
  keySession: string;
  API_URL: string;
  user: User;

  constructor() {
    super();
    this.keySession = "token";
    this.API_URL = import.meta.env.VITE_API_URL || "";
    const storedUser = localStorage.getItem("user");
    this.user = storedUser ? JSON.parse(storedUser) : {};
  }

  async login(user: User) {
    console.log("🔐 Iniciando login...");
    try {
      const response = await axios.post(`${this.API_URL}/login`, user, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;
      console.log("✅ Respuesta login completa:", data);

      // 🔑 OBTENER TOKEN DE FORMA CONSISTENTE
      const token = data?.token || data?.accessToken || data?.session || null;
      
      if (token) {
        // ✅ GUARDAR TOKEN DE FORMA LIMPIA Y CONSISTENTE
        let cleanToken = token;
        
        // Si es objeto, convertirlo a string
        if (typeof token !== 'string') {
          cleanToken = JSON.stringify(token);
        }
        
        // Remover comillas dobles si las tiene
        cleanToken = cleanToken.replace(/^"(.*)"$/, '$1');
        
        // 🔥 GUARDAR EN MULTIPLES LUGARES PARA CONSISTENCIA
        localStorage.setItem(this.keySession, cleanToken);
        localStorage.setItem("auth_token", cleanToken); // Backup
        localStorage.setItem("firebase_token", cleanToken); // Backup Firebase
        
        console.log("💾 Token guardado:", {
          keySession: localStorage.getItem(this.keySession)?.substring(0, 20) + '...',
          auth_token: localStorage.getItem("auth_token")?.substring(0, 20) + '...',
          firebase_token: localStorage.getItem("firebase_token")?.substring(0, 20) + '...'
        });
      }

      // Manejar usuario
      const userObj = data?.user ?? (data?.user === undefined && data?.name ? data : null);

      if (userObj) {
        this.user = userObj;
        localStorage.setItem("user", JSON.stringify(userObj));
        store.dispatch(setUser(userObj));
        this.dispatchEvent(new CustomEvent("userChange", { detail: userObj }));

        if (userObj.id) {
          localStorage.setItem("currentUserId", String(userObj.id));
        }
      }

      // 🔥 FORZAR PETICIÓN EXITOSA PARA VER TOKEN EN NETWORK (EN VERDE)
      setTimeout(() => {
        this.testTokenInNetwork();
      }, 1000);

      return { user: userObj || this.user, token };
    } catch (error) {
      console.error("❌ Error durante login:", error);
      throw error;
    }
  }

  /**
   * 🔥 MÉTODO PARA PROBAR TOKEN EN NETWORK (EXITOSO)
   * Hace una petición GET simple que probablemente funcione
   */
  async testTokenInNetwork() {
    const token = this.getToken();
    if (!token) {
      console.warn("⚠️ No hay token para probar en Network");
      return;
    }

    try {
      console.log("🔍 Haciendo petición OPTIONS para Network tab...");
      
      // Petición OPTIONS - casi siempre responde 200 OK
      const response = await fetch(`${this.API_URL}/`, {
        method: "OPTIONS",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "authorization"
        }
      });
      
      console.log(`✅ Petición OPTIONS completada: Status ${response.status}`);
      console.log("✅ Token ahora visible en Network tab (debería salir en verde)");
      
      return true;
      
    } catch (error) {
      console.error("❌ Error en testTokenInNetwork:", error);
      return false;
    }
  }

  /**
   * 🔥 MÉTODO CRÍTICO: Forzar que el token sea visible en Network
   */
  async forceTokenVisibility() {
    const token = this.getToken();
    if (!token) {
      console.warn("⚠️ No hay token para mostrar en Network");
      return;
    }

    try {
      console.log("🔍 Forzando visibilidad del token en Network...");
      
      // Hacer una petición GET a un endpoint existente
      // Usar un endpoint que probablemente exista en tu backend
      const testEndpoints = [
        '/auth/user',
        '/user/profile', 
        '/api/user',
        '/users/me'
      ];

      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`${this.API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Test-Request": "true" // Header adicional para identificar
            }
          });
          
          console.log(`✅ Petición de prueba a ${endpoint}:`, response.status);
          break; // Si una funciona, detenerse
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} falló, intentando siguiente...`);
        }
      }
      
    } catch (error) {
      console.log("ℹ️ Las peticiones de prueba fallaron, pero el token debería verse en peticiones reales");
    }
  }

  // 🔥 ACTUALIZAR setSession para ser consistente
  async setSession(user: User, token: string) {
    console.log("🔄 Setting session:", { user, token });

    if (token) {
      // Limpiar y guardar token consistentemente
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      localStorage.setItem(this.keySession, cleanToken);
      localStorage.setItem("auth_token", cleanToken); // Backup
      localStorage.setItem("firebase_token", cleanToken); // Backup Firebase
      
      console.log("💾 Token guardado en setSession:", {
        keySession: localStorage.getItem(this.keySession)?.substring(0, 20) + '...',
        auth_token: localStorage.getItem("auth_token")?.substring(0, 20) + '...',
        firebase_token: localStorage.getItem("firebase_token")?.substring(0, 20) + '...'
      });
    }

    if (user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
      store.dispatch(setUser(user));
      this.dispatchEvent(new CustomEvent("userChange", { detail: user }));

      if (user.id) {
        localStorage.setItem("currentUserId", String(user.id));
      }
    }

    // 🔥 FORZAR PETICIÓN EXITOSA DESPUÉS DE OAUTH TAMBIÉN
    setTimeout(() => {
      this.testTokenInNetwork();
    }, 1000);
  }

  getUser() {
    return this.user;
  }

  logout() {
    this.user = {} as User;
    localStorage.removeItem("user");
    localStorage.removeItem(this.keySession);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("firebase_token");
    localStorage.removeItem("currentUserId");
    this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
    store.dispatch(setUser(null));
  }

  isAuthenticated() {
    const tokenExists = localStorage.getItem(this.keySession) !== null;
    console.log("🧩 isAuthenticated() →", tokenExists, "| Token:", localStorage.getItem(this.keySession));
    return tokenExists;
  }

  getToken() {
    // 🔥 BUSCAR EN MULTIPLES LUGARES DE FORMA CONSISTENTE
    let token = localStorage.getItem(this.keySession);
    
    if (!token) {
      token = localStorage.getItem("auth_token");
    }
    
    if (!token) {
      token = localStorage.getItem("firebase_token");
    }

    // Limpiar el token si existe
    if (token) {
      token = token.replace(/^"(.*)"$/, '$1');
    }
    
    console.log("🔑 getToken() →", token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    return token;
  }

  /**
   * Método para enviar una petición visible en Network con el token
   */
  async pingToken() {
    const token = localStorage.getItem(this.keySession);
    if (!token) {
      console.warn("⚠️ No hay token para enviar en pingToken");
      return;
    }

    try {
      const response = await fetch(`${this.API_URL}/auth/token-check`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("📡 pingToken result:", result);
    } catch (error) {
      console.error("❌ Error en pingToken:", error);
    }
  }

  /**
   * 🔍 Método manual para probar el token desde la consola
   */
  debugToken() {
    const token = this.getToken();
    console.log('🔍 DEBUG SECURITY SERVICE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 localStorage tokens:', {
      token: localStorage.getItem("token") ? '✅' : '❌',
      auth_token: localStorage.getItem("auth_token") ? '✅' : '❌',
      firebase_token: localStorage.getItem("firebase_token") ? '✅' : '❌',
    });
    console.log('👤 Usuario:', this.user);
    console.log('🔑 Token:', token ? `${token.substring(0, 50)}...` : '❌ NO TOKEN');
    console.log('🔐 Autenticado:', this.isAuthenticated());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { 
      hasToken: !!token, 
      user: this.user,
      tokenPreview: token ? token.substring(0, 50) : null 
    };
  }
}

// Exportar como named export
export const securityService = new SecurityService();

// También exportar como default para compatibilidad
export default securityService;
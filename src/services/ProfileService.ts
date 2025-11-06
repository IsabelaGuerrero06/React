import axios from 'axios';
import { Profile } from '../models/Profile';
import api from '../interceptors/axiosInterceptor';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Adaptador para transformar datos del backend al modelo del frontend
 * Principio SOLID: Single Responsibility - Solo adapta datos
 */
class ProfileAdapter {
  /**
   * Convierte la respuesta del backend al modelo Profile del frontend
   */
  static toFrontendModel(backendData: any): Profile {
    const currentUserId = localStorage.getItem('currentUserId');
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    // ✅ Determinar si el perfil pertenece al usuario autenticado
    const isAuthenticatedProfile =
      currentUserId && Number(currentUserId) === Number(backendData.user_id);

    // ✅ Email: usar el del backend o, si no viene, solo usar localStorage si es el autenticado
    let email =
      backendData.email ||
      backendData.user_email ||
      (isAuthenticatedProfile && parsedUser?.email) ||
      'No especificado';

    // 🧩 NUEVO BLOQUE: si no hay email, intentar recuperar desde sessionStorage (usuario recién creado)
    if (!backendData.email || backendData.email === '') {
      const lastCreatedUser = sessionStorage.getItem('lastCreatedUser');
      if (lastCreatedUser) {
        try {
          const parsed = JSON.parse(lastCreatedUser);
          if (parsed?.id === backendData.user_id && parsed?.email) {
            email = parsed.email;
          }
        } catch {
          console.warn('⚠️ Error al parsear lastCreatedUser para email');
        }
      }
    }

    // ✅ Nombre completo: priorizar backend, luego name, luego fallback seguro
    let fullName = backendData.fullName?.trim()
      ? backendData.fullName
      : backendData.name || 'Usuario sin nombre';

    // ⚠️ Solo en caso de que sea el usuario autenticado y no tenga nombre, usar localStorage
    if (
      (!backendData.fullName || backendData.fullName.trim() === '') &&
      isAuthenticatedProfile &&
      parsedUser?.name
    ) {
      fullName = parsedUser.name;
    }

    // 🧩 NUEVO BLOQUE: si el backend no envió nombre, intentar con sessionStorage (usuario recién creado)
    if (
      (!backendData.fullName || backendData.fullName.trim() === '') &&
      (!backendData.name || backendData.name.trim() === '')
    ) {
      const lastCreatedUser = sessionStorage.getItem('lastCreatedUser');
      if (lastCreatedUser) {
        try {
          const parsed = JSON.parse(lastCreatedUser);
          if (parsed?.id === backendData.user_id && parsed?.name) {
            fullName = parsed.name;
          }
        } catch {
          console.warn('⚠️ Error al parsear lastCreatedUser para fullName');
        }
      }
    }

    // 🧩 BLOQUE FINAL: intentar recuperar nombre/email desde cachedUsers (persistente)
    if (
      (!fullName || fullName === 'Usuario sin nombre') ||
      !email ||
      email === 'No especificado'
    ) {
      try {
        const usersCache = localStorage.getItem('cachedUsers');
        if (usersCache) {
          const users = JSON.parse(usersCache);
          const foundUser = users.find((u: any) => u.id === backendData.user_id);
          if (foundUser) {
            fullName = foundUser.name || fullName;
            email = foundUser.email || email;
          }
        }
      } catch (e) {
        console.warn('⚠️ Error leyendo cachedUsers:', e);
      }
    }

    return {
      id: backendData.id,
      userId: backendData.user_id,
      fullName,
      phone: backendData.phone || '',
      address: backendData.address || '',
      about: backendData.about || '',
      email,
      avatarUrl: backendData.photo
        ? this.buildImageUrl(backendData.photo)
        : undefined,
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at,
    };
  }

  /**
   * Construye la URL completa de la imagen desde el path del backend
   */
  static buildImageUrl(photoPath: string | null): string | undefined {
    if (!photoPath) return undefined;
    const filename = photoPath.split('/').pop();
    return `${API_URL}/api/profiles/${filename}`;
  }

  /**
   * Convierte FormData del frontend al formato que espera el backend
   */
  static toBackendFormData(data: FormData, file?: File): FormData {
    const backendFormData = new FormData();
    const phone = data.get('phone');
    if (phone) {
      backendFormData.append('phone', phone.toString());
    }
    if (data.get('fullName')) {
      backendFormData.append('fullName', data.get('fullName')!.toString());
    }
    if (data.get('email')) {
      backendFormData.append('email', data.get('email')!.toString());
    }
    if (file) {
      backendFormData.append('photo', file);
    }
    return backendFormData;
  }
}

/**
 * Servicio de perfiles - maneja todas las peticiones HTTP
 */

// GET /api/profiles/user/{userId}
export const getProfileByUserId = async (userId: number): Promise<Profile> => {
  try {
    const response = await api.get(`${API_URL}/api/profiles/user/${userId}`);
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error('❌ Error al obtener el perfil:', error);
    throw error;
  }
};

// 🆕 NUEVA FUNCIÓN: obtiene el perfil o lo crea si no existe
export const getOrCreateProfileByUserId = async (userId: number) => {
  try {
    const { data } = await api.get(`${API_URL}/api/profiles/user/${userId}`);
    console.log('✅ Perfil encontrado en backend:', data);
    return ProfileAdapter.toFrontendModel(data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('🆕 No existe perfil, creando uno nuevo...');

      // 🧠 Intentar recuperar los datos del usuario recién creado desde sessionStorage
      let userData: any = {};
      const storedCreatedUser = sessionStorage.getItem('lastCreatedUser');
      if (storedCreatedUser) {
        try {
          userData = JSON.parse(storedCreatedUser);
          console.log('📦 Datos del usuario recién creado recuperados:', userData);
        } catch (e) {
          console.warn('⚠️ Error al parsear lastCreatedUser:', e);
        }
      }

      // Crear el perfil usando los datos del usuario nuevo si están disponibles
      const formData = new FormData();
      formData.append('phone', userData.phone || '');
      formData.append('fullName', userData.name || 'Usuario sin nombre');
      formData.append('email', userData.email || '');

      const { data: newProfile } = await api.post(
        `${API_URL}/api/profiles/user/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      console.log('✅ Perfil creado automáticamente con datos del usuario:', newProfile);
      return ProfileAdapter.toFrontendModel(newProfile);
    }

    console.error('❌ Error inesperado al obtener/crear perfil:', error);
    throw error;
  }
};

// GET /api/profiles/{profileId}
export const getProfileById = async (profileId: number): Promise<Profile> => {
  try {
    const response = await api.get(`${API_URL}/api/profiles/${profileId}`);
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error('❌ Error al obtener el perfil:', error);
    throw error;
  }
};

// POST /api/profiles/user/{userId}
export const createProfile = async (
  userId: number,
  data: FormData,
): Promise<Profile> => {
  try {
    const photoFile = data.get('photo') as File | null;
    const backendFormData = ProfileAdapter.toBackendFormData(
      data,
      photoFile || undefined,
    );

    const response = await axios.post(
      `${API_URL}/api/profiles/user/${userId}`,
      backendFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error('❌ Error al crear el perfil:', error);
    throw error;
  }
};

// PUT /api/profiles/{profileId}
export const updateProfile = async (
  profileId: number,
  data: FormData,
): Promise<Profile> => {
  try {
    const photoFile = data.get('photo') as File | null;
    const backendFormData = ProfileAdapter.toBackendFormData(
      data,
      photoFile || undefined,
    );

    const response = await axios.put(
      `${API_URL}/api/profiles/${profileId}`,
      backendFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error('❌ Error al actualizar el perfil:', error);
    throw error;
  }
};

// DELETE /api/profiles/{profileId}
export const deleteProfile = async (profileId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/profiles/${profileId}`);
  } catch (error) {
    console.error('❌ Error al eliminar el perfil:', error);
    throw error;
  }
};

// Verificar si un usuario tiene perfil (usa la nueva función)
export const checkProfileExists = async (userId: number): Promise<boolean> => {
  try {
    const profile = await getOrCreateProfileByUserId(userId);
    return !!profile;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

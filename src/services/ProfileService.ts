import axios from "axios";
import { Profile } from "../models/Profile";

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
    return {
      id: backendData.id,
      userId: backendData.user_id,
      fullName: backendData.fullName || backendData.name || '',
      phone: backendData.phone || '',
      address: backendData.address || '',
      about: backendData.about || '',
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
    const response = await axios.get(`${API_URL}/api/profiles/user/${userId}`);
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error("❌ Error al obtener el perfil:", error);
    throw error;
  }
};

// 🆕 NUEVA FUNCIÓN: obtiene el perfil o lo crea si no existe
export const getOrCreateProfileByUserId = async (userId: number): Promise<Profile | null> => {
  try {
    const response = await axios.get(`${API_URL}/api/profiles/user/${userId}`);
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("🆕 No existe perfil, creando uno nuevo...");
      try {
        const formData = new FormData();
        const newProfileResponse = await axios.post(
          `${API_URL}/api/profiles/user/${userId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log("✅ Perfil creado automáticamente:", newProfileResponse.data);
        return ProfileAdapter.toFrontendModel(newProfileResponse.data);
      } catch (createError) {
        console.error("❌ Error al crear el perfil automáticamente:", createError);
        return null;
      }
    }
    console.error("❌ Error al obtener perfil:", error);
    return null;
  }
};

// GET /api/profiles/{profileId}
export const getProfileById = async (profileId: number): Promise<Profile> => {
  try {
    const response = await axios.get(`${API_URL}/api/profiles/${profileId}`);
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error("❌ Error al obtener el perfil:", error);
    throw error;
  }
};

// POST /api/profiles/user/{userId}
export const createProfile = async (userId: number, data: FormData): Promise<Profile> => {
  try {
    const photoFile = data.get('photo') as File | null;
    const backendFormData = ProfileAdapter.toBackendFormData(data, photoFile || undefined);
    
    const response = await axios.post(
      `${API_URL}/api/profiles/user/${userId}`, 
      backendFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error("❌ Error al crear el perfil:", error);
    throw error;
  }
};

// PUT /api/profiles/{profileId}
export const updateProfile = async (profileId: number, data: FormData): Promise<Profile> => {
  try {
    const photoFile = data.get('photo') as File | null;
    const backendFormData = ProfileAdapter.toBackendFormData(data, photoFile || undefined);
    
    const response = await axios.put(
      `${API_URL}/api/profiles/${profileId}`, 
      backendFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return ProfileAdapter.toFrontendModel(response.data);
  } catch (error) {
    console.error("❌ Error al actualizar el perfil:", error);
    throw error;
  }
};

// DELETE /api/profiles/{profileId}
export const deleteProfile = async (profileId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/profiles/${profileId}`);
  } catch (error) {
    console.error("❌ Error al eliminar el perfil:", error);
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

// src/services/digitalSignatureService.ts
import axios from "axios";
import { DigitalSignature } from "../models/DigitalSignature";
import api from '../interceptors/axiosInterceptor';

const API_URL = `${import.meta.env.VITE_API_URL}/api/digital-signatures`;

class DigitalSignatureService {
  // Obtener todas las firmas digitales
  async getAll(): Promise<DigitalSignature[]> {
    try {
      const response = await api.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener firmas digitales:", error);
      return [];
    }
  }

  // Obtener una firma digital por ID
  async getById(id: number): Promise<DigitalSignature | null> {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener firma digital por ID:", error);
      return null;
    }
  }

  // Obtener firma digital por usuario
  async getByUserId(userId: number): Promise<DigitalSignature | null> {
    try {
      const response = await api.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener firma digital por usuario:", error);
      return null;
    }
  }

  // Crear una nueva firma digital
  async create(userId: number, photoFile: File): Promise<DigitalSignature | null> {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await api.post(`${API_URL}/user/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error al crear firma digital:", error);
      return null;
    }
  }

  // Actualizar una firma digital existente
  async update(signatureId: number, photoFile: File): Promise<DigitalSignature | null> {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.put(`${API_URL}/${signatureId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error al actualizar firma digital:", error);
      return null;
    }
  }

  // Eliminar una firma digital
  async delete(signatureId: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${signatureId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar firma digital:", error);
      return false;
    }
  }

  // Obtener URL de la imagen (igual que en ProfileService)
  buildImageUrl(photoPath: string | null): string | undefined {
    if (!photoPath) return undefined;
    const filename = photoPath.split('/').pop();
    return `${API_URL}/${filename}`;
  }
}

export const digitalSignatureService = new DigitalSignatureService();
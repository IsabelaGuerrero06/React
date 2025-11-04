// src/services/deviceService.ts
import axios from "axios";
import { Device } from "../models/Device";

const API_URL = `${import.meta.env.VITE_API_URL}/api/devices`;

class DeviceService {
  // Obtener todos los dispositivos
  async getDevices(): Promise<Device[]> {
    try {
      const response = await axios.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivos:", error);
      return [];
    }
  }

  // Obtener un dispositivo por ID
  async getDeviceById(id: number): Promise<Device | null> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivo por ID:", error);
      return null;
    }
  }

  // Obtener dispositivos por usuario
  async getDevicesByUser(userId: number): Promise<Device[]> {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivos por usuario:", error);
      return [];
    }
  }

  // Crear un nuevo dispositivo
  async createDevice(device: Device): Promise<Device | null> {
    try {
      if (!device.user_id) {
        throw new Error("user_id is required");
      }

      const url = `${API_URL}/user/${device.user_id}`;
      const payload = {
        name: device.name,
        ip: device.ip,
        operating_system: device.operating_system,
      };

      console.log("=== DEVICE SERVICE DEBUG ===");
      console.log("URL:", url);
      console.log("Payload:", payload);
      console.log("Full API_URL:", API_URL);
      console.log("ENV variable:", import.meta.env.VITE_API_URL);

      const response = await axios.post(url, payload);
      
      console.log("Response:", response.data);
      console.log("=== END DEBUG ===");

      return response.data;
    } catch (error) {
      console.error("=== DEVICE CREATION ERROR ===");
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("URL:", error.config?.url);
      }
      console.error("Error:", error);
      console.error("=== END ERROR ===");
      return null;
    }
  }

  // Actualizar un dispositivo existente
  async updateDevice(deviceId: number, device: Partial<Device>): Promise<Device | null> {
    try {
      const response = await axios.put(`${API_URL}/${deviceId}`, device);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar dispositivo:", error);
      return null;
    }
  }

  // Eliminar un dispositivo
  async deleteDevice(deviceId: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${deviceId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
      return false;
    }
  }
}

export const deviceService = new DeviceService();
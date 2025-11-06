// src/services/deviceService.ts
import axios from "axios";
import { Device } from "../models/Device";
import api from "../interceptors/axiosInterceptor";

const API_URL = `${import.meta.env.VITE_API_URL}/api/devices`;

class DeviceService {
  async getDevices(): Promise<Device[]> {
    try {
      const response = await api.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivos:", error);
      return [];
    }
  }

  async getDeviceById(id: number): Promise<Device | null> {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivo por ID:", error);
      return null;
    }
  }

  async getDevicesByUser(userId: number): Promise<Device[]> {
    try {
      const response = await api.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener dispositivos por usuario:", error);
      return [];
    }
  }

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

      const response = await api.post(url, payload);
      
      console.log("Response:", response.data);
      console.log("=== END DEBUG ===");

      return response.data;
    } catch (error) {
      console.error("=== DEVICE CREATION ERROR ===");
      console.error("Error:", error);
      console.error("=== END ERROR ===");
      return null;
    }
  }

  async updateDevice(deviceId: number, device: Partial<Device>): Promise<Device | null> {
    try {
      const response = await api.put(`${API_URL}/${deviceId}`, device);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar dispositivo:", error);
      return null;
    }
  }

  async deleteDevice(deviceId: number): Promise<boolean> {
    try {
      await api.delete(`${API_URL}/${deviceId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
      return false;
    }
  }
}

export const deviceService = new DeviceService();
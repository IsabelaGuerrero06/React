import axios from "axios";
import { Profile } from "../models/Profile";

const API_URL = import.meta.env.VITE_API_URL; // viene del .env

export const getProfileByUserId = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    throw error;
  }
};

export const createProfile = async (userId: number, data: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/profiles/user/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el perfil:", error);
    throw error;
  }
};

export const updateProfile = async (profileId: number, data: FormData) => {
  try {
    const response = await axios.put(`${API_URL}/profiles/${profileId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    throw error;
  }};

export const deleteProfile = async (profileId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el perfil:", error);
    throw error;
  }
};
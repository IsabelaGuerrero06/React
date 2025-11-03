import axios from "axios";
import { Answer } from "../models/Answer";

const API_URL = `${import.meta.env.VITE_API_URL}/api/answers`;

class AnswerService {
  // Obtener todas las respuestas
  async getAnswers(): Promise<Answer[]> {
    try {
      const response = await axios.get<Answer[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener respuestas:", error);
      return [];
    }
  }

  // Obtener una respuesta por ID
  async getAnswerById(id: number): Promise<Answer | null> {
    try {
      const response = await axios.get<Answer>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Respuesta no encontrada:", error);
      return null;
    }
  }

  // Crear una nueva respuesta
  async createAnswer(answer: Omit<Answer, "id" | "created_at" | "updated_at">): Promise<Answer | null> {
    try {
      const response = await axios.post<Answer>(API_URL, answer);
      return response.data;
    } catch (error) {
      console.error("Error al crear respuesta:", error);
      return null;
    }
  }

  // Actualizar una respuesta existente
  async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer | null> {
    try {
      const response = await axios.put<Answer>(`${API_URL}/${id}`, answer);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar respuesta:", error);
      return null;
    }
  }

  // Eliminar una respuesta
  async deleteAnswer(id: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar respuesta:", error);
      return false;
    }
  }
}

// Exportamos una instancia lista para usar en toda la app
export const answerService = new AnswerService();

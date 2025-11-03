// src/services/answerService.ts
import axios from "axios";
import { Answer } from "../models/Answer";

const API_URL = `${import.meta.env.VITE_API_URL}/api/answers`;

class AnswerService {
  // Obtener todas las respuestas
  async getAnswers(): Promise<Answer[]> {
    try {
      const response = await axios.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener respuestas:", error);
      return [];
    }
  }

  // Obtener una respuesta por ID
  async getAnswerById(id: number): Promise<Answer | null> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener respuesta por ID:", error);
      return null;
    }
  }

  // Obtener respuestas por usuario
  async getAnswersByUser(userId: number): Promise<Answer[]> {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener respuestas por usuario:", error);
      return [];
    }
  }

  // Obtener respuestas por pregunta de seguridad
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    try {
      const response = await axios.get(`${API_URL}/question/${questionId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener respuestas por pregunta:", error);
      return [];
    }
  }

  // Obtener una respuesta específica de un usuario a una pregunta concreta
  async getUserAnswerForQuestion(userId: number, questionId: number): Promise<Answer | null> {
    try {
      const response = await axios.get<Answer>(`${API_URL}/user/${userId}/question/${questionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user's answer for question:", error);
      return null;
    }
  }


  // Crear respuesta (usa la ruta /user/:user_id/question/:question_id)
  async createAnswer(answer: Answer): Promise<Answer | null> {
    try {
      if (!answer.user_id || !answer.security_question_id) {
        throw new Error("user_id y security_question_id son obligatorios");
      }

      const response = await axios.post(
        `${API_URL}/user/${answer.user_id}/question/${answer.security_question_id}`,
        { content: answer.content }
      );

      return response.data;
    } catch (error) {
      console.error("Error al crear respuesta:", error);
      return null;
    }
  }

  // Actualizar respuesta
  async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer | null> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, answer);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar respuesta:", error);
      return null;
    }
  }

  // Eliminar respuesta
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

export const answerService = new AnswerService();

// src/services/securityQuestionService.ts
import axios from "axios";
import { SecurityQuestion } from "../models/SecurityQuestion";
import api from "../interceptors/axiosInterceptor";

const API_URL = `${import.meta.env.VITE_API_URL}/api/security-questions`;

class SecurityQuestionService {
  async getAll(): Promise<SecurityQuestion[]> {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching security questions:", error);
      return [];
    }
  }

  async getById(id: number): Promise<SecurityQuestion | null> {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching security question by ID:", error);
      return null;
    }
  }

  async create(question: Omit<SecurityQuestion, "id">): Promise<SecurityQuestion | null> {
    try {
      const response = await api.post(API_URL, question);
      return response.data;
    } catch (error) {
      console.error("Error creating security question:", error);
      return null;
    }
  }

  async update(id: number, question: Partial<SecurityQuestion>): Promise<SecurityQuestion | null> {
    try {
      const response = await api.put(`${API_URL}/${id}`, question);
      return response.data;
    } catch (error) {
      console.error("Error updating security question:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await api.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting security question:", error);
      return false;
    }
  }
}
export const securityQuestionService = new SecurityQuestionService();


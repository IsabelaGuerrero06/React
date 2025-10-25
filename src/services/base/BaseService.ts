// Clase genérica que implementa la interfaz anterior usando HttpClient.
//Cualquier entidad (usuarios, sesiones, perfiles…) puede heredarla.
import axios, { AxiosResponse } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = `${API_URL}${endpoint}`;
  }

  async getAll(path: string = ""): Promise<T[]> {
    const res: AxiosResponse<T[]> = await axios.get(`${this.endpoint}${path}`);
    return res.data;
  }

  async getById(id: number): Promise<T> {
    const res: AxiosResponse<T> = await axios.get(`${this.endpoint}/${id}`);
    return res.data;
  }

  async create(data: any): Promise<T> {
    const res: AxiosResponse<T> = await axios.post(this.endpoint, data);
    return res.data;
  }

  async update(id: number, data: any): Promise<T> {
    const res: AxiosResponse<T> = await axios.put(`${this.endpoint}/${id}`, data);
    return res.data;
  }

  async delete(pathOrId: number | string): Promise<void> {
    await axios.delete(`${this.endpoint}/${pathOrId}`);
  }
}
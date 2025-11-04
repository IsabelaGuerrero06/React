// src/services/addressService.ts
import { httpClient } from "./http/HttpClient";

export interface Address {
  id?: number;
  street: string;
  number: string;
  latitude?: number;
  longitude?: number;
  userId?: number;
}

class AddressService {
  private endpoint = "/addresses";
  // Many backend routes are mounted under /api — keep consistency with other services
  // e.g., userService uses `${VITE_API_URL}/api/users`
  private apiPrefix = "/api";
  private get fullEndpoint() {
    return `${this.apiPrefix}${this.endpoint}`;
  }

  // Obtener dirección por ID de usuario
  async getAddressByUserId(userId: number): Promise<Address | null> {
    try {
  const data = await httpClient.get<Address>(`${this.fullEndpoint}/user/${userId}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Usuario no tiene dirección
      }
      console.error("Error fetching address:", error);
      throw error;
    }
  }

  // Obtener dirección por ID
  async getAddressById(id: number): Promise<Address | null> {
    try {
  const data = await httpClient.get<Address>(`${this.fullEndpoint}/${id}`);
      return data;
    } catch (error: any) {
      console.error("Error fetching address:", error);
      return null;
    }
  }

  // Crear dirección
  async createAddress(userId: number, address: Omit<Address, 'id' | 'userId'>): Promise<Address | null> {
    try {
      // Try multiple common backend patterns for creating a user-scoped address.
      // Primary: /api/addresses/user/{userId}
      // Alternative: /api/users/{userId}/addresses
      // Fallback: /api/addresses (with userId in body)

      const candidates = [
        `${this.fullEndpoint}/user/${userId}`,
        `${this.apiPrefix}/users/${userId}${this.endpoint}`,
        `${this.fullEndpoint}`,
      ];

      let lastError: any = null;
      for (const url of candidates) {
        try {
          console.debug(`AddressService.createAddress trying POST ${url}`);
          // If posting to the generic /api/addresses, include userId in the body
          const payload = url === this.fullEndpoint ? { ...address, userId } : { ...address };
          const data = await httpClient.post<Address>(url, payload);
          console.debug(`AddressService.createAddress success at ${url}`, data);
          return data;
        } catch (err: any) {
          lastError = err;
          // If 404, try the next candidate; otherwise rethrow after trying candidates
          if (err?.response?.status === 404) {
            console.warn(`AddressService.createAddress got 404 at ${url}, trying next candidate`);
            continue;
          }
          console.error(`AddressService.createAddress error posting to ${url}:`, err);
          throw err;
        }
      }

      // If we exhausted candidates, rethrow the last error (likely 404)
      console.error('AddressService.createAddress: all attempts failed', lastError);
      throw lastError;
    } catch (error: any) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  // Actualizar dirección
  async updateAddress(id: number, address: Partial<Address>): Promise<Address | null> {
    try {
  const data = await httpClient.put<Address>(`${this.fullEndpoint}/${id}`, address);
      return data;
    } catch (error: any) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  // Eliminar dirección
  async deleteAddress(id: number): Promise<boolean> {
    try {
  await httpClient.delete<boolean>(`${this.fullEndpoint}/${id}`);
      return true;
    } catch (error: any) {
      console.error("Error deleting address:", error);
      return false;
    }
  }
}

export const addressService = new AddressService();
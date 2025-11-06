import { Password } from "../models/Password";

const STORAGE_KEY = "app_passwords";

class PasswordService {
  private loadAll(): Password[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Password[];
    } catch (e) {
      console.error("Error cargando passwords desde localStorage", e);
      return [];
    }
  }

  private saveAll(items: Password[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async getPasswordsByUser(userId: number): Promise<Password[]> {
    const items = this.loadAll();
    return items.filter((p) => p.userId === userId);
  }

  async createPassword(
    userId: number, 
    cont: string, 
    startAt: string, 
    endAt: string
  ): Promise<Password> {
    const items = this.loadAll();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

    const newPassword: Password = {
      id: nextId,
      userId,
      cont,
      startAt: startAt, // Ahora usa la fecha proporcionada
      endAt: endAt,     // Ahora usa la fecha proporcionada
    };

    items.push(newPassword);
    this.saveAll(items);
    return newPassword;
  }

  async deletePassword(id: number): Promise<boolean> {
    try {
      const items = this.loadAll();
      const filtered = items.filter((p) => p.id !== id);
      this.saveAll(filtered);
      return true;
    } catch (e) {
      console.error("Error eliminando password", e);
      return false;
    }
  }
}

export const passwordService = new PasswordService();
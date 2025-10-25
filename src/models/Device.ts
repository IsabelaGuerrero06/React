import { User } from "./User";

export interface Device {
  id?: number;
  name?: string;
  ip?: string;
  operating_system?: string;
  user?: User; // Relación N a 1 con User
}

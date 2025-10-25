import { User } from "./User";

export interface DigitalSignature {
  id?: number;
  photo?: string; // imagen o firma digital
  user?: User; // Relación 1 a 1 con User
}

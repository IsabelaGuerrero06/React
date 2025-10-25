import { Answer } from "./Answer";

export interface SecurityQuestion {
  id?: number;
  name?: string;
  description?: string;
  answers?: Answer[]; // Relación 1 a N con Answer
}

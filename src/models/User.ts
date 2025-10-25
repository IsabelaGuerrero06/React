import { Session } from "./Session";
import { Device } from "./Device";
import { DigitalSignature } from "./DigitalSignature";
import { Answer } from "./Answer";

export interface User {
  id?: number;
  name?: string;
  email?: string;
  
  // Relaciones
  session?: Session[];
  devices?: Device[];
  digitalSignature?: DigitalSignature;
  answers?: Answer[];
}

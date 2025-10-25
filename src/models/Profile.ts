export interface Profile {
  id?: number;
  userId: number;          // relación 1:1 con User
  fullName: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  about?: string;
  createdAt?: string;
  updatedAt?: string;
}

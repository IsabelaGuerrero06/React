export interface Profile {
  id?: number;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  email?: string;
  avatarUrl?: string;
  about?: string;
  createdAt?: string;
  updatedAt?: string;
}
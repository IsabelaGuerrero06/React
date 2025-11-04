export interface Password {
  id: number;
  userId: number;
  cont: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
}

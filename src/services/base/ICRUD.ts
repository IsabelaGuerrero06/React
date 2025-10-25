// operaciones CRUD genéricas.
export interface ICRUD<T> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: T): Promise<T>;
  update(id: number, data: T): Promise<T>;
  delete(id: number): Promise<void>;
}

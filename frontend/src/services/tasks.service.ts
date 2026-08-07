import api from "./api";
import type { Task, CreateTaskDTO, UpdateTaskDTO } from "../types";

export const tasksService = {
  getAll: () => api.get<Task[]>("/tasks"),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: CreateTaskDTO) => api.post<Task>("/tasks", data),
  update: (id: number, data: UpdateTaskDTO) => api.put(`/tasks/${id}`, data),
  remove: (id: number) => api.delete<number>(`/tasks/${id}`),
};

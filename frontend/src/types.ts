export interface Task {
  id: number;
  title: string;
  description: string;
  column_type: number;
  column_position: number;
  tag: string;
  priority: number;
  due_date: string;
  completed: boolean;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  column_type: number;
  column_position: number;
  tag: string;
  priority: number;
  due_date: string;
  completed: boolean;
}

export interface UpdateTaskDTO {
  title: string;
  description: string;
  column_type: number;
  column_position: number;
  tag: string;
  priority: number;
  due_date: string;
  completed: boolean;
}

export interface ErrorResponse {
  message: string;
}

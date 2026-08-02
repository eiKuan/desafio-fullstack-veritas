package services

import (
	"backend/model"
	"backend/repository"
)

type TaskService struct {
	repository repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return TaskService{
		repository: repo,
	}
}

func (ts *TaskService) GetTasks() ([]model.Task, error) {
	return ts.repository.GetTasks()
}

// func (ts *)

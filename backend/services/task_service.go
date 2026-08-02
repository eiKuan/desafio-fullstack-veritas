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

func (ts *TaskService) CreateTask(task model.Task) (model.Task, error) {

	taskId, err := ts.repository.CreateTask(task)

	if err != nil {
		return model.Task{}, err
	}

	task.Id = taskId

	return task, nil
}

func (ts *TaskService) GetTaskById(taskId int64) (*model.Task, error) {

	task, err := ts.repository.GetTaskById(taskId)
	if err != nil {
		return nil, err
	}

	return task, nil
}

func (ts *TaskService) DeleteTaskById(taskId int64) error {

	err := ts.repository.DeleteTaskById(taskId)
	if err != nil {
		return err
	}

	return nil
}

func (ts *TaskService) UpdateTask(task model.Task) error {

	err := ts.repository.UpdateTask(task)
	if err != nil {
		return err
	}

	return nil
}

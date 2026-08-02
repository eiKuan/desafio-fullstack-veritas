package repository

import (
	"backend/model"
	"database/sql"
	"fmt"
)

type TaskRepository struct {
	connection *sql.DB
}

func NewTaskRepository(connection *sql.DB) TaskRepository {
	return TaskRepository{
		connection: connection,
	}
}

func (ts *TaskRepository) GetTasks() ([]model.Task, error) {

	query := "SELECT * FROM tasks"
	rows, err := ts.connection.Query(query)
	if err != nil {
		fmt.Println(err)
		return []model.Task{}, err
	}

	var taskList []model.Task
	var taskObj model.Task

	for rows.Next() {
		err = rows.Scan(
			&taskObj.Id,
			&taskObj.Title,
			&taskObj.Description,
			&taskObj.Column_Type,
			&taskObj.Column_Position,
			&taskObj.Tag,
			&taskObj.Priority,
			&taskObj.Due_Date,
			&taskObj.Completed)

		if err != nil {
			fmt.Println(err)
			return []model.Task{}, err
		}

		taskList = append(taskList, taskObj)
	}

	rows.Close()

	return taskList, nil
}

func (ts *TaskRepository) CreateTask(task model.Task) (int64, error) {
	query, err := ts.connection.Prepare(`
		INSERT INTO tasks
		(title, description, column_type, column_position, tag, priority, due_date, completed)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}

	defer query.Close()

	result, err := query.Exec(
		task.Title,
		task.Description,
		task.Column_Type,
		task.Column_Position,
		task.Tag,
		task.Priority,
		task.Due_Date,
		task.Completed,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

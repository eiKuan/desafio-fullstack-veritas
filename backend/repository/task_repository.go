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
			&taskObj.Tag,
			&taskObj.Priority,
			&taskObj.Due_Date,
			&taskObj.Completed,
			&taskObj.Column_Position)

		if err = rows.Err(); err != nil {
			fmt.Println(err)
			rows.Close()
			return []model.Task{}, err
		}

		taskList = append(taskList, taskObj)
	}

	rows.Close()

	return taskList, nil
}

func (ts *TaskRepository) CreateTask(task model.Task) (int64, error) {
	query, err := ts.connection.Prepare("INSERT INTO tasks " +
		"(title, description, column_type, column_position, tag, priority, due_date, completed) " +
		"VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
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

func (ts *TaskRepository) GetTaskById(taskId int64) (*model.Task, error) {

	query, err := ts.connection.Prepare("SELECT * FROM tasks WHERE id = ?")

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	defer query.Close()

	var task model.Task

	err = query.QueryRow(taskId).Scan(
		&task.Id,
		&task.Title,
		&task.Description,
		&task.Column_Type,
		&task.Tag,
		&task.Priority,
		&task.Due_Date,
		&task.Completed,
		&task.Column_Position,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	defer query.Close()
	return &task, nil
}

func (ts *TaskRepository) DeleteTaskById(taskId int64) error {
	query, err := ts.connection.Prepare("DELETE FROM tasks WHERE id = ?")

	if err != nil {
		fmt.Println(err)
		return err
	}

	defer query.Close()

	result, err := query.Exec(taskId)

	if err != nil {
		fmt.Println(err)
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (ts *TaskRepository) UpdateTask(task model.Task) error {
	query, err := ts.connection.Prepare("UPDATE tasks SET " +
		"TITLE = ?, DESCRIPTION = ?, COLUMN_TYPE = ?, TAG  = ?, PRIORITY = ?, " +
		"DUE_DATE = ?, COMPLETED = ?, COLUMN_POSITION = ? WHERE ID = ?")

	if err != nil {
		fmt.Println(err)
		return err
	}

	defer query.Close()

	result, err := query.Exec(
		task.Title,
		task.Description,
		task.Column_Type,
		task.Tag,
		task.Priority,
		task.Due_Date,
		task.Completed,
		task.Column_Position,
		task.Id,
	)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return err
	}

	return nil
}

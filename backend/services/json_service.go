package services

import (
	"backend/model"
	"encoding/json"
	"os"
)

type JsonService struct{}

func (j JsonService) SaveTasks(tasks []model.Task) error {
	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile("/app/storage/tasks.json", data, 0644)
}

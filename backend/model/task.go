package model

import "time"

type Task struct {
	Id              int64     `json:"id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Column_Type     int8      `json:"column_type"`
	Column_Position int16     `json:"column_position"`
	Tag             string    `json:"tag"`
	Priority        int8      `json:"priority"`
	Due_Date        time.Time `json:"due_date"`
	Completed       bool      `json:"completed"`
}

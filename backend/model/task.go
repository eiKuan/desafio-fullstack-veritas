package model

type Task struct {
	Id              int    `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	Column_Type     int8   `json:"column_type"`
	Column_Position int16  `json:"column_position"`
	Tag             string `json:"tag"`
	Priority        int8   `json:"priority"`
	Due_Date        Date   `json:"due_date"`
	Completed       bool   `json:"completed"`
}

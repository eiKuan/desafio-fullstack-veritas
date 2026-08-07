package db

import (
	"database/sql"
	"time"
)

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    column_type TINYINT,
    tag VARCHAR(15),
    priority TINYINT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    Column_Position INT
);
`

func InitDB(db *sql.DB) error {

	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			break
		}

		time.Sleep(time.Second)
	}

	if err := db.Ping(); err != nil {
		return err
	}

	_, err := db.Exec(createTasksTableSQL)
	return err
}

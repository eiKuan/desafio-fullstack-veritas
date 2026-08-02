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
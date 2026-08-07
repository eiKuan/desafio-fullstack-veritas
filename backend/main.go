package main

import (
	"backend/db"
	"backend/handlers"
	"backend/middleware"
	"backend/repository"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func main() {

	server := gin.Default()

	// Middleware
	server.Use(middleware.CORSMiddleware())

	// Init DB
	dbConnection, err := db.ConnectDB()
	if err != nil {
		panic(err)
	}

	if err := db.InitDB(dbConnection); err != nil {
		panic(err)
	}

	// Repositories
	TaskRepository := repository.NewTaskRepository(dbConnection)

	// Services (usecases)
	JsonService := services.JsonService{}
	TaskService := services.NewTaskService(TaskRepository, JsonService)

	// Handlers (controllers)

	// Endpoints
	taskHandler := handlers.NewTaskHandler(TaskService)

	server.GET("/tasks", taskHandler.GetTasks)

	server.GET("/tasks/:taskId", taskHandler.GetTaskById)

	server.POST("/tasks", taskHandler.CreateTask)

	server.PUT("/tasks/:taskId", taskHandler.UpdateTask)

	server.DELETE("/tasks/:taskId", taskHandler.DeleteTaskById)

	server.Run(":8080")
}

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

	// Repositories
	TaskRepository := repository.NewTaskRepository(dbConnection)
	// Services (usecases)
	TaskService := services.NewTaskService(TaskRepository)

	// Handlers (controllers)

	// Endpoints
	taskHandler := handlers.NewTaskHandler(TaskService)

	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	server.GET("/tasks", taskHandler.GetTasks)

	server.GET("/tasks/:taskId", taskHandler.GetTaskById)

	server.POST("/tasks", taskHandler.CreateTask)

	server.PUT("/tasks/:taskId", taskHandler.UpdateTask)

	server.DELETE("/tasks/:taskId", taskHandler.DeleteTaskById)

	server.Run(":8080")
}

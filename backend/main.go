package main

import (
	// "backend/db"

	"backend/db"
	"backend/handlers"
	"backend/repository"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func main() {

	server := gin.Default()

	//init db
	dbConnection, err := db.ConnectDB()
	if err != nil {
		panic(err)
	}

	//repositories
	TaskRepository := repository.NewTaskRepository(dbConnection)
	//services (usecases)
	TaskService := services.NewTaskService(TaskRepository)

	//handlers (controller)
	taskHandler := handlers.NewTaskHandler(TaskService)

	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	server.GET("/tasks", taskHandler.GetTasks)

	server.Run(":8000")
}

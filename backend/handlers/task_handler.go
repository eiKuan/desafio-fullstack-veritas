package handlers

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type taskHandler struct {
	taskService services.TaskService
}

func NewTaskHandler(service services.TaskService) taskHandler {
	return taskHandler{
		taskService: service,
	}
}

func (t *taskHandler) GetTasks(ctx *gin.Context) {

	tasks, err := t.taskService.GetTasks()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
	}
	ctx.JSON(http.StatusOK, tasks)
}

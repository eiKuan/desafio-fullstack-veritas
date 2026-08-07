package handlers

import (
	"backend/model"
	"backend/services"
	"net/http"
	"strconv"

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

func (t *taskHandler) CreateTask(ctx *gin.Context) {

	var task model.Task
	err := ctx.BindJSON(&task)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, err)
	}

	insertedTask, err := t.taskService.CreateTask(task)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusCreated, insertedTask)

}

func (t *taskHandler) GetTaskById(ctx *gin.Context) {

	id := ctx.Param("taskId")

	if id == "" {
		response := model.Response{
			Message: "Task Id can't be null",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return
	}

	taskId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		response := model.Response{
			Message: "Task Id must be a number",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return
	}

	task, err := t.taskService.GetTaskById(taskId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	if task == nil {
		response := model.Response{
			Message: "Task not found in the DataBase",
		}
		ctx.JSON(http.StatusNotFound, response)
		return
	}

	ctx.JSON(http.StatusOK, task)
}

func (t *taskHandler) DeleteTaskById(ctx *gin.Context) {

	id := ctx.Param("taskId")

	if id == "" {
		response := model.Response{
			Message: "Task Id can't be null",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return
	}

	taskId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		response := model.Response{
			Message: "Task Id must be a number",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return
	}

	err = t.taskService.DeleteTaskById(taskId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, taskId)
}

func (t *taskHandler) UpdateTask(ctx *gin.Context) {

	id := ctx.Param("taskId")

	taskId, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		response := model.Response{
			Message: "Task Id must be a number",
		}
		ctx.JSON(http.StatusBadRequest, response)
		return
	}

	var task model.Task

	err = ctx.BindJSON(&task)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}

	task.Id = taskId

	err = t.taskService.UpdateTask(task)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	ctx.Status(http.StatusNoContent)
}

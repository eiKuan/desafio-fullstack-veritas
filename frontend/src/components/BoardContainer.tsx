import { useRef, useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { nextColumnPosition, COLUMN_TYPE } from "../utils/task";
import { useDragDrop } from "../contexts/DragDropContext";
import KanbanBoard from "./KanbanBoard";
import MascotLayer from "./MascotLayer";
import TaskFormModal from "./TaskFormModal";
import DragGhost from "./DragGhost";
import type { Task, CreateTaskDTO, UpdateTaskDTO } from "../types";

export default function BoardContainer() {
  const { data: tasks, isLoading, isError, error } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { draggingTask, setDraggingTask, setDragOverTarget, isDragging, dragOverTarget } =
    useDragDrop();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addColumn, setAddColumn] = useState<number>(COLUMN_TYPE.TODO);

  const pendingDeleteIdRef = useRef<number | null>(null);

  function handleAddTask(columnType: number) {
    setEditingTask(null);
    setAddColumn(columnType);
    setModalOpen(true);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setAddColumn(task.column_type);
    setModalOpen(true);
  }

  function handleModalSubmit(data: CreateTaskDTO | UpdateTaskDTO) {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, dto: data as UpdateTaskDTO });
    } else {
      const newTask = {
        ...data,
        column_type: addColumn,
        column_position: nextColumnPosition(tasks, addColumn),
      } as CreateTaskDTO;
      createTask.mutate(newTask);
    }
    setModalOpen(false);
  }

  // toPosition is 0-indexed (matches CardList's dragOverTarget.position).
  function handleMoveTask(taskId: number, toColumn: number, toPosition: number) {
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;

    const columnTasks = (tasks ?? [])
      .filter((t) => t.column_type === toColumn && t.id !== taskId)
      .sort((a, b) => a.column_position - b.column_position);

    const clampedPos = Math.max(0, Math.min(toPosition, columnTasks.length));

    // Insert the moved task into the ordered list so siblings' new
    // 1-indexed positions can be computed relative to it, then update
    // it separately below.
    columnTasks.splice(clampedPos, 0, { ...task, column_type: toColumn });

    columnTasks.forEach((t, idx) => {
      if (t.id === taskId) return;
      if (t.column_position === idx + 1) return; // position unchanged, skip write
      updateTask.mutate({
        id: t.id,
        dto: {
          title: t.title,
          description: t.description,
          column_type: toColumn,
          column_position: idx + 1,
          tag: t.tag,
          priority: t.priority,
          due_date: t.due_date,
          completed: toColumn === COLUMN_TYPE.FINISHED,
        },
      });
    });

    const newPos = clampedPos + 1;
    const updated: UpdateTaskDTO = {
      title: task.title,
      description: task.description,
      column_type: toColumn,
      column_position: newPos,
      tag: task.tag,
      priority: task.priority,
      due_date: task.due_date,
      completed: toColumn === COLUMN_TYPE.FINISHED,
    };
    updateTask.mutate({ id: taskId, dto: updated });
  }

  function handleDeleteTask(taskId: number) {
    deleteTask.mutate(taskId);
  }

  function handleMascotDrop() {
    if (draggingTask) {
      handleDeleteTask(draggingTask.id);
      pendingDeleteIdRef.current = null;
    }
    setDragOverTarget(null);
    setDraggingTask(null);
  }

  function handleMascotEatComplete() {
    pendingDeleteIdRef.current = null;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen" style={{ paddingTop: 20 }}>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOverTarget({ type: "mascot" });
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleMascotDrop();
        }}
        className="relative z-50"
        style={{ pointerEvents: "auto", marginBottom: -160 }}
      >
        <MascotLayer
          isDragging={isDragging}
          isDragOverMascot={dragOverTarget?.type === "mascot"}
          onAnimationEnd={handleMascotEatComplete}
        />
      </div>

      {isLoading && (
        <p className="text-amber-200/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Carregando tasks…
        </p>
      )}
      {isError && (
        <p className="text-red-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-md">
          {(error as Error)?.message ?? "Erro ao carregar tasks."}
        </p>
      )}

      {!isLoading && !isError && (
        <KanbanBoard
          tasks={tasks ?? []}
          onMoveTask={handleMoveTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          onAddTask={handleAddTask}
        />
      )}

      <DragGhost task={draggingTask ?? (tasks?.[0] as Task)} />

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingTask={editingTask}
        columnType={addColumn}
        columnPosition={nextColumnPosition(tasks, addColumn)}
      />
    </div>
  );
}
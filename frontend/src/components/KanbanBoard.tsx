import { motion } from "framer-motion";
import { useRef } from "react";
import kanbanFrame from "../assets/kanbanFrame.png";
import { COLUMN_TYPE } from "../utils/task";
import { useDragDrop, type DragDropTarget } from "../contexts/DragDropContext";
import type { Task } from "../types";
import CardList from "./CardList";
import AddCardInput from "./AddCardInput";

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: number, toColumn: number, toPosition: number) => void;
  onDeleteTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (columnType: number) => void;
}

const COLUMNS = [
  { type: COLUMN_TYPE.TODO },
  { type: COLUMN_TYPE.IN_PROGRESS },
  { type: COLUMN_TYPE.FINISHED },
];

export default function KanbanBoard({
  tasks,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
}: KanbanBoardProps) {
  return (
    <div className="relative mx-auto w-[1100px] max-w-full">
      <img
        src={kanbanFrame}
        alt="Kanban Board"
        className="w-full select-none pointer-events-none"
        draggable={false}
      />
      <div
        className="absolute inset-0 flex justify-between"
        style={{ paddingTop: 115, paddingBottom: 100, paddingLeft: 55, paddingRight: 55 }}
      >
        {COLUMNS.map((col) => (
          <Column
            key={col.type}
            columnType={col.type}
            tasks={tasks.filter((t) => t.column_type === col.type)}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
            showAddCard={col.type === COLUMN_TYPE.TODO}
          />
        ))}
      </div>
    </div>
  );
}

interface ColumnProps {
  columnType: number;
  tasks: Task[];
  onMoveTask: (taskId: number, toColumn: number, toPosition: number) => void;
  onDeleteTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (columnType: number) => void;
  showAddCard: boolean;
}

// Used once, at drop time: precise, DOM-scan based (fine to reflect
// whatever the user currently sees).
function computeDropIndex(
  clientY: number,
  container: HTMLElement | null,
  draggingId: number,
  tasks: Task[]
): number {
  if (!container) return tasks.length;
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>("[data-card-id]")
  );
  for (let i = 0; i < cards.length; i++) {
    const cardId = Number(cards[i].dataset.cardId);
    if (cardId === draggingId) continue;
    const rect = cards[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (clientY < midY) {
      const task = tasks.find((t) => t.id === cardId);
      const taskIndex = task ? tasks.indexOf(task) : i;
      return taskIndex;
    }
  }
  return tasks.length;
}

// Used continuously, while hovering: purely arithmetic (container's own
// top + a sampled card height) so it stays stable regardless of any
// live re-render happening in the list underneath it.
function computeLiveDropIndex(
  clientY: number,
  container: HTMLElement | null,
  taskCount: number
): number {
  if (!container) return taskCount;
  const sample = container.querySelector<HTMLElement>("[data-card-id]");
  const cardHeight = sample?.offsetHeight ?? 0;
  if (cardHeight <= 0) return taskCount;
  const rect = container.getBoundingClientRect();
  const relativeY = clientY - rect.top + container.scrollTop;
  const idx = Math.round(relativeY / cardHeight);
  return Math.max(0, Math.min(idx, taskCount));
}

// Render-only: what this column's list would look like if the drop
// happened right now. Never touches real data — CardList just renders
// whatever comes out of this, and its own FLIP effect animates the
// transition. Only handles reordering WITHIN the same column; a
// cross-column drag doesn't reshuffle the target column's cards (it
// still gets the amber highlight), keeping this safe and simple.
function computeDisplayTasks(
  tasks: Task[],
  draggingTask: Task | null,
  dragOverTarget: DragDropTarget | null,
  columnType: number
): Task[] {
  if (
    !draggingTask ||
    draggingTask.column_type !== columnType ||
    dragOverTarget?.type !== "column" ||
    dragOverTarget.columnType !== columnType ||
    dragOverTarget.position == null
  ) {
    return tasks;
  }

  const base = tasks.filter((t) => t.id !== draggingTask.id);
  const clamped = Math.max(0, Math.min(dragOverTarget.position, base.length));
  return [...base.slice(0, clamped), draggingTask, ...base.slice(clamped)];
}

function Column({
  columnType,
  tasks,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
  showAddCard,
}: ColumnProps) {
  const { setDraggingTask, setDragOverTarget, draggingTask, dragOverTarget } =
    useDragDrop();
  const listRef = useRef<HTMLDivElement>(null);

  const isDropTarget =
    draggingTask !== null &&
    dragOverTarget?.type === "column" &&
    dragOverTarget.columnType === columnType;

  const displayTasks = computeDisplayTasks(tasks, draggingTask, dragOverTarget, columnType);

  return (
    <motion.div
      layout
      className="flex w-[300px] flex-col gap-1 overflow-hidden rounded-lg transition-colors duration-150"
      animate={{
        backgroundColor: isDropTarget
          ? "rgba(120, 53, 15, 0.15)"
          : "rgba(0, 0, 0, 0)",
        boxShadow: isDropTarget
          ? "inset 0 0 20px rgba(251, 191, 36, 0.2)"
          : "inset 0 0 0px rgba(0, 0, 0, 0)",
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOverTarget({ type: "column", columnType });
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!draggingTask) return;

        const idx = computeLiveDropIndex(e.clientY, listRef.current, tasks.length);
        if (
          dragOverTarget?.type === "column" &&
          dragOverTarget.columnType === columnType &&
          dragOverTarget.position === idx
        ) {
          return; // no change — skip the re-render
        }
        setDragOverTarget({ type: "column", columnType, position: idx });
      }}
      onDragLeave={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (draggingTask) {
          const dropIndex =
            dragOverTarget?.type === "column" && dragOverTarget.columnType === columnType
              ? dragOverTarget.position ??
                computeDropIndex(e.clientY, listRef.current, draggingTask.id, tasks)
              : computeDropIndex(e.clientY, listRef.current, draggingTask.id, tasks);
          onMoveTask(draggingTask.id, columnType, dropIndex);
        }
        setDragOverTarget(null);
        setDraggingTask(null);
      }}
    >
      <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-amber-900/50">
        {showAddCard && tasks.length === 0 && (
          <AddCardInput onClick={() => onAddTask(columnType)} />
        )}
        <CardList
          tasks={displayTasks}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
        {showAddCard && tasks.length > 0 && (
          <div className="mt-2">
            <AddCardInput onClick={() => onAddTask(columnType)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
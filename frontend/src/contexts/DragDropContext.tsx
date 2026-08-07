import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Task } from "../types";

export type DragDropTargetType = "column" | "mascot";

export interface DragDropTarget {
  type: DragDropTargetType;
  columnType?: number;
  position?: number;
}

interface DragDropContextValue {
  draggingTask: Task | null;
  dragOverTarget: DragDropTarget | null;
  setDraggingTask: (task: Task | null) => void;
  setDragOverTarget: (target: DragDropTarget | null) => void;
  isDragging: boolean;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<DragDropTarget | null>(null);

  return (
    <DragDropContext.Provider
      value={{
        draggingTask,
        dragOverTarget,
        setDraggingTask,
        setDragOverTarget,
        isDragging: draggingTask !== null,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const ctx = useContext(DragDropContext);
  if (!ctx) throw new Error("useDragDrop must be used within DragDropProvider");
  return ctx;
}

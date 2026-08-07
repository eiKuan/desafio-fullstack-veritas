import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Task } from "../types";
import { PRIORITY, COLUMN_TYPE, isNoDate, colorForTag } from "../utils/task";
import { useDragDrop } from "../contexts/DragDropContext";
import cardImg from "../assets/cards/card.png";
import lowPriorityIcon from "../assets/icons/lowPriorityIcon.png";
import mediumPriorityIcon from "../assets/icons/mediumPriorityIcon.png";
import highPriorityIcon from "../assets/icons/highPriorityIcon.png";
import completedIcon from "../assets/icons/completedIcon.png";

const TRANSPARENT_DRAG_IMAGE_DATA_URL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

interface CardProps {
  task: Task;
  onDeleteTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
}

function getPriorityIcon(task: Task): string {
  if (task.column_type === COLUMN_TYPE.FINISHED || task.completed) {
    return completedIcon;
  }
  switch (task.priority) {
    case PRIORITY.LOW:
      return lowPriorityIcon;
    case PRIORITY.MEDIUM:
      return mediumPriorityIcon;
    case PRIORITY.HIGH:
      return highPriorityIcon;
    default:
      return lowPriorityIcon;
  }
}

function formatDate(iso: string): string {
  if (isNoDate(iso)) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function calculateDaysRemaining(iso: string): string {
  if (isNoDate(iso)) return "";
  const dueDate = new Date(iso);
  if (isNaN(dueDate.getTime())) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "0d";
  return `${diffDays}d`;
}

export default function Card({ task, onEditTask }: CardProps) {
  const { setDraggingTask, setDragOverTarget } = useDragDrop();
  const [isDragging, setIsDragging] = useState(false);
  const transparentImgRef = useRef<HTMLImageElement | null>(null);
  if (!transparentImgRef.current && typeof document !== "undefined") {
    const img = new Image();
    img.src = TRANSPARENT_DRAG_IMAGE_DATA_URL;
    img.width = 1;
    img.height = 1;
    transparentImgRef.current = img;
  }

  const priorityIcon = getPriorityIcon(task);
  const dateText = formatDate(task.due_date);
  const daysRemaining = calculateDaysRemaining(task.due_date);
  const tagBackgroundColor = colorForTag(task.tag);

  return (
    <motion.div
      draggable
      onDragStartCapture={(e) => {
        setDraggingTask(task);
        setIsDragging(true);
        (e as unknown as React.DragEvent).dataTransfer.effectAllowed = "move";
        if (transparentImgRef.current) {
          (e as unknown as React.DragEvent).dataTransfer.setDragImage(
            transparentImgRef.current,
            0,
            0,
          );
        }
      }}
      onDragEndCapture={() => {
        setDraggingTask(null);
        setDragOverTarget(null);
        setIsDragging(false);
      }}
      onDoubleClick={() => onEditTask(task)}
      className={`relative w-full cursor-grab select-none active:cursor-grabbing ${
        isDragging ? "opacity-55" : "opacity-100"
      }`}
      style={{
        aspectRatio: "310 / 220",
        width: "108%",
        marginLeft: "-3%",
        transformOrigin: "center center",
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <img
        src={cardImg}
        alt="Card background"
        className="absolute inset-0 h-full w-full object-fill rounded-md"
        draggable={false}
      />
      <div className="relative flex h-full flex-col overflow-hidden px-[17%] py-[13%]">
        {/* Priority icon - top right, absolute positioning */}
        <div className="absolute top-[17%] right-[14%] z-10">
          <img
            src={priorityIcon}
            alt="Prioridade"
            className="h-[44px] w-[40px] object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(41, 9, 9, 0.9))" }}
            draggable={false}
          />
        </div>

        {/* Title - constrained max-width, prevents overflow */}
        <div className="flex items-center justify-left mb-[3%] mt-[1%]">
          <h3
            className="text-[17px] font-extrabold text-left text-neutral-900 leading-tight"
            style={{
              maxWidth: "calc(108% - 50px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {task.title}
          </h3>
        </div>

        {/* Description - scrollable text box with proper padding and word-wrap */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        >
          <p className="text-[12.5px] mt-[0.5%] leading-relaxed text-neutral-830 text-justify pr-1">
            {task.description ?? ""}
          </p>
        </div>

        {/* Footer: tag (flexible, truncates) | date (fixed) | days (fixed) */}
        {(task.tag || dateText) && (
          <div className="flex items-center justify-between mt-[3%] gap-2">
            {/* Left: Tag - shrinks and truncates instead of overflowing */}
            <div className="flex min-w-0 flex-1 justify-center">
              {task.tag ? (
                <span
                  className="inline-block max-w-full truncate rounded-md px-2 py-1 text-[12px] font-semibold text-neutral-100 shadow-inner"
                  style={{ backgroundColor: tagBackgroundColor }}
                >
                  {task.tag}
                </span>
              ) : (
                <span />
              )}
            </div>

            {/* Center: Date - fixed width, always shown in full */}
            <div className="flex flex-1 items-center justify-center">
              {dateText && (
                <span className="flex items-center gap-0.5 whitespace-nowrap text-[12px] font-semibold text-neutral-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18M8 2v4M16 2v4" />
                  </svg>
                  {dateText}
                </span>
              )}
            </div>

            {/* Right: Days remaining with clock icon - fixed width, always shown in full */}
            <div className="flex flex items-center justify-center">
              {daysRemaining && (
                <span
                  className="flex items-center gap- whitespace-nowrap text-[14px] font-bold text-red-600"
                  style={{
                    color: "#dc2626",
                    textShadow:
                      "0 0 8px rgba(243, 193, 193, 0.95), 0 0 14px rgba(241, 118, 118, 0.6)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(233, 180, 180, 0.9))" }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {daysRemaining}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
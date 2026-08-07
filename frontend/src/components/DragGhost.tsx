import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Task } from "../types";
import { PRIORITY, COLUMN_TYPE, isNoDate } from "../utils/task";
import { useDragDrop } from "../contexts/DragDropContext";
import cardImg from "../assets/cards/card.png";
import lowPriorityIcon from "../assets/icons/lowPriorityIcon.png";
import mediumPriorityIcon from "../assets/icons/mediumPriorityIcon.png";
import highPriorityIcon from "../assets/icons/highPriorityIcon.png";
import completedIcon from "../assets/icons/completedIcon.png";

interface DragGhostProps {
  task: Task;
}

const GHOST_WIDTH = 280;

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

export default function DragGhost({ task }: DragGhostProps) {
  const { draggingTask } = useDragDrop();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleDragOver(e: DragEvent) {
      if (e.clientX === 0 && e.clientY === 0) return;
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function handleDragEnd() {
      setVisible(false);
    }
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  const currentTask = draggingTask ?? task;
  if (!draggingTask || !visible) return null;

  const priorityIcon = getPriorityIcon(currentTask);
  const dateText = formatDate(currentTask.due_date);
  const daysRemaining = calculateDaysRemaining(currentTask.due_date);

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: position.x - GHOST_WIDTH / 2,
        top: position.y - 100,
        width: GHOST_WIDTH,
        aspectRatio: "310 / 220",
        transformOrigin: "center center",
      }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{
        scale: [1, 1, 1],
        rotate: [-1, 1, -1],
        opacity: 0.7,
      }}
      transition={{
        scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.15 },
      }}
    >
      <img
        src={cardImg}
        alt=""
        className="absolute inset-0 h-full w-full object-fill rounded-md"
        draggable={false}
      />
      <div className="relative flex h-full flex-col overflow-hidden px-[17%] py-[13%]">
        <div className="absolute top-[15%] right-[14%] z-10">
          <img
            src={priorityIcon}
            alt=""
            className="h-[44px] w-[40px] object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.9))" }}
            draggable={false}
          />
        </div>

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
            {currentTask.title}
          </h3>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
        >
          <p className="text-[12px] mt-[0.5%] leading-relaxed text-neutral-830 text-justify pr-0">
            {currentTask.description ?? ""}
          </p>
        </div>

        {(currentTask.tag || dateText) && (
          <div className="flex items-center justify-between mt-[3%] gap-2.5">
            <div className="flex min-w-0 flex-1 justify-center">
              {currentTask.tag ? (
                <span className="inline-block max-w-full truncate rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-semibold text-neutral-100 shadow-inner">
                  {currentTask.tag}
                </span>
              ) : (
                <span />
              )}
            </div>

            <div className="flex flex-none items-center justify-center">
              {dateText && (
                <span className="flex items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-neutral-900">
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

            <div className="flex flex-none items-center justify-center">
              {daysRemaining && (
                <span
                  className="flex items-center gap-1 whitespace-nowrap text-[13px] font-bold"
                  style={{
                    color: "#dc2626",
                    textShadow:
                      "0 0 8px rgba(220, 38, 38, 0.95), 0 0 14px rgba(220, 38, 38, 0.6)",
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
                    style={{ filter: "drop-shadow(0 0 6px rgba(220, 38, 38, 0.9))" }}
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

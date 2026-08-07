import type { Task } from "../types";

export const COLUMN_TYPE = {
  TODO: 0,
  IN_PROGRESS: 1,
  FINISHED: 2,
} as const;

export const PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export const COLUMN_LABELS: Record<number, string> = {
  [COLUMN_TYPE.TODO]: "TO DO",
  [COLUMN_TYPE.IN_PROGRESS]: "IN PROGRESS",
  [COLUMN_TYPE.FINISHED]: "FINISHED",
};

export const PRIORITY_LABELS: Record<number, string> = {
  [PRIORITY.LOW]: "Baixa",
  [PRIORITY.MEDIUM]: "Média",
  [PRIORITY.HIGH]: "Alta",
};

export type ColumnType = (typeof COLUMN_TYPE)[keyof typeof COLUMN_TYPE];

export const NO_DATE_SENTINEL_ISO = "1900-01-01T00:00:00.000Z";

export function isNoDate(iso: string): boolean {
  if (!iso) return true;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return true;
  return date.getUTCFullYear() <= 1900;
}

export function toISOOrSentinel(value: string): string {
  return value ? new Date(value).toISOString() : NO_DATE_SENTINEL_ISO;
}

export function fromDateOrSentinel(iso: string): string {
  return isNoDate(iso) ? "" : iso;
}

const TAG_COLORS = [
  "#1f2937",
  "#3b1d2e",
  "#1e3a2f",
  "#2c1e1e",
  "#1a2a3a",
  "#3a2a1a",
  "#241a3a",
  "#1a3a3a",
  "#3a1a2a",
  "#2a3a1a",
];

export function colorForTag(tag: string): string {
  if (!tag) return TAG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

export interface NewTaskInput {
  title: string;
  description: string;
  tag: string;
  priority: number;
  due_date: string;
  column_type: number;
  column_position: number;
  completed: boolean;
}

export function sortTasksByPosition(a: Task, b: Task): number {
  return a.column_position - b.column_position;
}

export function tasksByColumn(tasks: Task[] | undefined): Record<number, Task[]> {
  const grouped: Record<number, Task[]> = {
    [COLUMN_TYPE.TODO]: [],
    [COLUMN_TYPE.IN_PROGRESS]: [],
    [COLUMN_TYPE.FINISHED]: [],
  };
  if (!tasks) return grouped;
  for (const t of tasks) {
    if (grouped[t.column_type]) grouped[t.column_type].push(t);
  }
  for (const key of Object.keys(grouped)) {
    grouped[Number(key)].sort(sortTasksByPosition);
  }
  return grouped;
}

export function nextColumnPosition(tasks: Task[] | undefined, columnType: number): number {
  if (!tasks) return 1;
  const inColumn = tasks.filter((t) => t.column_type === columnType);
  if (inColumn.length === 0) return 1;
  return Math.max(...inColumn.map((t) => t.column_position)) + 1;
}

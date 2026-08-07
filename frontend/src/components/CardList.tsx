import { useLayoutEffect, useRef } from "react";
import type { Task } from "../types";
import Card from "./Card";

interface CardListProps {
  tasks: Task[];
  onDeleteTask: (taskId: number) => void;
  onEditTask: (task: Task) => void;
}

/**
 * CardList with manual FLIP (First-Last-Invert-Play) animation.
 *
 * On every render where the task list changes, we:
 * 1. FIRST — capture positions of all card elements before update (via ref map)
 * 2. LAST — let React render the new layout
 * 3. INVERT — compute delta between old and new position, apply transform to make
 *    elements appear in their old position
 * 4. PLAY — animate the transform back to 0 (elements slide to new position)
 *
 * This makes neighboring cards slide smoothly instead of teleporting.
 *
 * Deliberately dumb: this component has no idea a drag is even happening.
 * The live "push" preview is produced by the caller (Column, in
 * KanbanBoard.tsx) computing what the reordered `tasks` array WOULD look
 * like and passing that in — this component just renders whatever array
 * it's given, and this FLIP effect animates the transition. That keeps
 * the animation logic in exactly one place instead of two systems
 * fighting over the same elements.
 */
export default function CardList({
  tasks,
  onDeleteTask,
  onEditTask,
}: CardListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevPositions = useRef<Map<number, DOMRect>>(new Map());

  // FIRST phase: capture positions before render commits new DOM
  // We do this in useLayoutEffect's cleanup (runs right before next layout effect)
  useLayoutEffect(() => {
    const positions = new Map<number, DOMRect>();
    itemRefs.current.forEach((el, id) => {
      positions.set(id, el.getBoundingClientRect());
    });
    prevPositions.current = positions;
  });

  // LAST + INVERT + PLAY phase: after DOM updates, compare and animate
  useLayoutEffect(() => {
    const prev = prevPositions.current;
    if (!prev || prev.size === 0) return;

    itemRefs.current.forEach((el, id) => {
      const oldRect = prev.get(id);
      if (!oldRect) return;

      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      if (dx === 0 && dy === 0) return;

      // INVERT: apply transform to make element appear at old position
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "none";
      el.style.zIndex = "10";

      // PLAY: animate transform back to 0
      // Force reflow to ensure the invert transform is applied
      void el.offsetHeight;

      el.style.transition = "transform 250ms ease-out";
      el.style.transform = "translate(0px, 0px)";

      // Cleanup after animation
      const cleanup = () => {
        el.style.transition = "";
        el.style.transform = "";
        el.style.zIndex = "";
        el.removeEventListener("transitionend", cleanup);
      };
      el.addEventListener("transitionend", cleanup, { once: true });

      // Fallback cleanup if transitionend doesn't fire
      setTimeout(cleanup, 350);
    });
  });

  function setItemRef(id: number, el: HTMLDivElement | null) {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }

  return (
    <div ref={containerRef} className="space-y-0 w-full">
      {tasks.map((task) => (
        <div
          key={task.id}
          ref={(el) => setItemRef(task.id, el)}
          data-card-id={task.id}
        >
          <Card
            task={task}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        </div>
      ))}
    </div>
  );
}
import { useEffect, useRef, useState, useCallback } from "react";
import idleWebm from "../assets/Animations/idleWebm.webm";
import eatingWebm from "../assets/Animations/eatingWebm.webm";

interface MascotLayerProps {
  isDragging: boolean;
  isDragOverMascot: boolean;
  onAnimationEnd?: () => void;
}

/**
 * Mascot animation logic:
 *
 * The mascot reacts ONLY when a card is being dragged AND the mouse is over the
 * mascot area (hover while dragging). Plain hover without dragging does NOT
 * trigger eating.
 *
 * Flow:
 * 1. User drags a card and mouse enters mascot area → hide idle, show eating,
 *    play from currentTime 0
 * 2. Eating plays until mid-point (duration / 2) → freeze (pause) while the
 *    card remains held over the mascot
 * 3. Mouse leaves mascot area (still dragging) OR card is dropped → resume
 *    eating from where it paused (mid-point)
 * 4. Eating plays second half to completion → onEnded: hide eating, show idle
 *
 * If the mouse leaves before mid-point, eating plays through without pausing.
 */
export default function MascotLayer({
  isDragging,
  isDragOverMascot,
  onAnimationEnd,
}: MascotLayerProps) {
  const idleRef = useRef<HTMLVideoElement>(null);
  const eatingRef = useRef<HTMLVideoElement>(null);
  const [showEating, setShowEating] = useState(false);
  const [showIdle, setShowIdle] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const phaseRef = useRef<"idle" | "eating-playing" | "eating-paused" | "eating-resuming">("idle");

  // Trigger: must be dragging a card AND (hovering mascot OR drag-over mascot)
  const triggerActive = isDragging && (isHovered || isDragOverMascot);

  // Keep idle looping when in idle phase
  useEffect(() => {
    if (showIdle) {
      const v = idleRef.current;
      if (!v) return;
      v.play().catch(() => {});
    }
  }, [showIdle]);

  const startEating = useCallback(() => {
    const eating = eatingRef.current;
    if (!eating) return;
    setShowIdle(false);
    setShowEating(true);
    eating.currentTime = 0;
    eating.play().catch(() => {});
    phaseRef.current = "eating-playing";
  }, []);

  const resumeEating = useCallback(() => {
    const eating = eatingRef.current;
    if (!eating) return;
    if (phaseRef.current === "eating-paused" || phaseRef.current === "eating-playing") {
      eating.play().catch(() => {});
      phaseRef.current = "eating-resuming";
    }
  }, []);

  // React to trigger changes
  useEffect(() => {
    if (triggerActive && phaseRef.current === "idle") {
      startEating();
    } else if (!triggerActive && (phaseRef.current === "eating-paused" || phaseRef.current === "eating-playing")) {
      resumeEating();
    }
  }, [triggerActive, startEating, resumeEating]);

  // Freeze eating at mid-point while trigger remains active
  function handleEatingTimeUpdate() {
    const eating = eatingRef.current;
    if (!eating) return;
    if (phaseRef.current !== "eating-playing") return;

    const mid = eating.duration / 2;
    if (eating.currentTime >= mid && triggerActive) {
      eating.pause();
      phaseRef.current = "eating-paused";
    }
  }

  // Eating finished naturally (second half played to end)
  function handleEatingEnded() {
    setShowEating(false);
    setShowIdle(true);
    phaseRef.current = "idle";
    onAnimationEnd?.();
    const idle = idleRef.current;
    if (idle) {
      idle.currentTime = 0;
      idle.play().catch(() => {});
    }
  }

  return (
    <div
      className="relative z-50 mx-auto flex justify-center"
      style={{ width: 400, height: 400 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IDLE */}
      <div
        className="absolute"
        style={{ width: 400, height: 250, top: 95, left: 0 }}
      >
        <video
          ref={idleRef}
          src={idleWebm}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute transition-opacity duration-300 ${
            showIdle ? "opacity-100" : "opacity-0"
          }`}
          style={{ pointerEvents: "none", objectFit: "fill", top: 0, left: 0, width: "100%", height: "100%" }}
        />
      </div>
      {/* EATING */}
      <div
        className="absolute"
        style={{ width: 415, height: 260, top: 97, left: 0 }}
      >
        <video
          ref={eatingRef}
          src={eatingWebm}
          muted
          playsInline
          onTimeUpdate={handleEatingTimeUpdate}
          onEnded={handleEatingEnded}
          className={`absolute transition-opacity duration-300 ${
            showEating ? "opacity-100" : "opacity-0"
          }`}
          style={{
            pointerEvents: "none",
            objectFit: "fill",
            top: 0,
            left: 2,
            width: "106%",
            height: "100%",
            transform: "translateY(-40px)",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  hasLeft?: boolean;
  hasRight?: boolean;
}

export default function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  hasLeft = false,
  hasRight = false,
}: SwipeContainerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const threshold = 80;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;
      const dx = e.touches[0].clientX - touchStart.x;
      const dy = e.touches[0].clientY - touchStart.y;

      // Only track horizontal swipes
      if (Math.abs(dx) > Math.abs(dy)) {
        // Resist at edges
        if ((dx > 0 && !hasRight) || (dx < 0 && !hasLeft)) {
          setOffset(dx * 0.3);
        } else {
          setOffset(dx * 0.6);
        }
      }
    },
    [touchStart, hasLeft, hasRight]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart) return;

    if (offset > threshold && hasRight && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -threshold && hasLeft && onSwipeLeft) {
      onSwipeLeft();
    }

    setOffset(0);
    setTouchStart(null);
    setSwiping(false);
  }, [offset, touchStart, hasLeft, hasRight, onSwipeLeft, onSwipeRight]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden touch-pan-y"
    >
      <div
        className="transition-transform"
        style={{
          transform: swiping ? `translateX(${offset}px)` : "translateX(0)",
          transitionDuration: swiping ? "0ms" : "200ms",
        }}
      >
        {children}
      </div>

      {/* Swipe hints */}
      {swiping && (
        <>
          {offset > 40 && hasRight && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted bg-card/80 rounded-full px-3 py-1">
              ← 上一周
            </div>
          )}
          {offset < -40 && hasLeft && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted bg-card/80 rounded-full px-3 py-1">
                下一周 →
            </div>
          )}
        </>
      )}
    </div>
  );
}

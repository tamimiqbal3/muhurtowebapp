"use client";

/**
 * MUHURTO plays its full motion design for everyone, by the owner's choice: many
 * Windows PCs ship with "Animation effects" off, which would otherwise silently
 * freeze every scene. To honour the OS setting again, return
 * `useReducedMotionOS()` from motion/react here and set MotionConfig back to "user".
 */
export function useReducedMotion(): boolean {
  return false;
}

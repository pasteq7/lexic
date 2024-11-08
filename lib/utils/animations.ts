export const ANIMATION_DURATION = 0.2;
export const FLIP_ANIMATION_DURATION = 500;
export const BOUNCE_ANIMATION_DURATION = 100;

export const getTileAnimationDelay = (index: number) => index * 0.1;

export const getTileAnimationConfig = (index: number) => ({
  flip: {
    duration: FLIP_ANIMATION_DURATION,
    delay: index * 100,
  },
  bounce: {
    duration: BOUNCE_ANIMATION_DURATION,
    type: "spring",
    stiffness: 200,
    damping: 15
  }
});

export const ANIMATIONS = {
  FLIP: {
    duration: 0.6,
    scale: [1, 1.1, 1],
    rotateX: [0, 90, 0],
  },
  SHAKE: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
  POP: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.15 },
  },
  BOUNCE: {
    y: [0, -20, 0],
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  },
  REVEAL: {
    initial: { opacity: 0, scale: 0.9 },
    animate: {  opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  TOAST: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 }
  }
};

export const KEYBOARD_ANIMATIONS = {
  PRESS: {
    scale: [1, 0.9, 1],
    transition: { duration: 0.1 }
  },
  CORRECT: {
    backgroundColor: ["#4b5563", "#22c55e"],
    transition: { duration: 0.5 }
  },
  PRESENT: {
    backgroundColor: ["#4b5563", "#eab308"],
    transition: { duration: 0.5 }
  },
  ABSENT: {
    backgroundColor: ["#4b5563", "#6b7280"],
    transition: { duration: 0.5 }
  }
};

export const MENU_ANIMATIONS = {
  CONTAINER: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  BUTTON: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  BUTTON_EXTRA: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

export const STATS_ANIMATIONS = {
  COUNT: {
    initial: { value: 0 },
    animate: { value: 1 },
    transition: { duration: 1, ease: "easeOut" }
  }
};

export const TITLE_ANIMATIONS = {
  CONTAINER: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
  },
  CELL: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: "backOut" }
  }
};

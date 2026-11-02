import { type Variants } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right';

export const fadeIn = (direction: Direction = 'up', duration: number = 0.5, delay: number = 0): Variants => {
  const offset = 50;
  const directions = {
    up: { y: offset },
    down: { y: -offset },
    left: { x: offset },
    right: { x: -offset },
  };

  return {
    hidden: {
      ...directions[direction],
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
} as const;

export const slideIn = (
  direction: Direction = 'left',
  type: string = 'tween',
  duration: number = 0.5,
  delay: number = 0
): Variants => {
  const offset = 100;
  const directions = {
    up: { y: offset },
    down: { y: -offset },
    left: { x: offset },
    right: { x: -offset },
  };

  return {
    hidden: {
      ...directions[direction],
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };
};

export const textVariant = (delay: number = 0): Variants => ({
  hidden: {
    y: 30,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.6,
      delay,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
});

export const zoomIn = (delay: number = 0, duration: number = 0.5): Variants => ({
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'tween',
      duration,
      delay,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
});

export const footerAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 80,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.8,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
};

export const navVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.5,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
  scrollUp: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.3,
    },
  },
  scrollDown: {
    y: -100,
    opacity: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
    },
  },
};

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const imageReveal: Variants = {
  hidden: {
    clipPath: 'inset(0 100% 0 0)',
  },
  show: {
    clipPath: 'inset(0 0 0 0)',
    transition: { duration: 0.8, ease: [0.25, 0.25, 0.25, 0.75] },
  },
};

export const lineReveal: Variants = {
  hidden: { width: 0 },
  show: {
    width: '100%',
    transition: { duration: 0.8, ease: [0.25, 0.25, 0.25, 0.75] },
  },
};

export const countUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.25, 0.25, 0.75] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: [0.25, 0.25, 0.25, 0.75] },
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 250 },
  },
  exit: {
    x: '100%',
    transition: { type: 'spring', damping: 30, stiffness: 250 },
  },
};

export const menuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

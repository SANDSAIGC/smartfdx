"use client";

/**
 * 页面交互动效系统
 * 提供统一的动画配置和组件
 */

import { Variants } from "framer-motion";

// 动画持续时间配置
export const ANIMATION_DURATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
} as const;

// 缓动函数配置
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: [0.175, 0.885, 0.32, 1.275]
} as const;

// 页面进入动画变体
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn
    }
  }
};

// 卡片动画变体
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeOut
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATIONS.fast
    }
  }
};

// 按钮动画变体
export const buttonVariants: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeOut
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATIONS.fast
    }
  },
  loading: {
    scale: [1, 1.02, 1],
    transition: {
      duration: ANIMATION_DURATIONS.slow,
      repeat: Infinity,
      ease: EASING.easeInOut
    }
  }
};

// 模态框动画变体
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.bounce
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn
    }
  }
};

// 列表项动画变体
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut
    }
  },
  hover: {
    x: 5,
    transition: {
      duration: ANIMATION_DURATIONS.fast
    }
  }
};

// 表单字段动画变体
export const formFieldVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.easeOut
    }
  },
  focus: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATIONS.fast
    }
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: ANIMATION_DURATIONS.normal
    }
  }
};

// 通知动画变体
export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    x: 300,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: EASING.spring
    }
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: EASING.easeIn
    }
  }
};

// 加载动画变体
export const loadingVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.fast
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: ANIMATION_DURATIONS.slow,
      repeat: Infinity,
      ease: EASING.easeInOut
    }
  }
};

// 容器动画变体（用于stagger children）
export const containerVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// 滑动动画变体
export const slideVariants: Variants = {
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  },
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  slideInUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 }
  },
  slideInDown: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  }
};

// 动画预设配置
export const ANIMATION_PRESETS = {
  // 页面级动画
  page: {
    variants: pageVariants,
    initial: "initial",
    animate: "animate",
    exit: "exit"
  },
  
  // 卡片动画
  card: {
    variants: cardVariants,
    initial: "initial",
    animate: "animate",
    whileHover: "hover",
    whileTap: "tap"
  },
  
  // 按钮动画
  button: {
    variants: buttonVariants,
    whileHover: "hover",
    whileTap: "tap"
  },
  
  // 模态框动画
  modal: {
    variants: modalVariants,
    initial: "initial",
    animate: "animate",
    exit: "exit"
  },
  
  // 列表项动画
  listItem: {
    variants: listItemVariants,
    initial: "initial",
    animate: "animate",
    whileHover: "hover"
  },
  
  // 表单字段动画
  formField: {
    variants: formFieldVariants,
    initial: "initial",
    animate: "animate",
    whileFocus: "focus"
  }
} as const;

// 动画工具函数
export const animationUtils = {
  // 创建延迟动画
  createDelayedAnimation: (delay: number, variants: Variants) => ({
    ...variants,
    animate: {
      ...variants.animate,
      transition: {
        ...variants.animate?.transition,
        delay
      }
    }
  }),
  
  // 创建stagger容器
  createStaggerContainer: (staggerDelay: number = 0.1) => ({
    variants: containerVariants,
    initial: "initial",
    animate: "animate",
    transition: {
      staggerChildren: staggerDelay
    }
  }),
  
  // 创建弹性动画
  createSpringAnimation: (stiffness: number = 100, damping: number = 10) => ({
    type: "spring",
    stiffness,
    damping
  })
};

// 响应式动画配置
export const responsiveAnimations = {
  // 移动端减少动画
  mobile: {
    duration: ANIMATION_DURATIONS.fast,
    scale: { hover: 1.02, tap: 0.98 }
  },
  
  // 桌面端完整动画
  desktop: {
    duration: ANIMATION_DURATIONS.normal,
    scale: { hover: 1.05, tap: 0.95 }
  }
};

// 性能优化配置
export const performanceConfig = {
  // 减少动画的媒体查询
  reduceMotion: "(prefers-reduced-motion: reduce)",

  // 低性能设备配置
  lowPerformance: {
    duration: ANIMATION_DURATIONS.fast,
    disableHover: true,
    simplifyAnimations: true
  }
};

// 动画状态管理
export class AnimationManager {
  private static instance: AnimationManager;
  private isReducedMotion: boolean = false;
  private isLowPerformance: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia(performanceConfig.reduceMotion).matches;
      this.isLowPerformance = this.detectLowPerformance();
    }
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  private detectLowPerformance(): boolean {
    if (typeof window === 'undefined') return false;

    // 检测设备性能指标
    const connection = (navigator as any).connection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;

    return (
      hardwareConcurrency < 4 ||
      (connection && connection.effectiveType &&
       ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
    );
  }

  shouldReduceMotion(): boolean {
    return this.isReducedMotion || this.isLowPerformance;
  }

  getOptimizedVariants(variants: Variants): Variants {
    if (this.shouldReduceMotion()) {
      // 简化动画或移除动画
      const optimized: Variants = {};
      Object.keys(variants).forEach(key => {
        optimized[key] = {
          ...variants[key],
          transition: {
            duration: 0,
            ease: "linear"
          }
        };
      });
      return optimized;
    }
    return variants;
  }

  getOptimizedDuration(duration: number): number {
    return this.shouldReduceMotion() ? 0 : duration;
  }
}

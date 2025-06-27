"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  ANIMATION_PRESETS, 
  AnimationManager,
  cardVariants,
  buttonVariants,
  formFieldVariants,
  listItemVariants,
  modalVariants,
  pageVariants
} from "@/lib/animation-system";

// 动画管理器实例
const animationManager = AnimationManager.getInstance();

// 动画卡片组件
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  enableHover?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  enableHover = true,
  ...props 
}: AnimatedCardProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(cardVariants);
  
  return (
    <motion.div
      variants={optimizedVariants}
      initial="initial"
      animate="animate"
      whileHover={enableHover && !animationManager.shouldReduceMotion() ? "hover" : undefined}
      whileTap={!animationManager.shouldReduceMotion() ? "tap" : undefined}
      transition={{ delay }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画按钮组件
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AnimatedButton({ 
  children, 
  className, 
  isLoading = false,
  disabled = false,
  ...props 
}: AnimatedButtonProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(buttonVariants);
  
  return (
    <motion.button
      variants={optimizedVariants}
      whileHover={!disabled && !animationManager.shouldReduceMotion() ? "hover" : undefined}
      whileTap={!disabled && !animationManager.shouldReduceMotion() ? "tap" : undefined}
      animate={isLoading ? "loading" : "initial"}
      disabled={disabled || isLoading}
      className={cn(
        "transition-all duration-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// 动画表单字段组件
interface AnimatedFormFieldProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hasError?: boolean;
}

export function AnimatedFormField({ 
  children, 
  className, 
  delay = 0,
  hasError = false,
  ...props 
}: AnimatedFormFieldProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(formFieldVariants);
  
  return (
    <motion.div
      variants={optimizedVariants}
      initial="initial"
      animate={hasError ? "error" : "animate"}
      whileFocus="focus"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画列表项组件
interface AnimatedListItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  index?: number;
  enableHover?: boolean;
}

export function AnimatedListItem({ 
  children, 
  className, 
  index = 0,
  enableHover = true,
  ...props 
}: AnimatedListItemProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(listItemVariants);
  
  return (
    <motion.div
      variants={optimizedVariants}
      initial="initial"
      animate="animate"
      whileHover={enableHover && !animationManager.shouldReduceMotion() ? "hover" : undefined}
      transition={{ delay: index * 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画模态框组件
interface AnimatedModalProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}

export function AnimatedModal({ 
  children, 
  className, 
  isOpen,
  ...props 
}: AnimatedModalProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(modalVariants);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      variants={optimizedVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画页面容器组件
interface AnimatedPageProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ 
  children, 
  className,
  ...props 
}: AnimatedPageProps) {
  const optimizedVariants = animationManager.getOptimizedVariants(pageVariants);
  
  return (
    <motion.div
      variants={optimizedVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画容器组件（用于stagger children）
interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedContainer({ 
  children, 
  className,
  staggerDelay = 0.1,
  ...props 
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      transition={{
        staggerChildren: animationManager.getOptimizedDuration(staggerDelay),
        delayChildren: animationManager.getOptimizedDuration(0.1)
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 动画数字计数器组件
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1,
  className,
  prefix = "",
  suffix = ""
}: AnimatedCounterProps) {
  const optimizedDuration = animationManager.getOptimizedDuration(duration);
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: optimizedDuration }}
      className={className}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: optimizedDuration,
          type: "spring",
          stiffness: 100
        }}
      >
        {prefix}
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: optimizedDuration, delay: 0.2 }}
        >
          {value}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// 动画进度条组件
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  duration?: number;
}

export function AnimatedProgress({ 
  value, 
  max = 100,
  className,
  showValue = false,
  duration = 0.5
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const optimizedDuration = animationManager.getOptimizedDuration(duration);
  
  return (
    <div className={cn("relative", className)}>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: optimizedDuration, ease: "easeOut" }}
        />
      </div>
      {showValue && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: optimizedDuration, delay: 0.2 }}
          className="absolute right-0 top-3 text-sm text-gray-600 dark:text-gray-400"
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
}

// 动画徽章组件
interface AnimatedBadgeProps extends HTMLMotionProps<"span"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error";
  pulse?: boolean;
}

export function AnimatedBadge({ 
  children, 
  className,
  variant = "default",
  pulse = false,
  ...props 
}: AnimatedBadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
  };
  
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      animate={pulse ? {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity }
      } : undefined}
      {...props}
    >
      {children}
    </motion.span>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StaggeredBlurTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  by?: "word" | "character";
  delay?: number;
  stagger?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  loop?: boolean;
}

export function StaggeredBlurText({
  text,
  className,
  wordClassName,
  by = "word",
  delay = 0.04,
  stagger = 0.05,
  duration = 0.45,
  as = "div",
  loop = false,
}: StaggeredBlurTextProps) {
  const items = by === "character" ? text.split("") : text.split(" ");
  const Component = motion[as] as any;

  return (
    <Component
      className={cn("inline-flex flex-wrap items-center", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
            ...(loop ? { repeat: Infinity, repeatDelay: 1.5 } : {}),
          },
        },
      }}
    >
      {items.map((item, index) => (
        <motion.span
          key={`${item}-${index}`}
          variants={{
            hidden: {
              opacity: 0,
              filter: "blur(12px)",
              y: 8,
              scale: 0.94,
            },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              scale: 1,
              transition: {
                duration,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          className={cn(
            "inline-block will-change-[filter,transform,opacity]",
            by === "word" ? "mr-[0.26em]" : "",
            wordClassName
          )}
        >
          {item === " " ? "\u00A0" : item}
        </motion.span>
      ))}
    </Component>
  );
}

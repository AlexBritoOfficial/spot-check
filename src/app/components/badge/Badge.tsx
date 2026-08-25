"use client";

import styles from "./Badge.module.css";

import { Difficulty } from "@/types/spot";

type ColorVariant = "green" | "gold" | "orange" | "red";

interface BadgeProps {
  label: string;
  level?: Difficulty;
}

const difficultyColor: Record<Difficulty, ColorVariant> = {
  beginner: "green",
  intermediate: "gold",
  advanced: "orange",
  pro: "red",
};

function Badge({ label, level }: BadgeProps) {
  const color = level ? difficultyColor[level] : undefined;

  return (
    <span className={`${styles.color} ${color ? styles[color] : ""}`}>{label}</span>
  );
}

export default Badge;

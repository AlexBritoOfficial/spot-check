"use client";

import { Star } from "lucide-react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  rating: number;
}

const STAR_COUNT = 5;

function StarRating({ rating }: StarRatingProps) {
  return (
    <div className={styles.root}>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <Star key={i} className={i < rating ? styles.filled : styles.empty} />
      ))}
    </div>
  );
}

export default StarRating;

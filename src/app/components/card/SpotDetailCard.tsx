"use client";

import { Spot } from "@/types/spot";
import Badge from "../badge/Badge";
import Button from "../button/Button.component";
import Indicator from "../indicator/Indicator";
import StarRating from "../starrating/StarRating";
import styles from "./SpotDetailCard.module.css";

interface SpotDetailCardProps {
  spot: Spot;
}

function SpotDetailCard({ spot }: SpotDetailCardProps) {
  return (
    <div className={styles.root}>
      {/* Photo area: read-only placeholder, no upload affordance */}
      <div className={styles.photo}>
        <span className={styles.photoLabel}>SPOT PHOTO</span>
      </div>
      <div className={styles.spotDetail}>
        <div className={styles.firstRow}>
          <h3 className={styles.spotName}>{spot.name}</h3>
          <span className={styles.spotDistance}>0.4 mi</span>
        </div>
        <div className={styles.badgeRow}>
          <Badge label={spot.spot_type.toUpperCase()} />
          <Badge label={spot.difficulty.toUpperCase()} level={spot.difficulty} />
        </div>
        <Indicator is_skateable={spot.is_skateable} />
        <p className={styles.description}>{spot.description}</p>
        <div className={styles.starRow}>
          <StarRating rating={spot.rating} />
        </div>
        <div className={styles.actionRow}>
          <Button label="Directions" variant="primary" grow={1.3} />
          <Button label="Edit" variant="outline" grow={1} />
          <Button label="Reviews" variant="outline" grow={1} />
        </div>
      </div>
    </div>
  );
}

export default SpotDetailCard;

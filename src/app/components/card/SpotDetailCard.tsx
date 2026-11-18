"use client";

import { Spot } from "@/types/spot";
import Badge from "../badge/Badge";
import Button from "../button/Button.component";
import Indicator from "../indicator/Indicator";
import StarRating from "../starrating/StarRating";
import styles from "./SpotDetailCard.module.css";

const METERS_PER_MILE = 1609.344;

interface SpotDetailCardProps {
  spot: Spot;
  onEdit: () => void;
  onDelete: () => void;
  onDirections: () => void;
  isDirectionsPending?: boolean;
  directionsError?: Error | null;
  directionsSummary?: { distanceMeters: number; durationSeconds: number } | null;
}

function SpotDetailCard({
  spot,
  onEdit,
  onDelete,
  onDirections,
  isDirectionsPending,
  directionsError,
  directionsSummary,
}: SpotDetailCardProps) {
  return (
    <div className={styles.root}>
      {/* Drag handle: phone-only visual, signals this is a sheet you can
          swipe (see .dragHandle's media query) */}
      <div className={styles.dragHandleRow}>
        <div className={styles.dragHandle} />
      </div>
      {/* Photo area: read-only placeholder, no upload affordance */}
      <div className={styles.photo}>
        <span className={styles.photoLabel}>SPOT PHOTO</span>
      </div>
      <div className={styles.spotDetail}>
        <div className={styles.firstRow}>
          <h3 className={styles.spotName}>{spot.name}</h3>
          {spot.distanceMeters !== undefined && (
            <span className={styles.spotDistance}>
              {(spot.distanceMeters / METERS_PER_MILE).toFixed(1)} mi
            </span>
          )}
        </div>
        <div className={styles.badgeRow}>
          <Badge label={spot.spotType.toUpperCase()} />
          <Badge
            label={spot.difficulty.toUpperCase()}
            level={spot.difficulty}
          />
        </div>
        <Indicator isSkateable={spot.isSkateable} />
        <p className={styles.description}>{spot.description}</p>
        <div className={styles.starRow}>
          <StarRating rating={spot.rating} />
        </div>
        {directionsSummary && (
          <p className={styles.directionsSummary}>
            {(directionsSummary.distanceMeters / METERS_PER_MILE).toFixed(1)}{" "}
            mi · {Math.round(directionsSummary.durationSeconds / 60)} min
          </p>
        )}
        {directionsError && (
          <p className={styles.errorMessage}>{directionsError.message}</p>
        )}
        <div className={styles.actionRow}>
          <Button
            label={isDirectionsPending ? "Loading..." : "Directions"}
            variant="primary"
            onClick={onDirections}
          />
          <div className={styles.secondaryActionRow}>
            <Button label="Edit" variant="outline" grow={1} onClick={onEdit} />
            <Button label="Reviews" variant="outline" grow={1} />
            <Button
              label="Delete"
              variant="danger"
              grow={1}
              onClick={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpotDetailCard;

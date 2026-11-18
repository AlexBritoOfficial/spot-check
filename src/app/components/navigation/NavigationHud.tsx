"use client";

import Button from "../button/Button.component";
import styles from "./NavigationHud.module.css";

const METERS_PER_MILE = 1609.344;
const FEET_PER_METER = 3.28084;

function formatShortDistance(meters: number): string {
  const feet = meters * FEET_PER_METER;
  if (feet < 500) {
    return `${Math.round(feet / 10) * 10} ft`;
  }
  return `${(meters / METERS_PER_MILE).toFixed(1)} mi`;
}

interface NavigationHudProps {
  instruction: string;
  distanceToNextTurnMeters: number;
  remainingDistanceMeters: number;
  remainingDurationSeconds: number;
  onEnd: () => void;
}

function NavigationHud({
  instruction,
  distanceToNextTurnMeters,
  remainingDistanceMeters,
  remainingDurationSeconds,
  onEnd,
}: NavigationHudProps) {
  return (
    <>
      <div className={styles.turnBanner}>
        <span className={styles.turnDistance}>
          {formatShortDistance(distanceToNextTurnMeters)}
        </span>
        <span className={styles.turnInstruction}>{instruction}</span>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.summary}>
          <span className={styles.summaryEta}>
            {Math.max(1, Math.round(remainingDurationSeconds / 60))} min
          </span>
          <span className={styles.summaryDistance}>
            {(remainingDistanceMeters / METERS_PER_MILE).toFixed(1)} mi
          </span>
        </div>
        <Button label="End" variant="danger" onClick={onEnd} />
      </div>
    </>
  );
}

export default NavigationHud;

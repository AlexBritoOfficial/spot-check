"use client";

import styles from "./Indicator.module.css";

interface IndicatorProps {
  is_skateable: boolean;
}

interface IndicatorState {
  label: string;
  className: string;
}

const confirmedIndicator: IndicatorState = {
  label: "Confirmed skateable",
  className: styles.confirmed,
};

const unconfirmedIndicator: IndicatorState = {
  label: "Unconfirmed",
  className: styles.unconfirmed,
};

function Indicator({ is_skateable }: IndicatorProps) {
  const indicator = is_skateable ? confirmedIndicator : unconfirmedIndicator;

  return (
    <div className={`${styles.root} ${indicator.className}`}>
      <div className={styles.circle}>
        {is_skateable && <span className={styles.checkmark} />}
      </div>
      <span className={styles.label}>{indicator.label}</span>
    </div>
  );
}

export default Indicator;

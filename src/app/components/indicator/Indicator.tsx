"use client";

import styles from "./Indicator.module.css";

interface IndicatorProps {
  isSkateable: boolean;
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

function Indicator({ isSkateable }: IndicatorProps) {
  const indicator = isSkateable ? confirmedIndicator : unconfirmedIndicator;

  return (
    <div className={`${styles.root} ${indicator.className}`}>
      <div className={styles.circle}>
        {isSkateable && <span className={styles.checkmark} />}
      </div>
      <span className={styles.label}>{indicator.label}</span>
    </div>
  );
}

export default Indicator;

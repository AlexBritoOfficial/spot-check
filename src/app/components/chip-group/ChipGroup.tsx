"use client";

import styles from "./ChipGroup.module.css";

interface ChipGroupProps<T extends string> {
  name: string;
  options: T[];
}

function ChipGroup<T extends string>({ name, options }: ChipGroupProps<T>) {
  return (
    <div className={styles.row}>
      {options.map((option) => (
        <label key={option} className={styles.pill}>
          <input type="checkbox" name={name} value={option} defaultChecked />
          {option.toUpperCase()}
        </label>
      ))}
    </div>
  );
}

export default ChipGroup;

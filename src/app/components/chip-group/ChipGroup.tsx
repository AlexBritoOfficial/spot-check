"use client";

import { ChangeEventHandler, Dispatch, SetStateAction } from "react";
import styles from "./ChipGroup.module.css";

interface ChipGroupProps<T extends string> {
  name: string;
  options: T[];
  setSelected: Dispatch<SetStateAction<T[]>>;
}

function ChipGroup<T extends string>({
  name,
  options,
  setSelected,
}: ChipGroupProps<T>) {
  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const checked = e.currentTarget.checked;
    const value = e.currentTarget.value as T;

    setSelected((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((element) => element !== value)
    );
  };

  return (
    <div className={styles.row}>
      {options.map((option) => (
        <label key={option} className={styles.pill}>
          <input
            type="checkbox"
            name={name}
            value={option}
            onChange={handleOnChange}
            defaultChecked
          />
          {option.toUpperCase()}
        </label>
      ))}
    </div>
  );
}

export default ChipGroup;

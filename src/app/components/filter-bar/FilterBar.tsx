"use client";

import { Feature, SpotType } from "@/types/spot";
import ChipGroup from "../chip-group/ChipGroup";
import styles from "./FilterBar.module.css";

const SPOT_TYPES: SpotType[] = ["park", "street", "diy"];
const FEATURES: Feature[] = ["ledge", "rail", "plaza", "stairs", "skatepark"];

function FilterBar() {
  return (
    <div className={styles.root}>
      <ChipGroup name="typeFilter" options={SPOT_TYPES} />
      <ChipGroup name="featureFilter" options={FEATURES} />
    </div>
  );
}

export default FilterBar;

"use client";

import { Feature, Spot, SpotType } from "@/types/spot";
import ChipGroup from "../chip-group/ChipGroup";
import styles from "./FilterBar.module.css";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface FilterBarProps {
  spots: Spot[];
  setSpotsFiltered: Dispatch<SetStateAction<Spot[]>>;
}

const SPOT_TYPES: SpotType[] = ["park", "street", "diy"];
const FEATURES: Feature[] = ["ledge", "rail", "plaza", "stairs", "skatepark"];

function FilterBar({ spots, setSpotsFiltered }: FilterBarProps) {
  const [spotTypeList, setSpotTypeList] = useState<SpotType[]>(SPOT_TYPES);
  const [featureList, setFeatureList] = useState<Feature[]>(FEATURES);

  useEffect(() => {
    const filteredSpots = spots.filter((spot) => {
      const matchesType = spotTypeList.includes(spot.spot_type);
      const matchesFeature = spot.features.some((feature) =>
        featureList.includes(feature)
      );
      return matchesType && matchesFeature;
    });

    setSpotsFiltered(filteredSpots);
  }, [spotTypeList, featureList, spots, setSpotsFiltered]);

  return (
    <div className={styles.root}>
      <ChipGroup
        name="typeFilter"
        options={SPOT_TYPES}
        setSelected={setSpotTypeList}
      />
      <ChipGroup
        name="featureFilter"
        options={FEATURES}
        setSelected={setFeatureList}
      />
    </div>
  );
}

export default FilterBar;

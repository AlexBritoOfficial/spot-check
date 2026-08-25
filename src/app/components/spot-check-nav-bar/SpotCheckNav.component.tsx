"use client";
import { useState } from "react";

import styles from "./SpotCheckNav.module.css";
import HamburgerButton from "../button/hamburgerbutton/HamburgerButton.component";
import SearchBox from "../searchbox/SearchBox.component";
import Button from "../button/Button.component";

export default function SpotCheckNav() {
  return (
    <div className={styles.div}>
      <div className={styles.leftGroup}>
        <HamburgerButton />
        <div className={styles.title}>
          <span className={`${styles.white}`}>SPOT</span>
          <span className={`${styles.gold}`}>CHECK</span>
        </div>
        <SearchBox />
      </div>
      <Button label="+ Add Spot" variant="primary" />
    </div>
  );
}

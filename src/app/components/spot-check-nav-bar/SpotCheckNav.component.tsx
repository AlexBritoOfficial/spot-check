"use client";
import { useState } from "react";

import styles from "./SpotCheckNav.module.css";
import HamburgerButton from "../button/HamburgerButton.component";

export default function SpotCheckNav() {
  return (
    <div className={styles.div}>
      <HamburgerButton />
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./SearchBox.module.css";
import { Search } from "lucide-react";

function SearchBox() {
  return (
    <div className={styles.div}>
      <Search className={styles.icon} />
      <input className={styles.input} />
    </div>
  );
}

export default SearchBox;

"use client";

import styles from "./SearchBox.module.css";
import { Search } from "lucide-react";

function SearchBox() {
  return (
    <div className={styles.searchBox}>
      <Search className={styles.icon} />
      <input
        placeholder="SEARCH A SPOT..."
        type="search"
        className={styles.input}
        onChange={() => {}}
        aria-label="Search a spot"
      />
    </div>
  );
}

export default SearchBox;

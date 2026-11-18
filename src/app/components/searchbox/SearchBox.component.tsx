"use client";

import { useState } from "react";
import { SubmitEvent } from "react";
import styles from "./SearchBox.module.css";
import { Search } from "lucide-react";
import { useGeocode } from "@/app/lib/useGeocode";

interface SearchBoxProps {
  onLocationFound: (location: { lat: number; lng: number }) => void;
}

function SearchBox({ onLocationFound }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const { mutate: geocode, isPending, error } = useGeocode();

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    geocode(trimmed, {
      onSuccess: (result) => onLocationFound(result),
    });
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <div className={styles.searchBox}>
        <Search className={styles.icon} />
        <input
          placeholder="SEARCH A CITY..."
          type="search"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          aria-label="Search for a city"
        />
      </div>
      {error && <p className={styles.errorMessage}>{error.message}</p>}
    </form>
  );
}

export default SearchBox;

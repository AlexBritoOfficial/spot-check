"use client";

import CloseButton from "../button/closebutton/CloseButton.component";
import styles from "./NewSpotCard.module.css";

function NewSpotCard() {
  return (
    // Card container — the whole "Add a new spot" panel
    <div className={styles.root}>
      {/* Header row: card title + close button */}
      <div className={styles.firstrow}>
        <label className={styles.cardTitle}>ADD A NEW SPOT</label>
        <CloseButton />
      </div>

      {/* Status hint: tells the user where the pin currently sits */}
      <div className={styles.secondrow}>
        <span className={styles.pinned}>Pinned at clicked location · click map to move</span>
      </div>

      {/* Image area: placeholder box for the spot photo upload */}
      <div className={styles.thirdrow}>
        <div className={styles.addimage}></div>
      </div>

      {/* Form section: all the editable fields for the new spot */}
      <div className={styles.fourthrow}>
        <div className={styles.form}>
          {/* Field: Spot Name (free text) */}
          <h5 className={styles.spotName}>Spot Name</h5>
          <div className={styles.spotNameDiv}>
            <input
              placeholder="e.g Riverside Bowl"
              type="text"
              className={styles.spotNameInput}
              onChange={() => {}}
              aria-label="Spot Name"
            />
          </div>

          {/* Field: Spot Type (single-select radio group, styled as pills) */}
          <h5 className={styles.spotType}>Spot Type</h5>
          <div className={styles.pillRow}>
            {/* Each label is a pill; the radio inside is visually hidden.
                Shared name="spotType" makes them mutually exclusive. */}
            <label className={styles.pill}>
              <input
                type="radio"
                name="spotType"
                value="park"
              />
              PARK
            </label>
            <label className={styles.pill}>
              <input
                type="radio"
                name="spotType"
                value="street"
              />
              STREET
            </label>
            <label className={styles.pill}>
              <input
                type="radio"
                name="spotType"
                value="diy"
              />
              DIY
            </label>
          </div>
          <h5 className={styles.spotType}>Spot Features</h5>
          <div className={styles.pillRow}>
            {/* Each label is a pill; the checkbox inside is visually hidden.
                These are NOT mutually exclusive — a spot can have many features. */}
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="ledge"
              />
              LEDGE
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="rail"
              />
              RAIL
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="plaza"
              />
              PLAZA
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="stairs"
              />
              STAIRS
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="skatepark"
              />
              SKATEPARK
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewSpotCard;

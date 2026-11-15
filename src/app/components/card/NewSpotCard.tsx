"use client";

import Button from "../button/Button.component";
import CloseButton from "../button/closebutton/CloseButton.component";
import StarRating from "../starrating/StarRating";
import styles from "./NewSpotCard.module.css";
import { Difficulty, Feature, Spot, SpotType } from "@/types/spot";
import { SubmitEvent } from "react";

interface NewSpotCardProps {
  onClose: () => void;
  location: { lat: number; lng: number };
  onSave: (spot: Omit<Spot, "id">) => void;
  isPending: boolean;
  error: Error | null;
  initialSpot?: Spot;
}

function NewSpotCard({
  onClose,
  location,
  onSave,
  isPending,
  error,
  initialSpot,
}: NewSpotCardProps) {
  const isEditing = initialSpot !== undefined;

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const spotType = formData.get("spotType") as SpotType;
    const features = formData.getAll("spotFeature") as Feature[];
    const difficulty = formData.get("difficulty") as Difficulty;
    const description = formData.get("description") as string;
    const visibility = formData.get("visibility") as string;

    onSave({
      name,
      city: initialSpot?.city ?? "",
      spotType,
      description,
      features,
      difficulty,
      isSkateable: initialSpot?.isSkateable ?? true,
      isPublic: visibility !== "private",
      rating: initialSpot?.rating ?? 0,
      latLng: location,
      photo: initialSpot?.photo ?? "",
      status: initialSpot?.status ?? "active",
      createdAt: initialSpot?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    // Card container — the whole "Add a new spot" / "Edit spot" panel
    <form className={styles.root} onSubmit={handleSubmit}>
      {/* Header row: card title + close button */}
      <div className={styles.firstrow}>
        <label className={styles.cardTitle}>
          {isEditing ? "EDIT SPOT" : "ADD A NEW SPOT"}
        </label>
        <CloseButton onClick={onClose} />
      </div>

      {/* Status hint: tells the user where the pin currently sits.
          Repositioning isn't supported while editing, so the "click map
          to move" hint only applies to a brand-new spot. */}
      {!isEditing && (
        <div className={styles.secondrow}>
          <span className={styles.pinned}>
            Pinned at clicked location · click map to move
          </span>
        </div>
      )}

      {/* Image area: placeholder box for the spot photo upload */}
      <div className={styles.thirdrow}>
        <label htmlFor="photo" className={styles.addimage}>
          <span className={styles.addImageText}>+ ADD PHOTO</span>
          <span className={styles.browseFile}>Browse file</span>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className={styles.hiddenFileInput}
          />
        </label>
      </div>

      {/* Form section: all the editable fields for the new spot */}
      <div className={styles.fourthrow}>
        <div className={styles.form}>
          {/* Field: Spot Name (free text) */}
          <h5 className={styles.spotName}>Spot Name</h5>
          <div className={styles.spotNameDiv}>
            <input
              name="name"
              placeholder="e.g Riverside Bowl"
              type="text"
              defaultValue={initialSpot?.name}
              className={styles.spotNameInput}
              aria-label="Spot Name"
              required
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
                defaultChecked={initialSpot?.spotType === "park"}
                required
              />
              PARK
            </label>
            <label className={styles.pill}>
              <input
                type="radio"
                name="spotType"
                value="street"
                defaultChecked={initialSpot?.spotType === "street"}
              />
              STREET
            </label>
            <label className={styles.pill}>
              <input
                type="radio"
                name="spotType"
                value="diy"
                defaultChecked={initialSpot?.spotType === "diy"}
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
                defaultChecked={initialSpot?.features.includes("ledge")}
              />
              LEDGE
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="rail"
                defaultChecked={initialSpot?.features.includes("rail")}
              />
              RAIL
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="plaza"
                defaultChecked={initialSpot?.features.includes("plaza")}
              />
              PLAZA
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="stairs"
                defaultChecked={initialSpot?.features.includes("stairs")}
              />
              STAIRS
            </label>
            <label className={styles.pill}>
              <input
                type="checkbox"
                name="spotFeature"
                value="skatepark"
                defaultChecked={initialSpot?.features.includes("skatepark")}
              />
              SKATEPARK
            </label>
          </div>

          {/** Difficulty Dropbox */}
          <label htmlFor="difficulty" className={styles.spotType}>
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            className={styles.select}
            defaultValue={initialSpot?.difficulty}
            required
          >
            <option value="beginner">Beginner </option>
            <option value="intermediate">Intermediate </option>
            <option value="advanced">Advanced</option>
            <option value="pro">Pro </option>
          </select>

          {/** Visibility */}
          <h5 className={styles.spotType}>Visibility</h5>
          <div className={styles.pillRow}>
            <label className={styles.pill}>
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked={initialSpot?.isPublic ?? true}
              />
              PUBLIC
            </label>
            <label className={styles.pill}>
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked={initialSpot?.isPublic === false}
              />
              PRIVATE
            </label>
          </div>

          {/*** Description */}
          <label className={styles.spotType}>Description</label>
          <textarea
            className={styles.textarea}
            name="description"
            rows={3}
            defaultValue={initialSpot?.description}
            placeholder="What makes this spot worth skating?"
          ></textarea>

          {/* Rating: read-only display here — there's no rating input yet,
              so an existing spot's rating just carries through unedited. */}
          <h5 className={styles.spotType}>Rating</h5>
          <StarRating rating={initialSpot?.rating ?? 0} />

          {error && <p className={styles.errorMessage}>{error.message}</p>}

          <div className={styles.actionRow}>
            <Button
              type="submit"
              label={
                isPending ? "Saving..." : isEditing ? "Save Changes" : "Save Spot"
              }
              variant="primary"
              grow={1.3}
            />
            <Button
              type="button"
              label="Cancel"
              variant="outline"
              grow={1}
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default NewSpotCard;

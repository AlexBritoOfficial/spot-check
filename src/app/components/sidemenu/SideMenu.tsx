"use client";

import { SubmitEvent } from "react";
import styles from "./SideMenu.module.css";
import CloseButton from "../button/closebutton/CloseButton.component";
import Button from "../button/Button.component";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  signedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSignUp: () => void;
}

function SideMenu({
  isOpen,
  onClose,
  signedIn,
  onSignIn,
  onSignOut,
  onOpenSignUp,
}: SideMenuProps) {
  // Hanndle the sign-in event
  function handleSignIn(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    onSignIn();
  }

  return (
    <nav className={`${styles.root} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.firstrow}>
        <div className={styles.title}>
          <span className={styles.white}>SPOT</span>
          <span className={styles.gold}>CHECK</span>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {signedIn ? (
        <div className={styles.body}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>R</div>
            <div>
              <div className={styles.name}>Rider Nguyen</div>
              <div className={styles.handle}>@rider.nguyen</div>
            </div>
          </div>

          <div className={styles.navList}>
            <button className={styles.navItem}>My profile</button>
            <button className={styles.navItem}>Saved spots</button>
            <button className={styles.navItem}>Notifications</button>
            <button className={styles.navItem}>Settings</button>
            <button
              className={`${styles.navItem} ${styles.signOut}`}
              onClick={onSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <form className={styles.body} onSubmit={handleSignIn}>
          <p className={styles.introText}>
            Sign in to add spots, save your favorites, and post reviews.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="signin-email" className={styles.label}>
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signin-password" className={styles.label}>
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <Button label="Sign in" variant="primary" type="submit" />

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            OR
            <span className={styles.dividerLine} />
          </div>

          <Button
            label="Continue with Google"
            variant="outline"
            type="button"
          />

          <p className={styles.switchText}>
            New here?{" "}
            <span className={styles.switchLink} onClick={onOpenSignUp}>
              Create an account
            </span>
          </p>
        </form>
      )}
    </nav>
  );
}

export default SideMenu;

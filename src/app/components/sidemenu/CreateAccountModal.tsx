"use client";

import { SubmitEvent } from "react";
import styles from "./CreateAccountModal.module.css";
import CloseButton from "../button/closebutton/CloseButton.component";
import Button from "../button/Button.component";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSignIn: () => void;
  onCreateAccount: () => void;
}

function CreateAccountModal({
  isOpen,
  onClose,
  onBackToSignIn,
  onCreateAccount,
}: CreateAccountModalProps) {
  if (!isOpen) return null;

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    onCreateAccount();
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Create an account</h2>
            <p className={styles.subtitle}>
              Join the crew — add spots, save favorites, post reviews.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="signup-username" className={styles.label}>
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              placeholder="e.g. rider.nguyen"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-email" className={styles.label}>
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-password" className={styles.label}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-city" className={styles.label}>
              Home city
            </label>
            <input
              id="signup-city"
              type="text"
              placeholder="e.g. Portland, OR"
              className={styles.input}
            />
          </div>

          <Button label="Create account" variant="primary" type="submit" />

          <p className={styles.switchText}>
            Already have an account?{" "}
            <span className={styles.switchLink} onClick={onBackToSignIn}>
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountModal;

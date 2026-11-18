"use client";

import Button from "../button/Button.component";
import CloseButton from "../button/closebutton/CloseButton.component";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: Error | null;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isPending = false,
  error = null,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <CloseButton onClick={onCancel} />
        </div>

        <p className={styles.message}>{message}</p>

        {error && <p className={styles.errorMessage}>{error.message}</p>}

        <div className={styles.actionRow}>
          <Button
            type="button"
            label={isPending ? "Deleting..." : confirmLabel}
            variant="danger"
            grow={1}
            onClick={onConfirm}
          />
          <Button
            type="button"
            label={cancelLabel}
            variant="outline"
            grow={1}
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

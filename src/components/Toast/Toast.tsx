'use client';

import { useEffect } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Toast.module.scss';

export type ToastType = 'success' | 'warning' | 'error' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ToastCloseReason = 'manual' | 'auto';

type ToastProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  message: ReactNode;
  type?: ToastType;
  position?: ToastPosition;
  open?: boolean;
  autoCloseMs?: number;
  onClose?: (reason: ToastCloseReason) => void;
};

export default function Toast({
  title,
  message,
  type = 'info',
  position = 'top-right',
  open = true,
  autoCloseMs,
  onClose,
  className,
  ...rest
}: ToastProps) {
  useEffect(() => {
    if (!open || !onClose || !autoCloseMs || autoCloseMs <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose('auto');
    }, autoCloseMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, onClose, autoCloseMs, title, message, type, position]);

  if (!open) return null;

  const classes = [
    styles.toast,
    styles[`toast--${type}`],
    styles[`toast--${position}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" {...rest}>
      <div className={styles['toast__content']}>
        {title && <p className={styles['toast__title']}>{title}</p>}
        <p className={styles['toast__message']}>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          className={styles['toast__close']}
          onClick={() => onClose('manual')}
          aria-label="Close toast"
        >
          x
        </button>
      )}
    </div>
  );
}

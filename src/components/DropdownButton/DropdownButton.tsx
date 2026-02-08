"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./DropdownButton.module.scss";

export type DropdownOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type DropdownButtonProps = {
  label: string;
  options: DropdownOption[];
  onSelect?: (value: string) => void;
  align?: "left" | "right";
};

export default function DropdownButton({
  label,
  options,
  onSelect,
  align = "left",
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        className={styles["dropdown__trigger"]}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles["dropdown__label"]}>{label}</span>
        <span className={styles["dropdown__chevron"]} aria-hidden="true">
          +
        </span>
      </button>
      <ul
        id={menuId}
        className={`${styles["dropdown__menu"]} ${
          open ? styles["dropdown__menu--open"] : ""
        } ${align === "right" ? styles["dropdown__menu--right"] : ""}`}
        role="menu"
      >
        {options.map((option) => (
          <li key={option.value} role="none">
            <button
              type="button"
              className={styles["dropdown__item"]}
              role="menuitem"
              disabled={option.disabled}
              onClick={() => {
                onSelect?.(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

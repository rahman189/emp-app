import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "muted";
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[`button--${variant}`], className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}

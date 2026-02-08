import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.scss";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  headingLevel?: 2 | 3 | 4;
  as?: "section" | "article" | "div";
  children: ReactNode;
};

export default function Card({
  title,
  description,
  headingLevel = 2,
  as = "article",
  children,
  className,
  ...rest
}: CardProps) {
  const HeadingTag = `h${headingLevel}` as const;
  const Component = as;
  const classes = [styles.card, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...rest}>
      {(title || description) && (
        <div className={styles["card__header"]}>
          {title && (
            <HeadingTag className={styles["card__title"]}>{title}</HeadingTag>
          )}
          {description && (
            <p className={styles["card__description"]}>{description}</p>
          )}
        </div>
      )}
      <div className={styles["card__body"]}>{children}</div>
    </Component>
  );
}

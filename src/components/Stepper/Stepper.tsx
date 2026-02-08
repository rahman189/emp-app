import { Step, StepperProps } from "@/types/stepper";
import styles from "./Stepper.module.scss";

const defaultSteps: Step[] = [
  { title: "Draft", description: "Invoice created" },
  { title: "Review", description: "Awaiting approval" },
  { title: "Send", description: "Email scheduled" },
];

export default function Stepper({
  steps = defaultSteps,
  currentStep = 1,
}: StepperProps) {
  return (
    <div className={styles.stepper}>
      <ol className={styles["stepper__list"]}>
        {steps.map((step, index) => {
          const isComplete = index + 1 < currentStep;
          const isActive = index + 1 === currentStep;

          return (
            <li
              key={`${step.title}-${index}`}
              className={`${styles["stepper__item"]} ${
                isComplete ? styles["stepper__item--complete"] : ""
              } ${isActive ? styles["stepper__item--active"] : ""}`}
            >
              <span className={styles["stepper__circle"]}>{index + 1}</span>
              <div className={styles["stepper__content"]}>
                <p className={styles["stepper__title"]}>{step.title}</p>
                {step.description && (
                  <span className={styles["stepper__subtitle"]}>
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

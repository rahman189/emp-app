export type Step = {
  title: string;
  description?: string;
};

export type StepperProps = {
  steps?: Step[];
  currentStep?: number;
};

"use client";

import { useRouter } from "next/navigation";
import DropdownButton from "@/components/DropdownButton";
import styles from "./EmployeeActions.module.scss";

export default function EmployeeActions() {
  const router = useRouter();

  function goToWizard(type: "admin" | "ops") {
    router.push(`/wizard/${type}`);
  }

  return (
    <div className={styles["employee-actions"]}>
      <DropdownButton
        label="Add"
        align="right"
        options={[
          { label: "Admin", value: "admin" },
          { label: "Ops", value: "ops" },
        ]}
        onSelect={(value) => {
          if (value === "admin" || value === "ops") {
            goToWizard(value);
          }
        }}
      />
    </div>
  );
}

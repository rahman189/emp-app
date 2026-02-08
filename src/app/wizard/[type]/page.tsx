'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/Card';
import Stepper from '@/components/Stepper/Stepper';
import AutocompleteSelect from '@/components/AutocompleteSelect';
import { Step } from '@/types/stepper';
import { Option } from '@/types/options';
import PhotoUpload from '@/components/PhotoUpload';
import styles from '@/app/page.module.scss';
import Button from '@/components/Button/Button';
import Toast from '@/components/Toast';

function buildEmployeeId(department: string) {
  if (!department.trim()) return '';
  const prefix = getPrefixEmployee(department);

  const storageKey = `employee-seq:${prefix}`;
  const nextSeq = Number(window.localStorage.getItem(storageKey) ?? '0') + 1;

  const seq = String(nextSeq).padStart(3, '0');

  return `${prefix}-${seq}`;
}

function getPrefixEmployee(department: string) {
  if (!department.trim()) return '';

  const prefix = department
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  return prefix;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Field =
  | 'fullName'
  | 'email'
  | 'department'
  | 'role'
  | 'photo'
  | 'employmentType'
  | 'officeLocation';

export default function WizardTypePage() {
  const params = useParams<{ type?: string }>();
  const typeParam = typeof params.type === 'string' ? params.type : undefined;
  const isAdmin = typeParam?.toLowerCase() === 'admin';
  const steps: Step[] = [{ title: 'Basic Info' }, { title: 'Details' }];

  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentVal, setDepartmentVal] = useState<Option>();
  const [role, setRole] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [employmentType, setEmploymentType] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [officeLocationVal, setOfficeLocationVal] = useState<Option>();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    department: false,
    role: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    department: '',
    role: '',
  });

  const [touchedStep2, SettouchedStep2] = useState({
    photo: false,
    employmentType: false,
    officeLocation: false,
  });

  const [errorsStep2, setErrorsStep2] = useState({
    photo: '',
    employmentType: '',
    officeLocation: '',
  });

  const [showToast, setShowToast] = useState(false);

  const roleOptions = useMemo(
    () => ['Ops', 'Admin', 'Engineer', 'Finance'],
    []
  );
  const employmentOptions = useMemo(
    () => ['Full-time', 'Part-time', 'Contract', 'Intern'],
    []
  );

  function validateStepOne() {
    const nextErrors = {
      fullName: fullName.trim() ? '' : 'Full name is required.',
      email: '',
      department: departmentVal?.name.trim() ? '' : 'Department is required.',
      role: role.trim() ? '' : 'Role is required.',
    };

    const nextErrorsStep2 = {
      photo: (photoBase64 ?? '').trim() ? '' : 'photo is required.',
      employmentType: employmentType.trim()
        ? ''
        : 'Employment type is required.',
      officeLocation: officeLocationVal?.name.trim()
        ? ''
        : 'Office location is required.',
    };

    const emailValue = email.trim();
    if (!emailValue) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (isAdmin) {
      if (currentStep === 1) {
        setErrors(nextErrors);
        return Object.values(nextErrors).every((value) => !value);
      } else {
        setErrorsStep2(nextErrorsStep2);
        return Object.values(nextErrorsStep2).every((value) => !value);
      }
    } else {
      setErrorsStep2(nextErrorsStep2);
      return Object.values(nextErrorsStep2).every((value) => !value);
    }
  }

  function validateField(field: Field) {
    setErrors((prev) => {
      const next = { ...prev };

      if (field === 'fullName') {
        next.fullName = fullName.trim() ? '' : 'Full name is required.';
      }

      if (field === 'email') {
        const emailValue = email.trim();
        if (!emailValue) {
          next.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          next.email = 'Enter a valid email address.';
        } else {
          next.email = '';
        }
      }

      if (field === 'department') {
        next.department = departmentVal?.name.trim()
          ? ''
          : 'Department is required.';
      }

      if (field === 'role') {
        next.role = role.trim() ? '' : 'Role is required.';
      }

      return next;
    });
  }

  function validateStep2Field(field: Field) {
    setErrorsStep2((prev) => {
      const next = { ...prev };

      if (field === 'photo') {
        next.photo = (photoBase64 ?? '').trim() ? '' : 'photo is required.';
      }

      if (field === 'employmentType') {
        next.employmentType = employmentType.trim()
          ? ''
          : 'Employment Type is required.';
      }

      if (field === 'officeLocation') {
        next.officeLocation = officeLocationVal?.name.trim()
          ? ''
          : 'Office locaion is required.';
      }

      return next;
    });
  }

  const isStepOneValid =
    fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    (departmentVal?.name ?? '').trim().length > 0 &&
    role.trim().length > 0;

  const isStepTwoValid =
    (photoBase64 ?? '').trim().length > 0 &&
    employmentType.trim().length > 0 &&
    (officeLocationVal?.name ?? '').trim().length > 0;

  async function postWithDelay(
    path: '/basicInfo' | '/details',
    payload: unknown
  ) {
    await delay(3000);

    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }
  }

  async function handleSubmit() {
    if (!validateStepOne()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAdmin) {
        await postWithDelay('/basicInfo', {
          fullname: fullName.trim(),
          email: email.trim(),
          department: (departmentVal?.name ?? department).trim(),
          role: role.trim(),
          employeeId: employeeId.trim(),
        });
      }

      await postWithDelay('/details', {
        photo: photoBase64,
        employmentType: employmentType.trim(),
        officeLocation: (officeLocationVal?.name ?? officeLocation).trim(),
        notes: notes.trim(),
        employeeId: employeeId.trim(),
      });

      const prefix = getPrefixEmployee(
        departmentVal?.name ?? department
      ).trim();
      const storageKey = `employee-seq:${prefix}`;
      const nextSeq =
        Number(window.localStorage.getItem(storageKey) ?? '0') + 1;
      window.localStorage.setItem(storageKey, String(nextSeq));

      setShowToast(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles['page__main']}>
        <Card title={isAdmin ? 'Admin Form' : 'Ops Form'}>
          {isAdmin && <Stepper steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && isAdmin && (
            <form className={styles['page__form']}>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Full name</span>
                <input
                  className={`${styles['page__input']} ${
                    errors.fullName && touched.fullName
                      ? styles['page__input--error']
                      : ''
                  }`}
                  type="text"
                  placeholder="Jane Cooper"
                  value={fullName}
                  required
                  onChange={(event) => setFullName(event.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, fullName: true }));
                    validateField('fullName');
                  }}
                />
                {errors.fullName && touched.fullName && (
                  <span className={styles['page__error']}>
                    {errors.fullName}
                  </span>
                )}
              </label>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Email</span>
                <input
                  className={`${styles['page__input']} ${
                    errors.email && touched.email
                      ? styles['page__input--error']
                      : ''
                  }`}
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  required
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, email: true }));
                    validateField('email');
                  }}
                />
                {errors.email && touched.email && (
                  <span className={styles['page__error']}>{errors.email}</span>
                )}
              </label>
              <div className={styles['page__field']}>
                <AutocompleteSelect<Option>
                  label="Department"
                  endpoint="/departments"
                  labelKey="name"
                  queryParam="name_like"
                  placeholder="Search department"
                  value={department}
                  hasError={Boolean(errors.department && touched.department)}
                  onValueChange={(value) => {
                    setDepartment(value);
                    setEmployeeId(buildEmployeeId(value));
                  }}
                  onBlur={() => {
                    if (departmentVal?.name) {
                      setDepartment(departmentVal.name);
                      setEmployeeId(buildEmployeeId(departmentVal.name));
                    }
                    setTouched((prev) => ({ ...prev, department: true }));
                    validateField('department');
                  }}
                  onSelect={(val) => {
                    setDepartmentVal(val);
                  }}
                />
                {errors.department && touched.department && (
                  <span className={styles['page__error']}>
                    {errors.department}
                  </span>
                )}
              </div>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Role</span>
                <select
                  className={`${styles['page__select']} ${
                    errors.role && touched.role
                      ? styles['page__input--error']
                      : ''
                  }`}
                  value={role}
                  required
                  onChange={(event) => setRole(event.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, role: true }));
                    validateField('role');
                  }}
                >
                  <option value="">Select role</option>
                  {roleOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.role && touched.role && (
                  <span className={styles['page__error']}>{errors.role}</span>
                )}
              </label>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Employee ID</span>
                <input
                  className={styles['page__input']}
                  type="text"
                  value={employeeId}
                  placeholder="ENG-001"
                  disabled
                />
              </label>
              <div className={styles['page__actions']}>
                <Button
                  className={styles['page__primary']}
                  type="button"
                  disabled={!isStepOneValid || isSubmitting}
                  onClick={() => {
                    if (validateStepOne()) {
                      setCurrentStep(2);
                    }
                  }}
                >
                  Continue
                </Button>
              </div>
            </form>
          )}

          {(currentStep === 2 || !isAdmin) && (
            <form className={styles['page__form']}>
              <div className={styles['page__field']}>
                <PhotoUpload
                  label="Upload photo"
                  onChange={(value) => setPhotoBase64(value)}
                />
              </div>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Employee type</span>
                <select
                  className={`${styles['page__select']} ${
                    errors.role && touched.role
                      ? styles['page__input--error']
                      : ''
                  }`}
                  value={employmentType}
                  required
                  onChange={(event) => setEmploymentType(event.target.value)}
                  onBlur={() => {
                    SettouchedStep2((prev) => ({
                      ...prev,
                      employmentType: true,
                    }));
                    validateStep2Field('employmentType');
                  }}
                >
                  <option value="">Select type</option>
                  {employmentOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errorsStep2.employmentType && touchedStep2.employmentType && (
                  <span className={styles['page__error']}>
                    {errorsStep2.employmentType}
                  </span>
                )}
              </label>
              <div className={styles['page__field']}>
                <AutocompleteSelect<Option>
                  label="Office location"
                  endpoint="/locations"
                  labelKey="name"
                  queryParam="name_like"
                  placeholder="Search office location"
                  value={officeLocation}
                  hasError={Boolean(
                    errorsStep2.officeLocation && touchedStep2.officeLocation
                  )}
                  onValueChange={(value) => setOfficeLocation(value)}
                  onBlur={() => {
                    if (officeLocationVal?.name) {
                      setOfficeLocation(officeLocationVal.name);
                    }
                    SettouchedStep2((prev) => ({
                      ...prev,
                      officeLocation: true,
                    }));
                    validateStep2Field('officeLocation');
                  }}
                  onSelect={(val) => {
                    setOfficeLocationVal(val);
                  }}
                />
                {errorsStep2.officeLocation && touchedStep2.officeLocation && (
                  <span className={styles['page__error']}>
                    {errorsStep2.officeLocation}
                  </span>
                )}
              </div>
              <label className={styles['page__field']}>
                <span className={styles['page__label']}>Notes</span>
                <textarea
                  className={styles['page__textarea']}
                  rows={4}
                  placeholder="Add notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              <div className={styles['page__actions']}>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  disabled={!isStepTwoValid || isSubmitting}
                  className={styles['page__primary']}
                  type="button"
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
      <Toast
        type="success"
        position="top-center"
        title="Saved"
        message="Employee created successfully."
        open={showToast}
        autoCloseMs={3000}
        onClose={(reason) => {
          console.log(`Toast closed: ${reason}`);
          setShowToast(false);
        }}
      />
    </div>
  );
}

'use client';

import { useId, useState } from 'react';
import styles from './PhotoUpload.module.scss';

type PhotoUploadProps = {
  label?: string;
  value?: string | null;
  onChange?: (base64: string | null) => void;
};

export default function PhotoUpload({
  label = 'Upload Photo',
  value,
  onChange,
}: PhotoUploadProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isControlled = value !== undefined;
  const previewSrc = isControlled ? (value ?? null) : preview;

  async function handleFile(file?: File | null) {
    if (!file) {
      setPreview(null);
      onChange?.(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      setPreview(null);
      onChange?.(null);
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setPreview(result);
      onChange?.(result);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setPreview(null);
      onChange?.(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles['photo-upload']}>
      <label className={styles['photo-upload__label']} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles['photo-upload__control']}>
        <input
          id={inputId}
          className={styles['photo-upload__input']}
          type="file"
          accept="image/*"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <label className={styles['photo-upload__trigger']} htmlFor={inputId}>
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt="Preview"
              className={styles['photo-upload__preview']}
            />
          ) : (
            <div className={styles['photo-upload__placeholder']}>
              No photo selected
            </div>
          )}
        </label>
      </div>
      {error && <span className={styles['photo-upload__error']}>{error}</span>}
    </div>
  );
}

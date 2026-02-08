'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AutocompleteSelect.module.scss';

type AutocompleteSelectProps<T extends Record<string, unknown>> = {
  label?: string;
  placeholder?: string;
  endpoint: string;
  labelKey?: keyof T;
  queryParam?: string;
  onSelect?: (option: T) => void;
  onValueChange?: (value: string) => void;
  value?: string;
  debounceMs?: number;
  hasError?: boolean;
  onBlur?: (value: string) => void;
};

export default function AutocompleteSelect<T extends Record<string, unknown>>({
  label = 'Search',
  placeholder = 'Type a name...',
  endpoint,
  labelKey = 'name',
  queryParam = 'name_like',
  onSelect,
  onValueChange,
  value,
  debounceMs = 400,
  hasError = false,
  onBlur,
}: AutocompleteSelectProps<T>) {
  const [internalQuery, setInternalQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const skipQueryRef = useRef(false);

  const query = value ?? internalQuery;
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (skipQueryRef.current) {
      skipQueryRef.current = false;
      return;
    }

    if (!trimmedQuery) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const handle = window.setTimeout(async () => {
      try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set(queryParam, trimmedQuery);

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        const data = (await response.json()) as T[];
        setOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [endpoint, trimmedQuery, debounceMs, queryParam]);

  function handleChange(nextValue: string) {
    if (value === undefined) {
      setInternalQuery(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <div className={styles.autocomplete}>
      {label && <span className={styles['autocomplete__label']}>{label}</span>}
      <div className={styles['autocomplete__control']}>
        <input
          className={`${styles['autocomplete__input']} ${
            hasError ? styles['autocomplete__input--error'] : ''
          }`}
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            onBlur?.(query);
            setTimeout(() => setOpen(false), 150);
          }}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
        />
        {loading && <span className={styles['autocomplete__spinner']} />}
      </div>
      {open && (
        <ul className={styles['autocomplete__list']} role="listbox">
          {!loading &&
            options.length > 0 &&
            options.map((option, index) => (
              <li key={`${String(option[labelKey] ?? index)}`} role="option">
                <button
                  type="button"
                  className={styles['autocomplete__item']}
                  onMouseDown={() => {
                    skipQueryRef.current = true;
                    handleChange(String(option[labelKey] ?? ''));
                    onSelect?.(option);
                    setOpen(false);
                  }}
                >
                  {String(option[labelKey] ?? '')}
                </button>
              </li>
            ))}
          {loading && (
            <li className={styles['autocomplete__empty']}>Searching...</li>
          )}
          {!loading && options.length === 0 && (
            <li className={styles['autocomplete__empty']}>No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}

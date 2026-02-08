import Button from '../Button/Button';
import styles from './Pagination.module.scss';

type PaginationProps = {
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (nextPage: number) => void;
  onLimitChange?: (nextLimit: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, limit)));
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <div className={styles['pagination__meta']}>
        <span className={styles['pagination__count']}>
          Page {page} of {totalPages}
        </span>
        {onLimitChange && (
          <label className={styles['pagination__limit']}>
            <span>Rows</span>
            <select
              className={styles['pagination__select']}
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className={styles['pagination__controls']}>
        <Button
          variant="ghost"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

import styles from './Table.module.scss';
import { TableProps } from './Table.types';

export function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  const colSpan = Math.max(columns.length, 1);

  return (
    <div className={styles['table__wrap']}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={styles['table__head-cell']}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr
              className={`${styles['table__row']} ${styles['table__row--empty']}`}
            >
              <td className={styles['table__cell']} colSpan={colSpan}>
                <span className={styles['table__state']}>Loading...</span>
              </td>
            </tr>
          ) : data.length ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={
                  onRowClick
                    ? `${styles['table__row']} ${styles['table__row--clickable']}`
                    : styles['table__row']
                }
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={styles['table__cell']}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr
              className={`${styles['table__row']} ${styles['table__row--empty']}`}
            >
              <td className={styles['table__cell']} colSpan={colSpan}>
                <span className={styles['table__state']}>{emptyMessage}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

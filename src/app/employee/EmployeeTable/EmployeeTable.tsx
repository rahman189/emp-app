'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Table, type Column } from '@/components/Table';
import Pagination from '@/components/Pagination/Pagination';
import type { Admin, BasicInfo, Detail } from '@/types/roles';
import styles from './EmployeeTable.module.scss';
import EmployeeActions from '../EmployeeActions';

type EmployeeTableProps = {
  columns: Column<Admin>[];
};

export default function EmployeeTable({ columns }: EmployeeTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<Admin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const resolvedColumns = useMemo<Column<Admin>[]>(() => {
    return columns.map((column) => {
      if (column.key !== 'photo') {
        return column;
      }

      return {
        ...column,
        render: (row) => {
          const src = row.photo?.trim();

          if (!src) {
            return '-';
          }

          return (
            <Image
              src={src}
              alt={`${row.fullname ?? 'Employee'} photo`}
              width={40}
              height={40}
              unoptimized
              className={styles['employee-table__photo']}
            />
          );
        },
      };
    });
  }, [columns]);

  useEffect(() => {
    let active = true;

    async function loadRows() {
      setLoading(true);

      try {
        const [basicInfoResponse, detailsResponse] = await Promise.all([
          fetch('/basicInfo'),
          fetch(`/details?_page=${page}&_limit=${limit}`),
        ]);

        if (!basicInfoResponse.ok || !detailsResponse.ok) {
          throw new Error(
            `Failed to fetch data: basicInfo=${basicInfoResponse.status}, details=${detailsResponse.status}`
          );
        }

        const totalHeader =
          detailsResponse.headers.get('X-Total-Count') ??
          detailsResponse.headers.get('x-total-count');
        const total = totalHeader ? Number(totalHeader) : 0;
        const [basicInfo, details] = (await Promise.all([
          basicInfoResponse.json(),
          detailsResponse.json(),
        ])) as [BasicInfo[], Detail[]];

        if (!active) return;

        const infoByEmployeeId = new Map(
          basicInfo.map((info) => [info.employeeId, info])
        );

        const merged = details.map((detail) => {
          const info = detail.employeeId
            ? infoByEmployeeId.get(detail.employeeId)
            : undefined;

          return {
            ...detail,
            fullname: info?.fullname ?? '-',
            department: info?.department ?? '-',
            role: info?.role ?? '-',
          };
        });

        setData(merged);
        setTotalCount(total || merged.length);
      } catch (error) {
        if (active) {
          console.error(error);
          setData([]);
          setTotalCount(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      active = false;
    };
  }, [page, limit]);

  return (
    <div className={styles['employee-table']}>
      <EmployeeActions />
      {loading && (
        <div className={styles['employee-table__overlay']} aria-hidden="true">
          <span className={styles['employee-table__spinner']} />
        </div>
      )}
      <Table columns={resolvedColumns} data={data} loading={loading} />
      <Pagination
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}

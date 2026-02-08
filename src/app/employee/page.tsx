import { Column } from '@/components/Table';
import styles from '@/app/page.module.scss';
import type { Admin } from '@/types/roles';
import Card from '@/components/Card';
import EmployeeTable from './EmployeeTable';

export default async function Employee() {
  const columns: Column<Admin>[] = [
    { key: 'fullname', header: 'Name' },
    { key: 'department', header: 'Department' },
    { key: 'role', header: 'Role' },
    { key: 'officeLocation', header: 'Location' },
    { key: 'photo', header: 'Photo' },
  ];

  return (
    <div className={styles.page}>
      <main className={styles['page__main']}>
        <Card title="Employee">
          <div className={styles['page__table']}>
            <EmployeeTable columns={columns} />
          </div>
        </Card>
      </main>
    </div>
  );
}

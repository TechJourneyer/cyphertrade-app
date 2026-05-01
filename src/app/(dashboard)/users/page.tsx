'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import * as usersApi from '@/api/users';
import type { User } from '@/types/api';

export default function UsersPage() {
  const { hasHydrated, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, sortBy, sortOrder],
    queryFn: () => usersApi.list(page, 20),
    enabled: hasHydrated && hasRole('admin'),
  });

  const columns: DataTableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'roles', label: 'Roles', sortable: false, render: (value) => {
      const roles = value as string[]
      return (
        <div className="flex gap-1 flex-wrap">
          {roles?.map((role) => (
            <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
              {role}
            </span>
          ))}
        </div>
      )
    } },
  ];

  if (!hasHydrated) {
    return <PageShell title="Users" isLoading />;
  }

  if (!hasRole('admin')) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <PageShell title="Users" description="Manage system users and their roles">
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
      />
    </PageShell>
  );
}

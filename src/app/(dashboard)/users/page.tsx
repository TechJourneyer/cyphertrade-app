'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import * as usersApi from '@/api/users';

export default function UsersPage() {
  const { hasHydrated, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['users', page, sortBy, sortOrder],
    queryFn: () => usersApi.list(page, 20),
    enabled: hasHydrated && hasRole('admin'),
  });
  const data = responseData as any;

  const columns: any[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'roles', label: 'Roles', sortable: false, render: (value: string[]) => (
      <div className="flex gap-1 flex-wrap">
        {value?.map((role) => (
          <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {role}
          </span>
        ))}
      </div>
    ) },
  ];

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!hasRole('admin')) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage system users and their roles" />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
      />
    </div>
  );
}

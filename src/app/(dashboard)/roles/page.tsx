'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function RolesPage() {
  const { hasHydrated, hasRole } = useAuth();

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
      <PageHeader title="Roles & Permissions" description="Manage system roles and their permissions" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Roles</h3>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded">Admin</div>
            <div className="p-3 bg-blue-50 rounded">Trader</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded">manage-users</div>
            <div className="p-3 bg-green-50 rounded">manage-bots</div>
            <div className="p-3 bg-green-50 rounded">place-trades</div>
          </div>
        </div>
      </div>
    </div>
  );
}

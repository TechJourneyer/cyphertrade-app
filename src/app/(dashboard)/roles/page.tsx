'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';

export default function RolesPage() {
  const { hasHydrated, hasRole } = useAuth();

  if (!hasHydrated) {
    return <PageShell title="Roles & Permissions" isLoading />;
  }

  if (!hasRole('admin')) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <PageShell title="Roles & Permissions" description="Manage system roles and their permissions">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Roles</h3>
          <div className="space-y-2">
            <div className="p-3 rounded bg-secondary/40 text-sm text-foreground">Admin</div>
            <div className="p-3 rounded bg-secondary/40 text-sm text-foreground">Trader</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Permissions</h3>
          <div className="space-y-2">
            <div className="p-3 rounded bg-secondary/40 text-sm text-foreground">manage-users</div>
            <div className="p-3 rounded bg-secondary/40 text-sm text-foreground">manage-bots</div>
            <div className="p-3 rounded bg-secondary/40 text-sm text-foreground">place-trades</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

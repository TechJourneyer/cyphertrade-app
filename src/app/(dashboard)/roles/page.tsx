'use client';

import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import * as accessApi from '@/api/access';

export default function RolesPage() {
  const { hasHydrated, hasRole } = useAuth();

  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () => accessApi.listRoles(),
    enabled: hasHydrated && hasRole('admin'),
  });

  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: () => accessApi.listPermissions(),
    enabled: hasHydrated && hasRole('admin'),
  });

  if (!hasHydrated) {
    return <PageShell title="Roles & Permissions" isLoading />;
  }

  if (!hasRole('admin')) {
    return (
      <PageShell title="Roles & Permissions">
        <p className="text-sm text-muted-foreground">Only an admin can view roles and permissions.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Roles & Permissions" description="Roles and permissions currently stored for this app">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Roles</h3>
          {roles.isLoading && <p className="text-sm text-muted-foreground">Loading roles…</p>}
          {roles.isError && <p className="text-sm text-destructive">Could not load roles.</p>}
          <div className="space-y-2">
            {roles.data?.data.map((role) => (
              <div key={role.id} className="p-3 rounded bg-secondary/40 text-sm text-foreground">
                <p className="font-medium capitalize">{role.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(role.permissions ?? []).length > 0 ? role.permissions?.join(', ') : 'No permissions assigned'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Permissions</h3>
          {permissions.isLoading && <p className="text-sm text-muted-foreground">Loading permissions…</p>}
          {permissions.isError && <p className="text-sm text-destructive">Could not load permissions.</p>}
          <div className="space-y-2">
            {permissions.data?.data.map((permission) => (
              <div key={permission.id} className="p-3 rounded bg-secondary/40 text-sm text-foreground">
                {permission.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

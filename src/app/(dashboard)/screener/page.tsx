'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function ScreenerPage() {
  const { hasHydrated } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = ['ALL', 'GAP-UP', 'GAP-DOWN', 'TREND'];

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Screener" description="Find stocks matching your scan criteria" />

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-center py-8">No results for {activeTab}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WealthProvider, useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { DashboardSkeleton } from '../ui/Skeleton';
import { Navbar } from './Navbar';
import { DashboardView } from '../dashboard/DashboardView';
import { SimulatorView } from '../simulator/SimulatorView';
import { GoalsView } from '../goals/GoalsView';
import { ScenariosView } from '../scenarios/ScenariosView';
import { CopilotView } from '../copilot/CopilotView';
import { SettingsView } from '../settings/SettingsView';

function WorkspaceContent({ demo }: { demo: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeTab, isLoading, userProfile, financialProfile } = useWealth();

  useEffect(() => {
    if (demo || isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!userProfile?.onboardingCompleted || !financialProfile) {
      router.replace('/onboarding');
    }
  }, [demo, isLoading, user, userProfile, financialProfile, router]);

  const screens: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    simulator: <SimulatorView />,
    goals: <GoalsView />,
    scenarios: <ScenariosView />,
    copilot: <CopilotView />,
    settings: <SettingsView />,
  };

  return (
    <div className="app-shell">
      <Navbar demo={demo} />
      <main className="app-content mx-auto max-w-[1460px] px-4 py-6 pb-28 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        {isLoading ? <DashboardSkeleton /> : <div className="page-enter">{screens[activeTab] || screens.dashboard}</div>}
      </main>
    </div>
  );
}

export function AppWorkspace({ demo = false, initialTab = 'dashboard' }: { demo?: boolean; initialTab?: string }) {
  return (
    <WealthProvider demo={demo} initialTab={initialTab}>
      <WorkspaceContent demo={demo} />
    </WealthProvider>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WealthProvider, useWealth } from '../lib/context/WealthContext';
import { useAuth } from '../lib/context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { DashboardView } from '../components/dashboard/DashboardView';
import { SimulatorView } from '../components/simulator/SimulatorView';
import { GoalsView } from '../components/goals/GoalsView';
import { ScenariosView } from '../components/scenarios/ScenariosView';
import { CopilotView } from '../components/copilot/CopilotView';
import { SettingsView } from '../components/settings/SettingsView';

function MainAppContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeTab, isLoading, userProfile, financialProfile } = useWealth();

  useEffect(() => {
    if (!isLoading && user) {
      if (!userProfile || !userProfile.onboardingCompleted || !financialProfile) {
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, userProfile, financialProfile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading WealthOS Simulator...</span>
        </div>
      </div>
    );
  }

  if (user && (!userProfile || !userProfile.onboardingCompleted || !financialProfile)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Redirecting to Financial Setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'simulator' && <SimulatorView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'scenarios' && <ScenariosView />}
        {activeTab === 'copilot' && <CopilotView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <WealthProvider>
      <MainAppContent />
    </WealthProvider>
  );
}


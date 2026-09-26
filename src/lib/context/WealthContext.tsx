'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  FinancialProfile,
  FinancialAssumptions,
  Goal,
  Scenario,
  ScenarioCalculationResult,
  AIChatMessage,
  DataMode,
} from '../../types';
import { ProfileService } from '../services/profileService';
import { FinancialService } from '../services/financialService';
import { GoalService } from '../services/goalService';
import { ScenarioService } from '../services/scenarioService';
import { CopilotService } from '../services/copilotService';
import { getDataMode } from '../repositories/factory';
import { DEMO_USER_ID } from '../repositories/local/initialData';
import { GoalInput } from '../validation/goals';
import { UserProfileInput } from '../validation/profile';
import { FinancialProfileInput } from '../validation/financial';
import { useAuth } from './AuthContext';

interface WealthContextType {
  dataMode: DataMode;
  userId: string;
  userProfile: UserProfile | null;
  financialProfile: FinancialProfile | null;
  calculationResult: ScenarioCalculationResult | null;
  goals: Goal[];
  scenarios: Scenario[];
  aiMessages: AIChatMessage[];
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reloadAllData: (uid?: string) => Promise<void>;
  completeOnboarding: (
    profileData: UserProfileInput,
    financialData: FinancialProfileInput,
    initialGoal?: GoalInput
  ) => Promise<void>;
  // Actions
  updateUserProfile: (input: UserProfileInput) => Promise<void>;
  updateFinancialProfile: (input: FinancialProfileInput) => Promise<void>;
  updateAssumptions: (newAssumptions: FinancialAssumptions) => Promise<void>;
  addGoal: (input: GoalInput) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  saveCurrentScenario: (name: string) => Promise<void>;
  deleteScenario: (scenarioId: string) => Promise<void>;
  sendCopilotMessage: (message: string) => Promise<void>;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

const profileService = new ProfileService();
const financialService = new FinancialService();
const goalService = new GoalService();
const scenarioService = new ScenarioService();
const copilotService = new CopilotService();

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [dataMode, setDataMode] = useState<DataMode>('local');
  const [userId, setUserId] = useState<string>(DEMO_USER_ID);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile | null>(null);
  const [calculationResult, setCalculationResult] = useState<ScenarioCalculationResult | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const loadAllData = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      const profile = await profileService.getUserProfile(uid);
      const finProfile = await financialService.getFinancialProfile(uid);
      const userGoals = await goalService.getUserGoals(uid);
      const userScenarios = await scenarioService.getUserScenarios(uid);
      const activeConv = await copilotService.getOrCreateConversation(uid);
      const messages = await copilotService.getMessages(activeConv.id);

      setUserProfile(profile);
      setFinancialProfile(finProfile);
      setGoals(userGoals);
      setScenarios(userScenarios);
      setAiMessages(messages);

      if (finProfile) {
        const result = financialService.calculateProjection(finProfile, profile?.age || 26);
        setCalculationResult(result);
      }
    } catch (err) {
      console.error('Failed to load data for user:', uid, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const mode = getDataMode();
    setDataMode(mode);

    if (authLoading) {
      // Auth state is still resolving — don't attempt any DB calls yet.
      return;
    }

    if (mode === 'supabase') {
      // In Supabase mode, a real UUID is required.
      // If there is no authenticated user, do not load (redirect will handle it).
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);
      loadAllData(user.id);
    } else {
      // Local / demo mode — DEMO_USER_ID is a valid local key.
      setUserId(DEMO_USER_ID);
      loadAllData(DEMO_USER_ID);
    }
  }, [user, authLoading, loadAllData]);

  const reloadAllData = async (uid?: string) => {
    const targetUid = uid || userId;
    await loadAllData(targetUid);
  };

  const completeOnboarding = async (
    profileData: UserProfileInput,
    financialData: FinancialProfileInput,
    initialGoal?: GoalInput
  ) => {
    const targetUid = userId;
    const profile = await profileService.updateProfile(targetUid, {
      ...profileData,
      onboardingCompleted: true,
    });
    const finProfile = await financialService.updateFinancialProfile(targetUid, financialData);
    if (initialGoal && initialGoal.name.trim()) {
      await goalService.saveGoal(targetUid, initialGoal);
    }

    setUserProfile(profile);
    setFinancialProfile(finProfile);
    const userGoals = await goalService.getUserGoals(targetUid);
    setGoals(userGoals);

    const result = financialService.calculateProjection(finProfile, profile.age);
    setCalculationResult(result);
  };

  const updateUserProfile = async (input: UserProfileInput) => {
    const updated = await profileService.updateProfile(userId, input);
    setUserProfile(updated);
    if (financialProfile) {
      const result = financialService.calculateProjection(financialProfile, updated.age);
      setCalculationResult(result);
    }
  };

  const updateFinancialProfile = async (input: FinancialProfileInput) => {
    const updated = await financialService.updateFinancialProfile(userId, input);
    setFinancialProfile(updated);
    const result = financialService.calculateProjection(updated, userProfile?.age || 26);
    setCalculationResult(result);
  };

  const updateAssumptions = async (newAssumptions: FinancialAssumptions) => {
    if (!financialProfile) return;
    const updatedInput: FinancialProfileInput = {
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: newAssumptions,
    };
    await updateFinancialProfile(updatedInput);
  };

  const addGoal = async (input: GoalInput) => {
    await goalService.saveGoal(userId, input);
    const updatedGoals = await goalService.getUserGoals(userId);
    setGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    await goalService.deleteGoal(userId, goalId);
    const updatedGoals = await goalService.getUserGoals(userId);
    setGoals(updatedGoals);
  };

  const saveCurrentScenario = async (name: string) => {
    if (!financialProfile) return;
    await scenarioService.saveScenario(
      userId,
      name,
      financialProfile,
      financialProfile.assumptions,
      userProfile?.age || 26
    );
    const updatedScenarios = await scenarioService.getUserScenarios(userId);
    setScenarios(updatedScenarios);
  };

  const deleteScenario = async (scenarioId: string) => {
    await scenarioService.deleteScenario(userId, scenarioId);
    const updatedScenarios = await scenarioService.getUserScenarios(userId);
    setScenarios(updatedScenarios);
  };

  const sendCopilotMessage = async (content: string) => {
    if (!userProfile || !financialProfile || !calculationResult) return;
    const activeConv = await copilotService.getOrCreateConversation(userId);
    await copilotService.processUserMessage(
      userId,
      activeConv.id,
      content,
      userProfile,
      financialProfile,
      calculationResult
    );
    const updatedMsgs = await copilotService.getMessages(activeConv.id);
    setAiMessages(updatedMsgs);
  };

  return (
    <WealthContext.Provider
      value={{
        dataMode,
        userId,
        userProfile,
        financialProfile,
        calculationResult,
        goals,
        scenarios,
        aiMessages,
        isLoading: isLoading || authLoading,
        activeTab,
        setActiveTab,
        reloadAllData,
        completeOnboarding,
        updateUserProfile,
        updateFinancialProfile,
        updateAssumptions,
        addGoal,
        deleteGoal,
        saveCurrentScenario,
        deleteScenario,
        sendCopilotMessage,
      }}
    >
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = () => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};

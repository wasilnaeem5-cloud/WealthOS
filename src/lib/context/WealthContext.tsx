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
import { DEMO_USER_ID, initialDemoFinancialProfile, initialDemoGoals, initialDemoMessages, initialDemoProfile, initialDemoScenarios } from '../repositories/local/initialData';
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
  calculateProjection: (profile: FinancialProfile) => ScenarioCalculationResult;
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
  saveScenarioWithAssumptions: (name: string, assumptions: FinancialAssumptions | null) => Promise<void>;
  deleteScenario: (scenarioId: string) => Promise<void>;
  sendCopilotMessage: (message: string) => Promise<void>;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

const profileService = new ProfileService();
const financialService = new FinancialService();
const goalService = new GoalService();
const scenarioService = new ScenarioService();
const copilotService = new CopilotService();

export const WealthProvider: React.FC<{ children: React.ReactNode; demo?: boolean; initialTab?: string }> = ({ children, demo = false, initialTab = 'dashboard' }) => {
  const { user, loading: authLoading } = useAuth();
  const [dataMode] = useState<DataMode>(() => demo ? 'local' : getDataMode());
  const [userId, setUserId] = useState<string>(DEMO_USER_ID);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => demo ? { ...initialDemoProfile } : null);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile | null>(() => demo ? { ...initialDemoFinancialProfile, assumptions: { ...initialDemoFinancialProfile.assumptions } } : null);
  const [calculationResult, setCalculationResult] = useState<ScenarioCalculationResult | null>(() => demo ? financialService.calculateProjection({ ...initialDemoFinancialProfile, assumptions: { ...initialDemoFinancialProfile.assumptions } }, initialDemoProfile.age) : null);
  const [goals, setGoals] = useState<Goal[]>(() => demo ? initialDemoGoals.map((goal) => ({ ...goal })) : []);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => demo ? initialDemoScenarios.map((scenario) => ({ ...scenario })) : []);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>(() => demo ? initialDemoMessages.map((message) => ({ ...message })) : []);
  const [isLoading, setIsLoading] = useState<boolean>(() => demo ? false : true);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const calculateDemo = useCallback((profile: FinancialProfile, age = initialDemoProfile.age) => (
    financialService.calculateProjection(profile, age)
  ), []);

  const loadAllData = useCallback(async (uid: string) => {
    await Promise.resolve();
    setUserId(uid);
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
    if (demo) {
      return;
    }
    const mode = dataMode;

    if (authLoading) {
      // Auth state is still resolving — don't attempt any DB calls yet.
      return;
    }

    if (mode === 'supabase') {
      // In Supabase mode, a real UUID is required.
      // If there is no authenticated user, do not load (redirect will handle it).
      if (user?.id) {
        const timer = setTimeout(() => { void loadAllData(user.id); }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      // Local / demo mode — DEMO_USER_ID is a valid local key.
      const timer = setTimeout(() => { void loadAllData(DEMO_USER_ID); }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, loadAllData, demo, calculateDemo, dataMode]);

  const reloadAllData = async (uid?: string) => {
    if (demo) {
      const financial = { ...initialDemoFinancialProfile, assumptions: { ...initialDemoFinancialProfile.assumptions } };
      setUserProfile({ ...initialDemoProfile });
      setFinancialProfile(financial);
      setGoals(initialDemoGoals.map((goal) => ({ ...goal })));
      setScenarios(initialDemoScenarios.map((scenario) => ({ ...scenario })));
      setAiMessages(initialDemoMessages.map((message) => ({ ...message })));
      setCalculationResult(calculateDemo(financial));
      return;
    }
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
    if (demo) {
      if (!userProfile) return;
      const updated = { ...userProfile, ...input, updatedAt: new Date().toISOString() };
      setUserProfile(updated);
      if (financialProfile) setCalculationResult(calculateDemo(financialProfile, updated.age));
      return;
    }
    const updated = await profileService.updateProfile(userId, input);
    setUserProfile(updated);
    if (financialProfile) {
      const result = financialService.calculateProjection(financialProfile, updated.age);
      setCalculationResult(result);
    }
  };

  const updateFinancialProfile = async (input: FinancialProfileInput) => {
    if (demo) {
      if (!financialProfile) return;
      const updated = { ...financialProfile, ...input, assumptions: { ...input.assumptions }, updatedAt: new Date().toISOString() };
      setFinancialProfile(updated);
      setCalculationResult(calculateDemo(updated, userProfile?.age || initialDemoProfile.age));
      return;
    }
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
    if (demo) {
      setGoals((current) => [...current, {
        ...input, id: `demo-goal-${Date.now()}`, userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }]);
      return;
    }
    await goalService.saveGoal(userId, input);
    const updatedGoals = await goalService.getUserGoals(userId);
    setGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    if (demo) {
      setGoals((current) => current.filter((goal) => goal.id !== goalId));
      return;
    }
    await goalService.deleteGoal(userId, goalId);
    const updatedGoals = await goalService.getUserGoals(userId);
    setGoals(updatedGoals);
  };

  const saveCurrentScenario = async (name: string) => {
    if (!financialProfile) return;
    if (demo) {
      if (!calculationResult) return;
      setScenarios((current) => [...current, {
        id: `demo-scenario-${Date.now()}`, userId: DEMO_USER_ID, name,
        variablesJson: { financialProfileSnapshot: financialProfile, assumptionsSnapshot: financialProfile.assumptions },
        resultsJson: calculationResult, createdAt: new Date().toISOString(),
      }]);
      return;
    }
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

  const saveScenarioWithAssumptions = async (name: string, assumptions: FinancialAssumptions | null) => {
    if (!financialProfile || !assumptions) return;
    if (demo) {
      const customProfile: FinancialProfile = { ...financialProfile, assumptions };
      const result = financialService.calculateProjection(customProfile, userProfile?.age || initialDemoProfile.age);
      setScenarios((current) => [...current, {
        id: `demo-scenario-${Date.now()}`, userId: DEMO_USER_ID, name,
        variablesJson: { financialProfileSnapshot: financialProfile, assumptionsSnapshot: assumptions },
        resultsJson: result, createdAt: new Date().toISOString(),
      }]);
      return;
    }

    await scenarioService.saveScenario(
      userId,
      name,
      financialProfile,
      assumptions,
      userProfile?.age || 26
    );
    const updatedScenarios = await scenarioService.getUserScenarios(userId);
    setScenarios(updatedScenarios);
  };

  const deleteScenario = async (scenarioId: string) => {
    if (demo) {
      setScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
      return;
    }
    await scenarioService.deleteScenario(userId, scenarioId);
    const updatedScenarios = await scenarioService.getUserScenarios(userId);
    setScenarios(updatedScenarios);
  };

  const sendCopilotMessage = async (content: string) => {
    if (!userProfile || !financialProfile || !calculationResult) return;
    if (demo) {
      const now = new Date().toISOString();
      const returnRate = (financialProfile.assumptions.expectedAnnualReturn * 100).toFixed(1);
      const reply = `The engine projects ${financialProfile.assumptions.currency} ${Math.round(calculationResult.projectedNominalFutureValue).toLocaleString()} over ${financialProfile.assumptions.projectionYears} years. Your ${financialProfile.assumptions.currency} ${financialProfile.monthlyContribution.toLocaleString()} monthly contribution, ${returnRate}% assumed annual return, and inflation assumption are the main inputs. This is an educational explanation of the deterministic calculation, not a prediction or financial advice.`;
      setAiMessages((current) => [...current,
        { id: `demo-user-${Date.now()}`, conversationId: 'demo-conversation', role: 'user', content, createdAt: now },
        { id: `demo-assistant-${Date.now()}`, conversationId: 'demo-conversation', role: 'assistant', content: reply, createdAt: now },
      ]);
      return;
    }
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
        isLoading: demo ? isLoading : isLoading || authLoading,
        calculateProjection: (profile) => financialService.calculateProjection(profile, userProfile?.age || initialDemoProfile.age),
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
        saveScenarioWithAssumptions,
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

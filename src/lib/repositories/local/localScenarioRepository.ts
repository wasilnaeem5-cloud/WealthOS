import { Scenario } from '../../../types';
import { IScenarioRepository } from '../types';
import { initialDemoScenarios } from './initialData';

const STORAGE_KEY = 'wealthos_scenarios';

export class LocalScenarioRepository implements IScenarioRepository {
  async getScenarios(userId: string): Promise<Scenario[]> {
    if (typeof window === 'undefined') return initialDemoScenarios;
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (!item) {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(initialDemoScenarios));
        return initialDemoScenarios;
      }
      return JSON.parse(item);
    } catch {
      return initialDemoScenarios;
    }
  }

  async getScenarioById(userId: string, scenarioId: string): Promise<Scenario | null> {
    const scenarios = await this.getScenarios(userId);
    return scenarios.find(s => s.id === scenarioId) || null;
  }

  async saveScenario(scenario: Scenario): Promise<Scenario> {
    const scenarios = await this.getScenarios(scenario.userId);
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);

    let updatedScenario: Scenario;
    if (existingIndex >= 0) {
      updatedScenario = { ...scenario };
      scenarios[existingIndex] = updatedScenario;
    } else {
      updatedScenario = {
        ...scenario,
        id: scenario.id || `scenario-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      scenarios.push(updatedScenario);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${scenario.userId}`, JSON.stringify(scenarios));
    }
    return updatedScenario;
  }

  async deleteScenario(userId: string, scenarioId: string): Promise<boolean> {
    const scenarios = await this.getScenarios(userId);
    const filtered = scenarios.filter(s => s.id !== scenarioId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
    }
    return true;
  }
}

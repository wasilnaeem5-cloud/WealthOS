import { FinancialProfile, FinancialAssumptions, Scenario, ScenarioCalculationResult } from '../../types';
import { RepositoryFactory } from '../repositories/factory';
import { calculateFutureValue } from '../financial/futureValue';
import { calculateScenarioDifference, ScenarioDifferenceResult } from '../financial/scenarios';
import { FinancialService } from './financialService';
import { generateId } from '../utils/id';

export class ScenarioService {
  private repo = RepositoryFactory.getScenarioRepository();
  private financialService = new FinancialService();

  async getUserScenarios(userId: string): Promise<Scenario[]> {
    return this.repo.getScenarios(userId);
  }

  async saveScenario(
    userId: string,
    name: string,
    profileSnapshot: FinancialProfile,
    assumptionsSnapshot: FinancialAssumptions,
    userAge: number = 26
  ): Promise<Scenario> {
    const customProfile: FinancialProfile = {
      ...profileSnapshot,
      assumptions: assumptionsSnapshot,
    };

    const calculationResult = this.financialService.calculateProjection(customProfile, userAge);

    const scenario: Scenario = {
      id: generateId(),
      userId,
      name,
      variablesJson: {
        financialProfileSnapshot: profileSnapshot,
        assumptionsSnapshot,
      },
      resultsJson: calculationResult,
      createdAt: new Date().toISOString(),
    };

    return this.repo.saveScenario(scenario);
  }

  async deleteScenario(userId: string, scenarioId: string): Promise<boolean> {
    return this.repo.deleteScenario(userId, scenarioId);
  }

  compareScenarios(
    baselineProfile: FinancialProfile,
    baselineAssumptions: FinancialAssumptions,
    alternateAssumptions: FinancialAssumptions,
    userAge: number = 26
  ): {
    baselineResult: ScenarioCalculationResult;
    alternateResult: ScenarioCalculationResult;
    difference: ScenarioDifferenceResult;
  } {
    const baselineProfileConfig: FinancialProfile = {
      ...baselineProfile,
      assumptions: baselineAssumptions,
    };
    const alternateProfileConfig: FinancialProfile = {
      ...baselineProfile,
      assumptions: alternateAssumptions,
    };

    const baselineResult = this.financialService.calculateProjection(baselineProfileConfig, userAge);
    const alternateResult = this.financialService.calculateProjection(alternateProfileConfig, userAge);

    const baseFv = calculateFutureValue({
      initialAmount: baselineProfile.savings + baselineProfile.investments,
      monthlyContribution: baselineProfile.monthlyContribution,
      expectedAnnualReturn: baselineAssumptions.expectedAnnualReturn,
      annualContributionIncrease: baselineAssumptions.annualContributionIncrease,
      projectionYears: baselineAssumptions.projectionYears,
      inflationRate: baselineAssumptions.inflationRate,
      contributionTiming: baselineAssumptions.contributionTiming,
      userCurrentAge: userAge,
    });

    const altFv = calculateFutureValue({
      initialAmount: baselineProfile.savings + baselineProfile.investments,
      monthlyContribution: baselineProfile.monthlyContribution,
      expectedAnnualReturn: alternateAssumptions.expectedAnnualReturn,
      annualContributionIncrease: alternateAssumptions.annualContributionIncrease,
      projectionYears: alternateAssumptions.projectionYears,
      inflationRate: alternateAssumptions.inflationRate,
      contributionTiming: alternateAssumptions.contributionTiming,
      userCurrentAge: userAge,
    });

    const diff = calculateScenarioDifference(baseFv, altFv);

    return {
      baselineResult,
      alternateResult,
      difference: diff,
    };
  }
}

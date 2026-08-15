import { describe, expect, it } from 'vitest';
import { getCompletedOnboardingSteps } from '@/lib/onboardingProgress';

describe('getCompletedOnboardingSteps', () => {
  it('deriva o progresso sem depender da identidade dos arrays carregados', () => {
    const progress = {
      hasCompany: true,
      servicesCount: 2,
      professionalsCount: 1,
      businessHoursCount: 7,
      shiftsCount: 0,
    };

    expect(getCompletedOnboardingSteps(progress)).toEqual([1, 2, 3, 4]);
    expect(getCompletedOnboardingSteps({ ...progress })).toEqual([1, 2, 3, 4]);
  });

  it('mantém a etapa opcional de turnos separada das etapas obrigatórias', () => {
    expect(getCompletedOnboardingSteps({
      hasCompany: false,
      servicesCount: 0,
      professionalsCount: 0,
      businessHoursCount: 0,
      shiftsCount: 1,
    })).toEqual([5]);
  });
});

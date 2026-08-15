interface OnboardingProgressData {
  hasCompany: boolean;
  servicesCount: number;
  professionalsCount: number;
  businessHoursCount: number;
  shiftsCount: number;
}

export const getCompletedOnboardingSteps = ({
  hasCompany,
  servicesCount,
  professionalsCount,
  businessHoursCount,
  shiftsCount,
}: OnboardingProgressData): number[] => {
  const completed: number[] = [];
  if (hasCompany) completed.push(1);
  if (servicesCount > 0) completed.push(2);
  if (professionalsCount > 0) completed.push(3);
  if (businessHoursCount > 0) completed.push(4);
  if (shiftsCount > 0) completed.push(5);
  return completed;
};

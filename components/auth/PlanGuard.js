'use client';

import { useAtomValue } from 'jotai';
import { userPlanAtom, userCreditsAtom } from '@/atoms/atoms';

interface PlanGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'free' | 'paid';
  requiredCredits?: number;
  fallback?: React.ReactNode;
}

export function PlanGuard({ 
  children, 
  requiredPlan, 
  requiredCredits,
  fallback 
}: PlanGuardProps) {
  const userPlan = useAtomValue(userPlanAtom);
  const userCredits = useAtomValue(userCreditsAtom);

  const hasRequiredPlan = !requiredPlan || userPlan === requiredPlan;
  const hasRequiredCredits = !requiredCredits || userCredits >= requiredCredits;

  if (!hasRequiredPlan || !hasRequiredCredits) {
    return fallback || <div>Upgrade required</div>;
  }

  return <>{children}</>;
}
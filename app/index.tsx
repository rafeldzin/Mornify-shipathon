import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { decideLanding, runHousekeeping } from '../lib/housekeeping';

/**
 * The entry gate. Onboarding, a night still in progress, a missed tap or a
 * broken streak all take precedence over the home screen — see the route map
 * in docs/DESIGN.md.
 */
export default function Index() {
  const target = useMemo(() => {
    runHousekeeping();
    return decideLanding();
  }, []);

  return <Redirect href={target} />;
}

import { getProgressData } from '@/lib/app-data';

import { ProgressClient } from './progress-client';

export default async function ProgressPage() {
  const data = await getProgressData();
  return <ProgressClient data={data} />;
}

import { OnboardingForm } from './onboarding-form';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err = sp.error;

  return <OnboardingForm initialError={err ? decodeURIComponent(err) : undefined} />;
}

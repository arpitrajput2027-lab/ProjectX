import { supabase } from '@/lib/supabase';

export async function getStudentPostAuthRedirectPath(userId: string, client: typeof supabase = supabase) {
  const { data, error } = await client
    .from('student_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Profile lookup failed:', error);
  }

  if (data?.onboarding_completed) {
    return '/profile';
  }

  return '/onboarding';
}

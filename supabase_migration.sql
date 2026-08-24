-- Add katalyst_score columns to student_profiles table
ALTER TABLE public.student_profiles
ADD COLUMN katalyst_score integer NULL,
ADD COLUMN katalyst_score_breakdown jsonb NULL;
